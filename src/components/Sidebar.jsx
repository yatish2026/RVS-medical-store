import React from 'react'
import { useApp } from '../context/AppContext'
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  Hourglass,
  Users,
  Percent,
  X,
  PhoneCall,
  ShieldCheck
} from 'lucide-react'

export const Sidebar = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    medicines,
    preApprovedDiscount,
    lowStockItems,
    expiredCount,
    criticalExpiryCount,
    cart,
    patients,
    sales,
    currentUser,
    currentRole,
    canManageUsers,
    isReadOnly,
    setIsAuthModalOpen,
    setIsUserManagementModalOpen
  } = useApp()

  const totalExpiryAlerts = expiredCount + criticalExpiryCount
  const discountedMedicinesCount = medicines.filter(
    (m) => (parseFloat(m.default_discount_percent) || 0) > 0
  ).length

  // Navigation Items with Role-Based Access Controls
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
      color: 'text-teal-600'
    },
    {
      id: 'inventory',
      label: 'Medicine Inventory',
      icon: Pill,
      badge: lowStockItems.length > 0 ? `${lowStockItems.length} Low` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      color: 'text-emerald-600'
    },
    {
      id: 'pos',
      label: 'Billing Terminal',
      icon: ShoppingCart,
      badge: cart.length > 0 ? `${cart.length} in cart` : 'Fast',
      badgeColor: cart.length > 0 ? 'bg-teal-100 text-teal-800 border-teal-300 font-bold' : 'bg-slate-100 text-slate-600',
      color: 'text-cyan-600'
    },
    {
      id: 'expiry',
      label: 'Expiry Date Radar',
      icon: Hourglass,
      badge: totalExpiryAlerts > 0 ? `${totalExpiryAlerts} alert` : 'Safe',
      badgeColor: totalExpiryAlerts > 0 ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse' : 'bg-slate-100 text-slate-600',
      color: 'text-rose-600'
    },
    {
      id: 'patients',
      label: 'Patients & Records',
      icon: Users,
      badge: sales.length > 0 ? `${sales.length} Bills` : (patients.length > 0 ? `${patients.length}` : null),
      badgeColor: 'bg-sky-50 text-sky-800 border-sky-200 font-bold',
      color: 'text-sky-600'
    },
    {
      id: 'discounts',
      label: 'Discount Control',
      icon: Percent,
      badge: (preApprovedDiscount?.percent > 0)
        ? `${preApprovedDiscount.percent}% All`
        : (discountedMedicinesCount > 0 ? `${discountedMedicinesCount} Items` : null),
      badgeColor: (preApprovedDiscount?.percent > 0)
        ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold'
        : 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
      color: 'text-purple-600'
    }
  ]

  const handleNavClick = (id) => {
    setActiveTab(id)
    if (onClose) onClose()
  }

  return (
    <>
      {/* Sidebar Container: Off-canvas drawer on mobile (<lg), static left bar on desktop (>=lg) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shadow-xl lg:shadow-xs transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0 lg:min-h-[calc(100vh-4rem)] lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-teal-200 p-0.5 flex items-center justify-center shadow-xs">
                <img src="/rvs-logo.png" alt="RVS Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">RVS Pharmacy</h4>
                <p className="text-[10px] text-teal-700 font-mono font-semibold">Dispensary Menu</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section Title */}
          <div className="px-3 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
            <span>Clinical Modules</span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">RVS v1.0</span>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}

            {/* Super Admin User Management Quick Nav */}
            {canManageUsers && (
              <button
                onClick={() => {
                  setIsUserManagementModalOpen(true)
                  if (onClose) onClose()
                }}
                className="w-full mt-2 flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-600 text-white shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="truncate font-bold">User & Role Admin</span>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-purple-200 text-purple-900">
                  Admin
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Read-Only Banner for Supervisor Viewer */}
        {isReadOnly && (
          <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <div className="font-bold flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Supervisor Audit Mode
            </div>
            <p className="text-[10px] text-amber-700 mt-0.5 leading-tight">
              All records are read-only. Editing, deleting, and billing actions are locked.
            </p>
          </div>
        )}

        {/* Active User Session Profile Box */}
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="bg-gradient-to-br from-slate-50 to-teal-50/50 border border-slate-200 p-3 rounded-2xl relative">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">
                  Active Session
                </span>
              </div>
              <button
                onClick={() => {
                  setIsAuthModalOpen(true)
                  if (onClose) onClose()
                }}
                className="text-[10px] font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
              >
                Switch Role
              </button>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-2xs shrink-0">
                <img src="/rvs-logo.png" alt="RVS Seal" className="w-full h-full object-contain rounded-sm" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">
                  {currentUser?.name || 'Staff User'}
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate">
                  {currentUser?.designation || currentRole?.shortLabel}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200">
              <span className={`px-1.5 py-0.2 rounded font-bold border ${currentRole?.tagBg || 'bg-slate-100 text-slate-700'}`}>
                {currentRole?.shortLabel}
              </span>
              <span className="text-slate-400">RVS Hospital</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

