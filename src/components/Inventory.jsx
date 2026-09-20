import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Search,
  Plus,
  Filter,
  Pill,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Tag,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Edit2,
  Trash2,
  PackagePlus,
  Info
} from 'lucide-react'

export const Inventory = ({ onOpenMedicineModal, onOpenBatchModal, onEditMedicine }) => {
  const {
    medicines,
    batches,
    deleteMedicine,
    addToCart,
    notify
  } = useApp()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [expandedMedId, setExpandedMedId] = useState(null)

  // Categories list
  const categories = ['ALL', ...Array.from(new Set(medicines.map(m => m.category)))]

  // Filter medicines
  const filteredMedicines = medicines.filter(med => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.generic_name && med.generic_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (med.shelf_location && med.shelf_location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (med.manufacturer && med.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'ALL' || med.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const toggleExpand = (id) => {
    setExpandedMedId(expandedMedId === id ? null : id)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Action Controls */}
      <div className="clinical-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            Medicine Formulary & Multi-Batch Inventory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete hospital pharmacy catalog with live batch-wise stock and cold-chain vault locations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenMedicineModal}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-teal-700/15 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Medicine & Expiry</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Brand (e.g. Augmentin), Generic Salt (Amoxicillin), Shelf or Manufacturer..."
            className="w-full bg-white border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all outline-none shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Selector */}
        <div className="relative">
          <Filter className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 transition-all outline-none cursor-pointer appearance-none shadow-xs font-medium"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Formulary Categories' : cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

      </div>

      {/* Medicines Table */}
      <div className="clinical-card rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Medicine & Generic Formula</th>
                <th className="py-3.5 px-4">Category & Form</th>
                <th className="py-3.5 px-4">Shelf / Rack Location</th>
                <th className="py-3.5 px-4">Total Stock</th>
                <th className="py-3.5 px-4">Batches</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                    <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No medicines match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const medBatches = batches.filter(b => b.medicine_id === med.id)
                  const totalStock = medBatches.reduce((acc, b) => acc + b.current_stock, 0)
                  const isLow = totalStock <= (med.min_stock_alert || 20)
                  const isOutOfStock = totalStock === 0
                  const isExpanded = expandedMedId === med.id

                  return (
                    <React.Fragment key={med.id}>
                      <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-teal-50/20' : ''}`}>
                        {/* Name & Generic */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                            <span>{med.name}</span>
                            {med.strength && (
                              <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
                                {med.strength}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate" title={med.generic_name}>
                            {med.generic_name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Mfr: {med.manufacturer || 'General Pharma'}
                          </div>
                        </td>

                        {/* Category & Dosage Form */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {med.category}
                          </span>
                          <div className="text-xs text-slate-500 mt-1 font-mono">
                            Form: {med.dosage_form}
                          </div>
                        </td>

                        {/* Shelf Location */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>{med.shelf_location || 'General Shelf'}</span>
                          </div>
                        </td>

                        {/* Stock Status Badge */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-extrabold font-mono border ${
                                isOutOfStock
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isLow
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}
                            >
                              {totalStock} units
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            Min Alert: {med.min_stock_alert}
                          </div>
                        </td>

                        {/* Batches count */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleExpand(med.id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1 rounded-lg transition-colors"
                          >
                            <Layers className="w-3.5 h-3.5 text-teal-600" />
                            <span>{medBatches.length} Batch{medBatches.length !== 1 ? 'es' : ''}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inward Batch Button */}
                            <button
                              onClick={() => onOpenBatchModal(med)}
                              title="Add new batch / stock inward"
                              className="p-2 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-800 border border-slate-200 hover:border-teal-200 transition-colors"
                            >
                              <PackagePlus className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => onEditMedicine(med)}
                              title="Edit medicine details"
                              className="p-2 rounded-lg bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-800 border border-slate-200 hover:border-cyan-200 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove "${med.name}" and all its batches?`)) {
                                  deleteMedicine(med.id)
                                }
                              }}
                              title="Delete medicine"
                              className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Batches Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90">
                          <td colSpan="6" className="p-4 border-y border-slate-200">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                                <span className="flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                                  Active Batches for {med.name}
                                </span>
                                <button
                                  onClick={() => onOpenBatchModal(med)}
                                  className="text-[11px] bg-teal-600 text-white px-2.5 py-1 rounded-md hover:bg-teal-700 font-bold shadow-xs"
                                >
                                  + Inward New Batch
                                </button>
                              </div>

                              {medBatches.length === 0 ? (
                                <p className="text-xs text-slate-500 italic py-2">
                                  No batches recorded yet. Click '+ Inward New Batch' to add stock.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {medBatches.map((b) => {
                                    const expDate = new Date(b.expiry_date)
                                    const isExpired = expDate < new Date()

                                    return (
                                      <div
                                        key={b.id}
                                        className="bg-white border border-slate-200 p-3.5 rounded-xl flex flex-col justify-between gap-2 shadow-xs"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <div className="text-xs font-extrabold text-slate-900 font-mono">
                                              Batch: {b.batch_number}
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                              Vendor: {b.supplier_name || 'Standard Vendor'}
                                            </div>
                                          </div>
                                          <span
                                            className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                                              isExpired
                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                : 'bg-teal-50 text-teal-800 border-teal-200'
                                            }`}
                                          >
                                            Exp: {b.expiry_date}
                                          </span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 font-mono">
                                          <div>
                                            <span className="text-slate-500">Stock: </span>
                                            <strong className="text-emerald-700 font-bold">{b.current_stock} pcs</strong>
                                          </div>
                                          <div>
                                            <span className="text-slate-500">MRP: </span>
                                            <strong className="text-slate-900 font-bold">₹{b.mrp.toFixed(2)}</strong>
                                          </div>
                                        </div>

                                        <button
                                          onClick={() => addToCart(med, b, 1)}
                                          disabled={b.current_stock <= 0 || isExpired}
                                          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 disabled:opacity-40 disabled:pointer-events-none text-teal-900 text-xs font-bold border border-teal-200 transition-colors"
                                        >
                                          <ShoppingCart className="w-3.5 h-3.5 text-teal-700" />
                                          <span>Add to POS Bill (₹{b.selling_price || b.mrp})</span>
                                        </button>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
