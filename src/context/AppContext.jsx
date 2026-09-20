import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  INITIAL_MEDICINES,
  INITIAL_BATCHES,
  INITIAL_PATIENTS,
  INITIAL_SUPPLIERS,
  INITIAL_REQUISITIONS,
  INITIAL_SALES
} from '../lib/demoData'
import { supabase, checkSupabaseConnection, generateUUID } from '../lib/supabase'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard')

  // Theme State
  const [darkMode, setDarkMode] = useState(false)

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
  const [discountPercent, setDiscountPercent] = useState(0)
  const [activeInvoice, setActiveInvoice] = useState(null)

  // Supabase Connection Status
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const [supabaseSyncing, setSupabaseSyncing] = useState(false)
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

  // Initial Supabase health check & load
  useEffect(() => {
    const initSupabase = async () => {
      const res = await checkSupabaseConnection()
      setSupabaseConnected(res.connected)
      if (res.connected) {
        setSyncMessage('Connected to Supabase Cloud')
        await fetchFromSupabase()
      } else {
        setSyncMessage('Local / Ready for Cloud Sync')
      }
    }
    initSupabase()
  }, [])

  // Fetch all tables from Supabase
  const fetchFromSupabase = async () => {
    try {
      const { data: cloudMeds } = await supabase.from('medicines').select('*')
      const { data: cloudBatches } = await supabase.from('batches').select('*')
      const { data: cloudPatients } = await supabase.from('patients').select('*')
      const { data: cloudSuppliers } = await supabase.from('suppliers').select('*')
      const { data: cloudSales } = await supabase.from('sales').select('*')
      const { data: cloudSaleItems } = await supabase.from('sale_items').select('*')
      const { data: cloudReqs } = await supabase.from('hospital_requisitions').select('*')

      if (cloudMeds && cloudMeds.length > 0) {
        setMedicines(cloudMeds)
      }
      if (cloudBatches && cloudBatches.length > 0) {
        setBatches(cloudBatches)
      }
      if (cloudPatients && cloudPatients.length > 0) {
        setPatients(cloudPatients)
      }
      if (cloudSuppliers && cloudSuppliers.length > 0) {
        setSuppliers(cloudSuppliers)
      }
      if (cloudSales && cloudSales.length > 0) {
        // Attach line items to corresponding sales
        const populatedSales = cloudSales.map(s => ({
          ...s,
          items: cloudSaleItems ? cloudSaleItems.filter(si => si.sale_id === s.id) : []
        }))
        setSales(populatedSales)
      }
      if (cloudReqs && cloudReqs.length > 0) {
        setRequisitions(cloudReqs)
      }
      return true
    } catch (e) {
      console.warn('Supabase fetch error:', e)
      return false
    }
  }

  // Push all local formulary data to Supabase (1-click Cloud Seed)
  const pushAllLocalDataToSupabase = async () => {
    setSupabaseSyncing(true)
    try {
      // 1. Create a mapping for demo medicine IDs to valid UUIDs
      const idMap = {}
      const formattedMeds = medicines.map(m => {
        const newId = (m.id && m.id.length === 36) ? m.id : generateUUID()
        idMap[m.id] = newId
        return {
          id: newId,
          name: m.name,
          generic_name: m.generic_name || '',
          category: m.category || 'General',
          dosage_form: m.dosage_form || 'Tablet',
          strength: m.strength || '',
          manufacturer: m.manufacturer || '',
          shelf_location: m.shelf_location || 'Rack A-01',
          min_stock_alert: parseInt(m.min_stock_alert, 10) || 20,
          prescription_required: true,
          hsn_code: m.hsn_code || '30049099',
          gst_rate: parseFloat(m.gst_rate) || 12.00
        }
      })

      const { error: medError } = await supabase.from('medicines').upsert(formattedMeds)
      if (medError) throw medError

      // 2. Format Batches with matching UUIDs
      const batchIdMap = {}
      const formattedBatches = batches.map(b => {
        const bId = (b.id && b.id.length === 36) ? b.id : generateUUID()
        batchIdMap[b.id] = bId
        return {
          id: bId,
          medicine_id: idMap[b.medicine_id] || formattedMeds[0]?.id,
          batch_number: b.batch_number,
          expiry_date: b.expiry_date,
          cost_price: parseFloat(b.cost_price) || 0,
          mrp: parseFloat(b.mrp) || 0,
          selling_price: parseFloat(b.selling_price) || parseFloat(b.mrp) || 0,
          current_stock: parseInt(b.current_stock, 10) || 0,
          supplier_name: b.supplier_name || 'Apollo Pharma Distributors'
        }
      })

      const { error: batchError } = await supabase.from('batches').upsert(formattedBatches)
      if (batchError) throw batchError

      // 3. Format Patients
      const formattedPatients = patients.map(p => ({
        id: (p.id && p.id.length === 36) ? p.id : generateUUID(),
        uhid: p.uhid,
        name: p.name,
        phone: p.phone,
        age: parseInt(p.age, 10) || 30,
        gender: p.gender,
        blood_group: p.blood_group,
        doctor_name: p.doctor_name,
        diagnosis: p.diagnosis,
        allergies: p.allergies
      }))
      await supabase.from('patients').upsert(formattedPatients)

      // 4. Format Suppliers
      const formattedSuppliers = suppliers.map(s => ({
        id: (s.id && s.id.length === 36) ? s.id : generateUUID(),
        name: s.name,
        company_name: s.company_name,
        phone: s.phone,
        email: s.email,
        gstin: s.gstin,
        address: s.address,
        balance_payable: parseFloat(s.balance_payable) || 0
      }))
      await supabase.from('suppliers').upsert(formattedSuppliers)

      // 5. Upload Sales and Sale Items
      const formattedSales = []
      const formattedSaleItems = []

      sales.forEach(s => {
        const saleId = (s.id && s.id.length === 36) ? s.id : generateUUID()
        formattedSales.push({
          id: saleId,
          invoice_number: s.invoice_number,
          customer_name: s.customer_name,
          customer_phone: s.customer_phone,
          doctor_name: s.doctor_name,
          subtotal: parseFloat(s.subtotal) || 0,
          discount_amount: parseFloat(s.discount_amount) || 0,
          tax_amount: parseFloat(s.tax_amount) || 0,
          grand_total: parseFloat(s.grand_total) || 0,
          payment_mode: s.payment_mode || 'Cash',
          payment_status: s.payment_status || 'Completed',
          notes: s.notes || ''
        })

        if (s.items && Array.isArray(s.items)) {
          s.items.forEach(item => {
            formattedSaleItems.push({
              id: generateUUID(),
              sale_id: saleId,
              batch_id: batchIdMap[item.batch_id] || (item.batch_id && item.batch_id.length === 36 ? item.batch_id : null),
              medicine_name: item.medicine_name,
              batch_number: item.batch_number,
              expiry_date: item.expiry_date || null,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price
            })
          })
        }
      })

      if (formattedSales.length > 0) {
        await supabase.from('sales').upsert(formattedSales)
      }
      if (formattedSaleItems.length > 0) {
        await supabase.from('sale_items').upsert(formattedSaleItems)
      }

      // Refresh state
      setMedicines(formattedMeds)
      setBatches(formattedBatches)
      setPatients(formattedPatients)
      setSuppliers(formattedSuppliers)
      setSupabaseConnected(true)

      notify('Cloud Database Populated!', 'All medicines, batches, sales, and line items uploaded to Supabase!', 'success')
    } catch (err) {
      console.error('Cloud upload error:', err)
      notify('Upload Failed', err.message || 'Make sure all tables exist in Supabase first.', 'error')
    } finally {
      setSupabaseSyncing(false)
    }
  }

  // Sync Data with Supabase Cloud
  const syncWithSupabase = async () => {
    setSupabaseSyncing(true)
    try {
      const res = await checkSupabaseConnection()
      if (!res.connected) {
        throw new Error(res.error || 'Cannot connect to Supabase. Check internet or run SQL script.')
      }

      const ok = await fetchFromSupabase()
      if (ok) {
        setSupabaseConnected(true)
        notify('Supabase Cloud Synced', 'Live records synced with Supabase PostgreSQL.', 'success')
      }
    } catch (err) {
      console.warn('Sync notice:', err.message)
      notify('Supabase Notice', err.message, 'error')
    } finally {
      setSupabaseSyncing(false)
    }
  }

  // --- CRUD ACTIONS ---

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

    // Write to Supabase Cloud
    try {
      const { data: mData, error: mError } = await supabase.from('medicines').insert([newMed]).select()
      if (mError) {
        console.error('Supabase Medicine Insert Error:', mError)
      }

      if (newBatch) {
        const { data: bData, error: bError } = await supabase.from('batches').insert([newBatch]).select()
        if (bError) {
          console.error('Supabase Batch Insert Error:', bError)
        }
      }

      notify(
        'Medicine & Expiry Saved!',
        `${newMed.name} (Batch: ${newBatch?.batch_number || 'N/A'}, Exp: ${newBatch?.expiry_date || 'N/A'}) saved to Supabase!`,
        'success'
      )
    } catch (e) {
      console.error('Cloud write exception:', e)
    }

    return { medicine: newMed, batch: newBatch }
  }

  // Edit Medicine
  const updateMedicine = async (id, medData) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...medData } : m))
    try {
      await supabase.from('medicines').update(medData).eq('id', id)
    } catch (e) {}
    notify('Formulary Updated', `Medicine details updated in Supabase.`, 'success')
  }

  // Delete Medicine
  const deleteMedicine = async (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id))
    setBatches(prev => prev.filter(b => b.medicine_id !== id))
    try {
      await supabase.from('medicines').delete().eq('id', id)
      await supabase.from('batches').delete().eq('medicine_id', id)
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
      const { error } = await supabase.from('batches').insert([newBatch])
      if (error) throw error
    } catch (e) {
      console.error('Supabase Batch Insert Error:', e)
    }

    notify('Stock Inward Added', `Batch ${newBatch.batch_number} recorded (+${newBatch.current_stock} units, Exp: ${newBatch.expiry_date}).`, 'success')
    return newBatch
  }

  // Update Batch
  const updateBatch = async (batchId, updatedData) => {
    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, ...updatedData } : b))
    try {
      await supabase.from('batches').update(updatedData).eq('id', batchId)
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
      const { error } = await supabase.from('patients').insert([newPat])
      if (error) console.error('Supabase Patient Insert Error:', error)
    } catch (e) {}

    notify('Patient Registered', `${newPat.name} (UHID: ${newPat.uhid}) registered in Supabase.`, 'success')
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
      const { error } = await supabase.from('suppliers').insert([newSup])
      if (error) console.error('Supabase Supplier Insert Error:', error)
    } catch (e) {}

    notify('Supplier Added', `${newSup.company_name} registered in Supabase.`, 'success')
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
      const { error } = await supabase.from('hospital_requisitions').insert([newReq])
      if (error) console.error('Supabase Requisition Insert Error:', error)
    } catch (e) {}

    notify('Drug Requisition Issued', `Requisition #${newReq.requisition_no} dispatched to ${newReq.department}.`, 'success')
    return newReq
  }

  // Update Requisition Status
  const updateRequisitionStatus = async (id, status) => {
    setRequisitions(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    try {
      await supabase.from('hospital_requisitions').update({ status }).eq('id', id)
    } catch (e) {}
    notify('Status Updated', `Requisition status marked as ${status}.`, 'info')
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
    setDiscountPercent(0)
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

    // 1. Deduct stock from batches locally & on Supabase
    setBatches(prev =>
      prev.map(b => {
        const cartItem = cart.find(ci => ci.batch_id === b.id)
        if (cartItem) {
          const updatedStock = Math.max(0, b.current_stock - cartItem.quantity)
          // update cloud stock if valid UUID
          if (b.id && b.id.length === 36) {
            supabase.from('batches').update({ current_stock: updatedStock }).eq('id', b.id).then(() => {})
          }
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

    // 4. Cloud Write: Write to `sales` AND `sale_items`
    try {
      const { error: sErr } = await supabase.from('sales').insert([{
        id: saleId,
        invoice_number: newSale.invoice_number,
        customer_name: newSale.customer_name,
        customer_phone: newSale.customer_phone,
        doctor_name: newSale.doctor_name,
        subtotal: newSale.subtotal,
        discount_amount: newSale.discount_amount,
        tax_amount: newSale.tax_amount,
        grand_total: newSale.grand_total,
        payment_mode: newSale.payment_mode,
        payment_status: newSale.payment_status,
        notes: newSale.notes
      }])

      if (sErr) {
        console.error('Supabase sales insert error:', sErr)
      } else {
        // Insert into sale_items table
        const { error: siErr } = await supabase.from('sale_items').insert(saleItems)
        if (siErr) {
          console.error('Supabase sale_items insert error:', siErr)
        } else {
          console.log('Supabase sale_items saved successfully:', saleItems)
        }
      }
    } catch (e) {
      console.warn('Cloud sales sync error:', e)
    }

    notify('Invoice Generated!', `Invoice #${newSale.invoice_number} saved to Supabase (including ${saleItems.length} line items) for ₹${newSale.grand_total.toFixed(2)}.`, 'success')
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
        supabaseConnected,
        supabaseSyncing,
        syncMessage,
        notifications,
        notify,
        dismissNotification,
        syncWithSupabase,
        pushAllLocalDataToSupabase,
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
        totalSalesRevenue
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
