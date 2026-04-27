import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import DateInput from '../components/DateInput'
import FormSelect from '../components/FormSelect'
import { SkeletonLoader } from '../components/LoadingSpinner'
import { api } from '../lib/api'
import { formatINR } from '../lib/currencyFormatter'
import { formatDateDisplay, getTodayDate, getStartOfMonth } from '../lib/utils'
import { useToast } from '../hooks/useToast'

const ExpenseList = () => {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    start_date: getStartOfMonth(),
    end_date: getTodayDate(),
    category: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [expenseRes, settingsRes] = await Promise.all([
          api.getExpenses(filters),
          api.getSettings()
        ])
        setExpenses(expenseRes.data.data || [])
        const settings = settingsRes.data.data || settingsRes.data
        const cats = (settings.expense_categories || '').split(',').map(c => c.trim()).filter(Boolean)
        setCategories(cats)
      } catch (err) {
        showError('Failed to load expenses')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [filters])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await api.deleteExpense(id)
      setExpenses(prev => prev.filter(e => e.id !== id))
      success('Expense deleted')
    } catch (err) {
      showError(err.message)
    }
  }

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
  const byCategory = expenses.reduce((acc, e) => {
    if (!acc[e.category]) acc[e.category] = 0
    acc[e.category] += e.amount
    return acc
  }, {})

  return (
    <div className="screen-container">
      <Header title="Expenses" />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 space-y-3">
          <DateInput
            label="From"
            value={filters.start_date}
            onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
          />
          <DateInput
            label="To"
            value={filters.end_date}
            onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
          />
          <FormSelect
            label="Category"
            options={categories}
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          />
        </div>

        {/* Summary */}
        {expenses.length > 0 && (
          <>
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
              <p className="text-gray-700 font-medium mb-2">Total Expenses</p>
              <p className="text-3xl font-bold text-red-700">{formatINR(totalAmount)}</p>
              <p className="text-base text-gray-600 mt-2">{expenses.length} entries</p>
            </div>

            {Object.keys(byCategory).length > 0 && (
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 space-y-2">
                <p className="font-bold text-lg mb-4">By Category</p>
                {Object.entries(byCategory).map(([cat, amt]) => (
                  <div key={cat} className="flex justify-between items-center">
                    <p className="text-base font-medium">{cat}</p>
                    <p className="text-lg font-bold text-red-700">{formatINR(amt)}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Entries */}
        {loading ? (
          <SkeletonLoader />
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-500 font-semibold">No expenses found</p>
            <button
              onClick={() => navigate('/expenses/add')}
              className="btn-primary mt-6"
            >
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map(expense => (
              <div key={expense.id} className="card border-2">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-lg font-bold">{expense.description}</p>
                    <p className="text-base text-gray-600">{expense.category}</p>
                  </div>
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                    {formatDateDisplay(expense.date)}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-red-50 p-4 rounded-lg mb-3">
                  <span className="text-base font-medium">{expense.payment_mode}</span>
                  <p className="text-2xl font-bold text-red-700">{formatINR(expense.amount)}</p>
                </div>

                {expense.notes && (
                  <p className="text-base text-gray-600 mb-3 bg-gray-50 p-3 rounded">{expense.notes}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/expenses/edit/${expense.id}`, { state: { expense } })}
                    className="flex-1 bg-blue-600 text-white min-h-[52px] rounded-lg font-semibold"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="flex-1 bg-red-700 text-white min-h-[52px] rounded-lg font-semibold"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/expenses/add')}
          className="btn-primary sticky bottom-[100px]"
        >
          ➕ Add Expense
        </button>
      </div>
    </div>
  )
}

export default ExpenseList
