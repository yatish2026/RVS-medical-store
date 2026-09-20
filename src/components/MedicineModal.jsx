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
  Sparkles
} from 'lucide-react'

export const MedicineModal = ({ isOpen, onClose, initialData = null, targetMedicineForBatch = null }) => {
  const { addMedicineWithBatch, updateMedicine, addBatch, suppliers } = useApp()

  // Mode: 'BATCH_ONLY' (when inwarding batch to existing med), 'EDIT_MEDICINE' (when editing med), or 'NEW_MEDICINE_WITH_BATCH'
  const isBatchOnly = Boolean(targetMedicineForBatch)
  const isEditMedicine = Boolean(initialData && !targetMedicineForBatch)

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
    gst_rate: 12.00
  })

  // Batch & Expiry Form State
  const [batchForm, setBatchForm] = useState({
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
    const defaultSupplier = suppliers[0]?.company_name || 'Apollo Pharma Distributors'

    if (initialData) {
      setMedForm(initialData)
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
        gst_rate: 12.00
      })
    }

    // Generate smart random batch number and default 2-year expiry date
    const d = new Date()
    d.setFullYear(d.getFullYear() + 2)
    const defaultExp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    setBatchForm({
      batch_number: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      expiry_date: defaultExp,
      cost_price: '45.00',
      mrp: '75.00',
      selling_price: '70.00',
      current_stock: '50',
      supplier_name: defaultSupplier
    })
  }, [initialData, targetMedicineForBatch, isOpen, suppliers])

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
      // Updating medicine formulary details
      updateMedicine(initialData.id, medForm)
    } else {
      // UNIFIED: Creating New Medicine + Initial Batch with Expiry Date & Stock!
      addMedicineWithBatch(medForm, batchForm)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
              {isBatchOnly ? <PackagePlus className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isBatchOnly
                  ? `Inward Stock for ${targetMedicineForBatch.name}`
                  : isEditMedicine
                  ? 'Edit Medicine Formulary'
                  : 'Register New Medicine & Initial Stock'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBatchOnly
                  ? 'Add a new manufactured batch with expiry date & cost'
                  : isEditMedicine
                  ? 'Modify formulary details and shelf rack position'
                  : 'Enter medicine formula, rack location, batch number & expiry date'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-200/70 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[calc(85vh-8rem)] overflow-y-auto">
          
          {/* SECTION 1: MEDICINE FORMULARY (Only if not in batch-only mode) */}
          {!isBatchOnly && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-teal-800 font-bold uppercase tracking-wider text-[11px] pb-1 border-b border-teal-100">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>1. Medicine & Formulary Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={medForm.name}
                    onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                    placeholder="e.g. Augmentin 625 Duo"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Strength / Potency</label>
                  <input
                    type="text"
                    value={medForm.strength}
                    onChange={(e) => setMedForm({ ...medForm, strength: e.target.value })}
                    placeholder="e.g. 625 mg / 500 mg / 100 IU"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Generic Chemical Composition *</label>
                <input
                  type="text"
                  required
                  value={medForm.generic_name}
                  onChange={(e) => setMedForm({ ...medForm, generic_name: e.target.value })}
                  placeholder="e.g. Amoxicillin (500mg) + Clavulanic Acid (125mg)"
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category</label>
                  <select
                    value={medForm.category}
                    onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-all cursor-pointer font-medium"
                  >
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Analgesics / Antipyretic">Analgesics / Antipyretic</option>
                    <option value="Cardiac / Hypertension">Cardiac / Hypertension</option>
                    <option value="Diabetics / Insulin">Diabetics / Insulin</option>
                    <option value="Gastrointestinal">Gastrointestinal</option>
                    <option value="Respiratory / Asthma">Respiratory / Asthma</option>
                    <option value="IV Fluids & Critical Care">IV Fluids & Critical Care</option>
                    <option value="Antiseptics & Surgical">Antiseptics & Surgical</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Dosage Form</label>
                  <select
                    value={medForm.dosage_form}
                    onChange={(e) => setMedForm({ ...medForm, dosage_form: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-all cursor-pointer font-medium"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="IV Fluid">IV Fluid (Bottle)</option>
                    <option value="Ointment">Ointment / Gel</option>
                    <option value="Inhaler / MDI">Inhaler / MDI</option>
                    <option value="Medical Device">Medical Device / Consumable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-2 gap-3">
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
                    onChange={(e) => setMedForm({ ...medForm, gst_rate: parseFloat(e.target.value) || 12 })}
                    placeholder="12.00"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: BATCH & EXPIRY TRACKING (Shown when creating new medicine OR inwarding batch) */}
          {!isEditMedicine && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-teal-800 font-bold uppercase tracking-wider text-[11px] pb-1 border-b border-teal-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>2. Initial Batch & Expiry Tracking (Required for Expiry Radar)</span>
                </div>
              </div>

              <div className="bg-teal-50/50 border border-teal-200/80 rounded-2xl p-4 space-y-3">
                
                {/* Batch Number & Expiry Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-bold block mb-1">
                      Batch Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={batchForm.batch_number}
                      onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                      placeholder="e.g. AUG-9021"
                      className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-mono font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-800 font-bold block">
                        Expiry Date *
                      </label>
                      {/* Quick preset buttons */}
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
                    </div>
                    <input
                      type="date"
                      required
                      value={batchForm.expiry_date}
                      onChange={(e) => setBatchForm({ ...batchForm, expiry_date: e.target.value })}
                      className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-mono font-bold cursor-pointer"
                    />
                  </div>
                </div>

                {/* Stock Quantity & Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-800 font-bold block mb-1">Initial Stock Units *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={batchForm.current_stock}
                      onChange={(e) => setBatchForm({ ...batchForm, current_stock: e.target.value })}
                      placeholder="50"
                      className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-800 font-bold block mb-1">MRP (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={batchForm.mrp}
                      onChange={(e) => setBatchForm({ ...batchForm, mrp: e.target.value })}
                      placeholder="75.00"
                      className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-800 font-bold block mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={batchForm.selling_price}
                      onChange={(e) => setBatchForm({ ...batchForm, selling_price: e.target.value })}
                      placeholder="70.00"
                      className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-800 font-bold block mb-1">Pharma Supplier / Distributor</label>
                  <select
                    value={batchForm.supplier_name}
                    onChange={(e) => setBatchForm({ ...batchForm, supplier_name: e.target.value })}
                    className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none cursor-pointer font-medium"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.company_name}>{s.company_name}</option>
                    ))}
                    <option value="Direct Hospital Purchase">Direct Hospital Purchase</option>
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-teal-700/20 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isBatchOnly ? 'Save Inward Batch' : isEditMedicine ? 'Update Formulary' : 'Save Medicine & Stock'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
