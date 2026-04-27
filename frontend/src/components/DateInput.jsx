import React from 'react'

const DateInput = ({
  label,
  value,
  onChange,
  error = '',
  required = false,
  disabled = false
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-700 ml-1">*</span>}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input-field cursor-pointer ${error ? 'border-red-700' : ''}`}
      />
      {error && <p className="text-red-700 text-base font-medium">{error}</p>}
    </div>
  )
}

export default DateInput
