import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx'
import ProductDetailsPage from './pages/ProductDetailsPage.jsx'
import ProductListingPage from './pages/ProductListingPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './components/styles/index.scss'

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<ProductListingPage />} />
            <Route path="collections/:collection" element={<ProductListingPage />} />
            <Route path="products/:productId" element={<ProductDetailsPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
