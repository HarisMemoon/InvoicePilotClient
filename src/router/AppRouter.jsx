import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import AuthLayout from "../layouts/AuthLayout";
import PublicLayout from "../layouts/PublicLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ClientsPage from "../pages/ClientsPage";
import PaymentsReport from "../pages/PaymentsReport";
import InvoicesPage from "../pages/InvoicesPage";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentCancel from "../pages/PaymentCancel";
import PaymentsPage from "../pages/PaymentsPage";
import PublicHome from "../pages/PublicHome";
import ProfileUpdate from "../pages/ProfileUpdate";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicHome />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="reports" element={<PaymentsReport />} />
          <Route path="profile-update" element={<ProfileUpdate />} />
        </Route>

        {/* Payment Pages */}
        <Route path="/payment-page" element={<PaymentsPage />} />

        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
