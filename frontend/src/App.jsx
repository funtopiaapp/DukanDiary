import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useToast } from './hooks/useToast'
import { ToastContainer } from './components/Toast'
import TabNavigation from './components/TabNavigation'
import { authService } from './lib/authService'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import StockAdd from './pages/StockAdd'
import StockList from './pages/StockList'
import ExpenseAdd from './pages/ExpenseAdd'
import ExpenseList from './pages/ExpenseList'
import ChequeAdd from './pages/ChequeAdd'
import ChequeList from './pages/ChequeList'
import SalesAdd from './pages/SalesAdd'
import Reports from './pages/Reports'
import BankReconciliation from './pages/BankReconciliation'
import Settings from './pages/Settings'
import MoreMenu from './pages/MoreMenu'

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(authService.isAuthenticated())
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Check if session is valid
    if (authService.isSessionExpired()) {
      authService.logout()
      setIsAuth(false)
    } else {
      setIsAuth(authService.isAuthenticated())
    }
    setChecked(true)
  }, [])

  if (!checked) return null // Loading state

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  const { toasts, removeToast } = useToast()
  const isAuthenticated = authService.isAuthenticated()

  return (
    <BrowserRouter>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                <Dashboard />
                {isAuthenticated && <TabNavigation />}
              </>
            </ProtectedRoute>
          }
        />

        {/* Stock Routes */}
        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <>
                <StockList />
                <TabNavigation />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock/add"
          element={
            <ProtectedRoute>
              <>
                <StockAdd />
                <TabNavigation />
              </>
            </ProtectedRoute>
          }
        />

        {/* Expense Routes */}
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <>
                <ExpenseList />
                <TabNavigation />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/add"
          element={
            <ProtectedRoute>
              <>
                <ExpenseAdd />
                <TabNavigation />
              </>
            </ProtectedRoute>
          }
        />

        {/* Cheque Routes */}
        <Route
          path="/cheques"
          element={
            <ProtectedRoute>
              <>
                <ChequeList />
                <TabNavigation />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cheques/add"
          element={
            <ProtectedRoute>
              <>
                <ChequeAdd />
                <TabNavigation />
              </>
            </ProtectedRoute>
          }
        />

        {/* Sales Routes */}
        <Route
          path="/sales/add"
          element={
            <ProtectedRoute>
              <>
                <SalesAdd />
                <TabNavigation />
              </>
            </ProtectedRoute>
          }
        />

        {/* More Menu Routes */}
        <Route
          path="/more"
          element={
            <ProtectedRoute>
              <>
                <MoreMenu />
                <TabNavigation />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <>
                <Reports />
                <TabNavigation />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bank-reconciliation"
          element={
            <ProtectedRoute>
              <>
                <BankReconciliation />
                <TabNavigation />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <>
                <Settings />
                <TabNavigation />
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
