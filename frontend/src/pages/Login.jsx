import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { authService } from '../lib/authService'
import { LoadingOverlay } from '../components/LoadingSpinner'

const Login = () => {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { success, error } = useToast()

  const handleNumberClick = (num) => {
    if (pin.length < 4) {
      setPin(pin + num)
    }
  }

  const handleBackspace = () => {
    setPin(pin.slice(0, -1))
  }

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      error('PIN must be 4 digits')
      return
    }

    try {
      setLoading(true)
      const result = await authService.verifyPIN(pin)

      if (result.success && result.employee) {
        authService.setSession(result.employee)
        success(`Welcome, ${result.employee.name}!`)
        navigate('/')
      } else {
        error('Invalid PIN. Please try again.')
        setPin('')
      }
    } catch (err) {
      console.error('Login error:', err)
      error('Login failed. Please check your connection.')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  const numberPad = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [0]
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center p-6">
      <LoadingOverlay isLoading={loading} message="Verifying PIN..." />

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧵</div>
          <h1 className="text-4xl font-bold text-gray-900">DukanDiary</h1>
          <p className="text-xl text-gray-600 mt-2">Textile Retail Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <p className="text-xl font-semibold text-center text-gray-700 mb-6">
            Enter 4-Digit PIN
          </p>

          {/* PIN Display */}
          <div className="flex justify-center gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-lg border-3 border-sky-500 flex items-center justify-center bg-sky-50 text-3xl font-bold text-sky-600"
              >
                {pin[i] ? '●' : ''}
              </div>
            ))}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {numberPad.map((row, rowIdx) => (
              <div key={rowIdx} className="contents">
                {row.map(num => (
                  <button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    disabled={loading}
                    className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-3xl font-bold text-gray-900 rounded-xl py-6 transition-all disabled:opacity-50"
                  >
                    {num}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={pin.length !== 4 || loading}
              className="btn-primary disabled:opacity-50"
            >
              Login
            </button>
            <button
              onClick={handleBackspace}
              disabled={loading}
              className="btn-secondary disabled:opacity-50"
            >
              ← Backspace
            </button>
          </div>

          <p className="text-center text-gray-500 text-base mt-6">
            Demo PIN: 1234
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
