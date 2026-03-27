import React, { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router'
import appRouter from './app.routes.jsx'
import { useAuth } from '../features/auth/hook/useAuth.jsx'

const AppContent = () => {
  const { handleGetme } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    handleGetme()
      .catch(() => {})
      .finally(() => setIsInitializing(false));
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#111113] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <RouterProvider router={appRouter} />;
};

const App = () => {
  return <AppContent />
}

export default App