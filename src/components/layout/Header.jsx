import { NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../../hooks/useCart.js'
import SearchBar from './SearchBar.jsx'

function Header() {
  const { itemCount, openDrawer } = useCart()
  const { pathname } = useLocation()
  const showSearchBar =
    pathname === '/' || /^\/collections\/(men|women|kids)$/.test(pathname)

  return (
    <header className="site-header">
      <NavLink className="brand" to="/" end>
        <span className="brand-mark">S</span>
        <span>StyleHub</span>
      </NavLink>
      <nav aria-label="Main navigation" className="primary-nav">
        <NavLink to="/collections/men">Men</NavLink>
        <NavLink to="/collections/women">Women</NavLink>
        <NavLink to="/collections/kids">Kids</NavLink>
      </nav>
      <div className="header-actions">
        {showSearchBar && <SearchBar />}
        <NavLink className="cart-button orders-button" to="/orders">
          Orders
        </NavLink>
        <button aria-label={`Open cart, ${itemCount} items`} className="cart-button" onClick={openDrawer} type="button">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4 5h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 9H7" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
          <span>Cart</span>
          <span className="cart-count">{itemCount}</span>
        </button>
      </div>
    </header>
  )
}

export default Header
