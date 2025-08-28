import React from "react";
import { useNavigate , Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { FaArrowLeft } from "react-icons/fa";
import { FiHome, FiUser, FiChevronRight, FiLock, FiClock, FiLogOut } from "react-icons/fi"; // ไอคอน
import { useEffect } from "react";
import { fetchWithAuth } from './fetchWithAuth';

const MenuItem = ({ title, path, showArrow = true, onClick, icon: Icon }) => {
  const navigate = useNavigate();
  return (
    <button
      className="w-full text-left"
      onClick={() => onClick ? onClick() : navigate(path)}
    >
      <div className="flex items-center justify-between px-4 py-4 bg-white hover:bg-yellow-50 transition-colors rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <Icon size={20} />
            </div>
          )}
          <span className="text-base font-medium text-gray-800">{title}</span>
        </div>
        {showArrow && <FiChevronRight className="text-gray-400" />}
      </div>
    </button>
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
            navigate('/user');  // เปลี่ยนไปหน้า login หรือหน้าอื่นที่ต้องการ
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-50 to-white">
      {/* Header */}
      <div className="w-full p-4 text-white text-xl font-semibold flex justify-center items-center relative bg-gradient-to-r from-yellow-400 to-yellow-500 shadow">
        <FaArrowLeft
          className="text-2xl cursor-pointer absolute left-4"
                      onClick={() => navigate("/user-menu")}
        />
        <span>ตั้งค่า</span>
        <Bell size={20} className="absolute right-4" />
      </div>

      {/* Profile hero */}
      <div className="max-w-lg mx-auto w-full px-4 mt-5">
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <FiUser className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="text-gray-900 font-semibold">โปรไฟล์ของคุณ</div>
            <div className="text-gray-500 text-sm">จัดการบัญชีและความปลอดภัย</div>
          </div>
          <button
            className="px-3 py-1.5 text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg transition-colors"
            onClick={() => navigate("/user-profile")}
          >แก้ไข</button>
        </div>
      </div>

      {/* เมนู */}
      <div className="w-full max-w-lg mx-auto px-4 mt-5 space-y-3">
        {/* <MenuItem title="โปรไฟล์" path="/user-profile" icon={FiUser} /> */}
        <MenuItem title="เปลี่ยนรหัสผ่าน" path="/user-change-password" icon={FiLock} />
        <MenuItem title="ประวัติการจอง" path="/user-history" icon={FiClock} />
        <MenuItem title="ออกจากระบบ" path="/" showArrow={false} onClick={handleLogout} icon={FiLogOut} />
      </div>

      {/* Spacer */}
      <div className="flex-grow" />

      {/* แถบนำทางด้านล่าง */}
      <div className="bg-gray-900 text-white flex justify-around items-center py-4 mt-auto">
        <Link to="/user-menu" className="flex-1 flex justify-center items-center">
          <FiHome className="text-3xl text-gray-400 hover:text-white transition" />
        </Link>
        <Link to="/user-setting" className="flex-1 flex justify-center items-center">
          <FiUser className="text-3xl text-white" />
        </Link>
      </div>
    </div>
  );
}

export default Setting;
