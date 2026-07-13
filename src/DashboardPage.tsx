import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Copy, 
  RotateCcw, 
  FileText, 
  Printer, 
  Search, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  UserCheck,
  UserX,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  BookUser,
  Cake,  
  Globe,
  MoreVertical,
  FileClock,
  LogOut, // Giữ LogOut ở cuối để dễ theo dõi
  User as UserIcon
} from "lucide-react"; // Make sure Upload is imported
import { motion, AnimatePresence } from "framer-motion";
import React from 'react';
// Import thư viện để xử lý file Excel. Cần chạy `npm install xlsx`
import * as XLSX from 'xlsx';
import { Upload, FilePlus, Replace, FileDiff } from "lucide-react";

import { Link } from 'react-router-dom';
import { onSnapshot, doc } from "firebase/firestore"; // Lấy từ thư viện gốc
import { auth, db, taiDuLieuTuDamMay, dongBoLenDamMay } from "./firebase";
import HeaderDashboard from "./components/HeaderDashboard";
import Bangtonghopquanso from "./components/Bangtonghopquanso";
import Danhsachbienche from "./components/Danhsachbienche";
import Thongkequanso from "./components/Thongkequanso";




// Types for military personnel
interface Soldier {
  id: string;
  name: string;
  rank: string;
  position: string;
  enlistmentDate: string;
  note: string; // "Tác chiến", "Phép", "Viện", "Học", "Có mặt", or empty
  unit: string; // Unit/Squad name
  dateOfBirth?: string; // Ngày sinh
  education?: string; // Văn hóa
  ethnicity?: string; // Dân tộc
  remark: string; // Additional notes
  // New detailed fields
  cccd?: string; // Số CCCD
  youthUnionJoinDate?: string; // Ngày vào đoàn
  partyJoinDate?: string; // Ngày vào Đảng
  religion?: string; // Tôn giáo
  hometown?: string; // Quê quán
  currentResidence?: string; // Trú quán
  fatherName?: string;
  motherName?: string;
  wifeName?: string;
  numberOfChildren?: string; // Using string to be flexible
  childOrder?: string; // Con thứ mấy
  contactPhone?: string;
  rankReceivedDate?: string; // Ngày nhận cấp bậc
  positionReceivedDate?: string; // Ngày nhận chức vụ
}

interface User {
  name: string;
  email: string;
}

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

interface DailyReport {
  date: string; // YYYY-MM-DD format
  total: number;
  present: number;
  absent: number;
  notes: string;
}




// Pre-defined values requested
const RANKS = ["1//", "4/", "3/", "2/", "1/", "H3", "H2", "H1", "B1", "B2"];
const POSITIONS = ["Đại đội trưởng", "Chính trị viên", "Phó Đại đội trưởng", "Trung đội trưởng", "Tiểu đội trưởng", "Nhân viên Quân y", "Nhân viên Quản lý", "Liên lạc", "Chiến sĩ"];
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
const UNITS: string[] = [
  "Ban chỉ huy Đại đội",
  "Đại đội bộ",
  "Trung đội Bảo vệ 1",
  "Tiểu đội Bảo vệ 1",
  "Tiểu đội Bảo vệ 2",
  "Tiểu đội Bảo vệ 3",
  "Trung đội Bảo vệ 2",
  "Tiểu đội Bảo vệ 4",
  "Tiểu đội Bảo vệ 5",
  "Tiểu đội Bảo vệ 6",
];

// 10 realistic Vietnamese military personnel mock data
const INITIAL_ROSTER: Soldier[] = [];

export default function DashboardPage({ user, onLogout }: DashboardPageProps) {
  // Load initial state from localStorage or use defaults
  // Đổi các state về mặc định, không đọc từ bộ nhớ tạm localStorage nữa
  const [roster, setRoster] = useState<Soldier[]>(INITIAL_ROSTER);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);

const dangCapNhatTuMang = useRef(false); // Cờ hiệu ngầm đánh dấu nguồn dữ liệu



useEffect(() => {
// 🔥 THÊM 2 DÒNG NÀY VÀO: Ép app tự xóa sạch bộ nhớ đệm cũ khi vừa mở trang
    localStorage.removeItem('militaryRoster');
    localStorage.removeItem('dailyReports');

    let unsubscribe: (() => void) | undefined;

 const batLuanNgheRealtime = async () => {
      const emailHienTai = auth?.currentUser?.email;
      
      if (emailHienTai && db) {
        console.log("Đang bật tính năng đồng bộ thời gian thực cho:", emailHienTai);
        
        unsubscribe = onSnapshot(doc(db, "baocao_quanso", emailHienTai), (docSnap) => {
          if (docSnap.exists()) {
            const tongDuLieu = docSnap.data().duLieu;
            
            if (tongDuLieu) {
              // 🚩 Bật cờ: Báo cho App biết dữ liệu này là do MẠNG ĐANG ĐỔ XUỐNG, không phải do người dùng gõ
              dangCapNhatTuMang.current = true; 

              if (tongDuLieu.roster) setRoster(tongDuLieu.roster);
              if (tongDuLieu.dailyReports) setDailyReports(tongDuLieu.dailyReports);
              if (tongDuLieu.searchTerm) setSearchTerm(tongDuLieu.searchTerm);
              if (tongDuLieu.filterNote) setFilterNote(tongDuLieu.filterNote);
              if (tongDuLieu.editingId) setEditingId(tongDuLieu.editingId);
              if (tongDuLieu.editForm) setEditForm(tongDuLieu.editForm);
              
              console.log("⚡ Đã tải và đồng bộ dữ liệu mới nhất từ mạng xuống!");
            }
          }
          setIsLoaded(true); 
        });
      }
    };

    batLuanNgheRealtime();

//Tạo ra mắt hiện thị
const toggleProvinceCollapse = (province: string) => {
  setExpandedProvinces(prev => {
    const next = new Set(prev);
    if (next.has(province)) {
      next.delete(province);
    } else {
      next.add(province);
    }
    return next;
  });
};












































    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);





const [isLoaded, setIsLoaded] = useState(false); // Ban đầu chưa tải xong dữ liệu từ mạng về





  const [searchTerm, setSearchTerm] = useState("");
  const [filterNote, setFilterNote] = useState<string>("all");
  
  // State for inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Soldier | null>(null);

  // State for adding a new soldier
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState<Omit<Soldier, "id">>({
    name: "",
    rank: "B2",
    position: "Chiến sĩ",
    enlistmentDate: "",
    note: "Có mặt",
    unit: "Tiểu đội Bảo vệ 1", // Default unit
    dateOfBirth: "",
    education: "12/12",
    ethnicity: "Kinh",
    remark: "",
    cccd: "",
    youthUnionJoinDate: "",
    partyJoinDate: "",
    religion: "Không",
    hometown: "",
    currentResidence: "",
    fatherName: "",
    motherName: "",
    wifeName: "",
    numberOfChildren: "0",
    childOrder: "",
    contactPhone: "",
    rankReceivedDate: "",
    positionReceivedDate: "",
  });

  // State for Toast Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // State for collapsible sections in the roster table
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // State for expanded status row
  const [showStatusColumn, setShowStatusColumn] = useState(true);
  const [showActionsColumn, setShowActionsColumn] = useState(true);
  // Thêm state cho các cột mới
  const [showEnlistmentColumn, setShowEnlistmentColumn] = useState(true);
  const [showRankColumn, setShowRankColumn] = useState(true);
  const [showPositionColumn, setShowPositionColumn] = useState(true);
  const [showRemarkColumn, setShowRemarkColumn] = useState(true);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for import confirmation modal
  const [importFile, setImportFile] = useState<File | null>(null);

  // State for viewing historical reports
  const [viewingReport, setViewingReport] = useState<DailyReport | null>(null);

  // State for viewing soldier details
  const [viewingSoldier, setViewingSoldier] = useState<Soldier | null>(null);

  // State for editing within the soldier detail modal
  const [isModalEditing, setIsModalEditing] = useState(false);

  // State for collapsible summary sections
  const [collapsedSummarySections, setCollapsedSummarySections] = useState<Set<string>>(new Set(['BCHc', 'cBo', 'bBV1', 'bBV2']));

  // State for collapsible detailed summary section
  const [collapsedDetailedSummary, setCollapsedDetailedSummary] = useState(false);

  // State for the accordion in the detailed summary section
  const [activeSummaryAccordion, setActiveSummaryAccordion] = useState<string | null>(null);

  // NEW: State to track expanded provinces in the residence summary
  const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(new Set());

  // State for drill-down view from summary tables
  const [drillDownData, setDrillDownData] = useState<{ title: string; soldiers: Soldier[] } | null>(null);

  // State for user menu dropdown
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // State for searching historical daily reports
  const [historySearchDate, setHistorySearchDate] = useState<string>('');
  const [searchedReport, setSearchedReport] = useState<DailyReport | null>(null);


const [isDirty, setIsDirty] = useState(false);



  // NEW: Toggle collapse state for a province
  const toggleProvinceCollapse = (provinceName: string) => {
    setExpandedProvinces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(provinceName)) {
        newSet.delete(provinceName);
      } else {
        newSet.add(provinceName);
      }
      return newSet;
    });
  };


  // --- Data Persistence ---
  // Save roster to localStorage whenever it changes
  useEffect(() => {

  }, [roster]);

  // Save daily reports to localStorage whenever they change
  useEffect(() => {

  }, [dailyReports]);

  // --- Auto-save last day's report ---
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const savedReports = localStorage.getItem('dailyReports');
    const reports = savedReports ? JSON.parse(savedReports) : [];

    if (reports.length > 0) {
      const lastReportDateStr = reports[0].date;

      // If there's a last report and it's from a previous day
      if (lastReportDateStr && lastReportDateStr < todayStr) {
        const reportExists = reports.some((r: DailyReport) => r.date === lastReportDateStr);

        if (!reportExists) {
          const savedRoster = localStorage.getItem('militaryRoster');
          const lastRoster = savedRoster ? JSON.parse(savedRoster) : [];
          const lastDaySummary = calculateSummary(lastRoster);

          const lastDayReport: DailyReport = {
            date: lastReportDateStr,
            ...lastDaySummary
          };
          const updatedReports = [lastDayReport, ...reports].sort((a, b) => b.date.localeCompare(a.date));
          setDailyReports(updatedReports);
          triggerToast(`Đã tự động lưu báo cáo cho ngày ${new Date(lastReportDateStr).toLocaleDateString('vi-VN')}.`, "info");
        }
      }
    }
  // This effect should only run once on component mount to check for the day change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



// --- ĐOẠN CODE ĐỒNG BỘ LÊN ĐÁM MÂY (BƯỚC 3 CẬP NHẬT) ---
  const dongBoDuLieuToanDien = async () => {
    const emailHienTai = auth.currentUser?.email;

    if (!emailHienTai) {
      console.log("Hệ thống chưa nhận diện được tài khoản đăng nhập.");
      return; 
    }

    try {
      console.log("Đang tiến hành đồng bộ tất cả dữ liệu lên Firebase cho:", emailHienTai);
      // Gom tất cả các state cần lưu vào một object.
      // Quan trọng: Phải đảm bảo gửi cả những dữ liệu không thuộc trang này (ví dụ dutyReports)
      // để không bị ghi đè mất khi dùng { merge: true }
      await dongBoLenDamMay(emailHienTai, {
        roster: roster,
        dailyReports: dailyReports,
        // Thêm các state khác nếu có...
      });
      
      console.log("⚡ Đã đồng bộ toàn bộ dữ liệu ngầm thành công!");
    } catch (error) {
      console.error("Lỗi đồng bộ đám mây:", error);
    }
  };
// TỰ ĐỘNG NHẬN DIỆN MỌI SỬA ĐỔI (Thêm ngày sinh, sửa tên, đổi số vắng...)
  useEffect(() => {
  // Nếu chưa tải xong HOẶC không có gì thay đổi (isDirty = false) -> Thoát luôn
  if (!isLoaded || !isDirty) return; 

  const syncTimer = setTimeout(async () => {
    await dongBoDuLieuToanDien();
    setIsDirty(false); // Đặt lại về false sau khi lưu xong
  }, 1500);

  return () => clearTimeout(syncTimer);
}, [isDirty, roster, dailyReports, searchTerm, filterNote, isLoaded]);








  const triggerToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle collapse state for a summary section
  const toggleSummaryCollapse = (sectionName: string) => {
    setCollapsedSummarySections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  };

  // Toggle collapse state for a section
  const toggleCollapse = (sectionName: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  };

  // Handle Edit Actions
  const startEdit = (soldier: Soldier) => {
    setEditingId(soldier.id);
    setEditForm({ ...soldier });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm) return;
    if (!editForm.name.trim()) {
      triggerToast("Họ và tên không được để trống!", "info");
      return;
    }
    const updatedRoster = roster.map(s => s.id === editForm.id ? editForm : s);
    setRoster(updatedRoster);

    // If editing was done via modal, update the viewing soldier state as well
    if (viewingSoldier && viewingSoldier.id === editForm.id) {
      setViewingSoldier(editForm);
    }

    setEditingId(null);
    setEditForm(null);
    setIsModalEditing(false); // Ensure modal edit mode is turned off
    triggerToast(`Đã cập nhật thông tin quân nhân: ${editForm.name}`);
    setIsDirty(true); // Kích hoạt tự động đồng bộ
  };


  // Handle Add Action
  const handleAddSoldier = () => {
    if (!newForm.name.trim()) {
      triggerToast("Vui lòng nhập họ và tên!", "info");
      return;
    }
    
    const newId = (Math.max(...roster.map(s => parseInt(s.id) || 0), 0) + 1).toString();
    const formattedEnlistment = newForm.enlistmentDate.trim() || `${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
    
    const addedSoldier: Soldier = {
      id: newId,
      name: newForm.name.trim(),
      rank: newForm.rank,
      position: newForm.position,
      enlistmentDate: formattedEnlistment,
      note: newForm.note,
      unit: newForm.unit,
      remark: newForm.remark.trim(),
      dateOfBirth: newForm.dateOfBirth,
      education: newForm.education,
      ethnicity: newForm.ethnicity,
      cccd: newForm.cccd,
      youthUnionJoinDate: newForm.youthUnionJoinDate,
      partyJoinDate: newForm.partyJoinDate,
      religion: newForm.religion,
      hometown: newForm.hometown,
      currentResidence: newForm.currentResidence,
      fatherName: newForm.fatherName,
      motherName: newForm.motherName,
      wifeName: newForm.wifeName,
      numberOfChildren: newForm.numberOfChildren,
      childOrder: newForm.childOrder,
      contactPhone: newForm.contactPhone,
      rankReceivedDate: newForm.rankReceivedDate,
      positionReceivedDate: newForm.positionReceivedDate,
    };

    setRoster([...roster, addedSoldier]);
    setIsAdding(false);
    setNewForm({
      name: "",
      rank: "B2",
      position: "Chiến sĩ",
      enlistmentDate: "",
      note: "Có mặt",
      unit: "Tiểu đội Bảo vệ 1", // Reset to default
      dateOfBirth: "",
      education: "12/12",
      ethnicity: "Kinh",
      remark: "",
      cccd: "",
      youthUnionJoinDate: "",
      partyJoinDate: "",
      religion: "Không",
      hometown: "",
      currentResidence: "",
      fatherName: "",
      motherName: "",
      wifeName: "",
      numberOfChildren: "0",
      childOrder: "",
      contactPhone: "",
      rankReceivedDate: "",
      positionReceivedDate: "",
    });
    triggerToast(`Đã thêm mới quân nhân: ${addedSoldier.name}`);
    setIsDirty(true); // Kích hoạt tự động đồng bộ
  };

  // Handle Delete Action
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa quân nhân "${name}" khỏi biên chế?`)) {
      setRoster(roster.filter(s => s.id !== id));
      triggerToast(`Đã xóa quân nhân: ${name}`, "info");
      setIsDirty(true); // Kích hoạt tự động đồng bộ
    }
  };

  // Handle Excel file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
    // Reset the input value to allow re-selecting the same file
    if (event.target) {
      event.target.value = '';
    }
  };

  const processImportedFile = (mode: 'append' | 'replace' | 'selective-append') => {
    if (!importFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          throw new Error("Không tìm thấy sheet nào trong file Excel.");
        }

        // --- Bước 1: Xử lý các ô bị gộp (merged cells) một cách thông minh ---
        if (worksheet['!merges']) {
          worksheet['!merges'].forEach(merge => {
            const firstCellAddress = XLSX.utils.encode_cell({ r: merge.s.r, c: merge.s.c });
            const firstCell = worksheet[firstCellAddress];
            if (firstCell) {
              for (let row = merge.s.r; row <= merge.e.r; ++row) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: merge.s.c });
                // Chỉ điền vào các ô trống, không ghi đè dữ liệu đã có
                if (!worksheet[cellAddress]) {
                  worksheet[cellAddress] = { ...firstCell };
                }
              }
            }
          });
        }

        // --- Bước 2: Chuyển đổi sang JSON và chuẩn hóa tiêu đề ---
        const json = XLSX.utils.sheet_to_json<any>(worksheet, { raw: false });

        if (json.length === 0) {
          triggerToast("File Excel rỗng hoặc không có dữ liệu.", "info");
          return;
        }

        // --- Bước 3: Xử lý từng dòng với báo cáo lỗi chi tiết ---
        let maxId = (mode === 'append' || mode === 'selective-append') ? Math.max(...roster.map(s => parseInt(s.id) || 0), 0) : 0;
        const newSoldiers: Soldier[] = [];
        const skippedRows: { row: number, reason: string }[] = [];

        // Helper để tìm key một cách linh hoạt (không phân biệt hoa/thường, khoảng trắng)
        const findKey = (obj: any, keys: string[]) => {
          const objKeys = Object.keys(obj).reduce((acc, key) => {
            acc[key.trim().toLowerCase()] = key;
            return acc;
          }, {} as Record<string, string>);

          for (const key of keys) {
            const normalizedKey = key.trim().toLowerCase();
            if (objKeys[normalizedKey]) {
              return obj[objKeys[normalizedKey]];
            }
          }
          return undefined;
        };

        json.forEach((row, index) => {
          const name = String(findKey(row, ["họ và tên", "name"]) || "").trim();
          const rank = String(findKey(row, ["cấp bậc", "rank"]) || "").trim();
          const position = String(findKey(row, ["chức vụ", "position"]) || "").trim();
          const unit = String(findKey(row, ["đơn vị", "unit"]) || "").trim();
          const dateOfBirth = String(findKey(row, ["ngày sinh", "dateofbirth"]) || "").trim();
          const education = String(findKey(row, ["văn hóa", "education"]) || "").trim();
          const ethnicity = String(findKey(row, ["dân tộc", "ethnicity"]) || "").trim();
          const cccd = String(findKey(row, ["cccd", "số cccd"]) || "").trim();
          const youthUnionJoinDate = String(findKey(row, ["ngày vào đoàn", "youthunionjoindate"]) || "").trim();
          const partyJoinDate = String(findKey(row, ["ngày vào đảng", "partyjoindate"]) || "").trim();
          const religion = String(findKey(row, ["tôn giáo", "religion"]) || "").trim();
          const hometown = String(findKey(row, ["quê quán", "hometown"]) || "").trim();
          const currentResidence = String(findKey(row, ["trú quán", "currentresidence"]) || "").trim();
          const fatherName = String(findKey(row, ["họ tên cha", "fathername"]) || "").trim();
          const motherName = String(findKey(row, ["họ tên mẹ", "mothername"]) || "").trim();
          const wifeName = String(findKey(row, ["họ tên vợ", "wifename"]) || "").trim();
          const numberOfChildren = String(findKey(row, ["Gia đình có mấy con", "numberofchildren"]) || "").trim();
          const childOrder = String(findKey(row, ["con thứ mấy", "childorder"]) || "").trim();
          const contactPhone = String(findKey(row, ["SĐT liên hệ", "phone", "contactphone"]) || "").trim();
          const rankReceivedDate = String(findKey(row, ["ngày nhận cấp bậc", "rankreceiveddate"]) || "").trim();
          const positionReceivedDate = String(findKey(row, ["ngày nhận chức vụ", "positionreceiveddate"]) || "").trim();

          if (!name || !rank || !position || !unit) {
            skippedRows.push({ row: index + 2, reason: "Thiếu thông tin bắt buộc (Họ tên, Cấp bậc, Chức vụ, hoặc Đơn vị)." });
            return;
          }

          maxId++;
          const newSoldier: Soldier = {
            id: maxId.toString(),
            name,
            rank,
            position,
            unit,
            dateOfBirth,
            education,
            ethnicity,
            enlistmentDate: String(findKey(row, ["nhập ngũ", "enlistmentdate"]) || ""),
            note: String(findKey(row, ["trạng thái", "note"]) || "Có mặt").trim(),
            remark: String(findKey(row, ["ghi chú", "remark"]) || "").trim(),
            cccd,
            youthUnionJoinDate,
            partyJoinDate,
            religion,
            hometown,
            currentResidence,
            fatherName,
            motherName,
            wifeName,
            numberOfChildren,
            childOrder,
            contactPhone,
            rankReceivedDate,
            positionReceivedDate,
          };
          newSoldiers.push(newSoldier);
        });

        // --- Bước 4: Cập nhật state và đưa ra phản hồi cho người dùng ---
        let feedbackMessage = "";

        if (mode === 'selective-append') {
          const existingNames = new Set(roster.map(s => s.name.trim().toLowerCase()));
          const trulyNewSoldiers = newSoldiers.filter(s => !existingNames.has(s.name.trim().toLowerCase()));
          
          if (trulyNewSoldiers.length > 0) {
            setRoster(prevRoster => [...prevRoster, ...trulyNewSoldiers]);
              setIsDirty(true);// Kích hoạt tự đồng bộ          
            feedbackMessage = `Đã bổ sung chọn lọc ${trulyNewSoldiers.length} quân nhân mới. `;
            const duplicateCount = newSoldiers.length - trulyNewSoldiers.length;
            if (duplicateCount > 0) {
              feedbackMessage += `${duplicateCount} quân nhân đã tồn tại và được bỏ qua.`;
            }  setIsDirty(true);// Kích hoạt tự đồng bộ
          } else if (newSoldiers.length > 0) {
            feedbackMessage = "Tất cả quân nhân trong file đã có trong danh sách. Không có gì được thêm.";
          }
        } else if (newSoldiers.length > 0) { // Append or Replace
          if (mode === 'replace') {
            setRoster(newSoldiers);
          } else { // append
            setRoster(prevRoster => [...prevRoster, ...newSoldiers]);
          }
            setIsDirty(true);// Kích hoạt tự đồng bộ

          feedbackMessage = `Đã nhập thành công ${newSoldiers.length} quân nhân. `;
        }

        if (skippedRows.length > 0) {
          feedbackMessage += `Đã bỏ qua ${skippedRows.length} dòng do lỗi.`;
          console.warn("Các dòng bị bỏ qua:", skippedRows);
        }

        if (feedbackMessage) {
          triggerToast(feedbackMessage, newSoldiers.length > 0 && mode !== 'selective-append' ? "success" : "info");
        } else {
          triggerToast("Không có quân nhân hợp lệ nào được tìm thấy trong file.", "info");
        }
      } catch (error) {
        console.error("Lỗi khi đọc file Excel:", error);
        triggerToast("Đã xảy ra lỗi khi xử lý file Excel.", "info");
      }
    };
    reader.readAsArrayBuffer(importFile);
    // Close the modal after processing
    setImportFile(null);
  };
  
  // Save the current summary as a daily report
  const saveDailyReport = () => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const existingReportIndex = dailyReports.findIndex(r => r.date === today);

    const reportData: DailyReport = {
      date: today,
      ...summaryReport
    };
    
    if (existingReportIndex !== -1) {
      if (confirm(`Báo cáo cho ngày hôm nay đã tồn tại. Bạn có muốn cập nhật lại không?`)) {
        const updatedReports = [...dailyReports];
        updatedReports[existingReportIndex] = reportData;
        setDailyReports(updatedReports);
        setIsDirty(true); // Kích hoạt tự động đồng bộ
        triggerToast("Đã cập nhật báo cáo ngày hôm nay.");
      }
    } else {
      setDailyReports(prev => [reportData, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
      setIsDirty(true); // Kích hoạt tự động đồng bộ khi tạo báo cáo mới
      triggerToast("Đã lưu báo cáo ngày hôm nay.");
    }
  };

  // Filtered Roster for presentation
  const filteredRoster = useMemo(() => {
    return roster.filter(soldier => {
      const matchesSearch = 
        soldier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        soldier.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
        soldier.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        soldier.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        soldier.enlistmentDate.includes(searchTerm) ||
        soldier.remark.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterNote === "all") return matchesSearch;
      if (filterNote === "Có mặt") return matchesSearch && (soldier.note === "Có mặt" || !soldier.note);
      if (filterNote === "Vắng mặt") return matchesSearch && soldier.note !== "Có mặt" && soldier.note;
      return matchesSearch && soldier.note === filterNote;
    });
  }, [roster, searchTerm, filterNote]);

  // Helper function to calculate summary, can be reused.
  const calculateSummary = (rosterData: Soldier[]) => {
    const total = rosterData.length;

    // "Diện mặt" is those whose note is "Có mặt" or empty (we treat empty as present)
    const presentCount = roster.filter(s => s.note === "Có mặt" || !s.note).length;
    const absentCount = total - presentCount;

    // Helper function to get unit abbreviation
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

    // Detailed breakdown of absent military personnel grouped by category
    const absentDetails: { [key: string]: string[] } = {};
    roster.forEach(s => {
      if (s.note && s.note !== "Có mặt") {
        if (!absentDetails[s.note]) {
          absentDetails[s.note] = [];
        }
        // Format: Rank Name (UnitAbbreviation)
        let detail = `${s.rank} ${s.name} (${getUnitAbbreviation(s.unit)})`;
        if (s.remark) {
          detail += `: ${s.remark}`;
        }
        absentDetails[s.note].push(detail);
      }
    });

    // Create readable note for each absent category
    const notesArray = Object.entries(absentDetails).map(([reason, personnel]) => {
      return `${reason}: ${personnel.length} đ/c (${personnel.join(", ")})`;
    });

    return {
      total,
      present: presentCount,
      absent: absentCount,
      notes: notesArray.length > 0 ? notesArray.join("; ") : "Quân số đầy đủ, sẵn sàng chiến đấu."
    };
  };

  // Calculations for Summary Board
  const summaryReport = useMemo(() => {
    return calculateSummary(roster);
  }, [roster]);

  // Helper function for unit summaries
  const calculateUnitSummary = (rosterData: Soldier[], unitNames: string[]) => {
    const unitSoldiers = rosterData.filter(s => unitNames.some(un => s.unit === un));
    const total = unitSoldiers.length;
    const present = unitSoldiers.filter(s => s.note === "Có mặt" || !s.note).length;
    const absent = total - present;
    return { total, present, absent };
  };

  // Separate memo for unit summaries to avoid recalculating them when viewing historical reports
  const unitSummaries = useMemo(() => {
    return {
      BCHc: calculateUnitSummary(roster, ["Ban chỉ huy Đại đội"]),
      cBo: calculateUnitSummary(roster, ["Đại đội bộ"]),
      bBV1: calculateUnitSummary(roster, ["Trung đội Bảo vệ 1", "Tiểu đội Bảo vệ 1", "Tiểu đội Bảo vệ 2", "Tiểu đội Bảo vệ 3"]),
      bBV2: calculateUnitSummary(roster, ["Trung đội Bảo vệ 2", "Tiểu đội Bảo vệ 4", "Tiểu đội Bảo vệ 5", "Tiểu đội Bảo vệ 6"]),
    }
  }, [roster]);

  // Detailed Summary (Rank, Enlistment, Position counts)
  const detailedSummary = useMemo(() => {
    const rankCounts: { [key: string]: number } = {};
    const enlistmentCounts: { [key: string]: number } = {};
    const positionCounts: { [key: string]: number } = {};
    const unitCounts: { [key: string]: number } = {};
    const educationCounts: { [key: string]: number } = {};
    const ethnicityCounts: { [key: string]: number } = {};
    const religionCounts: { [key: string]: number } = {};
    const residenceCounts: { [key: string]: { total: number; districts: { [key: string]: number } } } = {};
    
    // --- NEW: Group date of birth by year ---
    const dateOfBirthCounts: { [key: string]: number } = {};

    // --- NEW: Group enlistment by year ---
    const enlistmentYearCounts: { [key: string]: number } = {};

    // Khởi tạo tất cả các đơn vị với số lượng là 0
    UNITS.forEach(unit => unitCounts[unit] = 0);
    
    roster.forEach(soldier => {
      rankCounts[soldier.rank] = (rankCounts[soldier.rank] || 0) + 1;
      // Use 'Chưa có' for empty fields to group them
      const education = soldier.education?.trim() || 'Chưa có';
      const ethnicity = soldier.ethnicity?.trim() || 'Chưa có';
      const religion = soldier.religion?.trim() || 'Chưa có';
      educationCounts[education] = (educationCounts[education] || 0) + 1;
      ethnicityCounts[ethnicity] = (ethnicityCounts[ethnicity] || 0) + 1;
      religionCounts[religion] = (religionCounts[religion] || 0) + 1;

      // Logic for residence statistics by province
      const residenceStr = soldier.currentResidence?.trim();
      if (residenceStr) {
        const parts = residenceStr.split(',').map(p => p.trim());
        const province = parts.length > 1 ? parts[parts.length - 1] : residenceStr; // Tỉnh
        const district = parts.length > 1 ? parts[parts.length - 2] : 'Chưa rõ huyện'; // Huyện

        if (!residenceCounts[province]) {
          residenceCounts[province] = { total: 0, districts: {} };
        }
        residenceCounts[province].total++;
        residenceCounts[province].districts[district] = (residenceCounts[province].districts[district] || 0) + 1;
      } else {
        if (!residenceCounts['Chưa có']) {
          residenceCounts['Chưa có'] = { total: 0, districts: {} };
        }
        residenceCounts['Chưa có'].total++;
      }

      // --- NEW: Logic to group date of birth by year ---
      if (soldier.dateOfBirth) {
        const yearMatch = soldier.dateOfBirth.match(/\d{4}/);
        const year = yearMatch ? yearMatch[0] : 'Chưa rõ';
        const yearKey = `Năm ${year}`;
        dateOfBirthCounts[yearKey] = (dateOfBirthCounts[yearKey] || 0) + 1;
      } else {
        dateOfBirthCounts['Chưa có'] = (dateOfBirthCounts['Chưa có'] || 0) + 1;
      }

      // --- NEW: Logic to group enlistment by year ---
      if (soldier.enlistmentDate) {
        const yearMatch = soldier.enlistmentDate.match(/\d{4}/);
        const year = yearMatch ? yearMatch[0] : 'Chưa rõ';
        const yearKey = `Năm ${year}`;
        enlistmentYearCounts[yearKey] = (enlistmentYearCounts[yearKey] || 0) + 1;
      } else {
        enlistmentYearCounts['Chưa có'] = (enlistmentYearCounts['Chưa có'] || 0) + 1;
      }

      positionCounts[soldier.position] = (positionCounts[soldier.position] || 0) + 1;
      
      // Đếm cho đơn vị trực tiếp
      if (unitCounts.hasOwnProperty(soldier.unit)) {
        unitCounts[soldier.unit]++;
      }

      // Cộng dồn cho Trung đội chủ quản nếu là Tiểu đội
      if (soldier.unit.startsWith("Tiểu đội Bảo vệ 1") || soldier.unit.startsWith("Tiểu đội Bảo vệ 2") || soldier.unit.startsWith("Tiểu đội Bảo vệ 3")) {
        unitCounts["Trung đội Bảo vệ 1"]++;
      } else if (soldier.unit.startsWith("Tiểu đội Bảo vệ 4") || soldier.unit.startsWith("Tiểu đội Bảo vệ 5") || soldier.unit.startsWith("Tiểu đội Bảo vệ 6")) {
        unitCounts["Trung đội Bảo vệ 2"]++;
      }
    });

    // Sort for consistent display
    const sortedRankCounts = Object.entries(rankCounts).sort(([rankA], [rankB]) => RANKS.indexOf(rankA) - RANKS.indexOf(rankB));
    // --- NEW: Sort enlistment by year descending ---
    const sortedEnlistmentCounts = Object.entries(enlistmentYearCounts).sort(([yearA], [yearB]) => {
      return (parseInt(yearB.split(' ')[1]) || 0) - (parseInt(yearA.split(' ')[1]) || 0);
    });
    const sortedPositionCounts = Object.entries(positionCounts).sort(([posA], [posB]) => POSITIONS.indexOf(posA) - POSITIONS.indexOf(posB));
    const sortedEducationCounts = Object.entries(educationCounts).sort(([a], [b]) => a.localeCompare(b));
    const sortedEthnicityCounts = Object.entries(ethnicityCounts).sort(([a], [b]) => a.localeCompare(b));
    const sortedReligionCounts = Object.entries(religionCounts).sort(([a], [b]) => a.localeCompare(b));
    const sortedResidenceCounts = Object.entries(residenceCounts).sort(([a], [b]) => a.localeCompare(b));
    const sortedDateOfBirthCounts = Object.entries(dateOfBirthCounts).sort(([yearA], [yearB]) => {
      return (parseInt(yearB.split(' ')[1]) || 0) - (parseInt(yearA.split(' ')[1]) || 0);
    });
    const sortedUnitCounts = Object.entries(unitCounts).sort(([unitA], [unitB]) => {
      const indexA = UNITS.indexOf(unitA);
      const indexB = UNITS.indexOf(unitB);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return unitA.localeCompare(unitB);
    });

    return {
      rank: sortedRankCounts,
      enlistment: sortedEnlistmentCounts,
      position: sortedPositionCounts,
      unit: sortedUnitCounts,
      education: sortedEducationCounts,
      ethnicity: sortedEthnicityCounts,
      religion: sortedReligionCounts,
      residence: sortedResidenceCounts,
      dateOfBirth: sortedDateOfBirthCounts,
    };
  }, [roster]);

  // Handle click on a summary item to show detailed list
  const handleSummaryDrillDown = (key: string, value: string, title: string) => {
    let filteredSoldiers: Soldier[] = [];
    let drillDownTitle = ""; // Sẽ được đặt lại bên dưới

    switch (key) {
     case 'residence':
  const [province, district] = value.split('__SUB__');
  drillDownTitle = district ? `${title}: ${district}, ${province}` : `${title}: ${province}`;
  
  filteredSoldiers = roster.filter(s => {
    const residence = s.currentResidence?.trim();

    // 1. Trường hợp đặc biệt "Chưa có"
    if (province === 'Chưa có') return !residence;
    if (!residence) return false;

    // 2. Phân tách địa chỉ từ dữ liệu chiến sĩ
    const parts = residence.split(',').map(p => p.trim());
    const s_province = parts.length > 1 ? parts[parts.length - 1] : residence;
    const s_district = parts.length > 1 ? parts[parts.length - 2] : 'Chưa rõ huyện';

    // 3. Logic lọc
    if (district) {
      return s_province === province && s_district === district;
    } else {
      return s_province === province;
    }
  });
  break;
      case 'unit':
        // If a platoon is clicked, include its squads
        if (value.startsWith("Trung đội")) {
          // Lấy tất cả các tiểu đội thuộc trung đội đó
          const platoonSquads = UNITS.filter(u => u.startsWith("Tiểu đội") && u.includes(value.slice(-1)));
          const unitsToFilter = [value, ...platoonSquads];
          filteredSoldiers = roster.filter(s => unitsToFilter.includes(s.unit));
        } else {
          // For other units (squads, BCH, etc.), filter directly
          // Đối với các đơn vị khác (tiểu đội, Ban chỉ huy, v.v.), lọc trực tiếp
          filteredSoldiers = roster.filter(s => s.unit === value);
        }
        break;
      case 'enlistment':
        const year = value.replace('Năm ', '');
        if (year === 'Chưa có') {
          filteredSoldiers = roster.filter(s => !s.enlistmentDate);
        } else {
          filteredSoldiers = roster.filter(s => s.enlistmentDate && s.enlistmentDate.includes(year));
        }
        break;
      case 'dateOfBirth':
        const dobYear = value.replace('Năm ', '');
        if (dobYear === 'Chưa có') {
          filteredSoldiers = roster.filter(s => !s.dateOfBirth);
        } else {
          filteredSoldiers = roster.filter(s => s.dateOfBirth && s.dateOfBirth.includes(dobYear));
        }
        break;
      default:
        // Generic filter for rank, position, education, etc.
        filteredSoldiers = roster.filter(s => {
          const soldierValue = s[key as keyof Soldier] as string | undefined;
          if (value === 'Chưa có') {
            return !soldierValue || soldierValue.trim() === '';
          }
          return soldierValue === value;
        });
        break;
    }

    setDrillDownData({
      title: drillDownTitle,
      soldiers: filteredSoldiers,
    });
  };


  const reportToDisplay = viewingReport || summaryReport;

  // Generate Markdown Tables
  const markdownText = useMemo(() => {
    let md = "### 1. DANH SÁCH BIÊN CHẾ QUÂN SỐ\n\n";
    md += "| STT | Họ và tên | Cấp bậc | Chức vụ | Đơn vị | Nhập ngũ | Trạng thái | Ghi chú |\n";
    md += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n";
    
    roster.forEach((s, idx) => {
      md += `| ${idx + 1} | ${s.name} | ${s.rank} | ${s.position} | ${s.unit} | ${s.enlistmentDate} | ${s.note || "Có mặt"} | ${s.remark || ""} |\n`;
    });

    md += "\n### 2. BẢNG TỔNG HỢP BÁO CÁO QUÂN SỐ\n\n";
    md += "| STT | Nội dung | Số lượng | Ghi chú |\n";
    md += "| :--- | :--- | :--- | :--- |\n";
    md += `| 1 | Tổng quân số | ${summaryReport.total} đồng chí | Toàn đơn vị |\n`;
    md += `| 2 | Diện mặt (Có mặt) | ${summaryReport.present} đồng chí | Sẵn sàng thực hiện nhiệm vụ |\n`;
    md += `| 3 | Vắng mặt | ${summaryReport.absent} đồng chí | ${summaryReport.notes} |\n`;

    return md;
  }, [roster, summaryReport]);

  const copyMarkdownToClipboard = () => {
    navigator.clipboard.writeText(markdownText);
    triggerToast("Đã sao chép bảng Markdown vào bộ nhớ tạm!");
  };

  const handlePrint = () => {
    window.print();
  };

  const DrillDownModal = () => (
    <AnimatePresence>
      {drillDownData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
          onClick={() => setDrillDownData(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                  <Users className="w-6 h-6 text-emerald-600" />
                  <span>{drillDownData.title}</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Tổng số: {drillDownData.soldiers.length} đồng chí
                </p>
              </div>
              <button onClick={() => setDrillDownData(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 max-h-[60vh] overflow-y-auto border rounded-lg">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="sticky top-0 bg-slate-100">
                  <tr className="text-slate-700 font-bold">
                    <th className="p-3 border-b border-slate-200 text-center w-12">STT</th>
                    <th className="p-3 border-b border-slate-200">Họ và tên</th>
                    <th className="p-3 border-b border-slate-200 text-center">Cấp bậc</th>
                    <th className="p-3 border-b border-slate-200">Chức vụ</th>
                    <th className="p-3 border-b border-slate-200">Đơn vị</th>
                  </tr>
                </thead>
                <tbody>
                  {drillDownData.soldiers.map((soldier, index) => (
                    <tr key={soldier.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
                      <td className="p-2.5 text-center font-mono">{index + 1}</td>
                      <td className="p-2.5 font-medium text-slate-800">
                        {/* Thêm tính năng nhấn vào tên để xem chi tiết */}
                        <span onClick={() => setViewingSoldier(soldier)} className="cursor-pointer hover:text-emerald-700 hover:underline">
                          {soldier.name}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">{soldier.rank}</td>
                      <td className="p-2.5">{soldier.position}</td>
                      <td className="p-2.5">{soldier.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => setDrillDownData(null)} className="w-full text-center text-sm text-slate-500 hover:text-slate-800 mt-6 pt-4 border-t border-slate-200">Đóng</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 border text-sm font-medium ${
              toast.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drill-down Modal */}
      <DrillDownModal />

      {/* Import Confirmation Modal */}
      <AnimatePresence>
        {importFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Xác nhận nhập dữ liệu</span>
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Bạn muốn làm gì với dữ liệu từ file <span className="font-semibold text-slate-800">{importFile.name}</span>?
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3">
                <button
                  onClick={() => processImportedFile('append')}
                  className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-lg font-semibold transition"
                >
                  <FilePlus className="w-5 h-5" />
                  <span>Bổ sung tất cả</span>
                </button>
                <button
                  onClick={() => processImportedFile('selective-append')}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold transition"
                >
                  <FileDiff className="w-5 h-5" />
                  <span>Bổ sung chọn lọc (Chống trùng)</span>
                </button>
                <button
                  onClick={() => processImportedFile('replace')}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg font-semibold transition"
                >
                  <Replace className="w-5 h-5" />
                  <span>Thay thế toàn bộ</span>
                </button>
              </div>
              <button onClick={() => setImportFile(null)} className="w-full text-center text-sm text-slate-500 hover:text-slate-800 mt-4">Hủy bỏ</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Soldier Detail Modal */}
      <AnimatePresence>
        {viewingSoldier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
            onClick={() => {
              setViewingSoldier(null);
              setIsModalEditing(false); // Reset edit state on close
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }} // Increased max-width
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                    <BookUser className="w-6 h-6 text-emerald-600" />
                    <span>Chi tiết quân nhân</span>
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Thông tin trích ngang của <span className="font-semibold">{isModalEditing ? editForm?.name : viewingSoldier.name}</span></p>
                </div>
                <div className="flex items-center space-x-2">
                  {!isModalEditing ? (
                    <button 
                      onClick={() => {
                        setIsModalEditing(true);
                        setEditForm(viewingSoldier);
                      }} 
                      className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                       <button 
                        onClick={saveEdit} 
                        className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Lưu</span>
                      </button>
                      <button 
                        onClick={() => {
                          setIsModalEditing(false);
                          setEditForm(null);
                        }} 
                        className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Hủy</span>
                      </button>
                    </div>
                  )}
                  <button onClick={() => { setViewingSoldier(null); setIsModalEditing(false); }} className="p-1.5 text-slate-400 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {isModalEditing && editForm ? (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                  {/* Column 1: Basic & Military Info */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-600 border-b pb-1 mb-2">Thông tin cơ bản</h4>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Họ và tên</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Ngày sinh</label><input type="text" value={editForm.dateOfBirth} onChange={e => setEditForm({...editForm, dateOfBirth: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Số CCCD</label><input type="text" value={editForm.cccd} onChange={e => setEditForm({...editForm, cccd: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Quê quán</label><input type="text" value={editForm.hometown} onChange={e => setEditForm({...editForm, hometown: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Trú quán</label><input type="text" value={editForm.currentResidence} onChange={e => setEditForm({...editForm, currentResidence: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    
                    <h4 className="font-bold text-slate-600 border-b pb-1 mb-2 pt-4">Trình độ & Chính trị</h4>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Dân tộc</label><input type="text" value={editForm.ethnicity} onChange={e => setEditForm({...editForm, ethnicity: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Tôn giáo</label><input type="text" value={editForm.religion} onChange={e => setEditForm({...editForm, religion: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Văn hóa</label><input type="text" value={editForm.education} onChange={e => setEditForm({...editForm, education: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Ngày vào Đoàn</label><input type="text" value={editForm.youthUnionJoinDate} onChange={e => setEditForm({...editForm, youthUnionJoinDate: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Ngày vào Đảng</label><input type="text" value={editForm.partyJoinDate} onChange={e => setEditForm({...editForm, partyJoinDate: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                  </div>

                  {/* Column 2: Military Career */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-600 border-b pb-1 mb-2">Quá trình công tác</h4>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Đơn vị</label>
                      <select value={editForm.unit} onChange={e => setEditForm({...editForm, unit: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500">
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Cấp bậc</label>
                      <select value={editForm.rank} onChange={e => setEditForm({...editForm, rank: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500">
                        {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Ngày nhận CB</label><input type="text" value={editForm.rankReceivedDate} onChange={e => setEditForm({...editForm, rankReceivedDate: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Chức vụ</label>
                      <select value={editForm.position} onChange={e => setEditForm({...editForm, position: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500">
                        {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Ngày nhận CV</label><input type="text" value={editForm.positionReceivedDate} onChange={e => setEditForm({...editForm, positionReceivedDate: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Ngày nhập ngũ</label><input type="text" value={editForm.enlistmentDate} onChange={e => setEditForm({...editForm, enlistmentDate: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    
                    <h4 className="font-bold text-slate-600 border-b pb-1 mb-2 pt-4">Trạng thái hiện tại</h4>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Trạng thái</label>
                      <select value={editForm.note} onChange={e => setEditForm({...editForm, note: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500">
                        {NOTES_PRESETS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 items-start"><label className="text-slate-500 col-span-1 mt-1">Ghi chú</label><textarea value={editForm.remark} onChange={e => setEditForm({...editForm, remark: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" rows={2}></textarea></div>
                  </div>

                  {/* Column 3: Family */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-600 border-b pb-1 mb-2">Thông tin gia đình</h4>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Họ tên cha</label><input type="text" value={editForm.fatherName} onChange={e => setEditForm({...editForm, fatherName: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Họ tên mẹ</label><input type="text" value={editForm.motherName} onChange={e => setEditForm({...editForm, motherName: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Họ tên vợ</label><input type="text" value={editForm.wifeName} onChange={e => setEditForm({...editForm, wifeName: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Số con</label><input type="text" value={editForm.numberOfChildren} onChange={e => setEditForm({...editForm, numberOfChildren: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">Con thứ mấy</label><input type="text" value={editForm.childOrder} onChange={e => setEditForm({...editForm, childOrder: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                    <div className="grid grid-cols-3 items-center"><label className="text-slate-500 col-span-1">SĐT liên hệ</label><input type="text" value={editForm.contactPhone} onChange={e => setEditForm({...editForm, contactPhone: e.target.value})} className="col-span-2 w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-emerald-500" /></div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                  {/* Column 1: Basic & Military Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-600 border-b pb-1 mb-2">Thông tin cơ bản</h4>
                    <div><strong className="text-slate-500 w-28 inline-block">Họ và tên:</strong> <span className="font-semibold text-slate-800">{viewingSoldier.name}</span></div>
                    <div><strong className="text-slate-500 w-28 inline-block">Ngày sinh:</strong> {viewingSoldier.dateOfBirth || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Số CCCD:</strong> {viewingSoldier.cccd || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Quê quán:</strong> {viewingSoldier.hometown || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Trú quán:</strong> {viewingSoldier.currentResidence || <i className="text-slate-400">Chưa có</i>}</div>
                    
                    <h4 className="font-bold text-slate-600 border-b pb-1 mb-2 pt-4">Trình độ & Chính trị</h4>
                    <div><strong className="text-slate-500 w-28 inline-block">Dân tộc:</strong> {viewingSoldier.ethnicity || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Tôn giáo:</strong> {viewingSoldier.religion || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Văn hóa:</strong> {viewingSoldier.education || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Ngày vào Đoàn:</strong> {viewingSoldier.youthUnionJoinDate || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Ngày vào Đảng:</strong> {viewingSoldier.partyJoinDate || <i className="text-slate-400">Chưa có</i>}</div>
                  </div>

                  {/* Column 2: Military Career */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-600 border-b pb-1 mb-2">Quá trình công tác</h4>
                    <div><strong className="text-slate-500 w-28 inline-block">Đơn vị:</strong> {viewingSoldier.unit}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Cấp bậc:</strong> {viewingSoldier.rank}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Ngày nhận CB:</strong> {viewingSoldier.rankReceivedDate || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Chức vụ:</strong> {viewingSoldier.position}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Ngày nhận CV:</strong> {viewingSoldier.positionReceivedDate || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Ngày nhập ngũ:</strong> {viewingSoldier.enlistmentDate || <i className="text-slate-400">Chưa có</i>}</div>
                    
                    <h4 className="font-bold text-slate-600 border-b pb-1 mb-2 pt-4">Trạng thái hiện tại</h4>
                    <div><strong className="text-slate-500 w-28 inline-block">Trạng thái:</strong> 
                      <span className={`font-semibold ${viewingSoldier.note === "Có mặt" || !viewingSoldier.note ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {viewingSoldier.note || "Có mặt"}
                      </span>
                    </div>
                    <div><strong className="text-slate-500 w-28 inline-block align-top">Ghi chú:</strong> <span className="inline-block max-w-[calc(100%-8rem)]">{viewingSoldier.remark || <i className="text-slate-400">Không có</i>}</span></div>
                  </div>

                  {/* Column 3: Family */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-600 border-b pb-1 mb-2">Thông tin gia đình</h4>
                    <div><strong className="text-slate-500 w-28 inline-block">Họ tên cha:</strong> {viewingSoldier.fatherName || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Họ tên mẹ:</strong> {viewingSoldier.motherName || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Họ tên vợ:</strong> {viewingSoldier.wifeName || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Gia đình có mấy con:</strong> {viewingSoldier.numberOfChildren || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">Con thứ mấy:</strong> {viewingSoldier.childOrder || <i className="text-slate-400">Chưa có</i>}</div>
                    <div><strong className="text-slate-500 w-28 inline-block">SĐT liên hệ:</strong> {viewingSoldier.contactPhone || <i className="text-slate-400">Chưa có</i>}</div>
                  </div>
                </div>
              )}

              <button onClick={() => { setViewingSoldier(null); setIsModalEditing(false); }} className="w-full text-center text-sm text-slate-500 hover:text-slate-800 mt-6 pt-4 border-t border-slate-200">Đóng</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

         // Trong file DashboardPage.tsx
          <HeaderDashboard 
           user={user} 
           onLogout={onLogout} 
          copyMarkdownToClipboard={copyMarkdownToClipboard} 
          handlePrint={handlePrint} 
           isUserMenuOpen={isUserMenuOpen} 
           setIsUserMenuOpen={setIsUserMenuOpen} 
            />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 print:w-[16cm] print:mx-auto">
        
         {/* Bảng tổng hợp quân số*/}
        <Bangtonghopquanso 
  reportToDisplay={reportToDisplay}
  viewingReport={viewingReport}
  collapsedSummarySections={collapsedSummarySections}
  toggleSummaryCollapse={toggleSummaryCollapse}
  unitSummaries={unitSummaries}
  roster={roster}
  saveDailyReport={saveDailyReport}
  dailyReports={dailyReports}
  setViewingReport={setViewingReport}
  historySearchDate={historySearchDate}
  setHistorySearchDate={setHistorySearchDate}
  setSearchedReport={setSearchedReport}
  searchedReport={searchedReport}
/>
 {/* Bảng tổng hợp quân số*/}


{/* Danh sách biên chế*/}
<Danhsachbienche
  // Dữ liệu
  roster={roster}
  filteredRoster={filteredRoster}
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  filterNote={filterNote}
  setFilterNote={setFilterNote}
   // State cho Form & Editing
  newForm={newForm}
  setNewForm={setNewForm}
  editForm={editForm}
  setEditForm={setEditForm}
  editingId={editingId}
  isAdding={isAdding}
  setIsAdding={setIsAdding}
  
  // State hiển thị cột
  showEnlistmentColumn={showEnlistmentColumn}
  showRankColumn={showRankColumn}
  showPositionColumn={showPositionColumn}
  showRemarkColumn={showRemarkColumn}
  showStatusColumn={showStatusColumn}
  showActionsColumn={showActionsColumn}
  // Hàm để hiện ẩn các cột
  setShowActionsColumn={setShowActionsColumn}
 setShowEnlistmentColumn={setShowEnlistmentColumn}
 setShowRankColumn={setShowRankColumn}
 setShowPositionColumn={setShowPositionColumn}
 setShowRemarkColumn={setShowRemarkColumn}
 setShowStatusColumn={setShowStatusColumn}









  
  // Các hàm chức năng
  handleAddSoldier={handleAddSoldier}
  handleDelete={handleDelete}
  startEdit={startEdit}
  saveEdit={saveEdit}
  cancelEdit={cancelEdit}
  setViewingSoldier={setViewingSoldier}
  toggleCollapse={toggleCollapse}
  collapsedSections={collapsedSections}
  
  // Constants
  RANKS={RANKS}
  POSITIONS={POSITIONS}
  NOTES_PRESETS={NOTES_PRESETS}
/>
{/* Danh sách biên chế*/}



{/* Thống kê quân số*/}
<Thongkequanso
  collapsedDetailedSummary={collapsedDetailedSummary}
  setCollapsedDetailedSummary={setCollapsedDetailedSummary}
  activeSummaryAccordion={activeSummaryAccordion}
  setActiveSummaryAccordion={setActiveSummaryAccordion}
  expandedProvinces={expandedProvinces}
  toggleProvinceCollapse={toggleProvinceCollapse}
  handleSummaryDrillDown={handleSummaryDrillDown}
  detailedSummary={detailedSummary}
/>
{/* Thống kê quân số*/}
      </main>

      {/* Footer decoration */}
      <footer className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 border-t border-slate-200 pt-6 mt-12 print:hidden"></footer>
    </div>
  );
}
