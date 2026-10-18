import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import DashboardPageLoader from "../components/DashboardPageLoader";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const ClientsPage = lazy(() => import("../pages/ClientsPage"));
const PaymentsReport = lazy(() => import("../pages/PaymentsReport"));
const InvoicesPage = lazy(() => import("../pages/InvoicesPage"));
const PaymentSuccess = lazy(() => import("../pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("../pages/PaymentCancel"));
const PaymentsPage = lazy(() => import("../pages/PaymentsPage"));
const PublicHome = lazy(() => import("../pages/PublicHome"));
const ProfileUpdate = lazy(() => import("../pages/ProfileUpdate"));

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<DashboardPageLoader message="Loading page..." />}>
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
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
