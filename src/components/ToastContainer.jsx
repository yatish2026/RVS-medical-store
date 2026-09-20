import React from 'react'
import { useApp } from '../context/AppContext'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

export const ToastContainer = () => {
  const { notifications, dismissNotification } = useApp()

  if (!notifications || notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-3 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-1.5rem)] sm:w-88 pointer-events-none">
      {notifications.map((n) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0 mt-0.5" />,
          info: <Info className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 shrink-0 mt-0.5" />
        }

        const cardStyles = {
          success: 'border-emerald-300/80 bg-white/95 text-emerald-950 shadow-emerald-500/10 ring-1 ring-emerald-200/50',
          warning: 'border-amber-300/80 bg-white/95 text-amber-950 shadow-amber-500/10 ring-1 ring-amber-200/50',
          error: 'border-rose-300/80 bg-white/95 text-rose-950 shadow-rose-500/10 ring-1 ring-rose-200/50',
          info: 'border-teal-300/80 bg-white/95 text-teal-950 shadow-teal-500/10 ring-1 ring-teal-200/50'
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 sm:p-3.5 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-top-3 fade-in duration-200 ${
              cardStyles[n.type] || cardStyles.info
            }`}
          >
            {icons[n.type] || icons.info}
            
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="font-extrabold text-xs sm:text-sm leading-tight text-slate-900">
                {n.title}
              </h4>
              <p className="text-[11px] sm:text-xs mt-0.5 text-slate-600 leading-snug font-medium line-clamp-2">
                {n.message}
              </p>
            </div>

            {/* Cancel / Dismiss 'X' button */}
            <button
              onClick={() => dismissNotification(n.id)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0 -mt-0.5 -mr-0.5 cursor-pointer"
              title="Dismiss notification"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

