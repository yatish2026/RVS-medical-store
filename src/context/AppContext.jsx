import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  INITIAL_MEDICINES,
  INITIAL_BATCHES,
  INITIAL_PATIENTS,
  INITIAL_SUPPLIERS,
  INITIAL_REQUISITIONS,
  INITIAL_SALES
} from '../lib/demoData'
import { ROLES, INITIAL_USERS } from '../lib/authData'
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
  apiDeleteUser,
  apiSeedAllData
} from '../lib/api'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard')

  // Theme State
  const [darkMode, setDarkMode] = useState(false)

  // User Authentication & Roles State
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('rvs_users')
    return saved ? JSON.parse(saved) : INITIAL_USERS
  })

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('rvs_current_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        // fallback
      }
    }
    return null // Default to null so user sees clean LoginPage first
  })

  // Pre-approved Clinical Pack Discount (Set by MO or Admin, reflects on Pharmacist terminal)
  const [preApprovedDiscount, setPreApprovedDiscount] = useState(() => {
    const saved = localStorage.getItem('rvs_preapproved_discount')
    return saved ? JSON.parse(saved) : {
      percent: 10,
      appliedBy: 'Dr. A. Sharma (MO)',
      reason: 'General OPD Pack Discount'
    }
  })

  // Auth, User Management & Database Explorer Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false)
  const [isDbExplorerOpen, setIsDbExplorerOpen] = useState(false)


  // Medical Data States with LocalStorage Persistence
  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem('rvs_medicines')
    return saved ? JSON.parse(saved) : INITIAL_MEDICINES
  })

  const [batches, setBatches] = useState(() => {
    const saved = localStorage.getItem('rvs_batches')
    return saved ? JSON.parse(saved) : INITIAL_BATCHES
  })

  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('rvs_patients')
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS
  })

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('rvs_suppliers')
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS
  })

  const [requisitions, setRequisitions] = useState(() => {
    const saved = localStorage.getItem('rvs_requisitions')
    return saved ? JSON.parse(saved) : INITIAL_REQUISITIONS
  })

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('rvs_sales')
    return saved ? JSON.parse(saved) : INITIAL_SALES
  })

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
    localStorage.setItem('rvs_medicines', JSON.stringify(medicines))
  }, [medicines])

  useEffect(() => {
    localStorage.setItem('rvs_batches', JSON.stringify(batches))
  }, [batches])

  useEffect(() => {
    localStorage.setItem('rvs_patients', JSON.stringify(patients))
  }, [patients])

  useEffect(() => {
    localStorage.setItem('rvs_suppliers', JSON.stringify(suppliers))
  }, [suppliers])

  useEffect(() => {
    localStorage.setItem('rvs_requisitions', JSON.stringify(requisitions))
  }, [requisitions])

  useEffect(() => {
    localStorage.setItem('rvs_sales', JSON.stringify(sales))
  }, [sales])

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

  // When current user is Pharmacist, auto-sync discount to pre-approved percentage
  useEffect(() => {
    if (currentUser?.role === 'pharmacist' && preApprovedDiscount?.percent !== undefined) {
      setDiscountPercent(preApprovedDiscount.percent)
    }
  }, [currentUser, preApprovedDiscount])

  // Auth Operations
  const login = (username, password) => {
    const user = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    )
    if (!user) {
      notify('Authentication Failed', 'Invalid username or password.', 'error')
      return false
    }
    setCurrentUser(user)
    const roleInfo = ROLES[user.role] || ROLES.pharmacist
    notify(`Welcome back, ${user.name}`, `Logged in as ${roleInfo.shortLabel} (${roleInfo.badge})`, 'success')
    setIsAuthModalOpen(false)
    return true
  }

  const quickSwitchUser = (userIdOrRole) => {
    const user = users.find(u => u.id === userIdOrRole || u.role === userIdOrRole)
    if (user) {
      setCurrentUser(user)
      const roleInfo = ROLES[user.role] || ROLES.pharmacist
      notify(`Role Switched: ${roleInfo.shortLabel}`, `Active profile: ${user.name}. Permissions updated.`, 'success')
      setIsAuthModalOpen(false)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem('rvs_current_user')
    setCurrentUser(null)
    notify('Logged Out', 'You have been securely signed out of RVS Dispensary.', 'info')
  }


  const addUser = async (userData) => {
    if (currentUser?.role !== 'admin_supervisor') {
      notify('Access Denied', 'Only Super Admin can create user logins.', 'error')
      return false
    }
    const usernameClean = userData.username.trim().toLowerCase()
    if (users.some(u => u.username.toLowerCase() === usernameClean)) {
      notify('Duplicate Username', `Username "${userData.username}" is already taken.`, 'error')
      return false
    }
    const newUser = {
      id: `user-${Date.now()}`,
      username: usernameClean,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      designation: userData.designation || ROLES[userData.role]?.label,
      phone: userData.phone || ''
    }
    setUsers(prev => [...prev, newUser])
    try {
      await apiCreateUser(newUser)
    } catch (e) {}
    notify('User Created', `Account for ${newUser.name} (${ROLES[newUser.role]?.shortLabel}) was added.`, 'success')
    return true
  }

  const deleteUser = async (userId) => {
    if (currentUser?.role !== 'admin_supervisor') {
      notify('Access Denied', 'Only Super Admin can delete users.', 'error')
      return false
    }
    if (currentUser.id === userId) {
      notify('Action Blocked', 'You cannot delete your own currently active Super Admin account.', 'warning')
      return false
    }
    const target = users.find(u => u.id === userId)
    setUsers(prev => prev.filter(u => u.id !== userId))
    try {
      await apiDeleteUser(userId)
    } catch (e) {}
    notify('User Removed', `Account for ${target?.name || 'User'} has been removed.`, 'info')
    return true
  }

  const updatePreApprovedDiscount = async (percent, reason = 'Authorized Clinical Discount') => {
    if (currentUser?.role !== 'admin_supervisor' && currentUser?.role !== 'doctor_mo') {
      notify('Permission Restricted', 'Only Medical Officer (MO) or Super Admin can authorize clinical discounts.', 'error')
      return false
    }
    const num = Math.max(0, Math.min(100, Number(percent) || 0))
    const updated = {
      percent: num,
      appliedBy: `${currentUser.name} (${ROLES[currentUser.role]?.shortLabel})`,
      reason: reason || 'Clinical Pack Discount'
    }
    setPreApprovedDiscount(updated)
    setDiscountPercent(num)
    try {
      await apiUpdateDiscountPolicy({
        discount_percent: num,
        authorized_by: updated.appliedBy,
        reason: updated.reason
      })
    } catch (e) {}
    notify('Discount Authorized', `${num}% discount applied & locked for dispensary pharmacists by ${currentUser.name}.`, 'success')
    return true
  }

  // Initial PythonAnywhere Flask API health check & load
  useEffect(() => {
    const initBackend = async () => {
      const res = await checkBackendHealth()
      setBackendConnected(res.connected)
      if (res.connected) {
        setSyncMessage('Connected to PythonAnywhere Flask API & MySQL')
        await fetchFromBackend()
      } else {
        setSyncMessage('Local Mode (PythonAnywhere API Standby)')
      }
    }
    initBackend()
  }, [])

  // Fetch all tables from PythonAnywhere Flask API
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
        setMedicines(cloudMeds.value)
      }
      if (cloudBatches.status === 'fulfilled' && Array.isArray(cloudBatches.value) && cloudBatches.value.length > 0) {
        setBatches(cloudBatches.value)
      }
      if (cloudPatients.status === 'fulfilled' && Array.isArray(cloudPatients.value) && cloudPatients.value.length > 0) {
        setPatients(cloudPatients.value)
      }
      if (cloudSuppliers.status === 'fulfilled' && Array.isArray(cloudSuppliers.value) && cloudSuppliers.value.length > 0) {
        setSuppliers(cloudSuppliers.value)
      }
      if (cloudSales.status === 'fulfilled' && Array.isArray(cloudSales.value) && cloudSales.value.length > 0) {
        setSales(cloudSales.value)
      }
      if (cloudReqs.status === 'fulfilled' && Array.isArray(cloudReqs.value) && cloudReqs.value.length > 0) {
        setRequisitions(cloudReqs.value)
      }
      if (discountData.status === 'fulfilled' && discountData.value?.discount_percent !== undefined) {
        setPreApprovedDiscount({
          percent: Number(discountData.value.discount_percent),
          appliedBy: discountData.value.authorized_by || 'Dr. A. Sharma (MO)',
          reason: discountData.value.reason || 'General OPD Pack Discount'
        })
      }
      if (cloudUsers.status === 'fulfilled' && Array.isArray(cloudUsers.value) && cloudUsers.value.length > 0) {
        setUsers(cloudUsers.value)
      }
      return true
    } catch (e) {
      console.warn('PythonAnywhere API fetch error:', e)
      return false
    }
  }

  // Push all local formulary data to PythonAnywhere MySQL (1-click Cloud Seed)
  const pushAllLocalDataToBackend = async () => {
    setBackendSyncing(true)
    try {
      const payload = {
        medicines,
        batches,
        patients,
        suppliers,
        requisitions,
        sales
      }
      await apiSeedAllData(payload)
      setBackendConnected(true)
      notify('Database Populated!', 'All medicines, batches, sales, and records synced to PythonAnywhere MySQL!', 'success')
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
    const newMed = {
      id: medId,
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
      gst_rate: parseFloat(medData.gst_rate) || 12.00
    }

    let newBatch = null
    if (batchData && batchData.expiry_date) {
      newBatch = {
        id: generateUUID(),
        medicine_id: medId,
        batch_number: batchData.batch_number || `B-${Math.floor(1000 + Math.random() * 9000)}`,
        expiry_date: batchData.expiry_date,
        cost_price: parseFloat(batchData.cost_price) || 0,
        mrp: parseFloat(batchData.mrp) || 0,
        selling_price: parseFloat(batchData.selling_price) || parseFloat(batchData.mrp) || 0,
        current_stock: parseInt(batchData.current_stock, 10) || 0,
        supplier_name: batchData.supplier_name || 'Standard Distributor'
      }
    }

    // Update Local State Immediately
    setMedicines(prev => [newMed, ...prev])
    if (newBatch) {
      setBatches(prev => [newBatch, ...prev])
    }

    // Sync to PythonAnywhere Flask API
    try {
      await apiCreateMedicine(newMed)
      if (newBatch) {
        await apiCreateBatch(newBatch)
      }
      notify(
        'Medicine & Expiry Saved!',
        `${newMed.name} (Batch: ${newBatch?.batch_number || 'N/A'}) saved to PythonAnywhere!`,
        'success'
      )
    } catch (e) {
      notify('Medicine Added', `${newMed.name} recorded in dispensary formulary.`, 'info')
    }

    return { medicine: newMed, batch: newBatch }
  }

  // Edit Medicine
  const updateMedicine = async (id, medData) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...medData } : m))
    try {
      await apiUpdateMedicine(id, medData)
    } catch (e) {}
    notify('Formulary Updated', `Medicine details updated.`, 'success')
  }

  // Delete Medicine
  const deleteMedicine = async (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id))
    setBatches(prev => prev.filter(b => b.medicine_id !== id))
    try {
      await apiDeleteMedicine(id)
    } catch (e) {}
    notify('Medicine Removed', 'Item deleted from pharmacy stock.', 'warning')
  }

  // Add Batch
  const addBatch = async (batchData) => {
    const newBatch = {
      ...batchData,
      id: generateUUID(),
      cost_price: parseFloat(batchData.cost_price) || 0,
      mrp: parseFloat(batchData.mrp) || 0,
      selling_price: parseFloat(batchData.selling_price) || parseFloat(batchData.mrp) || 0,
      current_stock: parseInt(batchData.current_stock, 10) || 0
    }
    setBatches(prev => [newBatch, ...prev])
    try {
      await apiCreateBatch(newBatch)
    } catch (e) {}
    notify('Stock Inward Added', `Batch ${newBatch.batch_number} recorded (+${newBatch.current_stock} units).`, 'success')
    return newBatch
  }

  // Update Batch
  const updateBatch = async (batchId, updatedData) => {
    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, ...updatedData } : b))
    try {
      await apiUpdateBatch(batchId, updatedData)
    } catch (e) {}
    notify('Batch Updated', 'Batch stock/expiry updated successfully.', 'success')
  }

  // Add Patient
  const addPatient = async (patData) => {
    const newPat = {
      id: generateUUID(),
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
    setPatients(prev => [newPat, ...prev])
    try {
      await apiCreatePatient(newPat)
    } catch (e) {}
    notify('Patient Registered', `${newPat.name} (UHID: ${newPat.uhid}) registered.`, 'success')
    return newPat
  }

  // Add Supplier
  const addSupplier = async (supData) => {
    const newSup = {
      id: generateUUID(),
      name: supData.name,
      company_name: supData.company_name,
      phone: supData.phone,
      email: supData.email || '',
      gstin: supData.gstin || '',
      address: supData.address || '',
      balance_payable: parseFloat(supData.balance_payable) || 0,
      created_at: new Date().toISOString()
    }
    setSuppliers(prev => [newSup, ...prev])
    try {
      await apiCreateSupplier(newSup)
    } catch (e) {}
    notify('Supplier Added', `${newSup.company_name} registered.`, 'success')
    return newSup
  }

  // Add Ward Requisition
  const addRequisition = async (reqData) => {
    const newReq = {
      id: generateUUID(),
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
    setRequisitions(prev => [newReq, ...prev])
    try {
      await apiCreateRequisition(newReq)
    } catch (e) {}
    notify('Drug Requisition Issued', `Requisition #${newReq.requisition_no} dispatched to ${newReq.department}.`, 'success')
    return newReq
  }

  // Update Requisition Status
  const updateRequisitionStatus = async (id, status) => {
    setRequisitions(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    try {
      await apiUpdateRequisitionStatus(id, status)
    } catch (e) {}
    notify('Status Updated', `Requisition marked as ${status}.`, 'info')
  }

  // --- POS CART ACTIONS ---
  const addToCart = (medicine, batch, qty = 1) => {
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
          medicine_id: medicine.id,
          medicine_name: medicine.name,
          generic_name: medicine.generic_name,
          category: medicine.category,
          dosage_form: medicine.dosage_form,
          gst_rate: medicine.gst_rate || 12,
          batch_id: batch.id,
          batch_number: batch.batch_number,
          expiry_date: batch.expiry_date,
          unit_price: batch.selling_price || batch.mrp,
          mrp: batch.mrp,
          quantity: qty,
          total_price: qty * (batch.selling_price || batch.mrp)
        }
      ])
    }
    notify('Item Added', `${medicine.name} (Batch: ${batch.batch_number}) added to billing.`, 'info')
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
  const cartDiscountAmount = (cartSubtotal * discountPercent) / 100
  const cartTaxAmount = cart.reduce((acc, item) => {
    const itemSub = item.total_price * (1 - discountPercent / 100)
    return acc + (itemSub * (item.gst_rate / 100))
  }, 0)
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
      batch_id: (item.batch_id && item.batch_id.length === 36) ? item.batch_id : null,
      medicine_name: item.medicine_name,
      batch_number: item.batch_number,
      expiry_date: item.expiry_date || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }))

    const newSale = {
      id: saleId,
      invoice_number: invoiceNumber,
      customer_name: cartCustomer.name || 'Walk-in Patient',
      customer_phone: cartCustomer.phone || 'N/A',
      doctor_name: cartCustomer.doctor || 'Dr. On-Duty Officer',
      subtotal: parseFloat(cartSubtotal.toFixed(2)),
      discount_amount: parseFloat(cartDiscountAmount.toFixed(2)),
      tax_amount: parseFloat(cartTaxAmount.toFixed(2)),
      grand_total: parseFloat(cartGrandTotal.toFixed(2)),
      payment_mode: paymentMode,
      payment_status: 'Completed',
      notes: customNotes,
      created_at: new Date().toISOString(),
      items: saleItems
    }

    // 1. Deduct stock from batches locally & on PythonAnywhere backend
    setBatches(prev =>
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
    setSales(prev => [newSale, ...prev])

    // 3. Clear cart & open invoice receipt
    setCart([])
    setActiveInvoice(newSale)

    // 4. Cloud Write to PythonAnywhere Flask API & MySQL
    try {
      await apiCreateSale(newSale)
      notify('Invoice Generated!', `Invoice #${newSale.invoice_number} saved to PythonAnywhere MySQL for ₹${newSale.grand_total.toFixed(2)}.`, 'success')
    } catch (e) {
      notify('Invoice Generated (Local)', `Invoice #${newSale.invoice_number} saved locally for ₹${newSale.grand_total.toFixed(2)}.`, 'info')
    }

    return newSale
  }

  // Helper Stats
  const totalStockCount = batches.reduce((acc, b) => acc + (b.current_stock || 0), 0)
  const lowStockItems = medicines.filter(m => {
    const medBatches = batches.filter(b => b.medicine_id === m.id)
    const stock = medBatches.reduce((acc, b) => acc + b.current_stock, 0)
    return stock <= (m.min_stock_alert || 20)
  })

  // Expiry analysis
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

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        darkMode,
        setDarkMode,
        medicines,
        batches,
        patients,
        suppliers,
        requisitions,
        sales,
        cart,
        cartCustomer,
        setCartCustomer,
        discountPercent,
        setDiscountPercent,
        activeInvoice,
        setActiveInvoice,
        backendConnected,
        backendSyncing,
        supabaseConnected: backendConnected, // alias for backwards compatibility
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
        deleteMedicine,
        addBatch,
        updateBatch,
        addPatient,
        addSupplier,
        addRequisition,
        updateRequisitionStatus,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartDiscountAmount,
        cartTaxAmount,
        cartGrandTotal,
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
