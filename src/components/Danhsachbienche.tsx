import React from 'react';
import { 
  Users, Search, Plus, X, Upload, Check, 
  Edit2, Trash2, Eye, EyeOff 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Soldier } from '../types'; // Điều chỉnh đường dẫn đến file của bạn

const renderSoldierRow = (soldier: Soldier, unitIndex: number) => {
  // Bây giờ TypeScript đã hiểu 'soldier' có những thuộc tính nào
  // và lỗi 'implicit any' sẽ biến mất hoàn toàn.
}


// Giả sử các hằng số này nằm cùng file hoặc được import
const RANKS = ["Binh nhì", "Binh nhất", "Hạ sĩ", "Trung sĩ", "Thượng sĩ"];
const POSITIONS = ["Chiến sĩ", "Tiểu đội trưởng", "Trung đội trưởng"];
const NOTES_PRESETS = [
  { value: "Có mặt", label: "Có mặt" },
  { value: "Phép", label: "Vắng: Phép" },
  { value: "Tranh thủ", label: "Vắng: Tranh thủ" },
  { value: "Công tác", label: "Vắng: Công tác" },
  { value: "Học", label: "Vắng: Học" },
  { value: "Viện", label: "Vắng: Viện" },
  { value: "Bệnh xá", label: "Vắng: Bệnh xá" },
  { value: "Tăng cường", label: "Vắng: Tăng cường" }
];

const Danhsachbienche = ({ 
  // Truyền các props cần thiết tại đây
  filteredRoster, searchTerm, setSearchTerm, roster,
  isAdding, setIsAdding, handleAddSoldier,
  showEnlistmentColumn, setShowEnlistmentColumn,
  showRankColumn, setShowRankColumn,
  showPositionColumn, setShowPositionColumn,
  showRemarkColumn, setShowRemarkColumn,
  showStatusColumn, setShowStatusColumn,
  showActionsColumn, setShowActionsColumn,
  collapsedSections, toggleCollapse,
  editingId, editForm, setEditForm,
  setViewingSoldier, startEdit, saveEdit, cancelEdit, handleDelete,
  newForm, setNewForm, handleFileImport, fileInputRef,
    filterNote, setFilterNote, otherReason, setOtherReason,
}: any) => {





  























  
  return (
    <section id="roster-section" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden print:border-none print:shadow-none">
      
      {/* Section 1 (Bottom): Danh sách Biên chế Chi tiết (Editable Roster) */}
             <section id="roster-section" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
               <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:bg-slate-100 print:text-black print:border-b">
                 <div className="flex items-center space-x-2">
                   <Users className="w-5 h-5 text-emerald-400 print:text-emerald-800" />
                   <h2 className="text-lg font-bold uppercase tracking-wide">Danh Sách Biên Chế Chi Tiết</h2>
                 </div>
                 
                 {/* Quick Filter & Search Bar */}
                 <div className="flex flex-wrap items-center gap-2 print:hidden">
                   <div className="relative">
                     <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                     <input
                       type="text"
                       placeholder="Tìm kiếm quân nhân..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="bg-slate-800 text-slate-100 placeholder-slate-400 pl-9 pr-4 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44 focus:w-56 transition-all"
                     />
                     {searchTerm && (
                       <button onClick={() => setSearchTerm("")} className="absolute right-2 top-2 text-slate-400 hover:text-white">
                         <X className="w-3.5 h-3.5" />
                       </button>
                     )}
                   </div>
     
                   <select
                     value={filterNote}
                     onChange={(e) => setFilterNote(e.target.value)}
                     className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                   >
                     <option value="all">Tất cả trạng thái</option>
                     <option value="Có mặt">Chỉ có mặt</option>
                     <option value="Vắng mặt">Tổng vắng mặt</option>
                     {NOTES_PRESETS.filter(p => p.value !== 'Có mặt').map(p => (
                       <option key={p.value} value={p.value}>{p.label}</option>
                     ))}
                   </select>
     
                  
     
                   <button
                     onClick={() => setIsAdding(!isAdding)}
                     className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                     id="btn-add-toggle"
                   >
                     {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                     <span>{isAdding ? "Đóng form" : "Thêm mới"}</span>
                   </button>
                 </div>
     
                 {/* Nút nhập từ Excel */}
                 <div className="print:hidden">
                   <input
                     type="file"
                     ref={fileInputRef}
                     onChange={handleFileImport}
                     className="hidden"
                     accept=".xlsx, .xls, .csv"
                   />
                   <button onClick={() => fileInputRef.current?.click()} className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1">
                     <Upload className="w-3.5 h-3.5" />
                     <span>Nhập từ Excel</span>
                   </button>
                 </div>
               </div>
     
               <div className="p-6">
                 {/* Expanded Form to Add New Soldier */}
                 <AnimatePresence>
                   {isAdding && (
                     <motion.div
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: "auto" }}
                       exit={{ opacity: 0, height: 0 }}
                       className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 overflow-hidden print:hidden"
                     >
                       <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center space-x-2">
                         <Plus className="w-4 h-4 text-emerald-600" />
                         <span>Bổ sung quân nhân vào biên chế</span>
                       </h3>
                       
                       {/* Main Info Section */}
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         <div className="lg:col-span-4"><h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider border-b pb-1">Thông tin chính</h4></div>
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên*</label>
                           <input
                             placeholder="VD: Hoàng Văn Minh"
                             value={newForm.name}
                             onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                             className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 font-medium"
                           />
                         </div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Cấp bậc</label>
                           <select
                             value={newForm.rank}
                             onChange={(e) => setNewForm({ ...newForm, rank: e.target.value })}
                             className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
                           >
                             {RANKS.map(r => (
                               <option key={r} value={r}>{r}</option>
                             ))}
                           </select>
                         </div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Chức vụ</label>
                           <select
                             value={newForm.position}
                             onChange={(e) => setNewForm({ ...newForm, position: e.target.value })}
                             className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
                           >
                             {POSITIONS.map(p => (
                               <option key={p} value={p}>{p}</option>
                             ))}
                           </select>
                         </div>
     
                         <div className="sm:col-span-2 lg:col-span-1">
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Đơn vị</label>
                           <select
                             value={newForm.unit}
                             onChange={(e) => setNewForm({ ...newForm, unit: e.target.value })}
                             className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
                           >
                               <option value="Ban chỉ huy Đại đội">Ban chỉ huy Đại đội</option>
                               <option value="Đại đội bộ">Đại đội bộ</option>
                               <optgroup label="Trung đội Bảo vệ 1">
                                 <option value="Trung đội Bảo vệ 1">Trung đội Bảo vệ 1 (Biên chế trung đội)</option>
                                 <option value="Tiểu đội Bảo vệ 1">Tiểu đội Bảo vệ 1</option>
                                 <option value="Tiểu đội Bảo vệ 2">Tiểu đội Bảo vệ 2</option>
                                 <option value="Tiểu đội Bảo vệ 3">Tiểu đội Bảo vệ 3</option>
                               </optgroup>
                               <optgroup label="Trung đội Bảo vệ 2">
                                 <option value="Trung đội Bảo vệ 2">Trung đội Bảo vệ 2 (Biên chế trung đội)</option>
                                 <option value="Tiểu đội Bảo vệ 4">Tiểu đội Bảo vệ 4</option>
                                 <option value="Tiểu đội Bảo vệ 5">Tiểu đội Bảo vệ 5</option>
                                 <option value="Tiểu đội Bảo vệ 6">Tiểu đội Bảo vệ 6</option>
                               </optgroup>
                           </select>
                         </div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Tháng/Năm nhập ngũ</label>
                           <input
                             type="text"
                             placeholder="VD: 02/2026"
                             value={newForm.enlistmentDate}
                             onChange={(e) => setNewForm({ ...newForm, enlistmentDate: e.target.value })}
                             className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 font-mono"
                           />
                         </div>
     
                         <div className="lg:col-span-4 mt-4"><h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider border-b pb-1">Thông tin cá nhân & Lý lịch</h4></div>
                          <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày sinh</label>
                           <input
                             type="text"
                             placeholder="VD: 25/12/2004"
                             value={newForm.dateOfBirth}
                             onChange={(e) => setNewForm({ ...newForm, dateOfBirth: e.target.value })}
                             className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 font-mono"
                           />
                         </div>
     
                          <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Văn hóa</label>
                           <input
                             type="text"
                             placeholder="VD: 12/12"
                             value={newForm.education}
                             onChange={(e) => setNewForm({ ...newForm, education: e.target.value })}
                             className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
                           />
                         </div>
     
                          <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Dân tộc</label>
                           <input
                             type="text"
                             placeholder="VD: Kinh"
                             value={newForm.ethnicity}
                             onChange={(e) => setNewForm({ ...newForm, ethnicity: e.target.value })}
                             className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
                           />
                         </div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Số CCCD</label>
                           <input type="text" placeholder="VD: 012345678910" value={newForm.cccd} onChange={(e) => setNewForm({ ...newForm, cccd: e.target.value })} className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 font-mono" />
                         </div>
     
                         <div className="sm:col-span-2">
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Quê quán</label>
                           <input type="text" placeholder="VD: Xã A, Huyện B, Tỉnh C" value={newForm.hometown} onChange={(e) => setNewForm({ ...newForm, hometown: e.target.value })} className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800" />
                         </div>
     
                         <div className="sm:col-span-2">
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Trú quán</label>
                           <input type="text" placeholder="VD: Xã A, Huyện B, Tỉnh C" value={newForm.currentResidence} onChange={(e) => setNewForm({ ...newForm, currentResidence: e.target.value })} className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800" />
                         </div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Tôn giáo</label>
                           <input type="text" placeholder="VD: Không" value={newForm.religion} onChange={(e) => setNewForm({ ...newForm, religion: e.target.value })} className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800" />
                         </div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày vào Đoàn</label>
                           <input type="text" placeholder="VD: 26/03/2020" value={newForm.youthUnionJoinDate} onChange={(e) => setNewForm({ ...newForm, youthUnionJoinDate: e.target.value })} className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 font-mono" />
                         </div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày vào Đảng</label>
                           <input type="text" placeholder="VD: 03/02/2025" value={newForm.partyJoinDate} onChange={(e) => setNewForm({ ...newForm, partyJoinDate: e.target.value })} className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 font-mono" />
                         </div>
     
                         <div className="lg:col-span-4 mt-4"><h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider border-b pb-1">Thông tin gia đình</h4></div>
                         
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Họ tên cha</label>
                           <input type="text" value={newForm.fatherName} onChange={(e) => setNewForm({ ...newForm, fatherName: e.target.value })} className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800" />
                         </div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Họ tên mẹ</label>
                           <input type="text" value={newForm.motherName} onChange={(e) => setNewForm({ ...newForm, motherName: e.target.value })} className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800" />
                         </div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Họ tên vợ</label>
                           <input type="text" placeholder="(Nếu có)" value={newForm.wifeName} onChange={(e) => setNewForm({ ...newForm, wifeName: e.target.value })} className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800" />
                         </div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Gia đình có mấy con</label>
                           <input type="number" min="0" value={newForm.numberOfChildren} onChange={(e) => setNewForm({ ...newForm, numberOfChildren: e.target.value })} className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800" />
                         </div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Con thứ mấy</label>
                           <input type="text" placeholder="VD: Con đầu" value={newForm.childOrder} onChange={(e) => setNewForm({ ...newForm, childOrder: e.target.value })} className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800" />
                         </div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">SĐT liên hệ</label>
                           <input type="text" placeholder="VD: 0987654321" value={newForm.contactPhone} onChange={(e) => setNewForm({ ...newForm, contactPhone: e.target.value })} className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800" />
                         </div>
     
                         <div className="lg:col-span-4 mt-4"><h4 className="font-semibold text-slate-500 text-xs uppercase tracking-wider border-b pb-1">Thông tin khác</h4></div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày nhận cấp bậc</label>
                           <input
                             type="text"
                             placeholder="VD: 01/06/2024"
                             value={newForm.rankReceivedDate}
                             onChange={(e) => setNewForm({ ...newForm, rankReceivedDate: e.target.value })}
                             className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 font-mono"
                           />
                         </div>
     
                         <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày nhận chức vụ</label>
                           <input
                             type="text"
                             placeholder="VD: 01/06/2024"
                             value={newForm.positionReceivedDate}
                             onChange={(e) => setNewForm({ ...newForm, positionReceivedDate: e.target.value })}
                             className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 font-mono"
                           />
                         </div>
     
                          <div>
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Ghi chú trạng thái</label>
                           <select
                             value={newForm.note}
                             onChange={(e) => setNewForm({ ...newForm, note: e.target.value })}
                             className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
                           >
                             {NOTES_PRESETS.map(n => (
                               <option key={n.value} value={n.value}>{n.label}</option>
                             ))}
                           </select>
                         </div>
     
                          <div className="sm:col-span-2 lg:col-span-4">
                           <label className="block text-xs font-semibold text-slate-600 mb-1">Ghi chú chi tiết</label>
                           <input
                             type="text"
                             placeholder="VD: Về quê việc gia đình"
                             value={newForm.remark}
                             onChange={(e) => setNewForm({ ...newForm, remark: e.target.value })}
                             className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
                           />
                         </div>
                       </div>
     
                       <div className="flex justify-end space-x-2 mt-4">
                         <button
                           onClick={() => setIsAdding(false)}
                           className="px-3.5 py-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-medium transition"
                         >
                           Hủy bỏ
                         </button>
                         <button
                           onClick={handleAddSoldier}
                           className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold transition flex items-center space-x-1"
                         >
                           <Check className="w-3.5 h-3.5" />
                           <span>Thêm quân nhân</span>
                         </button>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
     
                 {/* Soldiers Roster Table */}
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse border border-slate-200 font-vietnamese-serif">
                     <thead className="text-[14px] whitespace-nowrap">
                       <tr className="bg-slate-100 text-slate-700 font-bold">
                         <th colSpan={2} rowSpan={2} className="p-3 border border-slate-200 border-r-slate-300 text-center align-middle w-24">TT</th>
                         <th rowSpan={2} className="p-3 border border-slate-200 text-center align-middle min-w-[200px]">Họ và tên</th>
                         {showEnlistmentColumn && (
                           <th rowSpan={2} className="p-3 border border-slate-200 text-center align-middle w-32">Nhập ngũ</th>
                         )}
                         {showRankColumn && (
                           <th rowSpan={2} className="p-3 border border-slate-200 text-center align-middle w-28">Cấp bậc</th>
                         )}
                         {showPositionColumn && (
                           <th rowSpan={2} className="p-3 border border-slate-200 text-center align-middle w-40">Chức vụ</th>
                         )}
                         {showRemarkColumn && (
                           <th rowSpan={2} className="p-3 border border-slate-200 text-center align-middle min-w-[150px]">Ghi chú</th>
                         )}
                         {showStatusColumn && <th rowSpan={2} className="p-3 border border-slate-200 w-44 text-center align-middle">Trạng thái</th>}
                         {showActionsColumn && <th rowSpan={2} className="p-3 border border-slate-200 w-24 text-center print:hidden align-middle">Thao tác</th>}
                       </tr>
                     </thead>
                     <tbody className="text-[14px] whitespace-nowrap">
                       {filteredRoster.length > 0 ? (
                         (() => {
                           let globalIndex = 0; // To maintain continuous numbering
     
                           // Define the hierarchical structure of units
                           const hierarchy = [
                             { name: "Ban chỉ huy Đại đội", type: "header", squads: [] },
                             { name: "Đại đội bộ", type: "header", squads: [] },
                             {
                               name: "Trung đội Bảo vệ 1",
                               type: "subheader",
                               squads: ["Tiểu đội Bảo vệ 1", "Tiểu đội Bảo vệ 2", "Tiểu đội Bảo vệ 3"]
                             },
                             {
                               name: "Trung đội Bảo vệ 2",
                               type: "subheader",
                               squads: ["Tiểu đội Bảo vệ 4", "Tiểu đội Bảo vệ 5", "Tiểu đội Bảo vệ 6"]
                             },
                           ];
     
                           // Function to render a single soldier row
                           const renderSoldierRow = (soldier: Soldier, unitIndex: number) => {
                             globalIndex++;
                             const isEditing = editingId === soldier.id;
     
                             return (
                               <tr 
                                 key={soldier.id} 
                                 className={`hover:bg-slate-50 transition-colors ${
                                   !isEditing && soldier.note !== "Có mặt" && soldier.note 
                                     ? "bg-amber-50/10" 
                                     : ""
                                 }`}
                               >
                                 {/* STT */}
                                 <td className="p-3 border border-slate-200 text-center font-mono font-medium text-slate-600 bg-slate-50">
                                   {globalIndex}
                                 </td>
                                 {/* Per-Unit STT */}
                                 <td className="p-3 border border-slate-200 border-r-slate-300 text-center font-mono font-medium text-slate-500">
                                   {unitIndex}
                                 </td>
     
                                 {/* Full Name */}
                                 <td className="p-3 border border-slate-200 font-medium text-slate-900 whitespace-normal">
                                   {isEditing ? (
                                     <input
                                       type="text"
                                       value={editForm?.name || ""}
                                       onChange={(e) => setEditForm((prev:any) => prev ? { ...prev, name: e.target.value } : null)}
                                       className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:border-emerald-500 text-slate-800"
                                     />
                                   ) : (
                                     <span onClick={() => setViewingSoldier(soldier)} className="cursor-pointer hover:text-emerald-700 hover:underline">
                                       {soldier.name}
                                     </span>
                                   )}
                                 </td>
                                 
                                 {/* Enlistment date - Conditionally rendered */}
                                 {showEnlistmentColumn && (
                                   <td className="p-3 border border-slate-200 text-center font-mono text-slate-600">
                                     {isEditing ? (
                                       <input
                                         type="text"
                                         value={editForm?.enlistmentDate || ""}
                                         onChange={(e) => setEditForm((prev:any) => prev ? { ...prev, enlistmentDate: e.target.value } : null)}
                                         className="w-full text-center bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 font-mono"
                                       />
                                     ) : (
                                       <span>{soldier.enlistmentDate}</span>
                                     )}
                                   </td>
                                 )}
     
                                 {/* Rank - Conditionally rendered */}
                                 {showRankColumn && (
                                   <td className="p-3 border border-slate-200 text-center">
                                     {isEditing ? (
                                       <select
                                         value={editForm?.rank || ""}
                                         onChange={(e) => setEditForm((prev:any) => prev ? { ...prev, rank: e.target.value } : null)}
                                         className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
                                       >
                                         {RANKS.map(r => (
                                           <option key={r} value={r}>{r}</option>
                                         ))}
                                       </select>
                                     ) : (
                                       <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-semibold">
                                         {soldier.rank}
                                       </span>
                                     )}
                                   </td>
                                 )}
     
                                 {/* Position - Conditionally rendered */}
                                 {showPositionColumn && (
                                   <td className="p-3 border border-slate-200 text-center text-slate-700">
                                     {isEditing ? (
                                       <select
                                         value={editForm?.position || ""}
                                         onChange={(e) => setEditForm((prev:any) => prev ? { ...prev, position: e.target.value } : null)}
                                         className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
                                       >
                                         {POSITIONS.map(p => (
                                           <option key={p} value={p}>{p}</option>
                                         ))}
                                       </select>
                                     ) : (
                                       <span>{soldier.position}</span>
                                     )}
                                   </td>
                                 )}
     
                                 {/* Remark - Conditionally rendered */}
                                 {showRemarkColumn && (
                                   <td className="p-3 border border-slate-200 text-center text-slate-600 whitespace-normal">
                               {isEditing ? (
                                 <input
                                   type="text"
                                   value={editForm?.remark || ""}
                                   onChange={(e) => setEditForm((prev:any) => prev ? { ...prev, remark: e.target.value } : null)}
                                   className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
                                 />
                               ) : (
                                 <span>{soldier.remark}</span>
                               )}
                                   </td>
                                 )}
                                 
                                 {/* Status */}
                                 {showStatusColumn && (
                                   <td className="p-3 border border-slate-200 text-center">
                                     {isEditing ? (<>
                                       <select
                                         value={editForm?.note || ""}
                                         onChange={(e) => setEditForm((prev:any) => prev ? { ...prev, note: e.target.value } : null)}
                                         className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
                                       >
                                         {NOTES_PRESETS.map(n => ( // Sử dụng hằng số đã được cập nhật
                                           <option key={n.value} value={n.value}>{n.label}</option>
                                         ))}
                                       </select>
                                       {editForm?.note === "Lý do khác" && (
                                         <input
                                           type="text"
                                           value={otherReason}
                                           onChange={e => setOtherReason(e.target.value)}
                                           placeholder="Nhập lý do..."
                                           className="w-full mt-1 bg-white border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
                                         />
                                       )}
                                       </>
                                     ) : (
                                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                         soldier.note === "Có mặt" || !soldier.note
                                           ? "bg-emerald-100 text-emerald-800"
                                           : "bg-amber-100 text-amber-800"
                                       }`}>
                                         {soldier.note || "Có mặt"}
                                       </span>
                                     )}
                                   </td>
                                 )}
                                 
                                 {/* Actions */}
                                 {showActionsColumn && (
                                   <td className="p-3 border border-slate-200 text-center print:hidden">
                                     <div className="flex items-center justify-center space-x-1">
                                       {isEditing ? (
                                         <>
                                           <button
                                             onClick={saveEdit}
                                             className="p-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded transition"
                                             title="Lưu lại"
                                           >
                                             <Check className="w-4 h-4" />
                                           </button>
                                           <button
                                             onClick={cancelEdit}
                                             className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition"
                                             title="Hủy"
                                           >
                                             <X className="w-4 h-4" />
                                           </button>
                                         </>
                                       ) : (
                                         <>
                                           <button
                                             onClick={() => startEdit(soldier)}
                                             className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded transition"
                                             title="Sửa thông tin"
                                           >
                                             <Edit2 className="w-4 h-4" />
                                           </button>
                                           <button
                                             onClick={() => handleDelete(soldier.id, soldier.name)}
                                             className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition"
                                             title="Xóa quân nhân"
                                           >
                                             <Trash2 className="w-4 h-4" />
                                           </button>
                                         </>
                                       )}
                                     </div>
                                   </td>
                                 )}
                               </tr>
                             );
                           };
     
                           // Map through the hierarchy to build the table body
                           return hierarchy.map(unitInfo => {
                             const elements = [];
                             
                             // Get soldiers directly in a top-level unit (e.g., Ban chỉ huy)
                             const soldiersInUnit = filteredRoster.filter((s:any) => s.unit === unitInfo.name);
     
                             // Get all soldiers within a platoon's squads
                             const soldiersInPlatoon = unitInfo.squads.length > 0 
                               ? filteredRoster.filter((s:any) => s.unit === unitInfo.name || unitInfo.squads.includes(s.unit))
                               : [];
     
                             // Only render the unit/platoon if it has soldiers, unless we are searching
                             if (soldiersInUnit.length === 0 && soldiersInPlatoon.length === 0 && searchTerm === "") {
                               return null;
                             }
     
                             // Add the main header row (for Ban chỉ huy, Đại đội bộ, or Trung đội)
                             const isCollapsed = collapsedSections.has(unitInfo.name);
                             const colSpan = 2 + 
                               (showEnlistmentColumn ? 1 : 0) +
                               (showRankColumn ? 1 : 0) +
                               (showPositionColumn ? 1 : 0) +
                               (showRemarkColumn ? 1 : 0);
     
                             elements.push(
                               <tr 
                                 key={`header-${unitInfo.name}`} 
                                 onClick={() => unitInfo.type === 'subheader' && toggleCollapse(unitInfo.name)}
                                 className={`${
                                   unitInfo.type === 'subheader' 
                                     ? "bg-slate-200 font-bold text-slate-800 cursor-pointer hover:bg-slate-300/70"
                                     : "bg-slate-100 font-semibold text-slate-700"
                                 } transition-colors`}
                               >
                                 <>
                                   <td className="p-2 border border-slate-200 text-center"></td>
                                   <td className="p-2 border border-slate-200 border-r-slate-300"></td>
                                   <td colSpan={colSpan} className="p-2 border border-slate-200">
                                     <span className={`block text-center w-full transition-transform ${isCollapsed ? '' : 'font-extrabold'}`}>
                                       {unitInfo.name}
                                     </span>
                                   </td>
                                   {showStatusColumn && <td className="p-2 border border-slate-200"></td>}
                                   {showActionsColumn && <td className="p-2 border border-slate-200 print:hidden"></td>}
                                 </>
                               </tr>
                             );
     
                             // Render direct soldiers (for Ban chỉ huy, Đại đội bộ, or Trung đội)
                             if (!isCollapsed) {
                               let unitIndexCounter = 0;
                               soldiersInUnit.forEach((soldier:any) => {
                                 unitIndexCounter++;
                                 elements.push(renderSoldierRow(soldier, unitIndexCounter));
                               });
                             }
     
                             // If the platoon is not collapsed, render its squads and soldiers
                             if (!isCollapsed) {
                               // Render squads and their soldiers (for Trung đội)
                               unitInfo.squads.forEach((squadName:any) => {
                                 const soldiersInSquad = filteredRoster.filter((s:any) => s.unit === squadName);
                                 if (soldiersInSquad.length > 0) {
                                   const isSquadCollapsed = collapsedSections.has(squadName);
                                   // Add squad sub-header
                                   elements.push(
                                     <tr 
                                       key={`header-${squadName}`} 
                                       onClick={() => toggleCollapse(squadName)}
                                       className="bg-slate-100 font-semibold text-slate-700 cursor-pointer hover:bg-slate-200/70 transition-colors"
                                     >
                                       <>
                                         <td className="p-2 border border-slate-200 text-center"></td>
                                         <td className="p-2 border border-slate-200 border-r-slate-300"></td>                                    
                                         <td colSpan={colSpan} className="p-2 border border-slate-200">
                                           <span className={`block text-center w-full transition-transform ${isSquadCollapsed ? '' : 'font-extrabold'}`}>{squadName}</span>
                                         </td>
                                         {showStatusColumn && <td className="p-2 border border-slate-200"></td>}
                                         {showActionsColumn && <td className="p-2 border border-slate-200 print:hidden"></td>}
                                       </>
                                     </tr>
                                   );
                                   // If the squad is not collapsed, render its soldiers
                                   if (!isSquadCollapsed) {
                                     let squadIndexCounter = 0;
                                     soldiersInSquad.forEach((soldier:any) => {
                                       squadIndexCounter++;
                                       elements.push(renderSoldierRow(soldier, squadIndexCounter));
                                     });
                                   }
                                 }
                               });
                             }
     
                             return elements;
                           }).flat()
                         })()
                       ) : (
                         <tr>
                           <td colSpan={
                             2 + 1 + // TT, Họ tên
                             (showEnlistmentColumn ? 1 : 0) +
                             (showRankColumn ? 1 : 0) +
                             (showPositionColumn ? 1 : 0) +
                             (showRemarkColumn ? 1 : 0) +
                             (showStatusColumn ? 1 : 0) +
                             (showActionsColumn ? 1 : 0)
                           } className="p-8 text-center text-slate-400 bg-slate-50">
                             Không tìm thấy quân nhân nào khớp với từ khóa tìm kiếm.
                           </td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                 </div>
     
                 {/* Total count footer within Roster section */}
                 <div className="flex flex-wrap gap-2 mt-4 print:hidden">
                   <button onClick={() => setShowEnlistmentColumn(!showEnlistmentColumn)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5">
                     {showEnlistmentColumn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                     <span>Nhập ngũ</span>
                   </button>
                   <button onClick={() => setShowRankColumn(!showRankColumn)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5">
                     {showRankColumn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                     <span>Cấp bậc</span>
                   </button>
                   <button onClick={() => setShowPositionColumn(!showPositionColumn)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5">
                     {showPositionColumn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                     <span>Chức vụ</span>
                   </button>
                   <button onClick={() => setShowRemarkColumn(!showRemarkColumn)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5">
                     {showRemarkColumn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                     <span>Ghi chú</span>
                   </button>
                   <button onClick={() => setShowStatusColumn(!showStatusColumn)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5">
                     {showStatusColumn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                     <span>Trạng thái</span>
                   </button>
                   <button onClick={() => setShowActionsColumn(!showActionsColumn)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5">
                     {showActionsColumn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                     <span>Thao tác</span>
                   </button>
                 </div>
     
                 <div className="mt-4 text-xs text-slate-500 font-medium flex justify-between items-center print:hidden">
                   <p>Đang hiển thị {filteredRoster.length} trên tổng số {roster.length} quân nhân biên chế.</p>
                   <p>Mẹo: Nhấp vào nút <Edit2 className="w-3 h-3 inline text-slate-400" /> để thay đổi thông tin, đơn vị hoặc trạng thái quân nhân.</p>
                 </div>
               </div>
             </section>

    </section>
  );
};

export default Danhsachbienche;