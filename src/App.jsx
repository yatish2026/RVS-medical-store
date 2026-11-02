import React, { useState } from 'react'
import { useApp } from './context/AppContext'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './components/Dashboard'
import { Inventory } from './components/Inventory'
import { POSBilling } from './components/POSBilling'
import { ExpiryTracker } from './components/ExpiryTracker'
import { Patients } from './components/Patients'
import { ToastContainer } from './components/ToastContainer'
import { InvoiceModal } from './components/InvoiceModal'
import { MedicineModal } from './components/MedicineModal'
import { PatientModal } from './components/PatientModal'
import { RevenueAnalyticsModal } from './components/RevenueAnalyticsModal'
import { AuthModal } from './components/AuthModal'
import { UserManagementModal } from './components/UserManagementModal'
import { LoginPage } from './components/LoginPage'
import { DatabaseExplorerModal } from './components/DatabaseExplorerModal'
import { PdfImportModal } from './components/PdfImportModal'
import { DiscountControl } from './components/DiscountControl'

export function App() {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    currentRole,
    login,
    backendConnected,
    isDbExplorerOpen,
    setIsDbExplorerOpen
  } = useApp()

  // Security & Role tab enforcement: Ensure user is only viewing allowed modules
  React.useEffect(() => {
    if (currentUser) {
      const allowed = currentRole?.allowedTabs || ['pos']
      if (!allowed.includes(activeTab)) {
        setActiveTab(currentRole?.defaultTab || allowed[0] || 'pos')
      }
    }
  }, [currentUser, currentRole, activeTab, setActiveTab])

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Modal States
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [targetMedForBatch, setTargetMedForBatch] = useState(null)

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false)

  // Handlers for Medicine & Batch modals
  const handleOpenNewMedicine = (defaultCat) => {
    if (defaultCat && typeof defaultCat === 'string' && defaultCat !== 'ALL') {
      setEditingMedicine({ category: defaultCat, name: '', generic_name: '' })
    } else {
      setEditingMedicine(null)
    }
    setTargetMedForBatch(null)
    setIsMedicineModalOpen(true)
  }

  const handleEditMedicine = (med) => {
    setEditingMedicine(med)
    setTargetMedForBatch(null)
    setIsMedicineModalOpen(true)
  }

  const handleOpenBatchModal = (med) => {
    setEditingMedicine(null)
    setTargetMedForBatch(med)
    setIsMedicineModalOpen(true)
  }

  // If not logged in, display full-screen LoginPage
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased selection:bg-teal-500 selection:text-white">
        <LoginPage onLoginSuccess={login} backendConnected={backendConnected} />
        <ToastContainer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-teal-500 selection:text-white relative">
      {/* Top Navigation Bar */}
      <Header
        onOpenMedicineModal={handleOpenNewMedicine}
        onOpenPatientModal={() => setIsPatientModalOpen(true)}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Main Workspace Layout (Full width, sleek edge-to-edge layout) */}
      <div className="flex-1 flex w-full relative">
        {/* Left Clinical Sidebar */}
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 min-w-0 overflow-y-auto bg-slate-50/50 pb-24 lg:pb-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              onOpenMedicineModal={handleOpenNewMedicine}
              onOpenPatientModal={() => setIsPatientModalOpen(true)}
              onOpenBatchModal={handleOpenBatchModal}
              onOpenRevenueAnalytics={() => setIsRevenueModalOpen(true)}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory
              onOpenMedicineModal={handleOpenNewMedicine}
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
              onOpenBatchModal={handleOpenBatchModal}
              onEditMedicine={handleEditMedicine}
            />
          )}

          {activeTab === 'pos' && (
            <POSBilling
              onOpenMedicineModal={handleOpenNewMedicine}
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
            />
          )}

          {activeTab === 'expiry' && <ExpiryTracker />}

          {activeTab === 'patients' && (
            <Patients onOpenPatientModal={() => setIsPatientModalOpen(true)} />
          )}

          {activeTab === 'discounts' && (
            <DiscountControl onOpenMedicineModal={handleOpenNewMedicine} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Global Modals & Toasts */}
      <InvoiceModal />
      <RevenueAnalyticsModal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
      />
      <MedicineModal
        isOpen={isMedicineModalOpen}
        onClose={() => setIsMedicineModalOpen(false)}
        initialData={editingMedicine}
        targetMedicineForBatch={targetMedForBatch}
      />
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      />
      <AuthModal />
      <UserManagementModal />
      <DatabaseExplorerModal
        isOpen={isDbExplorerOpen}
        onClose={() => setIsDbExplorerOpen(false)}
      />
      <PdfImportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
      <ToastContainer />
    </div>
  )
}

export default App

