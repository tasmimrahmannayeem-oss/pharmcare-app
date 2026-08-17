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

export function normalizeRole(raw) {
  if (!raw) return 'customer'
  const lower = String(raw).toLowerCase()
  if (lower.includes('owner')) return 'owner'
  if (lower.includes('pharmacist')) return 'pharmacist'
  if (lower.includes('assistant')) return 'assistant'
  if (lower.includes('admin')) return 'superadmin'
  if (lower.includes('supplier')) return 'supplier'
  if (lower.includes('customer')) return 'customer'
  return lower
}

export function RoleProvider({ children }) {
  const [role, _setRole] = useState(() => {
    const savedRole = localStorage.getItem('userRole')
    const savedData = JSON.parse(localStorage.getItem('userData') || '{}')
    return normalizeRole(savedRole || savedData.role)
  })

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
    const normalized = normalizeRole(newRole || data?.role)
    localStorage.setItem('userRole', normalized)
    _setRole(normalized)

    if (data) {
      const existingData = JSON.parse(localStorage.getItem('userData') || '{}')
      const isNewUser = (data._id && existingData._id && data._id !== existingData._id) || 
                        (data.email && existingData.email && data.email !== existingData.email);
                        
      let mergedData = isNewUser ? { ...data } : { ...existingData, ...data };
      if (!mergedData.token) mergedData.token = localStorage.getItem('token');
      
      localStorage.setItem('userData', JSON.stringify(mergedData))
      _setUserData(mergedData)
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken && userData?._id) {
      fetch(`/api/users/${userData._id}`, {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(profile => {
          if (profile && profile.assignedPharmacy) {
            _setUserData(prev => {
              const currentId = prev?.assignedPharmacy?._id || prev?.assignedPharmacy
              const profileId = profile.assignedPharmacy?._id || profile.assignedPharmacy
              if (currentId === profileId && typeof prev?.assignedPharmacy === 'object') return prev
              
              const updated = {
                ...prev,
                assignedPharmacy: profile.assignedPharmacy
              }
              localStorage.setItem('userData', JSON.stringify(updated))
              return updated
            })
          }
        })
        .catch(() => {})
    }
  }, [userData?._id])

  return (
    <RoleContext.Provider value={{ role, setRole, roles, userData }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
