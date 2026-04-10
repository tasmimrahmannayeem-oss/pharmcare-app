import { createContext, useContext, useState } from 'react'

const RoleContext = createContext(null)

export const roles = {
  superadmin: {
    label: 'Super Admin',
    icon: 'supervisor_account',
    name: 'System Admin',
    color: '#00288e',
  },
  owner: {
    label: 'Pharmacy Owner',
    icon: 'admin_panel_settings',
    name: 'Dr. Sarah Chen',
    color: '#872d00',
  },
  pharmacist: {
    label: 'Pharmacist',
    icon: 'medical_services',
    name: 'Dr. Alex Smith',
    color: '#006c49',
  },
  assistant: {
    label: 'Store Assistant',
    icon: 'storefront',
    name: 'Anna Kwak',
    color: '#005b8e',
  },
  customer: {
    label: 'Customer',
    icon: 'person',
    name: 'John Doe',
    color: '#1e40af',
  },
  supplier: {
    label: 'Supplier',
    icon: 'local_shipping',
    name: 'MediSupply Ltd.',
    color: '#611e00',
  },
}

export function RoleProvider({ children }) {
  const [role, setRole] = useState('owner')
  return (
    <RoleContext.Provider value={{ role, setRole, roles }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
