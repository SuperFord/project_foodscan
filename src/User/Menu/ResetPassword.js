import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async () => {
    setError('');
    setMessage('');

    const trimmedPassword = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedPassword || !trimmedConfirm) {
      setError('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    if (trimmedPassword.length < 5) {
      setError('รหัสผ่านต้องมีอย่างน้อย 5 ตัวอักษร');
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: trimmedPassword }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setTimeout(() => navigate('/User/Login'), 2000);
      } else {
        setError(data.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
      }
    } catch (err) {
      console.error('Reset error:', err);
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-yellow-600 mb-6">
          🔒 ตั้งรหัสผ่านใหม่
        </h2>

        {/* รหัสผ่านใหม่ */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">รหัสผ่านใหม่</label>
          <div className="relative">
            <input
              type="password"
              placeholder="รหัสผ่านใหม่ (อย่างน้อย 5 ตัวอักษร)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <FaLock className="absolute top-3 left-3 text-gray-400" />
          </div>
        </div>

        {/* ยืนยันรหัสผ่าน */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">ยืนยันรหัสผ่าน</label>
          <div className="relative">
            <input
              type="password"
              placeholder="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <FaLock className="absolute top-3 left-3 text-gray-400" />
          </div>
        </div>

        {/* ปุ่ม */}
        <button
          onClick={handleReset}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold transition duration-300"
        >
          บันทึกรหัสผ่านใหม่
        </button>

        {/* ข้อความแจ้งเตือน */}
        {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
        {message && <p className="mt-4 text-green-600 text-sm text-center">{message}</p>}

        <button
          onClick={() => navigate('/User/Login')}
          className="mt-4 text-sm text-gray-500 hover:text-yellow-500 transition"
        >
          🔙 กลับไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
