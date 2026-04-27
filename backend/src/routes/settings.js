import express from 'express'
import Joi from 'joi'
import { supabase } from '../config/supabase.js'
import { validateRequest, settingsSchema } from '../middleware/validation.js'
import { AppError } from '../middleware/errorHandler.js'

const router = express.Router()

// GET all settings
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('key', { ascending: true })

  if (error) throw new AppError(error.message, 500)

  // Convert array to object for easier access
  const settingsObject = data.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {})

  res.json({
    success: true,
    data: settingsObject,
    count: data.length
  })
})

// GET single setting by key
router.get('/:key', async (req, res) => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('key', req.params.key)
    .single()

  if (error) throw new AppError('Setting not found', 404)

  res.json({
    success: true,
    key: data.key,
    value: data.value
  })
})

// PATCH update setting
router.patch('/:key', async (req, res) => {
  const updateSchema = Joi.object({
    value: Joi.string().required()
  })

  const { error: validationError, value } = updateSchema.validate(req.body)
  if (validationError) {
    throw new AppError(validationError.message, 400)
  }

  const { data, error } = await supabase
    .from('settings')
    .update({
      value: value.value,
      updated_at: new Date().toISOString()
    })
    .eq('key', req.params.key)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new AppError('Setting key already exists', 409)
    }
    throw new AppError(error.message, 500)
  }

  res.json({
    success: true,
    data,
    message: `Setting "${req.params.key}" updated successfully`
  })
})

// POST new setting (if not exists)
router.post('/', validateRequest(settingsSchema), async (req, res) => {
  const { data, error } = await supabase
    .from('settings')
    .insert([req.validatedData])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new AppError('Setting key already exists. Use PATCH to update.', 409)
    }
    throw new AppError(error.message, 500)
  }

  res.status(201).json({
    success: true,
    data,
    message: 'Setting created successfully'
  })
})

export default router
