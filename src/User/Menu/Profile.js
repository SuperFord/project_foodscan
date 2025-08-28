import { buildUrl } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { FiHome, FiUser, FiMail, FiPhone, FiEdit2, FiSave } from "react-icons/fi";
import Swal from 'sweetalert2';
import { fetchWithAuth } from './fetchWithAuth';

function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [editingField, setEditingField] = useState(null); // ฟิลด์ที่กำลังแก้ไข
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const token = localStorage.getItem("token"); // ดึง token จาก localStorage

  useEffect(() => {
    // เรียก API ดึง Token
    const checkToken = async () => {
      const response = await fetchWithAuth("/api/checkToken", {}, navigate);  // ใช้ fetchWithAuth ในการเช็ค token
      if (!response) {
        // fetchWithAuth จะ redirect ไป /User ให้อยู่แล้วถ้า token หมดอายุ
        return;
      }
      if (!response.ok) {
        console.error("Token invalid or other error");
      }
    };
  
    // เรียก API ดึงข้อมูลผู้ใช้
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(buildUrl('/api/profile'), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // ส่ง token ไปใน header
          },
        });

        const data = await response.json();
        if (data.success) {
          const { username, email, phone } = data.user;
          setName(username);
          setEmail(email);
          setPhone(phone);
          setNewName(username);  // กำหนดค่าเริ่มต้นสำหรับการแก้ไข
          setNewEmail(email);
          setNewPhone(phone);
        } else {
          setError(data.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    };

    checkToken();
    fetchUserProfile();
  }, [navigate]);

  // ฟังก์ชันเริ่มการแก้ไขข้อมูล
  const handleEdit = () => {
    setEditingField(true);
  };

  // บันทึกข้อมูลทุกช่องพร้อมกัน
  const handleSave = async () => {
    const token = localStorage.getItem("token");
  
    if (!newName.trim() || !newEmail.trim() || !newPhone.trim()) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
  
    if (!/^\d{10}$/.test(newPhone)) {
      setError("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักเท่านั้น");
      return;
    }
  
    const updatedData = {
      username: newName,
      email: newEmail,
      phone: newPhone,
    };
  
    setError("");
  
    try {
      const response = await fetch(buildUrl('/api/profile'), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (data.success) {
        setName(newName);
        setEmail(newEmail);
        setPhone(newPhone);
        setEditingField(false); // ปิดโหมดแก้ไข
        Swal.fire({
          icon: 'success',
          title: 'บันทึกข้อมูลสำเร็จ',
          showConfirmButton: false,
          timer: 1000,
        });
      } else {
        setError(data.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("ไม่สามารถบันทึกข้อมูล");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-50 to-white">
      {/* Header */}
      <div className="w-full p-4 text-white text-xl font-semibold flex justify-center items-center relative bg-gradient-to-r from-yellow-400 to-yellow-500 shadow">
        <FaArrowLeft
          className="text-2xl cursor-pointer absolute left-4"
                      onClick={() => navigate("/user-setting")}
        />
        <span>โปรไฟล์</span>
      </div>

      {/* Profile card */}
      <div className="max-w-lg mx-auto w-full px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <FiUser className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="text-gray-900 text-lg font-semibold">สวัสดี, {name || "ผู้ใช้"}</div>
              <div className="text-gray-500 text-sm">จัดการข้อมูลส่วนตัวของคุณได้ที่นี่</div>
            </div>
            {!editingField ? (
              <button
                onClick={handleEdit}
                className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg flex items-center gap-2"
              >
                <FiEdit2 />
                แก้ไข
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
              >
                <FiSave />
                บันทึก
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-white text-yellow-600 flex items-center justify-center border border-yellow-100">
                  <FiUser />
                </div>
                <div className="text-sm text-gray-500">ชื่อ - สกุล</div>
              </div>
              {editingField ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ) : (
                <div className="text-gray-800">{name || '-'}</div>
              )}
            </div>

            {/* Email */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-white text-yellow-600 flex items-center justify-center border border-yellow-100">
                  <FiMail />
                </div>
                <div className="text-sm text-gray-500">อีเมล</div>
              </div>
              {editingField ? (
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ) : (
                <div className="text-gray-800">{email || '-'}</div>
              )}
            </div>

            {/* Phone */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-white text-yellow-600 flex items-center justify-center border border-yellow-100">
                  <FiPhone />
                </div>
                <div className="text-sm text-gray-500">เบอร์โทรศัพท์</div>
              </div>
              {editingField ? (
                <input
                  type="text"
                  inputMode="numeric"
                  value={newPhone}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,10}$/.test(input)) {
                      setNewPhone(input);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ) : (
                <div className="text-gray-800">{phone || '-'}</div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
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

export default Profile;
