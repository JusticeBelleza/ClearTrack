import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminRoute from "./components/layout/AdminRoute";

// --- Layouts ---
import MainLayout from "./components/layout/MainLayout";

// --- Public Pages ---
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// --- Staff Pages ---
import Dashboard from "./pages/dashboard/Dashboard";
import CreateDocument from "./pages/documents/CreateDocument";
import ScanQR from "./pages/documents/ScanQR";
import History from "./pages/documents/History";
import Track from "./pages/documents/Track"; // <-- Added Track Route

// --- Admin Pages ---
import Users from "./pages/admin/Users";
import Configs from "./pages/admin/Configs";
import AuditLogs from "./pages/admin/AuditLogs";
import Archive from "./pages/admin/Archive";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- SECURED CAPITOL PORTAL --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              
              {/* Universal Dashboard (Splits Admin vs Staff internally) */}
              <Route index element={<Dashboard />} />
              
              {/* STAFF ROUTES (Open to all approved employees) */}
              <Route path="documents/new" element={<CreateDocument />} />
              <Route path="scan" element={<ScanQR />} />
              <Route path="history" element={<History />} />
              <Route path="track" element={<Track />} />
              
              {/* STRICT SYSTEM ADMIN ROUTES (Locked via AdminRoute) */}
              <Route element={<AdminRoute />}>
                <Route path="admin/users" element={<Users />} />
                <Route path="admin/configs" element={<Configs />} />
                <Route path="admin/audit" element={<AuditLogs />} />
                <Route path="admin/archive" element={<Archive />} />
              </Route>
              
            </Route>
          </Route>

          {/* CATCH-ALL: Redirects invalid or broken URLs back to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}