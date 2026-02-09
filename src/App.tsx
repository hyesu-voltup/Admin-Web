import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { getUserId } from "./lib/authStorage";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Budget from "./pages/Budget";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Roulette from "./pages/Roulette";

/**
 * 인증 필요 시 로그인 페이지로 리다이렉트하는 래퍼
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userId = getUserId();
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="budget" element={<Budget />} />
            <Route path="admin/products" element={<Products />} />
            <Route path="admin/orders" element={<Orders />} />
            <Route path="admin/roulette/participations" element={<Roulette />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </>
  );
}

export default App;
