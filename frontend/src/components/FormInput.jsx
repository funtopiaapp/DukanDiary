import React from 'react'

const FormInput = ({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  required = false,
  disabled = false,
  icon = null,
  step = null,
  min = null,
  max = null
}) => {
  const inputProps = {}
  if (step !== null) inputProps.step = step
  if (min !== null) inputProps.min = min
  if (max !== null) inputProps.max = max

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-700 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`input-field ${icon ? 'pl-14' : ''} ${error ? 'border-red-700 focus:border-red-700' : ''}`}
          {...inputProps}
        />
      </div>
      {error && <p className="text-red-700 text-base font-medium">{error}</p>}
    </div>
  )
}

export default FormInput
