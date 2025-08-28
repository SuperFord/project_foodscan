
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { FiHome, FiUser } from "react-icons/fi";
import { fetchWithAuth } from './fetchWithAuth';

function History() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // ตรวจสอบ Token
    const checkToken = async () => {
      const response = await fetchWithAuth("http://localhost:5000/api/checkToken", {}, navigate);
      if (!response) {
        return;
      }
      if (!response.ok) {
        console.error("Token ไม่ถูกต้องหรือเกิดข้อผิดพลาด");
      }
    };

    // ดึงประวัติการจองและเรียงจากใหม่ไปเก่า
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/user/history', {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          // เรียงข้อมูลจากใหม่ไปเก่าโดยใช้ฟิลด์ date
          const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
          setReservations(sortedData);
        } else {
          console.error("ข้อมูลที่ได้ไม่ใช่ array:", data);
          setReservations([]);
        }
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการดึงประวัติการจอง:", err);
      }
    };

    checkToken();
    fetchHistory();
  }, [navigate]);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="w-full h-screen bg-white">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-yellow-400 p-4 text-white">
        <FaArrowLeft className="text-2xl cursor-pointer" onClick={() => navigate("/User/Menu/Setting")} />
        <h1 className="text-2xl font-bold text-center flex-grow">ประวัติการจอง</h1>
      </div>
      {/* แสดงประวัติ */}
      {reservations.length === 0 ? (
        <div className="text-center p-6 text-gray-500">ไม่มีประวัติการจอง</div>
      ) : (
        reservations.map((res, index) => (
          <div key={res.id} className="border-b border-gray-300 bg-white">
            {/* แถบบน */}
            <div
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleExpand(index)}
            >
              <div>
                <div className="font-semibold">หมายเลขจอง: {res.code}</div>
                <div>โต๊ะ: {res.setable}</div>
                <div>เวลา: {res.time} {res.date}</div>
              </div>
              <div className="text-xl">
                {expandedIndex === index ? <IoIosArrowDown /> : <IoIosArrowForward />}
              </div>
            </div>
            {/* ข้อมูลเพิ่มเติม */}
            {expandedIndex === index && (
              <div className="bg-gray-50 px-6 p-4 pb-4 text-sm text-black">
                <div><strong>ชื่อ:</strong> {res.username}</div>
                <div><strong>อีเมล:</strong> {res.email}</div>
                <div><strong>เวลาและวันที่นัดหมาย:</strong> {res.time} {res.date}</div>
                <div><strong>โต๊ะ:</strong> {res.setable}</div>
                <div><strong>จำนวน:</strong> {res.people} คน</div>
                <div><strong>รายละเอียดเพิ่มเติม:</strong> {res.detail || '-'}</div>
                {/* รายการอาหาร */}
                <div className="">
                  <strong>รายการอาหาร :</strong>
                </div>
                {res.foods && res.foods.length > 0 ? (
                  <div className="w-fit mx-auto">
                    <table className="border border-black text-sm w-full">
                      <thead className="bg-white">
                        <tr>
                          <th className="py-1 px-4 border border-black text-center">ชื่ออาหาร</th>
                          <th className="py-1 px-4 border border-black text-center">จำนวน</th>
                          <th className="py-1 px-4 border border-black text-center">ราคา</th>
                        </tr>
                      </thead>
                      <tbody>
                        {res.foods.map((food, idx) => (
                          <tr key={idx}>
                            <td className="py-1 px-4 border border-black text-center">{food.name}</td>
                            <td className="py-1 px-4 border border-black text-center">{food.quantity}</td>
                            <td className="py-1 px-4 border border-black text-center">{food.totalpq}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="2" className="py-1 px-4 border border-black text-center font-bold">
                            ราคารวม
                          </td>
                          <td className="py-1 px-4 border border-black text-center font-bold">
                            {res.total.toLocaleString()} บาท
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="px-4 text-gray-400 mt-2">ไม่มีรายการอาหาร</div>
                )}
              </div>
            )}
          </div>
        ))
      )}
      {/* แถบนำทางด้านล่าง */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white flex justify-around items-center py-4">
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

export default History;
