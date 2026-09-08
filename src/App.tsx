import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import RegistrationPage from './RegistrationPage';
import Quansothnv from './components/Quansothnv'; // Import trang mới
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
    // Kiểm tra nếu là người dùng offline
    if (user && user.email === 'offline@example.com') {
      // Chỉ cần xóa trạng thái người dùng ở phía client
      setUser(null);
      // Việc chuyển hướng về trang đăng nhập sẽ được xử lý tự động bởi <Routes>
    } else {
      // Đối với người dùng online, thực hiện đăng xuất khỏi Firebase
      try {
        await signOut(auth);
        // onAuthStateChanged sẽ tự động xử lý việc setUser(null)
      } catch (error) {
        console.error("Lỗi khi đăng xuất:", error);
      }
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
    <Route path="/quan-so-thnv" element={user ? <Quansothnv /> : <Navigate to="/login" replace />} />
  </Routes>
 );
 }