import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Overview from '@/pages/Overview'
import Quality from '@/pages/Quality'
import Profile from '@/pages/Profile'
import Anomaly from '@/pages/Anomaly'
import SpotCheck from '@/pages/SpotCheck'
import Report from '@/pages/Report'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="quality" element={<Quality />} />
          <Route path="profile" element={<Profile />} />
          <Route path="anomaly" element={<Anomaly />} />
          <Route path="anomaly/:id" element={<Anomaly />} />
          <Route path="spotcheck" element={<SpotCheck />} />
          <Route path="report" element={<Report />} />
          <Route path="report/:id" element={<Report />} />
        </Route>
      </Routes>
    </Router>
  )
}
