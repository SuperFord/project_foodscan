import React, { useState , useEffect } from 'react';
import { useNavigate , Link } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from 'sweetalert2'; // นำเข้า sweetalert2
import { FiHome, FiUser } from "react-icons/fi"; // ไอคอนแบบเดียวกับในภาพ figma
import { fetchWithAuth } from './fetchWithAuth';


function ChangePassword() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordMismatch, setPasswordMismatch] = useState(false);

    // เช็ค token ถ้าไม่มี token จะเปลี่ยนเส้นทางไปหน้า /User
    useEffect(() => {
      // เรียก API ดึง Token
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

    // ฟังก์ชันเปลี่ยนการมองเห็นของรหัสผ่าน
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
  
    const toggleConfirmPasswordVisibility = () => {
      setShowConfirmPassword(!showConfirmPassword);
    };
  
    // ฟังก์ชันการรีเซ็ตรหัสผ่าน
    const handlePasswordReset = async () => {
      const token = localStorage.getItem('token'); // ดึง token ที่เก็บไว้หลัง login
      
      // ตรวจสอบว่าผู้ใช้กรอกรหัสผ่านเป็นภาษาอังกฤษเท่านั้น
      const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+=[\]{}|;:'",.<>/?]+$/;
      if (!passwordRegex.test(password)) {
        setError("กรุณากรอกรหัสผ่านเป็นภาษาอังกฤษ ตัวเลขหรืออักขระพิเศษ");
        return;
      }
    
      // ตรวจสอบความยาวของรหัสผ่าน
      if (password.length <= 4) {
        setError("รหัสผ่านต้องมีความยาวมากกว่า 5 ตัว");
        return;
      }
    
      if (!password || !confirmPassword) {
        setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return;
      }
    
      if (password !== confirmPassword) {
        setPasswordMismatch(true);
        setError("รหัสผ่านไม่ตรงกัน");
        return;
      }
    
      setPasswordMismatch(false); // รีเซ็ตเมื่อรหัสผ่านตรงกัน
    
      try {
        const response = await fetch("http://localhost:5000/api/changepassword", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` // token ที่เก็บไว้ใน localStorage
          },
          body: JSON.stringify({ password: password }), // ส่งรหัสผ่านใหม่ไป
        });
    
        const data = await response.json();
    
        if (data.success) {
          // แสดง SweetAlert เมื่อเปลี่ยนรหัสผ่านสำเร็จ
          Swal.fire({
            title: 'สำเร็จ!',
            text: 'รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonText: 'ตกลง',
            timer: 1000, // รอ 1 วินาที แล้วไปหน้า Setting อัตโนมัติ
            timerProgressBar: true,
          }).then(() => {
            navigate('/user-setting'); // ไปยังหน้า setting หลังจากแจ้งเตือนสำเร็จ
          });
        } else {
          // แสดงข้อความเมื่อเกิดข้อผิดพลาด
          Swal.fire({
            title: 'ข้อผิดพลาด!',
            text: data.message,
            icon: 'error',
            confirmButtonText: 'ตกลง',
            timer: 1000, // รอ 1 วินาที แล้วไปหน้า Setting อัตโนมัติ
            timerProgressBar: true,
          });
          setError(data.message || "เกิดข้อผิดพลาด");
        }
      } catch (error) {
        // console.error("Password reset failed:", error);
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    };
  
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="w-full flex items-center justify-between bg-yellow-400 p-4 text-white relative">
          <FaArrowLeft
            className="text-2xl cursor-pointer"
            onClick={() => navigate("/user-setting")}
          />
          <h1 className="text-xl font-bold text-center flex-grow">รหัสผ่านเเละความปลอดภัย</h1>
        </div>
        {/* Form */}
        <div className="w-full max-w-md mt-6 px-10 rounded mx-auto">
          {/* กรอกรหัสผ่านใหม่ */}
          <div className="mb-4 py-4">
            <label htmlFor="password" className="block text-1xl font-bold text-black">กรอกรหัสผ่านใหม่</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordMismatch(confirmPassword !== e.target.value);
                  if (confirmPassword === e.target.value) {
                    setError('');
                  }
                }}
                className="w-full p-4 mt-1 border rounded-lg border-gray-300"
                placeholder="กรุณากรอกรหัสผ่านใหม่"
              />
              <div className="absolute right-2 top-2 text-4xl cursor-pointer" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>
          </div>
          {/* กรอกยืนยันรหัสผ่าน */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-1xl font-bold text-black">ยืนยันรหัสผ่านใหม่</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordMismatch(e.target.value !== password);
                  if (e.target.value === password) {
                    setError(''); // เคลียร์ error เมื่อรหัสตรงกัน
                  }
                }}
                className="w-full p-4 mt-1 border rounded-lg border-gray-300"
                placeholder="กรุณายืนยันรหัสผ่านใหม่"
              />
              <div className="absolute right-2 top-2 text-4xl cursor-pointer" onClick={toggleConfirmPasswordVisibility}>
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>
          </div>
          {/* ตรวจสอบรหัสผ่านตรงกัน */}
          {passwordMismatch && (
            <div className="text-red-500 text-xs">รหัสผ่านไม่ตรงกัน</div>
          )}
          {/* แสดงข้อผิดพลาดรหัสผ่าน */}
          {error && (
            <div className="text-red-500 text-sm py-4">{error}</div>
          )}
          {/* ปุ่มยืนยัน */}
          <button
            className={`w-full p-4 font-bold rounded-lg ${(!password || !confirmPassword) ? 'bg-yellow-200' : (password !== confirmPassword ? 'bg-yellow-300' : 'bg-yellow-400')} text-white`}
            onClick={handlePasswordReset}
            disabled={!password || !confirmPassword || password !== confirmPassword} // ปิดปุ่มเมื่อรหัสผ่านไม่ตรงกันหรือยังไม่กรอกข้อมูล
          >
            ยืนยันการเปลี่ยนรหัสผ่าน
          </button>
          
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

export default ChangePassword;
