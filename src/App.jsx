import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RestaurantList from './pages/restaurants/RestaurantList'
import RestaurantMap from './pages/restaurants/RestaurantMap'
import RestaurantMenu from './pages/restaurant-menu/RestaurantMenu'
import Login from './pages/auth/Login'
import CreateAccount from './pages/auth/CreateAccount'
import AdminDashboard from './pages/admin/AdminDashboard'
import GroupOrders from './pages/group-orders/GroupOrders.jsx'
import ProfileLayout from './pages/profile/ProfileLayout'
import ManageRestaurantLayout from './pages/restaurant-management/ManageRestaurantLayout'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/restaurants" replace />} />
        <Route path="/restaurants" element={<RestaurantList />} />
        <Route path="/restaurants/map" element={<RestaurantMap />} />
        <Route path="/restaurants/:id" element={<RestaurantMenu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/profile/manage-restaurant/:restaurantId/*" element={<ManageRestaurantLayout />} />
        <Route path="/profile/*" element={<ProfileLayout />} />
        <Route path="/group-orders" element={<GroupOrders />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

