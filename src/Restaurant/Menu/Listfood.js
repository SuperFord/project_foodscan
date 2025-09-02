import { React, useEffect, useState } from "react";
import { buildUrl } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaCog } from "react-icons/fa";
import Switch from "react-switch";

export default function ListFood() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [categories, setCategories] = useState([]); // ดึงจาก API ก็ได้
  const [selectedCategory, setSelectedCategory] = useState("รายการอาหารทั้งหมด");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // เปลี่ยนจาก 10 เป็น 8
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  
  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildUrl("/api/menus"));
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data?.menus)) {
          setMenus(data.menus);
        } else if (Array.isArray(data)) {
          setMenus(data);
        } else {
          setMenus([]);
        }
      }
    } catch (error) {
      // Error handling without console.log
    }
    finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(buildUrl("/api/categories/"));
      const result = await response.json();
      if (result.success) {
        setCategories([{ name: "รายการอาหารทั้งหมด" }, ...result.categories]);
      }
    } catch (error) {
      // Error handling without console.log
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบเมนูนี้หรือไม่?")) {
      try {
        const token = localStorage.getItem('restaurantToken');
        if (!token) {
          alert('กรุณาเข้าสู่ระบบใหม่');
          navigate('/restaurant-login');
          return;
        }

        const response = await fetch(buildUrl(`/api/menus/${id}`), {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (result.success) {
          alert("ลบเมนูสำเร็จ!");
          fetchMenus();
        } else {
          alert("เกิดข้อผิดพลาดในการลบเมนู");
        }
      } catch (error) {
        // Error handling without console.log
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์!");
      }
    }
  };

  const toggleStatus = async (id, status) => {
    try {
      // ดึง token จาก localStorage
      const token = localStorage.getItem('restaurantToken');
      if (!token) {
        alert('กรุณาเข้าสู่ระบบใหม่');
        navigate('/restaurant-login');
        return;
      }

      const response = await fetch(buildUrl(`/api/menus/${id}/status`), {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ available: !status }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // รีเฟรชรายการเมนูหลังการเปลี่ยนสถานะ
          fetchMenus();
        } else {
          alert(result.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        }
      } else {
        if (response.status === 401) {
          alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
          navigate('/restaurant-login');
        } else {
          alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        }
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์!");
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // reset หน้า
    setSearchTerm(""); // รีเซ็ตการค้นหา
  };

  // ปิด dropdown เมื่อคลิกนอกพื้นที่
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAllCategories && !event.target.closest('.category-dropdown')) {
        setShowAllCategories(false);
      }
      if (openDropdown && !event.target.closest('.menu-gear-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAllCategories]);

  // หน่วงการค้นหาเพื่อประสิทธิภาพ
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const filteredMenus =
  selectedCategory === "รายการอาหารทั้งหมด"
    ? menus.filter(menu => 
        menu.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : menus.filter((menu) => 
        menu.category === selectedCategory && (
          menu.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

  // เรียงลำดับให้อาหารที่มีสินค้า (available = true) แสดงขึ้นมาก่อน
  const sortedMenus = filteredMenus.sort((a, b) => {
    // ถ้า a มีสินค้าและ b ไม่มีสินค้า ให้ a ขึ้นก่อน
    if (a.available && !b.available) return -1;
    // ถ้า a ไม่มีสินค้าและ b มีสินค้า ให้ b ขึ้นก่อน
    if (!a.available && b.available) return 1;
    // ถ้าทั้งคู่มีหรือไม่มีสินค้าเหมือนกัน ให้เรียงตามชื่อ
    return a.name.localeCompare(b.name);
  });

  const totalPages = Math.ceil(sortedMenus.length / itemsPerPage);
  const displayedMenus = sortedMenus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-yellow-400 p-4 text-white">
        <FaArrowLeft className="text-2xl cursor-pointer ml-4" onClick={() => navigate("/restaurant-menu")} />
        <h1 className="flex-grow text-3xl font-bold text-center p-2">จัดการรายการอาหาร</h1>
        <FaPlus className="text-2xl cursor-pointer ml-4" onClick={() => navigate("/listfood-add")} />
      </div>

      {/* Food List */}
      <div className="p-4">
        {/* สรุปผลลัพธ์ */}
        <div className="mb-3 text-sm text-gray-600">
          แสดงผล {displayedMenus.length} รายการ จากทั้งหมด {sortedMenus.length} รายการในหมวด "{selectedCategory}"
        </div>

        {/* Search and Category Button */}
        <div className="flex items-center space-x-3 mb-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="ค้นหาอาหาร..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Category Button */}
          <div className="relative category-dropdown">
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>หมวดหมู่</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${showAllCategories ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Category Dropdown */}
            {showAllCategories && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">เลือกหมวดหมู่</h3>
                </div>
                <div className="p-2">
                  {categories.map((cat, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleCategorySelect(cat.name);
                        setShowAllCategories(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-yellow-100 transition-colors duration-150 ${
                        selectedCategory === cat.name ? 'bg-yellow-200 text-yellow-800 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category badge hidden as requested */}

        {/* setting อาหาร */}
        <div className="mt-4 space-y-4">
          {displayedMenus.map((menu) => (
            <div key={menu.id} className="border-b pb-4 relative bg-gray-100 p-4 rounded-lg">
              {/* ไอคอนฟันเฟือง (ตั้งค่าด้านบนขวา) */}
              <div className="absolute top-2 right-2 menu-gear-dropdown">
                <FaCog
                  className="text-xl text-gray-600 cursor-pointer"
                  onClick={() => setOpenDropdown(openDropdown === menu.id ? null : menu.id)}
                />
                {openDropdown === menu.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded-md z-10">
                    <button
                      onClick={() => navigate(`/listfood-edit/${menu.id}`)}
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
                  src={buildUrl(menu.image_url)}
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
          {!loading && displayedMenus.length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border">
              ไม่มีรายการอาหารที่ตรงกับเงื่อนไขการค้นหา
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-10 text-yellow-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mr-3"></div>
            กำลังโหลดรายการอาหาร...
          </div>
        )}
        
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
