import { createContext } from 'react'

export const NavigationHistoryContext = createContext({
  canGoBack: false,
  goBack: () => {},
})
