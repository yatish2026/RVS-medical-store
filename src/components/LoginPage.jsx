import React, { useState } from 'react'
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  Building2,
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles,
  ShieldAlert
} from 'lucide-react'
import { INITIAL_USERS } from '../lib/authData'
import { apiLogin } from '../lib/api'

export const LoginPage = ({ onLoginSuccess, backendConnected }) => {
  // Login form state
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLoginSubmit = async (e) => {
    e?.preventDefault()
    setErrorMsg('')

    const cleanUser = username.trim().toLowerCase()
    const cleanPass = password.trim()

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Please enter both username and password.')
      return
    }

    setLoading(true)

    // 1. Try server-side authentication (shared across all browsers & devices!)
    try {
      const res = await apiLogin(cleanUser, cleanPass)
      if (res && res.success && res.user) {
        setLoading(false)
        onLoginSuccess(res.user)
        return
      }
    } catch (apiErr) {
      // If server returned a specific error message (e.g. ACCOUNT_NOT_FOUND or INCORRECT_PASSWORD)
      if (apiErr.message && !apiErr.message.includes('fetch') && !apiErr.message.includes('network') && !apiErr.message.includes('Failed')) {
        setErrorMsg(apiErr.message)
        setLoading(false)
        return
      }
    }

    // 2. Fallback check against merged registry (INITIAL_USERS + locally created accounts)
    const userMap = new Map()
    INITIAL_USERS.forEach(u => userMap.set(u.username.toLowerCase(), u))
    try {
      const savedUsers = JSON.parse(localStorage.getItem('rvs_users') || '[]')
      if (Array.isArray(savedUsers)) {
        savedUsers.forEach(u => {
          if (u && u.username) userMap.set(u.username.toLowerCase(), u)
        })
      }
    } catch (e) {}

    const userExists = userMap.get(cleanUser)

    if (!userExists) {
      setErrorMsg(`Account not found for username "${username.trim()}". This staff account has not been created yet. Please ask the Super Admin to add your account in User Management.`)
      setLoading(false)
      return
    }

    if (userExists.password !== cleanPass) {
      setErrorMsg(`Incorrect password for username "${username.trim()}". Please check your password and try again.`)
      setLoading(false)
      return
    }

    onLoginSuccess(userExists)
    setLoading(false)
  }

  const fillAdminCredentials = () => {
    setUsername('admin')
    setPassword('admin123')
    setErrorMsg('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center items-center p-4 sm:p-6 antialiased selection:bg-teal-500 selection:text-white">
      
      {/* Background Glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        
        {/* Hospital Branding Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white p-1.5 shadow-2xl shadow-teal-500/20 ring-4 ring-teal-400/30 mb-4 transform hover:scale-105 transition-transform">
            <img src="/rvs-logo.png" alt="RVS Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            RVS MEDICAL STORE
          </h1>
          <p className="text-xs sm:text-sm text-teal-300 font-medium mt-1">
            Hospital Dispensary Management & Clinical Formulary
          </p>
          <div className="flex items-center justify-center gap-2 mt-2.5">
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Super Admin Gateway
            </span>
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 overflow-hidden">
          
          {/* Header Title */}
          <div className="mb-5 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-600" />
                Super Administrator Sign In
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your Super Admin credentials to access Central Dispensary management.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
              Super Admin
            </span>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* --- LOGIN FORM --- */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-mono">
                Admin Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  required
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-sm font-medium transition-all outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-mono">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-sm font-medium transition-all outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 hover:from-teal-500 hover:to-cyan-600 text-white font-extrabold text-sm shadow-lg shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In as Super Administrator'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Super Admin Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Super Admin Credentials
                </span>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  User: <strong className="text-slate-800">admin</strong> • Pass: <strong className="text-slate-800">admin123</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={fillAdminCredentials}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
              >
                Autofill Credentials
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-400">
          <p>RVS Medical Store & Hospital Dispensary Management System • v1.0.0</p>
          <p className="mt-1 text-slate-500 text-[11px]">
            Role-Based Access Control • Super Admin • Doctor (MO) • Pharmacist • Supervisor
          </p>
        </div>

      </div>

    </div>
  )
}
