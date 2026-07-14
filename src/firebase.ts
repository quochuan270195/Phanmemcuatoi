// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Thêm các hàm cho Storage
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; // Thêm updateDoc

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyC5Ey06vce8Sl0cSq_HkwnuFzfjJfkFhYE",
  authDomain: "phanmemcuatoi-270195.firebaseapp.com",
  projectId: "phanmemcuatoi-270195",
  storageBucket: "phanmemcuatoi-270195.firebasestorage.app",
  messagingSenderId: "117899702289",
  appId: "1:117899702289:web:18af2a8cd9342e019701b0",
  measurementId: "G-LCNQMEQFRK"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export các dịch vụ để sử dụng ở các file khác
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Khởi tạo và export Storage

// 🎯 HÀM MỚI: TẢI FILE LÊN STORAGE VÀ LẤY URL
export const uploadFileAndGetURL = async (file: File, path: string): Promise<string> => {
  if (!file) throw new Error("Không có file để tải lên.");
  
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};


// 🎯 HÀM 1: ĐỒNG BỘ DỮ LIỆU LÊN ĐÁM MÂY (Gọi hàm này khi bạn ấn nút "Lưu" hoặc "Cập nhật")
export const dongBoLenDamMay = async (userEmail: string, dataQuanSo: any) => {
  if (!userEmail) return;
  try {
    // Lưu vào bộ sưu tập đặt tên là 'baocao_quanso', mỗi Gmail là 1 bản ghi riêng biệt
    // Sử dụng { merge: true } để chỉ cập nhật các trường được cung cấp, không ghi đè toàn bộ tài liệu.
    // Điều này rất quan trọng khi cập nhật từ các trang khác nhau.
    const docRef = doc(db, "baocao_quanso", userEmail);
    
    // 💡 GIẢI PHÁP: Chuyển đổi đối tượng đầu vào thành dạng "dot notation"
    // để cập nhật các trường con bên trong 'duLieu' mà không ghi đè toàn bộ.
    // Ví dụ: { roster: [...] } -> { "duLieu.roster": [...] }
    const updates: { [key: string]: any } = {};
    for (const key in dataQuanSo) {
      if (Object.prototype.hasOwnProperty.call(dataQuanSo, key)) {
        updates[`duLieu.${key}`] = dataQuanSo[key];
      }
    }

    // 💡 SỬA LỖI: Sử dụng `updateDoc` thay vì `setDoc` để cập nhật các trường con một cách chính xác.
    // `updateDoc` được thiết kế để làm việc với "dot notation" (ví dụ: "duLieu.roster").
    await updateDoc(docRef, updates);
    console.log("Đã đồng bộ (update) dữ liệu lên Firebase thành công!");
  } catch (error) {
    console.error("Lỗi khi đồng bộ lên đám mây:", error);
  }
};

// 🎯 HÀM 2: TẢI DỮ LIỆU TỪ ĐÁM MÂY VỀ (Gọi hàm này khi người dùng vừa mở app/vừa đăng nhập xong)
export const taiDuLieuTuDamMay = async (userEmail: string) => {
  if (!userEmail) return null;
  try {
    const docRef = doc(db, "baocao_quanso", userEmail);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().duLieu; // Trả về cục dữ liệu quân số đã lưu trước đó
    } else {
      console.log("Tài khoản này chưa có dữ liệu lưu trên đám mây.");
      return null;
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu từ đám mây:", error);
    return null;
  }
};