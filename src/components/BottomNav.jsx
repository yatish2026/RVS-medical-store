import React from 'react'
import { useApp } from '../context/AppContext'
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  Hourglass,
  Users
} from 'lucide-react'

export const BottomNav = () => {
  const {
    activeTab,
    setActiveTab,
    cart,
    lowStockItems,
    expiredCount,
    criticalExpiryCount
  } = useApp()

  const totalExpiryAlerts = expiredCount + criticalExpiryCount

  const tabs = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Pill,
      badge: lowStockItems.length > 0 ? lowStockItems.length : null,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'pos',
      label: 'Billing',
      icon: ShoppingCart,
      badge: cart.length > 0 ? cart.length : null,
      badgeColor: 'bg-rose-500 animate-pulse'
    },
    {
      id: 'expiry',
      label: 'Expiry',
      icon: Hourglass,
      badge: totalExpiryAlerts > 0 ? totalExpiryAlerts : null,
      badgeColor: 'bg-rose-600 animate-bounce'
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: Users,
      badge: null
    }
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 shadow-lg lg:hidden flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
              isActive
                ? 'text-teal-700 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-teal-50 text-teal-700 scale-105' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {tab.badge !== null && tab.badge > 0 && (
                <span
                  className={`absolute -top-1 -right-1 text-white font-mono text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs ${tab.badgeColor || 'bg-teal-600'}`}
                >
                  {tab.badge}
                </span>
              )}
            </div>

            <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-teal-800' : 'text-slate-500'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
