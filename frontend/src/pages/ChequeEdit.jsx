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

const ChequeEdit = () => {
  const { id } = useParams()
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

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const chequesRes = await api.getCheques({ limit: 1000 })
        const cheques = chequesRes.data.data || chequesRes.data
        const cheque = cheques.find(c => c.id === id)
        if (cheque) {
          setForm(cheque)
        }
      } catch (err) {
        showError('Failed to load cheque')
        navigate('/cheques')
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
    if (!form.date_issued) newErrors.date_issued = 'Issue date is required'
    if (!form.cheque_number.trim()) newErrors.cheque_number = 'Cheque number is required'
    if (!form.bank_name.trim()) newErrors.bank_name = 'Bank name is required'
    if (!form.payee.trim()) newErrors.payee = 'Payee is required'
    if (!form.amount || parseFloat(form.amount) <= 0) newErrors.amount = 'Valid amount is required'
    if (!form.due_date) newErrors.due_date = 'Due date is required'
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
      await api.updateCheque(id, form)
      success('Cheque updated successfully')
      navigate('/cheques')
    } catch (err) {
      showError(err.message || 'Failed to update cheque')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="screen-container">
        <Header title="Edit Cheque" showBack onBack={() => navigate('/cheques')} />
        <div className="p-6">
          <LoadingOverlay isLoading={true} message="Loading cheque..." />
        </div>
      </div>
    )
  }

  return (
    <div className="screen-container">
      <Header title="Edit Cheque" showBack onBack={() => navigate('/cheques')} />

      <form onSubmit={handleSubmit} className="form-section">
        <DateInput
          label="Date Issued"
          name="date_issued"
          value={form.date_issued}
          onChange={handleChange}
          error={errors.date_issued}
          required
        />

        <FormInput
          label="Cheque Number"
          name="cheque_number"
          value={form.cheque_number}
          onChange={handleChange}
          placeholder="e.g., 123456"
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
          name="payee"
          value={form.payee}
          onChange={handleChange}
          placeholder="e.g., ABC Supplies"
          error={errors.payee}
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

        <DateInput
          label="Due Date"
          name="due_date"
          value={form.due_date}
          onChange={handleChange}
          error={errors.due_date}
          required
        />

        <FormSelect
          label="Status"
          name="status"
          value={form.status}
          options={['Issued', 'Cleared', 'Bounced']}
          onChange={handleChange}
          required
        />

        <FormInput
          label="Purpose (Optional)"
          name="purpose"
          value={form.purpose}
          onChange={handleChange}
          placeholder="What is this cheque for..."
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
            onClick={() => navigate('/cheques')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChequeEdit
