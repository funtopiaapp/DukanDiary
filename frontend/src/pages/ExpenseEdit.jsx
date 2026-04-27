import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import DateInput from '../components/DateInput'
import { LoadingOverlay } from '../components/LoadingSpinner'
import { api } from '../lib/api'
import { getTodayDate } from '../lib/utils'
import { useToast } from '../hooks/useToast'

const ExpenseEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error: showError } = useToast()

  const [form, setForm] = useState({
    date: getTodayDate(),
    category: '',
    description: '',
    amount: '',
    payment_mode: 'Cash',
    notes: ''
  })

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [expenseRes, categoriesRes] = await Promise.all([
          api.getExpense(id),
          api.getCategories()
        ])
        setForm(expenseRes.data)
        setCategories(categoriesRes.data.data || [])
      } catch (err) {
        showError('Failed to load expense')
        navigate('/expenses')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.date) newErrors.date = 'Date is required'
    if (!form.category) newErrors.category = 'Category is required'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = 'Valid amount is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setSaving(true)
      await api.updateExpense(id, form)
      success('Expense updated successfully')
      navigate('/expenses')
    } catch (err) {
      showError(err.message || 'Failed to update expense')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="screen-container">
        <Header title="Edit Expense" showBack onBack={() => navigate('/expenses')} />
        <div className="p-6">
          <LoadingOverlay isLoading={true} message="Loading expense..." />
        </div>
      </div>
    )
  }

  return (
    <div className="screen-container">
      <Header title="Edit Expense" showBack onBack={() => navigate('/expenses')} />

      <form onSubmit={handleSubmit} className="form-section">
        <DateInput
          label="Date"
          name="date"
          value={form.date}
          onChange={handleChange}
          error={errors.date}
          required
        />

        <FormSelect
          label="Category"
          name="category"
          value={form.category}
          options={categories}
          onChange={handleChange}
          error={errors.category}
          required
        />

        <FormInput
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="e.g., Office rent for April"
          error={errors.description}
          required
        />

        <FormInput
          label="Amount"
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          error={errors.amount}
          required
        />

        <FormSelect
          label="Payment Mode"
          name="payment_mode"
          value={form.payment_mode}
          options={['Cash', 'UPI', 'Bank']}
          onChange={handleChange}
          required
        />

        <FormInput
          label="Notes (Optional)"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Additional notes..."
        />

        <div className="flex gap-3 mt-8">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/expenses')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ExpenseEdit
