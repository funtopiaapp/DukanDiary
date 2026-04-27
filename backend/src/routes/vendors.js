import express from 'express'
import { supabase } from '../config/supabase.js'
import { validateRequest, vendorSchema } from '../middleware/validation.js'
import { AppError } from '../middleware/errorHandler.js'

const router = express.Router()

// GET all vendors
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new AppError(error.message, 500)

  res.json({
    success: true,
    data,
    count: data.length
  })
})

// GET single vendor
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error) throw new AppError('Vendor not found', 404)

  res.json({ success: true, data })
})

// POST new vendor
router.post('/', validateRequest(vendorSchema), async (req, res) => {
  const { data, error } = await supabase
    .from('vendors')
    .insert([req.validatedData])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new AppError('GST number already exists', 409)
    }
    throw new AppError(error.message, 500)
  }

  res.status(201).json({
    success: true,
    data,
    message: 'Vendor created successfully'
  })
})

// PATCH update vendor
router.patch('/:id', validateRequest(vendorSchema), async (req, res) => {
  const { data, error } = await supabase
    .from('vendors')
    .update({
      ...req.validatedData,
      updated_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new AppError('GST number already exists', 409)
    }
    throw new AppError(error.message, 500)
  }

  res.json({
    success: true,
    data,
    message: 'Vendor updated successfully'
  })
})

// DELETE vendor
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('vendors')
    .delete()
    .eq('id', req.params.id)

  if (error) throw new AppError(error.message, 500)

  res.json({
    success: true,
    message: 'Vendor deleted successfully'
  })
})

export default router
