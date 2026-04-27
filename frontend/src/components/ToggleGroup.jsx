import React from 'react'

const ToggleGroup = ({ label, options = [], value, onChange, required = false }) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-700 ml-1">*</span>}
        </label>
      )}
      <div className="flex gap-3">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onChange(option.value || option)}
            type="button"
            className={`flex-1 min-h-[52px] px-4 py-3 rounded-lg font-semibold transition-all text-lg ${
              value === (option.value || option)
                ? 'bg-orange-600 text-white'
                : 'border-2 border-gray-300 text-gray-700 hover:border-orange-600'
            }`}
          >
            {option.label || option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ToggleGroup
