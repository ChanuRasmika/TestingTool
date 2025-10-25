import { useState, useEffect } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import './index.css'

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('login')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleSignup = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  if (currentView === 'login') {
    return (
      <Login 
        onLogin={handleLogin} 
        onSwitchToSignup={() => setCurrentView('signup')} 
      />
    )
  }

  return (
    <Signup 
      onSignup={handleSignup} 
      onSwitchToLogin={() => setCurrentView('login')} 
    />
  )
}

export default App
