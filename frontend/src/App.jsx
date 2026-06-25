import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import JobsPage from './pages/JobsPage.jsx'
import NewJobPage from './pages/NewJobPage.jsx'
import JobDetailPage from './pages/JobDetailPage.jsx'
import MachinesPage from './pages/MachinesPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"  element={<DashboardPage />} />
          <Route path="jobs"       element={<JobsPage />} />
          <Route path="jobs/new"   element={<NewJobPage />} />
          <Route path="jobs/:id"   element={<JobDetailPage />} />
          <Route path="machines"   element={<MachinesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
