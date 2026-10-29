import { useContext } from 'react'
import { NavigationHistoryContext } from './NavigationHistoryContext.jsx'

function BackButton() {
  const { canGoBack, goBack } = useContext(NavigationHistoryContext)

  return (
    <button
      className="back-button"
      disabled={!canGoBack}
      onClick={goBack}
      type="button"
    >
      <span aria-hidden="true"></span> Back
    </button>
  )
}

export default BackButton
