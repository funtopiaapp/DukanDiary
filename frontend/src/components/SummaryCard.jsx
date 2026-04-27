import React from 'react'
import { formatINR } from '../lib/currencyFormatter'
import { LoadingSpinner } from './LoadingSpinner'

const SummaryCard = ({ icon, title, value, isLoading = false, trend = null, color = 'sky' }) => {
  const colorClasses = {
    sky: 'border-sky-200 bg-sky-50',
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
    blue: 'border-sky-200 bg-sky-50'
  }

  const textColor = {
    sky: 'text-sky-600',
    green: 'text-green-700',
    red: 'text-red-700',
    blue: 'text-sky-600'
  }

  return (
    <div className={`card border-2 ${colorClasses[color]} p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{icon}</div>
        {trend && (
          <span className={`text-lg font-bold ${trend > 0 ? 'text-green-700' : 'text-red-700'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-gray-600 text-lg font-medium mb-2">{title}</p>
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <p className={`text-2xl font-bold ${textColor[color]}`}>
          {typeof value === 'number' ? formatINR(value) : value}
        </p>
      )}
    </div>
  )
}

export default SummaryCard
