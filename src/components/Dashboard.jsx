import React from 'react'
import { useApp } from '../context/AppContext'
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Hourglass,
  ShoppingCart,
  Plus,
  ArrowUpRight,
  Pill,
  Users,
  Building,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  DollarSign,
  ShieldAlert,
  Sparkles
} from 'lucide-react'

export const Dashboard = ({ onOpenMedicineModal, onOpenPatientModal, onOpenBatchModal }) => {
  const {
    medicines,
    batches,
    sales,
    patients,
    requisitions,
    lowStockItems,
    expiringBatches,
    expiredCount,
    criticalExpiryCount,
    totalSalesRevenue,
    totalStockCount,
    setActiveTab,
    setActiveInvoice
  } = useApp()

  // Today's sales
  const todayStr = new Date().toISOString().split('T')[0]
  const todaysSales = sales.filter(s => s.created_at && s.created_at.startsWith(todayStr))
  const todayRevenue = todaysSales.reduce((acc, s) => acc + (s.grand_total || 0), 0)

  // Critical & warning expiry items
  const criticalItems = expiringBatches.filter(b => b.status === 'expired' || b.status === 'critical')

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-700 p-6 sm:p-8 shadow-lg shadow-teal-900/10 text-white">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              RVS Hospital & Medical Center • Dispensary Terminal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pharmacy Operations & Real-Time Stock Hub
            </h1>
            <p className="text-teal-50 text-sm max-w-2xl leading-relaxed">
              Real-time monitoring of <strong className="text-white font-bold">{medicines.length} formulations</strong> across <strong className="text-white font-bold">{batches.length} active batches</strong> with automated expiry reminders and high-speed billing.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('pos')}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-teal-900 font-extrabold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-teal-700" />
              <span>Launch Billing</span>
            </button>
            <button
              onClick={onOpenMedicineModal}
              className="flex items-center gap-2 bg-teal-800/60 hover:bg-teal-800/90 text-white font-bold px-4 py-3 rounded-xl text-xs sm:text-sm border border-teal-500/40 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Add Medicine & Expiry</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Clinical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* KPI 1: Sales / Revenue */}
        <div className="clinical-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ₹{todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
              <span className="text-emerald-700 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {todaysSales.length} bills today
              </span>
              <span>• Total: ₹{totalSalesRevenue.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Inventory Stock */}
        <div className="clinical-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Formulary & Stock</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalStockCount.toLocaleString()} <span className="text-sm font-bold text-slate-500">units</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
              <span className="text-teal-700 font-bold">{medicines.length} Formulations</span>
              <span>• {batches.length} Batches</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Low Stock Alerts */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="clinical-card p-5 rounded-2xl cursor-pointer hover:border-amber-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Warnings</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
              {lowStockItems.length} <span className="text-sm font-bold text-slate-500">Items Low</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-700 font-semibold">
              <span>{lowStockItems.length > 0 ? 'Reorder needed from distributors' : 'Stock levels optimal'}</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Expiry Radar */}
        <div
          onClick={() => setActiveTab('expiry')}
          className="clinical-card p-5 rounded-2xl cursor-pointer hover:border-rose-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Alert Radar</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Hourglass className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
              {expiredCount + criticalExpiryCount} <span className="text-sm font-bold text-slate-500">Alerts</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-semibold">
              {expiredCount > 0 && <span className="text-rose-700 font-bold">{expiredCount} Expired</span>}
              <span className="text-amber-700">{criticalExpiryCount} Expiring &lt;30d</span>
            </div>
          </div>
        </div>

      </div>

      {/* Two-Column Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Low Stock & Expiring Medicines Action Center */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Urgent Expiry Radar Box */}
          <div className="clinical-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <Hourglass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Critical Expiry Timeline Radar</h3>
                  <p className="text-xs text-slate-500">Formulations requiring immediate disposal or clearance</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('expiry')}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1"
              >
                <span>View Full Radar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {criticalItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  No critical or expired medicines found. All stock is safe!
                </div>
              ) : (
                criticalItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">{item.medicineName}</span>
                        <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700 border border-slate-200">
                          Batch: {item.batch_number}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Shelf: <strong className="text-slate-700">{item.shelf || 'Main Bay'}</strong></span>
                        <span>• Current Stock: <strong className="text-teal-700">{item.current_stock} units</strong></span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border ${
                          item.status === 'expired'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {item.status === 'expired' ? 'EXPIRED' : `${item.daysLeft} Days Left`}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        Exp: {item.expiry_date}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Items Box */}
          <div className="clinical-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Low Stock Formulary Reorder List</h3>
                  <p className="text-xs text-slate-500">Medicines at or below threshold safety levels</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1"
              >
                <span>Formulary Table</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {lowStockItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  All medicines are well-stocked above minimum reserve thresholds.
                </div>
              ) : (
                lowStockItems.slice(0, 4).map((med) => {
                  const medBatches = batches.filter(b => b.medicine_id === med.id)
                  const currentTotal = medBatches.reduce((acc, b) => acc + b.current_stock, 0)

                  return (
                    <div key={med.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">{med.name}</span>
                          <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold border border-teal-200">
                            {med.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {med.generic_name} • <span className="text-slate-700">{med.shelf_location}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-bold text-amber-700 font-mono">
                            {currentTotal} / {med.min_stock_alert} min
                          </div>
                          <div className="text-[10px] text-slate-400">Threshold</div>
                        </div>
                        <button
                          onClick={() => {
                            if (onOpenBatchModal) onOpenBatchModal(med)
                          }}
                          className="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors"
                        >
                          + Inward Stock
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Recent Clinical Billing Invoices & Ward Activity */}
        <div className="space-y-6">
          
          {/* Recent Invoices Card */}
          <div className="clinical-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Recent Invoices</h3>
                  <p className="text-xs text-slate-500">Latest pharmacy transactions</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('pos')}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold"
              >
                + New Sale
              </button>
            </div>

            <div className="space-y-2.5">
              {sales.slice(0, 4).map((sale) => (
                <div
                  key={sale.id}
                  onClick={() => setActiveInvoice(sale)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-teal-800">{sale.invoice_number}</span>
                    <span className="font-extrabold text-xs text-slate-900">₹{sale.grand_total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate font-medium">{sale.customer_name}</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-mono font-bold">
                      {sale.payment_mode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hospital Department Drug Requisitions */}
          <div className="clinical-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Ward Emergency Feed</h3>
                  <p className="text-xs text-slate-500">ICU, ER & In-Patient Drug Issues</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('wards')}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2.5">
              {requisitions.slice(0, 3).map((req) => (
                <div key={req.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{req.department}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        req.priority === 'Emergency'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-teal-50 text-teal-700 border-teal-200'
                      }`}
                    >
                      {req.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{req.notes}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                    <span>Bed: {req.bed_no}</span>
                    <span className="text-teal-700 font-bold">{req.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
