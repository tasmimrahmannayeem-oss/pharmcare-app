import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
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

  // Persist pharmacy selection
  useEffect(() => {
    if (selectedPharmacy) {
      localStorage.setItem('selectedPharmacy', JSON.stringify(selectedPharmacy))
    } else {
      localStorage.removeItem('selectedPharmacy')
    }
  }, [selectedPharmacy])

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
