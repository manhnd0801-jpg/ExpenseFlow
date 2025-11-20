# Expense Flow - Frontend

Ứng dụng quản lý chi tiêu cá nhân - Phía Frontend

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm hoặc yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Ứng dụng sẽ mở tự động trên `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── assets/              # Hình ảnh, fonts, icons
├── components/          # Atomic Design Components
│   ├── atoms/          # Basic UI elements
│   ├── molecules/      # Composite components
│   ├── organisms/      # Complex components
│   └── templates/      # Page layouts
├── constants/          # Enums, labels, routes
├── hooks/              # Custom React hooks
├── pages/              # Route pages
├── redux/              # State management
│   └── modules/        # Feature modules (slices, sagas)
├── routes/             # Routing configuration
├── services/           # API services
├── styles/             # Theme, global styles
├── types/              # TypeScript definitions
│   ├── api/           # API types
│   └── models/        # Domain models
└── utils/              # Utilities, formatters, validators
```

## 🛠 Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Ant Design 5** - UI Components
- **Styled Components** - CSS-in-JS styling
- **Redux Toolkit** - State management
- **Redux-Saga** - Side effects
- **Axios** - HTTP client

## 📋 Development Guidelines

See `docs/frontend-instrucstion.md` for:

- Project structure standards
- TypeScript conventions
- Component naming rules
- API integration patterns
- State management best practices
- Styling guidelines

## 🔌 Environment Variables

Create `.env` file in root:

```
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=30000
VITE_APP_NAME=Expense Flow
VITE_APP_VERSION=0.1.0
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## 🎯 Phase 1 (MVP) Features

- ✅ Setup & Configuration
- ⏳ Auth (Login, Signup)
- ⏳ Dashboard
- ⏳ Transaction Management
- ⏳ Account Management
- ⏳ Category Management
- ⏳ Reports

## 📖 References

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Ant Design](https://ant.design)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Vite Documentation](https://vitejs.dev)
