import React, { useMemo, useState } from 'react';
import { FileText, Users, UserCheck, UserX, AlertTriangle, ChevronDown, FileClock, Search, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Bangtonghopquanso = ({ 
  reportToDisplay, 
  viewingReport, 
  collapsedSummarySections, 
  toggleSummaryCollapse, 
  unitSummaries, 
  roster, 
  saveDailyReport, 
  dailyReports, 
  setViewingReport, 
  historySearchDate, 
  setHistorySearchDate, 
  setSearchedReport, 
  searchedReport,
  handleDeleteReport, // Thêm prop này từ DashboardPage
}: any) => {

  // State để quản lý việc hiển thị chi tiết quân số vắng
  const [showAbsentDetails, setShowAbsentDetails] = useState(false);
  // State cho mục báo cáo hôm nay có thể thu gọn
  const [isTodaysReportsVisible, setIsTodaysReportsVisible] = useState(true);

  {/* thêm để định dạng hiện thị qs vắng*/}
const groupedAbsences = useMemo(() => {
  // Nếu đang xem báo cáo đã lưu, dùng roster của báo cáo đó. Nếu không, dùng roster trực tiếp.
  const rosterData = viewingReport ? viewingReport.roster : roster;

  const groups: { [key: string]: number } = {};
  
  rosterData.filter((s: any) => s.note && s.note !== 'Có mặt').forEach((s: any) => {
    let reason = s.note || "Lý do khác";
    // Chuẩn hóa lý do để nhóm tốt hơn
    if (reason.startsWith("Vắng: ")) {
      reason = reason.substring(6);
    }
    groups[reason] = (groups[reason] || 0) + 1;
  });
   
  return Object.entries(groups);
}, [roster, viewingReport]);
{/* thêm để định dạng hiện thị qs vắng*/}

  // Lọc báo cáo cho ngày hôm nay và các ngày đã tìm kiếm
  const todayString = new Date().toLocaleDateString('en-CA');
  const todaysReports = useMemo(() => 
    dailyReports.filter((report: any) => report.date === todayString),
    [dailyReports, todayString]
  );

  const searchedReports = useMemo(() => {
    if (!historySearchDate) {
      return [];
    }
    // Tìm kiếm tất cả các ngày, bao gồm cả hôm nay nếu người dùng chọn
    return dailyReports.filter((report: any) => report.date === historySearchDate);
  }, [dailyReports, historySearchDate]);

  return (
    <section id="summary-section" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
      {/* Section 2 (Top): Bảng Tổng hợp Quân số (Aggregated Summary) */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:bg-slate-100 print:text-black print:border-b">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-emerald-400 print:text-emerald-800" />
          <h2 className="text-lg font-bold uppercase tracking-wide">Bảng Tổng Hợp Báo Cáo Quân Số</h2>
        </div>
        <div className="text-xs bg-emerald-800/60 text-emerald-200 px-2.5 py-1 rounded font-mono print:hidden">
          Cập nhật thời gian thực
        </div>
      </div>
      
      <div className="p-6">
        {/* Quick Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:grid-cols-3">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng quân số</p>
              <p className="text-3xl font-bold font-mono text-slate-900 mt-1">{reportToDisplay.total} <span className="text-sm font-normal text-slate-500">đ/c</span></p>
            </div>
            <div className="p-2.5 bg-slate-200 text-slate-700 rounded-full">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border flex items-center justify-between ${viewingReport ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50 border-emerald-100'}`}>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider ${viewingReport ? 'text-slate-500' : 'text-emerald-700'}`}>Có mặt</p>
              <p className={`text-3xl font-bold font-mono mt-1 ${viewingReport ? 'text-slate-900' : 'text-emerald-900'}`}>{reportToDisplay.present} <span className={`text-sm font-normal ${viewingReport ? 'text-slate-500' : 'text-emerald-600'}`}>đ/c</span></p>
            </div>
            <div className={`p-2.5 rounded-full ${viewingReport ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className={`p-4 rounded-lg border flex items-center justify-between ${viewingReport ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-100'}`}>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider ${viewingReport ? 'text-slate-500' : 'text-amber-700'}`}>Vắng mặt</p>
              <p className={`text-3xl font-bold font-mono mt-1 ${viewingReport ? 'text-slate-900' : 'text-amber-900'}`}>{reportToDisplay.absent} <span className={`text-sm font-normal ${viewingReport ? 'text-slate-500' : 'text-amber-600'}`}>đ/c</span></p>
            </div>
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-full">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Structured Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200">
            <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold text-[14px]">
                    <th className="p-3 border border-slate-200 w-16 text-center">STT</th>
                    <th className="p-3 border border-slate-200">Nội Dung Báo Cáo</th>
                    <th className="p-3 border border-slate-200 w-40 text-center">Số Lượng</th>
                    <th className="p-3 border border-slate-200">Ghi chú / Chi tiết quân số vắng</th>
                  </tr>
                </thead>
            <tbody className="divide-y divide-slate-200 text-[14px]">
              <tr>
                    <td className="p-3 border border-slate-200 text-center font-mono font-medium">1</td>
                    <td className="p-3 border border-slate-200 font-semibold text-slate-800">Tổng quân số</td>
                    <td className="p-3 border border-slate-200 text-center font-mono font-bold text-slate-900 bg-slate-50">{reportToDisplay.total} đồng chí</td>
                    <td className="p-3 border border-slate-200 text-slate-500 italic">Toàn bộ quân số.</td>
                  </tr>
                  <tr className="bg-emerald-50/20">
                    <td className="p-3 border border-slate-200 text-center font-mono font-medium">2</td>
                    <td className="p-3 border border-slate-200 font-semibold text-emerald-900">Quân số có mặt</td>
                    <td className="p-3 border border-slate-200 text-center font-mono font-bold text-emerald-800 bg-emerald-50/40">{reportToDisplay.present} đồng chí</td>
                    <td className="p-3 border border-slate-200 text-emerald-700">Có mặt.</td>
                  </tr>
              <tr className="bg-amber-50/20">
                    <td className="p-3 border border-slate-200 text-center font-mono font-medium">3</td>
                    <td className="p-3 border border-slate-200 font-semibold text-amber-900">Quân số vắng mặt</td>
                    <td className="p-3 border border-slate-200 text-center font-mono font-bold text-amber-800 bg-amber-50/40">{reportToDisplay.absent} đồng chí</td>

                   {/* hiện thị qs vắng*/}
                   <td className="p-3 border border-slate-200 text-slate-700 font-medium">
  {reportToDisplay.absent > 0 ? (
    <div className="flex flex-col space-y-1">
      {groupedAbsences.map(([reason, count], index) => (
        <div key={index} className="flex items-start space-x-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <span className="font-semibold">{reason}:</span>
          <span>{count} đồng chí</span>
        </div>
      ))}
    </div>
  ) : (
    <span className="text-emerald-700 font-semibold">Đơn vị đủ 100% quân số.</span>
  )}
</td>
              {/* hiện thị qs vắng*/}
              </tr>
              {/* Dòng chi tiết quân số vắng có thể thu gọn */}
              {reportToDisplay.absent > 0 && (
                <tr className="bg-amber-50/20">
                      <td colSpan={4} className="p-0 border border-slate-200">
                        <div className="p-2">
                          <button 
                            onClick={() => setShowAbsentDetails(!showAbsentDetails)}
                            className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center space-x-1"
                          >
                            {showAbsentDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{showAbsentDetails ? 'Ẩn' : 'Xem'} chi tiết quân số vắng</span>
                          </button>
                          {showAbsentDetails && (
                            <div className="mt-3 pl-2 space-y-3 text-slate-700 text-xs">
                              {Object.entries( // Sử dụng rosterData thay vì roster trực tiếp
                                (viewingReport ? viewingReport.roster : roster)
                                  .filter((s: any) => s.note !== 'Có mặt' && s.note)
                                  .reduce((acc: any, soldier: any) => {
                                    const reason = soldier.note.replace('Vắng: ', '');
                                    if (!acc[reason]) acc[reason] = [];
                                    acc[reason].push(soldier);
                                    return acc;
                                  }, {})
                              ).map(([reason, soldiers]: [string, any]) => ( // Thêm kiểu dữ liệu
                                <div key={reason}>
                                  <p className="font-semibold text-slate-800">{reason} ({soldiers.length} đ/c):</p>
                                  <ul className="list-disc pl-6 mt-1 space-y-1">
                                    {soldiers.map((s: any) => <li key={s.id}>{s.rank} {s.name} - {s.unit}{s.remark ? <span className="italic text-slate-500"> ({s.remark})</span> : ''}</li>)}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                </tr>
              )}
              {/* --- Collapsible Unit Summartties --- */}
              { !viewingReport && (
                <>
                      {/* Ban chỉ huy Đại đội */}
                      <tr onClick={() => toggleSummaryCollapse('BCHc')} className="bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                        <td className="p-3 border border-slate-200 text-center font-mono font-medium flex items-center justify-center">
                          <ChevronDown className={`w-4 h-4 transition-transform ${collapsedSummarySections.has('BCHc') ? '-rotate-90' : 'rotate-0'}`} />
                        </td>
                        <td className="p-3 border border-slate-200 font-semibold text-slate-700">Ban chỉ huy Đại đội</td>
                        <td className="p-3 border border-slate-200 text-center font-mono font-bold text-slate-800">{unitSummaries.BCHc.total}</td>
                        <td className="p-3 border border-slate-200 text-slate-500 italic">QS: {unitSummaries.BCHc.total} | Có mặt: {unitSummaries.BCHc.present} | Vắng: {unitSummaries.BCHc.absent}</td>
                      </tr>
                      {!collapsedSummarySections.has('BCHc') && (
                        <tr className="bg-slate-50">
                          <td colSpan={4} className="p-0 border-x border-slate-200"><div className="px-6 pb-3 text-xs text-slate-600">Tổng quân số: {unitSummaries.BCHc.total}, Có mặt: {unitSummaries.BCHc.present}, Vắng: {unitSummaries.BCHc.absent}</div></td>
                        </tr>
                      )}

                      {/* Đại đội bộ */}
                      <tr onClick={() => toggleSummaryCollapse('cBo')} className="bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                        <td className="p-3 border border-slate-200 text-center font-mono font-medium flex items-center justify-center">
                          <ChevronDown className={`w-4 h-4 transition-transform ${collapsedSummarySections.has('cBo') ? '-rotate-90' : 'rotate-0'}`} />
                        </td>
                        <td className="p-3 border border-slate-200 font-semibold text-slate-700">Đại đội bộ</td>
                        <td className="p-3 border border-slate-200 text-center font-mono font-bold text-slate-800">{unitSummaries.cBo.total}</td>
                        <td className="p-3 border border-slate-200 text-slate-500 italic">QS: {unitSummaries.cBo.total} | Có mặt: {unitSummaries.cBo.present} | Vắng: {unitSummaries.cBo.absent}</td>
                      </tr>
                      {!collapsedSummarySections.has('cBo') && (
                        <tr className="bg-slate-50">
                          <td colSpan={4} className="p-0 border-x border-slate-200"><div className="px-6 pb-3 text-xs text-slate-600">Tổng quân số: {unitSummaries.cBo.total}, Có mặt: {unitSummaries.cBo.present}, Vắng: {unitSummaries.cBo.absent}</div></td>
                        </tr>
                      )}

                      {/* Trung đội BV1 */}
                      <tr onClick={() => toggleSummaryCollapse('bBV1')} className="bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                        <td className="p-3 border border-slate-200 text-center font-mono font-medium flex items-center justify-center">
                          <ChevronDown className={`w-4 h-4 transition-transform ${collapsedSummarySections.has('bBV1') ? '-rotate-90' : 'rotate-0'}`} />
                        </td>
                        <td className="p-3 border border-slate-200 font-semibold text-slate-700">Trung đội Bảo vệ 1</td>
                        <td className="p-3 border border-slate-200 text-center font-mono font-bold text-slate-800">{unitSummaries.bBV1.total}</td>
                        <td className="p-3 border border-slate-200 text-slate-500 italic">QS: {unitSummaries.bBV1.total} | Có mặt: {unitSummaries.bBV1.present} | Vắng: {unitSummaries.bBV1.absent}</td>
                      </tr>
                      {!collapsedSummarySections.has('bBV1') && (
                        <tr className="bg-slate-50">
                          <td colSpan={4} className="p-0 border-x border-slate-200"><div className="px-6 pb-3 text-xs text-slate-600">Tổng quân số: {unitSummaries.bBV1.total}, Có mặt: {unitSummaries.bBV1.present}, Vắng: {unitSummaries.bBV1.absent}</div></td>
                        </tr>
                      )}

                      {/* Trung đội BV2 */}
                      <tr onClick={() => toggleSummaryCollapse('bBV2')} className="bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                        <td className="p-3 border border-slate-200 text-center font-mono font-medium flex items-center justify-center">
                          <ChevronDown className={`w-4 h-4 transition-transform ${collapsedSummarySections.has('bBV2') ? '-rotate-90' : 'rotate-0'}`} />
                        </td>
                        <td className="p-3 border border-slate-200 font-semibold text-slate-700">Trung đội Bảo vệ 2</td>
                        <td className="p-3 border border-slate-200 text-center font-mono font-bold text-slate-800">{unitSummaries.bBV2.total}</td>
                        <td className="p-3 border border-slate-200 text-slate-500 italic">QS: {unitSummaries.bBV2.total} | Có mặt: {unitSummaries.bBV2.present} | Vắng: {unitSummaries.bBV2.absent}</td>
                      </tr>
                      {!collapsedSummarySections.has('bBV2') && (
                        <tr className="bg-slate-50">
                          <td colSpan={4} className="p-0 border-x border-b border-slate-200"><div className="px-6 pb-3 text-xs text-slate-600">Tổng quân số: {unitSummaries.bBV2.total}, Có mặt: {unitSummaries.bBV2.present}, Vắng: {unitSummaries.bBV2.absent}</div></td>
                        </tr>
                      )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Banner thông báo khi xem lại báo cáo cũ */}
        {viewingReport && (
              <div className="mt-4 p-3 bg-amber-100 border border-amber-200 rounded-lg flex justify-between items-center print:hidden">
                <p className="text-sm font-medium text-amber-800">
                  <span className="font-bold">Đang xem báo cáo ngày:</span> {new Date(viewingReport.date + 'T00:00:00').toLocaleDateString('vi-VN')}
                </p>
                <button 
                  onClick={() => { 
                    setViewingReport(null);
                    setHistorySearchDate('');
                    setSearchedReport(null);
                  }} 
                  className="px-3 py-1.5 rounded-lg bg-white text-amber-800 hover:bg-amber-50 text-xs font-semibold transition shadow-sm"
                >
                  Quay lại xem trực tiếp
                </button>
              </div>
        )}

        {/* Daily Reports History */}
        <div className="mt-6 border-t border-slate-200 pt-6 print:hidden">
              <h3 className="text-base font-bold text-slate-800 mb-3">Lịch sử báo cáo quân số hàng ngày</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột bên trái: Các nút chức năng */}
                <div className="flex flex-col gap-3">
                    <button
                      onClick={saveDailyReport}
                      className="w-full text-center bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      Lưu hoặc Cập nhật Báo cáo Hôm nay
                    </button>
                    <Link
                      to="/quan-so-thnv"
                      state={{ roster: roster }}
                      className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center space-x-2"
                    >
                      <FileClock className="w-4 h-4" />
                      <span>Báo cáo Quân số Nhiệm vụ</span>
                    </Link>
                </div>

                {/* Cột bên phải: Danh sách báo cáo đã lưu */}
                <div className="w-full bg-white border border-slate-200 rounded-lg text-sm">
                    <div className="font-bold p-3 border-b flex justify-between items-center">
                        <h3>Danh sách đã lưu</h3>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="date"
                                value={historySearchDate}
                                onChange={(e) => {
                                  setHistorySearchDate(e.target.value);
                                  const foundReport = dailyReports.find((r: any) => r.date === e.target.value);
                                  setSearchedReport(foundReport || null);
                                  if (foundReport) {
                                    setViewingReport(foundReport);
                                  }
                                }}
                                className="pl-7 pr-2 py-1 border border-slate-300 rounded-md text-xs font-normal focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {historySearchDate && (
                            <>
                                <h4 className="px-3 py-1.5 bg-slate-100 font-semibold text-slate-600">Kết quả tìm kiếm ngày {historySearchDate.split('-').reverse().join('/')}</h4>
                                {searchedReports.length > 0 ? (
                                    <ul>{searchedReports.map((report: any) => <ReportListItem key={report.date} report={report} onView={setViewingReport} onDelete={handleDeleteReport} />)}</ul>
                                ) : (
                                    <p className="px-3 py-2 text-slate-500 italic">Không tìm thấy báo cáo.</p>
                                )}
                            </>
                        )}
                        <div>
                          <div onClick={() => setIsTodaysReportsVisible(!isTodaysReportsVisible)} className="px-3 py-1.5 bg-slate-100 font-semibold text-slate-600 flex items-center justify-between cursor-pointer hover:bg-slate-200/70">
                            <h4>Báo cáo hôm nay</h4>
                            <ChevronDown className={`w-4 h-4 transition-transform ${!isTodaysReportsVisible ? '-rotate-90' : ''}`} />
                          </div>
                          {isTodaysReportsVisible && (
                            todaysReports.length > 0 ? (
                                <ul>{todaysReports.map((report: any) => <ReportListItem key={report.date} report={report} onView={setViewingReport} onDelete={handleDeleteReport} />)}</ul>
                            ) : (
                                <p className="px-3 py-2 text-slate-500 italic">Chưa có báo cáo nào được lưu hôm nay.</p>
                            )
                          )}
                        </div>
                    </div>
                </div>
               </div>
        </div>
      </div>
    </section>
  );
};

// Component con để hiển thị từng mục báo cáo trong danh sách
const ReportListItem = ({ report, onView, onDelete }: any) => (
  <li className="px-3 py-2 flex justify-between items-center group hover:bg-slate-50 border-b last:border-b-0 border-slate-100">
      <span className="cursor-pointer flex-grow" onClick={() => onView(report)}>
          Báo cáo ngày {new Date(report.date + 'T00:00:00').toLocaleDateString('vi-VN')}
      </span>
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView(report)} className="p-1 rounded-md text-slate-400 hover:bg-blue-100 hover:text-blue-600" title="Xem lại báo cáo này">
              <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(report.date); }} className="p-1 rounded-md text-slate-400 hover:bg-red-100 hover:text-red-600" title="Xóa báo cáo này">
              <Trash2 className="w-3.5 h-3.5" />
          </button>
      </div>
  </li>
);

export default Bangtonghopquanso;