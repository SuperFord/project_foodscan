import React, { useState } from 'react';
import { API_BASE } from "../../config";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";

function ForgetPassword() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordMismatch, setPasswordMismatch] = useState(false); // สำหรับตรวจสอบความไม่ตรงกันของรหัส
  
    // ฟังก์ชันเปลี่ยนการมองเห็นของรหัสผ่าน
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
  
    const toggleConfirmPasswordVisibility = () => {
      setShowConfirmPassword(!showConfirmPassword);
    };
  
    // ฟังก์ชันการรีเซ็ตรหัสผ่าน
    const handlePasswordReset = async () => {
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
        const response = await fetch(`${API_BASE}/forget-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });
  
        const data = await response.json();
  
        if (data.success) {
          navigate('/login'); // ไปยังหน้า login หลังจากรีเซ็ตรหัสผ่านสำเร็จ
        } else {
          setError(data.message || "เกิดข้อผิดพลาด");
        }
        
      } catch (error) {
        console.error("Password reset failed:", error);
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    };
  
    return (
      <div className="w-full h-screen bg-white flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between bg-yellow-400 p-4 text-white">
          <FaArrowLeft
            className="text-2xl cursor-pointer"
            onClick={() => navigate("/User/")}
          />
          <h1 className="text-xl font-bold text-center flex-grow">รหัสผ่านเเละความปลอดภัย</h1>
        </div>
  
        {/* Form */}
        <div className="w-full max-w-md mt-6 px-10 rounded">

          {/* กรอกรหัสผ่านใหม่ */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-1xl font-bold text-black">กรอกรหัสผ่านใหม่</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 mt-1 border rounded-lg border-gray-300"
                placeholder="กรุณายืนยันรหัสผ่านใหม่"
              />
              <div className="absolute right-2 top-2 text-4xl cursor-pointer" onClick={toggleConfirmPasswordVisibility}>
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>
          </div>

          {/* ตรวจสอบรหัสผ่านตรงกัน */}
          {password !== confirmPassword && confirmPassword !== '' && (
            <div className="text-red-500 text-xs">รหัสผ่านไม่ตรงกัน</div>
          )}

          {/* ปุ่มยืนยัน */}
          <button
            className={`w-full p-4 font-bold rounded-lg ${(!password || !confirmPassword) ? 'bg-yellow-200' : (password !== confirmPassword ? 'bg-yellow-300' : 'bg-yellow-500')} text-white`}
            onClick={handlePasswordReset}
            disabled={!password || !confirmPassword || password !== confirmPassword} // ปิดปุ่มเมื่อรหัสผ่านไม่ตรงกันหรือยังไม่กรอกข้อมูล
          >
            ยืนยันการเปลี่ยนรหัสผ่าน
          </button>
        </div>
      </div>
    );
}

export default ForgetPassword;