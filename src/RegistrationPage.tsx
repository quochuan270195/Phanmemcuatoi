import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Phone } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from './firebase';

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Cập nhật tên hiển thị cho người dùng mới
      await updateProfile(userCredential.user, { 
        displayName: name,
        photoURL: phone // Bạn có thể lưu số điện thoại vào photoURL hoặc một trường khác
      });
      
      setSuccess('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email này đã được đăng ký. Vui lòng sử dụng email khác.');
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
        console.error(err);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="inline-block p-3 bg-emerald-100 rounded-full mb-4">
            <UserPlus className="w-10 h-10 text-emerald-700" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Tạo tài khoản mới</h1>
          <p className="mt-2 text-sm text-slate-500">Tham gia hệ thống Báo cáo Quân số.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-slate-700">Tên đăng nhập</label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700">Địa chỉ email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="email@example.com" />
          </div>
          
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Mật khẩu</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="••••••••" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Nhập lại mật khẩu</label>
            <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="••••••••" />
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-medium text-slate-700">Số điện thoại (nếu có)</label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="0987654321" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}
          <button type="submit" className="w-full flex justify-center py-2.5 px-4 btn-primary">Đăng ký</button>
        </form>
        <p className="text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default RegistrationPage;