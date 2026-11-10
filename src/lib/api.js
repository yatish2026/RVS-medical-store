/**
 * RVS Medical Store & Hospital Management System
 * Backend API Client for PythonAnywhere Flask & MySQL
 */

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// In production, when hosted on PythonAnywhere, API_BASE is relative ('')
// In development, it defaults to relative (via Vite proxy) or VITE_API_BASE_URL
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const getUrl = (path) => `${API_BASE}${path}`

/**
 * Check if the PythonAnywhere Flask backend is online and reachable
 */
export const checkBackendHealth = async () => {
  try {
    const res = await fetch(getUrl('/api/health'), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout ? AbortSignal.timeout(1200) : undefined
    })
    if (res.ok) {
      const data = await res.json()
      if (data.offline || data.connected === false || data.status === 'offline') {
        return { connected: false, data }
      }
      return { connected: true, data }
    }
    return { connected: false, error: `HTTP ${res.status}` }
  } catch (err) {
    return { connected: false, error: err.message || 'Flask backend unreachable' }
  }
}

// AUTHENTICATION
export const apiLogin = async (username, password) => {
  const res = await fetch(getUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const errorMsg = data.message || data.error || 'Invalid username or password'
    const err = new Error(errorMsg)
    err.code = data.error
    throw err
  }
  return data
}

// 1. MEDICINES
export const apiGetMedicines = async () => {
  const res = await fetch(getUrl('/api/medicines'))
  if (!res.ok) throw new Error('Failed to fetch medicines')
  return await res.json()
}

export const apiCreateMedicine = async (medicineData) => {
  const res = await fetch(getUrl('/api/medicines'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(medicineData)
  })
  if (!res.ok) throw new Error('Failed to create medicine')
  return await res.json()
}

export const apiUpdateMedicine = async (id, medicineData) => {
  const res = await fetch(getUrl(`/api/medicines/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(medicineData)
  })
  if (!res.ok) throw new Error('Failed to update medicine')
  return await res.json()
}

export const apiDeleteMedicine = async (id) => {
  const res = await fetch(getUrl(`/api/medicines/${id}`), {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to delete medicine')
  return await res.json()
}

// 2. BATCHES
export const apiGetBatches = async () => {
  const res = await fetch(getUrl('/api/batches'))
  if (!res.ok) throw new Error('Failed to fetch batches')
  return await res.json()
}

export const apiCreateBatch = async (batchData) => {
  const res = await fetch(getUrl('/api/batches'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batchData)
  })
  if (!res.ok) throw new Error('Failed to create batch')
  return await res.json()
}

export const apiUpdateBatch = async (id, batchData) => {
  const res = await fetch(getUrl(`/api/batches/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batchData)
  })
  if (!res.ok) throw new Error('Failed to update batch')
  return await res.json()
}

// 3. PATIENTS
export const apiGetPatients = async () => {
  const res = await fetch(getUrl('/api/patients'))
  if (!res.ok) throw new Error('Failed to fetch patients')
  return await res.json()
}

export const apiCreatePatient = async (patientData) => {
  const res = await fetch(getUrl('/api/patients'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  })
  if (!res.ok) throw new Error('Failed to register patient')
  return await res.json()
}

// 4. SUPPLIERS
export const apiGetSuppliers = async () => {
  const res = await fetch(getUrl('/api/suppliers'))
  if (!res.ok) throw new Error('Failed to fetch suppliers')
  return await res.json()
}

export const apiCreateSupplier = async (supplierData) => {
  const res = await fetch(getUrl('/api/suppliers'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplierData)
  })
  if (!res.ok) throw new Error('Failed to register supplier')
  return await res.json()
}

// 5. REQUISITIONS
export const apiGetRequisitions = async () => {
  const res = await fetch(getUrl('/api/requisitions'))
  if (!res.ok) throw new Error('Failed to fetch requisitions')
  return await res.json()
}

export const apiCreateRequisition = async (reqData) => {
  const res = await fetch(getUrl('/api/requisitions'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqData)
  })
  if (!res.ok) throw new Error('Failed to create requisition')
  return await res.json()
}

export const apiUpdateRequisitionStatus = async (id, status) => {
  const res = await fetch(getUrl(`/api/requisitions/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  if (!res.ok) throw new Error('Failed to update requisition status')
  return await res.json()
}

// 6. SALES & BILLING
export const apiGetSales = async () => {
  const res = await fetch(getUrl('/api/sales'))
  if (!res.ok) throw new Error('Failed to fetch sales')
  return await res.json()
}

export const apiCreateSale = async (saleData) => {
  const res = await fetch(getUrl('/api/sales'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(saleData)
  })
  if (!res.ok) throw new Error('Failed to record sale')
  return await res.json()
}

// 7. PRE-APPROVED DISCOUNT POLICY
export const apiGetDiscountPolicy = async () => {
  const res = await fetch(getUrl('/api/discount-policy'))
  if (!res.ok) throw new Error('Failed to fetch discount policy')
  return await res.json()
}

export const apiUpdateDiscountPolicy = async (policyData) => {
  const res = await fetch(getUrl('/api/discount-policy'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(policyData)
  })
  if (!res.ok) throw new Error('Failed to update discount policy')
  return await res.json()
}

// 8. USERS & ROLES
export const apiGetUsers = async () => {
  const res = await fetch(getUrl('/api/users'))
  if (!res.ok) throw new Error('Failed to fetch users')
  return await res.json()
}

export const apiCreateUser = async (userData) => {
  const res = await fetch(getUrl('/api/users'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  if (!res.ok) throw new Error('Failed to create user')
  return await res.json()
}

export const apiUpdateUser = async (id, userData) => {
  const res = await fetch(getUrl(`/api/users/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })
  if (!res.ok) throw new Error('Failed to update user')
  return await res.json()
}

export const apiDeleteUser = async (id) => {
  const res = await fetch(getUrl(`/api/users/${id}`), {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to delete user')
  return await res.json()
}

// 9. BULK SYNC / 1-CLICK SEED TO PYTHONANYWHERE BACKEND
export const apiSeedAllData = async (payload) => {
  const res = await fetch(getUrl('/api/seed'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Failed to seed database')
  return await res.json()
}

// 10. DATABASE EXPLORER (INSPECTOR)
export const apiGetDbStats = async () => {
  const res = await fetch(getUrl('/api/db/stats'))
  if (!res.ok) throw new Error('Failed to fetch database statistics')
  return await res.json()
}

export const apiGetDbTable = async (tableName) => {
  const res = await fetch(getUrl(`/api/db/table/${tableName}`))
  if (!res.ok) throw new Error(`Failed to fetch table ${tableName}`)
  return await res.json()
}

