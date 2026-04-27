import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import FormInput from '../components/FormInput'
import FormSelect from '../components/FormSelect'
import DateInput from '../components/DateInput'
import ToggleGroup from '../components/ToggleGroup'
import PhotoUploadOCR from '../components/PhotoUploadOCR'
import { LoadingOverlay } from '../components/LoadingSpinner'
import { api } from '../lib/api'
import { getTodayDate } from '../lib/utils'
import { useToast } from '../hooks/useToast'

const ChequeAdd = () => {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [form, setForm] = useState({
    date_issued: getTodayDate(),
    cheque_number: '',
    bank_name: '',
    payee: '',
    amount: '',
    due_date: getTodayDate(),
    purpose: '',
    status: 'Issued'
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [usePhotoMode, setUsePhotoMode] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.date_issued) newErrors.date_issued = 'Date issued is required'
    if (!form.cheque_number.trim()) newErrors.cheque_number = 'Cheque number is required'
    if (!form.bank_name.trim()) newErrors.bank_name = 'Bank name is required'
    if (!form.payee.trim()) newErrors.payee = 'Payee is required'
    if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = 'Valid amount is required'
    if (!form.due_date) newErrors.due_date = 'Due date is required'
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
      await api.createCheque({
        ...form,
        amount: parseFloat(form.amount)
      })
      success('Cheque recorded successfully!')
      navigate('/cheques')
    } catch (err) {
      showError(err.message || 'Failed to create cheque')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-container">
      <Header title="Add Cheque" showBack onBack={() => navigate('/cheques')} />

      <LoadingOverlay isLoading={loading} message="Saving..." />

      <div className="form-section">
        {/* Photo Upload Toggle */}
        <ToggleGroup
          label="How do you want to add cheque?"
          options={[
            { value: false, label: '📝 Manual Entry' },
            { value: true, label: '📸 Photo of Cheque' }
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
                // Try to extract numbers and information from cheque
                const numberMatch = text.match(/\d{6,}/g)
                if (numberMatch && numberMatch[0].length === 6 || numberMatch[0].length === 10) {
                  setForm(prev => ({ ...prev, cheque_number: numberMatch[0] }))
                }
                success('Details auto-filled from photo. Review and adjust.')
              }}
            />
          </div>
        ) : null}

        <DateInput
          label="Date Issued"
          value={form.date_issued}
          onChange={(e) => handleChange({ target: { name: 'date_issued', value: e.target.value } })}
          error={errors.date_issued}
          required
        />

        <FormInput
          label="Cheque Number"
          placeholder="CHQ000123"
          value={form.cheque_number}
          onChange={handleChange}
          error={errors.cheque_number}
          required
        />

        <FormSelect
          label="Bank Name"
          name="bank_name"
          value={form.bank_name}
          onChange={handleChange}
          options={[
            { value: 'Canara Bank', label: 'Canara Bank' },
            { value: 'SBI', label: 'SBI' },
            { value: 'Dhanalaxmi Bank', label: 'Dhanalaxmi Bank' }
          ]}
          error={errors.bank_name}
          required
        />

        <FormInput
          label="Payee"
          placeholder="Company/Person name"
          value={form.payee}
          onChange={handleChange}
          error={errors.payee}
          required
        />

        <FormInput
          label="Amount"
          type="number"
          placeholder="50000.00"
          value={form.amount}
          onChange={handleChange}
          error={errors.amount}
          step="0.01"
          required
        />

        <DateInput
          label="Due Date"
          value={form.due_date}
          onChange={(e) => handleChange({ target: { name: 'due_date', value: e.target.value } })}
          error={errors.due_date}
          required
        />

        <FormInput
          label="Purpose (optional)"
          placeholder="Payment reason"
          value={form.purpose}
          onChange={handleChange}
        />

        <ToggleGroup
          label="Status"
          options={[
            { value: 'Issued', label: 'Issued' },
            { value: 'Cleared', label: 'Cleared' },
            { value: 'Bounced', label: 'Bounced' }
          ]}
          value={form.status}
          onChange={(status) => setForm(prev => ({ ...prev, status }))}
          required
        />

        <button onClick={handleSubmit} className="btn-primary">
          Save Cheque
        </button>
      </div>
    </div>
  )
}

export default ChequeAdd
