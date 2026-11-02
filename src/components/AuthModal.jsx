import React from 'react'
import { useApp } from '../context/AppContext'
import {
  ShieldCheck,
  User,
  Lock,
  LogOut,
  X,
  CheckCircle2,
  Users,
  Settings,
  Pill,
  ShoppingCart,
  Percent,
  LogIn,
  UserPlus,
  ArrowLeft,
  AlertCircle,
  Eye,
  Sparkles,
  Stethoscope
} from 'lucide-react'

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    currentRole,
    users,
    quickSwitchUser,
    returnToSuperAdmin,
    isImpersonating,
    ROLES,
    logout,
    setIsUserManagementModalOpen
  } = useApp()

  if (!isAuthModalOpen) return null

  const isSuperAdmin = currentUser?.role === 'admin_supervisor' || currentUser?.username === 'admin'
  const createdStaff = users.filter((u) => u.username !== 'admin')

  // Capabilities helper text for each role
  const getRoleCapabilities = (roleKey) => {
    switch (roleKey) {
      case 'pharmacist':
        return [
          { text: 'POS Dispensary Billing Terminal', allowed: true },
          { text: 'Medicine Stock Inward (+ Med)', allowed: true },
          { text: 'Manual Discount Modification (Locked)', allowed: false },
          { text: 'Edit Existing Medicine Prices (Locked)', allowed: false }
        ]
      case 'doctor_mo':
        return [
          { text: 'Dispensary Formulary & Stock Inward', allowed: true },
          { text: 'Individual Medicine Discount Authority', allowed: true },
          { text: 'Patient POS Billing Terminal', allowed: true },
          { text: 'Overall Bill Package Discount (Admin Only)', allowed: false }
        ]
      case 'supervisor_viewer':
        return [
          { text: 'Full Formulary & Expiry Radar Inspection', allowed: true },
          { text: 'Patient Invoices & Audit Records View', allowed: true },
          { text: 'Dispensary Billing & POS (Locked)', allowed: false },
          { text: 'Data Modification & Medicine Edits (Locked)', allowed: false }
        ]
      default:
        return [
          { text: 'Full System Control & Inventory Inward', allowed: true },
          { text: 'Overall & Individual Discount Authority', allowed: true },
          { text: 'Staff Account & Role Administration', allowed: true }
        ]
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className={`p-5 sm:p-6 text-white relative ${
          isSuperAdmin
            ? 'bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900'
            : (currentRole?.key === 'doctor_mo'
                ? 'bg-gradient-to-r from-teal-800 via-cyan-900 to-slate-900'
                : (currentRole?.key === 'pharmacist'
                    ? 'bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900'
                    : 'bg-gradient-to-r from-amber-800 via-orange-900 to-slate-900'))
        }`}>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center backdrop-blur-md shadow-inner">
              {isSuperAdmin ? (
                <ShieldCheck className="w-7 h-7 text-purple-200" />
              ) : currentRole?.key === 'doctor_mo' ? (
                <Stethoscope className="w-7 h-7 text-teal-200" />
              ) : currentRole?.key === 'pharmacist' ? (
                <ShoppingCart className="w-7 h-7 text-blue-200" />
              ) : (
                <Eye className="w-7 h-7 text-amber-200" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {isSuperAdmin ? 'Super Administrator Profile' : `${currentRole?.label || 'Staff Account'}`}
                </h3>
                <span className="text-[10px] uppercase font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {currentRole?.shortLabel || 'User'}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                {isSuperAdmin
                  ? 'Central Hospital Dispensary & Formulary Management'
                  : 'Role-Based Operational Session • RVS Hospital Pharmacy'}
              </p>
            </div>
          </div>

          {/* Currently Active Badge */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Active Account: <strong className="font-bold">{currentUser?.name || 'Staff User'}</strong></span>
            </div>

            {/* Only show return to Super Admin if Super Admin is actively testing this account */}
            {isImpersonating && !isSuperAdmin && (
              <button
                onClick={returnToSuperAdmin}
                className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-purple-400 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Super Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">

          {/* If Super Admin is actively testing this staff role: Prompt to return to Super Admin */}
          {isImpersonating && !isSuperAdmin && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <span className="text-xs font-black text-purple-900 flex items-center gap-1.5 font-mono uppercase">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Currently Testing As Switched Staff Account
                </span>
                <p className="text-xs text-purple-800/80 mt-0.5">
                  You are testing as <strong>{currentUser?.name}</strong> ({currentRole?.shortLabel}). You can test allowed features, or return to Super Admin anytime.
                </p>
              </div>

              <button
                type="button"
                onClick={returnToSuperAdmin}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Switch Back to Super Admin</span>
              </button>
            </div>
          )}

          {/* Current Profile Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black text-base shadow-sm ${
                isSuperAdmin
                  ? 'bg-purple-700'
                  : currentRole?.key === 'doctor_mo'
                    ? 'bg-teal-600'
                    : currentRole?.key === 'pharmacist'
                      ? 'bg-blue-600'
                      : 'bg-amber-600'
              }`}>
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">{currentUser?.name || 'Dr. Yatish'}</h4>
                <p className="text-xs text-slate-600 font-mono font-bold mt-0.5">
                  Username: <span className="text-slate-900">{currentUser?.username || 'admin'}</span>
                  {currentUser?.password && (
                    <span className="text-slate-400 font-normal ml-2">| Pass: {currentUser.password}</span>
                  )}
                </p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${
                  currentRole?.tagBg || 'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {currentUser?.designation || currentRole?.label || 'Super Administrator'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsAuthModalOpen(false)
                logout()
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Current Role System Privileges Checklist */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/20 border border-slate-200 text-xs space-y-2.5">
            <span className="font-extrabold uppercase tracking-wider text-[11px] font-mono text-slate-700 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-purple-600" />
              Active Profile Permissions ({currentRole?.shortLabel || 'Super Admin'}):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              {getRoleCapabilities(currentRole?.key || 'admin_supervisor').map((cap, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-800 font-medium">
                  {cap.allowed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  <span className={cap.allowed ? 'text-slate-800' : 'text-slate-500'}>
                    {cap.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: Created Staff Profiles & Account Switcher (SUPER ADMIN ONLY) */}
          {isSuperAdmin && (
            <>
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider font-mono text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-600" />
                      Created Staff Profiles & Accounts ({createdStaff.length})
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Click <strong>"Open Account"</strong> on any staff profile below to operate as that user with their exact permissions.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthModalOpen(false)
                      setIsUserManagementModalOpen(true)
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add New User</span>
                  </button>
                </div>

                {createdStaff.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                    <Users className="w-8 h-8 text-slate-400 mx-auto" />
                    <h5 className="text-xs font-bold text-slate-700">No Staff Accounts Created Yet</h5>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      Click below to open <strong>User & Role Management</strong> to create Doctor (MO), Pharmacist, or Supervisor accounts.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAuthModalOpen(false)
                        setIsUserManagementModalOpen(true)
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Staff Account Now</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {createdStaff.map((staff) => {
                      const staffRole = ROLES[staff.role] || ROLES.pharmacist
                      const isCurrentActive = currentUser?.id === staff.id

                      return (
                        <div
                          key={staff.id}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isCurrentActive
                              ? 'bg-purple-50/60 border-purple-300 ring-2 ring-purple-400/20'
                              : 'bg-white hover:bg-slate-50/80 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                              staffRole.key === 'doctor_mo'
                                ? 'bg-teal-600'
                                : staffRole.key === 'pharmacist'
                                  ? 'bg-blue-600'
                                  : 'bg-amber-600'
                            }`}>
                              {staff.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs font-black text-slate-900 truncate">{staff.name}</h5>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${staffRole.tagBg}`}>
                                  {staffRole.shortLabel}
                                </span>
                                {isCurrentActive && (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    ACTIVE NOW
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                <span>User: <strong className="text-slate-800">{staff.username}</strong></span>
                                {staff.password && <span>Pass: <strong className="text-slate-700">{staff.password}</strong></span>}
                                {staff.designation && <span className="text-slate-400 italic font-sans">• {staff.designation}</span>}
                              </div>

                              {/* Quick capability summary */}
                              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                                {staffRole.key === 'pharmacist' && (
                                  <span className="text-blue-700 font-medium">✓ Billing POS • 🔒 Discounts Locked</span>
                                )}
                                {staffRole.key === 'doctor_mo' && (
                                  <span className="text-teal-700 font-medium">✓ Clinical Records • ✓ Individual Discounts</span>
                                )}
                                {staffRole.key === 'supervisor_viewer' && (
                                  <span className="text-amber-700 font-medium">✓ Audit Records • 🔒 Read-Only</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                            {isCurrentActive ? (
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 font-mono">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Open (Active)
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => quickSwitchUser(staff.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                              >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Open Account ➔</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Quick link to User & Role Management */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    setIsAuthModalOpen(false)
                    setIsUserManagementModalOpen(true)
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 transition-all cursor-pointer font-bold text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-slate-900 font-extrabold">User & Role Management</div>
                      <div className="text-[10px] text-purple-700 font-normal">Add new staff logins, reset credentials, or assign roles</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-purple-700 font-black">Manage Users ➔</span>
                </button>
              </div>
            </>
          )}

          {/* Secure Staff Session Notice for non-super-admins */}
          {!isSuperAdmin && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Station Security & Terminal Assignment</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                This account is securely locked to its assigned module. Role switching and profile access are restricted to the Super Administrator. To switch profiles or access administrator controls, please sign out and log in with Super Admin credentials.
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            RVS Hospital Dispensary • Role Access Engine
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}

