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
  Percent
} from 'lucide-react'

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    logout,
    setIsUserManagementModalOpen
  } = useApp()

  if (!isAuthModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center backdrop-blur-md shadow-inner">
              <ShieldCheck className="w-7 h-7 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Super Administrator Profile
                </h3>
                <span className="text-[10px] uppercase font-mono font-bold bg-white/20 text-purple-100 px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-purple-100/80 mt-0.5">
                Central Hospital Dispensary & Formulary Management
              </p>
            </div>
          </div>

          {/* Currently Active Badge */}
          <div className="mt-4 inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active Administrator: <strong className="font-bold">{currentUser?.name || 'Dr. Yatish'}</strong></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">

          {/* Profile Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-black text-base shadow-sm">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">{currentUser?.name || 'Dr. Yatish'}</h4>
                <p className="text-xs text-purple-800 font-mono font-bold mt-0.5">
                  Username: {currentUser?.username || 'admin'}
                </p>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 mt-1">
                  Super Administrator (Full System Control)
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

          {/* Admin Authority Privileges */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/30 border border-slate-200 text-xs space-y-2.5">
            <span className="font-extrabold uppercase tracking-wider text-[11px] font-mono text-slate-700 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-purple-600" />
              Super Admin System Privileges:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Full Medicine Formulary & Stock Inward</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>POS High-Speed Billing Terminal</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Overall Bill Package Discount Control</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Individual Medicine Formulation Discounts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Critical Expiry Radar & Stock Auditing</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Staff Account Creation & Role Admin</span>
              </div>
            </div>
          </div>

          {/* Action Quick Links */}
          <div className="space-y-2 pt-1">
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
                <div>
                  <div className="text-slate-900 font-extrabold">User & Role Management</div>
                  <div className="text-[10px] text-purple-700 font-normal">Add, edit, or remove hospital staff logins</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-purple-700 font-black">Open ➔</span>
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            RVS Hospital Dispensary • Super Admin
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
