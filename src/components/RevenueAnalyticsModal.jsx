import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  X,
  TrendingUp,
  Calendar,
  DollarSign,
  Receipt,
  CreditCard,
  QrCode,
  Banknote,
  Building,
  Printer,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  ArrowUpRight,
  FileText
} from 'lucide-react'

export const RevenueAnalyticsModal = ({ isOpen, onClose }) => {
  const { sales, setActiveInvoice } = useApp()

  const [dateFilter, setDateFilter] = useState('ALL')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedDate, setExpandedDate] = useState(null)

  if (!isOpen) return null

  // Date ranges calculation
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Filter sales based on selected range & search
  const filteredSales = sales.filter(s => {
    const saleDateStr = s.created_at ? s.created_at.split('T')[0] : todayStr
    const saleDate = new Date(s.created_at || Date.now())

    let matchesDate = true
    if (dateFilter === 'TODAY') {
      matchesDate = saleDateStr === todayStr
    } else if (dateFilter === 'YESTERDAY') {
      matchesDate = saleDateStr === yesterdayStr
    } else if (dateFilter === '7DAYS') {
      matchesDate = saleDate >= sevenDaysAgo
    } else if (dateFilter === '30DAYS') {
      matchesDate = saleDate >= thirtyDaysAgo
    } else if (dateFilter === 'CUSTOM') {
      if (customStartDate && saleDateStr < customStartDate) matchesDate = false
      if (customEndDate && saleDateStr > customEndDate) matchesDate = false
    }

    const matchesSearch =
      s.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.customer_phone && s.customer_phone.includes(searchQuery)) ||
      (s.doctor_name && s.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesDate && matchesSearch
  })

  // Group filtered sales by Day (Date string: YYYY-MM-DD)
  const salesByDay = filteredSales.reduce((acc, sale) => {
    const dateKey = sale.created_at ? sale.created_at.split('T')[0] : todayStr
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        bills: [],
        totalRevenue: 0,
        upiTotal: 0,
        cashTotal: 0,
        cardTotal: 0,
        creditTotal: 0
      }
    }

    acc[dateKey].bills.push(sale)
    acc[dateKey].totalRevenue += (sale.grand_total || 0)

    if (sale.payment_mode === 'UPI') acc[dateKey].upiTotal += (sale.grand_total || 0)
    else if (sale.payment_mode === 'Cash') acc[dateKey].cashTotal += (sale.grand_total || 0)
    else if (sale.payment_mode === 'Card') acc[dateKey].cardTotal += (sale.grand_total || 0)
    else acc[dateKey].creditTotal += (sale.grand_total || 0)

    return acc
  }, {})

  // Sort dates descending (newest first)
  const sortedDayKeys = Object.keys(salesByDay).sort((a, b) => new Date(b) - new Date(a))

  // Summary Metrics
  const totalPeriodRevenue = filteredSales.reduce((acc, s) => acc + (s.grand_total || 0), 0)
  const totalPeriodBills = filteredSales.length
  const avgBillValue = totalPeriodBills > 0 ? (totalPeriodRevenue / totalPeriodBills) : 0

  const upiPeriod = filteredSales.filter(s => s.payment_mode === 'UPI').reduce((acc, s) => acc + (s.grand_total || 0), 0)
  const cashPeriod = filteredSales.filter(s => s.payment_mode === 'Cash').reduce((acc, s) => acc + (s.grand_total || 0), 0)
  const cardPeriod = filteredSales.filter(s => s.payment_mode === 'Card').reduce((acc, s) => acc + (s.grand_total || 0), 0)

  const toggleDay = (dateKey) => {
    setExpandedDate(expandedDate === dateKey ? null : dateKey)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-6 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-50 px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img src="/rvs-logo.png" alt="RVS Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Daily Revenue & Billing Analytics
                </h3>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full font-mono">
                  RVS Accounts
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Day-wise pharmacy revenue breakdown, transaction logs, and cash flow reports
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-200/70 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          
          {/* 4 Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-teal-50/60 border border-teal-200/80 p-3.5 rounded-2xl">
              <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Filtered Revenue</div>
              <div className="text-lg sm:text-xl font-black text-teal-950 font-mono mt-1">
                ₹{totalPeriodRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-teal-700 mt-0.5 font-medium">
                {sortedDayKeys.length} active billing day{sortedDayKeys.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Bills</div>
              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-1">
                {totalPeriodBills} <span className="text-xs font-bold text-slate-500">Invoices</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Avg: ₹{avgBillValue.toFixed(2)} / bill
              </div>
            </div>

            <div className="bg-cyan-50/60 border border-cyan-200/80 p-3.5 rounded-2xl">
              <div className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider">UPI / QR Collections</div>
              <div className="text-lg sm:text-xl font-black text-cyan-950 font-mono mt-1">
                ₹{upiPeriod.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-cyan-700 mt-0.5 font-medium">Digital Hospital Inward</div>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200/80 p-3.5 rounded-2xl">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Cash Collections</div>
              <div className="text-lg sm:text-xl font-black text-emerald-950 font-mono mt-1">
                ₹{cashPeriod.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">Dispensary Cash Drawer</div>
            </div>
          </div>

          {/* Date Range Filters & Search Bar */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'ALL', label: 'All History' },
                  { id: 'TODAY', label: "Today's Sales" },
                  { id: 'YESTERDAY', label: 'Yesterday' },
                  { id: '7DAYS', label: 'Last 7 Days' },
                  { id: '30DAYS', label: 'Last 30 Days' },
                  { id: 'CUSTOM', label: 'Custom Date Range' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDateFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                      dateFilter === f.id
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Live Count */}
              <span className="text-xs text-slate-500 font-mono font-semibold">
                Showing <strong className="text-slate-900 font-bold">{filteredSales.length}</strong> invoices
              </span>
            </div>

            {/* Custom Date Pickers (if CUSTOM selected) */}
            {dateFilter === 'CUSTOM' && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-bold">From:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-bold">To:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by invoice number, patient name, doctor, phone..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-teal-600 font-medium shadow-2xs"
              />
            </div>
          </div>

          {/* Day-Wise Breakdown Accordion / List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                Day-by-Day Revenue Breakdown
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                Click any day to view all invoice line items
              </span>
            </div>

            {sortedDayKeys.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-2xl">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No billing records found for this date filter.
              </div>
            ) : (
              sortedDayKeys.map((dateKey) => {
                const dayData = salesByDay[dateKey]
                const isExpanded = expandedDate === dateKey || sortedDayKeys.length === 1
                const dateObj = new Date(dateKey + 'T00:00:00')
                const isToday = dateKey === todayStr

                return (
                  <div
                    key={dateKey}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs transition-all"
                  >
                    {/* Day Summary Bar */}
                    <div
                      onClick={() => toggleDay(dateKey)}
                      className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                        isToday ? 'bg-teal-50/50 hover:bg-teal-50' : 'bg-slate-50/60 hover:bg-slate-100/80'
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
                            <span>{dayData.bills.length} Bill{dayData.bills.length !== 1 ? 's' : ''}</span>
                            <span className="mx-1.5">•</span>
                            <span>UPI: ₹{dayData.upiTotal.toFixed(0)}</span>
                            <span className="mx-1.5">•</span>
                            <span>Cash: ₹{dayData.cashTotal.toFixed(0)}</span>
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

                    {/* Day Invoices List (Expanded) */}
                    {isExpanded && (
                      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white space-y-2.5">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Invoices for {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>

                        <div className="space-y-2">
                          {dayData.bills.map((sale) => (
                            <div
                              key={sale.id}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-300 transition-colors"
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
                                  onClick={() => {
                                    setActiveInvoice(sale)
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>Receipt</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Real-time cloud synchronized with Supabase</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}
