import React from 'react'
import { useApp } from '../context/AppContext'
import {
  X,
  Printer,
  CheckCircle2,
  Activity,
  Heart,
  FileText,
  Download,
  Share2
} from 'lucide-react'

export const InvoiceModal = () => {
  const { activeInvoice, setActiveInvoice } = useApp()

  if (!activeInvoice) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto invoice-modal-container">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 invoice-modal-box">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-teal-200 p-0.5 flex items-center justify-center shadow-xs">
              <img src="/rvs-logo.png" alt="RVS Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Clinical Cash Receipt / Invoice</h3>
              <p className="text-[11px] text-slate-500 font-mono font-semibold">Invoice #{activeInvoice.invoice_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={() => setActiveInvoice(null)}
              className="p-2 rounded-xl bg-slate-200/70 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area (Clinical Layout) */}
        <div id="printable-invoice" className="p-6 sm:p-8 bg-white text-slate-900 font-sans">
          
          {/* Hospital / Store Header */}
          <div className="border-b-2 border-teal-700 pb-4 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white border border-teal-200 p-0.5 flex items-center justify-center shadow-xs shrink-0">
                  <img src="/rvs-logo.png" alt="RVS Hospital Seal" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                    RVS MEDICAL STORE & HOSPITAL PHARMACY
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold">
                    RVS University & Multi-Speciality Medical Center
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-medium pl-0.5">
                24x7 Multi-Speciality Hospital Complex • Ground Floor Pharmacy Wing
              </p>
              <p className="text-[11px] text-slate-500 font-mono pl-0.5">
                DL No: KA-BNG-12984-20B/21B • GSTIN: 29RVSMD9988H1Z4 • Emergency: +91 80 2345 6789
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block bg-teal-50 border border-teal-300 text-teal-900 px-3 py-1 rounded-lg text-xs font-mono font-black">
                TAX INVOICE
              </div>
              <div className="text-xs font-mono font-bold text-slate-800 mt-1">
                {activeInvoice.invoice_number}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Date: {new Date(activeInvoice.created_at || Date.now()).toLocaleDateString()} {new Date(activeInvoice.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Patient & Doctor Meta */}
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-200 text-xs text-slate-700">
            <div>
              <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Patient Details</div>
              <div className="font-extrabold text-sm text-slate-900 mt-0.5">{activeInvoice.customer_name}</div>
              {activeInvoice.patient_uhid && (
                <div className="text-[11px] font-mono text-teal-800 font-bold">UHID: {activeInvoice.patient_uhid}</div>
              )}
              {activeInvoice.customer_phone && (
                <div className="text-[11px] text-slate-600 font-medium">Phone: {activeInvoice.customer_phone}</div>
              )}
            </div>

            <div className="text-right">
              <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Prescription & Payment</div>
              <div className="font-bold text-slate-800 mt-0.5">Doctor: {activeInvoice.doctor_name || 'Medical Officer'}</div>
              <div className="text-[11px] font-mono text-slate-600">Payment: <strong>{activeInvoice.payment_mode}</strong> ({activeInvoice.payment_status || 'Paid'})</div>
            </div>
          </div>

          {/* Medicines Line Items Table */}
          <div className="mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 text-[11px] font-extrabold uppercase tracking-wider bg-slate-50">
                  <th className="py-2 px-2">Item Description</th>
                  <th className="py-2 px-2">Batch</th>
                  <th className="py-2 px-2">Exp</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Price (₹)</th>
                  <th className="py-2 px-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {activeInvoice.items?.map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-2 px-2 font-bold text-slate-900">
                      {item.medicine_name}
                    </td>
                    <td className="py-2 px-2 font-mono text-[11px] text-slate-600">{item.batch_number}</td>
                    <td className="py-2 px-2 font-mono text-[11px] text-slate-600">{item.expiry_date || 'N/A'}</td>
                    <td className="py-2 px-2 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="py-2 px-2 text-right font-mono">₹{item.unit_price.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right font-mono font-black text-slate-900">₹{item.total_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="mt-4 pt-3 border-t-2 border-slate-300 flex justify-between items-start text-xs">
            <div className="text-[11px] text-slate-500 max-w-xs space-y-1">
              <p>• Goods once sold cannot be returned without original cash memo & intact blister pack.</p>
              <p>• Store medicines below 25°C or in refrigerator as specified on packet.</p>
            </div>

            <div className="w-60 space-y-1.5 text-right font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{activeInvoice.subtotal.toFixed(2)}</span>
              </div>
              {activeInvoice.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount:</span>
                  <span>-₹{activeInvoice.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>GST (CGST+SGST):</span>
                <span>+₹{activeInvoice.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-400 font-black text-base text-slate-950">
                <span>Net Total:</span>
                <span>₹{activeInvoice.grand_total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature Block */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              <div className="font-bold text-slate-800">Verified by Registered Pharmacist</div>
              <div className="text-[10px]">RVS Hospital Central Dispensary</div>
            </div>
            <div className="text-right">
              <div className="h-8 border-b border-slate-400 w-36 mb-1"></div>
              <div className="text-[10px]">Authorized Signatory</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
