import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import DateInput from '../components/DateInput'
import { LoadingOverlay } from '../components/LoadingSpinner'
import { api } from '../lib/api'
import { formatINR } from '../lib/currencyFormatter'
import { getTodayDate, getStartOfMonth } from '../lib/utils'
import { useToast } from '../hooks/useToast'
import { exportReportToExcel } from '../lib/excelExporter'

const Reports = () => {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [selectedReport, setSelectedReport] = useState(null)
  const [dateRange, setDateRange] = useState({
    start_date: getStartOfMonth(),
    end_date: getTodayDate()
  })
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)

  const reportTypes = [
    { id: 'stock', name: 'Stock Register', icon: '📦' },
    { id: 'expense', name: 'Expense Report', icon: '💰' },
    { id: 'cheque', name: 'Cheque Register', icon: '🏦' },
    { id: 'pnl', name: 'Profit & Loss', icon: '📊' }
  ]

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      showError('Please select a report type')
      return
    }

    try {
      setLoading(true)
      let data

      switch (selectedReport) {
        case 'stock':
          data = await api.getStockRegister(dateRange)
          break
        case 'expense':
          data = await api.getExpenseReport(dateRange)
          break
        case 'cheque':
          data = await api.getChequeRegister(dateRange)
          break
        case 'pnl':
          data = await api.getProfitLossSummary(dateRange)
          break
        default:
          return
      }

      setReportData(data.data)
      success('Report generated successfully!')
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadExcel = () => {
    if (!reportData || !selectedReport) return

    try {
      exportReportToExcel(reportData, selectedReport)
      success('Report downloaded successfully!')
    } catch (err) {
      error(err.message || 'Failed to download report')
    }
  }

  return (
    <div className="screen-container">
      <Header title="Reports" showBack onBack={() => navigate('/more')} />

      <LoadingOverlay isLoading={loading} message="Generating report..." />

      <div className="p-6 space-y-6">
        {/* Report Selection */}
        <div className="space-y-3">
          <p className="font-bold text-lg">Select Report Type</p>
          <div className="grid grid-cols-2 gap-3">
            {reportTypes.map(report => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-6 rounded-lg text-center transition-all min-h-[120px] flex flex-col items-center justify-center gap-2 ${
                  selectedReport === report.id
                    ? 'bg-orange-600 text-white border-2 border-orange-700'
                    : 'bg-gray-100 text-gray-900 border-2 border-gray-200 hover:border-orange-600'
                }`}
              >
                <span className="text-4xl">{report.icon}</span>
                <span className="font-semibold text-base">{report.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-3">
          <p className="font-bold text-lg">Date Range</p>
          <DateInput
            label="From"
            value={dateRange.start_date}
            onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
          />
          <DateInput
            label="To"
            value={dateRange.end_date}
            onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
          />
        </div>

        {/* Generate Button */}
        <button onClick={handleGenerateReport} className="btn-primary">
          📊 Generate Report
        </button>

        {/* Report Results */}
        {reportData && (
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 space-y-3">
              <p className="text-base text-gray-700 font-medium">Report generated successfully!</p>
              <button onClick={downloadExcel} className="btn-primary">
                📥 Download as Excel
              </button>
              <button
                onClick={() => setReportData(null)}
                className="btn-secondary"
              >
                Generate Another Report
              </button>
            </div>

            {/* Display based on report type */}
            {selectedReport === 'pnl' && reportData.profit_loss && (
              <div className="space-y-4">
                <div className="card border-2 border-green-400 bg-green-50">
                  <p className="text-gray-700 text-base font-medium">Gross Profit</p>
                  <p className="text-3xl font-bold text-green-700">{reportData.profit_loss.formatted_gross}</p>
                </div>
                <div className="card border-2 border-orange-400 bg-orange-50">
                  <p className="text-gray-700 text-base font-medium">Net Profit</p>
                  <p className="text-3xl font-bold text-orange-600">{reportData.profit_loss.formatted_net}</p>
                </div>
                <div className="card border-2">
                  <p className="text-gray-700 text-base font-medium mb-4">Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Sales</span>
                      <span className="font-bold">{reportData.income.formatted_sales}</span>
                    </div>
                    <div className="flex justify-between text-red-700">
                      <span>Total Expenses</span>
                      <span className="font-bold">{reportData.expenses.formatted_total}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t-2">
                      <span>Profit Margin</span>
                      <span>{reportData.profit_loss.profit_margin}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generic summary for other reports */}
            {selectedReport !== 'pnl' && reportData.summary && (
              <div className="card border-2">
                <p className="font-bold text-lg mb-4">Summary</p>
                {Object.entries(reportData.summary).map(([key, value]) => {
                  if (typeof value === 'object') return null
                  return (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="text-base capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-bold">
                        {typeof value === 'number' && value > 1000 ? formatINR(value) : value}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
