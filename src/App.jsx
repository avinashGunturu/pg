import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/context/AuthContext'

// Route Protection Components
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import PublicRoute from '@/components/auth/PublicRoute'

// Public Pages
import LandingPage from '@/pages/public/LandingPage'
import NotFoundPage from '@/pages/public/NotFoundPage'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Layout
import MainLayout from '@/components/layout/MainLayout'

// Dashboard Pages
import DashboardPage from '@/pages/dashboard/DashboardPage'
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage'
import ReportsPage from '@/pages/dashboard/ReportsPage'

// Management Pages
import PropertiesPage from '@/pages/management/PropertiesPage'
import AddPropertyPage from '@/pages/management/AddPropertyPage'
import PropertyDetailsPage from '@/pages/management/PropertyDetailsPage'
import TenantsPage from '@/pages/management/TenantsPage'
import AddTenantPage from '@/pages/management/AddTenantPage'
import TenantDetailsPage from '@/pages/management/TenantDetailsPage'
import EmployeesPage from '@/pages/management/EmployeesPage'
import AddEmployeePage from '@/pages/management/AddEmployeePage'
import EmployeeDetailsPage from '@/pages/management/EmployeeDetailsPage'
import InventoryPage from '@/pages/management/InventoryPage'
import AddInventoryPage from '@/pages/management/AddInventoryPage'
import EditInventoryPage from '@/pages/management/EditInventoryPage'
import InventoryDetailsPage from '@/pages/management/InventoryDetailsPage'
import FinancialPage from '@/pages/management/FinancialPage'
import AddTransactionPage from '@/pages/management/AddTransactionPage'
import EditTransactionPage from '@/pages/management/EditTransactionPage'
import TransactionDetailsPage from '@/pages/management/TransactionDetailsPage'

// Profile Page
import ProfilePage from '@/pages/profile/ProfilePage'

// Create a client for React Query
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          {/* Public Routes - Redirect authenticated users to dashboard */}
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          
          {/* Auth Routes - Redirect authenticated users to dashboard */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } />
          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          } />
          
          {/* 404 Page */}
          <Route path="/pagenotfound" element={<NotFoundPage />} />
          
          {/* Protected Routes - Redirect unauthenticated users to 404 */}
          <Route path="/app" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="dashboard/analytics" element={<AnalyticsPage />} />
            <Route path="dashboard/reports" element={<ReportsPage />} />
            
                                    <Route path="properties" element={<PropertiesPage />} />
                                                <Route path="properties/add" element={<AddPropertyPage />} />
            <Route path="properties/details/:id" element={<PropertyDetailsPage />} />
            <Route path="properties/maintenance" element={<div className="p-4">Property Maintenance Content (To be implemented)</div>} />
            
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="tenants/add" element={<AddTenantPage />} />
            <Route path="tenants/:id" element={<TenantDetailsPage />} />
            <Route path="tenants/:id/edit" element={<AddTenantPage />} />
            <Route path="tenants/leases" element={<div className="p-4">Lease Agreements Content (To be implemented)</div>} />
            
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/add" element={<AddEmployeePage />} />
            <Route path="employees/:id" element={<EmployeeDetailsPage />} />
            <Route path="employees/:id/edit" element={<AddEmployeePage />} />
            <Route path="employees/roles" element={<div className="p-4">Employee Roles Content (To be implemented)</div>} />
            
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="inventory/add" element={<AddInventoryPage />} />
            <Route path="inventory/:id" element={<InventoryDetailsPage />} />
            <Route path="inventory/:id/edit" element={<EditInventoryPage />} />
            <Route path="inventory/categories" element={<div className="p-4">Inventory Categories Content (To be implemented)</div>} />
            
            <Route path="financial" element={<FinancialPage />} />
            <Route path="financial/transactions/add" element={<AddTransactionPage />} />
            <Route path="financial/transactions/:id" element={<TransactionDetailsPage />} />
            <Route path="financial/transactions/:id/edit" element={<EditTransactionPage />} />
            <Route path="financial/invoices" element={<div className="p-4">Invoices Content (To be implemented)</div>} />
            <Route path="financial/expenses" element={<div className="p-4">Expenses Content (To be implemented)</div>} />
            
            <Route path="reports/*" element={<div className="p-4">Reports Content (To be implemented)</div>} />
            <Route path="documents/*" element={<div className="p-4">Documents Content (To be implemented)</div>} />
            
            {/* Settings Routes */}
            <Route path="settings" element={<Navigate to="/app/settings/profile" replace />} />
            <Route path="settings/profile" element={<ProfilePage />} />
            <Route path="settings/general" element={<div className="p-4">General Settings Content (To be implemented)</div>} />
            <Route path="settings/notifications" element={<div className="p-4">Notification Settings Content (To be implemented)</div>} />
            
            {/* Keep the old profile route for backward compatibility */}
            <Route path="profile" element={<Navigate to="/app/settings/profile" replace />} />
          </Route>
          
          {/* Catch all route - redirect to 404 */}
          <Route path="*" element={<Navigate to="/pagenotfound" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
