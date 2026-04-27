import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import DateInput from '../components/DateInput'
import ToggleGroup from '../components/ToggleGroup'
import SummaryCard from '../components/SummaryCard'
import PhotoUploadOCR from '../components/PhotoUploadOCR'
import { LoadingOverlay } from '../components/LoadingSpinner'
import { api } from '../lib/api'
import { formatINR } from '../lib/currencyFormatter'
import { getTodayDate } from '../lib/utils'
import { useToast } from '../hooks/useToast'

const ExpenseAdd = () => {
  const navigate = useNavigate()
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
  const [todayTotal, setTodayTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', color: '#0ea5e9' })
  const [usePhotoMode, setUsePhotoMode] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, todayRes] = await Promise.all([
          api.getCategories(),
          api.getTodayExpenseTotal()
        ])
        setCategories(categoriesRes.data.data || [])
        setTodayTotal(todayRes.data.total_amount || 0)
      } catch (err) {
        showError('Failed to load data')
      }
    }
    fetchData()
  }, [])

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

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      showError('Category name is required')
      return
    }

    try {
      setLoading(true)
      const response = await api.createCategory({
        name: newCategory.name,
        color: newCategory.color,
        display_order: categories.length + 1
      })
      setCategories([...categories, response.data])
      setForm(prev => ({ ...prev, category: response.data.name }))
      success('Category added successfully!')
      setShowAddCategory(false)
      setNewCategory({ name: '', color: '#FF6B35' })
    } catch (err) {
      showError(err.message || 'Failed to add category')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setLoading(true)
      await api.createExpense({
        ...form,
        amount: parseFloat(form.amount)
      })
      success('Expense recorded successfully!')
      navigate('/expenses')
    } catch (err) {
      showError(err.message || 'Failed to create expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-container">
      <Header title="Add Expense" showBack onBack={() => navigate('/expenses')} />

      <LoadingOverlay isLoading={loading} message="Saving..." />

      {/* Inline Category Creation Modal */}
      {showAddCategory && (
        <div className="modal-overlay" onClick={() => setShowAddCategory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>➕ Add New Category</h3>

            <FormInput
              label="Category Name"
              placeholder="e.g., Travel, Maintenance"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />

            <div className="form-group">
              <label className="form-label">Color</label>
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                style={{ width: '60px', height: '40px', cursor: 'pointer', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="btn-primary" onClick={handleAddCategory} style={{ flex: 1 }}>
                Add Category
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowAddCategory(false)
                  setNewCategory({ name: '', color: '#FF6B35' })
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="form-section">
        {/* Today's Total */}
        <SummaryCard
          icon="📊"
          title="Today's Total"
          value={todayTotal}
          color="red"
        />

        {/* Photo Upload Toggle */}
        <ToggleGroup
          label="How do you want to add expense?"
          options={[
            { value: false, label: '📝 Manual Entry' },
            { value: true, label: '📸 Photo of Receipt' }
          ]}
          value={usePhotoMode}
          onChange={setUsePhotoMode}
          required
        />

        {/* Photo Upload Mode */}
        {usePhotoMode ? (
          <div style={{ marginBottom: '16px' }}>
            <PhotoUploadOCR
              onDataExtracted={(text) => {
                setForm(prev => ({
                  ...prev,
                  description: prev.description || text.substring(0, 200).trim()
                }))
                success('Details auto-filled from photo. Review and adjust.')
              }}
            />
          </div>
        ) : null}

        <DateInput
          label="Date"
          value={form.date}
          onChange={(e) => handleChange({ target: { name: 'date', value: e.target.value } })}
          error={errors.date}
          required
        />

        {/* Category with inline add button */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <FormSelect
              label="Category"
              options={categories.map(cat => ({
                value: cat.name,
                label: cat.name
              }))}
              value={form.category}
              onChange={(e) => handleChange({ target: { name: 'category', value: e.target.value } })}
              error={errors.category}
              required
            />
          </div>
          <button
            className="btn-secondary"
            onClick={() => setShowAddCategory(true)}
            style={{ minHeight: '52px', padding: '0 12px', marginBottom: '0' }}
            title="Add new category"
          >
            +
          </button>
        </div>

        <FormInput
          label="Description"
          placeholder="e.g., Monthly rent payment"
          value={form.description}
          onChange={handleChange}
          error={errors.description}
          required
        />

        <FormInput
          label="Amount"
          type="number"
          placeholder="5000.00"
          value={form.amount}
          onChange={handleChange}
          error={errors.amount}
          step="0.01"
          required
        />

        <ToggleGroup
          label="Payment Mode"
          options={[
            { value: 'Cash', label: '💵 Cash' },
            { value: 'UPI', label: '📱 UPI' },
            { value: 'Bank', label: '🏦 Bank' }
          ]}
          value={form.payment_mode}
          onChange={(mode) => setForm(prev => ({ ...prev, payment_mode: mode }))}
          required
        />

        <FormInput
          label="Notes (optional)"
          placeholder="Any additional notes..."
          value={form.notes}
          onChange={handleChange}
        />

        <button onClick={handleSubmit} className="btn-primary">
          Save Expense
        </button>
      </div>
    </div>
  )
}

export default ExpenseAdd
