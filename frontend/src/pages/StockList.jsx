import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import DateInput from '../components/DateInput'
import FormSelect from '../components/FormSelect'
import { LoadingSpinner, SkeletonLoader } from '../components/LoadingSpinner'
import { api } from '../lib/api'
import { formatINR } from '../lib/currencyFormatter'
import { formatDateDisplay, getTodayDate, getStartOfMonth } from '../lib/utils'
import { useToast } from '../hooks/useToast'

const StockList = () => {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [stocks, setStocks] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const [filters, setFilters] = useState({
    start_date: getStartOfMonth(),
    end_date: getTodayDate(),
    vendor_id: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [stockRes, vendorRes] = await Promise.all([
          api.getStock(filters),
          api.getVendors()
        ])
        setStocks(stockRes.data)
        setVendors(vendorRes.data)
      } catch (err) {
        showError('Failed to load stock entries')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filters])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return

    try {
      setDeleting(id)
      await api.deleteStock(id)
      setStocks(prev => prev.filter(s => s.id !== id))
      success('Stock entry deleted')
    } catch (err) {
      showError(err.message || 'Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const totalQuantity = stocks.reduce((sum, s) => sum + parseFloat(s.quantity), 0)
  const totalAmount = stocks.reduce((sum, s) => sum + s.total_amount, 0)

  return (
    <div className="screen-container">
      <Header title="Stock History" />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 space-y-3">
          <DateInput
            label="From Date"
            value={filters.start_date}
            onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
          />
          <DateInput
            label="To Date"
            value={filters.end_date}
            onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
          />
          <FormSelect
            label="Vendor (optional)"
            options={vendors.map(v => ({ value: v.id, label: v.name }))}
            value={filters.vendor_id}
            onChange={(e) => setFilters(prev => ({ ...prev, vendor_id: e.target.value }))}
          />
        </div>

        {/* Summary */}
        {stocks.length > 0 && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-700 font-medium">Total Entries</p>
                <p className="text-2xl font-bold text-green-700">{stocks.length}</p>
              </div>
              <div>
                <p className="text-gray-700 font-medium">Total Quantity</p>
                <p className="text-2xl font-bold text-green-700">{totalQuantity.toFixed(2)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-700 font-medium">Total Amount</p>
                <p className="text-3xl font-bold text-green-700">{formatINR(totalAmount)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        {loading ? (
          <SkeletonLoader />
        ) : stocks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-500 font-semibold">No stock entries found</p>
            <button
              onClick={() => navigate('/stock/add')}
              className="btn-primary mt-6"
            >
              Add First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {stocks.map(stock => (
              <div key={stock.id} className="card border-2 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stock.item_description}</p>
                    <p className="text-base text-gray-600">{stock.vendors?.name}</p>
                  </div>
                  <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">
                    {formatDateDisplay(stock.date)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-gray-600 text-base">Quantity</p>
                    <p className="text-xl font-bold text-gray-900">{stock.quantity} {stock.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-base">Rate</p>
                    <p className="text-xl font-bold text-gray-900">{formatINR(stock.rate_per_unit)}</p>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-base">Total Amount</p>
                  <p className="text-3xl font-bold text-orange-600">{formatINR(stock.total_amount)}</p>
                </div>

                {stock.notes && (
                  <div className="text-base text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold mb-1">Notes:</p>
                    {stock.notes}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => navigate(`/stock/edit/${stock.id}`, { state: { stock } })}
                    className="flex-1 bg-blue-600 text-white min-h-[52px] rounded-lg font-semibold hover:bg-blue-700"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(stock.id)}
                    disabled={deleting === stock.id}
                    className="flex-1 bg-red-700 text-white min-h-[52px] rounded-lg font-semibold hover:bg-red-800 disabled:bg-gray-400"
                  >
                    {deleting === stock.id ? <LoadingSpinner size="sm" /> : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={() => navigate('/stock/add')}
          className="btn-primary sticky bottom-[100px]"
        >
          ➕ Add New Entry
        </button>
      </div>
    </div>
  )
}

export default StockList
