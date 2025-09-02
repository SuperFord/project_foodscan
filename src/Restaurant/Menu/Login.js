import React, { useEffect, useState } from 'react';
import { buildUrl } from '../../utils/api';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // หากล็อกอินอยู่แล้วให้เด้งเข้าหน้าเมนู
  useEffect(() => {
    const existingToken = localStorage.getItem('restaurantToken');
    if (existingToken) {
      navigate('/restaurant-menu');
    }
  }, [navigate]);

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
      const response = await fetch(buildUrl('/api/restaurant/login'), {
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
        if (data.sessionExpiresAt) {
          localStorage.setItem('sessionExpiresAt', String(data.sessionExpiresAt));
        }
        
        // นำทางไปยังหน้า Menu
        navigate("/restaurant-menu");
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
      <div className="w-full flex items-center justify-between bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 text-white shadow">
        <FaArrowLeft
          className="text-2xl cursor-pointer"
          onClick={() => navigate("/")}
        />
        <h1 className="text-xl font-bold text-center flex-grow">ลงชื่อเข้าใช้ผู้ดูแลร้าน</h1>
      </div>

      {/* Form */}
      <div className="w-full max-w-md mt-8 p-6 bg-white rounded-xl shadow border border-gray-100">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
          <div className="relative mt-1">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${errorMessage && (!username || !password) ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="กรุณากรอกชื่อผู้ใช้"
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              autoFocus
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              @
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${errorMessage && (!username || !password) ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="กรุณากรอกรหัสผ่าน"
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xl cursor-pointer text-gray-500" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="rounded text-yellow-500 mr-2"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              disabled={isLoading}
            />
            จดจำการเข้าสู่ระบบ
          </label>
          <button
            type="button"
            className="text-yellow-600 hover:text-yellow-700"
            onClick={() => navigate('/restaurant-login')}
          >
            ลืมรหัสผ่าน?
          </button>
        </div>

        <button
          className={`w-full p-3 text-white font-bold rounded-xl flex items-center justify-center ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
          }`}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading && (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
          )}
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
