import React, { useState, useEffect } from 'react';
import { buildUrl } from '../../utils/api';
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { jwtDecode } from 'jwt-decode'; // Corrected import statement

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState(''); // อีเมล
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tokenExpired, setTokenExpired] = useState(false); // แก้ชื่อ state จาก setTokenExpired เป็น tokenExpired
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(buildUrl('/api/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // ถ้าเข้าสู่ระบบสำเร็จ
        localStorage.setItem('token', data.token); // เก็บ JWT token ไว้ใน localStorage
        localStorage.setItem('username', username); // เก็บชื่อผู้ใช้
        if (data.sessionExpiresAt) {
          localStorage.setItem('sessionExpiresAt', String(data.sessionExpiresAt));
        }
        navigate("/user-menu"); // รีไดเรกต์ไปหน้า Menu
      } else {
        setError(data.message || "ข้อมูลไม่ถูกต้อง");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token); // ใช้ jwtDecode เพื่อดึงข้อมูลจาก token
        const expiryTime = decoded.exp * 1000; // คำนวณเวลา expiry ในหน่วยมิลลิวินาที
  
        if (expiryTime < Date.now()) {
          // ถ้า token หมดอายุแล้ว
          localStorage.removeItem('token'); // ลบ token ออกจาก localStorage
          setTokenExpired(true); // ตั้งค่า state เพื่อแสดงข้อความแจ้งเตือน
          navigate("/user"); // เปลี่ยนเส้นทางไปที่หน้า login
        } else {
          // ถ้า token ยังไม่หมดอายุ, รีไดเรกต์ไปที่หน้า Menu โดยอัตโนมัติ
          navigate("/user-menu");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [navigate]);  

  return (
    <div className="w-full h-screen bg-white flex flex-col">
      {/* Header (shared) */}
      <div className="w-full flex items-center justify-center p-8 text-white gap-10 bg-gradient-to-r from-yellow-400 to-yellow-500 shadow">
        <Link to="/user" className="w-40 text-center text-xl font-bold text-white border-b-2 border-white/80">
          ล็อคอิน
        </Link>
        <Link to="/user-register" className="w-40 text-center text-xl font-bold text-white/80 hover:text-white">
          สมัครสมาชิก
        </Link>
      </div>

      {/* Form container - positioned higher */}
      <div className="flex-1 flex items-start justify-center px-4 pt-16">
        <div className="w-full max-w-md p-6 bg-white rounded-xl shadow border border-gray-100">
        {tokenExpired && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
            เซสชันหมดอายุ กรุณาล็อกอินใหม่
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">อีเมล</label>
          <input
            type="text"
            id="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent border-gray-300"
            placeholder="กรุณากรอกอีเมล"
            disabled={isLoading}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent border-gray-300"
              placeholder="กรุณากรอกรหัสผ่าน"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl cursor-pointer text-gray-500" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </div>
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
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
          <Link to="/user-request-reset" className="text-yellow-600 hover:text-yellow-700">
            ลืมรหัสผ่าน?
          </Link>
        </div>
        <button
          className={`w-full p-3 text-white font-bold rounded-xl flex items-center justify-center ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading && <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>}
          {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
        <label className="block text-sm text-center text-zinc-600 p-6">
          ยังไม่มีบัญชีใช่หรือไม่?{' '}
          <Link to="/user-register" className="text-blue-500 hover:text-blue-700">
            สมัครสมาชิก
          </Link>
        </label>
        </div>
      </div>
    </div>
  );
}

export default Login;
