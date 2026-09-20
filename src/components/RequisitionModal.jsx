import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  X,
  Building,
  Save,
  AlertTriangle,
  Bed,
  User,
  FileCheck
} from 'lucide-react'

export const RequisitionModal = ({ isOpen, onClose }) => {
  const { addRequisition, patients } = useApp()

  const [form, setForm] = useState({
    department: 'ICU - Critical Care',
    requested_by: 'Dr. On-Duty Officer',
    priority: 'Emergency',
    bed_no: 'ICU-Bed-05',
    patient_uhid: patients[0]?.uhid || 'RVS-PAT-1001',
    items_count: 2,
    notes: 'Immediate IV Infusion & Emergency Antibiotics requisition'
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    addRequisition({
      ...form,
      status: 'Issued'
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Issue Ward / ER Emergency Drugs</h3>
              <p className="text-xs text-slate-500">Direct dispensary dispatch to hospital wards</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-200/70 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Target Department *</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none cursor-pointer font-semibold"
              >
                <option value="ICU - Critical Care">ICU - Critical Care</option>
                <option value="Emergency / ER">Emergency / ER</option>
                <option value="OT - Operation Theatre">OT - Operation Theatre</option>
                <option value="Pediatric Ward">Pediatric Ward</option>
                <option value="NICU - Neonatal Care">NICU - Neonatal Care</option>
                <option value="General Inpatient Ward">General Inpatient Ward</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Emergency Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none cursor-pointer font-bold"
              >
                <option value="Emergency">🚨 Emergency (Immediate)</option>
                <option value="High">⚠️ High Priority</option>
                <option value="Normal">🟢 Routine Inpatient</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Bed / Bay ID</label>
              <input
                type="text"
                required
                value={form.bed_no}
                onChange={(e) => setForm({ ...form, bed_no: e.target.value })}
                placeholder="e.g. ICU-Bed-04 / ER-Bay-2"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Patient UHID (Optional)</label>
              <select
                value={form.patient_uhid}
                onChange={(e) => setForm({ ...form, patient_uhid: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none cursor-pointer font-mono font-bold"
              >
                <option value="General Dept Issue">General Dept Issue</option>
                {patients.map(p => (
                  <option key={p.id} value={p.uhid}>{p.uhid} - {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Requesting Doctor / Nurse In-Charge *</label>
            <input
              type="text"
              required
              value={form.requested_by}
              onChange={(e) => setForm({ ...form, requested_by: e.target.value })}
              placeholder="e.g. Dr. Arvind Swamy"
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-medium"
            />
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Requisition Item Notes & Dosage Instructions *</label>
            <textarea
              rows={3}
              required
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="List drug names, quantity, and administration route..."
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 rounded-xl p-3 text-sm text-slate-900 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Issue Drug Pack</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
