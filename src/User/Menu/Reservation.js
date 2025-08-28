import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { fetchWithAuth } from './fetchWithAuth';
import Swal from 'sweetalert2';

function Reservation() {
  const navigate = useNavigate();
  const location = useLocation();

  const [autoTime, setAutoTime] = useState("");

  const [peopleCount, setPeopleCount] = useState(1);
  const [time, setTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [selectedTables, setSelectedTables] = useState(location.state?.selectedTables || []);
  const [joinTables, setJoinTables] = useState(location.state?.joinTables || false);
  const [fullName, setFullName] = useState("");  // สถานะสำหรับเก็บชื่อ-สกุล
  const [email, setEmail] = useState("");  // สถานะสำหรับเก็บชื่อ-สกุล
  const [cart, setCart] = useState(location.state?.cart || []);  // Add state for cart
  const [additionalDetails, setAdditionalDetails] = useState(""); // รายละเอียด

  const token = localStorage.getItem('token');  // ดึง JWT token จาก localStorage

  const increasePeople = () => setPeopleCount(prev => prev + 1);
  const decreasePeople = () => setPeopleCount(prev => (prev > 1 ? prev - 1 : 1));

  // ดึงข้อมูลชื่อ-สกุลจากฐานข้อมูลโดยใช้ token
  useEffect(() => {
    const checkAuthAndData = async () => {
      const response = await fetchWithAuth("http://localhost:5000/api/checkToken", {}, navigate);  
      if (!response || !response.ok) {
        // ถ้า token ไม่ valid จะถูก redirect แล้ว ไม่ต้องทำต่อ
        return;
      }
  
      // ✅ token valid แล้ว ค่อย fetch user data
      const userRes = await fetchWithAuth("http://localhost:5000/api/user");
      if (userRes) {
        const data = await userRes.json();
        if (data.success) {
          setFullName(data.user.fullName);
          setEmail(data.user.email);
        } else {
          console.error("Error fetching user data:", data.message);
        }
      }
  
      // ✅ แล้วค่อยเช็คว่าเลือกโต๊ะหรือยัง
      if (
        selectedTables.length === 0 ||
        selectedTables.some(table => !table.label.trim())
      ) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'กรุณาเลือกโต๊ะก่อนทำการจอง',
          confirmButtonText: 'ตกลง',
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          navigate("/user-reser-table");
        });
      }
    };
  
    checkAuthAndData();
  }, [selectedTables, navigate]);

  useEffect(() => {
  const fetchTimeRequired = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/table_layout");
      const data = await res.json();

      if (data.success) {
        const tables = data.tables;
        const selectedLabels = selectedTables.map(t => t.label);
        const matched = tables.find(t => selectedLabels.includes(t.tname) || selectedLabels.includes(t.tnumber?.toString()));
        
        if (matched?.time_required) {
          setAutoTime(matched.time_required);
          setTime(matched.time_required); // ตั้งค่าจริงไปใช้ตอนส่งข้อมูลด้วย
        }
      }
    } catch (err) {
      console.error("❌ Error fetching time_required:", err);
    }
  };

  fetchTimeRequired();
}, [selectedTables]);


  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('th-TH'); // รูปแบบวันที่ไทย (DD/MM/YYYY)
    setCurrentDate(formattedDate);

  }, [navigate]);

  const handleReservation = async () => {
    if (!time) {
      alert("กรุณาเลือกเวลาในการจอง");
      return;
    }

    const reservationData = {
      username: fullName,  // ใช้ชื่อ-สกุลที่ดึงมาจากฐานข้อมูล
      Email: email,  // ใช้ชื่อ-สกุลที่ดึงมาจากฐานข้อมูล
      people: peopleCount,
      date: currentDate,
      email: email,
      time: time,
      setable: `${selectedTables.map(table => table.label).join(", ")}${joinTables && selectedTables.length > 1 ? " (ต่อโต๊ะ)" : ""}`,
      detail: additionalDetails,
      foodorder: cart, // รายละเอียดเพิ่มเติม
      tables: selectedTables.map(table => table.label), // สมมติว่าใช้ ID ของโต๊ะเพื่ออัปเดตสถานะ
      status: 2,  // เปลี่ยนสถานะเป็น 2 (โต๊ะถูกจองแล้ว)
    };

    try {
      const response = await fetch("http://localhost:5000/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // เพิ่มบรรทัดนี้
        },
        body: JSON.stringify(reservationData),
        
      });

      const result = await response.json();
      if (result.success) {
        alert("จองโต๊ะสำเร็จ");
        navigate("/user-reser-detail", {
          state: {
            reservation: reservationData
          }
        }); // กลับไปยังหน้า Menu
      } else {
        alert("เกิดข้อผิดพลาดในการจองโต๊ะ");
      }
    } catch (error) {
      console.error("Error making reservation:", error);
    }
  };

  // การส่ง cart กลับไปที่ ReserFood
  const handleEditMenu = () => {
    navigate("/user-reser-food", {
      state: {
        fromPage: "/user-reservation",
        selectedTables: selectedTables,
        fullName: fullName,
        email: email,
        peopleCount: peopleCount,
        setable: selectedTables.map(table => table.label).join(", ") +
          (joinTables && selectedTables.length > 1 ? " (ต่อโต๊ะ)" : ""),
        cart: cart,  // ส่ง cart ไปยัง ReserFood เพื่อให้แก้ไข
        time: time,  // เพิ่มค่าเวลา
        additionalDetails: additionalDetails,  // เพิ่มรายละเอียดเพิ่มเติม
        joinTables: joinTables, // ส่ง joinTables
      }
    });
  };

  // การรับข้อมูลจาก ReserFood (ถ้ามีการแก้ไขใน cart)
  useEffect(() => {
    if (location.state?.cart) setCart(location.state.cart);
    if (location.state?.peopleCount) setPeopleCount(location.state.peopleCount);
    if (location.state?.time) setTime(location.state.time);
    if (location.state?.additionalDetails) setAdditionalDetails(location.state.additionalDetails);
    if (location.state?.joinTables !== undefined) {
      setJoinTables(location.state.joinTables); // ตรวจสอบ joinTables ที่มาจาก state
    }
    if (location.state?.selectedTables) {
      setSelectedTables(location.state.selectedTables); // ตรวจสอบ selectedTables
    }
  }, [location.state]);

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center font-sans">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 text-black">
                    <FaArrowLeft className="text-2xl cursor-pointer ml-2" onClick={() => navigate("/user-reser-table")} />
        <div className="flex-grow text-3xl font-bold text-center p-2">
          จองโต๊ะ
          <div className="w-5/6 h-0.5 bg-slate-200 mx-auto mt-1"></div>
        </div>
      </div>
      {/* Form */}
      <div className="w-11/12 max-w-md bg-white mt-4 text-black space-y-4">
        {/* กรอกรายละเอียดการจอง */}
        <div className="flex justify-between items-center">
          <label className="text-2xl font">กรอกรายละเอียดการจอง</label>
        </div>
        <br></br>
        <div className="flex justify-between items-center">
          <label className="text-2sm font">ชื่อ-สกุล</label>
          <div>{fullName || ""}</div> {/* แสดงชื่อ-สกุลจากฐานข้อมูล */}
        </div>
        <div className="flex justify-between items-center">
          <label className="text-2sm font">จำนวนคน</label>
          <div className="flex items-center space-x-4">
            <button onClick={decreasePeople} className="w-12 h-12 bg-gray-200 rounded">-</button>
            <input
              type="number"
              min="1"
              value={peopleCount}
              onChange={(e) => {
                const value = Math.max(1, parseInt(e.target.value) || 1);
                setPeopleCount(value);
              }}
              className="w-16 text-center border border-gray-300 rounded py-2"
            />
            <button onClick={increasePeople} className="w-12 h-12 bg-gray-200 rounded">+</button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <label className="text-2sm font">วันที่</label>
          <div>{currentDate}</div>
        </div>
        
        <div className="flex justify-between items-center">
          <label className="text-2sm font">เวลา</label>
          <div>{autoTime || "กำลังโหลด..."}</div>
        </div>

        <div className="flex justify-between items-center">
          <label className="text-2sm font">โต๊ะที่เลือก</label>
          <div>
            {selectedTables.map(table => table.label).join(", ")}{" "}
            {joinTables && selectedTables.length > 1 ? "(ต่อโต๊ะ)" : ""}
          </div>
        </div>
        <div>
          <input
            type="text"
            placeholder="รายละเอียดเพิ่มเติม"
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            className="mt-3 border border-gray-300 rounded px-2 py-3 w-full"
          />
        </div>
        {/* รายการอาหาร */}
        <div className="mt-6">
          {cart.length === 0 ? (
          <p className="text-gray-500">
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={handleEditMenu}
            >
              ต้องการสั่งอาหารล่วงหน้า
            </button>
          </p>
        ) : (
          <div className="flex justify-between items-center">
            <h2 className="text-2sm mb-2">รายการอาหารที่สั่ง</h2>
            <button
              className="text-blue-500 hover:text-blue-700 mb-2"
              onClick={handleEditMenu}
            >
              แก้ไขรายการอาหาร
            </button>
          </div>
        )}
        {cart.length > 0 && (
          <table className="w-full border text-sm">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="py-2 px-3">ชื่อเมนู</th>
                <th className="py-2 px-3">จำนวน</th>
                <th className="py-2 px-3">ราคาต่อหน่วย</th>
                <th className="py-2 px-3">ราคา</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 px-3">{item.name}</td>
                  <td className="py-2 px-3">{item.quantity}</td>
                  <td className="py-2 px-3">{item.price} บาท</td>
                  <td className="py-2 px-3">{item.quantity * item.price} บาท</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-yellow-100">
                <td colSpan="3" className="py-2 px-3 text-left">ราคารวม</td>
                <td className="py-2 px-3">
                  {cart.reduce((sum, item) => sum + item.quantity * item.price, 0)} บาท
                </td>
              </tr>
            </tfoot>
          </table>
        )}
        </div>
        <div className="mt-6">
          <button
            className={`w-full max-w-md ${!time ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-400'} text-white py-4 rounded-xl text-lg font-semibold mx-auto`}
            onClick={handleReservation}
            disabled={!time} // ✅ ปิดปุ่มถ้าไม่ได้เลือกเวลา
          >
            ยืนยันการจอง
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reservation;
