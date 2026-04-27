import express from 'express'
import Joi from 'joi'
import { supabase } from '../config/supabase.js'
import { validateRequest, validateQuery, chequeSchema } from '../middleware/validation.js'
import { AppError } from '../middleware/errorHandler.js'

const router = express.Router()

const chequeFilterSchema = Joi.object({
  status: Joi.string().valid('Issued', 'Cleared', 'Bounced').optional()
})

const chequeStatusSchema = Joi.object({
  status: Joi.string().valid('Issued', 'Cleared', 'Bounced').required()
})

// GET all cheques with filters
router.get('/', validateQuery(chequeFilterSchema), async (req, res) => {
  let query = supabase.from('cheques').select('*')

  if (req.validatedQuery.status) {
    query = query.eq('status', req.validatedQuery.status)
  }

  const { data, error } = await query.order('due_date', { ascending: true })

  if (error) throw new AppError(error.message, 500)

  res.json({
    success: true,
    data,
    count: data.length
  })
})

// GET upcoming cheques (due in next 2 days)
router.get('/upcoming', async (req, res) => {
  const today = new Date()
  const twoDaysLater = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)

  const todayStr = today.toISOString().split('T')[0]
  const twoDaysStr = twoDaysLater.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('cheques')
    .select('*')
    .eq('status', 'Issued')
    .gte('due_date', todayStr)
    .lte('due_date', twoDaysStr)
    .order('due_date', { ascending: true })

  if (error) throw new AppError(error.message, 500)

  res.json({
    success: true,
    data,
    count: data.length,
    message: `${data.length} cheques due in next 2 days`
  })
})

// GET single cheque
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('cheques')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error) throw new AppError('Cheque not found', 404)

  res.json({ success: true, data })
})

// POST new cheque
router.post('/', validateRequest(chequeSchema), async (req, res) => {
  const { data, error } = await supabase
    .from('cheques')
    .insert([req.validatedData])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new AppError('Cheque number already exists', 409)
    }
    throw new AppError(error.message, 500)
  }

  res.status(201).json({
    success: true,
    data,
    message: 'Cheque created successfully'
  })
})

// PATCH update cheque
router.patch('/:id', validateRequest(chequeSchema), async (req, res) => {
  const { data, error } = await supabase
    .from('cheques')
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
    message: 'Cheque updated successfully'
  })
})

// PATCH update cheque status only
router.patch('/:id/status', validateRequest(chequeStatusSchema), async (req, res) => {
  const { data, error } = await supabase
    .from('cheques')
    .update({
      status: req.validatedData.status,
      updated_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) throw new AppError(error.message, 500)

  res.json({
    success: true,
    data,
    message: `Cheque status updated to ${req.validatedData.status}`
  })
})

// DELETE cheque
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('cheques')
    .delete()
    .eq('id', req.params.id)

  if (error) throw new AppError(error.message, 500)

  res.json({
    success: true,
    message: 'Cheque deleted successfully'
  })
})

export default router
