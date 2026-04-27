import express from 'express'
import { supabase } from '../config/supabase.js'
import { validateQuery, dateRangeSchema } from '../middleware/validation.js'
import { AppError } from '../middleware/errorHandler.js'
import { formatINR } from '../utils/currencyFormatter.js'

const router = express.Router()

// GET stock register report
router.get('/stock-register', validateQuery(dateRangeSchema), async (req, res) => {
  let query = supabase
    .from('stock_entries')
    .select('*, vendors(name, gst_number)')

  if (req.validatedQuery.start_date) {
    query = query.gte('date', req.validatedQuery.start_date)
  }

  if (req.validatedQuery.end_date) {
    query = query.lte('date', req.validatedQuery.end_date)
  }

  const { data, error } = await query.order('date', { ascending: false })

  if (error) throw new AppError(error.message, 500)

  const totalQuantity = data.reduce((sum, entry) => sum + parseFloat(entry.quantity), 0)
  const totalAmount = data.reduce((sum, entry) => sum + entry.total_amount, 0)

  res.json({
    success: true,
    report_type: 'stock_register',
    period: {
      start_date: req.validatedQuery.start_date || 'all_time',
      end_date: req.validatedQuery.end_date || 'all_time'
    },
    summary: {
      total_entries: data.length,
      total_quantity: totalQuantity,
      total_amount: totalAmount,
      formatted_amount: formatINR(totalAmount)
    },
    data
  })
})

// GET expense report
router.get('/expense-report', validateQuery(dateRangeSchema), async (req, res) => {
  let query = supabase.from('expenses').select('*')

  if (req.validatedQuery.start_date) {
    query = query.gte('date', req.validatedQuery.start_date)
  }

  if (req.validatedQuery.end_date) {
    query = query.lte('date', req.validatedQuery.end_date)
  }

  const { data, error } = await query.order('date', { ascending: false })

  if (error) throw new AppError(error.message, 500)

  // Group by category
  const byCategory = data.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = { total: 0, count: 0, items: [] }
    }
    acc[expense.category].total += expense.amount
    acc[expense.category].count += 1
    acc[expense.category].items.push(expense)
    return acc
  }, {})

  const totalAmount = data.reduce((sum, e) => sum + e.amount, 0)

  res.json({
    success: true,
    report_type: 'expense_report',
    period: {
      start_date: req.validatedQuery.start_date || 'all_time',
      end_date: req.validatedQuery.end_date || 'all_time'
    },
    summary: {
      total_expenses: data.length,
      total_amount: totalAmount,
      formatted_amount: formatINR(totalAmount),
      by_category: Object.entries(byCategory).map(([category, stats]) => ({
        category,
        total: stats.total,
        formatted_total: formatINR(stats.total),
        count: stats.count
      }))
    },
    data,
    detailed_by_category: byCategory
  })
})

// GET cheque register report
router.get('/cheque-register', validateQuery(dateRangeSchema), async (req, res) => {
  let query = supabase.from('cheques').select('*')

  if (req.validatedQuery.start_date) {
    query = query.gte('date_issued', req.validatedQuery.start_date)
  }

  if (req.validatedQuery.end_date) {
    query = query.lte('date_issued', req.validatedQuery.end_date)
  }

  const { data, error } = await query.order('date_issued', { ascending: false })

  if (error) throw new AppError(error.message, 500)

  // Group by status
  const byStatus = data.reduce((acc, cheque) => {
    if (!acc[cheque.status]) {
      acc[cheque.status] = { total: 0, count: 0, items: [] }
    }
    acc[cheque.status].total += cheque.amount
    acc[cheque.status].count += 1
    acc[cheque.status].items.push(cheque)
    return acc
  }, {})

  const totalAmount = data.reduce((sum, c) => sum + c.amount, 0)

  res.json({
    success: true,
    report_type: 'cheque_register',
    period: {
      start_date: req.validatedQuery.start_date || 'all_time',
      end_date: req.validatedQuery.end_date || 'all_time'
    },
    summary: {
      total_cheques: data.length,
      total_amount: totalAmount,
      formatted_amount: formatINR(totalAmount),
      by_status: Object.entries(byStatus).map(([status, stats]) => ({
        status,
        total: stats.total,
        formatted_total: formatINR(stats.total),
        count: stats.count
      }))
    },
    data,
    detailed_by_status: byStatus
  })
})

// GET profit & loss summary
router.get('/profit-loss-summary', validateQuery(dateRangeSchema), async (req, res) => {
  const { start_date, end_date } = req.validatedQuery

  // Get sales
  let salesQuery = supabase.from('sales').select('total_amount')
  if (start_date) salesQuery = salesQuery.gte('date', start_date)
  if (end_date) salesQuery = salesQuery.lte('date', end_date)
  const { data: sales, error: salesError } = await salesQuery

  if (salesError) throw new AppError(salesError.message, 500)

  // Get expenses
  let expenseQuery = supabase.from('expenses').select('amount')
  if (start_date) expenseQuery = expenseQuery.gte('date', start_date)
  if (end_date) expenseQuery = expenseQuery.lte('date', end_date)
  const { data: expenses, error: expenseError } = await expenseQuery

  if (expenseError) throw new AppError(expenseError.message, 500)

  // Get stock purchases (cost of goods)
  let stockQuery = supabase.from('stock_entries').select('total_amount')
  if (start_date) stockQuery = stockQuery.gte('date', start_date)
  if (end_date) stockQuery = stockQuery.lte('date', end_date)
  const { data: stock, error: stockError } = await stockQuery

  if (stockError) throw new AppError(stockError.message, 500)

  const totalSales = sales.reduce((sum, s) => sum + s.total_amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalCOGS = stock.reduce((sum, s) => sum + s.total_amount, 0)

  const grossProfit = totalSales - totalCOGS
  const netProfit = grossProfit - totalExpenses

  res.json({
    success: true,
    report_type: 'profit_loss_summary',
    period: {
      start_date: start_date || 'all_time',
      end_date: end_date || 'all_time'
    },
    income: {
      total_sales: totalSales,
      formatted_sales: formatINR(totalSales)
    },
    expenses: {
      cost_of_goods_sold: totalCOGS,
      formatted_cogs: formatINR(totalCOGS),
      operating_expenses: totalExpenses,
      formatted_expenses: formatINR(totalExpenses),
      total_expenses: totalCOGS + totalExpenses,
      formatted_total: formatINR(totalCOGS + totalExpenses)
    },
    profit_loss: {
      gross_profit: grossProfit,
      formatted_gross: formatINR(grossProfit),
      net_profit: netProfit,
      formatted_net: formatINR(netProfit),
      profit_margin: totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(2) + '%' : '0%'
    }
  })
})

export default router
