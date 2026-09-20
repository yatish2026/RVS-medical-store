import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Hourglass,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Truck,
  Trash2,
  Filter,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export const ExpiryTracker = () => {
  const {
    expiringBatches,
    updateBatch,
    notify
  } = useApp()

  const [activeFilter, setActiveFilter] = useState('ALL_ALERTS')

  // Categorized items
  const expiredItems = expiringBatches.filter(b => b.status === 'expired')
  const criticalItems = expiringBatches.filter(b => b.status === 'critical')
  const warningItems = expiringBatches.filter(b => b.status === 'warning')
  const noticeItems = expiringBatches.filter(b => b.status === 'notice')

  const displayedItems = expiringBatches.filter(item => {
    if (activeFilter === 'ALL_ALERTS') return item.status !== 'healthy'
    if (activeFilter === 'EXPIRED') return item.status === 'expired'
    if (activeFilter === 'CRITICAL_30') return item.status === 'critical'
    if (activeFilter === 'WARNING_60') return item.status === 'warning'
    if (activeFilter === 'NOTICE_90') return item.status === 'notice'
    return true
  })

  // Handle Return to Vendor / Quarantine
  const handleQuarantine = (batch) => {
    updateBatch(batch.id, { current_stock: 0 })
    notify('Batch Quarantined', `Batch ${batch.batch_number} (${batch.medicineName}) moved to quarantine / RTV ledger.`, 'warning')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="clinical-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Hourglass className="w-5 h-5 text-rose-600" />
            Expiry Date Monitoring & Drug Quarantine Radar
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated compliance scanner to detect expiring formulations before dispensary issuance.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-bold">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>NABH & Drug Safety Compliance Active</span>
        </div>
      </div>

      {/* 4-Tier Radar Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tier 1: Expired */}
        <div
          onClick={() => setActiveFilter('EXPIRED')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'EXPIRED'
              ? 'bg-rose-50 border-rose-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-rose-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-rose-700 uppercase tracking-wider">Expired Batches</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
          </div>
          <div className="mt-2 text-3xl font-black text-rose-700 font-mono">
            {expiredItems.length}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 font-semibold">
            Immediate Quarantine Needed
          </div>
        </div>

        {/* Tier 2: Critical <30 Days */}
        <div
          onClick={() => setActiveFilter('CRITICAL_30')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'CRITICAL_30'
              ? 'bg-amber-50 border-amber-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-amber-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">&le; 30 Days (Critical)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-3xl font-black text-amber-800 font-mono">
            {criticalItems.length}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 font-semibold">
            Expiring within 30 days
          </div>
        </div>

        {/* Tier 3: Warning <60 Days */}
        <div
          onClick={() => setActiveFilter('WARNING_60')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'WARNING_60'
              ? 'bg-yellow-50 border-yellow-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-yellow-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-yellow-800 uppercase tracking-wider">&le; 60 Days (Warning)</span>
            <Calendar className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="mt-2 text-3xl font-black text-yellow-800 font-mono">
            {warningItems.length}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 font-semibold">
            Fast-move clearance candidate
          </div>
        </div>

        {/* Tier 4: Notice <90 Days */}
        <div
          onClick={() => setActiveFilter('NOTICE_90')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            activeFilter === 'NOTICE_90'
              ? 'bg-cyan-50 border-cyan-400 shadow-xs'
              : 'bg-white border-slate-200 hover:border-cyan-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-cyan-800 uppercase tracking-wider">&le; 90 Days (Notice)</span>
            <Calendar className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="mt-2 text-3xl font-black text-cyan-800 font-mono">
            {noticeItems.length}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 font-semibold">
            Early awareness radar
          </div>
        </div>

      </div>

      {/* Filter Tabs & Table */}
      <div className="clinical-card rounded-2xl overflow-hidden shadow-xs">
        
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2">
            {[
              { id: 'ALL_ALERTS', label: 'All Alerts' },
              { id: 'EXPIRED', label: 'Expired Only' },
              { id: 'CRITICAL_30', label: '< 30 Days' },
              { id: 'WARNING_60', label: '< 60 Days' },
              { id: 'ALL', label: 'Show All Batches' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === f.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Showing <strong className="text-slate-900 font-bold">{displayedItems.length}</strong> batch items
          </span>
        </div>

        {/* Batches Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Medicine Name & Formulation</th>
                <th className="py-3.5 px-4">Batch Number</th>
                <th className="py-3.5 px-4">Shelf / Bay Location</th>
                <th className="py-3.5 px-4">Stock on Hand</th>
                <th className="py-3.5 px-4">Expiry Date & Timeline</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    No batches match this expiry risk filter. All remaining inventory is safe!
                  </td>
                </tr>
              ) : (
                displayedItems.map((batch) => {
                  const statusColors = {
                    expired: 'bg-rose-50 text-rose-700 border-rose-200',
                    critical: 'bg-amber-50 text-amber-800 border-amber-200',
                    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
                    notice: 'bg-cyan-50 text-cyan-800 border-cyan-200',
                    healthy: 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">{batch.medicineName}</div>
                        <div className="text-xs text-slate-500">{batch.genericName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Vendor: {batch.supplier_name || 'Direct'}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-teal-800">
                        {batch.batch_number}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-700 font-semibold font-mono">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-teal-600" />
                          <span>{batch.shelf || 'General Rack'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span className="font-black text-slate-900">{batch.current_stock}</span> pcs
                        <div className="text-[10px] text-slate-500">MRP: ₹{batch.mrp}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${statusColors[batch.status]}`}>
                            {batch.status === 'expired' ? 'EXPIRED' : `${batch.daysLeft} Days Left`}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          Date: {batch.expiry_date}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {batch.current_stock > 0 && (
                            <button
                              onClick={() => handleQuarantine(batch)}
                              className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Quarantine / RTV</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
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
