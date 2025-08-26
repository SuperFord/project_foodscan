import { useNavigate , Link } from "react-router-dom";
import { FiHome, FiUser } from "react-icons/fi"; // ไอคอนแบบเดียวกับในภาพ figma
import tableImg from "./img/table.png";
import historyImg from "./img/history.png";
import { useEffect } from "react";
import { fetchWithAuth } from './Menu/fetchWithAuth';
import Swal from 'sweetalert2';

function Menu() {
  const navigate = useNavigate();
  
  // เช็ค token ถ้าไม่มี token จะเปลี่ยนเส้นทางไปหน้า /User
  useEffect(() => {
    const checkToken = async () => {
      const response = await fetchWithAuth("/api/checkToken", {}, navigate);  // ใช้ fetchWithAuth ในการเช็ค token
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

  const menuItems = [
    { id: 1, name: "จองโต๊ะ", image: tableImg, path: "/User/Menu/ReserTable" },
    { id: 2, name: "นัดหมายปัจจุบัน", image: historyImg, path: "/User/Menu/Detail" },
  ];

  // ตรวจสอบเวลาถ้าถึงตามที่กำหนดจะกดไปจองโต๊ะไม่ได้
  const handleMenuClick = (item) => {
    if (item.name === "จองโต๊ะ") {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
  
      // if (hour > 19 || (hour === 19 && minute >= 30)) {
      //   Swal.fire({
      //     icon: "warning",
      //     title: "ไม่สามารถจองโต๊ะได้",
      //     text: "กรุณา walk in ที่ร้านหลังเวลา 19:30 น.",
      //     confirmButtonText: "ตกลง"
      //   });
      //   return;
      // }
    }
  
    navigate(item.path.replace("./", "/User/")); // เปลี่ยน path สำหรับ navigate ให้เหมาะสม
  };

  return (
    // Form เลือก Menu
    <div className="min-h-screen flex flex-col justify-between">
      <div className="p-10">
        <div className="text-3xl font-bold text-center mb-6 mt-6 relative">
          เลือกเมนู
          <div className="w-2/3 h-0.5 bg-slate-200 mx-auto mt-4"></div>
        </div>
        <div className="flex flex-col items-center gap-14 p-10">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleMenuClick(item)}
            className="cursor-pointer block bg-yellow-200 border border-gray-300 rounded-xl shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 p-6 text-center w-64"
          >
            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover mx-auto rounded-md" />
            <div className="mt-8 text-xl font-semibold">{item.name}</div>
          </div>
        ))}
        </div>
      </div>
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

export default Menu;
