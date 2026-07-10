import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Users } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase';

interface LoginPageProps {
  onLogin: (user: { name: string; email: string }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setError('');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email hoặc mật khẩu không chính xác.');
      } else {
        setError('Đã xảy ra lỗi khi đăng nhập.');
        console.error(err);
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setError('');
    } catch (err: any) {
      setError('Đã xảy ra lỗi khi đăng nhập với Google.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="inline-block p-3 bg-emerald-100 rounded-full mb-4">
            <Users className="w-10 h-10 text-emerald-700" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Hệ thống Báo cáo Quân số
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Đăng nhập để tiếp tục quản lý biên chế.
          </p>
        </div>

        {/* Nút đăng nhập Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" alt="Google logo" className="w-6 h-6" />
          <span className="text-sm font-semibold text-slate-700">Đăng nhập với Google</span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">Hoặc đăng nhập với email</span>
          </div>
        </div>

        {/* Form đăng nhập */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700">Địa chỉ email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="admin@quanlyquanso.vn"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="admin"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
            <LogIn className="w-5 h-5 mr-2" />
            Đăng nhập
          </button>
        </form>
        <p className="text-center text-sm text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;