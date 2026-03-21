import { Navigate, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import OverviewPage from './pages/OverviewPage';
import ProductsPage from './pages/ProductsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
