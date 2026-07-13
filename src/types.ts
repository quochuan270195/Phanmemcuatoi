
export interface Soldier {
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

export const RANKS = ["1//", "4/", "3/", "2/", "1/", "H3", "H2", "H1", "B1", "B2"];
export const POSITIONS = ["Đại đội trưởng", "Chính trị viên", "Phó Đại đội trưởng", "Trung đội trưởng", "Tiểu đội trưởng", "Nhân viên Quân y", "Nhân viên Quản lý", "Liên lạc", "Chiến sĩ"];
export const NOTES_PRESETS = [
  { value: "Có mặt", label: "Có mặt" },
  { value: "Phép", label: "Vắng: Phép" },
  { value: "Tranh thủ", label: "Vắng: Tranh thủ" },
  { value: "Công tác", label: "Vắng: Công tác" },
  { value: "Học", label: "Vắng: Học" },
  { value: "Viện", label: "Vắng: Viện" },
  { value: "Bệnh xá", label: "Vắng: Bệnh xá" },
  { value: "Tăng cường", label: "Vắng: Tăng cường" }
];
export const UNITS: string[] = [
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

export const INITIAL_ROSTER: Soldier[] = [];
export interface User {
  name: string;
  email: string;
  }