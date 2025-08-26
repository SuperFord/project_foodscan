import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import menuImg from "./img/menu.png";
import tableImg from "./img/table.png";
import notibellImg from "./img/notibell.png";
import statustableImg from "./img/statustable.png";
import historyImg from "./img/history.png";
import QrImg from "./img/Qr.png";
import QrandtableImg from "./img/111.png";
import { API_BASE } from "../../config";

function Menu() {
  const navigate = useNavigate();
  const [hasTableLayout, setHasTableLayout] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    checkTableLayout();
    loadAdminInfo();
  }, []);

  const checkTableLayout = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/table_layout`);
      const result = await response.json();
      if (result.success && result.tables.length > 0) {
        setHasTableLayout(true); // ถ้ามีข้อมูลให้ไปหน้า Table_map
      }
    } catch (error) {
      console.error("Error checking table layout:", error);
    }
  };

  const loadAdminInfo = () => {
    const adminData = localStorage.getItem('restaurantAdmin');
    if (adminData) {
      setAdminInfo(JSON.parse(adminData));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('restaurantToken');
    localStorage.removeItem('restaurantAdmin');
    navigate('/Restaurant/Login');
  };

  const menuItems = [
    { id: 1, name: "จัดการอาหาร", image: menuImg, path: "./Listfood" },
    { id: 2, name: "จัดการแผนผังโต๊ะและเวลาเปิด - ปิด", image: tableImg, path: hasTableLayout ? "./TableMap" : "./TableLayouts" },
    { id: 3, name: "รายการจองโต๊ะ", image: notibellImg, path: "./TableReservation" },
    { id: 4, name: "สถานะโต๊ะ", image: statustableImg, path: "./TableStatus" },
    { id: 5, name: "ประวัติการจองโต๊ะทั้งหมด", image: historyImg, path: "./History" },
    { id: 6, name: "ตั้งค่า QR การชำระเงิน", image: QrImg, path: "/QRSettings" },
    { id: 7, name: "จัดการสลิปและจองโต๊ะ", image: QrandtableImg, path: "./PaymentSlipManagement" },
  ];
  
  return (
    <div className="p-8">
      {/* Header with Admin Info and Logout */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-left">
          {adminInfo && (
            <div className="text-sm text-gray-600">
              <p>ยินดีต้อนรับ, <span className="font-semibold text-yellow-600">{adminInfo.username}</span></p>
              <p>สถานะ: <span className="text-green-600">ผู้ดูแลระบบ</span></p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          ออกจากระบบ
        </button>
      </div>

      <div className="text-3xl font-bold text-center mb-4 mt-6 relative">
        เลือกเมนู
        <div className="w-2/3 h-0.5 bg-yellow-200 mx-auto mt-3"></div>
      </div>

      <div className="flex flex-col items-center gap-4 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className="block bg-yellow-200 border border-gray-300 rounded-xl shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 p-6 text-center w-64"
          >
            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover mx-auto rounded-md" />
            <div className="mt-4 text-lg font-semibold">{item.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Menu;