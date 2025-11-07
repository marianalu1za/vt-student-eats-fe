import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RestaurantList from './pages/restaurants/RestaurantList'
import RestaurantMap from './pages/restaurants/RestaurantMap'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/restaurants" replace />} />
        <Route path="/restaurants" element={<RestaurantList />} />
        <Route path="/restaurants/map" element={<RestaurantMap />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

