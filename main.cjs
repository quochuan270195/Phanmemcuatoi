const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // 1. Cấu hình kích thước cửa sổ phần mềm khi mở lên
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true, // Ẩn thanh menu mặc định (File, Edit, View...) cho giao diện đẹp như app thật
    webPreferences: {
      // Tắt Node.js integration và bật context isolation để tăng cường bảo mật
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // 2. Chỉ đường cho Electron tìm đến file giao diện React sau khi build
  // Nó sẽ đọc file index.html nằm trong thư mục 'dist/web' của bạn (đã được cấu hình trong vite.config.ts)
  win.loadFile(path.join(__dirname, 'dist/web/index.html'));
}

// 3. Khi Electron khởi động sẵn sàng thì lập tức tạo cửa sổ ứng dụng
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 4. Tự động tắt hẳn ứng dụng chạy ngầm khi bạn bấm nút X đóng cửa sổ (trên Windows)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});