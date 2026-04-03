import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Dashboard from "./pages/Dashboard";
import AssignedPage from "./pages/dashboard/AssignedPage";
import CashPage from "./pages/dashboard/CashPage";
import DeliveredPage from "./pages/dashboard/DeliveredPage";
import DriversPage from "./pages/dashboard/DriversPage";
import PendingPage from "./pages/dashboard/PendingPage";
import UpiPage from "./pages/dashboard/UpiPage";
import FinancialSettlement from "./pages/FinancialSettlement";
import Inventory from "./pages/Inventory";
import LiveMonitoring from "./pages/LiveMonitoring";
import Login from "./pages/Login";
import OrderManagement from "./pages/OrderManagement";
import PendingApproval from "./pages/PendingApproval";
import StaffDetails from "./pages/StaffDetails";
import StaffManagement from "./pages/StaffManagement";

const Unauthorized = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6">
    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-red-500 mb-4">
      403
    </h1>
    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 uppercase tracking-widest text-center text-[#1F2933]">
      Unauthorized Access
    </h2>
    <p className="text-gray-500 mb-6 sm:mb-8 max-w-md text-center text-sm sm:text-base">
      You do not have the required permissions to view this section. Please
      contact your administrator if you believe this is an error.
    </p>
    <button
      onClick={() => window.history.back()}
      className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#1F2933] rounded-xl font-bold hover:bg-gray-700 transition-all text-white text-sm sm:text-base"
    >
      Go Back
    </button>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6">
    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#1F2933] mb-4">
      404
    </h1>
    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 uppercase tracking-widest text-center text-[#1F2933]">
      Page Not Found
    </h2>
    <p className="text-gray-500 mb-6 sm:mb-8 max-w-md text-center text-sm sm:text-base">
      The page you are looking for doesn't exist or has been moved.
    </p>
    <a
      href="/"
      className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#1F2933] rounded-xl font-bold hover:bg-gray-700 transition-all text-white text-sm sm:text-base"
    >
      Return Home
    </a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute allowedRoles={["MANAGER"]} />}>
            <Route path="/pending-approval" element={<PendingApproval />} />
          </Route>

          <Route
            element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]} />}
          >
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard/drivers" element={<DriversPage />} />
              <Route path="/dashboard/assigned" element={<AssignedPage />} />
              <Route path="/dashboard/delivered" element={<DeliveredPage />} />
              <Route path="/dashboard/pending" element={<PendingPage />} />
              <Route path="/dashboard/cash" element={<CashPage />} />
              <Route path="/dashboard/upi" element={<UpiPage />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/monitoring" element={<LiveMonitoring />} />
              <Route path="/settlement" element={<FinancialSettlement />} />

              {/* Admin and Manager Routes */}
              <Route path="/staff" element={<StaffManagement />} />
              <Route path="/staff/:id" element={<StaffDetails />} />

              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route path="/inventory" element={<Inventory />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
