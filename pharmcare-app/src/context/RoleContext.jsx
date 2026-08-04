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
  const [role, _setRole] = useState(localStorage.getItem('userRole') || 'customer')
  const [userData, _setUserData] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('userData') || '{}')
    const savedToken = localStorage.getItem('token')
    if (savedToken && !saved.token) {
      const updated = { ...saved, token: savedToken }
      localStorage.setItem('userData', JSON.stringify(updated))
      return updated
    }
    return saved
  })

  const setRole = (newRole, data = null) => {
    localStorage.setItem('userRole', newRole)
    _setRole(newRole)
    if (data) {
      const existingData = JSON.parse(localStorage.getItem('userData') || '{}')
      const mergedData = data.token 
        ? { ...existingData, ...data } 
        : { ...data, ...existingData, token: existingData.token || localStorage.getItem('token') };
      
      localStorage.setItem('userData', JSON.stringify(mergedData))
      _setUserData(mergedData)
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    
    // Auto-fetch dynamic pharmacy branch for staff roles if missing
    if (['owner', 'pharmacist', 'assistant'].includes(role) && !userData?.assignedPharmacy) {
      fetch('/api/pharmacies', {
        headers: savedToken ? { 'Authorization': `Bearer ${savedToken}` } : {}
      })
        .then(res => res.json())
        .then(branches => {
          if (Array.isArray(branches) && branches.length > 0) {
            const firstBranchId = branches[0]._id
            _setUserData(prev => {
              if (prev?.assignedPharmacy === firstBranchId) return prev
              const updated = { ...prev, assignedPharmacy: firstBranchId }
              localStorage.setItem('userData', JSON.stringify(updated))
              return updated
            })
          }
        })
        .catch(() => {})
    }
  }, [role, userData?.assignedPharmacy])

  return (
    <RoleContext.Provider value={{ role, setRole, roles, userData }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
