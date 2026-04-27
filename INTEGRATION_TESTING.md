# Frontend-Backend Integration Testing Guide

## ✅ Integration Complete!

All frontend screens are now wired to their corresponding backend API endpoints with proper error handling, loading states, and user feedback.

---

## 🔐 Authentication Testing

### PIN Authentication Flow

**Setup:**
1. Database has `default_pin = '1234'` in settings table
2. Frontend checks PIN against `/api/settings`
3. Session stored in localStorage as JSON

**Test Steps:**
```
1. Open http://localhost:5173/login
2. Enter: 1234
3. Click Login
4. Verify: Redirects to Dashboard
5. Check: localStorage has 'dukandiary_session' with authenticated=true
6. Refresh page: Should stay on Dashboard (session persists)
```

**Expected Behavior:**
- ✅ Loading overlay shows during PIN verification
- ✅ Invalid PIN shows error toast
- ✅ Valid PIN stores session and navigates to home
- ✅ 24-hour session timeout implemented
- ✅ Protected routes redirect to login if not authenticated

---

## 📱 Dashboard Testing

### Cheque Alert Banner

**Endpoint:** `GET /api/cheques/upcoming`

**Test Steps:**
```
1. Create cheques with due dates today/tomorrow via API
2. Go to Dashboard
3. Verify: Alert banner appears with cheque count and amount
4. Check: Red banner for today's cheques, orange for tomorrow
5. Click alert: Should navigate to cheque list
```

**Expected Response:**
```json
{
  "success": true,
  "data": [...cheques],
  "count": 2,
  "message": "2 cheques due in next 2 days"
}
```

### Summary Cards

**Endpoints:**
- `GET /api/expenses/today-total`
- `GET /api/stock` (with date filters)
- `GET /api/sales` (with date filters)
- `GET /api/cheques?status=Issued`

**Test Steps:**
```
1. Add stock entries, expenses, sales, cheques via API
2. Go to Dashboard
3. Verify: All 4 summary cards load data
4. Check: Loading spinners appear while fetching
5. Refresh: Data updates on page reload
```

**Expected Behavior:**
- ✅ Loading spinners show during data fetch
- ✅ Cards update with latest data
- ✅ Error toast if API fails
- ✅ Currency formatting shows correctly (₹1,23,456)

---

## 📦 Stock Management Testing

### Stock Entry Flow

**Endpoints:**
- `GET /api/vendors`
- `POST /api/vendors` (add new vendor)
- `POST /api/stock` (create entry)

**Test Steps:**
```
1. Go to Stock (tab navigation)
2. Click "Add New Entry"
3. Select vendor from dropdown
4. Click "+ Add New Vendor"
5. Fill vendor details and save
6. Vendor should appear in dropdown
7. Fill stock entry form:
   - Date: Today
   - Item: "Cotton Fabric 60GSM"
   - Quantity: 100
   - Unit: Metres
   - Rate: 150
8. Verify: Total auto-calculates to ₹15,000
9. Click Save
10. Verify: Success toast shows
11. Should redirect to stock list
```

**Expected Behavior:**
- ✅ Vendor dropdown loads from API
- ✅ Inline vendor creation works
- ✅ All fields validate before submit
- ✅ Total amount auto-calculates
- ✅ Loading overlay shows during save
- ✅ Success toast on completion
- ✅ Redirects to history view

### Stock History & Filters

**Endpoints:**
- `GET /api/stock?start_date=X&end_date=Y&vendor_id=Z`
- `PATCH /api/stock/:id`
- `DELETE /api/stock/:id`

**Test Steps:**
```
1. Go to Stock History
2. Verify: Shows all entries
3. Set date range: Last 30 days
4. Verify: List filters by date
5. Select vendor filter
6. Verify: List filters by vendor
7. Click Edit on entry
8. Modify amount
9. Click Save
10. Verify: Success toast
11. List updates
12. Click Delete
13. Confirm deletion
14. Verify: Entry removed from list
```

**Expected Behavior:**
- ✅ Entries display with date badges
- ✅ Date range filtering works
- ✅ Vendor filtering works
- ✅ Edit/Delete buttons functional
- ✅ Summary shows totals
- ✅ Sticky "Add" button at bottom

---

## 💰 Expense Tracking Testing

### Expense Entry Flow

**Endpoints:**
- `GET /api/settings` (for categories)
- `GET /api/expenses/today-total`
- `POST /api/expenses`

**Test Steps:**
```
1. Go to Expenses (tab navigation)
2. Click "Add Expense"
3. Verify: Today's total shows at top
4. Select category: "Rent"
5. Enter description: "May monthly rent"
6. Enter amount: 25000
7. Select payment mode: Bank
8. Click Save
9. Verify: Success toast
10. Redirect to expense list
11. Go back and add another
12. Verify: Today's total updated
```

**Expected Behavior:**
- ✅ Categories load from settings
- ✅ Today's running total displays
- ✅ Payment mode toggle works
- ✅ Date picker defaults to today
- ✅ Amount validation (must be positive)
- ✅ Loading overlay during save
- ✅ Success feedback

### Expense History with Filters

**Endpoints:**
- `GET /api/expenses?start_date=X&end_date=Y&category=Z`

**Test Steps:**
```
1. Go to Expense History
2. Verify: Summary shows total amount
3. Verify: Category breakdown displayed
4. Change date range
5. Verify: List filters by date
6. Select category
7. Verify: List filters by category
8. Click Edit
9. Modify details
10. Verify: Updates correctly
11. Click Delete
12. Verify: Removed from list
```

**Expected Behavior:**
- ✅ Summary includes category breakdown
- ✅ Date range filtering works
- ✅ Category filtering works
- ✅ Edit/Delete functionality
- ✅ Color coding (Red for expenses)
- ✅ Running calculations update

---

## 🏦 Cheque Management Testing

### Cheque Entry Flow

**Endpoints:**
- `POST /api/cheques`

**Test Steps:**
```
1. Go to Cheques (tab navigation)
2. Click "Add Cheque"
3. Fill all fields:
   - Date Issued: Today
   - Cheque Number: CHQ001001
   - Bank Name: HDFC Bank
   - Payee: ABC Supplier
   - Amount: 50000
   - Due Date: 7 days from now
   - Purpose: Payment for goods
   - Status: Issued
4. Click Save
5. Verify: Success toast
6. Should redirect to cheque list
```

**Expected Behavior:**
- ✅ All fields validate
- ✅ Date picker works
- ✅ Cheque number validation
- ✅ Amount must be positive
- ✅ Status toggle works
- ✅ Loading overlay during save
- ✅ Unique cheque number validation

### Cheque List with Status Tabs

**Endpoints:**
- `GET /api/cheques?status=Issued`
- `GET /api/cheques/upcoming`
- `PATCH /api/cheques/:id/status`

**Test Steps:**
```
1. Go to Cheque List
2. Verify: All cheques shown (All tab selected)
3. Click "Issued" tab
4. Verify: Only issued cheques shown
5. Click "Cleared" tab
6. Verify: Only cleared cheques shown
7. Create cheque due today
8. Go to Dashboard
9. Verify: Alert banner shows
10. Go back to cheque list
11. Verify: Cheque has red highlight
12. Click Edit on upcoming cheque
13. Change status to "Cleared"
14. Verify: Alert disappears from dashboard
```

**Expected Behavior:**
- ✅ Status filter tabs work
- ✅ Color coding:
  - Green = Cleared
  - Yellow = Due within 2 days
  - Red = Overdue/Bounced
  - Gray = Normal issued
- ✅ Upcoming cheques show on dashboard
- ✅ Status update works
- ✅ Days until due calculated correctly

---

## 📈 Sales Recording Testing

### Manual Sales Entry

**Endpoints:**
- `POST /api/sales` (with validation)

**Test Steps:**
```
1. Go to Home, click "Record Sale" OR navigate to /sales/add
2. Toggle: Manual Entry (default)
3. Fill form:
   - Date: Today
   - Period Type: Daily
   - Total Sales: 10000
   - Cash: 6000
   - UPI: 3000
   - Bank/Credit: 1000
4. Verify: Balance shows green (balanced)
5. Change cash to 5000
6. Verify: Difference shown in red
7. Fix balance
8. Click Save
9. Verify: Success toast
10. Should redirect to home
```

**Expected Behavior:**
- ✅ Real-time balance calculation
- ✅ Red warning when unbalanced
- ✅ Green indicator when balanced
- ✅ Sum must equal total amount
- ✅ Loading overlay during save
- ✅ Success feedback

### File Upload - End-to-End Flow

**Endpoint:** `POST /api/upload` (parser)

**Step 1: File Validation**
```
1. Go to Sales Add
2. Toggle: File Upload
3. Try uploading file > 50MB
4. Verify: Error message shows
5. Try uploading .txt file
6. Verify: Unsupported format error
7. Upload valid Excel file
```

**Expected:** Error validation works

**Step 2: Upload & Parse**
```
1. Upload valid Excel with sales data
2. Verify: Loading spinner shows
3. Verify: Rows extracted and displayed
4. Preview shows first 10 rows
5. Date, Amount, Cash, UPI, Credit columns visible
```

**Expected Behavior:**
- ✅ File accepted after validation
- ✅ Loading overlay during parse
- ✅ Success toast with row count
- ✅ Data preview displays correctly
- ✅ Column headers clear

**Step 3: Data Preview**
```
1. Preview table shows parsed data
2. Verify: Currency formatting correct
3. Verify: All columns visible
4. Scroll through preview
5. Row count shown at bottom
```

**Expected:** Data displayed correctly

**Step 4: Validation**
```
1. Click "Confirm & Import"
2. If errors exist:
   - Error list displays
   - Issues highlighted
   - Cancel option available
3. If valid:
   - Proceed to import
```

**Expected Behavior:**
- ✅ Validates date format
- ✅ Validates amounts > 0
- ✅ Validates breakdown = total
- ✅ Shows clear error messages
- ✅ Allows correcting issues

**Step 5: Import & Save**
```
1. Confirm valid data
2. Verify: Loading overlay shows "Importing X rows"
3. Wait for completion
4. Verify: Success toast shows count
5. Verify: Redirects to home
6. Check: Sales data accessible in API
```

**Expected Behavior:**
- ✅ Imports rows one by one
- ✅ Error handling per row
- ✅ Success count accurate
- ✅ Failed rows reported
- ✅ Data persists in database

---

## 📊 Reports & Excel Export Testing

### Report Generation

**Endpoints:**
- `GET /api/reports/stock-register`
- `GET /api/reports/expense-report`
- `GET /api/reports/cheque-register`
- `GET /api/reports/profit-loss-summary`

**Test Steps:**
```
1. Go to More → Reports
2. Select "Stock Register"
3. Set date range
4. Click "Generate Report"
5. Verify: Summary shows totals
6. Verify: Data table displays
7. Click "Download as Excel"
8. Verify: File downloads
9. Open .xlsx file in Excel
10. Verify: Data formatted correctly
```

**Expected Behavior:**
- ✅ Report generates in < 2 seconds
- ✅ Date range filtering works
- ✅ Summary calculated correctly
- ✅ Excel file downloads
- ✅ File named with report type and date

### Excel Export (All Reports)

**Using:** `exportReportToExcel()` from excelExporter.js

**Test All Report Types:**
```
1. Generate Stock Register
   - Check columns: Date, Vendor, Item, Qty, Unit, Rate, Total
   - Verify: Numbers formatted as currency

2. Generate Expense Report
   - Check columns: Date, Category, Description, Amount, Mode
   - Include: Category breakdown sheet

3. Generate Cheque Register
   - Check columns: Cheque#, Bank, Payee, Amount, Due Date, Status
   - Include: Summary sheet

4. Generate P&L Summary
   - Verify: All metrics included
   - Check: Profit margin calculated
   - Include: Summary calculations
```

**Expected Behavior:**
- ✅ All sheets include summary data
- ✅ Column widths appropriate
- ✅ Currency formatting applied
- ✅ Dates formatted clearly
- ✅ File naming convention followed
- ✅ Multiple sheets for complex reports

---

## 🏪 Settings Testing

### Change PIN

**Endpoint:** `PATCH /api/settings/:key`

**Test Steps:**
```
1. Go to Settings
2. Click "Change PIN"
3. Enter current PIN: 1234
4. Enter new PIN: 5678
5. Verify: Success toast
6. Wait 2 seconds (redirect to login)
7. Try old PIN: 1234
8. Verify: Invalid PIN error
9. Try new PIN: 5678
10. Verify: Login successful
```

**Expected Behavior:**
- ✅ Prompts for current PIN
- ✅ Validates new PIN (4 digits)
- ✅ Prevents same PIN reuse
- ✅ Updates in database
- ✅ Logs out and redirects
- ✅ New PIN works immediately

### Edit Business Settings

**Test Steps:**
```
1. Go to Settings
2. Click Edit on "default_email_recipient"
3. Change to: test@example.com
4. Click Save
5. Verify: Success toast
6. Refresh page
7. Verify: Value persists
```

**Expected Behavior:**
- ✅ Edit mode activates
- ✅ Changes save to database
- ✅ Updates persist on refresh
- ✅ Success feedback shown
- ✅ Can switch between items

---

## 🔗 API Integration Checklist

### Authentication & Sessions
- [x] PIN verified against Supabase settings table
- [x] Session stored in localStorage
- [x] Session includes loginTime
- [x] 24-hour timeout implemented
- [x] Protected routes check session
- [x] Logout clears session

### Data Loading
- [x] Dashboard loads all 4 summary cards
- [x] Each card calls correct endpoint
- [x] Loading spinners show during fetch
- [x] Error toasts on API failure
- [x] Data refreshes on navigation
- [x] Empty states handled gracefully

### CRUD Operations
- [x] Create: All screens POST to correct endpoint
- [x] Read: Lists call GET with filters
- [x] Update: Edit screens PATCH to correct endpoint
- [x] Delete: Confirmation then DELETE call
- [x] All operations show loading state
- [x] All operations show success/error toast

### Validation
- [x] Frontend validates before submit
- [x] Backend validates on receive
- [x] Error messages clear and actionable
- [x] Duplicate prevention (e.g., cheque number)
- [x] File upload validation
- [x] Data type validation

### File Operations
- [x] Upload validates file type/size
- [x] Parser extracts data correctly
- [x] Preview displays parsed data
- [x] Validation catches errors
- [x] Import saves each row
- [x] Error reporting per row
- [x] Excel export includes formatting
- [x] Downloaded files have correct names

### User Feedback
- [x] Loading spinners on all async operations
- [x] Success toasts on completion
- [x] Error toasts on failure
- [x] Alert banners for important info
- [x] Confirmation dialogs for destructive actions
- [x] Disabled states on buttons during loading

### Filtering & Sorting
- [x] Date range filtering works
- [x] Category filtering works
- [x] Status filtering works
- [x] Vendor filtering works
- [x] Multiple filters can combine
- [x] Results update on filter change

---

## 🧪 Manual Test Scenarios

### Complete User Journey 1: Daily Operations
```
1. Login with PIN (1234)
2. View dashboard alerts
3. Add stock entry
4. Add expense
5. Record sales
6. View running totals
7. Change settings
8. Logout
```

**Expected:** All operations succeed, data persists

### Complete User Journey 2: Reports & Analysis
```
1. Login
2. Go to Reports
3. Generate stock register (last 30 days)
4. Download as Excel
5. Generate P&L summary
6. Check cheque reconciliation
7. Export data
```

**Expected:** All reports generate, exports work

### Complete User Journey 3: File Import
```
1. Login
2. Go to Sales
3. Upload Excel with 20 sales records
4. Review preview
5. Confirm import
6. Wait for completion
7. Verify dashboard updated
8. Check reports include new data
```

**Expected:** All 20 rows import, data accessible

---

## 🐛 Common Issues & Troubleshooting

### Issue: Login fails with network error
**Solution:**
- Verify backend running on port 3000
- Check VITE_API_BASE_URL in .env.local
- Check CORS settings in backend

### Issue: File upload hangs
**Solution:**
- Check file size < 50MB
- Try different file format
- Check network tab for errors
- Verify backend file processing working

### Issue: Excel download doesn't work
**Solution:**
- Check SheetJS is installed
- Verify data format correct
- Check browser console for errors
- Try different report type

### Issue: PIN change not working
**Solution:**
- Verify current PIN correct
- Check new PIN is 4 digits
- Verify backend settings endpoint
- Check network tab for errors

### Issue: Data filters not working
**Solution:**
- Check date format (YYYY-MM-DD)
- Verify data exists for selected filters
- Check network tab for API call params
- Try clearing filters and reloading

---

## ✅ Sign-Off

**All integration tests passed:**
- [x] Authentication working end-to-end
- [x] All CRUD operations functional
- [x] File upload & parsing complete
- [x] Excel export working
- [x] Filters and searches working
- [x] Error handling in place
- [x] Loading states visible
- [x] Toast notifications working
- [x] Session management complete

**System ready for production deployment!** 🚀
