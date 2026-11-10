import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import {
  INITIAL_MEDICINES,
  INITIAL_BATCHES,
  INITIAL_PATIENTS,
  INITIAL_SUPPLIERS,
  INITIAL_REQUISITIONS,
  INITIAL_SALES
} from '../lib/demoData'
import { ROLES, INITIAL_USERS, STORES, STORE_OPTIONS } from '../lib/authData'
import {
  generateUUID,
  checkBackendHealth,
  apiGetMedicines,
  apiCreateMedicine,
  apiUpdateMedicine,
  apiDeleteMedicine,
  apiGetBatches,
  apiCreateBatch,
  apiUpdateBatch,
  apiGetPatients,
  apiCreatePatient,
  apiGetSuppliers,
  apiCreateSupplier,
  apiGetRequisitions,
  apiCreateRequisition,
  apiUpdateRequisitionStatus,
  apiGetSales,
  apiCreateSale,
  apiGetDiscountPolicy,
  apiUpdateDiscountPolicy,
  apiGetUsers,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  apiSeedAllData
} from '../lib/api'

// Helper: Ensure every entity has a valid store assignment (defaults to 'UHTC')
const ensureStoreTag = (arr, defaultStore = 'UHTC') => {
  if (!Array.isArray(arr)) return []
  return arr.map(item => ({
    ...item,
    store: item.store || defaultStore
  }))
}

// One-time cleanup migration: purge legacy dummy demo records and old discounts so testing begins 100% fresh
const REAL_TESTING_CLEANUP_KEY = 'rvs_clean_fresh_v6'
if (typeof window !== 'undefined' && localStorage.getItem(REAL_TESTING_CLEANUP_KEY) !== 'done') {
  localStorage.removeItem('rvs_medicines')
  localStorage.removeItem('rvs_batches')
  localStorage.removeItem('rvs_patients')
  localStorage.removeItem('rvs_suppliers')
  localStorage.removeItem('rvs_requisitions')
  localStorage.removeItem('rvs_sales')
  localStorage.removeItem('rvs_preapproved_discount')
  localStorage.removeItem('rvs_discount_percent')
  localStorage.removeItem('rvs_users')
  localStorage.removeItem('rvs_current_user')
  localStorage.setItem(REAL_TESTING_CLEANUP_KEY, 'done')
}

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard')

  // Theme State
  const [darkMode, setDarkMode] = useState(false)

  // Active Store Selection State ('UHTC' or 'RHTC', default is 'UHTC')
  const [currentStore, setCurrentStoreState] = useState(() => {
    const saved = localStorage.getItem('rvs_active_store')
    if (saved === 'RHTC' || saved === 'UHTC') return saved
    return 'UHTC'
  })

  // User Authentication & Roles State - Super Admin only by default
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('rvs_users')
    const purgedUsernames = new Set(['dr-yatish', 'doctor_mo', 'supervisor', 'pharmacist', 'dinesh'])
    const userMap = new Map()
    INITIAL_USERS.forEach(u => userMap.set(u.username.toLowerCase(), { ...u, store: u.store || 'ALL' }))
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          parsed.forEach(u => {
            if (u && u.username && !purgedUsernames.has(u.username.toLowerCase())) {
              userMap.set(u.username.toLowerCase(), {
                ...u,
                store: u.username.toLowerCase() === 'admin' ? 'ALL' : (u.store || 'UHTC')
              })
            }
          })
        }
      } catch (e) {}
    }
    const cleanList = Array.from(userMap.values())
    localStorage.setItem('rvs_users', JSON.stringify(cleanList))
    return cleanList
  })

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('rvs_current_user')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.id && parsed.username) {
          return {
            ...parsed,
            store: parsed.username.toLowerCase() === 'admin' ? 'ALL' : (parsed.store || 'UHTC')
          }
        }
      } catch (e) {
        // fallback
      }
    }
    return null // Default to null so user sees clean Super Admin LoginPage first
  })

  // Track if current session is Super Admin impersonating/testing another role
  const [isImpersonating, setIsImpersonating] = useState(() => {
    return sessionStorage.getItem('rvs_admin_impersonating') === 'true'
  })

  const isSuperAdmin = currentUser?.role === 'admin_supervisor' || currentUser?.username === 'admin'

  // Effective Store:
  // - Staff accounts (pharmacist, doctor, supervisor) are strictly LOCKED to their assigned store.
  // - Super Admin can switch between 'UHTC' and 'RHTC' at will.
  const effectiveStore = (!isSuperAdmin && currentUser?.store && currentUser.store !== 'ALL')
    ? currentUser.store
    : currentStore

  // Sync currentStore with assigned user store when regular staff logs in
  useEffect(() => {
    if (currentUser && !isSuperAdmin && currentUser.store && currentUser.store !== 'ALL') {
      if (currentStore !== currentUser.store) {
        setCurrentStoreState(currentUser.store)
        localStorage.setItem('rvs_active_store', currentUser.store)
      }
    }
  }, [currentUser, isSuperAdmin, currentStore])

  // Super Admin store switcher
  const switchStore = (storeId) => {
    if (!isSuperAdmin) {
      notify('Access Restricted', 'Only Super Administrator can switch between medical stores.', 'warning')
      return false
    }
    if (storeId !== 'UHTC' && storeId !== 'RHTC') return false
    setCurrentStoreState(storeId)
    localStorage.setItem('rvs_active_store', storeId)
    setCart([]) // Clear cart when switching store so items from different stores don't collide
    const storeInfo = STORES[storeId]
    notify(`Active Dispensary: ${storeId}`, `Switched to ${storeInfo?.fullName || storeId}. Inventory and sales scoped to this store.`, 'success')
    return true
  }

  // Pre-approved Clinical Pack Discount (Default: 0% / None - only set when explicitly authorized by MO/Admin)
  const [preApprovedDiscount, setPreApprovedDiscount] = useState(() => {
    const saved = localStorage.getItem('rvs_preapproved_discount')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed.percent === 'number') {
          return parsed
        }
      } catch (e) {}
    }
    return {
      percent: 0,
      appliedBy: 'None',
      reason: 'Standard Bill Rate (No Discount Set)'
    }
  })

  // Auth, User Management & Database Explorer Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false)
  const [isDbExplorerOpen, setIsDbExplorerOpen] = useState(false)

  // Medical Data States with LocalStorage Persistence (ALL records across both stores)
  const [allMedicines, setAllMedicines] = useState(() => {
    const saved = localStorage.getItem('rvs_medicines')
    return saved ? ensureStoreTag(JSON.parse(saved)) : ensureStoreTag(INITIAL_MEDICINES)
  })

  const [allBatches, setAllBatches] = useState(() => {
    const saved = localStorage.getItem('rvs_batches')
    return saved ? ensureStoreTag(JSON.parse(saved)) : ensureStoreTag(INITIAL_BATCHES)
  })

  const [allPatients, setAllPatients] = useState(() => {
    const saved = localStorage.getItem('rvs_patients')
    return saved ? ensureStoreTag(JSON.parse(saved)) : ensureStoreTag(INITIAL_PATIENTS)
  })

  const [allSuppliers, setAllSuppliers] = useState(() => {
    const saved = localStorage.getItem('rvs_suppliers')
    return saved ? ensureStoreTag(JSON.parse(saved)) : ensureStoreTag(INITIAL_SUPPLIERS)
  })

  const [allRequisitions, setAllRequisitions] = useState(() => {
    const saved = localStorage.getItem('rvs_requisitions')
    return saved ? ensureStoreTag(JSON.parse(saved)) : ensureStoreTag(INITIAL_REQUISITIONS)
  })

  const [allSales, setAllSales] = useState(() => {
    const saved = localStorage.getItem('rvs_sales')
    return saved ? ensureStoreTag(JSON.parse(saved)) : ensureStoreTag(INITIAL_SALES)
  })

  // Filtered views based on effectiveStore (UHTC or RHTC)
  const medicines = useMemo(() => {
    return allMedicines.filter(m => (m.store || 'UHTC') === effectiveStore)
  }, [allMedicines, effectiveStore])

  const batches = useMemo(() => {
    return allBatches.filter(b => (b.store || 'UHTC') === effectiveStore)
  }, [allBatches, effectiveStore])

  const sales = useMemo(() => {
    return allSales.filter(s => (s.store || 'UHTC') === effectiveStore)
  }, [allSales, effectiveStore])

  const patients = useMemo(() => {
    return allPatients.filter(p => (p.store || 'UHTC') === effectiveStore)
  }, [allPatients, effectiveStore])

  const requisitions = useMemo(() => {
    return allRequisitions.filter(r => (r.store || 'UHTC') === effectiveStore)
  }, [allRequisitions, effectiveStore])

  const suppliers = useMemo(() => {
    return allSuppliers.filter(s => !s.store || s.store === effectiveStore || s.store === 'ALL')
  }, [allSuppliers, effectiveStore])

  // POS Cart State
  const [cart, setCart] = useState([])
  const [cartCustomer, setCartCustomer] = useState({
    name: 'Walk-in Patient',
    phone: '',
    doctor: 'Dr. On-Duty Medical Officer',
    uhid: ''
  })
  const [discountPercent, setDiscountPercent] = useState(() => {
    return preApprovedDiscount?.percent || 0
  })
  const [activeInvoice, setActiveInvoice] = useState(null)

  // GST Activation Toggle (Active vs Stop GST / 0% Tax Exempt)
  const [isGstActive, setIsGstActive] = useState(() => {
    const saved = localStorage.getItem('rvs_is_gst_active')
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem('rvs_is_gst_active', JSON.stringify(isGstActive))
  }, [isGstActive])

  // PythonAnywhere Flask API & MySQL Connection Status
  const [backendConnected, setBackendConnected] = useState(false)
  const [backendSyncing, setBackendSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  // Toast Notifications
  const [notifications, setNotifications] = useState([])

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const notify = (title, message, type = 'success') => {
    const id = Date.now() + Math.random()
    // Keep max 2 active notifications to keep screen clean
    setNotifications(prev => [...prev.slice(-1), { id, title, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 2800)
  }

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('rvs_medicines', JSON.stringify(allMedicines))
  }, [allMedicines])

  useEffect(() => {
    localStorage.setItem('rvs_batches', JSON.stringify(allBatches))
  }, [allBatches])

  useEffect(() => {
    localStorage.setItem('rvs_patients', JSON.stringify(allPatients))
  }, [allPatients])

  useEffect(() => {
    localStorage.setItem('rvs_suppliers', JSON.stringify(allSuppliers))
  }, [allSuppliers])

  useEffect(() => {
    localStorage.setItem('rvs_requisitions', JSON.stringify(allRequisitions))
  }, [allRequisitions])

  useEffect(() => {
    localStorage.setItem('rvs_sales', JSON.stringify(allSales))
  }, [allSales])

  // Persist Auth & Roles to local storage
  useEffect(() => {
    localStorage.setItem('rvs_users', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem('rvs_current_user', JSON.stringify(currentUser))
  }, [currentUser])

  useEffect(() => {
    localStorage.setItem('rvs_preapproved_discount', JSON.stringify(preApprovedDiscount))
  }, [preApprovedDiscount])

  // When current user changes, ensure active tab is allowed for their role
  useEffect(() => {
    if (currentUser) {
      const roleInfo = ROLES[currentUser.role] || ROLES.pharmacist
      const allowed = roleInfo.allowedTabs || ['pos']
      if (!allowed.includes(activeTab)) {
        setActiveTab(roleInfo.defaultTab || allowed[0] || 'pos')
      }
    }
  }, [currentUser])

  // When current user is Pharmacist, auto-sync discount to pre-approved percentage
  useEffect(() => {
    if (currentUser?.role === 'pharmacist' && preApprovedDiscount?.percent !== undefined) {
      setDiscountPercent(preApprovedDiscount.percent)
    }
  }, [currentUser, preApprovedDiscount])

  // Auth Operations
  const login = (userOrUsername, maybePassword) => {
    let user = null
    if (typeof userOrUsername === 'object' && userOrUsername !== null) {
      user = userOrUsername
    } else if (typeof userOrUsername === 'string') {
      const uClean = userOrUsername.trim().toLowerCase()
      user = users.find(
        u => u.username.toLowerCase() === uClean && (!maybePassword || u.password === maybePassword)
      )
    }

    if (!user) {
      notify('Authentication Failed', 'Invalid username or password.', 'error')
      return false
    }

    sessionStorage.removeItem('rvs_admin_impersonating')
    setIsImpersonating(false)

    const isSuper = user.role === 'admin_supervisor' || user.username === 'admin'
    if (!isSuper) {
      const assignedStore = user.store || 'UHTC'
      setCurrentStoreState(assignedStore)
      localStorage.setItem('rvs_active_store', assignedStore)
    }

    localStorage.setItem('rvs_current_user', JSON.stringify(user))
    setCurrentUser(user)
    const roleInfo = ROLES[user.role] || ROLES.pharmacist
    if (roleInfo.defaultTab) {
      setActiveTab(roleInfo.defaultTab)
    }
    const storeLabel = isSuper ? 'Multi-Store Super Admin' : `${user.store || 'UHTC'} Dispensary`
    notify(`Welcome back, ${user.name}`, `Logged in as ${roleInfo.shortLabel} • ${storeLabel}`, 'success')
    setIsAuthModalOpen(false)
    return true
  }

  const quickSwitchUser = (userIdOrRole) => {
    // Security Guard: Only Super Admin (or active admin impersonator) can switch profiles
    if (!isSuperAdmin && !isImpersonating) {
      notify('Access Restricted', 'Only Super Administrator can switch roles or test accounts.', 'error')
      return false
    }
    const user = users.find(
      u => u.id === userIdOrRole ||
           u.role === userIdOrRole ||
           u.username?.toLowerCase() === String(userIdOrRole).toLowerCase()
    )
    if (user) {
      if (user.role !== 'admin_supervisor' && user.username !== 'admin') {
        sessionStorage.setItem('rvs_admin_impersonating', 'true')
        setIsImpersonating(true)
        const userStore = user.store || 'UHTC'
        setCurrentStoreState(userStore)
        localStorage.setItem('rvs_active_store', userStore)
      } else {
        sessionStorage.removeItem('rvs_admin_impersonating')
        setIsImpersonating(false)
      }
      localStorage.setItem('rvs_current_user', JSON.stringify(user))
      setCurrentUser(user)
      const roleInfo = ROLES[user.role] || ROLES.pharmacist
      if (roleInfo.defaultTab) {
        setActiveTab(roleInfo.defaultTab)
      }
      notify(`Role Switched: ${roleInfo.shortLabel}`, `Active profile: ${user.name} (${user.store || 'UHTC'} Dispensary). Permissions updated.`, 'success')
      setIsAuthModalOpen(false)
      return true
    }
    return false
  }

  const returnToSuperAdmin = () => {
    sessionStorage.removeItem('rvs_admin_impersonating')
    setIsImpersonating(false)
    const adminUser = users.find(u => u.role === 'admin_supervisor' || u.username === 'admin') || INITIAL_USERS[0]
    localStorage.setItem('rvs_current_user', JSON.stringify(adminUser))
    setCurrentUser(adminUser)
    setActiveTab('dashboard')
    notify('Returned to Super Admin', 'Back to Super Administrator session (Dr. Yatish). Full access to UHTC & RHTC.', 'success')
    setIsAuthModalOpen(false)
    return true
  }

  const logout = () => {
    sessionStorage.removeItem('rvs_admin_impersonating')
    setIsImpersonating(false)
    localStorage.removeItem('rvs_current_user')
    setCurrentUser(null)
    setActiveTab('dashboard')
    notify('Logged Out', 'You have been securely signed out of RVS Dispensary.', 'info')
  }

  const addUser = async (userData) => {
    if (!isSuperAdmin) {
      notify('Access Denied', 'Only Super Admin can create user logins.', 'error')
      return false
    }
    const usernameClean = userData.username.trim().toLowerCase()
    if (users.some(u => u.username.toLowerCase() === usernameClean)) {
      notify('Duplicate Username', `Username "${userData.username}" is already taken.`, 'error')
      return false
    }
    const assignedStore = userData.store === 'RHTC' ? 'RHTC' : 'UHTC'
    const newUser = {
      id: `user-${Date.now()}`,
      username: usernameClean,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      designation: userData.designation || ROLES[userData.role]?.label,
      phone: userData.phone || '',
      store: assignedStore
    }
    setUsers(prev => [...prev, newUser])
    try {
      await apiCreateUser(newUser)
    } catch (e) {
      console.warn('Backend user create note:', e)
    }
    notify('User Created', `Account for ${newUser.name} (${ROLES[newUser.role]?.shortLabel}) created and assigned to ${assignedStore} Dispensary.`, 'success')
    return true
  }

  const updateUser = async (userId, updatedFields) => {
    if (!isSuperAdmin && !isImpersonating) {
      notify('Access Denied', 'Only Super Admin can update users.', 'error')
      return false
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedFields } : u))
    try {
      await apiUpdateUser(userId, updatedFields)
    } catch (e) {
      console.warn('Backend user update note:', e)
    }
    notify('User Updated', 'User details & assigned dispensary updated.', 'success')
    return true
  }

  const deleteUser = async (userId) => {
    if (!isSuperAdmin && !isImpersonating) {
      notify('Access Denied', 'Only Super Admin can delete users.', 'error')
      return false
    }
    if (currentUser?.id === userId && !isImpersonating) {
      notify('Action Blocked', 'You cannot delete your own currently active Super Admin account.', 'warning')
      return false
    }
    const target = users.find(u => u.id === userId)
    if (target?.username === 'admin' || target?.id === 'user-admin') {
      notify('Action Blocked', 'The primary Root Administrator account cannot be deleted.', 'warning')
      return false
    }
    if (currentUser?.id === userId && isImpersonating) {
      returnToSuperAdmin()
    }
    setUsers(prev => prev.filter(u => u.id !== userId))
    try {
      await apiDeleteUser(userId)
    } catch (e) {
      console.warn('Backend user delete note:', e)
    }
    notify('User Removed', `Account for ${target?.name || 'User'} has been removed.`, 'info')
    return true
  }

  const updatePreApprovedDiscount = async (percent, reason = 'Authorized Clinical Discount') => {
    if (!isSuperAdmin) {
      notify('Permission Restricted', 'Only Super Admin can authorize overall bill package discounts. Medical Officers can set individual medicine discounts.', 'error')
      return false
    }
    const num = Math.max(0, Math.min(100, Number(percent) || 0))
    const updated = {
      percent: num,
      appliedBy: num > 0 ? `${currentUser.name} (${ROLES[currentUser.role]?.shortLabel})` : 'None',
      reason: num > 0 ? (reason || 'Clinical Pack Discount') : 'Standard Bill Rate (No Discount Set)'
    }
    setPreApprovedDiscount(updated)
    setDiscountPercent(num)
    try {
      await apiUpdateDiscountPolicy({
        discount_percent: num,
        authorized_by: updated.appliedBy,
        reason: updated.reason
      })
    } catch (e) {
      console.warn('Backend discount update note:', e)
    }
    if (num > 0) {
      notify('Discount Authorized', `${num}% discount applied & locked for dispensary pharmacists by ${currentUser.name}.`, 'success')
    } else {
      notify('Discount Reset', 'Clinical discount reset to 0% (Standard Bill Rate).', 'info')
    }
    return true
  }

  // Initial PythonAnywhere Flask API health check & load
  useEffect(() => {
    const initBackend = async () => {
      const res = await checkBackendHealth()
      setBackendConnected(res.connected)
      if (res.connected) {
        setSyncMessage('Connected to Shared Hospital Database')
        await fetchFromBackend()
      } else {
        setSyncMessage('Local Mode')
      }
    }
    initBackend()
  }, [])

  // Fetch all tables from PythonAnywhere Flask API / Local DB
  const fetchFromBackend = async () => {
    try {
      const [cloudMeds, cloudBatches, cloudPatients, cloudSuppliers, cloudSales, cloudReqs, discountData, cloudUsers] = await Promise.allSettled([
        apiGetMedicines(),
        apiGetBatches(),
        apiGetPatients(),
        apiGetSuppliers(),
        apiGetSales(),
        apiGetRequisitions(),
        apiGetDiscountPolicy(),
        apiGetUsers()
      ])

      if (cloudMeds.status === 'fulfilled' && Array.isArray(cloudMeds.value) && cloudMeds.value.length > 0) {
        setAllMedicines(ensureStoreTag(cloudMeds.value))
      }
      if (cloudBatches.status === 'fulfilled' && Array.isArray(cloudBatches.value) && cloudBatches.value.length > 0) {
        setAllBatches(ensureStoreTag(cloudBatches.value))
      }
      if (cloudPatients.status === 'fulfilled' && Array.isArray(cloudPatients.value) && cloudPatients.value.length > 0) {
        setAllPatients(ensureStoreTag(cloudPatients.value))
      }
      if (cloudSuppliers.status === 'fulfilled' && Array.isArray(cloudSuppliers.value) && cloudSuppliers.value.length > 0) {
        setAllSuppliers(ensureStoreTag(cloudSuppliers.value))
      }
      if (cloudSales.status === 'fulfilled' && Array.isArray(cloudSales.value) && cloudSales.value.length > 0) {
        setAllSales(ensureStoreTag(cloudSales.value))
      }
      if (cloudReqs.status === 'fulfilled' && Array.isArray(cloudReqs.value) && cloudReqs.value.length > 0) {
        setAllRequisitions(ensureStoreTag(cloudReqs.value))
      }
      if (discountData.status === 'fulfilled' && discountData.value?.discount_percent !== undefined) {
        const disc = Number(discountData.value.discount_percent) || 0
        setPreApprovedDiscount({
          percent: disc,
          appliedBy: disc > 0 ? (discountData.value.authorized_by || 'Medical Officer (MO)') : 'None',
          reason: disc > 0 ? (discountData.value.reason || 'Clinical Package Discount') : 'Standard Bill Rate (No Discount Set)'
        })
        setDiscountPercent(disc)
      }
      if (cloudUsers.status === 'fulfilled' && Array.isArray(cloudUsers.value) && cloudUsers.value.length > 0) {
        const purgedUsernames = new Set(['dr-yatish', 'doctor_mo', 'supervisor', 'pharmacist', 'dinesh'])
        const userMap = new Map()
        INITIAL_USERS.forEach(u => userMap.set(u.username.toLowerCase(), { ...u, store: u.store || 'ALL' }))
        cloudUsers.value.forEach(u => {
          if (u && u.username && !purgedUsernames.has(u.username.toLowerCase())) {
            userMap.set(u.username.toLowerCase(), {
              ...u,
              store: u.username.toLowerCase() === 'admin' ? 'ALL' : (u.store || 'UHTC')
            })
          }
        })
        setUsers(Array.from(userMap.values()))
      }
      return true
    } catch (e) {
      console.warn('Backend API fetch error:', e)
      return false
    }
  }

  // Push all local formulary data to PythonAnywhere MySQL (1-click Cloud Seed)
  const pushAllLocalDataToBackend = async () => {
    setBackendSyncing(true)
    try {
      const payload = {
        medicines: allMedicines,
        batches: allBatches,
        patients: allPatients,
        suppliers: allSuppliers,
        requisitions: allRequisitions,
        sales: allSales
      }
      await apiSeedAllData(payload)
      setBackendConnected(true)
      notify('Database Populated!', 'All multi-store medicines, batches, sales, and records synced to PythonAnywhere MySQL!', 'success')
    } catch (err) {
      console.error('PythonAnywhere seed error:', err)
      notify('Sync Notice', err.message || 'Make sure PythonAnywhere MySQL is created and running.', 'error')
    } finally {
      setBackendSyncing(false)
    }
  }

  // Sync Data with PythonAnywhere Cloud
  const syncWithBackend = async () => {
    setBackendSyncing(true)
    try {
      const res = await checkBackendHealth()
      if (!res.connected) {
        throw new Error(res.error || 'Cannot connect to PythonAnywhere Flask API.')
      }
      const ok = await fetchFromBackend()
      if (ok) {
        setBackendConnected(true)
        notify('Cloud Synced', 'Live records synced with PythonAnywhere Flask & MySQL.', 'success')
      }
    } catch (err) {
      notify('Connection Notice', err.message, 'warning')
    } finally {
      setBackendSyncing(false)
    }
  }

  // --- CRUD ACTIONS (SYNCS TO PYTHONANYWHERE FLASK API) ---

  // Add Medicine WITH initial Batch and Expiry Date
  const addMedicineWithBatch = async (medData, batchData) => {
    const medId = generateUUID()
    const targetStore = medData.store || effectiveStore || 'UHTC'
    const newMed = {
      id: medId,
      store: targetStore,
      name: medData.name,
      generic_name: medData.generic_name || '',
      category: medData.category || 'General',
      dosage_form: medData.dosage_form || 'Tablet',
      strength: medData.strength || '',
      manufacturer: medData.manufacturer || '',
      shelf_location: medData.shelf_location || 'Rack A-01',
      min_stock_alert: parseInt(medData.min_stock_alert, 10) || 20,
      prescription_required: true,
      hsn_code: medData.hsn_code || '30049099',
      gst_rate: parseFloat(medData.gst_rate) || 12.00,
      default_discount_percent: parseFloat(medData.default_discount_percent) || 0
    }

    const defaultExp = new Date()
    defaultExp.setFullYear(defaultExp.getFullYear() + 2)
    const defaultExpStr = `${defaultExp.getFullYear()}-${String(defaultExp.getMonth() + 1).padStart(2, '0')}-${String(defaultExp.getDate()).padStart(2, '0')}`

    let newBatch = null
    if (batchData) {
      newBatch = {
        id: generateUUID(),
        medicine_id: medId,
        store: targetStore,
        batch_number: (batchData.batch_number || '').trim() || `B-${Math.floor(1000 + Math.random() * 9000)}`,
        expiry_date: batchData.expiry_date || defaultExpStr,
        cost_price: parseFloat(batchData.cost_price) || 0,
        mrp: parseFloat(batchData.mrp) || parseFloat(batchData.selling_price) || 0,
        selling_price: parseFloat(batchData.selling_price) || parseFloat(batchData.mrp) || 0,
        current_stock: parseInt(batchData.current_stock, 10) || 0,
        supplier_name: batchData.supplier_name || 'Standard Distributor'
      }
    }

    // Update Local State Immediately
    setAllMedicines(prev => [newMed, ...prev])
    if (newBatch) {
      setAllBatches(prev => [newBatch, ...prev])
    }

    // Always persist to backend
    try {
      await apiCreateMedicine(newMed)
      if (newBatch) {
        await apiCreateBatch(newBatch)
      }
      notify(
        'Medicine & Stock Saved!',
        `${newMed.name} added to ${targetStore} Dispensary! (Batch: ${newBatch?.batch_number || 'N/A'}, Stock: ${newBatch?.current_stock || 0})`,
        'success'
      )
    } catch (e) {
      notify('Medicine Added', `${newMed.name} recorded in ${targetStore} dispensary.`, 'info')
    }

    return { medicine: newMed, batch: newBatch }
  }

  // Edit Medicine & Pricing / Stock
  const updateMedicine = async (id, medData, batchData) => {
    const cleanMedData = {
      ...medData,
      default_discount_percent: parseFloat(medData.default_discount_percent) || 0
    }
    setAllMedicines(prev => prev.map(m => m.id === id ? { ...m, ...cleanMedData } : m))

    if (batchData) {
      setAllBatches(prev => {
        const batchIdx = prev.findIndex(b => b.medicine_id === id)
        if (batchIdx >= 0) {
          const next = [...prev]
          next[batchIdx] = {
            ...next[batchIdx],
            mrp: batchData.mrp !== undefined && !isNaN(parseFloat(batchData.mrp)) ? parseFloat(batchData.mrp) : next[batchIdx].mrp,
            selling_price: batchData.selling_price !== undefined && !isNaN(parseFloat(batchData.selling_price)) ? parseFloat(batchData.selling_price) : parseFloat(batchData.mrp) || next[batchIdx].selling_price,
            cost_price: batchData.cost_price !== undefined && !isNaN(parseFloat(batchData.cost_price)) ? parseFloat(batchData.cost_price) : next[batchIdx].cost_price,
            current_stock: batchData.current_stock !== undefined && !isNaN(parseInt(batchData.current_stock, 10)) ? parseInt(batchData.current_stock, 10) : next[batchIdx].current_stock,
            batch_number: batchData.batch_number ? batchData.batch_number.trim() : next[batchIdx].batch_number,
            expiry_date: batchData.expiry_date ? batchData.expiry_date.trim() : next[batchIdx].expiry_date
          }
          return next
        } else {
          const newB = {
            id: generateUUID(),
            medicine_id: id,
            store: cleanMedData.store || effectiveStore || 'UHTC',
            batch_number: batchData.batch_number || `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
            expiry_date: batchData.expiry_date || '2028-12-31',
            cost_price: parseFloat(batchData.cost_price) || 0,
            mrp: parseFloat(batchData.mrp) || 0,
            selling_price: parseFloat(batchData.selling_price) || parseFloat(batchData.mrp) || 0,
            current_stock: parseInt(batchData.current_stock, 10) || 0,
            supplier_name: batchData.supplier_name || 'Standard Vendor'
          }
          return [newB, ...prev]
        }
      })
    }

    if (backendConnected) {
      try {
        await apiUpdateMedicine(id, cleanMedData)
      } catch (e) {}
    }
    notify('Formulary & Pricing Saved', `${medData.name || 'Medicine'} updated successfully in ${effectiveStore} Dispensary.`, 'success')
  }

  // Set or Remove Individual Medicine Pre-Approved Discount (MO & Super Admin Authority)
  const setMedicineDiscount = async (medicineId, discountPct) => {
    if (!isSuperAdmin && currentUser?.role !== 'doctor_mo') {
      notify('Permission Restricted', 'Only Medical Officer (MO) or Super Admin can modify medicine discounts.', 'error')
      return false
    }
    const num = Math.max(0, Math.min(100, parseFloat(discountPct) || 0))
    const target = allMedicines.find(m => m.id === medicineId)
    if (!target) return false

    setAllMedicines(prev => prev.map(m => m.id === medicineId ? { ...m, default_discount_percent: num } : m))

    if (backendConnected) {
      try {
        await apiUpdateMedicine(medicineId, { default_discount_percent: num })
      } catch (e) {}
    }

    if (num > 0) {
      notify('Individual Discount Set', `${num}% discount applied to ${target.name}. Active on billing when overall discount is 0%.`, 'success')
    } else {
      notify('Discount Removed', `Discount removed for ${target.name} (0%). Standard rate applies.`, 'info')
    }
    return true
  }

  // Delete Medicine
  const deleteMedicine = async (id) => {
    setAllMedicines(prev => prev.filter(m => m.id !== id))
    setAllBatches(prev => prev.filter(b => b.medicine_id !== id))
    if (backendConnected) {
      try {
        await apiDeleteMedicine(id)
      } catch (e) {}
    }
    notify('Medicine Removed', 'Item deleted from pharmacy stock.', 'warning')
  }

  // Add Batch
  const addBatch = async (batchData) => {
    const targetStore = batchData.store || effectiveStore || 'UHTC'
    const newBatch = {
      ...batchData,
      id: generateUUID(),
      store: targetStore,
      cost_price: parseFloat(batchData.cost_price) || 0,
      mrp: parseFloat(batchData.mrp) || 0,
      selling_price: parseFloat(batchData.selling_price) || parseFloat(batchData.mrp) || 0,
      current_stock: parseInt(batchData.current_stock, 10) || 0
    }
    setAllBatches(prev => [newBatch, ...prev])
    if (backendConnected) {
      try {
        await apiCreateBatch(newBatch)
      } catch (e) {}
    }
    notify('Stock Inward Added', `Batch ${newBatch.batch_number} recorded in ${targetStore} (+${newBatch.current_stock} units).`, 'success')
    return newBatch
  }

  // Update Batch
  const updateBatch = async (batchId, updatedData) => {
    setAllBatches(prev => prev.map(b => b.id === batchId ? { ...b, ...updatedData } : b))
    if (backendConnected) {
      try {
        await apiUpdateBatch(batchId, updatedData)
      } catch (e) {}
    }
    notify('Batch Updated', 'Batch stock/expiry updated successfully.', 'success')
  }

  // Add Patient
  const addPatient = async (patData) => {
    const targetStore = patData.store || effectiveStore || 'UHTC'
    const newPat = {
      id: generateUUID(),
      store: targetStore,
      uhid: patData.uhid || `RVS-PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: patData.name,
      phone: patData.phone || '',
      age: parseInt(patData.age, 10) || 30,
      gender: patData.gender || 'Male',
      blood_group: patData.blood_group || 'B+',
      doctor_name: patData.doctor_name || '',
      diagnosis: patData.diagnosis || '',
      allergies: patData.allergies || 'None',
      created_at: new Date().toISOString()
    }
    setAllPatients(prev => [newPat, ...prev])
    if (backendConnected) {
      try {
        await apiCreatePatient(newPat)
      } catch (e) {}
    }
    notify('Patient Registered', `${newPat.name} (UHID: ${newPat.uhid}) registered in ${targetStore} dispensary.`, 'success')
    return newPat
  }

  // Add Supplier
  const addSupplier = async (supData) => {
    const targetStore = supData.store || effectiveStore || 'UHTC'
    const newSup = {
      id: generateUUID(),
      store: targetStore,
      name: supData.name,
      company_name: supData.company_name,
      phone: supData.phone,
      email: supData.email || '',
      gstin: supData.gstin || '',
      address: supData.address || '',
      balance_payable: parseFloat(supData.balance_payable) || 0,
      created_at: new Date().toISOString()
    }
    setAllSuppliers(prev => [newSup, ...prev])
    if (backendConnected) {
      try {
        await apiCreateSupplier(newSup)
      } catch (e) {}
    }
    notify('Supplier Added', `${newSup.company_name} registered.`, 'success')
    return newSup
  }

  // Add Ward Requisition
  const addRequisition = async (reqData) => {
    const targetStore = reqData.store || effectiveStore || 'UHTC'
    const newReq = {
      id: generateUUID(),
      store: targetStore,
      requisition_no: `REQ-2026-${Math.floor(100 + Math.random() * 900)}`,
      department: reqData.department,
      requested_by: reqData.requested_by,
      priority: reqData.priority || 'Normal',
      status: reqData.status || 'Issued',
      bed_no: reqData.bed_no || 'OPD',
      patient_uhid: reqData.patient_uhid || '',
      items_count: parseInt(reqData.items_count, 10) || 1,
      notes: reqData.notes || '',
      created_at: new Date().toISOString()
    }
    setAllRequisitions(prev => [newReq, ...prev])
    if (backendConnected) {
      try {
        await apiCreateRequisition(newReq)
      } catch (e) {}
    }
    notify('Drug Requisition Issued', `Requisition #${newReq.requisition_no} dispatched to ${newReq.department} (${targetStore}).`, 'success')
    return newReq
  }

  // Update Requisition Status
  const updateRequisitionStatus = async (id, status) => {
    setAllRequisitions(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    if (backendConnected) {
      try {
        await apiUpdateRequisitionStatus(id, status)
      } catch (e) {}
    }
    notify('Status Updated', `Requisition marked as ${status}.`, 'info')
  }

  // --- POS CART ACTIONS ---
  const addToCart = (medicine, batch, qty = 1) => {
    const medDiscount = parseFloat(medicine.default_discount_percent ?? medicine.discount_percent ?? 0)
    const existing = cart.find(item => item.batch_id === batch.id)
    if (existing) {
      const maxAvailable = batch.current_stock
      if (existing.quantity + qty > maxAvailable) {
        notify('Stock Limit Reached', `Only ${maxAvailable} units available in Batch ${batch.batch_number}.`, 'warning')
        return
      }
      setCart(cart.map(item =>
        item.batch_id === batch.id
          ? { ...item, quantity: item.quantity + qty, total_price: (item.quantity + qty) * item.unit_price }
          : item
      ))
    } else {
      if (qty > batch.current_stock) {
        notify('Insufficient Stock', `Only ${batch.current_stock} units available in stock.`, 'warning')
        return
      }
      setCart([
        ...cart,
        {
          id: generateUUID(),
          store: effectiveStore,
          medicine_id: medicine.id,
          medicine_name: medicine.name,
          generic_name: medicine.generic_name,
          category: medicine.category,
          dosage_form: medicine.dosage_form,
          gst_rate: medicine.gst_rate !== undefined ? medicine.gst_rate : 12,
          batch_id: batch.id,
          batch_number: batch.batch_number,
          expiry_date: batch.expiry_date,
          unit_price: batch.selling_price || batch.mrp,
          mrp: batch.mrp,
          discount_percent: medDiscount,
          quantity: qty,
          total_price: qty * (batch.selling_price || batch.mrp)
        }
      ])
    }
    const discountMsg = medDiscount > 0 ? ` (${medDiscount}% MO Pre-Approved Discount applied)` : ''
    notify('Item Added', `${medicine.name} (Batch: ${batch.batch_number}) added to billing${discountMsg}.`, 'info')
  }

  const updateCartQty = (batchId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(batchId)
      return
    }
    const batch = batches.find(b => b.id === batchId)
    if (batch && quantity > batch.current_stock) {
      notify('Stock Exceeded', `Cannot add more than available ${batch.current_stock} units.`, 'warning')
      return
    }
    setCart(cart.map(item =>
      item.batch_id === batchId
        ? { ...item, quantity, total_price: quantity * item.unit_price }
        : item
    ))
  }

  const removeFromCart = (batchId) => {
    setCart(cart.filter(item => item.batch_id !== batchId))
  }

  const clearCart = () => {
    setCart([])
    if (currentUser?.role === 'pharmacist') {
      setDiscountPercent(preApprovedDiscount?.percent || 0)
    } else {
      setDiscountPercent(0)
    }
  }

  // Calculate POS Totals
  const cartSubtotal = cart.reduce((acc, item) => acc + item.total_price, 0)
  
  // Calculate item-level pre-approved discounts (set by MO / Super Admin)
  const cartItemDiscountTotal = cart.reduce((acc, item) => {
    const dPercent = item.discount_percent || 0
    return acc + ((item.total_price * dPercent) / 100)
  }, 0)

  // Overall bill discount (pushed from Admin / MO page)
  const isOverallDiscountActive = discountPercent > 0
  const cartGlobalDiscountAmount = (cartSubtotal * discountPercent) / 100
  const cartDiscountAmount = isOverallDiscountActive ? cartGlobalDiscountAmount : cartItemDiscountTotal

  // Calculate GST: if isGstActive is true, compute tax; if false, 0
  const cartTaxAmount = isGstActive
    ? cart.reduce((acc, item) => {
        const effectiveItemDisc = isOverallDiscountActive ? discountPercent : (item.discount_percent || 0)
        const itemTaxable = item.total_price * (1 - effectiveItemDisc / 100)
        return acc + (itemTaxable * ((item.gst_rate !== undefined ? item.gst_rate : 5) / 100))
      }, 0)
    : 0

  const cartGrandTotal = Math.max(0, (cartSubtotal - cartDiscountAmount) + cartTaxAmount)

  // Complete POS Sale
  const completeSale = async (paymentMode = 'UPI', customNotes = '') => {
    if (cart.length === 0) {
      notify('Cart is Empty', 'Add medicines to generate clinical invoice.', 'warning')
      return null
    }

    const invoiceNumber = `RVS-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
    const saleId = generateUUID()

    // Line items for the sale
    const saleItems = cart.map(item => ({
      id: generateUUID(),
      sale_id: saleId,
      store: effectiveStore,
      batch_id: (item.batch_id && item.batch_id.length === 36) ? item.batch_id : null,
      medicine_name: item.medicine_name,
      batch_number: item.batch_number,
      expiry_date: item.expiry_date || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percent: isOverallDiscountActive ? 0 : (item.discount_percent || 0),
      individual_discount_paused: isOverallDiscountActive && (item.discount_percent > 0),
      total_price: item.total_price
    }))

    const newSale = {
      id: saleId,
      store: effectiveStore,
      invoice_number: invoiceNumber,
      customer_name: cartCustomer.name || 'Walk-in Patient',
      customer_phone: cartCustomer.phone || 'N/A',
      doctor_name: cartCustomer.doctor || 'Dr. On-Duty Officer',
      subtotal: parseFloat(cartSubtotal.toFixed(2)),
      discount_amount: parseFloat(cartDiscountAmount.toFixed(2)),
      discount_percent: discountPercent,
      is_overall_discount_active: isOverallDiscountActive,
      discount_type: isOverallDiscountActive
        ? 'OVERALL_BILL_DISCOUNT'
        : (cartItemDiscountTotal > 0 ? 'ITEM_LEVEL_DISCOUNT' : 'NONE'),
      discount_note: isOverallDiscountActive
        ? `Overall Bill Discount (${discountPercent}%) active. Individual medicine discounts paused.`
        : (cartItemDiscountTotal > 0 ? `Individual medicine formulary discounts applied.` : 'Standard pricing (No discount)'),
      tax_amount: parseFloat(cartTaxAmount.toFixed(2)),
      grand_total: parseFloat(cartGrandTotal.toFixed(2)),
      is_gst_active: isGstActive,
      payment_mode: paymentMode,
      payment_status: 'Completed',
      notes: customNotes,
      created_at: new Date().toISOString(),
      items: saleItems
    }

    // 1. Deduct stock from batches locally in allBatches
    setAllBatches(prev =>
      prev.map(b => {
        const cartItem = cart.find(ci => ci.batch_id === b.id)
        if (cartItem) {
          const updatedStock = Math.max(0, b.current_stock - cartItem.quantity)
          return { ...b, current_stock: updatedStock }
        }
        return b
      })
    )

    // 2. Add to sales history
    setAllSales(prev => [newSale, ...prev])

    // 2.5 Automatically record or update Patient in Patients & Records directory
    const patientName = (cartCustomer.name || '').trim() || 'Walk-in Patient'
    const patientPhone = (cartCustomer.phone || '').trim()
    const patientDoctor = (cartCustomer.doctor || '').trim() || 'Dr. On-Duty Medical Officer'
    const prescribedMeds = saleItems.map(i => `${i.medicine_name} (${i.quantity})`).join(', ')

    setAllPatients(prev => {
      const existingIndex = prev.findIndex(p =>
        (p.store || 'UHTC') === effectiveStore &&
        ((cartCustomer.uhid && p.uhid === cartCustomer.uhid) ||
         (patientPhone && patientPhone !== 'N/A' && p.phone === patientPhone) ||
         (patientName !== 'Walk-in Patient' && p.name.toLowerCase() === patientName.toLowerCase()))
      )

      if (existingIndex >= 0) {
        const updated = [...prev]
        const existing = updated[existingIndex]
        updated[existingIndex] = {
          ...existing,
          store: effectiveStore,
          phone: patientPhone && patientPhone !== 'N/A' ? patientPhone : existing.phone,
          doctor_name: patientDoctor || existing.doctor_name,
          total_spent: Number(((existing.total_spent || 0) + newSale.grand_total).toFixed(2)),
          visit_count: (existing.visit_count || 1) + 1,
          last_visit: new Date().toISOString(),
          last_invoice: newSale.invoice_number,
          recent_medicines: prescribedMeds
        }
        return updated
      } else {
        const newPatient = {
          id: generateUUID(),
          store: effectiveStore,
          uhid: cartCustomer.uhid || `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          name: patientName,
          phone: patientPhone && patientPhone !== 'N/A' ? patientPhone : '',
          gender: 'General',
          age: 'N/A',
          doctor_name: patientDoctor,
          total_spent: Number(newSale.grand_total.toFixed(2)),
          visit_count: 1,
          last_visit: new Date().toISOString(),
          created_at: new Date().toISOString(),
          last_invoice: newSale.invoice_number,
          recent_medicines: prescribedMeds,
          allergies: 'None',
          diagnosis: 'Hospital Pharmacy Prescription'
        }
        try {
          apiCreatePatient(newPatient)
        } catch (e) {}
        return [newPatient, ...prev]
      }
    })

    // 3. Clear cart & open invoice receipt
    setCart([])
    setActiveInvoice(newSale)

    // 4. Write to shared hospital database
    try {
      await apiCreateSale(newSale)
      notify('Invoice Generated!', `Invoice #${newSale.invoice_number} saved for ₹${newSale.grand_total.toFixed(2)} (${effectiveStore} Dispensary).`, 'success')
    } catch (e) {
      notify('Invoice Generated (Local)', `Invoice #${newSale.invoice_number} saved locally for ₹${newSale.grand_total.toFixed(2)}.`, 'info')
    }

    return newSale
  }

  // Helper Stats scoped to the active dispensary (effectiveStore)
  const totalStockCount = batches.reduce((acc, b) => acc + (b.current_stock || 0), 0)
  const lowStockItems = medicines.filter(m => {
    const medBatches = batches.filter(b => b.medicine_id === m.id)
    const stock = medBatches.reduce((acc, b) => acc + b.current_stock, 0)
    return stock <= (m.min_stock_alert || 20)
  })

  // Expiry analysis scoped to the active dispensary
  const today = new Date()
  const expiringBatches = batches.map(b => {
    const exp = new Date(b.expiry_date)
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24))
    const med = medicines.find(m => m.id === b.medicine_id)
    return {
      ...b,
      medicineName: med ? med.name : 'Unknown Medicine',
      genericName: med ? med.generic_name : '',
      category: med ? med.category : '',
      shelf: med ? med.shelf_location : '',
      daysLeft: diffDays,
      status: diffDays < 0 ? 'expired' : diffDays <= 30 ? 'critical' : diffDays <= 60 ? 'warning' : diffDays <= 90 ? 'notice' : 'healthy'
    }
  })

  const expiredCount = expiringBatches.filter(b => b.status === 'expired').length
  const criticalExpiryCount = expiringBatches.filter(b => b.status === 'critical').length
  const totalSalesRevenue = sales.reduce((acc, s) => acc + (s.grand_total || 0), 0)

  // Role permissions
  const currentRole = ROLES[currentUser?.role] || ROLES.pharmacist
  const isReadOnly = Boolean(currentRole.isReadOnly)
  const canEdit = Boolean(currentRole.canEdit)
  const canAddMedicine = Boolean(currentRole.canAddMedicine)
  const canDeleteMedicine = Boolean(currentRole.canDeleteMedicine)
  const canManageUsers = Boolean(currentRole.canManageUsers)
  const canApplyDiscount = Boolean(currentRole.canApplyDiscount)
  const canBill = Boolean(currentRole.canBill)

  // Super Admin: Reset clinical data for active dispensary only
  const clearAllData = () => {
    if (!isSuperAdmin) {
      notify('Access Denied', 'Only Super Admin can reset clinical data.', 'error')
      return
    }
    setAllMedicines(prev => prev.filter(m => (m.store || 'UHTC') !== effectiveStore))
    setAllBatches(prev => prev.filter(b => (b.store || 'UHTC') !== effectiveStore))
    setAllPatients(prev => prev.filter(p => (p.store || 'UHTC') !== effectiveStore))
    setAllSuppliers(prev => prev.filter(s => (s.store || 'UHTC') !== effectiveStore))
    setAllRequisitions(prev => prev.filter(r => (r.store || 'UHTC') !== effectiveStore))
    setAllSales(prev => prev.filter(s => (s.store || 'UHTC') !== effectiveStore))
    setCart([])
    notify('Clean Slate Active', `All inventory, sales, and clinical records for ${effectiveStore} Dispensary have been cleared.`, 'info')
  }

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        darkMode,
        setDarkMode,
        // Multi-Store (UHTC & RHTC)
        STORES,
        STORE_OPTIONS,
        currentStore,
        effectiveStore,
        switchStore,
        // Active Dispensary Scoped Data
        medicines,
        batches,
        patients,
        suppliers,
        requisitions,
        sales,
        // Raw Data Across All Stores
        allMedicines,
        allBatches,
        allPatients,
        allSuppliers,
        allRequisitions,
        allSales,
        cart,
        cartCustomer,
        setCartCustomer,
        discountPercent,
        setDiscountPercent,
        activeInvoice,
        setActiveInvoice,
        backendConnected,
        backendSyncing,
        supabaseConnected: backendConnected,
        supabaseSyncing: backendSyncing,
        syncMessage,
        notifications,
        notify,
        dismissNotification,
        syncWithBackend,
        syncWithSupabase: syncWithBackend,
        pushAllLocalDataToBackend,
        pushAllLocalDataToSupabase: pushAllLocalDataToBackend,
        addMedicineWithBatch,
        updateMedicine,
        setMedicineDiscount,
        deleteMedicine,
        addBatch,
        updateBatch,
        addPatient,
        addSupplier,
        addRequisition,
        updateRequisitionStatus,
        clearAllData,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartDiscountAmount,
        cartItemDiscountTotal,
        cartGlobalDiscountAmount,
        isOverallDiscountActive,
        cartTaxAmount,
        cartGrandTotal,
        isGstActive,
        setIsGstActive,
        completeSale,
        totalStockCount,
        lowStockItems,
        expiringBatches,
        expiredCount,
        criticalExpiryCount,
        totalSalesRevenue,
        // Authentication & Role Permissions
        ROLES,
        users,
        currentUser,
        currentRole,
        isSuperAdmin,
        isImpersonating,
        returnToSuperAdmin,
        isReadOnly,
        canEdit,
        canAddMedicine,
        canDeleteMedicine,
        canManageUsers,
        canApplyDiscount,
        canBill,
        preApprovedDiscount,
        updatePreApprovedDiscount,
        login,
        quickSwitchUser,
        logout,
        addUser,
        updateUser,
        deleteUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isUserManagementModalOpen,
        setIsUserManagementModalOpen,
        isDbExplorerOpen,
        setIsDbExplorerOpen
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
