import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Elections from './pages/Elections';
import BLOManagement from './pages/BLOManagement';
import Results from './pages/Results';
import Representatives from './pages/Representatives';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('adminToken');
    return token ? children : <Navigate to="/" replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="students" element={<Students />} />
                    <Route path="elections" element={<Elections />} />
                    <Route path="blos" element={<BLOManagement />} />
                    <Route path="results" element={<Results />} />
                    <Route path="representatives" element={<Representatives />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
