import Swal from 'sweetalert2';
import { API_BASE } from '../../config';

export async function fetchWithAuth(url, options = {}, navigate) {
  // ถ้า url เริ่มต้นด้วย http ให้ใช้ตามนั้น ถ้าไม่ให้เติม API_BASE
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const token = localStorage.getItem('token');

  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'เกิดข้อผิดพลาด',
      text: 'กรุณาเข้าสู่ระบบใหม่',
      confirmButtonText: 'ตกลง', // หรือกดตกลง แล้วไปหน้า Login อัตโนมัติ
      timer: 2000, // รอ 2 วินาที แล้วไปหน้า Login อัตโนมัติ
      timerProgressBar: true,
    }).then(() => {
      if (navigate) navigate('/User'); // Redirect to login
    });
    return null;
  }

  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    const response = await fetch(fullUrl, { ...options, headers });

    // ถ้า status เป็น 401, 403 หรือ 404 หรือ 500 ก็จะทำการแจ้งเตือน
    if (response.status === 401 || response.status === 403) {
      Swal.fire({
        icon: 'error',
        title: 'Session หมดอายุ',
        text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
        confirmButtonText: 'ตกลง'
      }).then(() => {
        localStorage.removeItem('token');
        if (navigate) navigate('/User'); // Redirect กลับหน้า login
      });
      return null;
    }

    return response;
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
}
