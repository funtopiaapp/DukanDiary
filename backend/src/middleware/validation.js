import Joi from 'joi'
import { AppError } from './errorHandler.js'

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const message = error.details
        .map(d => `${d.path.join('.')}: ${d.message}`)
        .join('; ')
      throw new AppError(message, 400)
    }

    req.validatedData = value
    next()
  }
}

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const message = error.details
        .map(d => `${d.path.join('.')}: ${d.message}`)
        .join('; ')
      throw new AppError(message, 400)
    }

    req.validatedQuery = value
    next()
  }
}

// Schema definitions
export const vendorSchema = Joi.object({
  name: Joi.string().required().min(2).max(255),
  phone: Joi.string().optional().max(20),
  gst_number: Joi.string().optional().max(15)
})

export const stockEntrySchema = Joi.object({
  date: Joi.date().required(),
  vendor_id: Joi.string().uuid().required(),
  item_description: Joi.string().required().min(3),
  quantity: Joi.number().positive().required(),
  unit: Joi.string().valid('metres', 'pieces').required(),
  rate_per_unit: Joi.number().positive().required(),
  total_amount: Joi.number().positive().required(),
  notes: Joi.string().optional().max(1000)
})

export const expenseSchema = Joi.object({
  date: Joi.date().required(),
  category: Joi.string().required().max(100),
  description: Joi.string().required().min(3),
  amount: Joi.number().positive().required(),
  payment_mode: Joi.string().valid('Cash', 'UPI', 'Bank').required(),
  notes: Joi.string().optional().max(1000)
})

export const chequeSchema = Joi.object({
  date_issued: Joi.date().required(),
  cheque_number: Joi.string().required().max(20),
  bank_name: Joi.string().required().max(100),
  payee: Joi.string().required().max(255),
  amount: Joi.number().positive().required(),
  due_date: Joi.date().required(),
  purpose: Joi.string().optional().max(500),
  status: Joi.string().valid('Issued', 'Cleared', 'Bounced').required()
})

export const salesSchema = Joi.object({
  date: Joi.date().required(),
  period_type: Joi.string().valid('daily', 'monthly', 'yearly').required(),
  total_amount: Joi.number().positive().required(),
  cash_amount: Joi.number().min(0).optional().default(0),
  upi_amount: Joi.number().min(0).optional().default(0),
  credit_amount: Joi.number().min(0).optional().default(0),
  notes: Joi.string().optional().max(1000)
})

export const settingsSchema = Joi.object({
  key: Joi.string().required().max(255),
  value: Joi.string().optional()
})

export const dateRangeSchema = Joi.object({
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional()
})
