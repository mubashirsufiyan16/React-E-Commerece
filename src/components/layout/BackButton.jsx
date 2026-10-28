import { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { NavigationHistoryContext } from './NavigationHistoryContext.jsx'

function BackButton() {
  const { canGoBack, goBack } = useContext(NavigationHistoryContext)
  const { pathname } = useLocation()

  return (
    <button
      className="back-button"
      disabled={!canGoBack && pathname === '/'}
      onClick={goBack}
      type="button"
    >
      <span aria-hidden="true"></span> Back
    </button>
  )
}

export default BackButton
