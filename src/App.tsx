import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import DutyReportPage from './DutyReportPage'; // Import trang mới
import RegistrationPage from './RegistrationPage';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Thêm state để chờ kiểm tra auth
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      // Người dùng đã đăng nhập -> Chỉ cập nhật State, không dùng navigate nữa
      setUser({ 
        name: firebaseUser.displayName || 'Người dùng', 
        email: firebaseUser.email || '' 
      });
    } else {
      // Người dùng đã đăng xuất
      setUser(null);
    }
    setLoading(false);
  });

    return () => unsubscribe();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged sẽ tự động xử lý việc setUser(null) và chuyển hướng
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  if (loading) {
    // Hiển thị màn hình chờ trong khi Firebase kiểm tra trạng thái đăng nhập
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

 return (
    <Routes>
    {/* Nếu đã đăng nhập (user khác null), tự động đá từ /login hoặc /register về trang chủ */}
    <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />} />
    <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegistrationPage />} />
    <Route path="/" element={user ? <DashboardPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
  <Route path="/duty-report" element={user ? <DutyReportPage /> : <Navigate to="/login" replace />} />
  </Routes>
 );
 }