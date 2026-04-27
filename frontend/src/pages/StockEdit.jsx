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

const StockEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [form, setForm] = useState({
    date: getTodayDate(),
    vendor_id: '',
    item_description: '',
    quantity: '',
    unit: 'metres',
    rate_per_unit: '',
    total_amount: '',
    notes: ''
  })

  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [stockRes, vendorsRes] = await Promise.all([
          api.getStock({ limit: 1000 }).then(res => {
            const items = res.data.data || res.data
            return items.find(item => item.id === id)
          }),
          api.getVendors()
        ])

        if (stockRes) {
          setForm(stockRes)
        }
        setVendors((vendorsRes.data.data || vendorsRes.data).map(v => ({ label: v.name, value: v.id })))
      } catch (err) {
        showError('Failed to load stock entry')
        navigate('/stock')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    const newForm = { ...form, [name]: value }

    if (name === 'quantity' || name === 'rate_per_unit') {
      const qty = parseFloat(newForm.quantity) || 0
      const rate = parseFloat(newForm.rate_per_unit) || 0
      newForm.total_amount = (qty * rate).toFixed(2)
    }

    setForm(newForm)
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.date) newErrors.date = 'Date is required'
    if (!form.vendor_id) newErrors.vendor_id = 'Vendor is required'
    if (!form.item_description.trim()) newErrors.item_description = 'Description is required'
    if (!form.quantity || parseFloat(form.quantity) <= 0) newErrors.quantity = 'Valid quantity is required'
    if (!form.rate_per_unit || parseFloat(form.rate_per_unit) <= 0) newErrors.rate_per_unit = 'Valid rate is required'
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
      await api.updateStock(id, form)
      success('Stock entry updated successfully')
      navigate('/stock')
    } catch (err) {
      showError(err.message || 'Failed to update stock entry')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="screen-container">
        <Header title="Edit Stock" showBack onBack={() => navigate('/stock')} />
        <div className="p-6">
          <LoadingOverlay isLoading={true} message="Loading stock entry..." />
        </div>
      </div>
    )
  }

  return (
    <div className="screen-container">
      <Header title="Edit Stock" showBack onBack={() => navigate('/stock')} />

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
          label="Vendor"
          name="vendor_id"
          value={form.vendor_id}
          options={vendors}
          onChange={handleChange}
          error={errors.vendor_id}
          required
        />

        <FormInput
          label="Item Description"
          name="item_description"
          value={form.item_description}
          onChange={handleChange}
          placeholder="e.g., Cotton Fabric"
          error={errors.item_description}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Quantity"
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            error={errors.quantity}
            required
          />
          <FormSelect
            label="Unit"
            name="unit"
            value={form.unit}
            options={['metres', 'pieces']}
            onChange={handleChange}
            required
          />
        </div>

        <FormInput
          label="Rate per Unit"
          name="rate_per_unit"
          type="number"
          value={form.rate_per_unit}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          error={errors.rate_per_unit}
          required
        />

        <div className="bg-sky-50 border-2 border-sky-300 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-sky-700">₹{parseFloat(form.total_amount || 0).toFixed(2)}</p>
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
            onClick={() => navigate('/stock')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default StockEdit
