import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const TabNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  const tabs = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Stock', path: '/stock', icon: '📦' },
    { name: 'Expenses', path: '/expenses', icon: '💰' },
    { name: 'Cheques', path: '/cheques', icon: '🏦' },
    { name: 'More', path: '/more', icon: '⋯' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-40">
      <div className="flex justify-around max-w-md mx-auto md:max-w-2xl">
        {tabs.map(tab => {
          const isActive = currentPath === tab.path || (tab.path !== '/' && currentPath.startsWith(tab.path))
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center justify-center min-h-[80px] transition-all ${
                isActive
                  ? 'text-orange-600 border-t-4 border-orange-600'
                  : 'text-gray-600 hover:text-orange-400'
              }`}
            >
              <span className="text-3xl mb-1">{tab.icon}</span>
              <span className="text-sm font-semibold">{tab.name}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default TabNavigation
