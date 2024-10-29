// src/App.jsx
import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import UpdateNotification from './components/UpdateNotification'
import Layout from './components/Layout'
import HomePage from './views/deployment-landing/Homepage'
// Import other pages as needed

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Add other routes as needed */}
        </Routes>
        <UpdateNotification />
      </Layout>
    </Suspense>
  )
}

export default App