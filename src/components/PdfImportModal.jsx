import React, { useState, useRef } from 'react'
import {
  FileUp,
  FileText,
  X,
  Upload,
  Sparkles,
  Pill,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  RefreshCw,
  Layers,
  Calendar,
  Building,
  Check,
  ClipboardPaste,
  ShieldAlert
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useApp } from '../context/AppContext'

// Standard hospital drug database dictionary for intelligent fuzzy extraction
const DRUG_DICTIONARY = [
  { name: 'Paracetamol', form: 'Tablet', category: 'Analgesics & Antipyretics', defaultStrength: '650mg', mrp: 35, hsn: '30049099' },
  { name: 'Dolo 650', form: 'Tablet', category: 'Analgesics & Antipyretics', defaultStrength: '650mg', mrp: 34, hsn: '30049099' },
  { name: 'Pantoprazole', form: 'Tablet', category: 'Gastrointestinal & Antacids', defaultStrength: '40mg', mrp: 110, hsn: '30049099' },
  { name: 'Pan 40', form: 'Tablet', category: 'Gastrointestinal & Antacids', defaultStrength: '40mg', mrp: 115, hsn: '30049099' },
  { name: 'Amoxicillin + Clavulanate', form: 'Tablet', category: 'Antibiotics', defaultStrength: '625mg', mrp: 195, hsn: '30041010' },
  { name: 'Augmentin 625 Duo', form: 'Tablet', category: 'Antibiotics', defaultStrength: '625mg', mrp: 210, hsn: '30041010' },
  { name: 'Azithromycin', form: 'Tablet', category: 'Antibiotics', defaultStrength: '500mg', mrp: 125, hsn: '30042099' },
  { name: 'Aziwok 500', form: 'Tablet', category: 'Antibiotics', defaultStrength: '500mg', mrp: 130, hsn: '30042099' },
  { name: 'Ceftriaxone 1g Inj', form: 'Injection', category: 'Critical Care & Injections', defaultStrength: '1000mg', mrp: 75, hsn: '30042099' },
  { name: 'Monocef 1g', form: 'Injection', category: 'Critical Care & Injections', defaultStrength: '1000mg', mrp: 82, hsn: '30042099' },
  { name: 'Metformin', form: 'Tablet', category: 'Antidiabetic', defaultStrength: '500mg', mrp: 45, hsn: '30049099' },
  { name: 'Glycomet 500', form: 'Tablet', category: 'Antidiabetic', defaultStrength: '500mg', mrp: 48, hsn: '30049099' },
  { name: 'Atorvastatin', form: 'Tablet', category: 'Cardiovascular', defaultStrength: '10mg', mrp: 95, hsn: '30049099' },
  { name: 'Amlodipine', form: 'Tablet', category: 'Cardiovascular', defaultStrength: '5mg', mrp: 38, hsn: '30049099' },
  { name: 'Telmisartan', form: 'Tablet', category: 'Cardiovascular', defaultStrength: '40mg', mrp: 85, hsn: '30049099' },
  { name: 'Ondansetron 4mg', form: 'Tablet', category: 'Gastrointestinal & Antacids', defaultStrength: '4mg', mrp: 52, hsn: '30049099' },
  { name: 'Emset 4mg', form: 'Tablet', category: 'Gastrointestinal & Antacids', defaultStrength: '4mg', mrp: 55, hsn: '30049099' },
  { name: 'Cetirizine', form: 'Tablet', category: 'Respiratory & Antiallergic', defaultStrength: '10mg', mrp: 22, hsn: '30049099' },
  { name: 'Montelukast + Levocetirizine', form: 'Tablet', category: 'Respiratory & Antiallergic', defaultStrength: '10mg/5mg', mrp: 140, hsn: '30049099' },
  { name: 'Montair LC', form: 'Tablet', category: 'Respiratory & Antiallergic', defaultStrength: '10mg/5mg', mrp: 148, hsn: '30049099' },
  { name: 'Diclofenac Sodium', form: 'Tablet', category: 'Analgesics & Antipyretics', defaultStrength: '50mg', mrp: 30, hsn: '30049099' },
  { name: 'Voveran 50', form: 'Tablet', category: 'Analgesics & Antipyretics', defaultStrength: '50mg', mrp: 36, hsn: '30049099' },
  { name: 'Tramadol 50mg Inj', form: 'Injection', category: 'Critical Care & Injections', defaultStrength: '50mg/ml', mrp: 42, hsn: '30049099' },
  { name: 'Normal Saline (0.9% NaCl)', form: 'IV Infusion', category: 'IV Fluids & Infusions', defaultStrength: '500ml', mrp: 48, hsn: '30049099' },
  { name: 'Ringer Lactate (RL)', form: 'IV Infusion', category: 'IV Fluids & Infusions', defaultStrength: '500ml', mrp: 55, hsn: '30049099' },
  { name: 'B-Complex with Vitamin C', form: 'Capsule', category: 'Vitamins & Supplements', defaultStrength: 'Standard', mrp: 42, hsn: '30045020' },
  { name: 'Becosules', form: 'Capsule', category: 'Vitamins & Supplements', defaultStrength: 'Standard', mrp: 45, hsn: '30045020' }
]

export const PdfImportModal = ({ isOpen, onClose }) => {
  const { addMedicineWithBatch, notify, canAddMedicine } = useApp()

  const [activeTab, setActiveTab] = useState('upload') // 'upload' | 'paste'
  const [file, setFile] = useState(null)
  const [rawText, setRawText] = useState('')
  const [extractedMedicines, setExtractedMedicines] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [parseSummary, setParseSummary] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const fileInputRef = useRef(null)

  if (!isOpen) return null

  // Generate safe expiry 18 months in the future
  const getFutureExpiry = (monthsAhead = 18) => {
    const d = new Date()
    d.setMonth(d.getMonth() + monthsAhead)
    return d.toISOString().split('T')[0]
  }

  // --- 1. INTELLIGENT MEDICAL TEXT PARSER ---
  const parseMedicalText = (text) => {
    const lines = text.split(/\r?\n/)
    const results = []
    const detectedNames = new Set()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.length < 3) continue

      // A. Match against Drug Dictionary
      let matchedDict = null
      for (const drug of DRUG_DICTIONARY) {
        const regex = new RegExp(`\\b${drug.name.replace(/\+/g, '\\+')}\\b`, 'i')
        if (regex.test(line)) {
          matchedDict = drug
          break
        }
      }

      // B. Match regex patterns like: "Tab. Metformin 500mg" or "1. Pantoprazole 40mg"
      const medPattern = /(?:(?:Tab|Cap|Inj|Syr|Drops|Oint|Susp|Cream)\.?\s+)?([A-Za-z0-9\s\+\-\/]+?)(?:\s+(\d+(?:\.\d+)?\s*(?:mg|ml|gm|mcg|iu|%)))/i
      const regexMatch = line.match(medPattern)

      let medName = ''
      let strength = ''
      let form = 'Tablet'
      let category = 'General Formulary'
      let mrp = 100

      if (matchedDict) {
        medName = matchedDict.name
        strength = matchedDict.defaultStrength
        form = matchedDict.form
        category = matchedDict.category
        mrp = matchedDict.mrp
      } else if (regexMatch && regexMatch[1] && regexMatch[1].trim().length > 3) {
        const candidate = regexMatch[1].trim()
        // Skip common header words
        if (!/^(patient|doctor|invoice|hospital|date|total|bill|phone|address|subtotal|signature)/i.test(candidate)) {
          medName = candidate
          strength = regexMatch[2]?.trim() || '500mg'
          if (/inj|injection/i.test(line)) form = 'Injection'
          else if (/cap|capsule/i.test(line)) form = 'Capsule'
          else if (/syr|syrup/i.test(line)) form = 'Syrup'
          else if (/infusion|iv|dextrose|saline/i.test(line)) form = 'IV Infusion'
          else form = 'Tablet'
        }
      }

      if (!medName || detectedNames.has(medName.toLowerCase())) continue
      detectedNames.add(medName.toLowerCase())

      // Extract Batch Number if available
      const batchMatch = line.match(/(?:batch|b\.?no|lot)[\s\:\-]+([A-Za-z0-9\-]+)/i)
      const batchNo = batchMatch ? batchMatch[1].toUpperCase() : `BAT-${Math.floor(1000 + Math.random() * 9000)}`

      // Extract Expiry if available (e.g. 12/26 or 2027-05)
      const expMatch = line.match(/(?:exp|expiry)[\s\:\-]+(\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{2})/i)
      let expiryDate = getFutureExpiry(Math.floor(12 + Math.random() * 18))
      if (expMatch) {
        const val = expMatch[1]
        if (val.includes('/')) {
          const parts = val.split('/')
          if (parts.length === 2) {
            const yr = parts[1].length === 2 ? `20${parts[1]}` : parts[1]
            const mo = parts[0].padStart(2, '0')
            expiryDate = `${yr}-${mo}-28`
          }
        }
      }

      // Extract Quantity (e.g. 10 tabs, x 50, Qty: 20)
      const qtyMatch = line.match(/(?:qty|quantity|count|\bx)[\s\:\-]*(\d+)/i) || line.match(/(\d+)\s*(?:tabs|tablets|caps|strips|vials|bottles|pcs)/i)
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 50

      // Extract Price / Rate if given
      const priceMatch = line.match(/(?:mrp|rs\.?|inr|rate|price|\₹)[\s\:\-]*(\d+(?:\.\d+)?)/i)
      if (priceMatch) {
        mrp = parseFloat(priceMatch[1])
      }

      const costPrice = parseFloat((mrp * 0.72).toFixed(2))

      results.push({
        id: `extracted-${Date.now()}-${results.length}`,
        name: medName,
        generic_name: medName,
        category: category,
        dosage_form: form,
        strength: strength,
        manufacturer: 'Cipla Healthcare / Sun Pharma',
        shelf_location: `Rack ${String.fromCharCode(65 + (results.length % 6))}-0${(results.length % 4) + 1}`,
        min_stock_alert: 20,
        gst_rate: 12.0,
        // Batch details
        batch_number: batchNo,
        expiry_date: expiryDate,
        current_stock: quantity,
        cost_price: costPrice,
        mrp: mrp,
        selling_price: mrp,
        supplier_name: 'Primary Hospital Distributor'
      })
    }

    return results
  }

  // --- 2. EXTRACT TEXT FROM PDF / FILE ---
  const extractTextFromFile = async (fileObj) => {
    setIsProcessing(true)
    setParseSummary(null)

    try {
      let textContent = ''

      if (fileObj.type === 'text/plain' || fileObj.name.endsWith('.txt') || fileObj.name.endsWith('.csv')) {
        // Simple plain text / CSV
        textContent = await fileObj.text()
      } else if (fileObj.type === 'application/pdf' || fileObj.name.endsWith('.pdf')) {
        // A. Try loading Mozilla PDF.js dynamically
        let pdfjs = window.pdfjsLib
        if (!pdfjs) {
          try {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script')
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
              script.onload = () => {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
                resolve()
              }
              script.onerror = () => reject(new Error('PDF.js CDN blocked'))
              document.head.appendChild(script)
            })
            pdfjs = window.pdfjsLib
          } catch (cdnErr) {
            console.warn('PDF.js CDN unavailable, using local stream decoder fallback', cdnErr)
          }
        }

        if (pdfjs) {
          const arrayBuffer = await fileObj.arrayBuffer()
          const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
          const pdfDoc = await loadingTask.promise
          let fullText = ''

          for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum)
            const textPage = await page.getTextContent()
            const pageStrings = textPage.items.map(item => item.str).join(' ')
            fullText += `\n${pageStrings}`
          }
          textContent = fullText
        } else {
          // B. Native binary text scanner fallback (extracts plain text strings from PDF)
          const buffer = await fileObj.arrayBuffer()
          const uint8 = new Uint8Array(buffer)
          const binaryStr = new TextDecoder('latin1').decode(uint8)
          const matches = binaryStr.match(/\(([^()]+)\)\s*Tj/g) || binaryStr.match(/\[(.*?)\]\s*TJ/g)
          if (matches && matches.length > 0) {
            textContent = matches.map(m => m.replace(/[\(\)\[\]]|\s*T[jJ]/g, '')).join(' ')
          } else {
            // Strip out non-printable ascii
            textContent = binaryStr.replace(/[^\x20-\x7E\n\r]/g, ' ')
          }
        }
      }

      setRawText(textContent)
      const parsed = parseMedicalText(textContent)

      if (parsed.length === 0) {
        // If empty or purely scanned image, provide fallback suggestion
        notify('PDF Text Extracted', 'Scanned PDF text processed. Refine or enter medicines below.', 'info')
      } else {
        notify('Extraction Successful', `Identified ${parsed.length} medicines and batches from ${fileObj.name}!`, 'success')
      }

      setExtractedMedicines(parsed)
      setParseSummary({
        fileName: fileObj.name,
        fileSize: (fileObj.size / 1024).toFixed(1) + ' KB',
        detectedCount: parsed.length
      })
    } catch (err) {
      console.error('PDF parsing error', err)
      notify('Parsing Notice', 'Could not fully parse PDF streams. You can paste the text manually in the text tab.', 'warning')
    } finally {
      setIsProcessing(false)
    }
  }

  // --- 3. HANDLE FILE DROP / SELECT ---
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      extractTextFromFile(selected)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) {
      setFile(dropped)
      extractTextFromFile(dropped)
    }
  }

  // --- 4. LOAD SAMPLE DOCTOR PRESCRIPTION / INVOICE ---
  const handleLoadSample = (sampleType = 'prescription') => {
    let sampleContent = ''
    if (sampleType === 'prescription') {
      sampleContent = `
RVS MULTI-SPECIALTY HOSPITAL & CLINICAL DISPENSARY
OPD PRESCRIPTION SLIP • Dr. A. Sharma (MD, Senior Medical Officer)
Patient: Rajesh Kumar • Age: 42 • UHID: UHID-2026-9041
Date: 31-Oct-2026

Rx / Prescribed Medications:
1. Tab. Dolo 650 (Paracetamol 650mg) - 10 Tablets - Batch: DL-8891 - Exp: 12/2027 - Rs. 34.00
2. Cap. Augmentin 625 Duo (Amoxicillin + Clavulanate 625mg) - 10 Tablets - Batch: AG-2041 - Exp: 08/2027 - Rs. 210.00
3. Tab. Pan 40 (Pantoprazole 40mg) - 15 Tablets - Batch: PN-5021 - Exp: 05/2028 - Rs. 115.00
4. Tab. Montair LC (Montelukast + Levocetirizine 10mg/5mg) - 10 Tablets - Batch: MT-4011 - Exp: 10/2027 - Rs. 148.00
5. Tab. Glycomet 500 (Metformin 500mg) - 30 Tablets - Batch: GL-9920 - Exp: 03/2028 - Rs. 48.00
      `
    } else {
      sampleContent = `
APOLLO PHARMA DISTRIBUTORS - INWARD WHOLESALE TAX INVOICE
Invoice No: INV-AP-99214 • Date: 28-10-2026
Billed To: RVS Medical Store & Hospital Pharmacy

Items Received:
1. Monocef 1g Inj (Ceftriaxone 1000mg) - Qty: 50 Vials - Batch: MN-3019 - Exp: 09/2027 - Rate: 58.00 - MRP: 82.00
2. Aziwok 500 (Azithromycin 500mg) - Qty: 40 Strips - Batch: AZ-4412 - Exp: 11/2027 - Rate: 92.00 - MRP: 130.00
3. Voveran 50 (Diclofenac 50mg) - Qty: 100 Strips - Batch: VV-1029 - Exp: 06/2028 - Rate: 26.00 - MRP: 36.00
4. Emset 4mg (Ondansetron 4mg) - Qty: 60 Strips - Batch: EM-8921 - Exp: 04/2027 - Rate: 39.00 - MRP: 55.00
5. Ringer Lactate (RL 500ml) - Qty: 40 Bottles - Batch: RL-7711 - Exp: 01/2029 - Rate: 38.00 - MRP: 55.00
      `
    }

    setRawText(sampleContent)
    const parsed = parseMedicalText(sampleContent)
    setExtractedMedicines(parsed)
    setParseSummary({
      fileName: sampleType === 'prescription' ? 'Demo_Doctor_Prescription.pdf' : 'Wholesale_Inward_Invoice.pdf',
      fileSize: '18.4 KB',
      detectedCount: parsed.length
    })
    notify('Sample Loaded', `Parsed ${parsed.length} medicines from ${sampleType === 'prescription' ? 'Doctor Prescription' : 'Wholesale Invoice'}.`, 'success')
  }

  // --- 5. EDIT EXTRACED MEDICINES IN PREVIEW ---
  const handleUpdateItem = (index, field, value) => {
    setExtractedMedicines(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleDeleteItem = (index) => {
    setExtractedMedicines(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddNewRow = () => {
    const newItem = {
      id: `manual-${Date.now()}`,
      name: 'New Medicine',
      generic_name: 'Generic Compound',
      category: 'General Formulary',
      dosage_form: 'Tablet',
      strength: '500mg',
      manufacturer: 'Sun Pharma',
      shelf_location: 'Rack A-01',
      min_stock_alert: 20,
      gst_rate: 12.0,
      batch_number: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      expiry_date: getFutureExpiry(18),
      current_stock: 50,
      cost_price: 35.0,
      mrp: 50.0,
      selling_price: 50.0,
      supplier_name: 'Primary Hospital Distributor'
    }
    setExtractedMedicines(prev => [...prev, newItem])
  }

  // --- 6. 1-CLICK IMPORT TO INVENTORY ---
  const handleImportAll = async () => {
    if (extractedMedicines.length === 0) {
      notify('No Medicines', 'Please upload a PDF or enter medicine text first.', 'warning')
      return
    }

    setIsImporting(true)
    let addedCount = 0

    try {
      for (const item of extractedMedicines) {
        const medPayload = {
          name: item.name,
          generic_name: item.generic_name || item.name,
          category: item.category || 'General Formulary',
          dosage_form: item.dosage_form || 'Tablet',
          strength: item.strength || '',
          manufacturer: item.manufacturer || 'Standard Pharma',
          shelf_location: item.shelf_location || 'Rack A-01',
          min_stock_alert: parseInt(item.min_stock_alert, 10) || 20,
          prescription_required: true,
          hsn_code: '30049099',
          gst_rate: parseFloat(item.gst_rate) || 12.0
        }

        const batchPayload = {
          batch_number: item.batch_number || `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
          expiry_date: item.expiry_date,
          cost_price: parseFloat(item.cost_price) || 0,
          mrp: parseFloat(item.mrp) || 0,
          selling_price: parseFloat(item.selling_price) || parseFloat(item.mrp) || 0,
          current_stock: parseInt(item.current_stock, 10) || 0,
          supplier_name: item.supplier_name || 'Inward Invoice Import'
        }

        await addMedicineWithBatch(medPayload, batchPayload)
        addedCount++
      }

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      })

      notify(
        'Inventory Updated!',
        `Successfully imported ${addedCount} medicines & batches into your hospital formulary!`,
        'success'
      )
      onClose()
    } catch (err) {
      console.error('Import error', err)
      notify('Import Error', 'Some items could not be saved to backend database.', 'error')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-900 via-slate-900 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <FileUp className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  PDF Medicine Details Extractor & Inward Importer
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                  Smart Scanner
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Upload any Doctor Prescription PDF or Wholesale Purchase Bill to auto-populate the dispensary list.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Sample Bar */}
        <div className="px-6 py-2.5 bg-indigo-50/80 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-indigo-900 font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Don't have a PDF ready? Test with 1-click sample templates:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleLoadSample('prescription')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Load Doctor Prescription Slip</span>
            </button>
            <button
              onClick={() => handleLoadSample('invoice')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Load Wholesale Inward Bill</span>
            </button>
          </div>
        </div>

        {/* Tab Selector: Upload File vs Paste Text */}
        <div className="px-6 pt-3 flex items-center gap-3 border-b border-slate-200 bg-slate-50/50 shrink-0">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF / Document</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Paste Prescription Text</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* UPLOAD TAB */}
          {activeTab === 'upload' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 shadow-inner">
                <FileUp className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">
                {file ? file.name : 'Click to Upload or Drag & Drop Prescription / Invoice PDF'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Supports PDF invoices from suppliers (Cipla, Sun Pharma, Apollo) and doctor prescription PDFs.
              </p>
              <div className="flex items-center gap-2 mt-3 text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                <span>PDF • TXT • CSV</span>
                <span>|</span>
                <span>Auto-Extracts Name, Batch, Expiry, Qty & MRP</span>
              </div>
            </div>
          ) : (
            /* PASTE TEXT TAB */
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase font-mono">
                Paste Prescription or Inward Bill Content
              </label>
              <textarea
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value)
                  const parsed = parseMedicalText(e.target.value)
                  setExtractedMedicines(parsed)
                  setParseSummary({
                    fileName: 'Pasted_Text',
                    fileSize: `${e.target.value.length} chars`,
                    detectedCount: parsed.length
                  })
                }}
                rows={5}
                placeholder="Example:&#10;1. Dolo 650 - 10 Tabs - Batch: DL-8891 - Exp: 12/2027&#10;2. Pantoprazole 40mg - 20 Tabs - Batch: PN-5021 - Exp: 05/2028&#10;3. Monocef 1g Inj - 50 Vials - Batch: MN-3019 - Exp: 09/2027"
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-800 outline-hidden"
              />
            </div>
          )}

          {/* PARSE STATUS SUMMARY */}
          {parseSummary && (
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-bold text-teal-900">
                  Detected {extractedMedicines.length} Medicines & Batches from "{parseSummary.fileName}"
                </span>
                <span className="text-[10px] text-teal-700 font-mono">({parseSummary.fileSize})</span>
              </div>
              <button
                onClick={handleAddNewRow}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Drug Row</span>
              </button>
            </div>
          )}

          {/* EXTRACTED MEDICINES REVIEW TABLE */}
          {extractedMedicines.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase font-mono text-slate-700 tracking-wider">
                  Review & Edit Extracted Details Before Adding to Medicine List
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {extractedMedicines.length} item{extractedMedicines.length > 1 ? 's' : ''} ready
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="px-3 py-2.5 font-bold">#</th>
                        <th className="px-3 py-2.5 font-bold">Medicine Name & Strength</th>
                        <th className="px-3 py-2.5 font-bold">Dosage Form</th>
                        <th className="px-3 py-2.5 font-bold">Batch No</th>
                        <th className="px-3 py-2.5 font-bold">Expiry Date</th>
                        <th className="px-3 py-2.5 font-bold">Stock Qty</th>
                        <th className="px-3 py-2.5 font-bold">MRP (₹)</th>
                        <th className="px-3 py-2.5 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {extractedMedicines.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-3 py-2 font-mono text-slate-400 font-bold">{idx + 1}</td>
                          
                          {/* Name & Strength */}
                          <td className="px-3 py-2 min-w-[190px]">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                              className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:border-indigo-500 outline-hidden"
                            />
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] text-slate-400 font-mono">Str:</span>
                              <input
                                type="text"
                                value={item.strength}
                                onChange={(e) => handleUpdateItem(idx, 'strength', e.target.value)}
                                className="w-24 px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-mono text-slate-700 outline-hidden"
                                placeholder="500mg"
                              />
                            </div>
                          </td>

                          {/* Dosage Form */}
                          <td className="px-3 py-2">
                            <select
                              value={item.dosage_form}
                              onChange={(e) => handleUpdateItem(idx, 'dosage_form', e.target.value)}
                              className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium bg-white text-slate-800 outline-hidden"
                            >
                              <option value="Tablet">Tablet</option>
                              <option value="Capsule">Capsule</option>
                              <option value="Injection">Injection</option>
                              <option value="Syrup">Syrup</option>
                              <option value="IV Infusion">IV Infusion</option>
                              <option value="Ointment">Ointment</option>
                              <option value="Drops">Drops</option>
                            </select>
                          </td>

                          {/* Batch No */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.batch_number}
                              onChange={(e) => handleUpdateItem(idx, 'batch_number', e.target.value.toUpperCase())}
                              className="w-24 px-2 py-1 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-800 outline-hidden"
                            />
                          </td>

                          {/* Expiry Date */}
                          <td className="px-3 py-2">
                            <input
                              type="date"
                              value={item.expiry_date}
                              onChange={(e) => handleUpdateItem(idx, 'expiry_date', e.target.value)}
                              className="px-2 py-1 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 outline-hidden"
                            />
                          </td>

                          {/* Stock Qty */}
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="1"
                              value={item.current_stock}
                              onChange={(e) => handleUpdateItem(idx, 'current_stock', parseInt(e.target.value, 10) || 0)}
                              className="w-20 px-2 py-1 rounded-lg border border-slate-200 font-mono text-xs font-bold text-teal-700 outline-hidden"
                            />
                          </td>

                          {/* MRP */}
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.5"
                              value={item.mrp}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0
                                handleUpdateItem(idx, 'mrp', val)
                                handleUpdateItem(idx, 'selling_price', val)
                                handleUpdateItem(idx, 'cost_price', parseFloat((val * 0.72).toFixed(2)))
                              }}
                              className="w-20 px-2 py-1 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-900 outline-hidden"
                            />
                          </td>

                          {/* Delete */}
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => handleDeleteItem(idx)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Pill className="w-4 h-4 text-teal-600" />
            <span>Items will be added directly into hospital formulary & SQLite database.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleImportAll}
              disabled={isImporting || extractedMedicines.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-md shadow-teal-700/20 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Adding Medicines...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Add {extractedMedicines.length} Medicines to List</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
