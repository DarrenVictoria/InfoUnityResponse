// src/App.jsx
import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import UpdateNotification from './components/UpdateNotification';
import Layout from './components/Layout';
import RespondantLanding from './views/respondant/RespondantLanding'


// Pages as needed
import HomePage from './views/deployment-landing/Homepage';


function App() {
  return (
    <NextUIProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<RespondantLanding />} />
            {/* Add other routes as needed */}
          </Routes>
          <UpdateNotification />
        </Layout>
      </Suspense>
    </NextUIProvider>
  );
}

export default App;