import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import ErpLogin from './pages/ErpLogin.tsx'
import ErpLayout from './pages/ErpLayout.tsx'
import ProtectedRoute from './components/erp/ProtectedRoute.tsx'
import Dashboard from './components/erp/Dashboard.tsx'
import OpdTokens from './components/erp/OpdTokens.tsx'
import IpdBeds from './components/erp/IpdBeds.tsx'
import Emr from './components/erp/Emr.tsx'
import Lab from './components/erp/Lab.tsx'
import Pharmacy from './components/erp/Pharmacy.tsx'
import Accounts from './components/erp/Accounts.tsx'
import Hr from './components/erp/Hr.tsx'
import Cms from './components/erp/Cms.tsx'

export default function App() {
  return (
    <BrowserRouter basename={(import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/'}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<ErpLogin />} />
        <Route path="/erp" element={
          <ProtectedRoute><ErpLayout /></ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="opd" element={<OpdTokens />} />
          <Route path="ipd" element={<IpdBeds />} />
          <Route path="emr" element={<Emr />} />
          <Route path="lab" element={<Lab />} />
          <Route path="pharmacy" element={<Pharmacy />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="hr" element={<Hr />} />
          <Route path="cms" element={<Cms />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
