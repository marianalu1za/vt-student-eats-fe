import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RestaurantList from './pages/restaurants/RestaurantList'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RestaurantList />} />
        {/* <Route path="/restaurants/:restaurantName" element={<RestaurantList />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App

