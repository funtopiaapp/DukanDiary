import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import FormInput from '../components/FormInput'
import CategoryManager from '../components/CategoryManager'
import { LoadingOverlay, SkeletonLoader } from '../components/LoadingSpinner'
import { api } from '../lib/api'
import { authService } from '../lib/authService'
import { useToast } from '../hooks/useToast'

const Settings = () => {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  const [settings, setSettings] = useState({})
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingKey, setEditingKey] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [settingsRes, vendorsRes] = await Promise.all([
          api.getSettings(),
          api.getVendors()
        ])
        setSettings(settingsRes.data)
        setVendors(vendorsRes.data)
      } catch (err) {
        showError('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSaveSettings = async (key) => {
    try {
      setSaving(true)
      await api.updateSetting(key, editValue)
      setSettings(prev => ({ ...prev, [key]: editValue }))
      setEditingKey(null)
      success(`Setting "${key}" updated`)
    } catch (err) {
      showError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePIN = async () => {
    const currentPIN = window.prompt('Enter current PIN:', '')
    if (!currentPIN) return

    const newPIN = window.prompt('Enter new 4-digit PIN:', '')
    if (!newPIN) return

    if (newPIN.length !== 4 || !/^\d+$/.test(newPIN)) {
      showError('PIN must be exactly 4 digits')
      return
    }

    if (newPIN === currentPIN) {
      showError('New PIN must be different from current PIN')
      return
    }

    try {
      setSaving(true)
      await api.updateSetting('default_pin', newPIN)
      success('PIN changed successfully! Please login again.')
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (err) {
      showError(err.message || 'Failed to change PIN')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen-container">
      <Header title="Settings" showBack onBack={() => navigate('/more')} />

      <LoadingOverlay isLoading={saving} message="Saving..." />

      <div className="p-6 space-y-6">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Business Settings */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">📱 Business Settings</h2>

              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="card border-2">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-lg capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <button
                      onClick={() => {
                        setEditingKey(key)
                        setEditValue(value || '')
                      }}
                      className="text-orange-600 font-semibold hover:text-orange-700"
                    >
                      ✏️ Edit
                    </button>
                  </div>

                  {editingKey === key ? (
                    <div className="space-y-3 bg-orange-50 p-4 rounded-lg">
                      {key === 'expense_categories' ? (
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full min-h-[120px] p-3 border-2 border-orange-300 rounded-lg font-mono text-sm"
                          placeholder="Enter categories separated by comma"
                        />
                      ) : (
                        <FormInput
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Enter value"
                        />
                      )}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSaveSettings(key)}
                          className="flex-1 btn-primary"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingKey(null)}
                          className="flex-1 btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-base text-gray-700 bg-gray-50 p-3 rounded-lg break-words">
                      {value || 'Not set'}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Vendors Management */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">📦 Vendors ({vendors.length})</h2>

              {vendors.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No vendors added yet</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {vendors.map(vendor => (
                    <div key={vendor.id} className="card border-2 p-4">
                      <p className="font-semibold text-lg">{vendor.name}</p>
                      {vendor.phone && <p className="text-base text-gray-600">📱 {vendor.phone}</p>}
                      {vendor.gst_number && <p className="text-sm text-gray-600">GST: {vendor.gst_number}</p>}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => navigate('/stock/add')}
                className="btn-primary"
              >
                ➕ Add New Vendor
              </button>
            </div>

            {/* Expense Categories Management */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">🏷️ Expense Categories</h2>
              <CategoryManager />
            </div>

            {/* Security Settings */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">🔒 Security</h2>

              <button
                onClick={handleChangePIN}
                className="btn-primary"
              >
                🔑 Change PIN
              </button>

              <button
                onClick={() => {
                  authService.logout()
                  success('Logged out successfully')
                  navigate('/login')
                }}
                className="btn-danger"
              >
                🚪 Logout
              </button>
            </div>

            {/* App Info */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 text-center">
              <p className="text-2xl mb-2">🧵</p>
              <p className="text-lg font-bold">DukanDiary</p>
              <p className="text-base text-gray-600">v1.0.0</p>
              <p className="text-sm text-gray-500 mt-3">
                Textile Retail Management System
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Settings
