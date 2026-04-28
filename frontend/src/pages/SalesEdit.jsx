import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import DateInput from '../components/DateInput'
import { LoadingOverlay } from '../components/LoadingSpinner'
import { api } from '../lib/api'
import { getTodayDate } from '../lib/utils'
import { useToast } from '../hooks/useToast'
import { formatINR } from '../lib/currencyFormatter'

const SalesEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [form, setForm] = useState({
    date: getTodayDate(),
    period_type: 'daily',
    total_amount: '',
    cash_amount: '',
    upi_amount: '',
    credit_amount: '',
    notes: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const salesRes = await api.getSales({ limit: 1000 })
        const sales = salesRes.data.data || salesRes.data
        const sale = sales.find(s => s.id === id)
        if (sale) {
          setForm(sale)
        }
      } catch (err) {
        showError('Failed to load sales record')
        navigate('/sales/add')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    const newForm = { ...form, [name]: value }

    if (['total_amount', 'cash_amount', 'upi_amount', 'credit_amount'].includes(name)) {
      const total = parseFloat(newForm.total_amount) || 0
      const cash = parseFloat(newForm.cash_amount) || 0
      const upi = parseFloat(newForm.upi_amount) || 0
      const credit = parseFloat(newForm.credit_amount) || 0

      if (name === 'total_amount') {
        newForm.total_amount = value
      } else {
        const sum = cash + upi + credit
        newForm.total_amount = sum.toString()
      }
    }

    setForm(newForm)
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.date) newErrors.date = 'Date is required'
    if (!form.total_amount || parseFloat(form.total_amount) <= 0) newErrors.total_amount = 'Valid total amount is required'
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
      await api.updateSale(id, form)
      success('Sales record updated successfully')
      navigate('/sales/add')
    } catch (err) {
      showError(err.message || 'Failed to update sales record')
    } finally {
      setSaving(false)
    }
  }

  const total = parseFloat(form.total_amount) || 0

  if (loading) {
    return (
      <div className="screen-container">
        <Header title="Edit Sales" showBack onBack={() => navigate('/sales/add')} />
        <div className="p-6">
          <LoadingOverlay isLoading={true} message="Loading sales record..." />
        </div>
      </div>
    )
  }

  return (
    <div className="screen-container">
      <Header title="Edit Sales" showBack onBack={() => navigate('/sales/add')} />

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
          label="Period Type"
          name="period_type"
          value={form.period_type}
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' }
          ]}
          onChange={handleChange}
          required
        />

        <FormInput
          label="Total Amount"
          name="total_amount"
          type="number"
          value={form.total_amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          error={errors.total_amount}
          required
        />

        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-green-900 mb-3">Payment Breakdown</h3>
          <div className="space-y-3">
            <FormInput
              label="Cash"
              name="cash_amount"
              type="number"
              value={form.cash_amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
            />
            <FormInput
              label="UPI"
              name="upi_amount"
              type="number"
              value={form.upi_amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
            />
            <FormInput
              label="Credit"
              name="credit_amount"
              type="number"
              value={form.credit_amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

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
            onClick={() => navigate('/sales/add')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default SalesEdit
