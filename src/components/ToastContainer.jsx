import React from 'react'
import { useApp } from '../context/AppContext'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'

export const ToastContainer = () => {
  const { notifications } = useApp()

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {notifications.map((n) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-teal-600 shrink-0" />
        }

        const borderColors = {
          success: 'border-emerald-300 bg-emerald-50/95 text-emerald-900',
          warning: 'border-amber-300 bg-amber-50/95 text-amber-900',
          error: 'border-rose-300 bg-rose-50/95 text-rose-900',
          info: 'border-teal-300 bg-teal-50/95 text-teal-900'
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md animate-in slide-in-from-bottom-3 duration-300 ${borderColors[n.type] || borderColors.info}`}
          >
            {icons[n.type] || icons.info}
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-sm leading-tight text-slate-900">{n.title}</h4>
              <p className="text-xs mt-1 text-slate-700 leading-relaxed font-medium">{n.message}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
