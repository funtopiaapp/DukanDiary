import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import DateInput from '../components/DateInput'
import ToggleGroup from '../components/ToggleGroup'
import PhotoUploadOCR from '../components/PhotoUploadOCR'
import { LoadingOverlay } from '../components/LoadingSpinner'
import { api } from '../lib/api'
import { formatINR } from '../lib/currencyFormatter'
import { getTodayDate } from '../lib/utils'
import { useToast } from '../hooks/useToast'

const StockAdd = () => {
  const navigate = useNavigate()
  const { success, error } = useToast()

  const [form, setForm] = useState({
    date: getTodayDate(),
    vendor_id: '',
    item_description: '',
    quantity: '',
    unit: 'metres',
    rate_per_unit: '',
    notes: ''
  })

  const [vendors, setVendors] = useState([])
  const [showNewVendor, setShowNewVendor] = useState(false)
  const [newVendorName, setNewVendorName] = useState('')
  const [usePhotoMode, setUsePhotoMode] = useState(false)
  const [newVendorPhone, setNewVendorPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await api.getVendors()
        setVendors(res.data)
      } catch (err) {
        error('Failed to load vendors')
      }
    }
    fetchVendors()
  }, [])

  const total = form.quantity && form.rate_per_unit
    ? (parseFloat(form.quantity) * parseFloat(form.rate_per_unit)).toFixed(2)
    : 0

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.date) newErrors.date = 'Date is required'
    if (!form.vendor_id) newErrors.vendor_id = 'Vendor is required'
    if (!form.item_description.trim()) newErrors.item_description = 'Item description is required'
    if (!form.quantity || parseFloat(form.quantity) <= 0) newErrors.quantity = 'Valid quantity is required'
    if (!form.rate_per_unit || parseFloat(form.rate_per_unit) <= 0) newErrors.rate_per_unit = 'Valid rate is required'
    return newErrors
  }

  const handleAddNewVendor = async () => {
    if (!newVendorName.trim()) {
      error('Vendor name is required')
      return
    }

    try {
      setLoading(true)
      const res = await api.createVendor({
        name: newVendorName,
        phone: newVendorPhone
      })
      setVendors(prev => [...prev, res.data])
      setForm(prev => ({ ...prev, vendor_id: res.data.id }))
      setNewVendorName('')
      setNewVendorPhone('')
      setShowNewVendor(false)
      success('Vendor added successfully!')
    } catch (err) {
      error(err.message || 'Failed to add vendor')
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
      await api.createStock({
        ...form,
        quantity: parseFloat(form.quantity),
        rate_per_unit: parseFloat(form.rate_per_unit),
        total_amount: parseFloat(total)
      })
      success('Stock entry created successfully!')
      navigate('/stock')
    } catch (err) {
      error(err.message || 'Failed to create stock entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-container">
      <Header title="Add Stock Entry" showBack onBack={() => navigate('/stock')} />

      <LoadingOverlay isLoading={loading} message="Saving..." />

      <div className="form-section">
        {/* Photo Upload Toggle */}
        <ToggleGroup
          label="How do you want to add stock?"
          options={[
            { value: false, label: '📝 Manual Entry' },
            { value: true, label: '📸 Photo of Invoice' }
          ]}
          value={usePhotoMode}
          onChange={(value) => setUsePhotoMode(value === 'true' || value === true)}
          required
        />

        {/* Photo Upload Mode */}
        {usePhotoMode ? (
          <div style={{ marginBottom: '16px' }}>
            <PhotoUploadOCR
              onDataExtracted={(text) => {
                // Extract item description from invoice text
                setForm(prev => ({
                  ...prev,
                  item_description: prev.item_description || text.substring(0, 150).trim()
                }))
                success('Invoice details extracted. Please fill remaining fields.')
              }}
            />
          </div>
        ) : null}

        {/* Date */}
        <DateInput
          label="Date"
          value={form.date}
          onChange={(e) => handleChange({ target: { name: 'date', value: e.target.value } })}
          error={errors.date}
          required
        />

        {/* Vendor Selection */}
        <div className="form-group">
          {!showNewVendor ? (
            <>
              <FormSelect
                label="Vendor"
                options={vendors.map(v => ({ value: v.id, label: v.name }))}
                value={form.vendor_id}
                onChange={(e) => handleChange({ target: { name: 'vendor_id', value: e.target.value } })}
                error={errors.vendor_id}
                required
              />
              <button
                onClick={() => setShowNewVendor(true)}
                className="mt-2 text-orange-600 font-semibold text-lg hover:text-orange-700"
              >
                + Add New Vendor
              </button>
            </>
          ) : (
            <div className="space-y-3 border-2 border-orange-200 rounded-lg p-6 bg-orange-50">
              <p className="font-bold text-lg">Add New Vendor</p>
              <FormInput
                label="Vendor Name"
                placeholder="Enter vendor name"
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                required
              />
              <FormInput
                label="Phone (optional)"
                placeholder="9876543210"
                value={newVendorPhone}
                onChange={(e) => setNewVendorPhone(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAddNewVendor}
                  className="btn-primary"
                >
                  Save Vendor
                </button>
                <button
                  onClick={() => setShowNewVendor(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Item Description */}
        <FormInput
          label="Item Description"
          placeholder="e.g., Cotton Fabric - 60 GSM"
          value={form.item_description}
          onChange={handleChange}
          error={errors.item_description}
          required
        />

        {/* Quantity */}
        <FormInput
          label="Quantity"
          type="number"
          placeholder="100"
          value={form.quantity}
          onChange={handleChange}
          error={errors.quantity}
          step="0.01"
          required
        />

        {/* Unit Toggle */}
        <ToggleGroup
          label="Unit"
          options={[
            { value: 'metres', label: 'Metres' },
            { value: 'pieces', label: 'Pieces' }
          ]}
          value={form.unit}
          onChange={(unit) => setForm(prev => ({ ...prev, unit }))}
          required
        />

        {/* Rate per Unit */}
        <FormInput
          label="Rate per Unit"
          type="number"
          placeholder="150.50"
          value={form.rate_per_unit}
          onChange={handleChange}
          error={errors.rate_per_unit}
          step="0.01"
          required
        />

        {/* Total Amount (Auto-calculated) */}
        <div className="form-group bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
          <p className="form-label">Total Amount</p>
          <p className="text-3xl font-bold text-orange-600">{formatINR(total)}</p>
          <p className="text-gray-600 text-base mt-2">
            {form.quantity && form.rate_per_unit
              ? `${form.quantity} ${form.unit} × ${formatINR(form.rate_per_unit)}`
              : 'Enter quantity and rate'}
          </p>
        </div>

        {/* Notes */}
        <FormInput
          label="Notes (optional)"
          placeholder="Any additional notes..."
          value={form.notes}
          onChange={handleChange}
        />

        {/* Submit */}
        <button onClick={handleSubmit} className="btn-primary">
          Save Stock Entry
        </button>
      </div>
    </div>
  )
}

export default StockAdd
