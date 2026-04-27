import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const MoreMenu = () => {
  const navigate = useNavigate()

  const menuItems = [
    {
      id: 'reports',
      title: 'Reports',
      description: 'View detailed business reports',
      icon: '📊',
      action: () => navigate('/reports')
    },
    {
      id: 'bank',
      title: 'Bank Reconciliation',
      description: 'Reconcile with bank statements',
      icon: '🏦',
      action: () => navigate('/bank-reconciliation')
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure app and manage data',
      icon: '⚙️',
      action: () => navigate('/settings')
    },
    {
      id: 'about',
      title: 'About',
      description: 'App information and support',
      icon: 'ℹ️',
      action: () => alert('DukanDiary v1.0.0\nTextile Retail Management\nFor support, contact support@dukandiary.com')
    }
  ]

  return (
    <div className="screen-container">
      <Header title="More" />

      <div className="p-6 space-y-3 pb-32">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={item.action}
            className="w-full card border-2 hover:border-orange-600 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">{item.title}</p>
                <p className="text-base text-gray-600">{item.description}</p>
              </div>
              <span className="text-2xl text-gray-400">›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default MoreMenu
