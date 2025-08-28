import { buildUrl } from '../../utils/api';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';

function RequestReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRequest = async () => {
    if (!email) {
      setMessage('กรุณากรอกอีเมล');
      return;
    }

    try {
      const res = await fetch(buildUrl('/api/request-reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error sending reset request:", error);
      setMessage("ไม่สามารถส่งคำขอได้ กรุณาลองใหม่");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-yellow-600 mb-6">🔐 รีเซ็ตรหัสผ่าน</h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
            อีเมลของคุณ
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              placeholder="กรอกอีเมลที่ลงทะเบียนไว้"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
          </div>
        </div>

        <button
          onClick={handleRequest}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold transition duration-300"
        >
          ส่งลิงก์รีเซ็ตรหัสผ่าน
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-green-600 font-medium">{message}</p>
        )}

        <button
                      onClick={() => navigate('/user-login')}
          className="mt-4 text-sm text-gray-500 hover:text-yellow-500 transition"
        >
          🔙 กลับไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    </div>
  );
}

export default RequestReset;
