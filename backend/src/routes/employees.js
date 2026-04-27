import express from 'express'
import { supabase } from '../config/supabase.js'
import { AppError } from '../middleware/errorHandler.js'

const router = express.Router()

// GET all active employees
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, pin, role, is_active')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    res.json({
      success: true,
      data,
      count: data.length
    })
  } catch (error) {
    next(new AppError(error.message, 500))
  }
})

// GET single employee
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('employees')
      .select('id, name, pin, role, is_active, created_at')
      .eq('id', id)
      .single()

    if (error) throw error

    res.json({
      success: true,
      data
    })
  } catch (error) {
    next(new AppError(error.message, 500))
  }
})

// CREATE new employee
router.post('/', async (req, res, next) => {
  try {
    const { name, pin, role } = req.body

    if (!name || !pin) {
      throw new Error('Name and PIN are required')
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      throw new Error('PIN must be exactly 4 digits')
    }

    const { data, error } = await supabase
      .from('employees')
      .insert([
        {
          name: name.trim(),
          pin: pin.trim(),
          role: role || 'staff',
          is_active: true
        }
      ])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      success: true,
      data,
      message: 'Employee created successfully'
    })
  } catch (error) {
    next(new AppError(error.message, 500))
  }
})

// UPDATE employee
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, role, is_active } = req.body

    const updateData = {}
    if (name !== undefined) updateData.name = name.trim()
    if (role !== undefined) updateData.role = role
    if (is_active !== undefined) updateData.is_active = is_active
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data,
      message: 'Employee updated successfully'
    })
  } catch (error) {
    next(new AppError(error.message, 500))
  }
})

// DEACTIVATE employee (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('employees')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data,
      message: 'Employee deactivated successfully'
    })
  } catch (error) {
    next(new AppError(error.message, 500))
  }
})

export default router
