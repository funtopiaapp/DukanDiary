import { supabase } from '../config/supabase.js'
import { resend } from '../config/email.js'
import { formatINR } from './currencyFormatter.js'

export const sendDailyDigest = async () => {
  try {
    if (!resend) {
      console.log('📧 Email not configured. Skipping digest.')
      return
    }

    const today = new Date().toISOString().split('T')[0]

    // Get today's sales
    const { data: todaySales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .eq('date', today)

    if (salesError) throw salesError

    // Get today's expenses
    const { data: todayExpenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('date', today)

    if (expensesError) throw expensesError

    // Get upcoming cheques (next 2 days)
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0]

    const { data: upcomingCheques, error: chequeError } = await supabase
      .from('cheques')
      .select('*')
      .in('due_date', [today, tomorrow, dayAfter])
      .eq('status', 'Issued')

    if (chequeError) throw chequeError

    // Get settings for email recipient
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'default_email_recipient')
      .single()

    const emailRecipient = settings?.value || 'owner@dukandiary.com'

    // Calculate totals
    const totalSales = todaySales.reduce((sum, s) => sum + s.total_amount, 0)
    const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0)

    // Generate HTML
    const html = generateDigestHTML({
      date: today,
      totalSales,
      totalExpenses,
      salesBreakdown: todaySales,
      expenses: todayExpenses,
      upcomingCheques
    })

    // Send email
    await resend.emails.send({
      from: 'DukanDiary <noreply@dukandiary.com>',
      to: emailRecipient,
      subject: `Daily Digest - ${today}`,
      html
    })

    console.log(`✅ Daily digest sent to ${emailRecipient}`)
  } catch (error) {
    console.error('❌ Error sending daily digest:', error.message)
  }
}

const generateDigestHTML = ({ date, totalSales, totalExpenses, salesBreakdown, expenses, upcomingCheques }) => {
  const profit = totalSales - totalExpenses

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3B82F6; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #3B82F6; }
        .metric { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .metric-label { font-weight: 500; }
        .metric-value { font-weight: bold; }
        .positive { color: #10B981; }
        .negative { color: #EF4444; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📊 DukanDiary Daily Digest</h2>
          <p>Report for ${date}</p>
        </div>

        <div class="section">
          <div class="section-title">📈 Summary</div>
          <div class="metric">
            <span class="metric-label">Total Sales</span>
            <span class="metric-value positive">${formatINR(totalSales)}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Total Expenses</span>
            <span class="metric-value negative">${formatINR(totalExpenses)}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Net Profit/Loss</span>
            <span class="metric-value ${profit >= 0 ? 'positive' : 'negative'}">${formatINR(profit)}</span>
          </div>
        </div>

        ${salesBreakdown.length > 0 ? `
        <div class="section">
          <div class="section-title">🛍️ Sales Details</div>
          <table>
            <tr>
              <th>Period</th>
              <th>Amount</th>
            </tr>
            ${salesBreakdown.map(s => `
              <tr>
                <td>${s.period_type.toUpperCase()}</td>
                <td>${formatINR(s.total_amount)}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}

        ${expenses.length > 0 ? `
        <div class="section">
          <div class="section-title">💰 Expenses</div>
          <table>
            <tr>
              <th>Category</th>
              <th>Amount</th>
            </tr>
            ${expenses.map(e => `
              <tr>
                <td>${e.category}</td>
                <td>${formatINR(e.amount)}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}

        ${upcomingCheques.length > 0 ? `
        <div class="section">
          <div class="section-title">🏦 Upcoming Cheques</div>
          <table>
            <tr>
              <th>Cheque #</th>
              <th>Payee</th>
              <th>Amount</th>
              <th>Due Date</th>
            </tr>
            ${upcomingCheques.map(c => `
              <tr>
                <td>${c.cheque_number}</td>
                <td>${c.payee}</td>
                <td>${formatINR(c.amount)}</td>
                <td>${c.due_date}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}

        <div class="footer">
          <p>Generated by DukanDiary at ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </div>
    </body>
    </html>
  `
}
