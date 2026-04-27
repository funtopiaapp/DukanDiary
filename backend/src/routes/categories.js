import express from 'express'
import { supabase } from '../config/supabase.js'
import { AppError } from '../middleware/errorHandler.js'

const router = express.Router()

// GET all active categories (ordered by display_order)
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

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

// GET single category by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
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

// CREATE new category
router.post('/', async (req, res, next) => {
  try {
    const { name, description, color, display_order } = req.body

    if (!name || name.trim() === '') {
      throw new Error('Category name is required')
    }

    const { data, error } = await supabase
      .from('expense_categories')
      .insert([
        {
          name: name.trim(),
          description: description || null,
          color: color || '#FF6B35',
          display_order: display_order || 0,
          is_active: true
        }
      ])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      success: true,
      data,
      message: 'Category created successfully'
    })
  } catch (error) {
    next(new AppError(error.message, 500))
  }
})

// UPDATE category
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, description, color, display_order, is_active } = req.body

    const updateData = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description
    if (color !== undefined) updateData.color = color
    if (display_order !== undefined) updateData.display_order = display_order
    if (is_active !== undefined) updateData.is_active = is_active
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('expense_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data,
      message: 'Category updated successfully'
    })
  } catch (error) {
    next(new AppError(error.message, 500))
  }
})

// DELETE category (soft delete - mark as inactive)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('expense_categories')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data,
      message: 'Category deleted successfully'
    })
  } catch (error) {
    next(new AppError(error.message, 500))
  }
})

export default router
