import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import {
  Activity,
  Plus,
  ShoppingCart,
  Menu,
  X,
  AlertTriangle,
  Clock,
  ShieldCheck,
  LogOut,
  FileUp,
  Building2,
  Lock
} from 'lucide-react'

export const Header = ({ onOpenMedicineModal, onOpenPatientModal, onOpenPdfModal, onToggleMobileMenu, isMobileMenuOpen }) => {
  const {
    setActiveTab,
    cart,
    expiredCount,
    criticalExpiryCount,
    currentUser,
    currentRole,
    canAddMedicine,
    canManageUsers,
    isSuperAdmin,
    isImpersonating,
    returnToSuperAdmin,
    quickSwitchUser,
    setIsAuthModalOpen,
    setIsUserManagementModalOpen,
    logout,
    currentStore,
    effectiveStore,
    switchStore,
    STORES
  } = useApp()

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const totalExpiryAlerts = expiredCount + criticalExpiryCount

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs text-slate-800">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Left: Mobile Hamburger & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-teal-200/80 p-0.5 flex items-center justify-center shadow-md shadow-teal-500/10 ring-2 ring-teal-100 shrink-0">
                <img src="/rvs-logo.png" alt="RVS Seal" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 bg-clip-text text-transparent">
                    RVS MEDICAL
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-mono">
                    Pharmacy
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1.5 font-mono">
                  <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500"></span>
                  <span className="truncate font-bold text-slate-700">{effectiveStore} Dispensary</span>
                </p>
              </div>
            </div>

            {/* Store Switcher (Super Admin) or Store Badge (Staff Member) */}
            <div className="hidden sm:flex items-center ml-1 sm:ml-2">
              {isSuperAdmin ? (
                <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <span className="hidden xl:inline-block text-[10px] font-black uppercase font-mono text-slate-500 px-2">
                    Store:
                  </span>
                  <button
                    onClick={() => switchStore('UHTC')}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      currentStore === 'UHTC'
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                    title="Switch to UHTC Dispensary (Urban Health Training Centre)"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>UHTC</span>
                    <span className="hidden md:inline text-[10px] font-medium opacity-90">(Urban)</span>
                  </button>

                  <button
                    onClick={() => switchStore('RHTC')}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      currentStore === 'RHTC'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                    title="Switch to RHTC Dispensary (Rural Health Training Centre)"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>RHTC</span>
                    <span className="hidden md:inline text-[10px] font-medium opacity-90">(Rural)</span>
                  </button>
                </div>
              ) : (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold shadow-2xs ${
                    effectiveStore === 'RHTC'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-teal-50 text-teal-800 border-teal-300'
                  }`}
                  title={`Assigned Dispensary: ${effectiveStore === 'RHTC' ? 'Rural Health Training Centre (RHTC)' : 'Urban Health Training Centre (UHTC)'}. Access is restricted to this store.`}
                >
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>{effectiveStore} Dispensary</span>
                  <span className="hidden md:inline text-[10px] font-medium opacity-80">
                    ({effectiveStore === 'RHTC' ? 'Rural' : 'Urban'})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Center: Live Clock & Expiry Warnings (Tablet / Desktop) */}
          <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-full text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-mono text-slate-700 font-semibold">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">{currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>

            {totalExpiryAlerts > 0 && (
              <>
                <div className="h-3.5 w-px bg-slate-200"></div>
                <div
                  onClick={() => setActiveTab('expiry')}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold cursor-pointer hover:bg-rose-100 transition-colors text-[11px]"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-600 animate-bounce" />
                  <span>{totalExpiryAlerts} Expiry Warning{totalExpiryAlerts > 1 ? 's' : ''}</span>
                </div>
              </>
            )}
          </div>

          {/* Right: Quick Action Buttons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Action: Billing */}
            <button
              onClick={() => setActiveTab('pos')}
              className="relative flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-bold px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-teal-700/15 transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Billing</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-mono text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Quick Action: Add Med (Desktop/Tablet) - Hidden for Read-Only Supervisor */}
            {canAddMedicine && (
              <>
                <button
                  onClick={onOpenPdfModal}
                  title="Upload Doctor Prescription / Wholesale PDF to auto-add medicines"
                  className="hidden md:flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 px-3 py-2 rounded-xl text-xs font-bold border border-indigo-200 transition-colors cursor-pointer"
                >
                  <FileUp className="w-4 h-4 text-indigo-600" />
                  <span>Upload PDF</span>
                </button>

                <button
                  onClick={onOpenMedicineModal}
                  className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:border-teal-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  <span className="hidden md:inline">+ New Medicine</span>
                  <span className="md:hidden">+ Med</span>
                </button>
              </>
            )}

            {/* Super Admin: User Management Button */}
            {canManageUsers && (
              <button
                onClick={() => setIsUserManagementModalOpen(true)}
                title="Manage Staff Logins & Roles (Super Admin)"
                className="hidden lg:flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Users & Roles</span>
              </button>
            )}

            {/* Only when Super Admin is actively testing a staff role: Show Return to Super Admin */}
            {isImpersonating && currentUser?.role !== 'admin_supervisor' && (
              <button
                onClick={returnToSuperAdmin}
                title="Exit testing role and switch back to Super Admin (Dr. Yatish)"
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white border border-purple-400 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-900/20 cursor-pointer active:scale-95 animate-pulse"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-200" />
                <span className="hidden sm:inline">Return to Super Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}

            {/* User Profile Badge */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 p-1 sm:px-2.5 sm:py-1 rounded-xl transition-all cursor-pointer group text-left"
              title={isSuperAdmin ? "Click to View Users & Switch Roles" : "Active Session Profile"}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-2xs shrink-0">
                <img src="/rvs-logo.png" alt="RVS Seal" className="w-full h-full object-contain rounded-md" />
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-extrabold text-slate-900 leading-tight group-hover:text-teal-700 flex items-center gap-1">
                  <span className="truncate max-w-[110px]">{currentUser?.name || 'Staff User'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono border ${currentRole?.tagBg || 'bg-slate-100 text-slate-600'}`}>
                    {currentRole?.shortLabel || 'User'}
                  </span>
                </div>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign Out of Session"
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  )
}
