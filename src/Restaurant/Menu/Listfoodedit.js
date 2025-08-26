import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { API_BASE } from "../../config";

export default function ListFoodEdit() {
  const navigate = useNavigate();
  const { id } = useParams(); // ดึง id ของเมนูจาก URL
  const [menuName, setMenuName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // เก็บ URL ของรูปปัจจุบัน
  const [error, setError] = useState(""); // เก็บข้อความ error
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [category, setCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/menus/${id}`);
      const result = await response.json();
      if (result.success) {
        setMenuName(result.menu.name);
        setPrice(result.menu.price);
        setDescription(result.menu.description);
        setCategory(result.menu.category);
        setImageUrl(`${API_BASE}${result.menu.image_url}`);
      } else {
        console.error("ไม่พบเมนู");
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");

    // ตรวจสอบประเภทของไฟล์
    if (selectedFile) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setFileName(selectedFile.name); // แสดงชื่อไฟล์ที่เลือก
        setError(""); // ลบข้อความ error
      } else {
        setError("กรุณาเลือกไฟล์ที่เป็น .jpg , .jpeg หรือ .png เท่านั้น");
        setFile(null);
        setFileName("");
      }
    }
  };

  const handleImageClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleSubmit = async () => {

    //ตรวจว่าชื่อเมนูว่าง
    if (!menuName.trim()) {
      alert("❌ กรุณากรอกชื่อเมนู!");
      return;
    }

    const formData = new FormData();
    formData.append("name", menuName);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("category", category);

    if (file) {
      formData.append("image", file); // ใช้ไฟล์ที่อัปโหลดใหม่
    }

    console.log("🔹 ส่งข้อมูลไปที่ API:", formData);

    try {
      const response = await fetch(`${API_BASE}/api/menus/${id}`, {
        method: "PUT",
        body: formData,
      });

      console.log("🔹 API Response:", response);

      const result = await response.json();
      console.log("🔹 API Result:", result);

      if (result.success) {
        alert("✅ อัปเดตข้อมูลสำเร็จ!");
        navigate("/Restaurant/Menu/Listfood");
      } else {
        alert("❌ เกิดข้อผิดพลาดในการอัปเดต!");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์!");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/categories`);
      const data = await response.json();
      if (data.success) {
        const names = data.categories.map(cat => cat.name);
        setCategoryOptions(names);
      }
    } catch (error) {
      console.error("โหลดหมวดหมู่ล้มเหลว:", error);
    }
  };
  fetchCategories();

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
  
    try {
      const response = await fetch(`${API_BASE}/api/category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
  
      const result = await response.json();
      if (result.success) {
        setCategoryOptions(prev => [...prev, newCategory]); // เพิ่มใน dropdown
        setCategory(newCategory); // ตั้งค่าหมวดหมู่ที่เลือกให้เป็นอันใหม่
        setNewCategory("");
        setShowAddCategory(false);
    } else {
      alert("ไม่สามารถเพิ่มหมวดหมู่ได้");
    }
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-yellow-400 p-4 text-white">
        <FaArrowLeft className="text-2xl cursor-pointer ml-4" onClick={() => navigate("/Restaurant/Menu/Listfood")} />
        <h1 className="flex-grow text-3xl font-bold text-center p-2">แก้ไขรายการอาหาร</h1>
      </div>

      {/* Upload Section */}
      <div className="p-4 w-full max-w-md">
        <h2 className="text-lg font-bold text-black">อัปโหลดรูปเมนู</h2>

        {/* แสดงรูปปัจจุบันหากยังไม่อัปโหลดไฟล์ใหม่ */}
        {!file ? (
          <div className="mt-4 relative cursor-pointer flex justify-center items-center" onClick={handleImageClick}>
            <img src={imageUrl} alt={menuName} className="w-32 h-32 object-cover rounded" />
            <span className="absolute top-0 right-0 bg-gray-500 text-white p-1 text-xs rounded-full">เปลี่ยนรูป</span>
          </div>
        ) : (
          <div className="mt-4 relative cursor-pointer flex justify-center items-center" onClick={handleImageClick}>
            <img src={URL.createObjectURL(file)} alt={fileName} className="w-32 h-32 object-cover rounded" />
            <span className="absolute top-0 right-0 bg-gray-500 text-white p-1 text-xs rounded-full">เปลี่ยนรูป</span>
          </div>
        )}

        {/* ข้อความ error เมื่อไฟล์ไม่ตรงตามประเภท */}
        {error && <div className="text-red-600 mt-2">{error}</div>}

        {/* ปุ่มไฟล์ซ่อนอยู่ */}
        <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} />
      </div>

      
      {/* Form Section */}
      <div className="p-4 w-full max-w-md">
        <div className="flex gap-4">
          {/* ช่องกรอกหมวดหมู่ */}
          <div className="w-1/2">
            <label className="block font-bold text-black">เลือกหมวดหมู่จากรายการ</label>
            <select
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={category}
              onChange={(e) => {
                if (e.target.value === 'add_new') {
                  setShowAddCategory(true);
                } else {
                  setCategory(e.target.value);
                }
              }}
            >
              <option value="">-- เลือกหมวดหมู่ --</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="add_new">+ เพิ่มหมวดหมู่ใหม่</option>
            </select>
          </div>
        </div>

        {/* Pop up ให้กรอกชื่อหมวดหมู่เพิ่มเข้าไปในฐานข้อมูล */}
        {showAddCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">เพิ่มหมวดหมู่ใหม่</h2>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded mb-4"
                placeholder="ชื่อหมวดหมู่"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <button
                  className="bg-yellow-300 text-white px-4 py-2 rounded hover:bg-yellow-400"
                  onClick={() => {
                    setNewCategory("");
                    setShowAddCategory(false);
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
                  onClick={handleAddCategory}
                >
                  เพิ่ม
                </button>
              </div>
            </div>
          </div>
        )}

        <label className="block font-bold text-black mt-4">ชื่อเมนู <span className="text-red-600">*</span></label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded mt-1"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
        />

        <label className="block font-bold text-black mt-4">ราคา <span className="text-red-600">*</span></label>
        <input
          type="number"
          step="1"
          className="w-full p-2 border border-gray-300 rounded mt-1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <label className="block font-bold text-black mt-4">คำอธิบายเมนู</label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded mt-1 h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        <button className="w-full mt-6 p-3 bg-yellow-400 text-white font-bold rounded-xl" onClick={handleSubmit}>
          ยืนยัน
        </button>
      </div>
    </div>
  );
}