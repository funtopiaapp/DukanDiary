# DukanDiary

A mobile-first web application for textile retail businesses in India. This monorepo contains both the frontend and backend services.

## Project Overview

DukanDiary is designed to help textile retailers manage their inventory, orders, and customer relationships with a focus on mobile-first experience and local business needs.

## 📁 Project Structure

```
DukanDiary/
├── frontend/                 # React + Vite + Tailwind CSS frontend
│   ├── package.json
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── utils/
│       ├── services/
│       ├── styles/
│       ├── App.jsx
│       └── main.jsx
│
├── backend/                  # Node.js + Express backend
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       ├── services/
│       ├── utils/
│       └── index.js
│
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB (for production)

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend API will be available at `http://localhost:3000`

## 🛠️ Technology Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **MongoDB** - NoSQL database (via Mongoose)
- **JWT** - Authentication
- **Joi** - Data validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📋 Environment Variables

### Frontend (.env.local)
- `VITE_API_BASE_URL` - Base URL for API calls
- `VITE_APP_ENV` - Application environment (development/production)
- `VITE_ENABLE_ANALYTICS` - Enable/disable analytics

### Backend (.env)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Node environment
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `CORS_ORIGIN` - Allowed CORS origins

## 📦 Installing Dependencies

Run the following commands in each directory:

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

## 🧪 Running Tests

```bash
# Frontend tests (when setup)
cd frontend
npm run test

# Backend tests (when setup)
cd backend
npm run test
```

## 🏗️ Building for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## 📝 Development Guidelines

### Code Structure
- Keep components small and focused
- Use meaningful variable and function names
- Follow existing patterns in the codebase
- Add comments only for complex logic

### Commits
- Use clear, descriptive commit messages
- Keep commits atomic (one feature/fix per commit)
- Reference issues when applicable

### Testing
- Write tests for new features
- Maintain test coverage above 80%
- Test edge cases and error scenarios

## 🔒 Security

- Never commit `.env` files with secrets
- Use environment variables for sensitive data
- Always validate user input on both client and server
- Keep dependencies updated

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

## 📄 License

MIT

---

**Project Status**: Setup phase - Initial skeleton structure created
