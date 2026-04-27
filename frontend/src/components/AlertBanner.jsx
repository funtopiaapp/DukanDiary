import React from 'react'

const AlertBanner = ({ type = 'warning', title, message, icon = '⚠', onClose = null }) => {
  const bgColor = {
    warning: 'bg-red-50 border-red-300',
    success: 'bg-green-50 border-green-300',
    info: 'bg-blue-50 border-blue-300'
  }[type]

  const titleColor = {
    warning: 'text-red-700',
    success: 'text-green-700',
    info: 'text-blue-700'
  }[type]

  return (
    <div className={`border-2 rounded-lg p-6 flex items-start gap-4 ${bgColor}`}>
      <span className="text-3xl flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <h3 className={`text-lg font-bold ${titleColor} mb-1`}>{title}</h3>
        <p className="text-gray-700 text-lg">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-2xl font-bold text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default AlertBanner
