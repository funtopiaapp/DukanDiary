import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import FormInput from '../components/FormInput'
import DateInput from '../components/DateInput'
import ToggleGroup from '../components/ToggleGroup'
import AlertBanner from '../components/AlertBanner'
import { LoadingOverlay, LoadingSpinner } from '../components/LoadingSpinner'
import { api } from '../lib/api'
import { formatINR } from '../lib/currencyFormatter'
import { getTodayDate } from '../lib/utils'
import { useToast } from '../hooks/useToast'
import { fileUploadService } from '../lib/fileUploadService'

const SalesAdd = () => {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [entryMode, setEntryMode] = useState('manual')
  const [form, setForm] = useState({
    date: getTodayDate(),
    period_type: 'daily',
    total_amount: '',
    cash_amount: '',
    upi_amount: '',
    credit_amount: '',
    notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [uploadedFile, setUploadedFile] = useState(null)
  const [parseStep, setParseStep] = useState(null) // 'preview', 'validate', 'saving'
  const [parsedData, setParsedData] = useState([])
  const [validationErrors, setValidationErrors] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    const numValue = parseFloat(value) || ''
    setForm(prev => ({ ...prev, [name]: numValue === '' ? '' : numValue }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setLoading(true)
      const uploadResult = await fileUploadService.uploadAndParse(file)
      setUploadedFile(uploadResult)

      // Parse the data for sales
      const parsed = fileUploadService.parseSalesData(uploadResult.data)
      setParsedData(parsed)
      setParseStep('preview')

      success(`File uploaded: ${uploadResult.rowsExtracted} rows extracted`)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const saveParsedData = async () => {
    try {
      setLoading(true)
      const results = await fileUploadService.saveSalesData(parsedData)

      if (results.successful > 0) {
        success(`✓ ${results.successful} rows imported successfully!`)
      }

      if (results.failed > 0) {
        showError(`✕ ${results.failed} rows failed to import`)
        if (results.errors.length > 0) {
          console.error('Import errors:', results.errors)
        }
      }

      if (results.successful > 0) {
        setTimeout(() => navigate('/'), 2000)
      } else {
        setParseStep('preview')
      }
    } catch (err) {
      showError(err.message)
      setParseStep('preview')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.date) newErrors.date = 'Date is required'
    if (!form.total_amount || form.total_amount <= 0) newErrors.total_amount = 'Valid total is required'

    const sum = (form.cash_amount || 0) + (form.upi_amount || 0) + (form.credit_amount || 0)
    if (Math.abs(sum - form.total_amount) > 0.01) {
      newErrors.breakdown = 'Payment breakdown must equal total amount'
    }

    return newErrors
  }

  const handleSubmit = async () => {
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setLoading(true)
      await api.createSale({
        ...form,
        cash_amount: form.cash_amount || 0,
        upi_amount: form.upi_amount || 0,
        credit_amount: form.credit_amount || 0
      })
      success('Sale recorded successfully!')
      navigate('/')
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sum = (form.cash_amount || 0) + (form.upi_amount || 0) + (form.credit_amount || 0)
  const isBalanced = Math.abs(sum - form.total_amount) < 0.01 && form.total_amount > 0

  return (
    <div className="screen-container">
      <Header title="Record Sale" showBack onBack={() => navigate('/')} />

      <LoadingOverlay isLoading={loading} message="Saving..." />

      <div className="form-section">
        <ToggleGroup
          options={[
            { value: 'manual', label: 'Manual Entry' },
            { value: 'upload', label: 'File Upload' }
          ]}
          value={entryMode}
          onChange={setEntryMode}
        />

        {entryMode === 'manual' ? (
          <>
            <DateInput
              label="Date"
              value={form.date}
              onChange={(e) => handleChange({ target: { name: 'date', value: e.target.value } })}
              required
            />

            <ToggleGroup
              label="Period Type"
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' }
              ]}
              value={form.period_type}
              onChange={(type) => setForm(prev => ({ ...prev, period_type: type }))}
              required
            />

            <FormInput
              label="Total Sales Amount"
              type="number"
              placeholder="10000.00"
              value={form.total_amount}
              onChange={handleChange}
              error={errors.total_amount}
              step="0.01"
              required
            />

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 space-y-4">
              <p className="font-bold text-lg">Payment Breakdown</p>

              <FormInput
                label="💵 Cash"
                type="number"
                placeholder="0.00"
                value={form.cash_amount}
                onChange={handleChange}
                step="0.01"
              />

              <FormInput
                label="📱 UPI"
                type="number"
                placeholder="0.00"
                value={form.upi_amount}
                onChange={handleChange}
                step="0.01"
              />

              <FormInput
                label="🏦 Bank/Credit"
                type="number"
                placeholder="0.00"
                value={form.credit_amount}
                onChange={handleChange}
                step="0.01"
              />

              <div className={`p-4 rounded-lg ${isBalanced ? 'bg-green-100 border-2 border-green-400' : 'bg-red-100 border-2 border-red-400'}`}>
                <p className="text-base font-medium text-gray-700 mb-1">Total Breakdown</p>
                <p className={`text-2xl font-bold ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                  {formatINR(sum)}
                </p>
                {!isBalanced && form.total_amount > 0 && (
                  <p className="text-red-700 font-semibold mt-2">Difference: {formatINR(form.total_amount - sum)}</p>
                )}
              </div>
            </div>

            <FormInput
              label="Notes (optional)"
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={handleChange}
            />

            <button onClick={handleSubmit} className="btn-primary">
              Save Sale
            </button>
          </>
        ) : !uploadedFile ? (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
            <p className="font-bold text-lg">📁 Upload Sales File</p>
            <p className="text-base text-gray-700">
              Expected format: Date | Total | Cash | UPI | Credit
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.pdf,.csv"
              onChange={handleFileUpload}
              disabled={loading}
              className="block w-full text-lg cursor-pointer"
            />
            <p className="text-sm text-gray-600">
              Supported: Excel, PDF, CSV (max 50 MB)
            </p>
          </div>
        ) : parseStep === 'preview' ? (
          <div className="space-y-4">
            <AlertBanner
              type="info"
              icon="✓"
              title="File Uploaded Successfully"
              message={`${uploadedFile.rowsExtracted} rows extracted from ${uploadedFile.fileName}`}
            />

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
              <p className="font-bold text-lg mb-4">Preview Data (First 10 rows)</p>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-orange-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Row</th>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      <th className="px-3 py-2 text-right">Cash</th>
                      <th className="px-3 py-2 text-right">UPI</th>
                      <th className="px-3 py-2 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-t hover:bg-orange-100">
                        <td className="px-3 py-2">{row.rowNumber}</td>
                        <td className="px-3 py-2">{row.date || '-'}</td>
                        <td className="px-3 py-2 text-right font-semibold">{formatINR(row.totalAmount)}</td>
                        <td className="px-3 py-2 text-right text-green-700">{formatINR(row.cashAmount)}</td>
                        <td className="px-3 py-2 text-right text-blue-700">{formatINR(row.upiAmount)}</td>
                        <td className="px-3 py-2 text-right text-purple-700">{formatINR(row.creditAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {uploadedFile.rowsExtracted > 10 && (
                <p className="text-sm text-gray-600 mt-3">
                  Showing 10 of {uploadedFile.rowsExtracted} rows
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const validation = fileUploadService.validateSalesData(parsedData)
                  if (!validation.valid) {
                    setValidationErrors(validation.errors)
                    setParseStep('validate')
                  } else {
                    setValidationErrors([])
                    setParseStep('saving')
                    saveParsedData()
                  }
                }}
                className="flex-1 btn-primary"
              >
                ✓ Confirm & Import
              </button>
              <button
                onClick={() => {
                  setUploadedFile(null)
                  setParsedData([])
                  setParseStep(null)
                }}
                className="flex-1 btn-secondary"
              >
                ← Upload Different
              </button>
            </div>
          </div>
        ) : parseStep === 'validate' ? (
          <div className="space-y-4">
            <AlertBanner
              type="warning"
              icon="⚠"
              title="Validation Errors"
              message={`${validationErrors.length} issues found in the data`}
            />

            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 space-y-2 max-h-96 overflow-y-auto">
              {validationErrors.map((err, idx) => (
                <div key={idx} className="text-base text-red-700 font-medium">
                  • {err}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setUploadedFile(null)
                  setParsedData([])
                  setParseStep(null)
                }}
                className="flex-1 btn-secondary"
              >
                ← Upload Different File
              </button>
            </div>
          </div>
        ) : parseStep === 'saving' ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 flex flex-col items-center gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-lg font-semibold">Importing {parsedData.length} rows...</p>
              <p className="text-base text-gray-600">This may take a moment</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default SalesAdd
