import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  X,
  Truck,
  Save,
  Phone,
  Mail,
  MapPin,
  FileSpreadsheet
} from 'lucide-react'

export const SupplierModal = ({ isOpen, onClose }) => {
  const { addSupplier } = useApp()

  const [form, setForm] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    gstin: '',
    address: '',
    balance_payable: '0.00'
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    addSupplier({
      ...form,
      balance_payable: parseFloat(form.balance_payable) || 0
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Register Pharma Distributor</h3>
              <p className="text-xs text-slate-500">Supplier ledger & purchase tracking</p>
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
              <label className="text-slate-700 font-bold block mb-1">Company / Agency Name *</label>
              <input
                type="text"
                required
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="e.g. Apollo Pharma Distributors"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-purple-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-semibold"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Contact Person Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Rajesh Sharma"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-purple-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98..."
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-purple-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="orders@pharma.com"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-purple-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">GSTIN Number</label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                placeholder="29ABCDE1234F1Z5"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-purple-600 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Warehouse / Office Address</label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Full address..."
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-purple-600 rounded-xl p-2.5 text-sm text-slate-900 outline-none"
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
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Register Supplier</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
