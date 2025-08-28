import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft , FaTrash } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import Swal from 'sweetalert2';
import axios from 'axios';
import { buildUrl } from "../../utils/api";

function TableReser() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // yyyy-mm-dd
  
      const res = await axios.get(buildUrl('/api/all_reservations_today'), {
        params: { date: formattedDate }
      });
  
      if (res.data.success) {
        setReservations(res.data.reservations);
      }
    } catch (err) {
      // Error handling without console.log
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณต้องการลบการจองนี้หรือไม่",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก'
    });
  
    if (result.isConfirmed) {
      try {
        await axios.delete(buildUrl(`/api/delete_reservation/${id}`));
        Swal.fire({
          title: 'ลบแล้ว!',
          text: 'การจองถูกลบเรียบร้อย',
          icon: 'success',
          timer: 1000, // ปิดอัตโนมัติใน 1 วิ
          timerProgressBar: true,
          showConfirmButton: false,
        });
        fetchReservations(); // รีโหลดข้อมูลใหม่
      } catch (err) {
        // Error handling without console.log
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    }
  };

  return (
      <div className="w-full min-h-screen bg-gray-50 flex flex-col">
          {/* Header */}
          <div className="w-full flex items-center justify-between bg-yellow-400 p-3 text-white shadow-md">
              <FaArrowLeft className="text-xl cursor-pointer ml-3 hover:text-yellow-100" onClick={() => navigate("/restaurant-menu")}/>
              <h1 className="flex-grow text-2xl font-bold text-center">รายการจองโต๊ะปัจจุบัน</h1>
          </div>

          {/* Content Container */}
          <div className="flex-1 p-4 max-w-6xl mx-auto w-full">
              {/* Table list */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="w-full text-sm">
                      <thead>
                          <tr className="bg-gray-100 border-b border-gray-200">
                              <th className="px-3 py-2 w-[8%] text-center text-gray-700">คิว</th>
                              <th className="px-3 py-2 w-[25%] text-left text-gray-700">ชื่อ</th>
                              <th className="px-3 py-2 w-[25%] text-center text-gray-700">เวลาและวันที่</th>
                              <th className="px-3 py-2 w-[20%] text-center text-gray-700">การสั่งอาหาร</th>
                              <th className="px-3 py-2 w-[12%] text-center text-gray-700">รายละเอียด</th>
                          </tr>
                      </thead>
                      <tbody>
                          {reservations.length > 0 ? (
                              reservations.map((item, idx) => {
                                  const isExpanded = expanded === idx;
                                  const hasFood = item.foodorder && item.foodorder.length > 0;

                                  return (
                                      <React.Fragment key={idx}>
                                          <tr className="bg-white border-b border-gray-200 cursor-pointer hover:bg-yellow-50 transition-colors"
                                              onClick={() => setExpanded(isExpanded ? null : idx)}>
                                              <td className="px-3 py-2 text-center text-gray-600">{idx + 1}</td>
                                              <td className="px-3 py-2 font-medium">{item.username}</td>
                                              <td className="px-3 py-2 text-center text-gray-600">{item.time} {item.date}</td>
                                              <td className="px-3 py-2 text-center">
                                                  <div className={`w-3 h-3 mx-auto rounded-full ${hasFood ? 'bg-green-500' : 'bg-red-500'}`} />
                                              </td>
                                              <td className="px-3 py-2 text-center">
                                                  <div className="flex items-center justify-center">
                                                      {isExpanded ? 
                                                          <IoIosArrowDown className="text-gray-500" /> : 
                                                          <IoIosArrowForward className="text-gray-500" />
                                                      }
                                                  </div>
                                              </td>
                                          </tr>

                                          {isExpanded && (
                                              <tr className="bg-gray-50">
                                                  <td colSpan="5" className="relative p-4">
                                                      {/* ปุ่มถังขยะด้านขวาบน */}
                                                      <button
                                                          onClick={() => handleDelete(item.id)}
                                                          className="absolute top-3 right-4 text-red-500 hover:text-red-700 transition-colors"
                                                          title="ลบการจอง"
                                                      >
                                                          <FaTrash size={16} />
                                                      </button>
                                                      
                                                      {/* ข้อมูลการจอง */}
                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                          <div className="space-y-2">
                                                              <div className="text-gray-700">
                                                                  <span className="font-medium">ชื่อ:</span> {item.username}
                                                              </div>
                                                              <div className="text-gray-700">
                                                                  <span className="font-medium">อีเมล:</span> {item.email}
                                                              </div>
                                                              <div className="text-gray-700">
                                                                  <span className="font-medium">เวลา:</span> {item.time} {item.date}
                                                              </div>
                                                          </div>
                                                          <div className="space-y-2">
                                                              <div className="text-gray-700">
                                                                  <span className="font-medium">โต๊ะ:</span> {item.setable || '-'}
                                                              </div>
                                                              <div className="text-gray-700">
                                                                  <span className="font-medium">จำนวนคน:</span> {item.people} คน
                                                              </div>
                                                              <div className="text-gray-700">
                                                                  <span className="font-medium">รายละเอียด:</span> {item.detail || '-'}
                                                              </div>
                                                          </div>
                                                      </div>

                                                      {/* รายการอาหาร */}
                                                      <div>
                                                          <h4 className="font-medium text-gray-800 mb-3">รายการอาหาร</h4>
                                                          {hasFood ? (
                                                              <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                                                  <table className="w-full text-xs">
                                                                      <thead className="bg-gray-50">
                                                                          <tr>
                                                                              <th className="px-3 py-2 text-left border-b border-gray-200">ชื่ออาหาร</th>
                                                                              <th className="px-3 py-2 text-center border-b border-gray-200">จำนวน</th>
                                                                              <th className="px-3 py-2 text-right border-b border-gray-200">ราคา</th>
                                                                          </tr>
                                                                      </thead>
                                                                      <tbody>
                                                                          {item.foodorder.map((food, i) => (
                                                                              <tr key={i} className="border-b border-gray-100">
                                                                                  <td className="px-3 py-2">{food.name}</td>
                                                                                  <td className="px-3 py-2 text-center">{food.quantity}</td>
                                                                                  <td className="px-3 py-2 text-right">{food.totalpq?.toLocaleString()} บาท</td>
                                                                              </tr>
                                                                          ))}
                                                                      </tbody>
                                                                      <tfoot className="bg-yellow-50">
                                                                          <tr>
                                                                              <td colSpan="2" className="px-3 py-2 text-right font-medium">
                                                                                  ราคารวมทั้งหมด:
                                                                              </td>
                                                                              <td className="px-3 py-2 text-right font-bold text-lg">
                                                                                  {item.total?.toLocaleString()} บาท
                                                                              </td>
                                                                          </tr>
                                                                      </tfoot>
                                                                  </table>
                                                              </div>
                                                          ) : (
                                                              <div className="text-center py-4 text-gray-400 bg-gray-50 rounded">
                                                                  ไม่มีรายการอาหาร
                                                              </div>
                                                          )}
                                                      </div>
                                                  </td>
                                              </tr>
                                          )}
                                      </React.Fragment>
                                  );
                              })
                          ) : (
                              <tr>
                                  <td colSpan="5" className="text-center py-8 text-gray-500">
                                      ไม่พบข้อมูลการจอง
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
  );
}

export default TableReser