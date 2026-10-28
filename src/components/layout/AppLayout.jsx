import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import CartDrawer from '../cart/CartDrawer.jsx'
import BackButton from './BackButton.jsx'
import { NavigationHistoryContext } from './NavigationHistoryContext.jsx'

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const [canGoBack, setCanGoBack] = useState(false)
  const historyRef = useRef({
    entries: [{
      key: location.key,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    }],
    index: 0,
  })

  useEffect(() => {
    const history = historyRef.current
    const currentEntry = {
      key: location.key,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    }

    if (navigationType === 'PUSH') {
      history.entries = history.entries.slice(0, history.index + 1)
      history.entries.push(currentEntry)
      history.index += 1
      setCanGoBack(history.index > 0)
      return
    }

    if (navigationType === 'REPLACE') {
      history.entries[history.index] = currentEntry
      setCanGoBack(history.index > 0)
      return
    }

    const matchingIndex = history.entries.findIndex((entry) => entry.key === location.key)
    if (matchingIndex >= 0) {
      history.index = matchingIndex
    } else {
      history.entries[history.index] = currentEntry
    }
    setCanGoBack(history.index > 0)
  }, [location, navigationType])

  function goBack() {
    navigate(-1)
  }

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
