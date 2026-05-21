import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './screens/auth/auth';
import DetailHouse from './screens/detail_house/detail_house';
import Admin from './screens/admin/admin';
import Statistical from './screens/statistical/statistical';
import CreateHouse from './screens/create_house/create_house';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute } from './components/RejectedRoute';
import NotFound from './screens/notFound';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route element={<ProtectedRoute />} >
            <Route path="/create_house" element={<CreateHouse />} />
            <Route path="/detail_house" element={<DetailHouse />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/statistical" element={<Statistical />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
