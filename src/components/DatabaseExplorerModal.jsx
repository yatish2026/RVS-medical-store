import React, { useState, useEffect } from 'react'
import {
  Database,
  X,
  RefreshCw,
  HardDrive,
  Table as TableIcon,
  Layers,
  FileCode,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { apiGetDbStats, apiGetDbTable } from '../lib/api'

export const DatabaseExplorerModal = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null)
  const [selectedTable, setSelectedTable] = useState('users')
  const [tableData, setTableData] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingTable, setLoadingTable] = useState(false)
  const [viewMode, setViewMode] = useState('table') // 'table' | 'json'

  const fetchStats = async () => {
    try {
      setLoadingStats(true)
      const data = await apiGetDbStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to load DB stats', err)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchTable = async (tableName) => {
    try {
      setLoadingTable(true)
      const data = await apiGetDbTable(tableName)
      setTableData(data)
    } catch (err) {
      console.error(`Failed to load table ${tableName}`, err)
      setTableData(null)
    } finally {
      setLoadingTable(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchStats()
      fetchTable(selectedTable)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && selectedTable) {
      fetchTable(selectedTable)
    }
  }, [selectedTable])

  if (!isOpen) return null

  const columns = tableData?.rows?.length > 0 ? Object.keys(tableData.rows[0]) : []

  const handleDownloadBackup = () => {
    if (!tableData) return
    const blob = new Blob([JSON.stringify(tableData.rows, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sqlite_${selectedTable}_export.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">Live SQLite Database Explorer</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                File: <span className="text-teal-300">pythonanywhere/hospital.db</span> (Persistent Storage on Disk)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchStats()
                fetchTable(selectedTable)
              }}
              disabled={loadingStats || loadingTable}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats || loadingTable ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Banner for PythonAnywhere Free Tier */}
        <div className="px-6 py-2.5 bg-blue-50/90 border-b border-blue-100 flex items-start gap-2.5 text-xs text-blue-900 shrink-0">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Why isn't this in the PythonAnywhere "Databases" tab?</span> PythonAnywhere's "Databases" tab is strictly reserved for paid cloud MySQL servers. Your system runs on <strong>SQLite 3</strong>, which is 100% free, saved permanently on disk inside the <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-blue-800">Files</code> tab (<code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-blue-800">/home/yatish/RVS-medical-store/pythonanywhere/hospital.db</code>), and requires $0 to run forever.
          </div>
        </div>

        {/* Database Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Database Engine</span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <HardDrive className="w-3.5 h-3.5 text-teal-600" />
              SQLite 3 File DB
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Records</span>
            <span className="text-xs font-black text-slate-900 mt-0.5 block font-mono">
              {stats?.total_records ?? '...'} records
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Database Size</span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block font-mono">
              {stats?.file_size_kb ? `${stats.file_size_kb} KB` : 'Active'}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tables</span>
            <span className="text-xs font-bold text-teal-700 mt-0.5 block font-mono">
              {stats?.tables?.length || 9} Tables Registered
            </span>
          </div>
        </div>

        {/* Main Content Layout: Table Tabs on Left, Data on Right */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Table List Selector */}
          <div className="w-full md:w-56 border-r border-slate-200 bg-slate-50/70 p-3 overflow-y-auto shrink-0 flex md:flex-col gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 hidden md:block">
              Database Tables
            </span>
            {(stats?.tables || [
              { name: 'users', count: 4 },
              { name: 'medicines', count: 0 },
              { name: 'batches', count: 0 },
              { name: 'patients', count: 0 },
              { name: 'suppliers', count: 0 },
              { name: 'hospital_requisitions', count: 0 },
              { name: 'sales', count: 0 },
              { name: 'sale_items', count: 0 },
              { name: 'clinical_discount_policy', count: 1 }
            ]).map((tbl) => (
              <button
                key={tbl.name}
                onClick={() => setSelectedTable(tbl.name)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer shrink-0 ${
                  selectedTable === tbl.name
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <TableIcon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="truncate capitalize">{tbl.name.replace(/_/g, ' ')}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ml-1.5 ${
                  selectedTable === tbl.name ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tbl.count ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Table Data Viewer */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
            
            {/* Table Toolbar */}
            <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 capitalize">
                  Table: <span className="text-teal-700 font-mono">{selectedTable}</span>
                </span>
                <span className="text-xs text-slate-400">
                  ({tableData?.rows?.length || 0} rows loaded)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                      viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setViewMode('json')}
                    className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                      viewMode === 'json' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Raw JSON
                  </button>
                </div>

                {/* Export Button */}
                <button
                  onClick={handleDownloadBackup}
                  disabled={!tableData?.rows?.length}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* Table Content Area */}
            <div className="flex-1 overflow-auto p-4">
              {loadingTable ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                  <span className="text-xs font-bold">Querying SQLite database...</span>
                </div>
              ) : tableData?.rows?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center p-6 text-slate-400">
                  <Database className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                  <p className="text-sm font-bold text-slate-600">Table is currently empty</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Records added through the pharmacy dashboard or POS will be saved here immediately.
                  </p>
                </div>
              ) : viewMode === 'table' ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-mono text-[10px]">
                      <tr>
                        {columns.map((col) => (
                          <th key={col} className="px-3.5 py-2.5 font-bold tracking-wider whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {tableData.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-teal-50/40 transition-colors">
                          {columns.map((col) => (
                            <td key={col} className="px-3.5 py-2 whitespace-nowrap font-mono text-[11px] text-slate-800">
                              {typeof row[col] === 'object' && row[col] !== null
                                ? JSON.stringify(row[col])
                                : String(row[col] ?? '—')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <pre className="bg-slate-900 text-teal-300 p-4 rounded-xl text-xs font-mono overflow-auto max-h-[50vh] border border-slate-800">
                  {JSON.stringify(tableData?.rows, null, 2)}
                </pre>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>SQLite active on PythonAnywhere. Changes persist immediately to disk.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close Explorer
          </button>
        </div>

      </div>
    </div>
  )
}
