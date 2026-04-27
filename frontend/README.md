# DukanDiary Frontend

A mobile-first React + Vite + Tailwind CSS application for textile retail business management. Built with strict design constraints: 18px minimum font, 52px button heights, Indian Rupee formatting, and saffron/green/red color scheme.

## 📱 Design Specifications

- **Font Size:** Minimum 18px everywhere
- **Button Height:** Minimum 52px, full width on mobile
- **Currency:** Indian Rupee format (₹1,23,456)
- **Colors:**
  - Primary: Saffron Orange (#FF6B00)
  - Positive: Green (#2E7D32)
  - Alert: Red (#C62828)
  - Background: White
- **Navigation:** Bottom tab navigation with 5 tabs
- **Approach:** One-action-per-screen

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
cp .env.example .env.local
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📋 Features

### Authentication
- 4-digit PIN login with large number pad
- Session management with localStorage

### Core Screens

#### Home (Dashboard)
- Large date display
- Alert banner for overdue/upcoming cheques
- 4 summary cards (Today's Expenses, Monthly Stock, Monthly Sales, Pending Cheques)
- Quick action buttons for adding data

#### Stock Management
- **Add Entry:** Vendor selection with inline add-new, date picker, description, quantity, unit toggle, rate, auto-calculated total
- **History:** List with date range and vendor filters, edit/delete options

#### Expense Tracking
- **Add Expense:** Category dropdown, date, description, amount, payment mode toggle, today's running total
- **History:** List with date and category filters

#### Cheque Management
- **Add Cheque:** All cheque fields, due date picker
- **List:** Status filter tabs (All/Issued/Cleared/Bounced), color-coded upcoming dates

#### Sales Recording
- **Toggle:** Manual entry vs file upload
- **Manual:** Date, period type, total, payment breakdown (Cash/UPI/Credit)
- **Upload:** Excel/PDF file parsing

#### Reports
- Stock register
- Expense report by category
- Cheque register by status
- Profit & Loss summary
- Date range selection for all reports
- Download as Excel button

#### Bank Reconciliation
- Upload bank statement (CSV/Excel/PDF)
- Display matched vs unmatched transactions
- Manual matching interface

#### Settings
- Edit email recipients
- Manage vendor list
- Manage expense categories
- Change PIN
- Edit business name
- Logout

#### More Menu
- Quick access to Reports, Bank Reconciliation, Settings

## 🎨 Component Architecture

```
src/
├── main.jsx                 # Entry point
├── App.jsx                  # Routing & protected routes
├── index.css               # Global styles & Tailwind config
├── lib/
│   ├── api.js             # API client with all endpoints
│   ├── currencyFormatter.js # INR formatting utilities
│   └── utils.js           # Date, formatting, helper functions
├── hooks/
│   └── useToast.js        # Toast notification hook
├── components/
│   ├── Toast.jsx          # Toast notification display
│   ├── LoadingSpinner.jsx # Loading indicators
│   ├── TabNavigation.jsx  # Bottom tab navigation
│   ├── Header.jsx         # Page header with back button
│   ├── SummaryCard.jsx    # Dashboard summary cards
│   ├── AlertBanner.jsx    # Alert/warning banners
│   ├── FormInput.jsx      # Text input component
│   ├── FormSelect.jsx     # Dropdown component
│   ├── ToggleGroup.jsx    # Toggle button group
│   └── DateInput.jsx      # Date picker component
└── pages/
    ├── Login.jsx
    ├── Dashboard.jsx
    ├── StockAdd.jsx
    ├── StockList.jsx
    ├── ExpenseAdd.jsx
    ├── ExpenseList.jsx
    ├── ChequeAdd.jsx
    ├── ChequeList.jsx
    ├── SalesAdd.jsx
    ├── Reports.jsx
    ├── BankReconciliation.jsx
    ├── Settings.jsx
    └── MoreMenu.jsx
```

## 🔄 API Integration

All API calls use axios with React Query patterns:

```javascript
// Example API calls
api.getVendors()
api.createStock(data)
api.getExpenses({ start_date, end_date, category })
api.getTodayExpenseTotal()
api.getUpcomingCheques()
api.getCheques({ status })
api.uploadFile(file)
api.getReports(type, dateRange)
```

## 💰 Currency Formatting

```javascript
import { formatINR } from './lib/currencyFormatter'

formatINR(123456.78)    // ₹1,23,456.78
formatINR(1000)         // ₹1,000.00
```

## 🎯 Color System

```css
/* Primary */
bg-orange-600 (#FF6B00)

/* Positive */
text-green-700 (#2E7D32)
bg-green-50

/* Alert */
text-red-700 (#C62828)
bg-red-50

/* Background */
bg-white
```

## 📱 Mobile Responsiveness

- Minimum 18px font size maintained on all screens
- Full-width buttons on mobile (52px+ height)
- Bottom tab navigation at fixed position
- Proper touch targets for tap interactions
- No horizontal scroll

## 🔑 Key Features

✅ **PIN-based Authentication**
✅ **Offline-capable UI** (with online validation)
✅ **Toast Notifications** for all actions
✅ **Loading States** on all async operations
✅ **Date Range Filtering** across reports
✅ **Real-time Calculations** (stock total, expense breakdown)
✅ **File Upload & Parsing** (PDF, Excel)
✅ **INR Currency Formatting** on all amounts
✅ **Responsive Design** (mobile-first)
✅ **Error Handling** with user-friendly messages

## 🛠️ Development

### Add New Page

1. Create file in `src/pages/NewPage.jsx`
2. Add route in `App.jsx`
3. Add navigation link in relevant component

### Add New Component

1. Create in `src/components/`
2. Use Tailwind classes from `index.css`
3. Follow min font-size & button height rules

### Styling

Uses Tailwind CSS with custom component classes:
- `.btn-primary` - Orange primary button
- `.btn-secondary` - Outlined secondary button
- `.btn-danger` - Red alert button
- `.btn-success` - Green success button
- `.input-field` - Form input with 52px height
- `.card` - White card with border
- `.text-currency` - Currency text styling

## 🚀 Performance Optimization

- Code splitting by route
- Lazy loading of pages
- Image optimization
- CSS optimization with Tailwind PurgeCSS
- API request deduplication

## 📚 Dependencies

- **react** - UI library
- **react-dom** - DOM rendering
- **react-router-dom** - Routing
- **axios** - HTTP client
- **tailwindcss** - Utility CSS
- **vite** - Build tool

## 🔒 Security

- PIN stored in localStorage (demo only)
- CORS handling via API proxy
- Input validation on all forms
- XSS prevention via React
- CSRF protection via API headers

## 📖 API Documentation

See `/backend/API_DOCUMENTATION.md` for complete API reference.

## 🎓 Usage Tips

### Login
- Default PIN: **1234** (demo only)
- Change PIN in Settings

### Dashboard
- Tap summary cards for detailed view
- Quick action buttons for common tasks
- Alert banner shows urgent items

### Forms
- All required fields marked with *
- Auto-calculation on dependent fields
- Error messages clear on input change

### Lists
- Swipe to delete (on mobile)
- Tap edit to modify
- Use filters for specific date ranges

## 🐛 Troubleshooting

### API Not Responding
- Check backend is running on port 3000
- Verify `VITE_API_BASE_URL` in `.env.local`
- Check CORS is configured correctly

### Styles Not Loading
- Clear browser cache
- Run `npm run build` for production
- Check Tailwind CSS compilation

### Login Issues
- Verify PIN is exactly 4 digits
- Check localStorage is enabled
- Try clearing browser data

## 📝 Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ENV=development
VITE_APP_NAME=DukanDiary
VITE_APP_VERSION=1.0.0
```

## 📱 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

Follow the existing code structure and design patterns. Ensure:
- Minimum 18px font sizes
- Minimum 52px button heights
- INR currency formatting
- Toast notifications for user feedback
- Loading states for async operations

## 📄 License

MIT

---

**DukanDiary Frontend** - Built for textile retail excellence 🧵
