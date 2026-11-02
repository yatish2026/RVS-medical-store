// Authentication and Role Definitions for RVS Medical Store & Hospital Management

export const ROLES = {
  admin_supervisor: {
    key: 'admin_supervisor',
    label: 'Super Admin (Full Edit & User Management)',
    shortLabel: 'Super Admin',
    description: 'Full administrative access. Can edit medicine stock, billing, discounts, and create/manage user logins with assigned roles.',
    badge: 'Full Access & Admin',
    canEdit: true,
    canAddMedicine: true,
    canDeleteMedicine: true,
    canManageUsers: true,
    canApplyDiscount: true,
    canBill: true,
    isReadOnly: false,
    color: 'purple',
    gradient: 'from-purple-600 to-indigo-600',
    tagBg: 'bg-purple-50 text-purple-700 border-purple-200',
    allowedTabs: ['dashboard', 'inventory', 'pos', 'expiry', 'patients', 'discounts'],
    defaultTab: 'dashboard'
  },
  doctor_mo: {
    key: 'doctor_mo',
    label: 'Medical Officer / Doctor (MO)',
    shortLabel: 'MO Doctor',
    description: 'Hospital Medical Officer. Can view inventory, review patient clinical records, and apply special complete pack / patient clinical discounts.',
    badge: 'Clinical & Discount Authority',
    canEdit: true,
    canAddMedicine: true,
    canDeleteMedicine: false,
    canManageUsers: false,
    canApplyDiscount: true, // Special Doctor authority: Can authorize complete pack discount
    canBill: true,
    isReadOnly: false,
    color: 'teal',
    gradient: 'from-teal-600 to-cyan-600',
    tagBg: 'bg-teal-50 text-teal-700 border-teal-200',
    allowedTabs: ['dashboard', 'inventory', 'pos', 'expiry', 'patients', 'discounts'],
    defaultTab: 'dashboard'
  },
  supervisor_viewer: {
    key: 'supervisor_viewer',
    label: 'Supervisor (Read-Only / Auditor)',
    shortLabel: 'Supervisor (Viewer)',
    description: 'Auditor & Observer role. Can inspect all records, stock levels, sales reports, and patient records, but cannot edit, add, or delete any data.',
    badge: 'Audit & View-Only',
    canEdit: false,
    canAddMedicine: false,
    canDeleteMedicine: false,
    canManageUsers: false,
    canApplyDiscount: false,
    canBill: false,
    isReadOnly: true, // Strictly read-only
    color: 'amber',
    gradient: 'from-amber-600 to-orange-600',
    tagBg: 'bg-amber-50 text-amber-700 border-amber-200',
    allowedTabs: ['dashboard', 'inventory', 'expiry', 'patients'],
    defaultTab: 'dashboard'
  },
  pharmacist: {
    key: 'pharmacist',
    label: 'Pharmacist (Dispensary)',
    shortLabel: 'Pharmacist',
    description: 'Dispensary operations. High-speed billing, medicine catalog, stock inward, and patient records. Strictly restricted from modifying discounts or editing medicine formulary pricing.',
    badge: 'Dispensary Station',
    canEdit: false, // Strictly restricted from editing existing medicine details/pricing (Admin only)
    canAddMedicine: true, // Can upload PDF prescriptions and register new medicine formulations
    canDeleteMedicine: false,
    canManageUsers: false,
    canApplyDiscount: false, // Strictly locked: Discounts cannot be modified or added by pharmacist
    canBill: true,
    isReadOnly: false,
    color: 'blue',
    gradient: 'from-blue-600 to-teal-600',
    tagBg: 'bg-blue-50 text-blue-700 border-blue-200',
    allowedTabs: ['dashboard', 'inventory', 'pos', 'expiry', 'patients'],
    defaultTab: 'pos'
  }
}

export const INITIAL_USERS = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'admin123',
    name: 'Dr. Yatish',
    role: 'admin_supervisor',
    designation: 'Chief Medical Administrator & Super Admin',
    phone: '+91 98765 43210'
  }
]
