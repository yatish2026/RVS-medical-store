import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  X,
  UserPlus,
  Save,
  Phone,
  Calendar,
  Heart,
  AlertCircle,
  Stethoscope
} from 'lucide-react'

export const PatientModal = ({ isOpen, onClose }) => {
  const { addPatient } = useApp()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    blood_group: 'B+',
    doctor_name: 'Dr. Ananya Hegde (Cardiology)',
    diagnosis: '',
    allergies: 'None'
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    addPatient({
      ...form,
      age: parseInt(form.age, 10) || 30
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Register Hospital Patient</h3>
              <p className="text-xs text-slate-500">Auto-generates unique UHID & clinical profile</p>
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
            <div className="col-span-2">
              <label className="text-slate-700 font-bold block mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-sky-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-semibold"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98..."
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-sky-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Age (Years)</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="45"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-sky-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-sky-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none cursor-pointer font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Blood Group</label>
              <select
                value={form.blood_group}
                onChange={(e) => setForm({ ...form, blood_group: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-sky-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none cursor-pointer font-bold"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Consulting Doctor / Department</label>
            <input
              type="text"
              value={form.doctor_name}
              onChange={(e) => setForm({ ...form, doctor_name: e.target.value })}
              placeholder="e.g. Dr. Ananya Hegde (Cardiology)"
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-sky-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-medium"
            />
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Primary Diagnosis / Condition</label>
            <input
              type="text"
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              placeholder="e.g. Hypertension & Type 2 Diabetes"
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-sky-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="text-rose-700 font-bold block mb-1">Known Drug Allergies</label>
            <input
              type="text"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              placeholder="e.g. Penicillin / Sulfa / None"
              className="w-full bg-rose-50/50 border border-rose-300 focus:bg-white focus:border-rose-600 rounded-xl px-3 py-2 text-sm text-rose-900 outline-none font-bold"
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
              className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Register Patient</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
