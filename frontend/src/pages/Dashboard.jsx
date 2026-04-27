import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import SummaryCard from '../components/SummaryCard'
import AlertBanner from '../components/AlertBanner'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { api } from '../lib/api'
import { formatDate, getTodayDate, getDaysUntil } from '../lib/utils'
import { formatINR } from '../lib/currencyFormatter'
import { useToast } from '../hooks/useToast'

const Dashboard = () => {
  const navigate = useNavigate()
  const { error: showError } = useToast()

  const [todayExpenses, setTodayExpenses] = useState(0)
  const [monthStock, setMonthStock] = useState(0)
  const [monthSales, setMonthSales] = useState(0)
  const [pendingCheques, setPendingCheques] = useState(0)
  const [upcomingCheques, setUpcomingCheques] = useState([])
  const [loading, setLoading] = useState(true)

  const today = getTodayDate()
  const startOfMonth = today.substring(0, 7) + '-01'
  const endOfMonth = today.substring(0, 7) + '-31'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Today's expenses
        const expensesRes = await api.getTodayExpenseTotal()
        setTodayExpenses(expensesRes.data.total_amount || 0)

        // This month stock
        const stockRes = await api.getStock({ start_date: startOfMonth, end_date: today })
        const stockTotal = stockRes.data.reduce((sum, item) => sum + item.total_amount, 0)
        setMonthStock(stockTotal)

        // This month sales
        const salesRes = await api.getSales({ start_date: startOfMonth, end_date: today })
        const salesTotal = salesRes.data.reduce((sum, item) => sum + item.total_amount, 0)
        setMonthSales(salesTotal)

        // Pending cheques
        const chequesRes = await api.getCheques({ status: 'Issued' })
        setPendingCheques(chequesRes.data.length)

        // Upcoming cheques
        const upcomingRes = await api.getUpcomingCheques()
        setUpcomingCheques(upcomingRes.data)
      } catch (err) {
        showError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const chequesDueToday = upcomingCheques.filter(c => getDaysUntil(c.due_date) === 0)
  const chequesDueTomorrow = upcomingCheques.filter(c => getDaysUntil(c.due_date) === 1)
  const hasAlert = chequesDueToday.length > 0 || chequesDueTomorrow.length > 0

  return (
    <div className="screen-container">
      <Header
        title="DukanDiary"
        subtitle={new Date().toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      />

      <div className="p-6 space-y-6">
        {/* Alert Banner */}
        {hasAlert && (
          <div className="space-y-3">
            {chequesDueToday.length > 0 && (
              <AlertBanner
                type="warning"
                icon="🔴"
                title="Cheques Due TODAY"
                message={`${chequesDueToday.length} cheque(s) due today - ${formatINR(
                  chequesDueToday.reduce((s, c) => s + c.amount, 0)
                )}`}
              />
            )}
            {chequesDueTomorrow.length > 0 && (
              <AlertBanner
                type="warning"
                icon="🟠"
                title="Cheques Due Tomorrow"
                message={`${chequesDueTomorrow.length} cheque(s) due tomorrow - ${formatINR(
                  chequesDueTomorrow.reduce((s, c) => s + c.amount, 0)
                )}`}
              />
            )}
          </div>
        )}

        {/* Summary Cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SummaryCard
              icon="💰"
              title="Today's Expenses"
              value={todayExpenses}
              color="red"
            />
            <SummaryCard
              icon="📦"
              title="This Month Stock"
              value={monthStock}
              color="blue"
            />
            <SummaryCard
              icon="📈"
              title="This Month Sales"
              value={monthSales}
              color="green"
            />
            <SummaryCard
              icon="🏦"
              title="Pending Cheques"
              value={`${pendingCheques} issued`}
              color="blue"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3 mt-8">
          <p className="text-xl font-bold text-gray-900 px-4">Quick Actions</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/stock/add')}
              className="bg-sky-500 text-white min-h-[52px] rounded-lg font-semibold hover:bg-sky-600 transition-all"
            >
              ➕ Add Stock
            </button>
            <button
              onClick={() => navigate('/expenses/add')}
              className="bg-sky-500 text-white min-h-[52px] rounded-lg font-semibold hover:bg-sky-600 transition-all"
            >
              ➕ Add Expense
            </button>
            <button
              onClick={() => navigate('/cheques/add')}
              className="bg-sky-500 text-white min-h-[52px] rounded-lg font-semibold hover:bg-sky-600 transition-all"
            >
              ➕ Add Cheque
            </button>
            <button
              onClick={() => navigate('/sales/add')}
              className="bg-sky-500 text-white min-h-[52px] rounded-lg font-semibold hover:bg-sky-600 transition-all"
            >
              ➕ Record Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
