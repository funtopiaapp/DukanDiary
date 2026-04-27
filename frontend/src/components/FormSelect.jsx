import React from 'react'

const FormSelect = ({
  label,
  options = [],
  value,
  onChange,
  error = '',
  required = false,
  disabled = false,
  placeholder = 'Select option'
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-700 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input-field ${error ? 'border-red-700 focus:border-red-700' : ''} cursor-pointer`}
      >
        <option value="">{placeholder}</option>
        {options.map((option, idx) => (
          <option key={idx} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {error && <p className="text-red-700 text-base font-medium">{error}</p>}
    </div>
  )
}

export default FormSelect
