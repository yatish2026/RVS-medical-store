import React, { useState } from 'react'
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  Building2,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  UserPlus
} from 'lucide-react'
import { ROLES, INITIAL_USERS } from '../lib/authData'
import { apiLogin, apiCreateUser } from '../lib/api'

export const LoginPage = ({ onLoginSuccess, backendConnected }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false)

  // Login form state
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // Registration form state
  const [regName, setRegName] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState('pharmacist')
  const [regPhone, setRegPhone] = useState('')
  const [regDesignation, setRegDesignation] = useState('')
  const [regSuccessMsg, setRegSuccessMsg] = useState('')

  const handleLoginSubmit = async (e) => {
    e?.preventDefault()
    setErrorMsg('')
    setLoading(true)

    const cleanUser = username.trim().toLowerCase()
    const cleanPass = password.trim()

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Please enter both username and password.')
      setLoading(false)
      return
    }

    try {
      // 1. Try Flask API login
      const res = await apiLogin(cleanUser, cleanPass)
      if (res && res.success && res.user) {
        onLoginSuccess(res.user)
        return
      }
    } catch (apiErr) {
      console.warn('Flask login request failed or offline; checking local users', apiErr)
    }

    // 2. Fallback to local user registry
    const localUsers = JSON.parse(localStorage.getItem('rvs_users') || 'null') || INITIAL_USERS
    const found = localUsers.find(
      (u) => u.username.toLowerCase() === cleanUser && u.password === cleanPass
    )

    if (found) {
      onLoginSuccess(found)
    } else {
      setErrorMsg('Invalid username or password. Check credentials or use quick demo login.')
    }
    setLoading(false)
  }

  const handleQuickRoleLogin = (userPreset) => {
    setUsername(userPreset.username)
    setPassword(userPreset.password)
    setErrorMsg('')
    onLoginSuccess(userPreset)
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setRegSuccessMsg('')

    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setErrorMsg('Name, Username, and Password are required.')
      return
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: regName.trim(),
      username: regUsername.trim().toLowerCase(),
      password: regPassword.trim(),
      role: regRole,
      designation: regDesignation.trim() || ROLES[regRole]?.shortLabel,
      phone: regPhone.trim() || '+91 98000 00000'
    }

    try {
      await apiCreateUser(newUser)
    } catch (err) {
      console.warn('Could not sync user to Flask backend, saving locally', err)
    }

    // Save locally
    const currentList = JSON.parse(localStorage.getItem('rvs_users') || 'null') || INITIAL_USERS
    const updated = [...currentList.filter(u => u.username !== newUser.username), newUser]
    localStorage.setItem('rvs_users', JSON.stringify(updated))

    setRegSuccessMsg(`Account for "${newUser.name}" registered successfully!`)
    setTimeout(() => {
      onLoginSuccess(newUser)
    }, 900)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center items-center p-4 sm:p-6 antialiased selection:bg-teal-500 selection:text-white">
      
      {/* Background Glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        
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
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
              <Database className="w-3 h-3 text-teal-400" />
              PythonAnywhere SQLite DB Active
            </span>
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 overflow-hidden">
          
          {/* Toggle Login vs Register */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false)
                setErrorMsg('')
                setRegSuccessMsg('')
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                !isRegisterMode
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true)
                setErrorMsg('')
                setRegSuccessMsg('')
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isRegisterMode
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Staff Account</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {regSuccessMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{regSuccessMsg}</span>
            </div>
          )}

          {!isRegisterMode ? (
            /* --- LOGIN FORM --- */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-mono">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or pharmacist"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-sm font-medium transition-all outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-mono">
                  Password
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
                <span>{loading ? 'Authenticating...' : 'Sign In to Dispensary'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* --- REGISTRATION FORM --- */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase font-mono">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith or K. Patel"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-xs font-medium outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase font-mono">
                    Username
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. janesmith"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-xs font-medium outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase font-mono">
                    Password
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create password"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-xs font-medium outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase font-mono">
                    Assigned Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-xs font-medium outline-hidden bg-white"
                  >
                    <option value="pharmacist">Pharmacist (Dispensary)</option>
                    <option value="doctor_mo">Medical Officer / Doctor (MO)</option>
                    <option value="supervisor_viewer">Supervisor (Read-Only Auditor)</option>
                    <option value="admin_supervisor">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase font-mono">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-xs font-medium outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Staff Account & Sign In</span>
              </button>
            </form>
          )}

          {/* Quick 1-Click Role Testing Badges */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                1-Click Quick Demo Sign In
              </span>
              <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-bold">
                Instant Role Access
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {INITIAL_USERS.map((usr) => {
                const roleDef = ROLES[usr.role]
                return (
                  <button
                    key={usr.id}
                    type="button"
                    onClick={() => handleQuickRoleLogin(usr)}
                    className="flex flex-col text-left p-2.5 rounded-xl border border-slate-200/90 hover:border-teal-400 hover:bg-teal-50/60 transition-all cursor-pointer group bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-black text-slate-900 group-hover:text-teal-800">
                        {usr.name}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${roleDef?.tagBg || 'bg-slate-100'}`}>
                        {roleDef?.shortLabel}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {usr.username} / {usr.password}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-400">
          <p>RVS Medical Store & Hospital Dispensary Management System • v1.0.0</p>
          <p className="mt-1 text-slate-500 text-[11px]">
            Data saved permanently in SQLite <code className="text-teal-400 font-mono">hospital.db</code> on PythonAnywhere Cloud.
          </p>
        </div>

      </div>

    </div>
  )
}
