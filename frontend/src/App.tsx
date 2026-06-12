import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import the components we built today
import Login from "./pages/auth/Login";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import ScanQR from "./pages/documents/ScanQR";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The Front Door */}
        <Route path="/login" element={<Login />} />

        {/* The Secured Capitol Portal (Inside the MainLayout shell) */}
        <Route path="/" element={<MainLayout />}>
          {/* Default page when you hit "/" is the Dashboard */}
          <Route index element={<Dashboard />} />
          
          {/* The Mobile QR Scanner */}
          <Route path="scan" element={<ScanQR />} />
          
          {/* Placeholders for pages we haven't built yet so the app doesn't crash */}
          <Route path="documents" element={<div className="p-8"><h1 className="text-xl font-bold">My Documents</h1><p>Coming soon...</p></div>} />
          <Route path="settings" element={<div className="p-8"><h1 className="text-xl font-bold">Settings</h1><p>Coming soon...</p></div>} />
          <Route path="admin/users" element={<div className="p-8"><h1 className="text-xl font-bold">User Management</h1><p>Coming soon...</p></div>} />
        </Route>

        {/* Catch-all: If they type a weird URL, send them back to the dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}