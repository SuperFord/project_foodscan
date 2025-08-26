import React, { useState } from 'react';
import { API_BASE } from "../../config";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/restaurant/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // บันทึก token และข้อมูล admin ลง localStorage
        localStorage.setItem('restaurantToken', data.token);
        localStorage.setItem('restaurantAdmin', JSON.stringify(data.admin));
        
        // นำทางไปยังหน้า Menu
        navigate("/Restaurant/Menu");
      } else {
        setErrorMessage(data.message || 'เกิดข้อผิดพลาดในการล็อกอิน');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-yellow-500 p-4 text-white">
        <FaArrowLeft
          className="text-2xl cursor-pointer"
          onClick={() => navigate("/")}
        />
        <h1 className="text-xl font-bold text-center flex-grow">ลงชื่อเข้าใช้</h1>
      </div>

      {/* Form */}
      <div className="w-full max-w-md mt-6 p-4 bg-gray-100 rounded">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mt-1 border rounded border-gray-300"
            placeholder="กรุณากรอกชื่อผู้ใช้"
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mt-1 border rounded border-gray-300"
              placeholder="กรุณากรอกรหัสผ่าน"
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <div className="absolute right-2 top-2 text-xl cursor-pointer" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </div>

        <button
          className={`w-full p-3 text-white font-bold rounded-xl ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500'
          }`}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'ยืนยัน'}
        </button>

        {/* ข้อมูลสำหรับทดสอบ */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <p className="font-semibold mb-2">ข้อมูลสำหรับทดสอบ:</p>
          <p>Username: admin1, Password: admin1234</p>
          <p>Username: admin2, Password: admin5678</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
