import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ToggleGroup from '../components/ToggleGroup'
import { SkeletonLoader } from '../components/LoadingSpinner'
import { api } from '../lib/api'
import { formatINR } from '../lib/currencyFormatter'
import { formatDateDisplay, getDaysUntil, isOverdue } from '../lib/utils'
import { useToast } from '../hooks/useToast'

const ChequeList = () => {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [cheques, setCheques] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const fetchCheques = async () => {
      try {
        setLoading(true)
        const res = await api.getCheques(statusFilter ? { status: statusFilter } : {})
        setCheques(res.data.data || [])
      } catch (err) {
        showError('Failed to load cheques')
      } finally {
        setLoading(false)
      }
    }
    fetchCheques()
  }, [statusFilter])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cheque?')) return
    try {
      await api.deleteCheque(id)
      setCheques(prev => prev.filter(c => c.id !== id))
      success('Cheque deleted')
    } catch (err) {
      showError(err.message)
    }
  }

  const getStatusColor = (status, daysUntil) => {
    if (status === 'Bounced') return 'bg-red-100 border-red-400'
    if (status === 'Cleared') return 'bg-green-100 border-green-400'
    if (isOverdue(daysUntil)) return 'bg-red-100 border-red-400'
    if (daysUntil <= 2) return 'bg-yellow-100 border-yellow-400'
    return 'bg-gray-100 border-gray-400'
  }

  const totalAmount = cheques.reduce((sum, c) => sum + c.amount, 0)
  const stats = cheques.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="screen-container">
      <Header title="Cheques" />

      <div className="p-6 space-y-6">
        {/* Status Filter */}
        <ToggleGroup
          options={[
            { value: '', label: 'All' },
            { value: 'Issued', label: 'Issued' },
            { value: 'Cleared', label: 'Cleared' },
            { value: 'Bounced', label: 'Bounced' }
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />

        {/* Summary */}
        {cheques.length > 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
            <p className="text-gray-700 font-medium mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-orange-600 mb-4">{formatINR(totalAmount)}</p>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(stats).map(([status, count]) => (
                <div key={status} className="bg-white p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-600">{status}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cheques List */}
        {loading ? (
          <SkeletonLoader />
        ) : cheques.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-500 font-semibold">No cheques found</p>
            <button
              onClick={() => navigate('/cheques/add')}
              className="btn-primary mt-6"
            >
              Add First Cheque
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cheques.map(cheque => {
              const daysUntil = getDaysUntil(cheque.due_date)
              const statusBg = getStatusColor(cheque.status, daysUntil)

              return (
                <div key={cheque.id} className={`card border-2 ${statusBg}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-lg font-bold">#{cheque.cheque_number}</p>
                      <p className="text-base text-gray-700">{cheque.payee}</p>
                      <p className="text-sm text-gray-600">{cheque.bank_name}</p>
                    </div>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      cheque.status === 'Issued' ? 'bg-blue-200 text-blue-800' :
                      cheque.status === 'Cleared' ? 'bg-green-200 text-green-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {cheque.status}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-lg mb-3">
                    <p className="text-gray-600 text-base mb-1">Amount</p>
                    <p className="text-3xl font-bold text-orange-600">{formatINR(cheque.amount)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 bg-white p-3 rounded-lg text-sm">
                    <div>
                      <p className="text-gray-600">Issued</p>
                      <p className="font-semibold">{formatDateDisplay(cheque.date_issued)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Due</p>
                      <p className={`font-semibold ${isOverdue(daysUntil) ? 'text-red-700' : daysUntil <= 2 ? 'text-yellow-700' : ''}`}>
                        {formatDateDisplay(cheque.due_date)}
                        {daysUntil === 0 && ' (Today)'}
                        {daysUntil === 1 && ' (Tomorrow)'}
                        {daysUntil < 0 && ` (${Math.abs(daysUntil)}d overdue)`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/cheques/edit/${cheque.id}`, { state: { cheque } })}
                      className="flex-1 bg-sky-500 text-white min-h-[52px] rounded-lg font-semibold hover:bg-sky-600"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cheque.id)}
                      className="flex-1 bg-red-600 text-white min-h-[52px] rounded-lg font-semibold hover:bg-red-700"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={() => navigate('/cheques/add')}
          className="btn-primary sticky bottom-[100px]"
        >
          ➕ Add Cheque
        </button>
      </div>
    </div>
  )
}

export default ChequeList
