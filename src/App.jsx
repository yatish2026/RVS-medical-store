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
import { HospitalWards } from './components/HospitalWards'
import { Suppliers } from './components/Suppliers'
import { ToastContainer } from './components/ToastContainer'
import { InvoiceModal } from './components/InvoiceModal'
import { MedicineModal } from './components/MedicineModal'
import { PatientModal } from './components/PatientModal'
import { RequisitionModal } from './components/RequisitionModal'
import { SupplierModal } from './components/SupplierModal'
import { RevenueAnalyticsModal } from './components/RevenueAnalyticsModal'

export function App() {
  const { activeTab } = useApp()

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Modal States
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [targetMedForBatch, setTargetMedForBatch] = useState(null)

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false)
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false)

  // Handlers for Medicine & Batch modals
  const handleOpenNewMedicine = () => {
    setEditingMedicine(null)
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-teal-500 selection:text-white relative">
      {/* Top Navigation Bar */}
      <Header
        onOpenMedicineModal={handleOpenNewMedicine}
        onOpenPatientModal={() => setIsPatientModalOpen(true)}
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
              onOpenBatchModal={handleOpenBatchModal}
              onEditMedicine={handleEditMedicine}
            />
          )}

          {activeTab === 'pos' && <POSBilling />}

          {activeTab === 'expiry' && <ExpiryTracker />}

          {activeTab === 'patients' && (
            <Patients onOpenPatientModal={() => setIsPatientModalOpen(true)} />
          )}

          {activeTab === 'wards' && (
            <HospitalWards onOpenRequisitionModal={() => setIsRequisitionModalOpen(true)} />
          )}

          {activeTab === 'suppliers' && (
            <Suppliers onOpenSupplierModal={() => setIsSupplierModalOpen(true)} />
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
      <RequisitionModal
        isOpen={isRequisitionModalOpen}
        onClose={() => setIsRequisitionModalOpen(false)}
      />
      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
      />
      <ToastContainer />
    </div>
  )
}

export default App

