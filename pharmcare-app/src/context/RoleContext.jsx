import { createContext, useContext, useState, useEffect } from 'react'

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
    assignedPharmacy: '69dfdba29b7248a1a8bf4ae9' // Dhanmondi
  },
  pharmacist: {
    label: 'Pharmacist',
    icon: 'medical_services',
    name: 'Dr. Alex Smith',
    color: '#006c49',
    assignedPharmacy: '69dfdba29b7248a1a8bf4ae9' // Dhanmondi
  },
  assistant: {
    label: 'Store Assistant',
    icon: 'storefront',
    name: 'Anna Kwak',
    color: '#005b8e',
    assignedPharmacy: '69dfdba29b7248a1a8bf4ae9' // Dhanmondi
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
  const [role, _setRole] = useState(localStorage.getItem('userRole') || 'customer')
  const [userData, _setUserData] = useState(JSON.parse(localStorage.getItem('userData') || '{}'))

  const setRole = (newRole, data = null) => {
    localStorage.setItem('userRole', newRole)
    _setRole(newRole)
    if (data) {
      localStorage.setItem('userData', JSON.stringify(data))
      _setUserData(data)
    }
  }

  useEffect(() => {
    // 1. Auto-heal missing userData from defaults if needed (Demo/Stale state fix)
    if (!userData?.assignedPharmacy && roles[role]?.assignedPharmacy) {
      const mergedData = { ...userData, ...roles[role] }
      localStorage.setItem('userData', JSON.stringify(mergedData))
      _setUserData(mergedData)
      console.log('Session auto-healed with pharmacy:', mergedData.assignedPharmacy)
    }

    // 2. TOKEN AUTO-HEAL: Ensure userData has the token from localStorage
    const savedToken = localStorage.getItem('token')
    if (savedToken && !userData?.token) {
      const dataWithToken = { ...userData, token: savedToken }
      localStorage.setItem('userData', JSON.stringify(dataWithToken))
      _setUserData(dataWithToken)
      console.log('Session auto-healed with security token.')
    }
  }, [role, userData])

  return (
    <RoleContext.Provider value={{ role, setRole, roles, userData }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
