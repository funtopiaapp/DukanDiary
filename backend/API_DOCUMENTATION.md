# DukanDiary Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, all endpoints are publicly accessible. When implementing authentication, add JWT tokens to the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### VENDORS

#### GET /api/vendors
Get all vendors
- **Response:** List of all vendors

#### GET /api/vendors/:id
Get single vendor by ID

#### POST /api/vendors
Create new vendor
```json
{
  "name": "Vendor Name",
  "phone": "9876543210",
  "gst_number": "27ABCDE1234F1Z0"
}
```

#### PATCH /api/vendors/:id
Update vendor

#### DELETE /api/vendors/:id
Delete vendor

---

### STOCK ENTRIES

#### GET /api/stock
Get stock entries with optional filters
- **Query Parameters:**
  - `start_date` (YYYY-MM-DD) - Filter from date
  - `end_date` (YYYY-MM-DD) - Filter to date
  - `vendor_id` (UUID) - Filter by vendor

#### GET /api/stock/:id
Get single stock entry

#### POST /api/stock
Create new stock entry
```json
{
  "date": "2024-04-26",
  "vendor_id": "550e8400-e29b-41d4-a716-446655440000",
  "item_description": "Cotton Fabric - 60 GSM",
  "quantity": 100,
  "unit": "metres",
  "rate_per_unit": 150.50,
  "total_amount": 15050.00,
  "notes": "Premium quality"
}
```
- **Unit Options:** `metres`, `pieces`

#### PATCH /api/stock/:id
Update stock entry

#### DELETE /api/stock/:id
Delete stock entry

---

### EXPENSES

#### GET /api/expenses
Get all expenses with optional filters
- **Query Parameters:**
  - `start_date` (YYYY-MM-DD) - Filter from date
  - `end_date` (YYYY-MM-DD) - Filter to date
  - `category` (string) - Filter by category

#### GET /api/expenses/today-total
Get today's total expenses
- **Response:**
```json
{
  "success": true,
  "date": "2024-04-26",
  "total_amount": 5000,
  "formatted_amount": "₹5,000.00",
  "count": 3
}
```

#### GET /api/expenses/:id
Get single expense

#### POST /api/expenses
Create new expense
```json
{
  "date": "2024-04-26",
  "category": "Rent",
  "description": "Monthly shop rent",
  "amount": 25000.00,
  "payment_mode": "Bank",
  "notes": "April rent payment"
}
```
- **Payment Modes:** `Cash`, `UPI`, `Bank`
- **Default Categories:** Rent, Utilities, Salary, Marketing, Supplies, Transportation, Insurance, Maintenance, Office Equipment, Professional Fees, Licenses, Other

#### PATCH /api/expenses/:id
Update expense

#### DELETE /api/expenses/:id
Delete expense

---

### CHEQUES

#### GET /api/cheques
Get all cheques with optional status filter
- **Query Parameters:**
  - `status` (string) - Filter by status (Issued, Cleared, Bounced)

#### GET /api/cheques/upcoming
Get cheques due in next 2 days

#### GET /api/cheques/:id
Get single cheque

#### POST /api/cheques
Create new cheque
```json
{
  "date_issued": "2024-04-26",
  "cheque_number": "CHQ000123",
  "bank_name": "HDFC Bank",
  "payee": "XYZ Supplier",
  "amount": 50000.00,
  "due_date": "2024-05-26",
  "purpose": "Payment for goods received",
  "status": "Issued"
}
```
- **Status Options:** `Issued`, `Cleared`, `Bounced`

#### PATCH /api/cheques/:id
Update cheque

#### PATCH /api/cheques/:id/status
Update cheque status only
```json
{
  "status": "Cleared"
}
```

#### DELETE /api/cheques/:id
Delete cheque

---

### SALES

#### GET /api/sales
Get sales with optional date range filter
- **Query Parameters:**
  - `start_date` (YYYY-MM-DD) - Filter from date
  - `end_date` (YYYY-MM-DD) - Filter to date

#### GET /api/sales/:id
Get single sale

#### POST /api/sales
Create new sale
```json
{
  "date": "2024-04-26",
  "period_type": "daily",
  "total_amount": 10000.00,
  "cash_amount": 6000.00,
  "upi_amount": 3000.00,
  "credit_amount": 1000.00,
  "notes": "Good day"
}
```
- **Period Types:** `daily`, `monthly`, `yearly`
- **Note:** Sum of cash_amount + upi_amount + credit_amount must equal total_amount

#### PATCH /api/sales/:id
Update sale

#### DELETE /api/sales/:id
Delete sale

---

### FILE UPLOAD

#### POST /api/upload
Upload and parse PDF or Excel file
- **Content-Type:** multipart/form-data
- **Form Field:** `file` (PDF or Excel file)
- **Max Size:** 50 MB
- **Response:**
```json
{
  "success": true,
  "file_name": "data.xlsx",
  "file_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "rows_extracted": 25,
  "data": [...]
}
```

---

### REPORTS

#### GET /api/reports/stock-register
Get stock register report
- **Query Parameters:**
  - `start_date` (optional)
  - `end_date` (optional)

#### GET /api/reports/expense-report
Get expense report with category breakdown
- **Query Parameters:**
  - `start_date` (optional)
  - `end_date` (optional)

#### GET /api/reports/cheque-register
Get cheque register with status breakdown
- **Query Parameters:**
  - `start_date` (optional)
  - `end_date` (optional)

#### GET /api/reports/profit-loss-summary
Get profit & loss summary
- **Query Parameters:**
  - `start_date` (optional)
  - `end_date` (optional)
- **Response Includes:**
  - Total Sales
  - Cost of Goods Sold (COGS)
  - Operating Expenses
  - Gross Profit
  - Net Profit
  - Profit Margin %

---

### SETTINGS

#### GET /api/settings
Get all settings as object

#### GET /api/settings/:key
Get single setting by key

#### POST /api/settings
Create new setting
```json
{
  "key": "business_name",
  "value": "My Textile Shop"
}
```

#### PATCH /api/settings/:key
Update setting by key
```json
{
  "value": "Updated Value"
}
```

**Default Settings:**
- `default_email_recipient` - Email address for digest
- `expense_categories` - Comma-separated list of categories

---

### EMAIL

#### POST /api/email/send-digest
Manually trigger daily digest email
- **Response:**
```json
{
  "success": true,
  "message": "Daily digest email sent successfully",
  "timestamp": "2024-04-26T10:30:00Z"
}
```

---

## CRON JOBS

### Daily Digest Email
- **Schedule:** 7 PM IST (19:00) every day
- **Action:** Sends email digest with:
  - Today's sales summary
  - Today's expenses breakdown
  - Upcoming cheques (next 2 days)
- **Email Settings:** Configure `RESEND_API_KEY` and `DEFAULT_EMAIL_RECIPIENT` in .env

---

## Error Handling

All errors follow this format:
```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-04-26T10:30:00Z"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Server Error

---

## Currency Formatting

All monetary amounts are returned in Indian Rupee (INR) format:
```
₹1,23,456.78
```

---

## Data Validation

All inputs are validated using Joi schema validation. Examples:
- Dates must be in ISO format (YYYY-MM-DD)
- Numbers must be positive
- Enums must match allowed values
- String lengths are validated

---

## Environment Setup

1. Copy `.env.example` to `.env`
2. Add Supabase credentials
3. Add Resend API key for email features
4. Configure CORS origin
5. Run `npm install`
6. Run `npm run dev`

---

## Development

### Run Development Server
```bash
npm run dev
```

### Run Production Server
```bash
npm start
```

### Code Structure
```
src/
├── index.js              # Express app entry
├── config/               # Configuration files
├── middleware/           # Express middleware
├── routes/               # API endpoints
├── services/             # Business logic
└── utils/                # Utility functions
```

---

## Support

For issues or questions, please refer to:
- Supabase Docs: https://supabase.com/docs
- Resend Docs: https://resend.com/docs
- Express Docs: https://expressjs.com
