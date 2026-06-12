import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// --- Layouts ---
import MainLayout from "./components/layout/MainLayout";

// --- Public Pages ---
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// --- Staff Pages ---
import Dashboard from "./pages/dashboard/Dashboard";
import CreateDocument from "./pages/documents/CreateDocument";

// --- Admin Pages ---
import Users from "./pages/admin/Users";
import Configs from "./pages/admin/Configs";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- SECURED CAPITOL PORTAL --- */}
          {/* All routes inside here require an approved, logged-in account */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              
              {/* Dashboard / Command Center */}
              <Route index element={<Dashboard />} />
              
              {/* Staff Document Routes */}
              <Route path="documents/new" element={<CreateDocument />} />
              <Route path="scan" element={<div className="p-8 text-gray-500">QR Scanner coming soon...</div>} />
              <Route path="history" element={<div className="p-8 text-gray-500">My History coming soon...</div>} />
              
              {/* System Admin Routes */}
              <Route path="admin/users" element={<Users />} />
              <Route path="admin/configs" element={<Configs />} />
              <Route path="admin/audit" element={<div className="p-8 text-gray-500">Global Audit Log coming soon...</div>} />
              <Route path="admin/archive" element={<div className="p-8 text-gray-500">Archived Documents coming soon...</div>} />
              
            </Route>
          </Route>

          {/* CATCH-ALL: Redirects invalid URLs to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}