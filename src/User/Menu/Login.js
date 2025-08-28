import React, { useState, useEffect } from 'react';
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/login', {
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
        navigate("/user-menu"); // รีไดเรกต์ไปหน้า Menu
      } else {
        setError(data.message || "ข้อมูลไม่ถูกต้อง");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
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
          alert('Session ของคุณหมดอายุแล้ว กรุณาล็อกอินใหม่'); // แจ้งเตือน
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
    <div className="w-full h-screen flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-center p-14 text-white gap-10">
        <Link to="/user" className="w-40 text-center text-xl font-bold text-yellow-500 border-b-2 border-yellow-500">
          ล็อคอิน
        </Link>
        <Link to="/user-register" className="w-40 text-center text-xl font-bold text-gray-400 hover:text-yellow-500">
          สมัครสมาชิก
        </Link>
      </div>

      {/* Form */}
      <div className="w-full max-w-md mt-6 px-10 rounded">
        {/* Check for token expiration */}
        
        <div className="mb-4">
          {/* กรอกอีเมล */}
          <label htmlFor="email" className="block text-1xl font-bold text-black">อีเมล</label>
          <input
            type="text"
            id="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-4 mt-1 border rounded-lg border-gray-300"
            placeholder="กรุณากรอกอีเมล"
          />
        </div>
        {/* กรอกรหัส */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-1xl font-bold text-black">รหัสผ่าน</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 mt-1 border rounded-lg border-gray-300"
              placeholder="กรุณากรอกรหัสผ่าน"
            />
            <div className="absolute right-2 top-2 text-4xl cursor-pointer" onClick={togglePasswordVisibility}>
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
          </div>
        </div>
        {/* ข้อความแสดงกรอกข้อมูลให้ครบ */}
        {error && <div className="text-red-500 text-xs">{error}</div>}
        {/* ลิงค์ลืมรหัส */}
        <label className="block text-1xl text-right text-zinc-600 p-3 my-4">
          {/* <Link to="/User/ForgetPassword" className="text-blue-500 hover:text-blue-700">
            ลืมรหัสผ่าน
          </Link> */}

          <Link to="/user-request-reset" className="text-blue-500 hover:text-blue-700">
            ลืมรหัสผ่าน
          </Link>

        </label>
        {/* ปุ่ม */}
        <button
          className="w-full p-4 bg-yellow-400 text-white font-bold rounded-lg"
          onClick={handleLogin}
        >
          เข้าสู่ระบบ
        </button>
        {/* สมัครสมาชิก */}
        <label className="block text-1xl text-center text-zinc-600 p-6">
          ยังไม่มีบัญชีใช่หรือไม่?{' '}
          <Link to="/User/Register" className="text-blue-500 hover:text-blue-700">
            สมัครสมาชิก
          </Link>
        </label>
      </div>
    </div>
  );
}

export default Login;
