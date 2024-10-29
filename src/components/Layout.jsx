// src/components/Layout.jsx
import { Suspense } from 'react'
import PropTypes from 'prop-types'

function Layout({ children }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="app-container">
        <main className="main-content">
          {children}
        </main>
      </div>
    </Suspense>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout