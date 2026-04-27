import express from 'express'
import { supabase } from '../config/supabase.js'
import { validateRequest, validateQuery, salesSchema, dateRangeSchema } from '../middleware/validation.js'
import { AppError } from '../middleware/errorHandler.js'

const router = express.Router()

// GET all sales with date range filter
router.get('/', validateQuery(dateRangeSchema), async (req, res) => {
  let query = supabase.from('sales').select('*').eq('is_deleted', false)

  if (req.validatedQuery.start_date) {
    // query = query.gte('date', req.validatedQuery.start_date)
  }

  if (req.validatedQuery.end_date) {
    // query = query.lte('date', req.validatedQuery.end_date)
  }

  const { data, error } = await query.order('date', { ascending: false })

  if (error) throw new AppError(error.message, 500)

  res.json({
    success: true,
    data,
    count: data.length
  })
})

// GET single sale
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error) throw new AppError('Sale record not found', 404)

  res.json({ success: true, data })
})

// POST new sale
router.post('/', validateRequest(salesSchema), async (req, res) => {
  // Validate that sum of payment methods equals total
  const { cash_amount, upi_amount, credit_amount, total_amount } = req.validatedData
  const methodSum = (cash_amount || 0) + (upi_amount || 0) + (credit_amount || 0)

  if (methodSum !== total_amount) {
    throw new AppError(
      `Sum of payment methods (${methodSum}) must equal total amount (${total_amount})`,
      400
    )
  }

  const { data, error } = await supabase
    .from('sales')
    .insert([req.validatedData])
    .select()
    .single()

  if (error) throw new AppError(error.message, 500)

  res.status(201).json({
    success: true,
    data,
    message: 'Sale record created successfully'
  })
})

// PATCH update sale
router.patch('/:id', validateRequest(salesSchema), async (req, res) => {
  const { cash_amount, upi_amount, credit_amount, total_amount } = req.validatedData
  const methodSum = (cash_amount || 0) + (upi_amount || 0) + (credit_amount || 0)

  if (methodSum !== total_amount) {
    throw new AppError(
      `Sum of payment methods (${methodSum}) must equal total amount (${total_amount})`,
      400
    )
  }

  const { data, error } = await supabase
    .from('sales')
    .update({
      ...req.validatedData,
      updated_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) throw new AppError(error.message, 500)

  res.json({
    success: true,
    data,
    message: 'Sale record updated successfully'
  })
})

// DELETE sale
router.delete('/:id', async (req, res) => {
  const employeeId = req.headers['x-employee-id']

  const { data, error } = await supabase
    .from('sales')
    .update({
      is_deleted: true,
      updated_by: employeeId,
      updated_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) throw new AppError(error.message, 500)

  // Log the deletion
  if (employeeId) {
    await supabase.from('audit_log').insert([{
      action: 'DELETE',
      employee_id: employeeId,
      table_name: 'sales',
      record_id: req.params.id,
      timestamp: new Date().toISOString()
    }]).catch(err => console.warn('Audit log failed:', err))
  }

  res.json({
    success: true,
    data,
    message: 'Sale record deleted successfully'
  })
})

export default router
