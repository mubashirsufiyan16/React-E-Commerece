import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import CartDrawer from '../cart/CartDrawer.jsx'
import BackButton from './BackButton.jsx'
import { NavigationHistoryContext } from './NavigationHistoryContext.jsx'

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  function goBack() {
    navigate(-1)
  }
  const canGoBack = location.key !== 'default'

  return (
    <div className="app-shell">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="main-content" id="main-content">
          <NavigationHistoryContext.Provider value={{ canGoBack, goBack }}>
            {location.pathname !== '/order-confirmation' && <BackButton />}
            <Outlet />
          </NavigationHistoryContext.Provider>
        </main>
      </div>
      <CartDrawer />
    </div>
  )
}

export default AppLayout
