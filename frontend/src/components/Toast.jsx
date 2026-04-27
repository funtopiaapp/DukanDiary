import React from 'react'

const Toast = ({ id, message, type, onClose }) => {
  const bgColor = {
    success: 'bg-green-700',
    error: 'bg-red-700',
    info: 'bg-blue-700',
    warning: 'bg-yellow-600'
  }[type]

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  }[type]

  return (
    <div className={`${bgColor} text-white min-h-[52px] px-6 py-3 rounded-lg flex items-center justify-between shadow-lg mb-4 animate-fade-in`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">{icon}</span>
        <span className="text-lg font-medium">{message}</span>
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-2xl font-bold hover:opacity-70 transition-opacity"
      >
        ×
      </button>
    </div>
  )
}

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 right-6 z-50 w-full max-w-sm space-y-4 pointer-events-auto">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}

export default Toast
