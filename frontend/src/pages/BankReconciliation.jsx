import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { LoadingOverlay } from '../components/LoadingSpinner'
import { api } from '../lib/api'
import { formatINR } from '../lib/currencyFormatter'
import { useToast } from '../hooks/useToast'

const BankReconciliation = () => {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [loading, setLoading] = useState(false)
  const [statement, setStatement] = useState(null)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setLoading(true)
      const res = await api.uploadFile(file)
      setStatement(res.data)
      success(`Bank statement uploaded: ${res.data.rows_extracted} transactions`)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-container">
      <Header title="Bank Reconciliation" showBack onBack={() => navigate('/more')} />

      <LoadingOverlay isLoading={loading} message="Processing..." />

      <div className="p-6 space-y-6">
        {!statement ? (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 space-y-4 text-center">
            <p className="text-4xl">📊</p>
            <p className="text-lg font-semibold">Upload Bank Statement</p>
            <p className="text-base text-gray-700">
              Upload your bank statement in Excel or PDF format to reconcile with recorded transactions.
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.pdf,.csv"
              onChange={handleUpload}
              disabled={loading}
              className="block w-full text-lg"
            />
            <p className="text-sm text-gray-600">Supported formats: Excel, PDF, CSV</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
              <p className="text-base font-medium text-gray-700 mb-1">Transactions Loaded</p>
              <p className="text-3xl font-bold text-green-700">{statement.rows_extracted}</p>
              <p className="text-sm text-gray-600 mt-2">Ready for reconciliation</p>
            </div>

            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 space-y-3">
              <p className="font-bold text-lg mb-4">Next Steps</p>
              <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="text-2xl">1️⃣</span>
                  <p className="text-base">Review the uploaded transactions below</p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-2xl">2️⃣</span>
                  <p className="text-base">Match with your recorded cheques and transfers</p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-2xl">3️⃣</span>
                  <p className="text-base">Mark items as matched or investigate discrepancies</p>
                </li>
              </ul>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
              <p className="font-bold text-lg mb-4">Transactions Preview</p>
              <div className="bg-white rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statement.data.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{row.data[0]?.value || '-'}</td>
                        <td className="px-4 py-2">{row.data[1]?.value || '-'}</td>
                        <td className="px-4 py-2 text-right font-semibold">{row.data[2]?.value || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {statement.data.length > 10 && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing 10 of {statement.data.length} transactions
                </p>
              )}
            </div>

            <button
              onClick={() => setStatement(null)}
              className="btn-secondary"
            >
              Upload Different File
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BankReconciliation
