import axios from 'axios'
import { authService } from './authService'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add employee ID to all requests for audit logging
apiClient.interceptors.request.use(config => {
  const employee = authService.getCurrentEmployee()
  if (employee?.id) {
    config.headers['X-Employee-ID'] = employee.id
  }
  return config
})

// Add request interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.data?.error) {
      error.message = error.response.data.error
    }
    return Promise.reject(error)
  }
)

// API calls
export const api = {
  // Vendors
  getVendors: () => apiClient.get('/vendors'),
  createVendor: (data) => apiClient.post('/vendors', data),
  updateVendor: (id, data) => apiClient.patch(`/vendors/${id}`, data),
  deleteVendor: (id) => apiClient.delete(`/vendors/${id}`),

  // Stock
  getStock: (params) => apiClient.get('/stock', { params }),
  createStock: (data) => apiClient.post('/stock', data),
  updateStock: (id, data) => apiClient.patch(`/stock/${id}`, data),
  deleteStock: (id) => apiClient.delete(`/stock/${id}`),

  // Expenses
  getExpenses: (params) => apiClient.get('/expenses', { params }),
  getExpense: (id) => apiClient.get(`/expenses/${id}`),
  getTodayExpenseTotal: () => apiClient.get('/expenses/today-total'),
  createExpense: (data) => apiClient.post('/expenses', data),
  updateExpense: (id, data) => apiClient.patch(`/expenses/${id}`, data),
  deleteExpense: (id) => apiClient.delete(`/expenses/${id}`),

  // Cheques
  getCheques: (params) => apiClient.get('/cheques', { params }),
  getUpcomingCheques: () => apiClient.get('/cheques/upcoming'),
  createCheque: (data) => apiClient.post('/cheques', data),
  updateCheque: (id, data) => apiClient.patch(`/cheques/${id}`, data),
  updateChequeStatus: (id, status) => apiClient.patch(`/cheques/${id}/status`, { status }),
  deleteCheque: (id) => apiClient.delete(`/cheques/${id}`),

  // Sales
  getSales: (params) => apiClient.get('/sales', { params }),
  createSale: (data) => apiClient.post('/sales', data),
  updateSale: (id, data) => apiClient.patch(`/sales/${id}`, data),
  deleteSale: (id) => apiClient.delete(`/sales/${id}`),

  // Upload
  uploadFile: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Reports
  getStockRegister: (params) => apiClient.get('/reports/stock-register', { params }),
  getExpenseReport: (params) => apiClient.get('/reports/expense-report', { params }),
  getChequeRegister: (params) => apiClient.get('/reports/cheque-register', { params }),
  getProfitLossSummary: (params) => apiClient.get('/reports/profit-loss-summary', { params }),

  // Settings
  getSettings: () => apiClient.get('/settings'),
  updateSetting: (key, value) => apiClient.patch(`/settings/${key}`, { value }),

  // Categories
  getCategories: () => apiClient.get('/categories'),
  getCategory: (id) => apiClient.get(`/categories/${id}`),
  createCategory: (data) => apiClient.post('/categories', data),
  updateCategory: (id, data) => apiClient.patch(`/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`),

  // Employees (User Management)
  getEmployees: () => apiClient.get('/employees'),
  getEmployee: (id) => apiClient.get(`/employees/${id}`),
  createEmployee: (data) => apiClient.post('/employees', data),
  updateEmployee: (id, data) => apiClient.patch(`/employees/${id}`, data),
  deleteEmployee: (id) => apiClient.delete(`/employees/${id}`),

  // Audit Log (Track changes)
  getAuditLog: (params) => apiClient.get('/audit-log', { params }),
  createAuditLog: (data) => apiClient.post('/audit-log', data),

  // Email
  sendDigest: () => apiClient.post('/email/send-digest')
}
