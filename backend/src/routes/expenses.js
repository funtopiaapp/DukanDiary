import express from 'express'
import Joi from 'joi'
import { supabase } from '../config/supabase.js'
import { validateRequest, validateQuery, expenseSchema, dateRangeSchema } from '../middleware/validation.js'
import { AppError } from '../middleware/errorHandler.js'
import { formatINR } from '../utils/currencyFormatter.js'

const router = express.Router()

const expenseFilterSchema = dateRangeSchema.keys({
  category: Joi.string().optional()
})

// GET all expenses with filters
router.get('/', validateQuery(expenseFilterSchema), async (req, res) => {
  let query = supabase.from('expenses').select('*').eq('is_deleted', false)

  if (req.validatedQuery.category) {
    query = query.eq('category', req.validatedQuery.category)
  }

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

// GET today's total expenses
router.get('/today-total', async (req, res) => {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('date', today)

  if (error) throw new AppError(error.message, 500)

  const total = data.reduce((sum, expense) => sum + expense.amount, 0)

  res.json({
    success: true,
    date: today,
    total_amount: total,
    formatted_amount: formatINR(total),
    count: data.length
  })
})

// GET single expense
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error) throw new AppError('Expense not found', 404)

  res.json({ success: true, data })
})

// POST new expense
router.post('/', validateRequest(expenseSchema), async (req, res) => {
  const employeeId = req.headers['x-employee-id']

  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      ...req.validatedData,
      created_by: employeeId,
      is_deleted: false
    }])
    .select()
    .single()

  if (error) throw new AppError(error.message, 500)

  // Log the creation
  if (employeeId) {
    await supabase.from('audit_log').insert([{
      action: 'CREATE',
      employee_id: employeeId,
      table_name: 'expenses',
      record_id: data.id,
      changes: { created: req.validatedData },
      timestamp: new Date().toISOString()
    }]).catch(err => console.warn('Audit log failed:', err))
  }

  res.status(201).json({
    success: true,
    data,
    message: 'Expense created successfully'
  })
})

// PATCH update expense
router.patch('/:id', validateRequest(expenseSchema), async (req, res) => {
  const employeeId = req.headers['x-employee-id']

  const { data, error } = await supabase
    .from('expenses')
    .update({
      ...req.validatedData,
      updated_by: employeeId,
      updated_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) throw new AppError(error.message, 500)

  // Log the update
  if (employeeId) {
    await supabase.from('audit_log').insert([{
      action: 'UPDATE',
      employee_id: employeeId,
      table_name: 'expenses',
      record_id: req.params.id,
      changes: req.validatedData,
      timestamp: new Date().toISOString()
    }]).catch(err => console.warn('Audit log failed:', err))
  }

  res.json({
    success: true,
    data,
    message: 'Expense updated successfully'
  })
})

// DELETE expense (soft delete)
router.delete('/:id', async (req, res) => {
  const employeeId = req.headers['x-employee-id']

  const { data, error } = await supabase
    .from('expenses')
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
      table_name: 'expenses',
      record_id: req.params.id,
      timestamp: new Date().toISOString()
    }]).catch(err => console.warn('Audit log failed:', err))
  }

  res.json({
    success: true,
    data,
    message: 'Expense deleted successfully'
  })
})

export default router
