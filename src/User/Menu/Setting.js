import React from "react";
import { useNavigate , Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { FaArrowLeft } from "react-icons/fa";
import { FiHome, FiUser } from "react-icons/fi"; // ไอคอนแบบเดียวกับในภาพ figma
import { useEffect } from "react";
import { fetchWithAuth } from './fetchWithAuth';

const MenuItem = ({ title, path, showArrow = true, onClick }) => {
  const navigate = useNavigate();
  return (
    <div
      className="cursor-pointer hover:bg-gray-100"
      onClick={() => onClick ? onClick() : navigate(path)}
    >
      <div className="flex justify-between items-center px-4 py-4">
        <span className="text-xl">{title}</span>
        {showArrow && <span className="text-black font-bold">{"➤"}</span>}
      </div>
      <div className="border-b border-black w-full" />
    </div>
  );
};

function Setting() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
          const response = await fetchWithAuth("http://localhost:5000/api/checkToken", {}, navigate);  // ใช้ fetchWithAuth ในการเช็ค token
          if (!response) {
            // fetchWithAuth จะ redirect ไป /User ให้อยู่แล้วถ้า token หมดอายุ
            return;
          }
    
          if (!response.ok) {
            console.error("Token invalid or other error");
          }
        };
    checkToken();
  }, [navigate]);

  const handleLogout = () => {
    // ลบ token จาก localStorage หรือ sessionStorage
    localStorage.removeItem('token');  // หรือ sessionStorage.removeItem('token');
    
    // รีไดเรกต์ไปยังหน้า login หรือหน้าอื่น
    navigate('/User/');  // เปลี่ยนไปหน้า login หรือหน้าอื่นที่ต้องการ
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-yellow-400 w-full p-4 text-white text-xl font-semibold flex justify-center items-center relative">
        <FaArrowLeft
          className="text-2xl cursor-pointer absolute left-4"
          onClick={() => navigate("/User/Menu")}
        />
        <span>ตั้งค่า</span>
        <Bell size={20} className="absolute right-4" />
      </div>
      {/* เมนู */}
      <div className="bg-white w-full max-w-lg mx-auto mt-4 pl-2 rounded-xloverflow-hidden">
        <MenuItem title="โปรไฟล์" path="/User/Menu/Profile" />
        <MenuItem title="เปลี่ยนรหัสผ่าน" path="/User/Menu/ChangePassword" />
        <MenuItem title="ประวัติการจอง" path="/User/Menu/History" />
        <MenuItem title="ออกจากระบบ" path="/" showArrow={false} onClick={handleLogout} />
      </div>
      {/* Spacer เพื่อให้ไม่ติดขอบล่าง */}
      <div className="flex-grow" />
      {/* แถบนำทางด้านล่าง */}
      <div className="bg-gray-900 text-white flex justify-around items-center py-4 mt-auto">
        <Link to="/User/Menu" className="flex-1 flex justify-center items-center">
          <FiHome className="text-3xl text-gray-400 hover:text-white transition" />
        </Link>
        <Link to="/User/Menu/Setting" className="flex-1 flex justify-center items-center">
          <FiUser className="text-3xl text-gray-400 hover:text-white transition" />
        </Link>
      </div>
    </div>
  );
}

export default Setting;
