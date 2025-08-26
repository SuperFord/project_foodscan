import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft , FaTrash } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import Swal from 'sweetalert2';
import axios from 'axios';
import { API_BASE } from "../config";

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
  
      const res = await axios.get(`${API_BASE}/api/all_reservations_today`, {
        params: { date: formattedDate }
      });
  
      if (res.data.success) {
        // console.log("✅ ข้อมูลที่รับมาจาก backend:", res.data.reservations);
        setReservations(res.data.reservations);
      } else {
        console.error("ไม่สามารถดึงข้อมูลการจองได้");
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการโหลดการจอง:", err);
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
        await axios.delete(`${API_BASE}/api/delete_reservation/${id}`);
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
        console.error('ลบไม่สำเร็จ:', err);
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    }
  };

  return (
      <div className="w-full h-screen bg-white flex flex-col items-center">
          {/* Header */}
          <div className="w-full flex items-center justify-between bg-yellow-400 p-4 text-white">
              <FaArrowLeft className="text-2xl cursor-pointer ml-4" onClick={() => navigate("/Restaurant/Menu")}/>
              <h1 className="flex-grow text-3xl font-bold text-center p-2">รายการจองโต๊ะปัจจุบัน</h1>
          </div>

          {/* Table list */}
          <table className="w-full text-lg table-fixed">
          <thead>
            <tr className="bg-white border border-black">
              <th className="pl-6 w-[10%] text-center">คิว</th>
              <th className="pl-10 w-[30%] text-left">ชื่อ</th>
              <th className="pr-12 w-[30%] text-center">เวลาและวันที่</th>
              <th className="pr-8 w-[20%] text-center">การสั่งอาหาร</th>
              <th className="p-2 w-[10%] text-center"></th>
            </tr>
          </thead>
          <tbody>
            {reservations.length > 0 ? (
              reservations.map((item, idx) => {
                const isExpanded = expanded === idx;
                const hasFood = item.foodorder && item.foodorder.length > 0;

                return (
                  <React.Fragment key={idx}>
                    <tr className="bg-white border border-black cursor-pointer hover:bg-yellow-100"
                        onClick={() => setExpanded(isExpanded ? null : idx)}>
                      <td className="pl-6 text-center">{idx + 1}</td>
                      <td className="pl-10">{item.username}</td>
                      <td className="pr-12 text-center">{item.time} {item.date}</td>
                      <td className="pr-8 text-center">
                        <div className={`w-4 h-4 mx-auto rounded-full ${hasFood ? 'bg-green-500' : 'bg-red-500'}`} />
                      </td>
                      <td className="text-center">
                        {isExpanded ? <IoIosArrowDown /> : <IoIosArrowForward />}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-white">
                        <td colSpan="5" className="relative p-4 text-black">
                          {/* ปุ่มถังขยะด้านขวาบน */}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="absolute top-2 right-4 text-red-600 hover:text-red-800 z-10"
                            title="ลบการจอง"
                          >
                            <FaTrash size={18} />
                          </button>
                          {/* เเสดงข้อมูลเมื่อกดตรงช่อง */}
                          <div className="pl-6">
                            <div><strong>ชื่อ:</strong> {item.username}</div>
                            <div><strong>อีเมล:</strong> {item.email}</div>
                            <div><strong>เวลาและวันที่:</strong> {item.time} {item.date}</div>
                            <div><strong>โต๊ะ:</strong> {item.setable || '-'}</div>
                            <div><strong>จำนวน:</strong> {item.people}</div>
                            <div><strong>รายละเอียดเพิ่มเติม:</strong> {item.detail || '-'}</div>
                            <div className=""><strong>รายการอาหาร :</strong></div>
                          </div>
                          {hasFood ? (
                            <table className="mx-auto mt-2 border border-black text-sm">
                              <thead className="bg-white">
                                <tr>
                                  <th className="py-1 px-20 border border-black">ชื่ออาหาร</th>
                                  <th className="py-1 px-20 border border-black">จำนวน</th>
                                  <th className="py-1 px-20 border border-black">ราคา</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.foodorder.map((food, i) => (
                                  <tr key={i} className="text-center">
                                    <td className="py-1 px-20 border border-black">{food.name}</td>
                                    <td className="py-1 px-20 border border-black">{food.quantity}</td>
                                    <td className="py-1 px-20 border border-black">{food.totalpq}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan="2" className="py-1 px-20 border border-black text-center font-bold">
                                    ราคารวมทั้งหมด
                                  </td>
                                  <td className="py-1 px-20 border border-black font-bold">
                                    {item.total.toLocaleString()} บาท
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          ) : (
                            <div className="px-4 text-gray-400">ไม่มีรายการอาหาร</div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr><td colSpan="5" className="text-center p-4">ไม่พบข้อมูลการจอง</td></tr>
            )}
          </tbody>
          </table>
      </div>
  );
}

export default TableReser