import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Building,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Bed,
  User,
  FileCheck
} from 'lucide-react'

export const HospitalWards = ({ onOpenRequisitionModal }) => {
  const { requisitions, updateRequisitionStatus } = useApp()
  const [filterDept, setFilterDept] = useState('ALL')

  const departments = ['ALL', 'ICU - Critical Care', 'Emergency / ER', 'OT - Operation Theatre', 'Pediatric Ward', 'General Ward']

  const filtered = requisitions.filter(r =>
    filterDept === 'ALL' || r.department.toLowerCase().includes(filterDept.toLowerCase().split(' ')[0])
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="clinical-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            Hospital Ward & Emergency Drug Requisitions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time dispensations to ICU, ER, OT, and inpatient bed units.
          </p>
        </div>

        <button
          onClick={onOpenRequisitionModal}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Issue Ward Drugs</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {departments.map((d) => (
          <button
            key={d}
            onClick={() => setFilterDept(d)}
            className={`px-3.5 py-2 rounded-xl font-bold shrink-0 transition-all ${
              filterDept === d
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Requisitions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((req) => {
          const isEmergency = req.priority === 'Emergency'

          return (
            <div
              key={req.id}
              className={`p-5 rounded-2xl border bg-white shadow-xs flex flex-col justify-between gap-4 transition-all ${
                isEmergency ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-teal-700 font-bold">
                      {req.requisition_no}
                    </span>
                    <h4 className="font-extrabold text-base text-slate-900 mt-0.5">{req.department}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-mono border ${
                      req.priority === 'Emergency'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                        : req.priority === 'High'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-teal-50 text-teal-800 border-teal-200'
                    }`}
                  >
                    {req.priority}
                  </span>
                </div>

                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700">
                  <p className="leading-relaxed font-medium">{req.notes || 'Emergency drug packs dispensed to department'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-500 font-mono font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-slate-700">{req.bed_no || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-slate-700">{req.patient_uhid || 'OPD'}</span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                  Officer: <strong className="text-slate-800 font-bold">{req.requested_by}</strong>
                </div>
              </div>

              {/* Status Controls */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Status: <strong className="text-teal-800 font-bold">{req.status}</strong></span>
                <div className="flex items-center gap-1.5">
                  {req.status !== 'Issued' && (
                    <button
                      onClick={() => updateRequisitionStatus(req.id, 'Issued')}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 shadow-2xs"
                    >
                      Mark Issued
                    </button>
                  )}
                  {req.status === 'Issued' && (
                    <button
                      onClick={() => updateRequisitionStatus(req.id, 'Administered')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs"
                    >
                      Administered
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
