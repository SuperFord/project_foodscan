import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { FiHome, FiUser } from "react-icons/fi"; // ไอคอนแบบเดียวกับในภาพ figma
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
      const response = await fetchWithAuth("http://localhost:5000/api/checkToken", {}, navigate);  // ใช้ fetchWithAuth ในการเช็ค token
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
        const response = await fetch("http://localhost:5000/api/profile", {
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
      const response = await fetch("http://localhost:5000/api/profile", {
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-yellow-400 p-4 text-white relative">
        <FaArrowLeft
          className="text-2xl cursor-pointer absolute left-4"
          onClick={() => navigate("/User/Menu/Setting")}
        />
        <h1 className="text-xl font-bold text-center w-full">โปรไฟล์</h1>
      </div>
      {/* Form Content (Center content) */}
      <div className="mt-6 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md ">
          {/* ชื่อ - สกุล */}
          <div className="mb-4 pl-4">
            <label className="block text-black font-bold">ชื่อ - สกุล :</label>
            {editingField ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 mt-1 border rounded"
              />
            ) : (
              <p className="mt-1">{name}</p>
            )}
          </div>
          {/* Email */}
          <div className="mb-4 pl-4">
            <label className="block text-black font-bold">Email :</label>
            {editingField ? (
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full p-2 mt-1 border rounded"
              />
            ) : (
              <p className="mt-1">{email}</p>
            )}
          </div>
          {/* เบอร์โทรศัพท์ */}
          <div className="mb-4 pl-4">
            <label className="block text-black font-bold">เบอร์โทรศัพท์ :</label>
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
                className="w-full p-2 mt-1 border rounded"
              />
            ) : (
              <p className="mt-1">{phone}</p>
            )}
          </div>
          {/* ปุ่มแก้ไข/บันทึก */}
          <div className="flex justify-center mt-6 border-t border-gray-400 pt-6">
            {editingField ? (
              <button
                className="bg-yellow-400 text-white w-80 py-3 rounded-lg text-lg"
                onClick={handleSave}
              >
                บันทึก
              </button>
            ) : (
              <button
                className="bg-yellow-400 text-white w-80 py-3 rounded-lg text-lg"
                onClick={handleEdit}
              >
                แก้ไขข้อมูล
              </button>
            )}
          </div>
          {/* ข้อผิดพลาด */}
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </div>
      </div>
      {/* แถบนำทางด้านล่าง */}
      <div className="bg-gray-900 text-white flex justify-around items-center py-4 mt-auto">
        <Link to="/User/Menu" className="flex-1 flex justify-center items-center">
          <FiHome className="text-3xl text-gray-400 hover:text-white transition" />
        </Link>
        <Link to="/User/Menu/Setting" className="flex-1 flex justify-center items-center">
          <FiUser className="text-3xl text-gray-400 hover:text-white transition" />
        </Link>
      </div>
    </div>
  );
}

export default Profile;
