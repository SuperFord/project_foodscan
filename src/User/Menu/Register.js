import React, { useState, useRef , useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash , FaArrowLeft } from "react-icons/fa";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

function Register() {
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const [otpInput, setOtpInput] = useState(["", "", "", "", "" ,""]); // เก็บค่า OTP 6 หลัก
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); // ใช้ state สำหรับเก็บข้อความแสดงข้อผิดพลาด
  const [isOTPStep, setIsOTPStep] = useState(false); // ขั้นตอน OTP
  const [otpExpiresAt, setOtpExpiresAt] = useState(null); // OTP หมด
  const [timeLeft, setTimeLeft] = useState(null);
  const [lastResendTime, setLastResendTime] = useState(null); // เพิ่ม state สำหรับติดตามการกดส่ง OTP ใหม่
  const [resendCooldown, setResendCooldown] = useState(0); // นับถอยหลัง cooldown
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
  
  const inputRefs = useRef([]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (!otpExpiresAt) {
      setTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((otpExpiresAt - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        MySwal.fire({
          icon: 'warning',
          title: 'รหัส OTP หมดอายุแล้ว',
          text: 'กรุณาลงทะเบียนใหม่',
        }).then(() => {
          setIsOTPStep(false);
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [otpExpiresAt]);

  useEffect(() => {
    if (lastResendTime) {
      const cooldownTimer = setInterval(() => {
        const now = Date.now();
        const timeSinceLastResend = Math.floor((now - lastResendTime) / 1000);
        const remainingCooldown = Math.max(0, 60 - timeSinceLastResend); // 60 วินาที cooldown
        setResendCooldown(remainingCooldown);

        if (remainingCooldown === 0) {
          clearInterval(cooldownTimer);
        }
      }, 1000);

      return () => clearInterval(cooldownTimer);
    }
  }, [lastResendTime]);

  // ฟังก์ชันตรวจสอบและกรองตัวเลข
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // อนุญาตให้กรอกแค่ตัวเลขและจำกัดที่ 10 ตัว
    if (/^\d{0,10}$/.test(value)) {
      setPhone(value);
    }
  };

  // ฟังก์ชันตรวจสอบการกรอกข้อมูลทุกช่อง
  const handleRegister = async () => {
    // ตรวจสอบว่าแต่ละช่องกรอกครบหรือไม่
    if (!username || !email || !phone || !password || !confirmPassword) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
  
    // เมื่อข้อมูลครบถ้วนแล้ว จะลบข้อความผิดพลาดออก
    setError('');
  
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, phone, password }),
      });

      const data = await response.json();

      if (data.status === "ok") {
        setIsOTPStep(true);
        setUserId(data.userId); // บันทึก userId เพื่อนำไปใช้ verify
        // หลังส่งสมัครสำเร็จ
        setOtpExpiresAt(Date.now() + 20 * 60 * 1000); // ให้หน้า OTP อยู่ได้ 20 นาที
        setLastResendTime(Date.now()); // เริ่ม cooldown 60 วินาทีแรก
      } else {
        setError(data.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otpInput];
      newOtp[index] = value;
      setOtpInput(newOtp);
      if (value && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && otpInput[index] === "") {
      if (index > 0) inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const newOtp = pasted.split("");
      setOtpInput(newOtp);
      newOtp.forEach((val, i) => {
        if (inputRefs.current[i]) inputRefs.current[i].value = val;
      });
    }
  };

  const isOtpComplete = () => otpInput.every(val => val !== "");

  //ยืนยัน OTP
  const handleOtpSubmit = async () => {
    if (!isOtpComplete()) return;

    const otp = otpInput.join("");

    try {
      const response = await fetch("http://localhost:5000/api/verify-otp", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (data.status === "ok") {
        await MySwal.fire({
          icon: 'success',
          title: 'สมัครสมาชิกสำเร็จ',
          text: 'กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...',
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/User/");
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'รหัส OTP ไม่ถูกต้อง',
          text: data.message || 'โปรดลองอีกครั้ง',
        });
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      MySwal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์',
      });
    }
  };
  //ส่ง OTP เข้า email อีกครั้ง
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const response = await fetch("http://localhost:5000/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.status === "ok") {
        const newExpireTime = Date.now() + 20 * 60 * 1000; // 20 นาที
        setOtpExpiresAt(newExpireTime);
        setLastResendTime(Date.now()); // สำหรับนับ cooldown 60 วินาที

        MySwal.fire({
          icon: "success",
          title: "ส่งรหัส OTP ใหม่เรียบร้อยแล้ว",
          timer: 2000,
        });
      } else {
        MySwal.fire({
          icon: "error",
          title: "ไม่สามารถส่งรหัส OTP ใหม่",
          text: data.message || "โปรดลองใหม่ภายหลัง",
        });
      }
    } catch (error) {
      console.error("Resend OTP failed:", error);
      MySwal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์",
      });
    }
  };

  // ส่วนเเสดงผล OTP
  if (isOTPStep) {
    return (
      <div className="w-full h-screen my-4 py-4 p-4 bg-white flex flex-col items-center">
        <div className="w-full flex items-center justify-between p-4 text-black">
          <FaArrowLeft className="text-2xl cursor-pointer" onClick={() => setIsOTPStep(false)} />
        </div>
        <div className="w-full max-w-md mt-6 p-6 rounded-lg border border-gray-300 shadow-md">
          <h2 className="text-center text-2xl font-bold text-black mb-4">กรุณาตรวจสอบที่อีเมลของคุณ</h2>
          <h2 className="text-center text-lg font-bold text-gray-600 mb-6">
            เราได้ส่งรหัส OTP ไปที่อีเมลของคุณแล้ว<br />กรอกรหัส 6 หลักที่ส่งไปในอีเมลของคุณ
          </h2>
          <div className="flex justify-center space-x-2 mb-6">
            {otpInput.map((val, index) => (
              <input
                key={index}
                type="text"
                value={val}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                onPaste={handleOtpPaste}
                maxLength={1}
                ref={(el) => (inputRefs.current[index] = el)}
                className={`w-16 h-16 text-center text-3xl border-2 rounded-lg ${
                  val ? "border-yellow-500" : "border-gray-300"
                }`}
                placeholder="-"
              />
            ))}
          </div>
          <button
            className={`w-full py-3 bg-yellow-500 text-white font-bold rounded-lg ${
              isOtpComplete() ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            }`}
            onClick={handleOtpSubmit}
            disabled={!isOtpComplete()}
          >
            ยืนยัน
          </button>
          <div className="text-center mt-4">
            <button
              className={`text-blue-500 underline ${resendCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleResendOtp}
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `สามารถส่งรหัสใหม่ได้ใน ${resendCooldown} วินาที`
                : 'ส่งรหัส OTP อีกครั้ง'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  //Form สมัครสมาชิก
  return (
    <div className="w-full h-screen flex flex-col items-center">
      <div className="full flex items-center justify-center p-14 text-white gap-10">
        <Link to="/User/" className="w-40 text-center text-xl font-bold text-gray-400 hover:text-yellow-500">ล็อคอิน</Link>
        <div className="w-40 text-center text-xl font-bold text-yellow-500 border-b-2 border-yellow-500">สมัครสมาชิก</div>
      </div>

      <div className="w-full max-w-md mt-6 px-10 rounded">
        <div className="mb-4">
          <label htmlFor="username" className="block text-1xl font-bold text-black">ชื่อ - สกุล</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-4 mt-1 border rounded-lg border-gray-300" placeholder="กรุณากรอกชื่อผู้ใช้" />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-1xl font-bold text-black">อีเมล</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 mt-1 border rounded-lg border-gray-300" placeholder="กรุณากรอกอีเมล" />
        </div>
        <div className="mb-4">
          <label htmlFor="phone" className="block text-1xl font-bold text-black">เบอร์โทรศัพท์</label>
          <input type="text" id="phone" value={phone} onChange={handlePhoneChange} className="w-full p-4 mt-1 border rounded-lg border-gray-300" placeholder="กรุณากรอกเบอร์โทรศัพท์" maxLength={10} />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-1xl font-bold text-black">รหัสผ่าน</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 mt-1 border rounded-lg border-gray-300" placeholder="กรุณากรอกรหัสผ่าน" />
            <div className="absolute right-2 top-2 text-4xl cursor-pointer" onClick={togglePasswordVisibility}>{showPassword ? <FaEye /> : <FaEyeSlash />}</div>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="confirmpassword" className="block text-1xl font-bold text-black">ยืนยันรหัสผ่าน</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} id="confirmpassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-4 mt-1 border rounded-lg border-gray-300" placeholder="กรุณากรอกรหัสผ่านให้ตรงกัน" />
            <div className="absolute right-2 top-2 text-4xl cursor-pointer" onClick={togglePasswordVisibility}>{showPassword ? <FaEye /> : <FaEyeSlash />}</div>
          </div>
        </div>
        {password !== confirmPassword && confirmPassword !== '' && (
          <div className="text-red-500 text-2sm">รหัสผ่านไม่ตรงกัน</div>
        )}
        {error && <div className="text-red-500 text-xs">{error}</div>}
        <button className="w-full my-6 p-4 bg-yellow-400 text-white font-bold rounded-lg" onClick={handleRegister}>สมัครสมาชิก</button>
        <label className="block text-1xl text-center text-zinc-600 ">
          มีบัญชีอยู่เเล้ว?{' '}
          <Link to="/User/" className="text-blue-500 hover:text-blue-700">
            ล็อคอิน
          </Link>
        </label>
      </div>
    </div>
  );
}

export default Register;
