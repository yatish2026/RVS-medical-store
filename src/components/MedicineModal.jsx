import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import {
  X,
  Pill,
  PackagePlus,
  Save,
  Building,
  Calendar,
  DollarSign,
  MapPin,
  Tag,
  AlertTriangle,
  Clock,
  Sparkles,
  Percent,
  ShieldCheck,
  Lock,
  Boxes
} from 'lucide-react'

export const MedicineModal = ({ isOpen, onClose, initialData = null, targetMedicineForBatch = null }) => {
  const {
    addMedicineWithBatch,
    updateMedicine,
    addBatch,
    batches = [],
    suppliers = [],
    currentUser,
    currentRole
  } = useApp()

  // Mode: 'BATCH_ONLY' (inwarding new batch), 'EDIT_MEDICINE', or 'NEW_MEDICINE_WITH_BATCH'
  const isBatchOnly = Boolean(targetMedicineForBatch)
  const isEditMedicine = Boolean(initialData && !targetMedicineForBatch)

  // MO (Medical Officer) or Super Admin authority check
  const isMoOrAdmin =
    currentUser?.role === 'admin_supervisor' ||
    currentUser?.role === 'doctor_mo' ||
    currentRole?.canEdit

  // Medicine Master Form State
  const [medForm, setMedForm] = useState({
    name: '',
    generic_name: '',
    category: 'Antibiotics',
    dosage_form: 'Tablet',
    strength: '',
    manufacturer: '',
    shelf_location: 'Rack A-01',
    min_stock_alert: 20,
    gst_rate: 12.00,
    default_discount_percent: 0
  })

  // Batch & Pricing Form State (MRP, Selling Price, Cost Price, Stock Count)
  const [batchForm, setBatchForm] = useState({
    id: null,
    batch_number: '',
    expiry_date: '',
    cost_price: '',
    mrp: '',
    selling_price: '',
    current_stock: '',
    supplier_name: ''
  })

  // Helper to set expiry date quickly (+1 year, +2 years, etc.)
  const setQuickExpiry = (yearsToAdd) => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + yearsToAdd)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    setBatchForm(prev => ({ ...prev, expiry_date: `${yyyy}-${mm}-${dd}` }))
  }

  useEffect(() => {
    const defaultSupplier = suppliers?.[0]?.company_name || 'Apollo Pharma Distributors'

    if (initialData) {
      // Find existing batches for this medicine
      const medBatches = batches.filter(b => b.medicine_id === initialData.id)
      const primaryBatch = medBatches[0]
      const totalStock = medBatches.reduce((acc, b) => acc + (b.current_stock || 0), 0)

      setMedForm({
        name: initialData.name || '',
        generic_name: initialData.generic_name || '',
        category: initialData.category || 'Antibiotics',
        dosage_form: initialData.dosage_form || 'Tablet',
        strength: initialData.strength || '',
        manufacturer: initialData.manufacturer || '',
        shelf_location: initialData.shelf_location || 'Rack A-01',
        min_stock_alert: initialData.min_stock_alert !== undefined ? initialData.min_stock_alert : 20,
        gst_rate: initialData.gst_rate !== undefined ? initialData.gst_rate : 12.00,
        default_discount_percent: initialData.default_discount_percent ?? initialData.discount_percent ?? 0
      })

      if (primaryBatch) {
        setBatchForm({
          id: primaryBatch.id,
          batch_number: primaryBatch.batch_number || '',
          expiry_date: primaryBatch.expiry_date || '',
          cost_price: primaryBatch.cost_price !== undefined ? String(primaryBatch.cost_price) : '',
          mrp: primaryBatch.mrp !== undefined ? String(primaryBatch.mrp) : '',
          selling_price: primaryBatch.selling_price !== undefined ? String(primaryBatch.selling_price) : (primaryBatch.mrp ? String(primaryBatch.mrp) : ''),
          current_stock: String(totalStock > 0 ? totalStock : (primaryBatch.current_stock || 0)),
          supplier_name: primaryBatch.supplier_name || defaultSupplier
        })
      } else {
        const d = new Date()
        d.setFullYear(d.getFullYear() + 2)
        setBatchForm({
          id: null,
          batch_number: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
          expiry_date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
          cost_price: '40.00',
          mrp: '65.00',
          selling_price: '60.00',
          current_stock: '50',
          supplier_name: defaultSupplier
        })
      }
    } else {
      setMedForm({
        name: '',
        generic_name: '',
        category: 'Antibiotics',
        dosage_form: 'Tablet',
        strength: '',
        manufacturer: '',
        shelf_location: 'Rack A-01',
        min_stock_alert: 20,
        gst_rate: 12.00,
        default_discount_percent: 0
      })

      const d = new Date()
      d.setFullYear(d.getFullYear() + 2)
      const defaultExp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

      setBatchForm({
        id: null,
        batch_number: `B-${Math.floor(1000 + Math.random() * 9000)}`,
        expiry_date: defaultExp,
        cost_price: '45.00',
        mrp: '75.00',
        selling_price: '70.00',
        current_stock: '50',
        supplier_name: defaultSupplier
      })
    }
  }, [initialData, targetMedicineForBatch, isOpen, suppliers, batches])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isBatchOnly) {
      // Inwarding extra batch to existing medicine
      addBatch({
        medicine_id: targetMedicineForBatch.id,
        batch_number: batchForm.batch_number,
        expiry_date: batchForm.expiry_date,
        cost_price: parseFloat(batchForm.cost_price) || 0,
        mrp: parseFloat(batchForm.mrp) || 0,
        selling_price: parseFloat(batchForm.selling_price) || parseFloat(batchForm.mrp) || 0,
        current_stock: parseInt(batchForm.current_stock, 10) || 0,
        supplier_name: batchForm.supplier_name
      })
    } else if (isEditMedicine) {
      // Updating medicine formulary details + batch pricing and stock!
      updateMedicine(initialData.id, medForm, batchForm)
    } else {
      // Creating New Medicine + Initial Batch with Expiry Date & Stock!
      addMedicineWithBatch(medForm, batchForm)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 px-6 py-4 border-b border-slate-200 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold shadow-xs">
              {isBatchOnly ? <PackagePlus className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  {isBatchOnly
                    ? `Inward Stock for ${targetMedicineForBatch.name}`
                    : isEditMedicine
                    ? `Edit Medicine & Pricing: ${initialData.name}`
                    : 'Register New Medicine & Stock'}
                </h3>
                {isMoOrAdmin && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                    MO & Super Admin Edit
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isBatchOnly
                  ? 'Add a new manufactured batch with expiry date & cost'
                  : isEditMedicine
                  ? 'Update formulary info, MRP, selling price, stock count & pre-approved doctor discounts.'
                  : 'Enter medicine formula, rack location, batch number, pricing & doctor discount.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* SECTION 1: FORMULARY DETAILS (Omitted if batch-only) */}
          {!isBatchOnly && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-teal-800 font-extrabold uppercase tracking-wider text-[11px] pb-1 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-teal-600" />
                  1. Medicine Classification & Formulary
                </span>
                <span className="text-[10px] text-slate-400 font-normal font-sans">Hospital Catalog Master</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1 text-xs">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={medForm.name}
                    onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                    placeholder="e.g. Augmentin 625 Duo"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1 text-xs">Strength / Potency</label>
                  <input
                    type="text"
                    value={medForm.strength}
                    onChange={(e) => setMedForm({ ...medForm, strength: e.target.value })}
                    placeholder="e.g. 625 mg / 500 mg / 100 IU"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1 text-xs">Generic Chemical Composition *</label>
                <input
                  type="text"
                  required
                  value={medForm.generic_name}
                  onChange={(e) => setMedForm({ ...medForm, generic_name: e.target.value })}
                  placeholder="e.g. Amoxicillin (500mg) + Clavulanic Acid (125mg)"
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category</label>
                  <select
                    value={medForm.category}
                    onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none cursor-pointer font-medium"
                  >
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Analgesics & Antipyretics">Analgesics & Antipyretics</option>
                    <option value="Gastrointestinal & Antacids">Gastrointestinal & Antacids</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Antidiabetic">Antidiabetic</option>
                    <option value="Respiratory & Antiallergic">Respiratory & Antiallergic</option>
                    <option value="IV Fluids & Infusions">IV Fluids & Infusions</option>
                    <option value="Critical Care & Injections">Critical Care & Injections</option>
                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                    <option value="Medical Consumables & Surgical">Medical Consumables & Surgical</option>
                    <option value="General Formulary">General Formulary</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Dosage Form</label>
                  <select
                    value={medForm.dosage_form}
                    onChange={(e) => setMedForm({ ...medForm, dosage_form: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none cursor-pointer font-medium"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="IV Infusion">IV Infusion</option>
                    <option value="Respules / Inhalation">Respules / Inhalation</option>
                    <option value="Ointment">Ointment / Gel</option>
                    <option value="Medical Consumable">Medical Consumable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Manufacturer / Brand House</label>
                  <input
                    type="text"
                    value={medForm.manufacturer}
                    onChange={(e) => setMedForm({ ...medForm, manufacturer: e.target.value })}
                    placeholder="e.g. GSK / Cipla / Sun Pharma"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Shelf / Rack Location</label>
                  <input
                    type="text"
                    value={medForm.shelf_location}
                    onChange={(e) => setMedForm({ ...medForm, shelf_location: e.target.value })}
                    placeholder="e.g. Rack A-02 / Cold Vault"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Low Stock Warning Limit</label>
                  <input
                    type="number"
                    value={medForm.min_stock_alert}
                    onChange={(e) => setMedForm({ ...medForm, min_stock_alert: parseInt(e.target.value, 10) || 10 })}
                    placeholder="20"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">GST Rate (%)</label>
                  <input
                    type="number"
                    value={medForm.gst_rate}
                    onChange={(e) => setMedForm({ ...medForm, gst_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="12.00"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: PRICING, STOCK & PRE-APPROVED DOCTOR DISCOUNT (MO & SUPER ADMIN EDITABLE) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-teal-900 font-extrabold uppercase tracking-wider text-[11px] pb-1 border-b border-teal-200">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-teal-700" />
                <span>2. Pricing, Available Stock & Doctor Pre-Approved Discount</span>
              </div>
              {isMoOrAdmin ? (
                <span className="text-[10px] text-teal-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  MO / Admin Authorized
                </span>
              ) : (
                <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" />
                  Read-Only for Pharmacist
                </span>
              )}
            </div>

            <div className="bg-teal-50/60 border border-teal-200/90 rounded-2xl p-4 space-y-4">
              
              {/* Pricing Grid: MRP, Selling Price, Cost Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1 text-xs">
                    MRP (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      disabled={!isMoOrAdmin}
                      value={batchForm.mrp}
                      onChange={(e) => {
                        const val = e.target.value
                        setBatchForm(prev => ({
                          ...prev,
                          mrp: val,
                          selling_price: prev.selling_price ? prev.selling_price : val
                        }))
                      }}
                      placeholder="75.00"
                      className="w-full bg-white border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-600 rounded-xl pl-7 pr-3 py-2 text-sm text-slate-900 outline-none font-mono font-bold"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Max retail print price</span>
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1 text-xs">
                    Selling Price / Bill Rate (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-teal-600 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      disabled={!isMoOrAdmin}
                      value={batchForm.selling_price}
                      onChange={(e) => setBatchForm({ ...batchForm, selling_price: e.target.value })}
                      placeholder="70.00"
                      className="w-full bg-white border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-600 rounded-xl pl-7 pr-3 py-2 text-sm text-teal-900 outline-none font-mono font-black"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Hospital billing rate</span>
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1 text-xs">
                    Purchase / Cost Rate (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      disabled={!isMoOrAdmin}
                      value={batchForm.cost_price}
                      onChange={(e) => setBatchForm({ ...batchForm, cost_price: e.target.value })}
                      placeholder="45.00"
                      className="w-full bg-white border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-600 rounded-xl pl-7 pr-3 py-2 text-sm text-slate-800 outline-none font-mono font-medium"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Wholesale purchase rate</span>
                </div>
              </div>

              {/* Stock Quantity, Batch Number & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1 text-xs flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5 text-teal-700" />
                    Available Stock (Units) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    disabled={!isMoOrAdmin}
                    value={batchForm.current_stock}
                    onChange={(e) => setBatchForm({ ...batchForm, current_stock: e.target.value })}
                    placeholder="50"
                    className="w-full bg-white border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Active dispensary units</span>
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1 text-xs">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isMoOrAdmin}
                    value={batchForm.batch_number}
                    onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                    placeholder="e.g. AUG-9021"
                    className="w-full bg-white border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-800 font-bold block text-xs">
                      Expiry Date *
                    </label>
                    {isMoOrAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setQuickExpiry(1)}
                          className="px-1.5 py-0.5 rounded bg-white text-teal-700 hover:bg-teal-100 border border-teal-200 text-[10px] font-bold"
                        >
                          +1 Yr
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickExpiry(2)}
                          className="px-1.5 py-0.5 rounded bg-white text-teal-700 hover:bg-teal-100 border border-teal-200 text-[10px] font-bold"
                        >
                          +2 Yrs
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    type="date"
                    required
                    disabled={!isMoOrAdmin}
                    value={batchForm.expiry_date}
                    onChange={(e) => setBatchForm({ ...batchForm, expiry_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-mono font-bold cursor-pointer"
                  />
                </div>
              </div>

              {/* Pre-Approved Medicine Discount (%) - Set by MO / Admin */}
              <div className="pt-3 border-t border-teal-200/70">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <label className="text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-teal-700" />
                      Pre-Approved Medicine Discount (%) for Pharmacist POS
                    </label>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Set by MO or Super Admin. When pharmacists add this medicine to any bill, this discount % automatically applies.
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {[0, 5, 10, 15, 20].map((disc) => (
                      <button
                        key={disc}
                        type="button"
                        disabled={!isMoOrAdmin}
                        onClick={() => setMedForm({ ...medForm, default_discount_percent: disc })}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          Number(medForm.default_discount_percent) === disc
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-teal-50 border border-slate-300'
                        }`}
                      >
                        {disc}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32 relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      disabled={!isMoOrAdmin}
                      value={medForm.default_discount_percent}
                      onChange={(e) =>
                        setMedForm({
                          ...medForm,
                          default_discount_percent: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))
                        })
                      }
                      className="w-full bg-white border border-slate-300 disabled:bg-slate-100 disabled:text-slate-500 focus:border-teal-600 rounded-xl pl-3 pr-7 py-2 text-sm text-slate-900 outline-none font-mono font-black"
                    />
                    <span className="absolute right-3 top-2.5 text-teal-700 font-extrabold text-xs">%</span>
                  </div>

                  <div className="text-xs text-slate-600 font-medium">
                    {Number(medForm.default_discount_percent) > 0 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Patients save {medForm.default_discount_percent}% off ₹{batchForm.selling_price || batchForm.mrp} (Net: ₹{(
                          (parseFloat(batchForm.selling_price || batchForm.mrp || 0) * (1 - Number(medForm.default_discount_percent) / 100))
                        ).toFixed(2)})
                      </span>
                    ) : (
                      <span className="text-slate-500">No automatic discount set (Full bill rate charged).</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-800/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {isBatchOnly
                  ? 'Confirm Inward Stock'
                  : isEditMedicine
                  ? 'Save Formulary & Pricing Changes'
                  : 'Register Medicine & Stock'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
