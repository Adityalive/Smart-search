import React from 'react'
import { RouterProvider } from 'react-router'
import appRouter from './app.routes.jsx'

const App = () => {
  return (
    <RouterProvider router={appRouter} />
  )
}

export default App