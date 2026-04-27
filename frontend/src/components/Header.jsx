import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

const Header = ({ title, subtitle = '', showBack = false, onBack = null }) => {
  const [shopName, setShopName] = useState('')

  useEffect(() => {
    const fetchShopName = async () => {
      try {
        const settingsRes = await api.getSettings()
        const settings = settingsRes.data.data || settingsRes.data
        setShopName(settings.business_name || 'My Shop')
      } catch (err) {
        setShopName('My Shop')
      }
    }
    fetchShopName()
  }, [])

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="p-6 space-y-2">
        {/* Shop Name at Top */}
        <div className="text-sm font-semibold text-sky-600 mb-2">
          {shopName}
        </div>

        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={onBack}
              className="text-2xl font-bold text-sky-600 hover:text-sky-700"
            >
              ←
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-lg text-gray-600 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
