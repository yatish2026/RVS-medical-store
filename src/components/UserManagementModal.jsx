import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Users,
  UserPlus,
  ShieldCheck,
  Trash2,
  Lock,
  User,
  KeyRound,
  Percent,
  CheckCircle2,
  X,
  Phone,
  Briefcase,
  AlertCircle,
  Stethoscope,
  Eye,
  Pill,
  LogIn
} from 'lucide-react'

export const UserManagementModal = () => {
  const {
    isUserManagementModalOpen,
    setIsUserManagementModalOpen,
    users,
    currentUser,
    addUser,
    deleteUser,
    quickSwitchUser,
    ROLES,
    preApprovedDiscount,
    updatePreApprovedDiscount
  } = useApp()

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'pharmacist',
    designation: '',
    phone: ''
  })

  const [discountVal, setDiscountVal] = useState(preApprovedDiscount?.percent ?? 0)
  const [discountReason, setDiscountReason] = useState(preApprovedDiscount?.reason || 'Standard Bill Rate (No Discount Set)')
  const [errorMsg, setErrorMsg] = useState('')

  // Security guard: Only Super Admin can open User Management
  const isSuperAdmin = currentUser?.role === 'admin_supervisor'
  if (!isUserManagementModalOpen || !isSuperAdmin) return null

  const handleCreateUser = (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
      setErrorMsg('Please complete all required fields (Name, Username, and Password).')
      return
    }

    const success = addUser({
      name: formData.name.trim(),
      username: formData.username.trim(),
      password: formData.password.trim(),
      role: formData.role,
      designation: formData.designation.trim() || ROLES[formData.role]?.shortLabel,
      phone: formData.phone.trim()
    })

    if (success) {
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'pharmacist',
        designation: '',
        phone: ''
      })
    }
  }

  const handleSaveDiscountPolicy = (e) => {
    e.preventDefault()
    updatePreApprovedDiscount(discountVal, discountReason)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 text-white relative">
          <button
            onClick={() => setIsUserManagementModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center backdrop-blur-md shadow-inner">
              <ShieldCheck className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Hospital User & Role Administration
                </h3>
                <span className="text-[10px] uppercase font-mono font-bold bg-white/20 text-purple-100 px-2 py-0.5 rounded-full">
                  Super Admin Exclusive
                </span>
              </div>
              <p className="text-xs text-purple-100/90 mt-0.5">
                Create new staff logins, assign permissions (Supervisor, Doctor, Pharmacist), and configure discount policies.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">

          {!isSuperAdmin ? (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="text-sm font-bold text-amber-900">Access Restricted to Super Admin</h4>
              <p className="text-xs text-amber-700">
                You are currently logged in as <strong>{currentUser?.name}</strong> ({ROLES[currentUser?.role]?.label}).
                Please switch to the <strong>Super Admin</strong> account to manage users.
              </p>
            </div>
          ) : (
            <>
              {/* SECTION 1: Create New Staff Login */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-slate-800">
                    <UserPlus className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider font-mono">
                      Create New Staff Login & Assign Role
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    Role-Based Access
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Full Name */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase font-mono block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Dr. Ramesh Patel"
                        required
                        className="w-full bg-white border border-slate-300 focus:border-purple-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-medium shadow-2xs"
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase font-mono block mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="e.g. dr_ramesh"
                        required
                        className="w-full bg-white border border-slate-300 focus:border-purple-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-medium shadow-2xs"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase font-mono block mb-1">
                        Password *
                      </label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Temporary Password"
                        required
                        className="w-full bg-white border border-slate-300 focus:border-purple-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-medium shadow-2xs font-mono"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Role Selection */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase font-mono block mb-1">
                        Assigned Role & Privilege *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full bg-white border border-slate-300 focus:border-purple-600 rounded-xl px-2.5 py-2 text-xs text-slate-900 outline-none font-bold shadow-2xs"
                      >
                        <option value="pharmacist">Pharmacist (Dispensary & Stock Inward - No Discount)</option>
                        <option value="doctor_mo">Medical Officer / Doctor (Formulary + Can Apply Pack Discount)</option>
                        <option value="supervisor_viewer">Supervisor (Read-Only / Auditor - No Edits)</option>
                        <option value="admin_supervisor">Super Admin (Full Edit & User Management)</option>
                      </select>
                    </div>

                    {/* Designation / Department */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase font-mono block mb-1">
                        Designation / Ward
                      </label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="e.g. OPD Dispensary / General Ward"
                        className="w-full bg-white border border-slate-300 focus:border-purple-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-medium shadow-2xs"
                      />
                    </div>

                    {/* Contact Phone */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase font-mono block mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98000 00000"
                        className="w-full bg-white border border-slate-300 focus:border-purple-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-medium shadow-2xs"
                      />
                    </div>

                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Create Staff Account</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 2: Pre-Approved Discount Configuration (Syncs to Pharmacist Screen) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
                  <div className="flex items-center gap-2 text-teal-900">
                    <Percent className="w-4 h-4 text-teal-700" />
                    <h4 className="text-xs font-black uppercase tracking-wider font-mono">
                      Pre-Authorized Clinical Discount (Pushed to Pharmacist Billing)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-300">
                    Active: {preApprovedDiscount?.percent || 0}%
                  </span>
                </div>

                <p className="text-[11px] text-teal-900/80 leading-relaxed">
                  As requested, Pharmacists cannot manually modify discounts on medicine billing. Set the authorized clinical package discount below; it will <strong>reflect directly on the Pharmacist's POS screen</strong> in real time.
                </p>

                <form onSubmit={handleSaveDiscountPolicy} className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <div className="flex items-center gap-1.5 shrink-0">
                    {[0, 5, 10, 15, 20].map((pct) => (
                      <button
                        type="button"
                        key={pct}
                        onClick={() => setDiscountVal(pct)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                          discountVal === pct
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-white text-teal-800 border border-teal-200 hover:bg-teal-100'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="Discount Authorization Note (e.g. OPD Medicine Pack)"
                    className="flex-1 w-full bg-white border border-teal-200 focus:border-teal-600 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none font-medium"
                  />

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
                  >
                    Authorize & Push to Pharmacist
                  </button>
                </form>
              </div>

              {/* SECTION 3: Active Staff Users List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider font-mono text-slate-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-500" />
                    Active Registered Accounts ({users.length})
                  </h4>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                        <th className="py-2.5 px-3">Staff Name</th>
                        <th className="py-2.5 px-3">Username</th>
                        <th className="py-2.5 px-3">Password</th>
                        <th className="py-2.5 px-3">Assigned Role</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => {
                        const role = ROLES[u.role] || ROLES.pharmacist
                        const isSelf = currentUser?.id === u.id

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                {u.name}
                                {isSelf && (
                                  <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded font-mono">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                {u.designation || role.shortLabel}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                              {u.username}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">
                              {u.password}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.tagBg}`}>
                                {role.shortLabel}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isSelf ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        quickSwitchUser(u.id)
                                        setIsUserManagementModalOpen(false)
                                      }}
                                      className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                                      title={`Open ${u.name}'s account and operate as ${role.shortLabel}`}
                                    >
                                      <LogIn className="w-3 h-3" />
                                      <span>Open Account</span>
                                    </button>

                                    {u.username !== 'admin' ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (window.confirm(`Are you sure you want to permanently delete user "${u.name}" (@${u.username})?\n\nThis will remove their account and login credentials.`)) {
                                            deleteUser(u.id)
                                          }
                                        }}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
                                        title={`Delete user account for ${u.name}`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                        <span>Delete</span>
                                      </button>
                                    ) : (
                                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                        Root Admin
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                                      Current Active
                                    </span>
                                    {u.username === 'admin' && (
                                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                        Root Admin
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            RVS Multi-Role Security System
          </div>
          <button
            onClick={() => setIsUserManagementModalOpen(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  )
}
