import { Routes, Route, HashRouter } from 'react-router-dom';
import { useWebSocket } from './hooks/useWebSocket';

// GAIA-style Pages
import LandingPage from './pages/LandingPage';
import UserDashboardEnhanced from './pages/UserDashboardEnhanced';
import IncidentsListPage from './pages/IncidentsListPage';
import IncidentDetailsEnhanced from './pages/IncidentDetailsEnhanced';
import AnomalyUploadEnhanced from './pages/AnomalyUploadEnhanced';
import OperationsConsole from './pages/OperationsConsole';
import AlertsDeliveryPage from './pages/AlertsDeliveryPage';
import VerificationPage from './pages/VerificationPage';
import GlobalAnalyticsEnhanced from './pages/GlobalAnalyticsEnhanced';
import SettingsPage from './pages/SettingsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import AboutPage from './pages/AboutPage';

function AppRoutes() {
  // Initialize WebSocket connection
  useWebSocket();

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Main Dashboard */}
      <Route path="/dashboard" element={<UserDashboardEnhanced />} />
      
      {/* Incidents */}
      <Route path="/incidents" element={<IncidentsListPage />} />
      <Route path="/incident/:id" element={<IncidentDetailsEnhanced />} />
      
      {/* Upload */}
      <Route path="/upload" element={<AnomalyUploadEnhanced />} />
      
      {/* Operations */}
      <Route path="/operations" element={<OperationsConsole />} />
      
      {/* Alerts */}
      <Route path="/alerts" element={<AlertsDeliveryPage />} />
      
      {/* Verification */}
      <Route path="/verification" element={<VerificationPage />} />
      
      {/* Analytics */}
      <Route path="/analytics" element={<GlobalAnalyticsEnhanced />} />
      
      {/* Settings */}
      <Route path="/settings" element={<SettingsPage />} />
      
      {/* Audit Logs */}
      <Route path="/audit-logs" element={<AuditLogsPage />} />
      
      {/* About */}
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
