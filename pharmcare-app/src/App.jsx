import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'

// Public
import Login from './pages/Login'

// Customer
import Home from './pages/Home'
import MedicineSearch from './pages/MedicineSearch'
import ProductCatalogue from './pages/ProductCatalogue'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import CustomerProfile from './pages/CustomerProfile'

// Staff
import FulfillmentStatus from './pages/FulfillmentStatus'
import PrescriptionQueue from './pages/PrescriptionQueue'
import PrescriptionVerification from './pages/PrescriptionVerification'

// Pharmacy Admin
import Inventory from './pages/Inventory'
import InventoryReports from './pages/InventoryReports'
import POSBilling from './pages/POSBilling'
import SalesAnalytics from './pages/SalesAnalytics'
import StaffManagement from './pages/StaffManagement'
import SupplierManagement from './pages/SupplierManagement'
import PharmacyAdminDashboard from './pages/PharmacyAdminDashboard'

// Supplier
import SupplierDashboard from './pages/SupplierDashboard'
import SupplierPurchaseOrders from './pages/SupplierPurchaseOrders'

// Super Admin
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import UserManagement from './pages/UserManagement'
import PharmacyManagement from './pages/PharmacyManagement'
import SystemAuditLog from './pages/SystemAuditLog'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<AppLayout />}>
          {/* Customer */}
          <Route path="/home"        element={<Home />} />
          <Route path="/search"      element={<MedicineSearch />} />
          <Route path="/catalogue"   element={<ProductCatalogue />} />
          <Route path="/checkout"    element={<Checkout />} />
          <Route path="/orders"      element={<OrderTracking />} />
          <Route path="/profile"     element={<CustomerProfile />} />
          {/* Staff */}
          <Route path="/fulfillment"        element={<FulfillmentStatus />} />
          <Route path="/prescriptions"      element={<PrescriptionQueue />} />
          <Route path="/prescriptions/:id"  element={<PrescriptionVerification />} />
          {/* Pharmacy Admin */}
          <Route path="/admin"              element={<PharmacyAdminDashboard />} />
          <Route path="/inventory"          element={<Inventory />} />
          <Route path="/inventory/reports"  element={<InventoryReports />} />
          <Route path="/pos"                element={<POSBilling />} />
          <Route path="/analytics"          element={<SalesAnalytics />} />
          <Route path="/staff"              element={<StaffManagement />} />
          <Route path="/suppliers"          element={<SupplierManagement />} />
          {/* Supplier */}
          <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
          <Route path="/supplier/orders"    element={<SupplierPurchaseOrders />} />
          {/* Super Admin */}
          <Route path="/superadmin"                   element={<SuperAdminDashboard />} />
          <Route path="/superadmin/users"             element={<UserManagement />} />
          <Route path="/superadmin/pharmacies"        element={<PharmacyManagement />} />
          <Route path="/superadmin/audit"             element={<SystemAuditLog />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
