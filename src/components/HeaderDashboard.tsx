// src/components/HeaderDashboard.tsx
import React from 'react';
import { Users, FileSpreadsheet, Printer, MoreVertical, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Định nghĩa các biến cần truyền từ cha xuống (gọi là Props)
const HeaderDashboard = ({ 
  user, 
  onLogout, 
  copyMarkdownToClipboard, 
  handlePrint, 
  isUserMenuOpen, 
  setIsUserMenuOpen 
}: any) => {
  return (
    <header className="bg-emerald-950 text-white shadow-md print:bg-white print:text-black print:shadow-none">
    
      {/* Header Panel */}
      <header className="bg-emerald-950 text-white shadow-md print:bg-white print:text-black print:shadow-none">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-800 rounded-lg text-emerald-100 print:hidden">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold print:hidden">
                  Quân đội Nhân dân Việt Nam Anh Hùng
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1 text-slate-100 print:text-black">
                Báo cáo Quân số & Danh sách Biên chế
              </h1>
              <p className="text-slate-300 text-sm mt-0.5 print:text-slate-700">
                Đại đội Bảo vệ - Trung tâm HLQSQG 2
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 print:hidden">
            <div className="flex items-center space-x-2">
              <button
                onClick={copyMarkdownToClipboard}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-2 rounded-lg text-sm font-medium transition shadow-sm border border-slate-700"
                title="Sao chép dưới dạng bảng Markdown"
                id="btn-copy-markdown"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Copy Markdown</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-2 rounded-lg text-sm font-medium transition shadow-sm border border-slate-700"
                id="btn-print-report"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>In báo cáo</span>
              </button>
            </div>

            {/* User Menu Dropdown */}
            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="p-2 rounded-full hover:bg-emerald-800 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-20 text-slate-800"
                  >
                    <div className="p-4 border-b border-slate-200">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100">
                      <LogOut className="w-4 h-4 text-slate-500" />
                      <span>Đăng xuất</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

    





    
    </header>
  );
};

export default HeaderDashboard;