// 1. Thay BrowserRouter bằng HashRouter
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './screens/auth/auth';
import DetailHouse from './screens/detail_house/detail_house';
import Admin from './screens/admin/admin';
import CreateHouse from './screens/create_house/create_house';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* 2. Dùng Router (lúc này đã là HashRouter) */}
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/detail_house" element={<DetailHouse />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/create_house" element={<CreateHouse />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;