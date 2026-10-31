import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Shield,
  User,
  KeyRound,
  CheckCircle2,
  Lock,
  ArrowRight,
  Stethoscope,
  Eye,
  Pill,
  Sparkles,
  X,
  ShieldCheck,
  Building
} from 'lucide-react'

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    users,
    currentUser,
    login,
    quickSwitchUser,
    ROLES
  } = useApp()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isManualLogin, setIsManualLogin] = useState(false)
  const [loginError, setLoginError] = useState('')

  if (!isAuthModalOpen) return null

  const handleManualSubmit = (e) => {
    e.preventDefault()
    setLoginError('')
    const ok = login(username, password)
    if (!ok) {
      setLoginError('Invalid username or password. Check dummy accounts below.')
    }
  }

  const roleIcons = {
    admin_supervisor: ShieldCheck,
    doctor_mo: Stethoscope,
    supervisor_viewer: Eye,
    pharmacist: Pill
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-800 via-cyan-800 to-teal-900 text-white relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center backdrop-blur-md shadow-inner">
              <Shield className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  RVS Medical Security & Role Access
                </h3>
                <span className="text-[10px] uppercase font-mono font-bold bg-white/20 text-teal-100 px-2 py-0.5 rounded-full">
                  RBAC v1.0
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Switch between clinical dummy logins or log into your verified hospital staff profile.
              </p>
            </div>
          </div>

          {/* Currently Active Badge */}
          {currentUser && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Currently active: <strong className="font-bold">{currentUser.name}</strong> ({ROLES[currentUser.role]?.shortLabel})</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">

          {/* Quick Demo Switcher Cards (Requested: dummy logins to test) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs uppercase font-extrabold text-slate-500 tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                1-Click Quick Demo Profiles
              </label>
              <span className="text-[11px] text-teal-700 font-bold">Instant Login</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {users.map((u) => {
                const role = ROLES[u.role] || ROLES.pharmacist
                const Icon = roleIcons[u.role] || User
                const isActive = currentUser?.id === u.id

                return (
                  <div
                    key={u.id}
                    onClick={() => quickSwitchUser(u.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative text-left ${
                      isActive
                        ? 'border-teal-600 bg-teal-50/60 shadow-xs ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${role.gradient} shadow-2xs`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 leading-tight flex items-center gap-1.5">
                            {u.name}
                            {isActive && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                            )}
                          </h4>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${role.tagBg}`}>
                            {role.shortLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
                      {role.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-100 text-slate-500">
                      <span>User: <strong className="text-slate-800">{u.username}</strong></span>
                      <span>Pass: <strong className="text-slate-800">{u.password}</strong></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Manual Username/Password Login Form Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsManualLogin(!isManualLogin)}
              className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isManualLogin ? 'Hide Manual Staff Login' : 'Or log in with username & password'}</span>
            </button>

            {isManualLogin && (
              <form onSubmit={handleManualSubmit} className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                {loginError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {loginError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono block mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. admin or pharmacist"
                        className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono block mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Authenticate Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Role Access Matrix Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600 space-y-2">
            <h5 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider font-mono">
              Clinical Security Guidelines:
            </h5>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex items-start gap-1.5">
                <span className="text-purple-600 font-bold">• Super Admin:</span>
                <span>Full editing authority + Create new user accounts and assign roles.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal-600 font-bold">• Medical Officer (Doctor):</span>
                <span>Formulary review + Can authorize package & medicine clinical discounts.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">• Supervisor (Read-Only):</span>
                <span>Audit & review only. All edit, delete, and invoice generation buttons are strictly locked.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">• Pharmacist:</span>
                <span>Billing and adding medicines. Cannot add or alter discounts; pre-approved doctor discounts reflect directly.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            RVS Hospital Role-Based Access Control
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
