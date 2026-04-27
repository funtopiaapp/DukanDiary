# DukanDiary Backend API

A comprehensive Express.js backend for textile retail management system built with Supabase PostgreSQL, Resend email, and node-cron scheduling.

## 📋 Features

- ✅ Complete REST API for vendors, stock, expenses, cheques, sales
- ✅ PDF & Excel file parsing and data extraction
- ✅ Advanced reporting (stock register, expense report, cheque register, P&L)
- ✅ Daily email digest with cron jobs
- ✅ Indian Rupee currency formatting (₹1,23,456)
- ✅ Input validation with Joi schemas
- ✅ Comprehensive error handling
- ✅ Supabase Row Level Security (RLS) integration

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn
- Supabase account and project
- Resend account (for email features)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your Supabase and Resend credentials
```

### Environment Variables

```env
PORT=3000
NODE_ENV=development

# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# Resend (Required for email)
RESEND_API_KEY=re_your_resend_api_key

# Application
CORS_ORIGIN=http://localhost:5173
DEFAULT_EMAIL_RECIPIENT=owner@dukandiary.com
```

### Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Health Check

```bash
curl http://localhost:3000/health
```

## 📁 Project Structure

```
src/
├── index.js                 # Express app & middleware setup
├── config/
│   ├── supabase.js         # Supabase client
│   └── email.js            # Resend email client
├── middleware/
│   ├── errorHandler.js     # Global error handling
│   └── validation.js       # Input validation with Joi
├── routes/
│   ├── vendors.js          # Vendor CRUD operations
│   ├── stock.js            # Stock entry management
│   ├── expenses.js         # Expense tracking
│   ├── cheques.js          # Cheque register
│   ├── sales.js            # Sales records
│   ├── upload.js           # PDF/Excel parsing
│   ├── reports.js          # Advanced reporting
│   ├── settings.js         # App settings
│   └── email.js            # Email endpoints
├── services/
│   └── cronJobs.js         # Scheduled tasks
└── utils/
    ├── currencyFormatter.js # INR formatting
    └── emailDigest.js       # Digest email generation
```

## 🔌 API Endpoints

### Vendors
```
GET    /api/vendors              # List all vendors
POST   /api/vendors              # Create vendor
GET    /api/vendors/:id          # Get vendor
PATCH  /api/vendors/:id          # Update vendor
DELETE /api/vendors/:id          # Delete vendor
```

### Stock
```
GET    /api/stock                # List with filters (date_range, vendor)
POST   /api/stock                # Create entry
GET    /api/stock/:id            # Get entry
PATCH  /api/stock/:id            # Update entry
DELETE /api/stock/:id            # Delete entry
```

### Expenses
```
GET    /api/expenses             # List with filters (date_range, category)
POST   /api/expenses             # Create expense
GET    /api/expenses/today-total # Today's sum
GET    /api/expenses/:id         # Get expense
PATCH  /api/expenses/:id         # Update expense
DELETE /api/expenses/:id         # Delete expense
```

### Cheques
```
GET    /api/cheques              # List with status filter
POST   /api/cheques              # Create cheque
GET    /api/cheques/upcoming     # Due in next 2 days
PATCH  /api/cheques/:id          # Update cheque
PATCH  /api/cheques/:id/status   # Update status only
DELETE /api/cheques/:id          # Delete cheque
```

### Sales
```
GET    /api/sales                # List with date range filter
POST   /api/sales                # Create sale
PATCH  /api/sales/:id            # Update sale
DELETE /api/sales/:id            # Delete sale
```

### File Upload
```
POST   /api/upload               # Parse PDF/Excel, return JSON rows
```

### Reports
```
GET    /api/reports/stock-register       # Stock register with date range
GET    /api/reports/expense-report       # Expenses by category
GET    /api/reports/cheque-register      # Cheques by status
GET    /api/reports/profit-loss-summary  # P&L with margins
```

### Settings
```
GET    /api/settings             # Get all settings
POST   /api/settings             # Create new setting
GET    /api/settings/:key        # Get by key
PATCH  /api/settings/:key        # Update by key
```

### Email
```
POST   /api/email/send-digest    # Manually trigger digest email
```

## ⏰ Scheduled Jobs

### Daily Digest Email
- **Schedule:** 7 PM IST (19:00) every day
- **Triggers automatically** via node-cron
- Requires: `RESEND_API_KEY` configured
- Sends: Sales summary, expenses, upcoming cheques

## 📊 Data Models

### Vendors
```json
{
  "id": "uuid",
  "name": "string",
  "phone": "string",
  "gst_number": "string",
  "created_at": "timestamp"
}
```

### Stock Entries
```json
{
  "id": "uuid",
  "date": "date",
  "vendor_id": "uuid (fk)",
  "item_description": "string",
  "quantity": "decimal",
  "unit": "metres|pieces",
  "rate_per_unit": "decimal",
  "total_amount": "decimal",
  "notes": "string"
}
```

### Expenses
```json
{
  "id": "uuid",
  "date": "date",
  "category": "string",
  "description": "string",
  "amount": "decimal",
  "payment_mode": "Cash|UPI|Bank",
  "notes": "string"
}
```

### Cheques
```json
{
  "id": "uuid",
  "date_issued": "date",
  "cheque_number": "string (unique)",
  "bank_name": "string",
  "payee": "string",
  "amount": "decimal",
  "due_date": "date",
  "purpose": "string",
  "status": "Issued|Cleared|Bounced"
}
```

### Sales
```json
{
  "id": "uuid",
  "date": "date",
  "period_type": "daily|monthly|yearly",
  "total_amount": "decimal",
  "cash_amount": "decimal",
  "upi_amount": "decimal",
  "credit_amount": "decimal",
  "notes": "string"
}
```

## 🔒 Security

- All endpoints validate input using Joi schemas
- Supabase Row Level Security (RLS) policies enabled
- CORS configured to specific origin
- Helmet.js for security headers
- Error messages don't expose sensitive data

## 💰 Currency Formatting

All monetary values are formatted as Indian Rupees:
```javascript
formatINR(123456.78)  // ₹1,23,456.78
formatINR(1000)       // ₹1,000.00
```

## 📚 API Documentation

Detailed API documentation is available in `API_DOCUMENTATION.md`

## 🧪 Testing

```bash
# Example: Get all vendors
curl http://localhost:3000/api/vendors

# Example: Create vendor
curl -X POST http://localhost:3000/api/vendors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "XYZ Textiles",
    "phone": "9876543210",
    "gst_number": "27ABCDE1234F1Z0"
  }'

# Example: Get today's total expenses
curl http://localhost:3000/api/expenses/today-total

# Example: Get upcoming cheques
curl http://localhost:3000/api/cheques/upcoming

# Example: Get P&L summary
curl 'http://localhost:3000/api/reports/profit-loss-summary?start_date=2024-04-01&end_date=2024-04-30'
```

## 🐛 Troubleshooting

### Email not sending?
- Check `RESEND_API_KEY` is configured
- Check `DEFAULT_EMAIL_RECIPIENT` is valid
- Check Resend account is verified

### Database connection error?
- Verify `SUPABASE_URL` and `SUPABASE_KEY`
- Check Supabase project is active
- Check schema.sql has been applied to your database

### CORS errors?
- Update `CORS_ORIGIN` to match frontend URL
- Check frontend is making requests to correct API URL

## 📝 Dependencies

- **express** - Web framework
- **@supabase/supabase-js** - Supabase client
- **resend** - Email service
- **joi** - Schema validation
- **multer** - File uploads
- **pdf-parse** - PDF parsing
- **xlsx** - Excel parsing
- **node-cron** - Job scheduling
- **helmet** - Security headers
- **cors** - CORS handling
- **express-async-errors** - Async error handling

## 🚀 Deployment

1. Set up production environment variables in `.env`
2. Run `npm install`
3. Run `npm start`
4. Configure CORS for production domain
5. Set up automated backup for Supabase

## 📄 License

MIT

## 🤝 Support

For detailed API documentation, see `API_DOCUMENTATION.md`

---

**DukanDiary Backend** - Empowering textile retail with technology 🧵
