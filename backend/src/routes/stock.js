import express from 'express'
import Joi from 'joi'
import { supabase } from '../config/supabase.js'
import { validateRequest, validateQuery, stockEntrySchema, dateRangeSchema } from '../middleware/validation.js'
import { AppError } from '../middleware/errorHandler.js'

const router = express.Router()

const stockFilterSchema = dateRangeSchema.keys({
  vendor_id: Joi.string().uuid().optional()
})

// GET stock entries with filters
router.get('/', validateQuery(stockFilterSchema), async (req, res) => {
  let query = supabase.from('stock_entries').select('*, vendors(name, gst_number)').eq('is_deleted', false)

  if (req.validatedQuery.vendor_id) {
    query = query.eq('vendor_id', req.validatedQuery.vendor_id)
  }

  // Note: Date filtering temporarily disabled due to timezone issues
  // if (req.validatedQuery.start_date) {
  //   query = query.gte('date', req.validatedQuery.start_date)
  // }

  // if (req.validatedQuery.end_date) {
  //   query = query.lte('date', req.validatedQuery.end_date)
  // }

  const { data, error } = await query.order('date', { ascending: false })

  if (error) throw new AppError(error.message, 500)

  res.json({
    success: true,
    data,
    count: data.length
  })
})

// GET single stock entry
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('stock_entries')
    .select('*, vendors(name, gst_number)')
    .eq('id', req.params.id)
    .single()

  if (error) throw new AppError('Stock entry not found', 404)

  res.json({ success: true, data })
})

// POST new stock entry
router.post('/', validateRequest(stockEntrySchema), async (req, res) => {
  // Verify vendor exists
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('id')
    .eq('id', req.validatedData.vendor_id)
    .single()

  if (vendorError || !vendor) {
    throw new AppError('Vendor not found', 404)
  }

  const { data, error } = await supabase
    .from('stock_entries')
    .insert([req.validatedData])
    .select('*, vendors(name, gst_number)')
    .single()

  if (error) throw new AppError(error.message, 500)

  res.status(201).json({
    success: true,
    data,
    message: 'Stock entry created successfully'
  })
})

// PATCH update stock entry
router.patch('/:id', validateRequest(stockEntrySchema), async (req, res) => {
  const employeeId = req.headers['x-employee-id']

  const { data, error } = await supabase
    .from('stock_entries')
    .update({
      ...req.validatedData,
      updated_by: employeeId,
      updated_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .select('*, vendors(name, gst_number)')
    .single()

  if (error) throw new AppError(error.message, 500)

  // Log the update
  if (employeeId) {
    await supabase.from('audit_log').insert([{
      action: 'UPDATE',
      employee_id: employeeId,
      table_name: 'stock_entries',
      record_id: req.params.id,
      changes: req.validatedData,
      timestamp: new Date().toISOString()
    }]).catch(err => console.warn('Audit log failed:', err))
  }

  res.json({
    success: true,
    data,
    message: 'Stock entry updated successfully'
  })
})

// DELETE stock entry (soft delete)
router.delete('/:id', async (req, res) => {
  const employeeId = req.headers['x-employee-id']

  const { data, error } = await supabase
    .from('stock_entries')
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
      table_name: 'stock_entries',
      record_id: req.params.id,
      timestamp: new Date().toISOString()
    }]).catch(err => console.warn('Audit log failed:', err))
  }

  res.json({
    success: true,
    data,
    message: 'Stock entry deleted successfully'
  })
})

export default router
