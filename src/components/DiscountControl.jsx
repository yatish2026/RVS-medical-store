import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Percent,
  Tag,
  Plus,
  Trash2,
  ShieldCheck,
  Check,
  Lock,
  Sparkles,
  Search,
  RotateCcw,
  AlertCircle,
  TrendingDown,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react'

export const DiscountControl = ({ onOpenMedicineModal }) => {
  const {
    medicines,
    batches,
    preApprovedDiscount,
    updatePreApprovedDiscount,
    setMedicineDiscount,
    currentUser,
    currentRole,
    isReadOnly,
    setActiveTab
  } = useApp()

  const isSuperAdmin = currentUser?.role === 'admin_supervisor'
  const isMo = currentUser?.role === 'doctor_mo'
  // Super Admin ONLY can control overall bill discount
  const canControlOverallDiscount = isSuperAdmin
  // Both Super Admin and Medical Officer (MO) can control individual medicine discounts
  const canControlMedicineDiscount = isSuperAdmin || isMo

  // Overall Discount State - User can enter ANY custom number as they want
  const [customOverallPercent, setCustomOverallPercent] = useState(
    preApprovedDiscount?.percent !== undefined ? String(preApprovedDiscount.percent) : '0'
  )
  const [overallReason, setOverallReason] = useState(
    preApprovedDiscount?.reason || 'Clinical Package Discount'
  )

  // Individual Medicine Custom Discount State
  const [selectedMedId, setSelectedMedId] = useState('')
  const [customMedPercent, setCustomMedPercent] = useState('10')
  const [filterQuery, setFilterQuery] = useState('')

  // Inline editing state for medicines in table
  const [editingMedId, setEditingMedId] = useState(null)
  const [inlinePercent, setInlinePercent] = useState('')

  // Selected medicine for live custom discount preview
  const selectedMedicine = medicines.find((m) => m.id === selectedMedId)
  const selectedMedBatch = batches.find((b) => b.medicine_id === selectedMedId)
  const medMrp = selectedMedBatch ? (selectedMedBatch.selling_price || selectedMedBatch.mrp || 0) : 0
  const medDiscPct = Math.max(0, Math.min(100, parseFloat(customMedPercent) || 0))
  const medDiscVal = (medMrp * medDiscPct) / 100
  const medNetVal = medMrp - medDiscVal

  // All discounted medicines
  const discountedMedicines = medicines.filter(
    (m) => (parseFloat(m.default_discount_percent) || 0) > 0
  )

  // Filtered by search
  const displayedDiscounted = discountedMedicines.filter((m) => {
    if (!filterQuery.trim()) return true
    const q = filterQuery.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      (m.generic_name && m.generic_name.toLowerCase().includes(q)) ||
      (m.category && m.category.toLowerCase().includes(q))
    )
  })

  // Handle applying overall discount (Super Admin ONLY)
  const handleApplyOverallDiscount = (e) => {
    if (e) e.preventDefault()
    if (!canControlOverallDiscount) return
    const num = Math.max(0, Math.min(100, parseFloat(customOverallPercent) || 0))
    const reasonText = num > 0
      ? (overallReason.trim() || 'Clinical Package Discount')
      : 'Standard Bill Rate (No Overall Discount)'
    updatePreApprovedDiscount(num, reasonText)
  }

  // Handle applying preset to overall discount (Super Admin ONLY)
  const handleQuickPresetOverall = (pct) => {
    if (!canControlOverallDiscount) return
    setCustomOverallPercent(String(pct))
    if (pct === 0) {
      setOverallReason('Standard Bill Rate (No Overall Discount)')
    }
  }

  // Handle adding custom discount to selected medicine (MO & Super Admin)
  const handleAddMedicineDiscount = (e) => {
    if (e) e.preventDefault()
    if (!canControlMedicineDiscount) return
    if (!selectedMedId) return
    const num = Math.max(0, Math.min(100, parseFloat(customMedPercent) || 0))
    setMedicineDiscount(selectedMedId, num)
    setSelectedMedId('')
  }

  // Handle inline custom discount save (MO & Super Admin)
  const handleSaveInlineDiscount = (medId) => {
    if (!canControlMedicineDiscount) return
    const num = Math.max(0, Math.min(100, parseFloat(inlinePercent) || 0))
    setMedicineDiscount(medId, num)
    setEditingMedId(null)
    setInlinePercent('')
  }

  // Live calculation preview values for a sample ₹1,000 bill
  const previewPercent = Math.max(0, Math.min(100, parseFloat(customOverallPercent) || 0))
  const sampleAmount = 1000
  const sampleDiscount = (sampleAmount * previewPercent) / 100
  const samplePayable = sampleAmount - sampleDiscount

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-800 p-6 sm:p-8 shadow-lg shadow-teal-950/10 text-white">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 p-2 backdrop-blur-md border border-white/25 shadow-md shrink-0 flex items-center justify-center">
              <Percent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                Dispensary Formulary Pricing Authority
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
                Discount Control & Pricing Policy
              </h1>
              <p className="text-teal-50 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Configure custom overall bill package discounts pushed to dispensary terminals, and manage custom individual discounts per formulation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('pos')}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-teal-900 font-extrabold px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span>View Active Billing</span>
              <ArrowRight className="w-4 h-4 text-teal-700" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Terminal Discount */}
        <div className="clinical-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Terminal Bill Discount</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {preApprovedDiscount?.percent || 0}%
            </div>
            <div className="mt-1 text-xs text-slate-500 truncate">
              {preApprovedDiscount?.percent > 0 ? preApprovedDiscount.reason : 'Standard rate active'}
            </div>
          </div>
        </div>

        {/* KPI 2: Stacking Status */}
        <div className="clinical-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Individual Discounts</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              preApprovedDiscount?.percent > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-base sm:text-lg font-black tracking-tight ${
              preApprovedDiscount?.percent > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {preApprovedDiscount?.percent > 0 ? 'PAUSED' : 'ACTIVE'}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {preApprovedDiscount?.percent > 0
                ? 'Overall package rate takes precedence'
                : 'Applied per medicine formulary'}
            </div>
          </div>
        </div>

        {/* KPI 3: Discounted Medicines in Stock */}
        <div className="clinical-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discounted Formulations</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {discountedMedicines.length} <span className="text-sm font-bold text-slate-500">items</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              With pre-approved formulary rates
            </div>
          </div>
        </div>

        {/* KPI 4: Authority Status */}
        <div className="clinical-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Access Level</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {currentRole?.shortLabel || 'Staff'}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {isSuperAdmin
                ? 'Full Authority (Overall & Individual)'
                : isMo
                ? 'Individual Medicine Discount Authority Only'
                : 'Read-Only Formulary View'}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 1: Overall Bill Package Discount Authority */}
      <div className="clinical-card rounded-3xl p-6 sm:p-7 border-2 border-teal-200/90 bg-gradient-to-br from-white via-teal-50/20 to-teal-50/40 shadow-xs space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  1. Overall Bill Discount Authority (Terminal Sync)
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-300">
                  Live Terminal Lock
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter any custom discount percentage to apply on the patient's entire bill. Overrides and pauses individual item discounts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black border flex items-center gap-2 ${
              preApprovedDiscount?.percent > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${preApprovedDiscount?.percent > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>Current Terminal Discount: {preApprovedDiscount?.percent || 0}%</span>
            </div>
          </div>
        </div>

        {/* Explanatory Rule Banner */}
        <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          preApprovedDiscount?.percent > 0
            ? 'bg-amber-50/90 border-amber-200 text-amber-950'
            : 'bg-teal-50/80 border-teal-200 text-teal-950'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">
              {preApprovedDiscount?.percent > 0 ? '⏸️' : '▶️'}
            </span>
            <div className="space-y-0.5">
              <div className="font-extrabold text-sm">
                {preApprovedDiscount?.percent > 0
                  ? `Overall Bill Discount (${preApprovedDiscount.percent}%) is ACTIVE`
                  : 'Overall Bill Discount (0%) is INACTIVE — Standard Rate'}
              </div>
              <p className="text-xs opacity-90 leading-relaxed">
                {preApprovedDiscount?.percent > 0 ? (
                  <>Individual medicine formulary discounts are <strong className="underline">PAUSED</strong> so patients receive the overall package rate without double-discounting.</>
                ) : (
                  <>Individual medicine discounts set in the formulary are <strong className="underline">ACTIVE</strong> and applied per item.</>
                )}
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
            Authorized by: <strong className="text-slate-800">{preApprovedDiscount?.appliedBy || 'System Admin'}</strong>
          </div>
        </div>

        {/* MO Restriction Notice if logged in as doctor_mo */}
        {isMo && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-amber-900">Medical Officer (Doctor / MO) Authority Notice</div>
                <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                  Medical Officers cannot set overall bill package discounts. You have full clinical authority to set and manage <strong>individual medicine discounts</strong> in Section 2 below. Full overall bill discounts can only be authorized by <strong>Super Admin</strong>.
                </p>
              </div>
            </div>
            <span className="shrink-0 text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full border border-amber-300">
              Super Admin Only
            </span>
          </div>
        )}

        {/* Custom Discount Input Form (Enter any number as they want) */}
        <form onSubmit={handleApplyOverallDiscount} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end pt-1">
          
          {/* Custom Percentage Input */}
          <div className="lg:col-span-4 space-y-1.5">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider font-mono">
              Enter Custom Overall Discount (%):
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={customOverallPercent}
                onChange={(e) => setCustomOverallPercent(e.target.value)}
                placeholder="e.g. 7, 12.5, 18"
                disabled={!canControlOverallDiscount}
                className="w-full bg-white border-2 border-teal-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-2xl px-4 py-3 text-lg font-black text-slate-900 outline-none transition-all shadow-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-black text-slate-400 text-lg pointer-events-none">
                %
              </span>
            </div>

            {/* Quick Fill Helpers (Shortcuts) */}
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 font-mono">Presets:</span>
              {[0, 5, 10, 15, 20].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => handleQuickPresetOverall(pct)}
                  disabled={!canControlOverallDiscount}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                    parseFloat(customOverallPercent) === pct
                      ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  {pct === 0 ? '0% (Standard / Unpause)' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Reason / Category Note */}
          <div className="lg:col-span-5 space-y-1.5">
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider font-mono">
              Authorization Reason / Patient Category:
            </label>
            <input
              type="text"
              value={overallReason}
              onChange={(e) => setOverallReason(e.target.value)}
              placeholder="e.g. Senior Citizen / OPD Pack / Staff Concession / BPL Aid"
              disabled={!canControlOverallDiscount}
              className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none font-medium transition-all shadow-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed"
            />
            <div className="text-[10px] text-slate-500 pl-1">
              Appears on generated patient invoices and pharmacist terminal.
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="lg:col-span-3">
            <button
              type="submit"
              disabled={!canControlOverallDiscount}
              className={`w-full h-[48px] flex items-center justify-center gap-2 font-black px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all ${
                canControlOverallDiscount
                  ? 'bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-600 hover:to-teal-700 text-white shadow-teal-950/15 active:scale-95 cursor-pointer'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none border border-slate-300'
              }`}
            >
              {canControlOverallDiscount ? (
                <>
                  <Check className="w-4 h-4 text-teal-200" />
                  <span>Apply Overall Discount</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Super Admin Only</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Live Calculation Preview Simulator */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-600">
            <TrendingDown className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-slate-700 font-sans">Live Bill Calculation Preview (Sample ₹1,000 Bill):</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-slate-400">Subtotal: </span>
              <span className="font-bold text-slate-700">₹{sampleAmount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400">Discount ({previewPercent}%): </span>
              <span className="font-bold text-rose-600">-₹{sampleDiscount.toFixed(2)}</span>
            </div>
            <div className="bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
              <span className="text-teal-900 font-bold">Patient Pays: </span>
              <span className="font-black text-teal-800 text-sm">₹{samplePayable.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: Individual Medicine Formulary Discount Manager */}
      <div className="clinical-card rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  2. Custom Individual Medicine Discount Manager
                </h2>
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  {discountedMedicines.length} Formulations Discounted
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Set custom discount percentage on specific medicines. Applied when overall terminal discount is 0%.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenMedicineModal && onOpenMedicineModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Register New Medicine</span>
            </button>
          </div>
        </div>

        {/* Add / Set Custom Discount Bar */}
        <form
          onSubmit={handleAddMedicineDiscount}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200 space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider font-mono">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Apply Custom Individual Discount to Any Formulation:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Medicine Selector */}
            <div className="md:col-span-5">
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                disabled={!canControlMedicineDiscount}
                className="w-full bg-white border border-slate-300 focus:border-indigo-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none font-medium cursor-pointer shadow-xs disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">-- Select a Medicine from Formulary --</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.generic_name || m.category}) — Current: {m.default_discount_percent || 0}%
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Discount Input */}
            <div className="md:col-span-4 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={customMedPercent}
                  onChange={(e) => setCustomMedPercent(e.target.value)}
                  placeholder="Enter % (e.g. 8.5)"
                  disabled={!canControlMedicineDiscount}
                  className="w-full bg-white border border-slate-300 focus:border-indigo-600 rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-bold text-slate-900 outline-none shadow-xs font-mono disabled:bg-slate-100 disabled:text-slate-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-xs pointer-events-none">
                  %
                </span>
              </div>

              {/* Presets: 0% (Standard / Unpause), 5%, 10%, 15%, 20% */}
              <div className="flex items-center gap-1 shrink-0 flex-wrap">
                {[0, 5, 10, 15, 20].map((pct) => (
                  <button
                    type="button"
                    key={pct}
                    onClick={() => setCustomMedPercent(String(pct))}
                    disabled={!canControlMedicineDiscount}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                      parseFloat(customMedPercent) === pct
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {pct === 0 ? '0% (Standard / Unpause)' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={!canControlMedicineDiscount || !selectedMedId}
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Medicine Discount</span>
              </button>
            </div>

          </div>

          {/* Live Medicine Calculation Simulator */}
          {selectedMedicine && (
            <div className="mt-2 p-3 rounded-xl bg-white border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono shadow-2xs">
              <div className="flex items-center gap-2 text-indigo-900 font-sans font-bold">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Live Price Preview for {selectedMedicine.name}:</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-slate-500">Base MRP: <strong className="text-slate-800 font-bold">₹{medMrp.toFixed(2)}</strong></span>
                <span className="text-slate-500">Custom Discount ({medDiscPct}%): <strong className="text-rose-600 font-bold">-₹{medDiscVal.toFixed(2)}</strong></span>
                <span className="bg-indigo-50 text-indigo-900 font-black px-2.5 py-1 rounded-lg border border-indigo-200">
                  Patient Pays: ₹{medNetVal.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </form>

        {/* Search Bar for Discounted Items */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search discounted medicines by name or generic formula..."
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 outline-none transition-all font-medium"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{displayedDiscounted.length}</strong> of {discountedMedicines.length} discounted formulations
          </div>
        </div>

        {/* Discounted Medicines Table */}
        {discountedMedicines.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 space-y-2">
            <Tag className="w-10 h-10 text-slate-300 mx-auto mb-1" />
            <h4 className="font-extrabold text-slate-700 text-sm">
              No Individual Medicine Discounts Currently Set
            </h4>
            <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
              All formulations in your formulary are currently sold at standard MRP. Use the selector above to enter a custom discount percentage for any medicine.
            </p>
          </div>
        ) : displayedDiscounted.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white space-y-1">
            <Search className="w-6 h-6 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-600">No discounted medicines match "{filterQuery}"</div>
            <button
              onClick={() => setFilterQuery('')}
              className="text-indigo-600 hover:underline font-bold text-xs pt-1 cursor-pointer"
            >
              Clear Search Filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Medicine & Formula</th>
                  <th className="py-3 px-4">Category & Location</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Base MRP</th>
                  <th className="py-3 px-4">Custom Discount %</th>
                  <th className="py-3 px-4">Net Selling Rate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {displayedDiscounted.map((med) => {
                  const medBatches = batches.filter((b) => b.medicine_id === med.id)
                  const totalStock = medBatches.reduce((acc, b) => acc + (b.current_stock || 0), 0)
                  const primaryBatch = medBatches[0]
                  const basePrice = primaryBatch ? (primaryBatch.selling_price || primaryBatch.mrp || 0) : 0
                  const currentPct = parseFloat(med.default_discount_percent) || 0
                  const netPrice = (basePrice * (1 - currentPct / 100)).toFixed(2)
                  const isEditingThis = editingMedId === med.id

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Formula */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="text-sm font-extrabold text-slate-900">{med.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{med.generic_name}</div>
                      </td>

                      {/* Category & Location */}
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium inline-block mb-0.5">
                          {med.category}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {med.shelf_location || 'Rack Bay'}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {totalStock} units
                      </td>

                      {/* Base Price */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                        ₹{basePrice.toFixed(2)}
                      </td>

                      {/* Discount % (Editable or Badge) */}
                      <td className="py-3.5 px-4">
                        {isEditingThis ? (
                          <div className="flex items-center gap-1.5">
                            <div className="relative w-20">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="any"
                                autoFocus
                                value={inlinePercent}
                                onChange={(e) => setInlinePercent(e.target.value)}
                                className="w-full bg-white border-2 border-indigo-500 rounded-lg px-2 py-1 text-xs font-mono font-black text-slate-900 outline-none"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[10px]">
                                %
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSaveInlineDiscount(med.id)}
                              className="px-2 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-[10px] font-bold"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingMedId(null)}
                              className="px-1.5 py-1 text-slate-400 hover:text-slate-600 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-mono font-black px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                              -{currentPct}% Off
                            </span>
                            {canControlMedicineDiscount && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMedId(med.id)
                                  setInlinePercent(String(currentPct))
                                }}
                                className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer"
                                title="Edit custom discount %"
                              >
                                Edit %
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Net Price */}
                      <td className="py-3.5 px-4 font-mono font-black text-teal-800 text-sm">
                        ₹{netPrice}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Preset Adjusters */}
                          {canControlMedicineDiscount && (
                            <>
                              {[5, 10, 15, 20].map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setMedicineDiscount(med.id, p)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                                    currentPct === p
                                      ? 'bg-teal-700 text-white'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                  title={`Set discount to ${p}%`}
                                >
                                  {p}%
                                </button>
                              ))}

                              {/* 1-Click Remove Discount (0%) */}
                              <button
                                type="button"
                                onClick={() => setMedicineDiscount(med.id, 0)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold cursor-pointer transition-colors ml-1"
                                title="Remove discount (Revert to 0% standard MRP)"
                              >
                                Remove (0%)
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  )
}
