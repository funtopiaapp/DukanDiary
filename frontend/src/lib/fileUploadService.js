import { api } from './api'

export const fileUploadService = {
  // Validate file before upload
  validateFile: (file) => {
    const maxSize = 50 * 1024 * 1024 // 50MB
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]

    if (!file) {
      return { valid: false, error: 'No file selected' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 50MB limit' }
    }

    if (!allowedMimes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Supported: PDF, Excel (.xlsx, .xls), CSV'
      }
    }

    return { valid: true }
  },

  // Upload and parse file
  uploadAndParse: async (file) => {
    const validation = fileUploadService.validateFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    try {
      const response = await api.uploadFile(file)
      return {
        success: true,
        fileName: response.data.file_name,
        fileType: response.data.file_type,
        rowsExtracted: response.data.rows_extracted,
        data: response.data.data,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }
  },

  // Process and preview CSV data
  previewCSVData: (data, limit = 10) => {
    if (!Array.isArray(data)) {
      return { preview: [], total: 0 }
    }

    return {
      preview: data.slice(0, limit),
      total: data.length,
      hasMore: data.length > limit
    }
  },

  // Convert CSV data to structured format for sales
  parseSalesData: (rows) => {
    // Expect columns: Date, Amount, CashAmount, UPIAmount, CreditAmount
    // This is a flexible parser that can handle various formats
    return rows
      .map((row, idx) => {
        if (typeof row === 'string') {
          const [date, total, cash, upi, credit] = row.split(',').map(s => s.trim())
          return {
            rowNumber: idx + 1,
            date: date || null,
            totalAmount: parseFloat(total) || 0,
            cashAmount: parseFloat(cash) || 0,
            upiAmount: parseFloat(upi) || 0,
            creditAmount: parseFloat(credit) || 0
          }
        }

        // Handle Excel object format
        if (row.data && Array.isArray(row.data)) {
          return {
            rowNumber: row.row_number || idx + 1,
            date: row.data[0]?.value || null,
            totalAmount: parseFloat(row.data[1]?.value) || 0,
            cashAmount: parseFloat(row.data[2]?.value) || 0,
            upiAmount: parseFloat(row.data[3]?.value) || 0,
            creditAmount: parseFloat(row.data[4]?.value) || 0
          }
        }

        return null
      })
      .filter(Boolean)
  },

  // Validate parsed sales data
  validateSalesData: (data) => {
    const errors = []

    data.forEach((row, idx) => {
      const rowNum = idx + 1
      if (!row.date) {
        errors.push(`Row ${rowNum}: Missing date`)
      }
      if (row.totalAmount <= 0) {
        errors.push(`Row ${rowNum}: Invalid total amount`)
      }
      const sum = row.cashAmount + row.upiAmount + row.creditAmount
      if (Math.abs(sum - row.totalAmount) > 0.01) {
        errors.push(`Row ${rowNum}: Payment breakdown doesn't match total amount`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Save parsed sales data
  saveSalesData: async (data) => {
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    }

    for (const row of data) {
      try {
        await api.createSale({
          date: row.date,
          period_type: 'daily',
          total_amount: row.totalAmount,
          cash_amount: row.cashAmount,
          upi_amount: row.upiAmount,
          credit_amount: row.creditAmount
        })
        results.successful++
      } catch (err) {
        results.failed++
        results.errors.push(`Row ${row.rowNumber}: ${err.message}`)
      }
    }

    return results
  }
}
