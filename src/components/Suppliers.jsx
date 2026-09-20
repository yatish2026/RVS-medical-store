import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Truck,
  Plus,
  Phone,
  Mail,
  MapPin,
  FileSpreadsheet,
  Building,
  DollarSign
} from 'lucide-react'

export const Suppliers = ({ onOpenSupplierModal }) => {
  const { suppliers } = useApp()
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = suppliers.filter(s =>
    s.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.gstin && s.gstin.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalOutstanding = suppliers.reduce((acc, s) => acc + (s.balance_payable || 0), 0)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="clinical-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-600" />
            Suppliers & Vendor Purchasing Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pharmaceutical distributors, GST compliance details, and vendor payment balances.
          </p>
        </div>

        <button
          onClick={onOpenSupplierModal}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register New Supplier</span>
        </button>
      </div>

      {/* Summary Stat */}
      <div className="clinical-card p-4 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Building className="w-4 h-4 text-purple-600" />
          <span>Active Pharma Distributors: <strong className="text-slate-900 font-bold">{suppliers.length}</strong></span>
        </div>
        <div className="font-mono text-slate-500 font-bold">
          Total Outstanding Payable: <strong className="text-amber-700 font-black">₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sup) => (
          <div
            key={sup.id}
            className="clinical-card p-5 rounded-2xl flex flex-col justify-between gap-4 group hover:border-purple-300"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">{sup.company_name}</h4>
                  <p className="text-xs text-purple-700 font-bold mt-0.5">Contact: {sup.name}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
                  <Truck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2 mt-4 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{sup.phone}</span>
                </div>
                {sup.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.email}</span>
                  </div>
                )}
                {sup.gstin && (
                  <div className="flex items-center gap-2 font-mono text-[11px] text-teal-800 font-bold">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                    <span>GSTIN: {sup.gstin}</span>
                  </div>
                )}
                {sup.address && (
                  <div className="flex items-start gap-2 text-slate-500 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{sup.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-semibold">Payable Balance:</span>
              <span className="font-black text-amber-800 text-sm">
                ₹{(sup.balance_payable || 0).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
