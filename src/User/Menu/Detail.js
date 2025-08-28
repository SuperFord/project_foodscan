import React, { useState, useEffect } from 'react';
import { useNavigate , Link } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";
import { FiHome, FiUser } from "react-icons/fi"; // ไอคอนแบบเดียวกับในภาพ figma
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { fetchWithAuth } from './fetchWithAuth';

function Detail() {
  const [reservation, setReservation] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [todayReservation, setIsTodayReservation] = useState(false);
  const [paymentStatusBanner, setPaymentStatusBanner] = useState(null); // { type: 'pending'|'approved'|'rejected', text: string }
  const navigate = useNavigate();
  const token = localStorage.getItem('token');  // ดึง JWT token จาก localStorage

  useEffect(() => {
    const checkAuthAndData = async () => {
      // 1. ตรวจสอบ token ก่อน
      const response = await fetchWithAuth("/api/checkToken", {}, navigate);  // ใช้ fetchWithAuth ในการเช็ค token
      if (!response || !response.ok) {
        // ถ้า token ไม่ valid จะถูก redirect แล้ว ไม่ต้องทำต่อ
        return;
      }

      // 2. ดึงข้อมูลร้าน และการจอง ถ้า token ผ่าน
      try {
        // ดึงชื่อร้าน
        const restaurantRes = await fetch("/api/Nrestaurant");
        const restaurantData = await restaurantRes.json();
        setRestaurantName(restaurantData.name);

        // ดึงข้อมูลการจองของวันนี้
        const res = await fetch("/api/reservation/today", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.length > 0) {
          const todayReservation = data[0];
          setReservation(todayReservation);

          // แปลงวันที่จาก พ.ศ. -> ค.ศ. เพื่อเปรียบเทียบ
          const [dayStr, monthStr, yearStr] = todayReservation.date.split('/');
          const day = parseInt(dayStr, 10);
          const month = parseInt(monthStr, 10);
          const year = parseInt(yearStr, 10) - 543;

          const formattedDate = dayjs(new Date(year, month - 1, day)).format('YYYY-MM-DD');
          const today = dayjs().format('YYYY-MM-DD');

          setIsTodayReservation(formattedDate === today);

          // ดึงสถานะสลิปของผู้ใช้ล่าสุดเพื่อแสดงแบนเนอร์สถานะ
          try {
            const resp = await fetch('/api/user/payment-slips', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
            const slipData = await resp.json();
            if (slipData.success && Array.isArray(slipData.slips)) {
              const matched = todayReservation.payment_slip_id
                ? slipData.slips.find(s => String(s.id) === String(todayReservation.payment_slip_id))
                : slipData.slips[0];
              if (matched) {
                if (matched.status === 'pending') {
                  setPaymentStatusBanner({ type: 'pending', text: 'กำลังรอการอนุมัติการชำระเงินจากร้าน โปรดรอการยืนยัน' });
                } else if (matched.status === 'approved' || matched.status === 'used') {
                  setPaymentStatusBanner({ type: 'approved', text: 'ชำระเงินได้รับการยืนยันแล้ว ระบบได้บันทึกการจองของคุณ' });
                } else if (matched.status === 'rejected') {
                  // ตรวจสอบว่ามีรายการสั่งอาหารหรือไม่ ถ้าไม่มีก็ไม่แสดงข้อความการปฏิเสธ
                  if (todayReservation.foodorder && todayReservation.foodorder.length > 0) {
                    setPaymentStatusBanner({ type: 'rejected', text: 'การชำระเงินถูกปฏิเสธ การจองถูกยกเลิก หากสงสัยโปรดติดต่อร้าน' });
                  }
                }
              }
            }
          } catch (e) {
            // Error handling without console.log
          }
        }
      } catch (err) {
        // Error handling without console.log
      }
    };

    checkAuthAndData(); // ✅ เรียก checkAuthAndData หลัก
  }, [token, navigate]);

  const totalPrice = reservation?.foodorder?.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  ) || 0; 
  
    return (
      <div className="min-h-screen">
        {/* Header - แถบสีเหลือง */}
        <div className="bg-yellow-400 w-full flex items-center justify-between p-4 text-white shadow-md">
          <FaArrowLeft
            className="text-2xl cursor-pointer ml-2"
            onClick={() => navigate("/user-menu")}
          />
          <div className="flex-grow text-3xl font-bold text-center mr-6">
            รายละเอียดการจอง
          </div>
        </div>

        {/* กล่องข้อความแสดงว่าไม่มีการจอง */}
        <div className="flex justify-center items-center px-4 py-8">
          {!reservation || !reservation.foodorder ? (
          <div className="bg-white border-2 border-gray-400 rounded-xl text-xl shadow-lg p-6 max-w-md w-full text-center">
            <div className=" p-6">
              <p className="text-black">คุณไม่มีรายการการจองใดๆ...</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-4 max-w-md w-full">
            {paymentStatusBanner && (
              <div className={`mb-4 rounded-lg p-3 text-sm font-medium ${
                paymentStatusBanner.type === 'pending'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : paymentStatusBanner.type === 'approved'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {paymentStatusBanner.text}
              </div>
            )}
            <div className="border-2 border-gray-400 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-semibold mb-2 border-b border-gray-400 pb-2">{restaurantName}</h3>
              <p className="text-lg font-semibold mb-2 "><strong>โต๊ะที่เลือก:</strong> <span className="text-yellow-500 font-semibold">{reservation.setable}</span></p>
              <p className="text-lg font-semibold mb-2 "><strong>ชื่อผู้จอง:</strong> <span className="text-yellow-500 font-semibold">{reservation.username}</span></p>
              <p className="text-lg font-semibold mb-2 "><strong>อีเมล:</strong> <span className="text-yellow-500 font-semibold">{reservation.email}</span></p>
              <p className="text-lg font-semibold mb-2 "><strong>จำนวนคน:</strong> <span className="text-yellow-500 font-semibold">{reservation.people}</span></p>
              <p className="text-lg font-semibold mb-2 "><strong>เวลานัด:</strong> <span className="text-yellow-500 font-semibold">{reservation.time}</span></p>
              <p className="text-lg font-semibold mb-2 "><strong>วันที่นัด:</strong> <span className="text-yellow-500 font-semibold">{reservation.date}</span></p>
              <p className="text-lg font-semibold mb-2 "><strong>รายละเอียดเพิ่มเติม:</strong> <span className="text-yellow-500 font-semibold">{reservation.detail || '-'}</span></p>
              <div className="mb-4">
                <h4 className="text-lg font-semibold mb-2">รายการอาหาร</h4>
                <table className="w-full border border-black text-sm">
                  <thead>
                    <tr>
                      <th className="border border-black px-2 py-1">รายการอาหาร</th>
                      <th className="border border-black px-2 py-1">จำนวน</th>
                      <th className="border border-black px-2 py-1">ราคา</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservation.foodorder.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-black px-2 py-1 text-center">{item.name}</td>
                        <td className="border border-black px-2 py-1 text-center">{item.quantity}</td>
                        <td className="border border-black px-2 py-1 text-center">{item.quantity * item.price}</td>
                      </tr>
                    ))}
                    <tr className=" font-semibold">
                      <td className="border border-black px-2 py-1 text-center" colSpan="2">ราคารวม</td>
                      <td className="border border-black px-2 py-1 text-center">{totalPrice}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <button
                onClick={async () => {
                  const result = await Swal.fire({
                    title: 'คุณแน่ใจหรือไม่?',
                    text: 'คุณต้องการยกเลิกการจองหรือไม่?',
                    icon: 'warning',
                    showCancelButton: true,
                    cancelButtonText: 'ไม่',
                    confirmButtonText: 'ใช่',
                    reverseButtons: true,
                    buttonsStyling: false,
                    customClass: {
                      confirmButton:
                        'bg-yellow-400 text-white font-bold py-2 px-4 rounded w-32',
                      cancelButton:
                        'bg-yellow-100 text-yellow-500 font-bold py-2 px-4 rounded w-32',
                      actions: 'flex justify-center gap-4 mt-4',
                    },
                  });

                  if (result.isConfirmed) {
                    try {
                      const response = await fetch("/api/reservation/cancel", {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          email: reservation.email,
                          date: reservation.date,
                        }),
                      });

                      const data = await response.json();

                      if (response.ok) {
                        Swal.fire({
                          title: 'สำเร็จ!',
                          text: 'ยกเลิกการจองเรียบร้อยแล้ว',
                          icon: 'success',
                          confirmButtonText: 'ตกลง',
                          timer: 2000, // รอ 1 วินาที แล้วไปหน้า Setting อัตโนมัติ
                          timerProgressBar: true,
                          customClass: {
                            confirmButton:
                              'bg-yellow-400 text-white font-bold',
                          },
                        }).then(() => {
                          navigate("/user-menu");
                        });
                      } else {
                        Swal.fire('ผิดพลาด', data.message || 'ไม่สามารถยกเลิกการจองได้', 'error');
                      }
                    } catch (err) {
                      Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์', 'error');
                    }
                  }
                }}
                className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-md font-semibold"
              >
                ยกเลิกการจอง
              </button>
            </div>
          </div>
          )}
        </div>

        {/* แถบนำทางด้านล่าง */}
        <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white flex justify-around items-center py-4">
          <Link to="/user-menu" className="flex-1 flex justify-center items-center">
            <FiHome className="text-3xl text-gray-400 hover:text-white transition" />
          </Link>
          <Link to="/user-setting" className="flex-1 flex justify-center items-center">
            <FiUser className="text-3xl text-gray-400 hover:text-white transition" />
          </Link>
        </div>
      </div>
    );
  }

export default Detail;
