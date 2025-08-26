import { React, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaCog } from "react-icons/fa";
import Switch from "react-switch";
import { API_BASE } from "../config";

export default function ListFood() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [categories, setCategories] = useState([]); // ดึงจาก API ก็ได้
  const [selectedCategory, setSelectedCategory] = useState("รายการอาหารทั้งหมด");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/menus`);
      const result = await response.json();
      if (result.success) {
        // จัดเรียงเมนูให้เมนูที่ "มีสินค้า" (available = true) ขึ้นมาก่อน
        const sortedMenus = result.menus.sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0));
        setMenus(sortedMenus);
      } else {
        console.error("Failed to fetch menus");
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/categories/`);
      const result = await response.json();
      if (result.success) {
        setCategories([{ name: "รายการอาหารทั้งหมด" }, ...result.categories]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบเมนูนี้หรือไม่?")) {
      try {
        const response = await fetch(`${API_BASE}/api/menus/${id}`, {
          method: "DELETE",
        });
        const result = await response.json();
        if (result.success) {
          alert("ลบเมนูสำเร็จ!");
          fetchMenus();
        } else {
          alert("เกิดข้อผิดพลาดในการลบเมนู");
        }
      } catch (error) {
        console.error("Error deleting menu:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์!");
      }
    }
  };

  const toggleStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE}/api/menus/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !status }),
      });
      const result = await response.json();
      if (result.success) {
        // รีเฟรชรายการเมนูหลังการเปลี่ยนสถานะ
        fetchMenus();
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // reset หน้า
  };

  const filteredMenus =
  selectedCategory === "รายการอาหารทั้งหมด"
    ? menus
    : menus.filter((menu) => menu.category === selectedCategory);

  const totalPages = Math.ceil(filteredMenus.length / itemsPerPage);
  const displayedMenus = filteredMenus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full h-screen bg-white">
      {/* Header */}
      <div className="flex items_center justify_between bg-yellow-400 p-4 text_white">
        <FaArrowLeft className="text-2xl cursor-pointer ml-4" onClick={() => navigate("/Restaurant/Menu")} />
        <h1 className="flex-grow text-3xl font-bold text_center p-2">จัดการรายการอาหาร</h1>
        <FaPlus className="text-2xl cursor-pointer ml-4" onClick={() => navigate("/Restaurant/Menu/Listfoodadd")} />
      </div>

      {/* Food List */}
      <div className="p-4">
        <h2 className="text-lg font-bold text_black">หมวดหมู่</h2>
          <div className="flex items-center space-x-2 overflow-x-auto px-4 py-2 bg-gray-100">
          {categories.slice(0, 12).map((cat, index) => (
            <button
            key={index}
            onClick={() => handleCategorySelect(cat.name)}
            className={`px-3 py-1 rounded-full ${
              selectedCategory === cat.name ? "bg-yellow-400 text-white" : "bg-white border text-gray-700"
            }`}
          >
            {cat.name}
          </button>
          ))}
          {categories.length > 5 && (
            <button
              onClick={() => setShowAllCategories(true)}
              className="px-3 py-1 bg_white border rounded_full text_gray_700"
            >
              ...
            </button>
          )}
        </div>

        {/* Popup เลือกหมวดหมู่ทั้งหมด */}
        {showAllCategories && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAllCategories(false)} // ปิดเมื่อคลิกพื้นหลัง
          >
            <div
              className="bg-white p-6 rounded-lg w-3/4 max-w-md relative"
              onClick={(e) => e.stopPropagation()} // ป้องกันคลิกใน popup แล้วปิด
            >
              {/* กากบาทปิด */}
              <button
                onClick={() => setShowAllCategories(false)}
                className="absolute top-2 right-2 text-red-500 text-xl font-bold"
              >
                ×
              </button>

              <h2 className="text-lg font-bold mb-4">เลือกหมวดหมู่</h2>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleCategorySelect(cat.name);
                      setShowAllCategories(false);
                    }}
                    className="p-2 bg-gray-100 rounded hover:bg-yellow-300"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* setting อาหาร */}
        <div className="mt-4 space-y-4">
          {displayedMenus.map((menu) => (
            <div key={menu.id} className="border-b pb-4 relative bg-gray-100 p-4 rounded-lg">
              {/* ไอคอนฟันเฟือง (ตั้งค่าด้านบนขวา) */}
              <div className="absolute top-2 right-2">
                <FaCog
                  className="text-xl text-gray-600 cursor-pointer"
                  onClick={() => setOpenDropdown(openDropdown === menu.id ? null : menu.id)}
                />
                {openDropdown === menu.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded-md z-10">
                    <button
                      onClick={() => navigate(`/Restaurant/Menu/Listfoodedit/${menu.id}`)}
                      className="block w-full text-center px-4 py-2 hover:bg-gray-200"
                    >
                      แก้ไข
                    </button>
                    <hr className="border-gray-300" />
                    <button
                      onClick={() => handleDelete(menu.id)}
                      className="block w-full text-center px-4 py-2 text-red-500 hover:bg-gray-200"
                    >
                      ลบ
                    </button>
                  </div>
                )}
              </div>
              {/* แสดงรูปเมนู */}
              <div className="flex items-center space-x-4">
                <img
                  src={`${API_BASE}${menu.image_url}`}
                  alt={menu.name}
                  className="w-20 h-20 object-cover rounded"
                />
                {/* รายละเอียดเมนู */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold">ชื่อ : {menu.name}</h3>
                  <p className="text-zinc-500">{menu.description}</p>

                  {/* ราคา (ซ้าย) + สวิตช์ (ขวา) */}
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-semibold">ราคา : {Math.floor(Number(menu.price))} บาท</p>

                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${menu.available ? "text-yellow-500" : "text-zinc-500"}`}>
                        {menu.available ? "มีสินค้า" : "สินค้าหมด"}
                      </span>
                      <Switch
                        checked={menu.available}
                        onChange={() => toggleStatus(menu.id, menu.available)}
                        onColor="#EBD82B"
                        offColor="#D6D6D6"
                        uncheckedIcon={false}
                        checkedIcon={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* เลขหน้า */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${currentPage === page ? "bg-yellow-400 text-white" : "bg-white"}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
