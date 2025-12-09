# 🍽️ VT Student Eats – Frontend

A web application helping Virginia Tech Innovation Campus students find affordable, nearby restaurants offering student discounts.

This repository contains the **React** frontend for the VT Student Eats project — designed to deliver a clean, responsive, and accessible user interface that integrates with the Django REST API backend.

---

## 🚀 Features

- Browse and filter restaurants (cuisine, price, distance, rating)
- Map view with restaurant locations
- User authentication (registration, login, password reset)
- Restaurant management for restaurant managers
- Group ordering functionality
- Reviews and ratings
- Admin portal
- Responsive design (mobile and desktop)

---

## 🧱 Tech Stack

- **React 18.2+**
- **Vite 5.0+**
- **React Router DOM 7.9+**
- **Material-UI (MUI) 7.3+**
- **Axios 1.6+**
- **Leaflet & React Leaflet** (maps)
- **Material React Table** (data tables)

---

## 🖥️ Local Setup

### Prerequisites
- Node.js (v20+)
- npm or yarn
- Backend API running (see [backend README](../vt-student-eats-be/README.md))

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/marianalu1za/vt-student-eats-fe.git
   cd vt-student-eats-fe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

Application available at `http://localhost:5173`

**Note**: The frontend proxies API requests to `http://localhost:8000` by default. Update `vite.config.js` if your backend runs on a different URL/port.

---

## 📦 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🛣️ Main Routes

- `/restaurants` - Restaurant listing
- `/restaurants/map` - Map view
- `/restaurants/:id` - Restaurant details
- `/login` - Login page
- `/create-account` - Registration
- `/profile/*` - User profile (authenticated)
- `/admin/*` - Admin portal (admin only)
- `/group-orders` - Group orders (authenticated)

---

## 🎯 User Roles

- **Student**: Browse restaurants, create reviews, join group orders
- **Restaurant Manager**: Create/manage restaurants, discounts, menus
- **Admin**: Full access to admin portal

---

## 📝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our workflow and the process for submitting pull requests.

---

## 🔗 Related Repositories

- [Backend Repository](https://github.com/marianalu1za/vt-student-eats-be)
