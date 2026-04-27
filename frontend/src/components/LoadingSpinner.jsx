import React from 'react'

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 border-3',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  }

  return (
    <div className={`${sizeClasses[size]} ${className} border-orange-200 border-t-orange-600 rounded-full animate-spin`} />
  )
}

export const LoadingOverlay = ({ isLoading, message = 'Loading...' }) => {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  )
}

export const SkeletonLoader = () => {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-12 bg-gray-200 rounded-lg" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  )
}

export default LoadingSpinner
