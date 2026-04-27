import express from 'express'
import { supabase } from '../config/supabase.js'
import { AppError } from '../middleware/errorHandler.js'

const router = express.Router()

// GET audit log with filters
router.get('/', async (req, res, next) => {
  try {
    const { action, employee_id, table_name, start_date, end_date, limit = 100 } = req.query

    let query = supabase
      .from('audit_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit))

    if (action) query = query.eq('action', action)
    if (employee_id) query = query.eq('employee_id', employee_id)
    if (table_name) query = query.eq('table_name', table_name)
    if (start_date) query = query.gte('timestamp', start_date)
    if (end_date) query = query.lte('timestamp', end_date)

    const { data, error, count } = await query

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

// CREATE audit log entry
router.post('/', async (req, res, next) => {
  try {
    const {
      action,
      employee_id,
      employee_name,
      table_name,
      record_id,
      changes
    } = req.body

    if (!action || !employee_id) {
      throw new Error('Action and employee_id are required')
    }

    const { data, error } = await supabase
      .from('audit_log')
      .insert([
        {
          action,
          employee_id,
          employee_name: employee_name || 'Unknown',
          table_name: table_name || null,
          record_id: record_id || null,
          changes: changes || null
        }
      ])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      success: true,
      data
    })
  } catch (error) {
    next(new AppError(error.message, 500))
  }
})

// GET audit log for specific employee
router.get('/employee/:employee_id', async (req, res, next) => {
  try {
    const { employee_id } = req.params
    const { limit = 50 } = req.query

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('employee_id', employee_id)
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit))

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

// GET audit log for specific table
router.get('/table/:table_name', async (req, res, next) => {
  try {
    const { table_name } = req.params
    const { limit = 100 } = req.query

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('table_name', table_name)
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit))

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

export default router
