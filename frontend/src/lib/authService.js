import { api } from './api'

export const authService = {
  // Verify PIN and get employee details
  verifyPIN: async (enteredPin) => {
    try {
      console.log('Fetching employees from API...')
      // Fetch employees from API
      const response = await api.getEmployees()
      console.log('API Response:', response)

      const employees = response.data.data
      console.log('Employees list:', employees)
      console.log('Looking for PIN:', enteredPin)

      // Find employee with matching PIN
      const employee = employees.find(emp => {
        console.log(`Checking employee ${emp.name}: pin=${emp.pin}, is_active=${emp.is_active}`)
        return emp.pin === enteredPin && emp.is_active
      })

      if (employee) {
        console.log('Employee found:', employee.name)
        // Log the login
        await authService.logAudit('LOGIN', employee.id, employee.name, null, null)
        return { success: true, employee }
      }

      console.warn('No matching employee found for PIN')
      return { success: false, employee: null }
    } catch (error) {
      console.error('PIN verification error:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      throw error
    }
  },

  // Store session with employee info
  setSession: (employee) => {
    const sessionData = {
      authenticated: true,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeRole: employee.role || 'staff',
      loginTime: new Date().toISOString()
    }
    localStorage.setItem('dukandiary_session', JSON.stringify(sessionData))
  },

  // Get session
  getSession: () => {
    try {
      const session = localStorage.getItem('dukandiary_session')
      return session ? JSON.parse(session) : null
    } catch (error) {
      console.error('Session retrieval error:', error)
      return null
    }
  },

  // Get current employee info
  getCurrentEmployee: () => {
    const session = authService.getSession()
    if (!session) return null
    return {
      id: session.employeeId,
      name: session.employeeName,
      role: session.employeeRole
    }
  },

  // Check if authenticated
  isAuthenticated: () => {
    const session = authService.getSession()
    return session && session.authenticated === true && !authService.isSessionExpired()
  },

  // Clear session
  logout: () => {
    localStorage.removeItem('dukandiary_session')
  },

  // Session timeout (24 hours)
  isSessionExpired: () => {
    const session = authService.getSession()
    if (!session || !session.loginTime) return true

    const loginTime = new Date(session.loginTime)
    const now = new Date()
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60)

    return hoursDiff > 24
  },

  // Log actions to audit trail
  logAudit: async (action, employeeId, employeeName, tableName = null, recordId = null, changes = null) => {
    try {
      await api.createAuditLog({
        action,
        employee_id: employeeId,
        employee_name: employeeName,
        table_name: tableName,
        record_id: recordId,
        changes: changes
      })
    } catch (error) {
      console.warn('Failed to log audit:', error)
    }
  }
}
