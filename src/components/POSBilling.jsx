import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import confetti from 'canvas-confetti'
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
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
  FileText
} from 'lucide-react'

export const POSBilling = () => {
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
    cartTaxAmount,
    cartGrandTotal,
    completeSale,
    setActiveInvoice
  } = useApp()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [paymentMode, setPaymentMode] = useState('UPI')
  const [customNotes, setCustomNotes] = useState('')

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
      if (selectedCategory === 'Fast Movers') {
        matchesCategory = med.category.includes('Analgesics') || med.category.includes('Antibiotics')
      } else {
        matchesCategory = med.category.toLowerCase().includes(selectedCategory.toLowerCase())
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
    }
  }

  // Handle Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return

    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch (e) {}

    await completeSale(paymentMode, customNotes)
    setActivePosView('catalog')
  }

  // History filtering
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const filteredHistorySales = sales.filter(s => {
    const saleDateStr = s.created_at ? s.created_at.split('T')[0] : todayStr
    const saleDate = new Date(s.created_at || Date.now())

    let matchesDate = true
    if (historyDateFilter === 'TODAY') {
      matchesDate = saleDateStr === todayStr
    } else if (historyDateFilter === 'YESTERDAY') {
      matchesDate = saleDateStr === yesterdayStr
    } else if (historyDateFilter === '7DAYS') {
      matchesDate = saleDate >= sevenDaysAgo
    } else if (historyDateFilter === 'CUSTOM') {
      if (historyCustomStart && saleDateStr < historyCustomStart) matchesDate = false
      if (historyCustomEnd && saleDateStr > historyCustomEnd) matchesDate = false
    }

    const matchesSearch =
      s.invoice_number.toLowerCase().includes(historySearch.toLowerCase()) ||
      s.customer_name.toLowerCase().includes(historySearch.toLowerCase()) ||
      (s.customer_phone && s.customer_phone.includes(historySearch)) ||
      (s.doctor_name && s.doctor_name.toLowerCase().includes(historySearch.toLowerCase()))

    return matchesDate && matchesSearch
  })

  // Group history by Day
  const historyByDay = filteredHistorySales.reduce((acc, sale) => {
    const dateKey = sale.created_at ? sale.created_at.split('T')[0] : todayStr
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

  const sortedHistoryDays = Object.keys(historyByDay).sort((a, b) => new Date(b) - new Date(a))
  const totalHistoryRev = filteredHistorySales.reduce((acc, s) => acc + (s.grand_total || 0), 0)

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Top View Selector Navigation Bar */}
      <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActivePosView('catalog')}
          className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activePosView === 'catalog'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Medicines Catalog
        </button>

        <button
          onClick={() => setActivePosView('checkout')}
          className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative flex items-center justify-center gap-1.5 cursor-pointer ${
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
              {filteredMedicines.map((med) => {
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
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-teal-800 transition-colors">
                          {med.name}
                        </h4>
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
              })}
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
                  Patient & Prescription Info
                </h3>
                {/* Quick patient selector */}
                <select
                  onChange={(e) => handleSelectExistingPatient(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-[11px] text-slate-700 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer font-medium"
                >
                  <option value="">-- Autofill Registered Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.uhid}>{p.name} ({p.uhid})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">Patient Name</label>
                  <input
                    type="text"
                    value={cartCustomer.name}
                    onChange={(e) => setCartCustomer({ ...cartCustomer, name: e.target.value })}
                    placeholder="Walk-in Patient"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 outline-none focus:border-teal-600 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">Phone Number</label>
                  <input
                    type="text"
                    value={cartCustomer.phone}
                    onChange={(e) => setCartCustomer({ ...cartCustomer, phone: e.target.value })}
                    placeholder="+91 98..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 outline-none focus:border-teal-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold">Prescribing Doctor / OPD</label>
                <input
                  type="text"
                  value={cartCustomer.doctor}
                  onChange={(e) => setCartCustomer({ ...cartCustomer, doctor: e.target.value })}
                  placeholder="Dr. Name / Hospital Department"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 outline-none focus:border-teal-600 font-medium"
                />
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
                        <h5 className="font-extrabold text-xs text-slate-900 truncate">{item.medicine_name}</h5>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 sm:gap-2">
                          <span>Batch: {item.batch_number}</span>
                          <span>• ₹{item.unit_price}</span>
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
                  
                  {/* Discount Selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-teal-600" />
                      Clinical Discount
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[0, 5, 10, 15].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDiscountPercent(d)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                            discountPercent === d
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {d}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between text-slate-600 font-mono">
                    <span>Items Subtotal:</span>
                    <span>₹{cartSubtotal.toFixed(2)}</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-700 font-mono font-bold">
                      <span>Discount ({discountPercent}%):</span>
                      <span>-₹{cartDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* GST */}
                  <div className="flex justify-between text-slate-600 font-mono">
                    <span>GST (CGST + SGST):</span>
                    <span>+₹{cartTaxAmount.toFixed(2)}</span>
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
                  <button
                    onClick={handleCheckout}
                    className="w-full mt-3 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-black text-sm uppercase tracking-wider shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Process & Print Invoice (₹{cartGrandTotal.toFixed(2)})</span>
                  </button>

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
                const dateObj = new Date(dateKey + 'T00:00:00')
                const isToday = dateKey === todayStr
                const isExpanded = historyExpandedDay === dateKey || sortedHistoryDays.length === 1

                return (
                  <div
                    key={dateKey}
                    className="clinical-card rounded-2xl overflow-hidden shadow-xs transition-all"
                  >
                    {/* Day Summary Header */}
                    <div
                      onClick={() => setHistoryExpandedDay(isExpanded ? null : dateKey)}
                      className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                        isToday ? 'bg-teal-50/40 hover:bg-teal-50' : 'bg-slate-50 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${
                          isToday ? 'bg-teal-600 text-white border-teal-700' : 'bg-white text-slate-700 border-slate-200'
                        }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">
                              {dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            {isToday && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.2 rounded-full font-mono">
                                TODAY
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
                                  {new Date(sale.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
