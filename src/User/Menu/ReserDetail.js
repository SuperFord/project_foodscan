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
      const response = await fetchWithAuth("/api/checkToken", {}, navigate);  // ใช้ fetchWithAuth ในการเช็ค token
      if (!response || !response.ok) {
        // ถ้า token ไม่ valid จะถูก redirect แล้ว ไม่ต้องทำต่อ
        return;
      }

      //ถ้า token ผ่านแล้ว ค่อยดึงชื่อร้าน
      try {
        const res = await fetchWithAuth("/api/Nrestaurant");
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
        const resp = await fetch('/api/user/payment-slips', {
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
    <div className="min-h-screen flex flex-col justify-between">
    {/* Header */}
    <div className="w-full flex bg-yellow-400 items-center justify-between p-4 text-white">
                  <FaArrowLeft className="text-3xl cursor-pointer ml-2" onClick={() => navigate("/user-menu")} />
      <div className="flex-grow text-3xl font-bold text-center p-2">รายละเอียดการจอง</div>
    </div>
      {/* Form รายละเอียดข้อมูลการจอง */}
      <div className="flex justify-center items-center p-4">
        <div className=" rounded-xl p-4 max-w-md w-full ">        
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
          <div className="rounded-xl border-2 border-gray-400 p-4 mb-4 ">
            <h3 className="text-xl font-semibold mb-2 border-b border-gray-400 pb-2">{restaurantName || ''}</h3>
            <p className="text-lg font-semibold mb-2"><strong>โต๊ะที่เลือก:</strong> <span className="text-yellow-500 font-semibold">{reservation.setable}</span></p>
            <p className="text-lg font-semibold mb-2"><strong>ชื่อผู้จอง:</strong> <span className="text-yellow-500 font-semibold">{reservation.username}</span></p>
            <p className="text-lg font-semibold mb-2"><strong>จำนวนคน:</strong> <span className="text-yellow-500 font-semibold">{reservation.people}</span></p>
            <p className="text-lg font-semibold mb-2"><strong>เวลานัด:</strong> <span className="text-yellow-500 font-semibold">{reservation.time}</span></p>
            <p className="text-lg font-semibold mb-2"><strong>วันที่นัด:</strong> <span className="text-yellow-500 font-semibold">{reservation.date}</span></p>
            <p className="text-lg font-semibold mb-2"><strong>รายละเอียดเพิ่มเติม:</strong> <span className="text-yellow-500 font-semibold">{reservation.detail || '-'}</span></p>
            <p className="text-lg font-semibold mb-2"><strong>รหัสอ้างอิง:</strong> <span className="text-yellow-500 font-semibold">LYG00001</span></p>
            {/* ตารางเเสดงข้อมสั่งอาหาร */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">รายการอาหาร</h4>
              <table className="w-full border border-black text-sm">
                <thead className="text-sm">
                  <tr>
                    <th className="border border-black px-2 py-1">รายการอาหาร</th>
                    <th className="border border-black px-2 py-1">จำนวน</th>
                    <th className="border border-black px-2 py-1">ราคาต่อหน่วย</th>
                    <th className="border border-black px-2 py-1">ราคา</th>
                  </tr>
                </thead>
                <tbody>
                  {reservation.foodorder.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black px-2 py-1">{item.name}</td>
                      <td className="border border-black px-2 py-1 text-center">{item.quantity}</td>
                      <td className="border border-black px-2 py-1 text-center">{item.price}</td>
                      <td className="border border-black px-2 py-1 text-center">{item.quantity * item.price}</td>
                    </tr>
                  ))}
                  <tr className=" font-semibold">
                    <td className="border border-black px-2 py-1 text-center" colSpan="3">ราคารวม</td>
                    <td className="border border-black px-2 py-1 text-center">{totalPrice}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
                          <button onClick={() => navigate("/user-menu")} className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-xl font-semibold">
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
