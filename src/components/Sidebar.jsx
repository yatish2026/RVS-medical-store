import React from 'react'
import { useApp } from '../context/AppContext'
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  Hourglass,
  Users,
  Building,
  Truck,
  X,
  PhoneCall,
  ShieldCheck
} from 'lucide-react'

export const Sidebar = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    lowStockItems,
    expiredCount,
    criticalExpiryCount,
    cart,
    requisitions
  } = useApp()

  const totalExpiryAlerts = expiredCount + criticalExpiryCount
  const pendingRequisitions = requisitions.filter(r => r.status === 'Requested' || r.priority === 'Emergency').length

  // Navigation Items (Supabase developer tab removed for end users)
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
      badge: null,
      color: 'text-sky-600'
    },
    {
      id: 'wards',
      label: 'Hospital Wards & ER',
      icon: Building,
      badge: pendingRequisitions > 0 ? `${pendingRequisitions} ER` : null,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      color: 'text-indigo-600'
    },
    {
      id: 'suppliers',
      label: 'Suppliers & Orders',
      icon: Truck,
      badge: null,
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
          </nav>
        </div>

        {/* Clinical Info & Help Box */}
        <div className="mt-4 pt-3 border-t border-slate-200">
          <div className="bg-gradient-to-br from-slate-50 to-teal-50/50 border border-teal-100 p-3.5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">RVS Pharmacy Desk</h5>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
              24x7 In-House Dispensary & Central Pharmacy Ward.
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-teal-700 font-bold flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-teal-600" />
                Ext: 404 / 405
              </span>
              <span className="text-slate-500">Central Wing</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

