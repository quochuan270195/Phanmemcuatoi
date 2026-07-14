import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Users, UserCheck, UserX, AlertTriangle, Edit2, Check, X, FileText, Save, Trash2, Eye, Search, ChevronDown, EyeOff } from 'lucide-react';
import { onSnapshot, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// Định nghĩa lại các kiểu dữ liệu cần thiết
interface Soldier {
  id: string;
  name: string;
  rank: string;
  position: string;
  enlistmentDate: string;
  unit: string;
  note: string;
  remark: string;
}

interface ReportSummary {
  total: number;
  present: number;
  absent: number;
  title: string;
  notes: string;
}

interface DutyReport {
  id: number; // Unique ID, e.g., timestamp
  date: string;
  title: string;
  total: number;
  present: number;
  absent: number;
  notes: string;
  roster: Soldier[];
}

// Thêm hằng số cho các lựa chọn trạng thái
const NOTES_PRESETS = [
  { value: "Có mặt", label: "Có mặt" },
  { value: "Phép", label: "Vắng: Phép" },
  { value: "Tranh thủ", label: "Vắng: Tranh thủ" },
  { value: "Công tác", label: "Vắng: Công tác" },
  { value: "Học", label: "Vắng: Học" },
  { value: "Viện", label: "Vắng: Viện" },
  { value: "Bệnh xá", label: "Vắng: Bệnh xá" },
  { value: "Tăng cường", label: "Vắng: Tăng cường" }
, { value: "Lý do khác", label: "Vắng: Lý do khác..." }
];

const QuanSoTHNV: React.FC = () => {
  const location = useLocation();
  const initialRoster = (location.state as { roster: Soldier[] })?.roster || [];

  // State để quản lý dữ liệu độc lập trên trang này
  const [roster, setRoster] = useState<Soldier[]>(initialRoster);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Pick<Soldier, 'note' | 'remark'> | null>(null);
  const [otherReason, setOtherReason] = useState<string>(""); // State for custom reason
  const [filterNote, setFilterNote] = useState<string>('all');

  // State for save report modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");

  // State for saved reports list
  const [savedReports, setSavedReports] = useState<DutyReport[]>([]);

  // State for searching historical reports
  const [searchDate, setSearchDate] = useState<string>('');

  // State for viewing a saved report
  const [viewingReport, setViewingReport] = useState<DutyReport | null>(null);

  // State for today's reports visibility
  const [isTodaysReportsVisible, setIsTodaysReportsVisible] = useState(false);

  // State để quản lý việc hiển thị chi tiết quân số vắng
  const [showAbsentDetails, setShowAbsentDetails] = useState(false);

  // State để quản lý việc ẩn/hiện các cột
  const [showUnitColumn, setShowUnitColumn] = useState(true);
  const [showRankColumn, setShowRankColumn] = useState(true);
  const [showPositionColumn, setShowPositionColumn] = useState(true);
  const [showStatusColumn, setShowStatusColumn] = useState(true);
  const [showRemarkColumn, setShowRemarkColumn] = useState(true);
  const [showActionsColumn, setShowActionsColumn] = useState(true);

  const startEdit = (soldier: Soldier) => {
    setEditingId(soldier.id);
    if (soldier.note.startsWith("Lý do khác: ")) {
      setEditForm({ note: "Lý do khác", remark: soldier.remark });
      setOtherReason(soldier.note.substring("Lý do khác: ".length));
    } else {
      setEditForm({ note: soldier.note, remark: soldier.remark });
      setOtherReason("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setOtherReason("");
  };

  // Sửa hàm saveEdit: Chỉ cập nhật state cục bộ, không đồng bộ lên Firebase
  const saveEdit = () => {
    if (viewingReport) return; // Disable editing in historical view
    if (!editingId || !editForm) return;

    let finalNote = editForm.note;
    if (editForm.note === "Lý do khác") {
      if (!otherReason.trim()) {
        alert("Vui lòng nhập lý do khác.");
        return;
      } else {
        finalNote = `Lý do khác: ${otherReason.trim()}`;
      }
    }

    // Chỉ cập nhật bản sao của roster trong trang này
    const updatedRoster = roster.map(s => s.id === editingId ? { ...s, note: finalNote, remark: editForm.remark } : s);
    setRoster(updatedRoster);

    setEditingId(null);
    setEditForm(null);
  };

  // Helper function to calculate summary, can be reused.
  const calculateSummary = (rosterData: Soldier[]): ReportSummary => {
    const total = rosterData.length;
    const presentCount = rosterData.filter(s => s.note === "Có mặt" || !s.note).length;
    const absentCount = total - presentCount;

    const getUnitAbbreviation = (unit: string): string => {
      const mappings: { [key: string]: string } = {
        "Ban chỉ huy Đại đội": "BCHc",
        "Đại đội bộ": "c Bộ",
        "Trung đội Bảo vệ 1": "bBV1",
        "Tiểu đội Bảo vệ 1": "aBV1",
        "Tiểu đội Bảo vệ 2": "aBV2",
        "Tiểu đội Bảo vệ 3": "aBV3",
        "Trung đội Bảo vệ 2": "bBV2",
        "Tiểu đội Bảo vệ 4": "aBV4",
        "Tiểu đội Bảo vệ 5": "aBV5",
        "Tiểu đội Bảo vệ 6": "aBV6",
      };
      return mappings[unit] || unit;
    };

    const absentDetails: { [key: string]: string[] } = {};
    rosterData.forEach(s => {
      if (s.note && s.note !== "Có mặt") {
        if (!absentDetails[s.note]) {
          absentDetails[s.note] = [];
        }
        let detail = `${s.rank} ${s.name} (${getUnitAbbreviation(s.unit)})`;
        if (s.remark) {
          detail += `: ${s.remark}`;
        }
        absentDetails[s.note].push(detail);
      }
    });

    const notesArray = Object.entries(absentDetails).map(([reason, personnel]) => {
      const displayReason = reason.startsWith("Lý do khác: ") ? reason.substring("Lý do khác: ".length) : reason;
      return `${displayReason}: ${personnel.length} đ/c (${personnel.join(", ")})`;
    });

    return {
      total,
      present: presentCount,
      absent: absentCount,
      title: reportTitle, // title is part of summary but not displayed in the table
      notes: notesArray.length > 0 ? notesArray.join("; ") : "Quân số đầy đủ."
    };
  };

  // Khi xem báo cáo đã lưu, reportToDisplay sẽ là dữ liệu của báo cáo đó.
  // Nếu không, nó sẽ là dữ liệu trực tiếp.
  const reportToDisplay = useMemo(() => viewingReport ? calculateSummary(viewingReport.roster) : calculateSummary(roster), [roster, viewingReport]);

  // Dữ liệu roster để hiển thị trong bảng chi tiết (live hoặc historical)
  const rosterForDetails = useMemo(() => viewingReport ? viewingReport.roster : roster, [roster, viewingReport]);

  // Nhóm các lý do vắng mặt để hiển thị trong bảng tổng hợp
  const groupedAbsences = useMemo(() => {
    const rosterData = viewingReport ? viewingReport.roster : roster;
    const groups: { [key: string]: number } = {};
    
    rosterData.filter((s: Soldier) => s.note !== 'Có mặt' && s.note).forEach((s: Soldier) => {
      let reason = s.note || "Lý do khác";
      // Chuẩn hóa lý do để nhóm tốt hơn
      if (reason.startsWith("Vắng: ") || reason.startsWith("Lý do khác: ")) {
        reason = reason.substring(reason.indexOf(":") + 2);
      }
      groups[reason] = (groups[reason] || 0) + 1;
    });
     
    return Object.entries(groups);
  }, [roster, viewingReport]);

  const handlePrint = () => {
    window.print();
  };

  const syncReportsToFirebase = async (reports: DutyReport[]) => {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) {
      alert("Bạn cần đăng nhập để đồng bộ dữ liệu.");
      return;
    }
    try {
      const docRef = doc(db, "baocao_quanso", userEmail);
      // Chỉ cập nhật trường dutyReports, không ảnh hưởng các dữ liệu khác
      await updateDoc(docRef, { "duLieu.dutyReports": reports });
    } catch (error) {
      console.error("Lỗi đồng bộ báo cáo nhiệm vụ:", error);
      alert("Đã xảy ra lỗi khi đồng bộ báo cáo.");
    }
  };

  const handleSaveReport = async () => {
    if (!reportTitle.trim()) {
      alert("Vui lòng nhập tiêu đề báo cáo.");
      return;
    }

    const summaryToSave = calculateSummary(roster);

    const reportData: DutyReport = {
      id: Date.now(),
      ...summaryToSave,
      date: new Date().toLocaleDateString('en-CA'),
      title: reportTitle.trim(),
      roster: roster,
    };
    
    const updatedReports = [reportData, ...savedReports].sort((a, b) => b.id - a.id);
    setSavedReports(updatedReports);
    await syncReportsToFirebase(updatedReports);

    setIsSaveModalOpen(false);
    alert("Đã lưu và đồng bộ báo cáo thành công.");
  };

  const handleDeleteReport = async (reportId: number) => {
    if (confirm(`Bạn có chắc chắn muốn xóa báo cáo này?`)) {
      const updatedReports = savedReports.filter(report => report.id !== reportId);
      setSavedReports(updatedReports);
      await syncReportsToFirebase(updatedReports);
      alert("Đã xóa báo cáo.");
    }
  };
  const handleViewReport = (report: DutyReport) => {
    setViewingReport(report);
    // Không thay đổi `roster` chính để bảng chi tiết luôn là dữ liệu live
  };

  const handleBackToLive = () => {
    setViewingReport(null);
    // Không cần setRoster vì nó không bị thay đổi
  };

  // Lọc báo cáo cho ngày hôm nay và các ngày đã tìm kiếm
  const todayString = new Date().toLocaleDateString('en-CA');
  const todaysReports = useMemo(() => 
    savedReports.filter(report => report.date === todayString),
    [savedReports, todayString]
  );

  const searchedReports = useMemo(() => {
    if (!searchDate) {
      return [];
    }
    return savedReports.filter(report => report.date === searchDate && report.date !== todayString);
  }, [savedReports, searchDate, todayString]);
    // Kết thúc nội dung tìm kiếm



  // Load saved reports on initial render
  useEffect(() => {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) return;

    // Hàm lắng nghe thay đổi
    const docRef = doc(db, "baocao_quanso", userEmail);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      // Bỏ qua cập nhật nếu thay đổi đến từ chính client này
      if (docSnap.metadata.hasPendingWrites) {
        console.log("QuanSoTHNV: Bỏ qua cập nhật cục bộ.");
        return;
      }
      if (docSnap.exists()) {
        const data = docSnap.data().duLieu;
        // Trang này chỉ cần lắng nghe và cập nhật danh sách báo cáo nhiệm vụ
        if (data && data.dutyReports) {
          setSavedReports(data.dutyReports);
          console.log("QuanSoTHNV: Đã đồng bộ danh sách báo cáo nhiệm vụ từ Firebase.");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Khi người dùng điều hướng đến trang này, luôn sử dụng roster được truyền từ DashboardPage
  useEffect(() => {
    const newInitialRoster = (location.state as { roster: Soldier[] })?.roster || [];
    setRoster(newInitialRoster);
  }, [location.state]);

  const filteredRoster = useMemo(() => {
    if (viewingReport) {
      // Khi xem báo cáo đã lưu, không áp dụng bộ lọc trực tiếp
      return viewingReport.roster;
    }
    return roster.filter(soldier => {
      if (filterNote === "all") return true;
      if (filterNote === "Có mặt") return soldier.note === "Có mặt" || !soldier.note;
      if (filterNote === "Vắng mặt") {
        const isAbsent = soldier.note && soldier.note !== "Có mặt";
        return isAbsent;
      }
      if (soldier.note.startsWith("Lý do khác: ")) {
        return filterNote === "Lý do khác";
      }
      return soldier.note === filterNote;
    });
  }, [roster, filterNote, viewingReport]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16 print:bg-white">
      <div className="max-w-7xl mx-auto bg-white p-6 sm:p-8 rounded-b-lg shadow-lg print:shadow-none print:rounded-none print:p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 print:mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700 print:hidden">
                <FileText className="w-8 h-8" />
            </div>
            <div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold print:hidden">
                        Báo cáo nhiệm vụ
                    </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1 text-slate-800">
                    Báo cáo Quân số Thực hiện Nhiệm vụ
                </h1>
                <p className="text-slate-500 text-sm mt-0.5 print:text-slate-700">
                    {viewingReport 
                        ? `Báo cáo lúc: ${new Date(viewingReport.id).toLocaleString('vi-VN')}`
                        : `Tính đến thời điểm hiện tại`
                    }
                </p>
            </div>
          </div>
          <div className="flex space-x-2 print:hidden">
            <Link
              to="/"
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-sm font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </Link>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition"
            >
              <Printer className="w-4 h-4" />
              <span>In báo cáo</span>
            </button>
          </div>
        </div>

        {/* Save Report Modal */}
        {isSaveModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
            onClick={() => setIsSaveModalOpen(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Lưu báo cáo hôm nay</span>
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Nhập tiêu đề để lưu lại báo cáo quân số tại thời điểm hiện tại.
              </p>
              <div className="mt-6">
                <label htmlFor="report-title" className="text-sm font-medium text-slate-700">Tiêu đề báo cáo</label>
                <input
                  id="report-title"
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder={`VD: Báo cáo sáng ${new Date().toLocaleDateString('vi-VN')}`}
                />
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-semibold transition">Hủy</button>
                <button onClick={handleSaveReport} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold transition">Lưu báo cáo</button>
              </div>
            </div>
          </div>
        )}

        {/* Bảng tổng hợp */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">I. BẢNG TỔNG HỢP BÁO CÁO QUÂN SỐ</h2>
          {/* Thêm các thẻ thông tin nhanh */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:grid-cols-3">
              <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng quân số</p>
                  <p className="text-3xl font-bold font-mono text-slate-900 mt-1">{reportToDisplay.total} <span className="text-sm font-normal text-slate-500">đ/c</span></p>
                </div>
                <div className="p-2.5 bg-slate-200 text-slate-700 rounded-full">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className={`p-4 rounded-lg border flex items-center justify-between ${viewingReport ? 'bg-slate-100 border-slate-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${viewingReport ? 'text-slate-500' : 'text-emerald-700'}`}>Có mặt</p>
                  <p className={`text-3xl font-bold font-mono mt-1 ${viewingReport ? 'text-slate-900' : 'text-emerald-900'}`}>{reportToDisplay.present} <span className={`text-sm font-normal ${viewingReport ? 'text-slate-500' : 'text-emerald-600'}`}>đ/c</span></p>
                </div>
                <div className={`p-2.5 rounded-full ${viewingReport ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>

              <div className={`p-4 rounded-lg border flex items-center justify-between ${viewingReport ? 'bg-slate-100 border-slate-200' : 'bg-amber-50 border-amber-200'}`}>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${viewingReport ? 'text-slate-500' : 'text-amber-700'}`}>Vắng mặt</p>
                  <p className={`text-3xl font-bold font-mono mt-1 ${viewingReport ? 'text-slate-900' : 'text-amber-900'}`}>{reportToDisplay.absent} <span className={`text-sm font-normal ${viewingReport ? 'text-slate-500' : 'text-amber-600'}`}>đ/c</span></p>
                </div>
                <div className={`p-2.5 rounded-full ${viewingReport ? 'bg-amber-100 text-amber-700' : 'bg-amber-100 text-amber-700'}`}>
                  <UserX className="w-6 h-6" />
                </div>
              </div>
            </div>
          {/* Kết thúc các thẻ thông tin nhanh */}
          <table className="w-full text-left border-collapse border border-slate-300">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="p-3 border border-slate-300 w-16 text-center">STT</th>
                <th className="p-3 border border-slate-300">Nội dung</th>
                <th className="p-3 border border-slate-300 w-40 text-center">Số lượng</th>
                <th className="p-3 border border-slate-300">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-slate-300 text-center font-medium">1</td>
                <td className="p-3 border border-slate-300 font-semibold">Tổng quân số</td>
                <td className="p-3 border border-slate-300 text-center font-bold">{reportToDisplay.total} đ/c</td>
                <td className="p-3 border border-slate-300 italic text-slate-500">Toàn bộ quân số biên chế.</td>
              </tr>
              <tr className="bg-emerald-50/30">
                <td className="p-3 border border-slate-300 text-center font-medium">2</td>
                <td className="p-3 border border-slate-300 font-semibold text-emerald-800">Có mặt</td>
                <td className="p-3 border border-slate-300 text-center font-bold text-emerald-800">{reportToDisplay.present} đ/c</td>
                <td className="p-3 border border-slate-300 text-emerald-700">Sẵn sàng nhận nhiệm vụ.</td>
              </tr>
              <tr className="bg-amber-50/30">
                <td className="p-3 border border-slate-300 text-center font-medium">3</td>
                <td className="p-3 border border-slate-300 font-semibold text-amber-800">Vắng mặt</td>
                <td className="p-3 border border-slate-300 text-center font-bold text-amber-800">{reportToDisplay.absent} đ/c</td>
                <td className="p-3 border border-slate-300 text-slate-700">
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
              </tr>
              {/* Dòng chi tiết quân số vắng có thể thu gọn */}
              {reportToDisplay.absent > 0 && (
                <tr className="bg-amber-50/20 print:hidden">
                  <td colSpan={4} className="p-0 border border-slate-200">
                    <div className="p-2">
                      <button 
                        onClick={() => setShowAbsentDetails(!showAbsentDetails)}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center space-x-1"
                      >
                        {showAbsentDetails ? <Eye className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showAbsentDetails ? 'Ẩn' : 'Xem'} chi tiết quân số vắng</span>
                      </button>
                      {showAbsentDetails && (
                        <div className="mt-3 pl-2 space-y-3 text-slate-700 text-xs">
                          <AbsenteeDetails roster={rosterForDetails} />
                        </div>
                      )}
                    </div>
                  </td>
              </tr>
                )}
            </tbody>
          </table>

 {viewingReport && (
          <div className="mb-4 p-3 bg-amber-100 border border-amber-200 rounded-lg flex justify-between items-center print:hidden">
            <p className="text-sm font-medium text-amber-800">
              <span className="font-bold">Đang xem báo cáo đã lưu:</span> {viewingReport.title} (lúc {new Date(viewingReport.id).toLocaleString('vi-VN')})
            </p>
            <button onClick={handleBackToLive} className="px-3 py-1.5 rounded-lg bg-white text-amber-800 hover:bg-amber-50 text-xs font-semibold transition shadow-sm">
              Quay lại xem trực tiếp
            </button>
          </div>
        )}

          {/* Mục lưu báo cáo và danh sách đã lưu */}
          <div className="mt-6 print:hidden">
              <div className="space-y-4">
                  <div>
                      <button
                          onClick={() => {
                              setReportTitle(``);
                              setIsSaveModalOpen(true);
                          }}
                          className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-lg font-medium transition"
                      >
                          <Save className="w-4 h-4" />
                          <span>Lưu báo cáo hôm nay</span>
                      </button>
                  </div>
                  {(todaysReports.length > 0 || savedReports.some(r => r.date !== todayString)) && (
                      <div className="w-full bg-white border border-slate-200 rounded-lg text-sm">
                          <div className="font-bold p-3 border-b flex justify-between items-center">
                              <h3>Danh sách đã lưu</h3>
                              <div className="relative">
                                  <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input 
                                      type="date"
                                      value={searchDate}
                                      onChange={(e) => setSearchDate(e.target.value)}
                                      className="pl-7 pr-2 py-1 border border-slate-300 rounded-md text-xs font-normal focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                  />
                              </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                              {searchDate && (
                                  <>
                                      <h4 className="px-3 py-1.5 bg-slate-100 font-semibold text-slate-600">Kết quả tìm kiếm ngày {searchDate.split('-').reverse().join('/')}</h4>
                                      {searchedReports.length > 0 ? (
                                          <ul>{searchedReports.map(report => <ReportListItem key={report.id} report={report} onView={handleViewReport} onDelete={handleDeleteReport} />)}</ul>
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
                                      <ul>{todaysReports.map(report => <ReportListItem key={report.id} report={report} onView={handleViewReport} onDelete={handleDeleteReport} />)}</ul>
                                  ) : (
                                      <p className="px-3 py-2 text-slate-500 italic">Chưa có báo cáo nào được lưu hôm nay.</p>
                                  )
                                )}
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
        </section>

        {/* Danh sách chi tiết */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold text-slate-700">II. DANH SÁCH BIÊN CHẾ CHI TIẾT</h2>
          <div className="print:hidden">
            <select
              value={filterNote}
              onChange={(e) => setFilterNote(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
              disabled={!!viewingReport}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Có mặt">Chỉ có mặt</option>
              <option value="Vắng mặt">Tổng vắng mặt</option>
              {NOTES_PRESETS.filter(p => p.value !== 'Có mặt').map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-300 font-vietnamese-serif">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="p-3 border border-slate-300 text-center w-14">STT</th>
                <th className="p-3 border border-slate-300 text-center">Họ và tên</th>
                {showUnitColumn && <th className="p-3 border border-slate-300 text-center">Đơn vị</th>}
                {showRankColumn && <th className="p-3 border border-slate-300 text-center">Cấp bậc</th>}
                {showPositionColumn && <th className="p-3 border border-slate-300 text-center">Chức vụ</th>}
                {showStatusColumn && <th className="p-3 border border-slate-300 text-center">Trạng thái</th>}
                {showRemarkColumn && <th className="p-3 border border-slate-300 text-center">Ghi chú chi tiết</th>}
                {showActionsColumn && <th className="p-3 border border-slate-300 w-24 text-center print:hidden">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRoster.length > 0 ? (
                filteredRoster.map((soldier, index) => (
                  <tr key={soldier.id} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-300 text-center font-mono">{index + 1}</td>
                    <td className="p-2 border border-slate-300 font-medium">{soldier.name}</td>
                    {showUnitColumn && <td className="p-2 border border-slate-300 text-center">{soldier.unit}</td>}
                    {showRankColumn && <td className="p-2 border border-slate-300 text-center">{soldier.rank}</td>}
                    {showPositionColumn && <td className="p-2 border border-slate-300 text-center">{soldier.position}</td>}
                    {showStatusColumn && <td className="p-2 border border-slate-300 text-center align-middle">
                      {editingId === soldier.id ? (
                        <>
                          <select
                            value={editForm?.note || ''}
                            onChange={e => setEditForm(prev => prev ? { ...prev, note: e.target.value } : null)}
                            // Tự động focus vào ô Ghi chú chi tiết khi chọn lý do vắng mặt
                            onBlur={(e) => {
                              if (e.target.value !== 'Có mặt') e.currentTarget.parentElement?.nextElementSibling?.querySelector('input')?.focus();
                            }}
                            className="w-full bg-white border border-slate-300 rounded-md px-1.5 py-1 text-sm focus:outline-none focus:border-emerald-500 mb-1"
                          >
                            {NOTES_PRESETS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                          </select>
                          {editingId === soldier.id && editForm?.note === "Lý do khác" && (
                            <input
                              type="text"
                              value={otherReason}
                              onChange={e => setOtherReason(e.target.value)}
                              placeholder="Nhập lý do..."
                              className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
                            />
                          )}
                        </>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${soldier.note === "Có mặt" || !soldier.note ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                          {soldier.note.startsWith("Lý do khác: ") ? soldier.note.substring("Lý do khác: ".length) : (soldier.note || "Có mặt")}
                        </span>
                      )}
                    </td>}
                    {showRemarkColumn && <td className="p-2 border border-slate-300 align-middle">
                      {editingId === soldier.id ? (
                        <input
                          type="text"
                          value={editForm?.remark || ''}
                          onChange={e => setEditForm(prev => prev ? { ...prev, remark: e.target.value } : null)}
                          placeholder="Ghi chú thêm (nếu có)..."
                          className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-emerald-500"
                        />
                      ) : (
                        <span>{soldier.remark}</span>
                      )}
                    </td>}
                    {showActionsColumn && <td className="p-2 border border-slate-300 text-center print:hidden">
                      {editingId === soldier.id && !viewingReport ? (
                        <div className="flex items-center justify-center space-x-1">
                          <button onClick={saveEdit} className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded transition" title="Lưu"><Check className="w-4 h-4" /></button>
                          <button onClick={cancelEdit} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition" title="Hủy"><X className="w-4 h-4" /></button>
                        </div>
                      ) : !viewingReport && (
                        <button onClick={() => startEdit(soldier)} className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded transition" title="Sửa"><Edit2 className="w-4 h-4" /></button>
                      )}
                    </td>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Không có dữ liệu quân số.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Các nút ẩn/hiện cột */}
        <div className="flex flex-wrap gap-2 mt-4 print:hidden">
          <button onClick={() => setShowUnitColumn(!showUnitColumn)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5">
            {showUnitColumn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Đơn vị</span>
          </button>
          <button onClick={() => setShowRankColumn(!showRankColumn)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5">
            {showRankColumn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Cấp bậc</span>
          </button>
          <button onClick={() => setShowPositionColumn(!showPositionColumn)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5">
            {showPositionColumn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Chức vụ</span>
          </button>
          <button onClick={() => setShowStatusColumn(!showStatusColumn)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5">
            {showStatusColumn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Trạng thái</span>
          </button>
          <button onClick={() => setShowRemarkColumn(!showRemarkColumn)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5">
            {showRemarkColumn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Ghi chú</span>
          </button>
          <button onClick={() => setShowActionsColumn(!showActionsColumn)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1.5">
            {showActionsColumn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Thao tác</span>
          </button>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div></div>
            <div className="text-center md:text-right md:self-end">
                <p className="font-bold">NGƯỜI LẬP BIỂU</p>
                <p className="italic">(Ký, ghi rõ họ tên)</p>
            </div>
          </div>
      </div>
    </div>
  );
};

export default QuanSoTHNV;

interface ReportListItemProps {
  report: DutyReport;
  onView: (report: DutyReport) => void;
  onDelete: (reportId: number) => void;
}

const ReportListItem: React.FC<ReportListItemProps> = ({ report, onView, onDelete }) => (
  <li className="px-3 py-2 flex justify-between items-center group hover:bg-slate-50">
      <span className="cursor-pointer flex-grow" onClick={() => onView(report)}>
          {new Date(report.id).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {report.title || 'Báo cáo chưa có tiêu đề'}
      </span>
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView(report)} className="p-1 rounded-md text-slate-400 hover:bg-blue-100 hover:text-blue-600" title="Xem lại báo cáo này">
              <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(report.id); }} className="p-1 rounded-md text-slate-400 hover:bg-red-100 hover:text-red-600" title="Xóa báo cáo này">
              <Trash2 className="w-3.5 h-3.5" />
          </button>
      </div>
  </li>
);

// Component con để hiển thị chi tiết quân số vắng
const AbsenteeDetails: React.FC<{ roster: Soldier[] }> = ({ roster }) => {
  const absenteeGroups = useMemo(() => {
    return roster
      .filter((s: Soldier) => s.note !== 'Có mặt' && s.note)
      .reduce((acc: { [key: string]: Soldier[] }, soldier: Soldier) => {
        const reason = soldier.note.startsWith("Vắng: ") ? soldier.note.substring(6) : soldier.note;
        if (!acc[reason]) acc[reason] = [];
        acc[reason].push(soldier);
        return acc;
      }, {});
  }, [roster]);

  return (
    <>
      {Object.entries(absenteeGroups).map(([reason, soldiers]) => (
        <div key={reason}>
          <p className="font-semibold text-slate-800">{reason} ({soldiers.length} đ/c):</p>
          <ul className="list-disc pl-6 mt-1 space-y-1">
            {soldiers.map((s: Soldier) => <li key={s.id}>{s.rank} {s.name} - {s.unit}{s.remark ? <span className="italic text-slate-500"> ({s.remark})</span> : ''}</li>)}
          </ul>
        </div>
      ))}
    </>
  );
};