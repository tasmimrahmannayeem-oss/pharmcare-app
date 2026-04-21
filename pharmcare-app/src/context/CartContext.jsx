import { createContext, useContext, useState, useEffect } from 'react'
import { useRole } from './RoleContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { userData } = useRole()
  const [cartItems, setCartItems] = useState([])
  const [prescriptionFile, setPrescriptionFile] = useState(null)
  const [selectedPharmacy, setSelectedPharmacy] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedPharmacy')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // 1. Persist pharmacy selection
  useEffect(() => {
    if (selectedPharmacy) {
      localStorage.setItem('selectedPharmacy', JSON.stringify(selectedPharmacy))
    } else {
      localStorage.removeItem('selectedPharmacy')
    }
  }, [selectedPharmacy])

  // 2. AUTO-SELECT for Staff: If user is assigned to a pharmacy, auto-select it
  useEffect(() => {
    const assigned = userData?.assignedPharmacy
    if (!assigned) return

    const syncPharmacy = async () => {
      // If it's already a full object that matches, skip
      if (typeof assigned === 'object' && assigned._id === selectedPharmacy?._id) return
      // If it's an ID that matches existing selection, skip
      if (typeof assigned === 'string' && assigned === selectedPharmacy?._id) return

      try {
        const id = typeof assigned === 'string' ? assigned : assigned._id
        const res = await fetch(`/api/pharmacies/${id}`, {
          headers: { 'Authorization': `Bearer ${userData?.token || localStorage.getItem('token')}` }
        })
        if (res.ok) {
          const data = await res.json()
          setSelectedPharmacy(data)
          console.log('✅ Auto-selected assigned pharmacy branch:', data.name)
        }
      } catch (err) {
        console.error('Auto-selection fetch failed:', err)
      }
    }

    syncPharmacy()
  }, [userData?.assignedPharmacy, selectedPharmacy?._id])

  const addToCart = (medicine) => {
    setCartItems(prev => {
      const existing = prev.find(item => item._id === medicine._id)
      if (existing) {
        return prev.map(item => 
          item._id === medicine._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...medicine, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item._id !== id))
  }

  const updateQuantity = (id, quantity) => {
    setCartItems(prev => prev.map(item => 
      item._id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ))
  }

  const clearCart = () => {
    setCartItems([])
    setPrescriptionFile(null)
  }

  const cartTotal = cartItems.reduce((total, item) => total + (item.sellPrice * item.quantity), 0)

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal,
      prescriptionFile, setPrescriptionFile,
      selectedPharmacy, setSelectedPharmacy
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}
