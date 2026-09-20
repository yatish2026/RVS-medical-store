import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Calendar,
  Heart,
  AlertCircle,
  FileText,
  Stethoscope,
  Activity,
  ChevronRight
} from 'lucide-react'

export const Patients = ({ onOpenPatientModal }) => {
  const { patients, sales, setActiveInvoice } = useApp()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.phone && p.phone.includes(searchQuery)) ||
    (p.doctor_name && p.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="clinical-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            Patient Directory & Clinical Medical Records
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage hospital patient profiles, UHID numbers, allergy flags, and pharmacy purchase histories.
          </p>
        </div>

        <button
          onClick={onOpenPatientModal}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Register New Patient</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Patient Name, UHID (e.g. RVS-PAT-1001), Phone, or Doctor..."
          className="w-full bg-white border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all shadow-xs font-medium"
        />
      </div>

      {/* Grid of Patients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPatients.map((pat) => {
          const patientSales = sales.filter(s => s.patient_id === pat.id || s.customer_name === pat.name)
          const totalSpent = patientSales.reduce((acc, s) => acc + (s.grand_total || 0), 0)

          return (
            <div
              key={pat.id}
              className="clinical-card p-5 rounded-2xl flex flex-col justify-between gap-4 group hover:border-sky-300"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-black text-sm">
                      {pat.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base leading-tight">{pat.name}</h4>
                      <div className="text-xs text-sky-700 font-mono mt-0.5 font-bold">
                        {pat.uhid}
                      </div>
                    </div>
                  </div>

                  {pat.blood_group && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {pat.blood_group}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="text-slate-600 flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pat.phone || 'No phone'}</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pat.age} yrs • {pat.gender}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-start gap-1.5 text-slate-700 font-medium">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>Doctor: <strong className="text-slate-900">{pat.doctor_name || 'General OPD'}</strong></span>
                  </div>
                  {pat.diagnosis && (
                    <div className="text-slate-500 pl-5">
                      Diagnosis: <span className="text-slate-800 font-semibold">{pat.diagnosis}</span>
                    </div>
                  )}
                  {pat.allergies && pat.allergies !== 'None' && (
                    <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg font-bold text-[11px] mt-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Known Allergies: {pat.allergies}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Purchase stats & Invoices */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-mono font-semibold">Total Bills: </span>
                  <strong className="text-teal-800 font-mono font-black">{patientSales.length} (₹{totalSpent.toFixed(2)})</strong>
                </div>
                {patientSales.length > 0 && (
                  <button
                    onClick={() => setActiveInvoice(patientSales[0])}
                    className="text-xs text-sky-700 hover:text-sky-900 flex items-center gap-1 font-bold"
                  >
                    <span>View Latest Bill</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
