import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Calendar,
  AlertCircle,
  FileText,
  Stethoscope,
  ChevronRight,
  Receipt,
  Printer,
  Clock,
  Pill,
  CreditCard,
  Banknote,
  QrCode,
  Building
} from 'lucide-react'

export const Patients = ({ onOpenPatientModal }) => {
  const { patients, sales, setActiveInvoice, isReadOnly, setActiveTab } = useApp()
  const [activeSubTab, setActiveSubTab] = useState('patients') // 'patients' or 'invoices'
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPatients = patients.filter(p =>
    (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.uhid && p.uhid.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.phone && p.phone.includes(searchQuery)) ||
    (p.doctor_name && p.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredSales = sales.filter(s =>
    (s.invoice_number && s.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.customer_name && s.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.customer_phone && s.customer_phone.includes(searchQuery)) ||
    (s.doctor_name && s.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const paymentIcons = {
    UPI: QrCode,
    Cash: Banknote,
    Card: CreditCard,
    Hospital: Building
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="clinical-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            Patient Directory & Prescription Invoices
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automatic hospital patient registry and prescription purchase histories linked directly from Dispensary Billing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <button
              onClick={onOpenPatientModal}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Register New Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs: Patients Directory vs Recent Invoices */}
      <div className="flex items-center justify-between border-b border-slate-200 gap-2 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('patients')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'patients'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Patients Directory ({patients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('invoices')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'invoices'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Recent Invoices & Prescriptions ({sales.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
          {activeSubTab === 'patients' ? `${filteredPatients.length} Patients Listed` : `${filteredSales.length} Invoices Recorded`}
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeSubTab === 'patients'
              ? "Search by Patient Name, UHID (e.g. UHID-2026-1001), Phone, or Doctor..."
              : "Search invoices by Invoice # (e.g. RVS-INV-2026-8954), Patient Name, Phone, or Doctor..."
          }
          className="w-full bg-white border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-xs font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* VIEW 1: PATIENTS DIRECTORY */}
      {activeSubTab === 'patients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.length === 0 ? (
            <div className="col-span-full clinical-card p-12 rounded-3xl text-center text-slate-500 border border-dashed border-slate-300 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="font-black text-slate-800 text-base">No Hospital Patients in Directory</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                When you bill patients in the <strong>Dispensary Billing Terminal</strong>, their names, phone numbers, and prescription histories automatically save here. You can also manually register patients below.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('pos')}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Go to Billing Terminal
                </button>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={onOpenPatientModal}
                    className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs cursor-pointer"
                  >
                    + Register Patient Manually
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredPatients.map((pat) => {
              const patientSales = sales.filter(s => s.patient_id === pat.id || s.customer_name === pat.name)
              const totalSpent = Number(pat.total_spent) || patientSales.reduce((acc, s) => acc + (s.grand_total || 0), 0)
              const visitCount = pat.visit_count || (patientSales.length > 0 ? patientSales.length : 1)
              const latestSale = patientSales[0]

              return (
                <div
                  key={pat.id}
                  className="clinical-card p-5 rounded-2xl flex flex-col justify-between gap-4 group hover:border-sky-300 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-black text-sm shadow-2xs">
                          {pat.name ? pat.name.slice(0, 2).toUpperCase() : 'PT'}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-base leading-tight">{pat.name}</h4>
                          <div className="text-xs text-sky-700 font-mono mt-0.5 font-bold">
                            {pat.uhid || 'UHID-NEW'}
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {visitCount} Visit{visitCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="text-slate-600 flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pat.phone && pat.phone !== 'N/A' ? pat.phone : 'Phone not provided'}</span>
                      </div>
                      <div className="text-slate-600 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Last Visit: {pat.last_visit ? new Date(pat.last_visit).toLocaleDateString() : 'Today'}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-start gap-1.5 text-slate-700 font-medium">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>Doctor: <strong className="text-slate-900">{pat.doctor_name || 'General Medical Officer'}</strong></span>
                      </div>
                      
                      {pat.recent_medicines && (
                        <div className="flex items-start gap-1.5 text-slate-600 font-medium bg-slate-50 p-2 rounded-xl border border-slate-200/80 mt-1">
                          <Pill className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-slate-700">
                            Prescription: <strong>{pat.recent_medicines}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Purchase stats & Invoices */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 font-mono font-semibold">Total Bills: </span>
                      <strong className="text-teal-800 font-mono font-black">{visitCount} (₹{totalSpent.toFixed(2)})</strong>
                    </div>

                    {latestSale ? (
                      <button
                        onClick={() => setActiveInvoice(latestSale)}
                        className="text-xs text-sky-700 hover:text-sky-900 flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <span>View Latest Bill ({latestSale.invoice_number})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : pat.last_invoice ? (
                      <span className="text-[11px] font-mono text-slate-500">
                        Inv: {pat.last_invoice}
                      </span>
                    ) : null}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* VIEW 2: RECENT INVOICES & PRESCRIPTIONS TABLE */}
      {activeSubTab === 'invoices' && (
        <div className="clinical-card rounded-2xl overflow-hidden shadow-xs">
          {filteredSales.length === 0 ? (
            <div className="p-12 text-center text-slate-500 border border-dashed border-slate-300 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
                <Receipt className="w-8 h-8" />
              </div>
              <h4 className="font-black text-slate-800 text-base">No Invoices Recorded Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No pharmacy sales have been generated yet. Go to the Billing Terminal to create your first prescription bill.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('pos')}
                className="mt-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Open Billing Terminal
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Invoice # & Date</th>
                    <th className="py-3.5 px-4">Patient Name & Phone</th>
                    <th className="py-3.5 px-4">Doctor / OPD</th>
                    <th className="py-3.5 px-4">Prescribed Medicines</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4 text-right">Net Amount</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((sale) => {
                    const PayIcon = paymentIcons[sale.payment_mode] || QrCode
                    const itemsSummary = Array.isArray(sale.items)
                      ? sale.items.map(i => `${i.medicine_name} (${i.quantity})`).join(', ')
                      : 'Prescription items'

                    return (
                      <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-extrabold text-teal-900 text-xs flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-teal-600" />
                            <span>{sale.invoice_number}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{sale.created_at ? new Date(sale.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Today'}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-xs">
                            {sale.customer_name || 'Walk-in Patient'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {sale.customer_phone && sale.customer_phone !== 'N/A' ? sale.customer_phone : 'Phone not provided'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-xs text-slate-700 font-medium">
                            {sale.doctor_name || 'General Medical Officer'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-xs text-slate-600 truncate font-medium" title={itemsSummary}>
                            {itemsSummary}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <PayIcon className="w-3 h-3 text-teal-600" />
                            <span>{sale.payment_mode || 'UPI'}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="font-mono font-black text-sm text-teal-800">
                            ₹{Number(sale.grand_total || 0).toFixed(2)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveInvoice(sale)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-teal-600" />
                            <span>View Invoice</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
