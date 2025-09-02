import React , { useState , useEffect} from 'react';
import { useLocation, useNavigate , Link } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";
import { FiHome, FiUser } from "react-icons/fi"; // ไอคอนแบบเดียวกับในภาพ figma
import Swal from 'sweetalert2';
import { fetchWithAuth } from './fetchWithAuth';

function ReserDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');  // ดึง JWT token จาก localStorage
  const reservation = location.state?.reservation;
  const [restaurantName, setRestaurantName] = useState('');
  const [paymentStatusBanner, setPaymentStatusBanner] = useState(null); // { type: 'pending'|'approved'|'rejected', text: string }

  useEffect(() => {
    //เช็ค token ว่ามีการ login มายัง
    const checkAuthAndData = async () => {
      const response = await fetchWithAuth("http://localhost:5000/api/checkToken", {}, navigate);  // ใช้ fetchWithAuth ในการเช็ค token
      if (!response || !response.ok) {
        // ถ้า token ไม่ valid จะถูก redirect แล้ว ไม่ต้องทำต่อ
        return;
      }

      //ถ้า token ผ่านแล้ว ค่อยดึงชื่อร้าน
      try {
        const res = await fetchWithAuth("http://localhost:5000/api/Nrestaurant");
        const data = await res.json();
        setRestaurantName(data.name); // สมมติว่า API ส่ง { name: 'ชื่อร้าน' }
      } catch (error) {
        // console.error("Error fetching restaurant name:", error);
      }

      // ✅ ตรวจสอบข้อมูลการจองหลังจาก token ผ่านแล้ว
      if (!reservation) {
        Swal.fire({
          icon: 'warning',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่พบข้อมูลการจอง',
          confirmButtonText: 'ตกลง',
          timer: 1000,
          timerProgressBar: true,
        }).then(() => {
          navigate("/user");
        });
      }

      // ดึงสถานะสลิปของผู้ใช้ล่าสุดเพื่อแสดงแบนเนอร์สถานะ
      try {
        const token = localStorage.getItem('token');
        const resp = await fetch('http://localhost:5000/api/user/payment-slips', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const slipData = await resp.json();
        if (slipData.success && Array.isArray(slipData.slips)) {
          // ถ้ามี payment_slip_id ใน reservation ให้จับคู่ก่อน ไม่งั้นใช้สลิปล่าสุด
          const matched = reservation.payment_slip_id
            ? slipData.slips.find(s => String(s.id) === String(reservation.payment_slip_id))
            : slipData.slips[0];
          if (matched) {
            if (matched.status === 'pending') {
              setPaymentStatusBanner({ type: 'pending', text: 'กำลังรอการอนุมัติการชำระเงินจากร้าน โปรดรอการยืนยัน' });
            } else if (matched.status === 'approved' || matched.status === 'used') {
              setPaymentStatusBanner({ type: 'approved', text: 'ชำระเงินได้รับการยืนยันแล้ว ระบบได้บันทึกการจองของคุณ' });
            } else if (matched.status === 'rejected') {
              // ตรวจสอบว่ามีรายการสั่งอาหารหรือไม่ ถ้าไม่มีก็ไม่แสดงข้อความการปฏิเสธ
              if (reservation.foodorder && reservation.foodorder.length > 0) {
                setPaymentStatusBanner({ type: 'rejected', text: 'การชำระเงินถูกปฏิเสธ การจองถูกยกเลิก หากสงสัยโปรดติดต่อร้าน' });
              }
            }
          }
        }
      } catch (err) {
        // Error handling without console.log
      }
    };
  
    checkAuthAndData();
  }, [reservation, navigate]);

  if (!reservation) {
    // return null เพื่อป้องกันการ render JSX ด้านล่างก่อน Swal ทำงาน
    return null;
  }

  const totalPrice = reservation.foodorder.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
    {/* Header */}
    <div className="w-full flex bg-yellow-400 items-center justify-between p-4 text-white shadow-md">
                  <FaArrowLeft className="text-3xl cursor-pointer ml-2 hover:text-yellow-200 transition-colors" onClick={() => navigate("/user-menu")} />
      <div className="flex-grow text-3xl font-bold text-center p-2">รายละเอียดการจอง</div>
    </div>
      {/* Form รายละเอียดข้อมูลการจอง */}
      <div className="flex justify-center items-center p-4 flex-1">
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
          <div className="rounded-xl border-2 border-gray-400 p-4 mb-4 bg-white shadow-lg">
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-400 pb-2 text-center text-gray-800">{restaurantName || 'ร้านอาหาร'}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">โต๊ะที่เลือก:</span>
                <span className="text-yellow-600 font-semibold">{reservation.setable}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">ชื่อผู้จอง:</span>
                <span className="text-yellow-600 font-semibold">{reservation.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">จำนวนคน:</span>
                <span className="text-yellow-600 font-semibold">{reservation.people} คน</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">เวลานัด:</span>
                <span className="text-yellow-600 font-semibold">{reservation.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">วันที่นัด:</span>
                <span className="text-yellow-600 font-semibold">{reservation.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">รายละเอียดเพิ่มเติม:</span>
                <span className="text-yellow-600 font-semibold">{reservation.detail || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">รหัสอ้างอิง:</span>
                <span className="text-yellow-600 font-semibold">LYG{reservation.reservationId || '00001'}</span>
              </div>
            </div>
            
            {/* ตารางแสดงข้อมูลสั่งอาหาร */}
            {reservation.foodorder && reservation.foodorder.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3 text-center text-gray-800">รายการอาหาร</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 text-sm rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-3 py-2 text-left">รายการอาหาร</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">จำนวน</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">ราคาต่อหน่วย</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">ราคา</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservation.foodorder.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2">{item.name}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">{item.price} บาท</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity * item.price} บาท</td>
                        </tr>
                      ))}
                      <tr className="bg-yellow-50 font-semibold">
                        <td className="border border-gray-300 px-3 py-2 text-center" colSpan="3">ราคารวม</td>
                        <td className="border border-gray-300 px-3 py-2 text-center text-yellow-600">{totalPrice} บาท</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
                          <button onClick={() => navigate("/user-menu")} className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl">
            กลับหน้าหลัก
          </button>
        </div>
      </div>
      {/* แถบนำทางด้านล่าง */}
      <div className="bg-gray-900 text-white flex justify-around items-center py-4 mt-auto">
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

export default ReserDetail;
