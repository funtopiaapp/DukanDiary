import * as XLSX from 'xlsx'

export const exportToExcel = (data, filename = 'export.xlsx', sheetName = 'Data') => {
  try {
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Set column widths
    const colWidths = Object.keys(data[0] || {}).map(() => 20)
    worksheet['!cols'] = colWidths.map(w => ({ wch: w }))

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generate file and trigger download
    XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)

    return true
  } catch (error) {
    console.error('Excel export error:', error)
    throw error
  }
}

export const exportReportToExcel = (reportData, reportType) => {
  try {
    const workbook = XLSX.utils.book_new()

    // Determine what data to export based on report type
    let data = []
    let sheetName = 'Report'

    switch (reportType) {
      case 'stock':
        data = reportData.data.map(item => ({
          Date: item.date,
          'Vendor Name': item.vendors?.name || '',
          'Item Description': item.item_description,
          Quantity: item.quantity,
          Unit: item.unit,
          'Rate/Unit': item.rate_per_unit,
          'Total Amount': item.total_amount
        }))
        sheetName = 'Stock Register'
        break

      case 'expense':
        data = reportData.data.map(item => ({
          Date: item.date,
          Category: item.category,
          Description: item.description,
          Amount: item.amount,
          'Payment Mode': item.payment_mode,
          Notes: item.notes || ''
        }))
        sheetName = 'Expenses'
        break

      case 'cheque':
        data = reportData.data.map(item => ({
          'Cheque #': item.cheque_number,
          'Date Issued': item.date_issued,
          Bank: item.bank_name,
          Payee: item.payee,
          Amount: item.amount,
          'Due Date': item.due_date,
          Status: item.status,
          Purpose: item.purpose || ''
        }))
        sheetName = 'Cheques'
        break

      case 'pnl':
        data = [
          { Metric: 'Total Sales', Amount: reportData.income.total_sales },
          { Metric: 'Cost of Goods Sold', Amount: reportData.expenses.cost_of_goods_sold },
          { Metric: 'Operating Expenses', Amount: reportData.expenses.operating_expenses },
          { Metric: 'Gross Profit', Amount: reportData.profit_loss.gross_profit },
          { Metric: 'Net Profit', Amount: reportData.profit_loss.net_profit },
          { Metric: 'Profit Margin %', Amount: reportData.profit_loss.profit_margin }
        ]
        sheetName = 'P&L Summary'
        break

      default:
        return false
    }

    if (data.length === 0) {
      throw new Error('No data to export')
    }

    // Create worksheet and add to workbook
    const worksheet = XLSX.utils.json_to_sheet(data)
    worksheet['!cols'] = Object.keys(data[0]).map(() => ({ wch: 20 }))
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Add summary sheet for reports
    if (reportData.summary) {
      const summaryData = Object.entries(reportData.summary)
        .filter(([key, value]) => typeof value !== 'object')
        .map(([key, value]) => ({
          'Summary Item': key.replace(/_/g, ' '),
          Value: value
        }))

      if (summaryData.length > 0) {
        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
        summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 20 }]
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary')
      }
    }

    // Download file
    XLSX.writeFile(workbook, `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`)
    return true
  } catch (error) {
    console.error('Report export error:', error)
    throw error
  }
}
