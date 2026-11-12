import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import confetti from 'canvas-confetti'
import {
  getLocalDateKey,
  getTodayDateKey,
  getYesterdayDateKey,
  formatDisplayDate,
  formatDisplayTime
} from '../lib/dateUtils'
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  Users,
  Phone,
  Stethoscope,
  CreditCard,
  QrCode,
  Banknote,
  Building,
  CheckCircle2,
  Percent,
  Receipt,
  Printer,
  Sparkles,
  AlertCircle,
  ArrowRight,
  History,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  Lock,
  Eye,
  HeartPulse,
  Activity,
  Droplets,
  ShieldAlert,
  Pill,
  RotateCcw,
  FileUp,
  SearchX
} from 'lucide-react'

export const POSBilling = ({ onOpenMedicineModal, onOpenPdfModal }) => {
  const {
    medicines,
    batches,
    patients,
    sales,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartCustomer,
    setCartCustomer,
    discountPercent,
    setDiscountPercent,
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
    setActiveInvoice,
    currentUser,
    currentRole,
    canApplyDiscount,
    isReadOnly,
    preApprovedDiscount,
    updatePreApprovedDiscount,
    effectiveStore
  } = useApp()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [paymentMode, setPaymentMode] = useState('UPI')
  const [customNotes, setCustomNotes] = useState('')
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [patientValidationError, setPatientValidationError] = useState('')

  // View mode: 'catalog', 'checkout', or 'history'
  const [activePosView, setActivePosView] = useState('catalog')

  // History tab states
  const [historyDateFilter, setHistoryDateFilter] = useState('ALL')
  const [historyCustomStart, setHistoryCustomStart] = useState('')
  const [historyCustomEnd, setHistoryCustomEnd] = useState('')
  const [historySearch, setHistorySearch] = useState('')
  const [historyExpandedDay, setHistoryExpandedDay] = useState(null)

  // Categories
  const categories = ['ALL', 'Fast Movers', 'Antibiotics', 'Analgesics', 'Cardiac', 'Diabetics', 'IV Fluids']

  // Filter medicines for POS
  const filteredMedicines = medicines.filter(med => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.generic_name && med.generic_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (med.category && med.category.toLowerCase().includes(searchQuery.toLowerCase()))

    let matchesCategory = true
    if (selectedCategory !== 'ALL') {
      const medCat = (med.category || '').toLowerCase()
      if (selectedCategory === 'Fast Movers') {
        matchesCategory = medCat.includes('analgesic') || medCat.includes('antibiotic')
      } else if (selectedCategory === 'Cardiac') {
        matchesCategory = medCat.includes('cardiac') || medCat.includes('cardio')
      } else if (selectedCategory === 'Diabetics') {
        matchesCategory = medCat.includes('diabet') || medCat.includes('insulin')
      } else if (selectedCategory === 'Analgesics') {
        matchesCategory = medCat.includes('analgesic') || medCat.includes('pain')
      } else if (selectedCategory === 'IV Fluids') {
        matchesCategory = medCat.includes('fluid') || medCat.includes('infusion') || medCat.includes('iv')
      } else {
        matchesCategory = medCat.includes(selectedCategory.toLowerCase())
      }
    }

    return matchesSearch && matchesCategory
  })

  // Handle patient select from existing database
  const handleSelectExistingPatient = (uhid) => {
    const pat = patients.find(p => p.uhid === uhid)
    if (pat) {
      setCartCustomer({
        name: pat.name,
        phone: pat.phone || '',
        doctor: pat.doctor_name || 'Dr. On-Duty Medical Officer',
        uhid: pat.uhid
      })
      setPatientValidationError('')
    }
  }

  // Handle Checkout
  const handleCheckout = async () => {
    setFormSubmitted(true)
    if (cart.length === 0) return

    const pName = (cartCustomer?.name || '').trim()
    const pPhone = (cartCustomer?.phone || '').trim()

    if (!pName && !pPhone) {
      setPatientValidationError('Both Patient Full Name and Mobile Number are required before generating the invoice.')
      return
    }

    if (!pName) {
      setPatientValidationError('Patient Full Name is mandatory before generating the invoice.')
      return
    }

    if (!pPhone) {
      setPatientValidationError('Patient Mobile Number is mandatory before generating the invoice.')
      return
    }

    setPatientValidationError('')

    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch (e) {}

    const saleResult = await completeSale(paymentMode, customNotes)
    if (saleResult) {
      setFormSubmitted(false)
      setPatientValidationError('')
      setActivePosView('catalog')
    }
  }

  // History filtering
  const todayStr = getTodayDateKey()
  const yesterdayStr = getYesterdayDateKey()

  const sevenDaysAgoDate = new Date()
  sevenDaysAgoDate.setDate(sevenDaysAgoDate.getDate() - 7)
  const sevenDaysAgoStr = getLocalDateKey(sevenDaysAgoDate)

  const filteredHistorySales = sales.filter(s => {
    const saleDateStr = getLocalDateKey(s.created_at)

    let matchesDate = true
    if (historyDateFilter === 'TODAY') {
      matchesDate = saleDateStr === todayStr
    } else if (historyDateFilter === 'YESTERDAY') {
      matchesDate = saleDateStr === yesterdayStr
    } else if (historyDateFilter === '7DAYS') {
      matchesDate = saleDateStr >= sevenDaysAgoStr
    } else if (historyDateFilter === 'CUSTOM') {
      if (historyCustomStart && saleDateStr < historyCustomStart) matchesDate = false
      if (historyCustomEnd && saleDateStr > historyCustomEnd) matchesDate = false
    }

    const matchesSearch =
      s.invoice_number?.toLowerCase().includes(historySearch.toLowerCase()) ||
      s.customer_name?.toLowerCase().includes(historySearch.toLowerCase()) ||
      (s.customer_phone && s.customer_phone.includes(historySearch)) ||
      (s.doctor_name && s.doctor_name.toLowerCase().includes(historySearch.toLowerCase()))

    return matchesDate && matchesSearch
  })

  // Group history by Day (correct YYYY-MM-DD grouping)
  const historyByDay = filteredHistorySales.reduce((acc, sale) => {
    const dateKey = getLocalDateKey(sale.created_at)
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        bills: [],
        totalRevenue: 0,
        upi: 0,
        cash: 0
      }
    }
    acc[dateKey].bills.push(sale)
    acc[dateKey].totalRevenue += (sale.grand_total || 0)
    if (sale.payment_mode === 'UPI') acc[dateKey].upi += (sale.grand_total || 0)
    else if (sale.payment_mode === 'Cash') acc[dateKey].cash += (sale.grand_total || 0)
    return acc
  }, {})

  const sortedHistoryDays = Object.keys(historyByDay).sort((a, b) => b.localeCompare(a))
  const totalHistoryRev = filteredHistorySales.reduce((acc, s) => acc + (s.grand_total || 0), 0)

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Top Bar with View Selector & Active Store Identifier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4 text-teal-700" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900">Billing Terminal</span>
              <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border shadow-2xs ${
                effectiveStore === 'RHTC'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-teal-50 text-teal-800 border-teal-300'
              }`}>
                {effectiveStore === 'RHTC' ? '🌿 RHTC Rural Station' : '🏥 UHTC Urban Station'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Generating clinical invoice for {effectiveStore === 'RHTC' ? 'Rural Health Training Centre' : 'Urban Health Training Centre'}
            </p>
          </div>
        </div>

        {/* View Switcher Navigation Bar */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActivePosView('catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePosView === 'catalog'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Medicines Catalog
          </button>

          <button
            onClick={() => setActivePosView('checkout')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center gap-1.5 cursor-pointer ${
            activePosView === 'checkout'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>2. Active Bill / Pay</span>
          {cart.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
              activePosView === 'checkout' ? 'bg-white text-teal-800' : 'bg-rose-500 text-white'
            }`}>
              {cart.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActivePosView('history')}
          className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative flex items-center justify-center gap-1.5 cursor-pointer ${
            activePosView === 'history'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>3. Billing History ({sales.length})</span>
        </button>
      </div>
      </div>

      {/* VIEW 1 & 2: CATALOG & CHECKOUT SPLIT (Desktop side-by-side, mobile tabbed) */}
      {activePosView !== 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Product Catalog (7 Cols on desktop) */}
          <div className={`lg:col-span-7 space-y-4 ${activePosView === 'checkout' ? 'hidden lg:block' : 'block'}`}>
            
            {/* Search & Fast Category Chips */}
            <div className="clinical-card p-4 rounded-2xl space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicine or generic salt for billing..."
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
                />
              </div>

              {/* Category Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Medicines Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[calc(100vh-19rem)] overflow-y-auto pr-1">
              {filteredMedicines.length === 0 ? (
                (() => {
                  const isSearchActive = Boolean(searchQuery.trim())
                  const isCategoryFilter = selectedCategory !== 'ALL'

                  let icon = <Pill className="w-10 h-10 text-teal-600" />
                  let title = 'Dispensary Stock is Empty'
                  let description = 'No medicines currently available in dispensary stock. Please add your verified medicine stocks or upload an invoice PDF to start billing.'
                  let badgeText = 'Formulary Empty'
                  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-300'
                  let iconBg = 'bg-teal-50 border-teal-200 text-teal-600'
                  let actionCategory = 'Antibiotics'

                  if (isSearchActive) {
                    icon = <SearchX className="w-10 h-10 text-amber-600" />
                    title = `No Medicines Matching "${searchQuery}"`
                    description = `No formulary item found matching "${searchQuery}". Check the spelling, try generic formula names, or add this new medicine.`
                    badgeText = 'Search Filter Active'
                    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300'
                    iconBg = 'bg-amber-50 border-amber-200 text-amber-600'
                  } else if (isCategoryFilter) {
                    if (selectedCategory === 'Cardiac') {
                      icon = <HeartPulse className="w-10 h-10 text-rose-600" />
                      title = 'No Cardiac Care Medicines in Stock'
                      description = 'No medicines categorized under Cardiac / Cardiovascular are currently available. Click below to add Cardiac formulations (e.g. Atenolol, Amlodipine, Telmisartan).'
                      badgeText = '❤️ Cardiac Category'
                      badgeColor = 'bg-rose-100 text-rose-800 border-rose-300'
                      iconBg = 'bg-rose-50 border-rose-200 text-rose-600'
                      actionCategory = 'Cardiac & Cardiovascular'
                    } else if (selectedCategory === 'Diabetics') {
                      icon = <Activity className="w-10 h-10 text-sky-600" />
                      title = 'No Diabetic Care Medicines in Stock'
                      description = 'No medicines categorized under Diabetics / Antidiabetic are currently available. Click below to add Diabetic formulations (e.g. Metformin, Glimepiride, Insulin).'
                      badgeText = '🩸 Diabetics Category'
                      badgeColor = 'bg-sky-100 text-sky-800 border-sky-300'
                      iconBg = 'bg-sky-50 border-sky-200 text-sky-600'
                      actionCategory = 'Diabetics & Antidiabetic'
                    } else if (selectedCategory === 'Antibiotics') {
                      icon = <ShieldAlert className="w-10 h-10 text-emerald-600" />
                      title = 'No Antibiotics in Stock'
                      description = 'No antibiotic formulations currently in dispensary stock. Click below to inward antibiotics (e.g. Augmentin, Amoxicillin, Cefixime).'
                      badgeText = '🛡️ Antibiotics Category'
                      badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      iconBg = 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      actionCategory = 'Antibiotics'
                    } else if (selectedCategory === 'Analgesics') {
                      icon = <Pill className="w-10 h-10 text-amber-600" />
                      title = 'No Analgesics / Pain Relief in Stock'
                      description = 'No analgesic or antipyretic formulations available in stock. Click below to add pain relief medicines (e.g. Paracetamol, Ibuprofen).'
                      badgeText = '💊 Analgesics Category'
                      badgeColor = 'bg-amber-100 text-amber-800 border-amber-300'
                      iconBg = 'bg-amber-50 border-amber-200 text-amber-600'
                      actionCategory = 'Analgesics & Antipyretics'
                    } else if (selectedCategory === 'IV Fluids') {
                      icon = <Droplets className="w-10 h-10 text-cyan-600" />
                      title = 'No IV Fluids & Infusions in Stock'
                      description = 'No IV Fluids or infusion bottles (Normal Saline, RL, DNS) currently available in dispensary stock. Click below to inward IV fluids.'
                      badgeText = '💧 IV Fluids Category'
                      badgeColor = 'bg-cyan-100 text-cyan-800 border-cyan-300'
                      iconBg = 'bg-cyan-50 border-cyan-200 text-cyan-600'
                      actionCategory = 'IV Fluids & Infusions'
                    } else if (selectedCategory === 'Fast Movers') {
                      icon = <Sparkles className="w-10 h-10 text-purple-600" />
                      title = 'No Fast-Moving Medicines in Stock'
                      description = 'No fast-moving formulations recorded in dispensary stock yet. Add regular OPD medicines to begin billing.'
                      badgeText = '⚡ Fast Movers'
                      badgeColor = 'bg-purple-100 text-purple-800 border-purple-300'
                      iconBg = 'bg-purple-50 border-purple-200 text-purple-600'
                      actionCategory = 'General Formulary'
                    }
                  }

                  return (
                    <div className="col-span-full clinical-card p-6 sm:p-8 rounded-3xl text-center space-y-3.5 my-2 border-2 border-dashed border-slate-300/90 bg-gradient-to-b from-white to-slate-50 shadow-xs">
                      <div className={`w-16 h-16 rounded-2xl ${iconBg} border flex items-center justify-center mx-auto shadow-sm`}>
                        {icon}
                      </div>

                      <div className="space-y-1 max-w-md mx-auto">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black border ${badgeColor}`}>
                          {badgeText}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                          {title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          {description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        {onOpenMedicineModal && (
                          <button
                            type="button"
                            onClick={() => onOpenMedicineModal(actionCategory)}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add {isCategoryFilter ? selectedCategory : ''} Medicine</span>
                          </button>
                        )}

                        {(isCategoryFilter || isSearchActive) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory('ALL')
                              setSearchQuery('')
                            }}
                            className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3 text-slate-500" />
                            <span>Show All Stock</span>
                          </button>
                        )}

                        {onOpenPdfModal && (
                          <button
                            type="button"
                            onClick={onOpenPdfModal}
                            className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold px-3 py-2 rounded-xl text-xs border border-indigo-200 shadow-2xs transition-all cursor-pointer"
                          >
                            <FileUp className="w-3 h-3 text-indigo-600" />
                            <span>Upload PDF</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })()
              ) : (
                filteredMedicines.map((med) => {
                const medBatches = batches.filter(b => b.medicine_id === med.id && b.current_stock > 0)
                const totalStock = medBatches.reduce((acc, b) => acc + b.current_stock, 0)
                const bestBatch = medBatches[0]

                return (
                  <div
                    key={med.id}
                    className="clinical-card p-4 rounded-2xl flex flex-col justify-between gap-3 group hover:border-teal-400/80"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-teal-800 transition-colors">
                            {med.name}
                          </h4>
                          {(Number(med.default_discount_percent) > 0 || Number(med.discount_percent) > 0) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                              {med.default_discount_percent || med.discount_percent}% MO Pre-Approved Disc
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                          {med.dosage_form}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {med.generic_name}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                        <span>Shelf: <strong className="text-slate-700">{med.shelf_location || 'Bay 1'}</strong></span>
                        <span>Stock: <strong className={totalStock > 0 ? 'text-emerald-700' : 'text-rose-600'}>{totalStock}</strong></span>
                      </div>
                    </div>

                    {/* Batch selection & Add to Cart */}
                    {medBatches.length === 0 ? (
                      <div className="text-center py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
                        Out of Stock
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-500 text-[11px]">
                            Batch: {bestBatch.batch_number} (Exp: {bestBatch.expiry_date.slice(0, 7)})
                          </span>
                          <span className="font-black text-slate-900 text-sm">
                            ₹{(bestBatch.selling_price || bestBatch.mrp).toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={() => addToCart(med, bestBatch, 1)}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-800 hover:text-white text-xs font-extrabold border border-teal-200 hover:border-teal-600 transition-all active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add to Bill</span>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

            {/* Mobile Floating Cart Summary Button */}
            {cart.length > 0 && activePosView === 'catalog' && (
              <div className="lg:hidden sticky bottom-16 inset-x-0 z-30 pt-2">
                <button
                  onClick={() => setActivePosView('checkout')}
                  className="w-full py-3.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl shadow-xl flex items-center justify-between font-bold text-sm transition-transform active:scale-98 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white text-teal-800 font-mono font-black text-xs flex items-center justify-center">
                      {cart.length}
                    </div>
                    <span>View Bill & Checkout</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-base">₹{cartGrandTotal.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            )}

          </div>

          {/* Right Column: Active Billing Terminal & Checkout (5 Cols on desktop) */}
          <div className={`lg:col-span-5 space-y-4 ${activePosView === 'catalog' ? 'hidden lg:block' : 'block'}`}>
            
            {/* Patient / Customer Header Box */}
            <div className="clinical-card p-4 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Patient & Prescription Info</span>
                  <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    * Required
                  </span>
                </h3>
                {/* Quick patient selector */}
                <select
                  onChange={(e) => handleSelectExistingPatient(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-[11px] text-slate-700 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer font-medium"
                >
                  <option value="">-- Autofill Registered Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.uhid}>{p.name} {p.phone ? `(${p.phone})` : ''} [{p.uhid}]</option>
                  ))}
                </select>
              </div>

              {/* Patient Validation Error Alert */}
              {patientValidationError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 font-bold animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{patientValidationError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-700 font-bold">
                      Patient Full Name <span className="text-rose-500 font-black">*</span>
                    </label>
                    {(!cartCustomer.name || !cartCustomer.name.trim()) && (
                      <span className="text-[9px] text-rose-600 font-mono font-bold">Mandatory</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={cartCustomer.name}
                    onChange={(e) => {
                      setCartCustomer({ ...cartCustomer, name: e.target.value })
                      if (patientValidationError) setPatientValidationError('')
                    }}
                    placeholder="Enter patient full name..."
                    required
                    className={`w-full rounded-lg px-2.5 py-2 text-slate-900 outline-none transition-all font-medium ${
                      formSubmitted && !cartCustomer.name?.trim()
                        ? 'border-2 border-rose-500 bg-rose-50/50 ring-2 ring-rose-200'
                        : 'bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-700 font-bold">
                      Phone Number <span className="text-rose-500 font-black">*</span>
                    </label>
                    {(!cartCustomer.phone || !cartCustomer.phone.trim()) && (
                      <span className="text-[9px] text-rose-600 font-mono font-bold">Mandatory</span>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={cartCustomer.phone}
                    onChange={(e) => {
                      setCartCustomer({ ...cartCustomer, phone: e.target.value })
                      if (patientValidationError) setPatientValidationError('')
                    }}
                    placeholder="Enter 10-digit phone number..."
                    required
                    className={`w-full rounded-lg px-2.5 py-2 text-slate-900 outline-none transition-all font-medium ${
                      formSubmitted && !cartCustomer.phone?.trim()
                        ? 'border-2 border-rose-500 bg-rose-50/50 ring-2 ring-rose-200'
                        : 'bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Prescribing Doctor / OPD Department</label>
                <input
                  type="text"
                  value={cartCustomer.doctor}
                  onChange={(e) => setCartCustomer({ ...cartCustomer, doctor: e.target.value })}
                  placeholder="Dr. Name / Hospital Department"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 font-medium"
                />
              </div>

              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 pt-0.5 border-t border-slate-100">
                <Users className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Patient record & invoices will be automatically recorded in the <strong>{effectiveStore} Patients Directory</strong>.</span>
              </div>
            </div>

            {/* Cart Line Items Box */}
            <div className="clinical-card p-4 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">Active Prescription Items</h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No items in current bill. Add medicines to proceed.
                    <div className="mt-3 lg:hidden">
                      <button
                        onClick={() => setActivePosView('catalog')}
                        className="px-4 py-2 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold"
                      >
                        Browse Medicine Catalog
                      </button>
                    </div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.batch_id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 gap-2 sm:gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="font-extrabold text-xs text-slate-900 truncate">{item.medicine_name}</h5>
                          {item.discount_percent > 0 && (
                            isOverallDiscountActive ? (
                              <span
                                className="bg-amber-100 text-amber-800 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-amber-300"
                                title={`Individual ${item.discount_percent}% discount is paused because overall bill discount (${discountPercent}%) is active`}
                              >
                                {item.discount_percent}% Indiv. (Paused)
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded border border-emerald-300">
                                -{item.discount_percent}% Indiv. Active
                              </span>
                            )
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 sm:gap-2">
                          <span>Batch: {item.batch_number}</span>
                          <span>• ₹{item.unit_price}</span>
                          {item.discount_percent > 0 && !isOverallDiscountActive && (
                            <span className="text-emerald-700 font-bold">
                              (Net: ₹{(item.unit_price * (1 - item.discount_percent / 100)).toFixed(2)})
                            </span>
                          )}
                          {item.discount_percent > 0 && isOverallDiscountActive && (
                            <span className="text-amber-700 font-medium">
                              (Overall {discountPercent}% applies to bill)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-1 shadow-2xs">
                        <button
                          onClick={() => updateCartQty(item.batch_id, item.quantity - 1)}
                          className="p-1 hover:text-teal-700 text-slate-500 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-900 px-1.5">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.batch_id, item.quantity + 1)}
                          className="p-1 hover:text-teal-700 text-slate-500 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right shrink-0 w-16">
                        <div className="font-mono font-extrabold text-xs text-slate-900">
                          ₹{item.total_price.toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.batch_id)}
                          className="text-[10px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Math & Billing Summary */}
              {cart.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                  
                  {/* Role-Aware Clinical Discount Control */}
                  <div className="space-y-2">
                    {currentUser?.role === 'pharmacist' ? (
                      /* Pharmacist View: Locked from manual alteration, reflects pre-approved discount */
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 font-bold flex items-center gap-1.5 text-xs">
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            Pre-Authorized Overall Bill Discount
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-lg font-mono font-black text-xs border ${
                            discountPercent > 0 
                              ? 'bg-teal-100 text-teal-900 border-teal-300' 
                              : 'bg-slate-200 text-slate-700 border-slate-300'
                          }`}>
                            {discountPercent}%
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span>
                              {discountPercent > 0 ? (
                                <>Authorized by: <strong className="text-slate-700">{preApprovedDiscount?.appliedBy || 'Medical Officer (MO)'}</strong></>
                              ) : (
                                <span className="text-slate-600 font-medium">Standard Bill Rate (No Overall Discount Set)</span>
                              )}
                            </span>
                            <span className="text-amber-700 font-bold font-mono">🔒 Locked (Dispensary)</span>
                          </div>
                          {discountPercent > 0 ? (
                            <div className="text-amber-800 font-semibold bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/80">
                              ⏸️ Overall bill discount ({discountPercent}%) active. Individual medicine discounts paused.
                            </div>
                          ) : (
                            <div className="text-emerald-700 font-semibold">
                              ✅ Individual medicine discounts are active.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : isReadOnly ? (
                      /* Supervisor Viewer View */
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                          Overall Discount Applied:
                        </span>
                        <span className="font-mono font-bold">{discountPercent}%</span>
                      </div>
                    ) : (
                      /* MO Doctor & Super Admin View: Full Control to Apply & Authorize Overall Bill Discounts */
                      <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-teal-950 font-bold flex items-center gap-1.5 text-xs">
                            <Percent className="w-3.5 h-3.5 text-teal-700" />
                            {currentUser?.role === 'doctor_mo' ? "Doctor's Overall Bill Discount Authority" : "Admin Overall Bill Discount"}
                          </span>
                          <span className="font-mono font-black text-xs text-teal-900 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
                            {discountPercent}%
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {[0, 5, 10, 15, 20, 25].map((d) => (
                            <button
                              key={d}
                              onClick={() => {
                                setDiscountPercent(d)
                                updatePreApprovedDiscount(d, d > 0 ? 'Clinical Pack Authorized' : 'Standard Bill Rate (No Discount)')
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                                discountPercent === d
                                  ? 'bg-teal-700 text-white shadow-xs'
                                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {d === 0 ? '0% (Standard)' : `${d}%`}
                            </button>
                          ))}

                          {/* Complete Pack Discount Shortcut */}
                          <button
                            type="button"
                            onClick={() => {
                              const packVal = 15
                              setDiscountPercent(packVal)
                              updatePreApprovedDiscount(packVal, "Doctor's Complete Pack Medicine Discount")
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-xs cursor-pointer"
                            title="Apply standard 15% complete package discount and sync to dispensary"
                          >
                            + Complete Pack (15%)
                          </button>
                        </div>

                        <div className="text-[10px] text-teal-900/90 flex flex-col gap-1 pt-1 border-t border-teal-200/60">
                          <div className="flex items-center justify-between">
                            <span>
                              {discountPercent > 0
                                ? '⏸️ Overall discount active — Individual discounts paused'
                                : '▶️ Overall discount 0% — Individual discounts active'}
                            </span>
                            <button
                              type="button"
                              onClick={() => updatePreApprovedDiscount(discountPercent, 'Clinical Pack Authorized')}
                              className="text-teal-800 font-bold hover:underline cursor-pointer"
                            >
                              Push to Pharmacist ➔
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between text-slate-600 font-mono">
                    <span>Items Subtotal:</span>
                    <span>₹{cartSubtotal.toFixed(2)}</span>
                  </div>

                  {cartDiscountAmount > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-emerald-700 font-mono font-bold">
                        <span>
                          {isOverallDiscountActive
                            ? `Overall Bill Discount (${discountPercent}%):`
                            : 'Individual Medicine Discounts:'}
                        </span>
                        <span>-₹{cartDiscountAmount.toFixed(2)}</span>
                      </div>
                      {isOverallDiscountActive && cartItemDiscountTotal > 0 && (
                        <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                          ⏸️ Overall {discountPercent}% bill discount active. Individual medicine discounts paused.
                        </div>
                      )}
                    </div>
                  )}

                  {/* GST Activation / Stop GST Toggle */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                        <span className={`w-2 h-2 rounded-full ${isGstActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span>GST in Bill: {isGstActive ? 'Active' : 'Stopped (0% Exempt)'}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {isGstActive ? 'Standard GST applied to taxable items' : 'Non-tax bill / GST exempt patient'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setIsGstActive(true)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          isGstActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        + Add GST
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsGstActive(false)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                          !isGstActive
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        Stop GST (0%)
                      </button>
                    </div>
                  </div>

                  {/* GST Line Item */}
                  <div className="flex justify-between text-slate-600 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span>GST (CGST + SGST):</span>
                      {!isGstActive && (
                        <span className="text-[9px] font-sans font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          Stopped / Exempt
                        </span>
                      )}
                    </span>
                    <span className={isGstActive ? 'text-slate-800 font-bold' : 'text-slate-400 line-through'}>
                      {isGstActive ? `+₹${cartTaxAmount.toFixed(2)}` : '₹0.00'}
                    </span>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="font-black text-sm text-slate-900 uppercase tracking-wider">Net Payable</span>
                    <span className="font-mono font-black text-2xl text-teal-800">
                      ₹{cartGrandTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="pt-2">
                    <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1.5">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                        { id: 'Cash', label: 'Cash', icon: Banknote },
                        { id: 'Card', label: 'Card', icon: CreditCard },
                        { id: 'Hospital', label: 'Credit', icon: Building }
                      ].map((m) => {
                        const Icon = m.icon
                        const isSelected = paymentMode === m.id
                        return (
                          <button
                            key={m.id}
                            onClick={() => setPaymentMode(m.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <Icon className="w-4 h-4 mb-1 text-teal-600" />
                            <span>{m.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Checkout Button */}
                  {isReadOnly ? (
                    <div className="w-full mt-3 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4 text-amber-600" />
                      <span>Supervisor Audit Mode: Billing Execution Disabled</span>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-3">
                      {(!cartCustomer.name?.trim() || !cartCustomer.phone?.trim()) && (
                        <div className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-center flex items-center justify-center gap-1.5 shadow-2xs">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Patient Full Name & Phone Number are mandatory to generate bill</span>
                        </div>
                      )}
                      <button
                        onClick={handleCheckout}
                        className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          (!cartCustomer.name?.trim() || !cartCustomer.phone?.trim())
                            ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-md shadow-rose-700/20 active:scale-98'
                            : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white shadow-md shadow-teal-700/20 active:scale-98'
                        }`}
                      >
                        <Printer className="w-4 h-4" />
                        <span>Process & Print Invoice (₹{cartGrandTotal.toFixed(2)})</span>
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* VIEW 3: COMPLETE BILLING HISTORY & DAY-WISE SALES LOGS */}
      {activePosView === 'history' && (
        <div className="space-y-4">
          
          {/* History Filters & Search */}
          <div className="clinical-card p-4 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-teal-600" />
                  Day-Wise Billing History & Cash Logs
                </h3>
                <p className="text-xs text-slate-500">
                  Search, filter, and reprint past invoices generated at the dispensary desk
                </p>
              </div>

              {/* Quick Summary Pill */}
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-xl font-mono text-xs">
                <span className="text-slate-600 font-semibold">{filteredHistorySales.length} Invoices</span>
                <span className="text-slate-300">|</span>
                <span className="font-black text-teal-900">₹{totalHistoryRev.toFixed(2)}</span>
              </div>
            </div>

            {/* Date Filters */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { id: 'ALL', label: 'All History' },
                { id: 'TODAY', label: "Today's Bills" },
                { id: 'YESTERDAY', label: 'Yesterday' },
                { id: '7DAYS', label: 'Last 7 Days' },
                { id: 'CUSTOM', label: 'Custom Date' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setHistoryDateFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    historyDateFilter === f.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Custom Date Pickers */}
            {historyDateFilter === 'CUSTOM' && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-bold">From:</span>
                  <input
                    type="date"
                    value={historyCustomStart}
                    onChange={(e) => setHistoryCustomStart(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-bold">To:</span>
                  <input
                    type="date"
                    value={historyCustomEnd}
                    onChange={(e) => setHistoryCustomEnd(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* Search Input */}
            <div className="relative pt-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search invoice number (RVS-INV-...), patient name, phone, doctor..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600 font-medium shadow-2xs"
              />
            </div>
          </div>

          {/* Grouped Day-by-Day Invoices List */}
          <div className="space-y-3">
            {sortedHistoryDays.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No invoices found matching the selected filter.
              </div>
            ) : (
              sortedHistoryDays.map((dateKey) => {
                const dayData = historyByDay[dateKey]
                const isToday = dateKey === todayStr
                const isYesterday = dateKey === yesterdayStr
                const isExpanded = historyExpandedDay === dateKey || sortedHistoryDays.length === 1
                const displayDateStr = formatDisplayDate(dateKey)

                return (
                  <div
                    key={dateKey}
                    className="clinical-card rounded-2xl overflow-hidden shadow-xs transition-all"
                  >
                    {/* Day Summary Header */}
                    <div
                      onClick={() => setHistoryExpandedDay(isExpanded ? null : dateKey)}
                      className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                        isToday ? 'bg-teal-50/40 hover:bg-teal-50' : isYesterday ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'bg-slate-50 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${
                          isToday ? 'bg-teal-600 text-white border-teal-700' : isYesterday ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-slate-700 border-slate-200'
                        }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">
                              {displayDateStr}
                            </span>
                            {isToday && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.2 rounded-full font-mono">
                                TODAY
                              </span>
                            )}
                            {isYesterday && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.2 rounded-full font-mono">
                                YESTERDAY
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            <span>{dayData.bills.length} Invoices</span>
                            <span className="mx-1.5">•</span>
                            <span>UPI: ₹{dayData.upi.toFixed(0)}</span>
                            <span className="mx-1.5">•</span>
                            <span>Cash: ₹{dayData.cash.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-black text-sm sm:text-base text-teal-900 font-mono">
                            ₹{dayData.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">Day's Total</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Day Invoices */}
                    {isExpanded && (
                      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white space-y-2.5">
                        {dayData.bills.map((sale) => (
                          <div
                            key={sale.id}
                            className="p-3 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-300 hover:bg-teal-50/30 transition-all"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-xs text-teal-800">
                                  {sale.invoice_number}
                                </span>
                                <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded font-mono font-bold text-slate-700">
                                  {sale.payment_mode}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {formatDisplayTime(sale.created_at)}
                                </span>
                              </div>

                              <div className="text-xs text-slate-700 font-medium">
                                <span>Patient: <strong className="text-slate-900 font-bold">{sale.customer_name}</strong></span>
                                {sale.customer_phone && <span className="text-slate-500 ml-2">({sale.customer_phone})</span>}
                                {sale.doctor_name && <span className="text-slate-500 ml-2">• Dr: {sale.doctor_name}</span>}
                              </div>

                              {sale.items && sale.items.length > 0 && (
                                <div className="text-[11px] text-slate-500 truncate font-mono">
                                  Items: {sale.items.map(i => `${i.medicine_name} (${i.quantity})`).join(', ')}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 shrink-0">
                              <div className="text-right">
                                <div className="font-mono font-black text-sm sm:text-base text-slate-950">
                                  ₹{sale.grand_total.toFixed(2)}
                                </div>
                                <div className="text-[10px] text-emerald-700 font-bold">Paid</div>
                              </div>

                              <button
                                onClick={() => setActiveInvoice(sale)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print Receipt</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

        </div>
      )}

    </div>
  )
}
