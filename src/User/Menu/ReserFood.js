import { buildUrl } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { fetchWithAuth } from './fetchWithAuth';

function ReserFood() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedTables = [], fullName = []  } = location.state || {};
  const tableNames = selectedTables.map(t => t.label).join(', ');
  const [menus, setMenus] = useState([]);
  const [restaurantData, setRestaurantData] = useState({ name: '', description: '' });
  const [cart, setCart] = useState(location.state?.cart || []);//มีเซ็คว่ามีค่าเดิมไหม
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const cartKey = `cart_${fullName}_${selectedTables.map(t => t.label).join('_')}`;
  const [showCart, setShowCart] = useState(false); // toggle แสดงตะกร้า
  const [categories, setCategories] = useState([]); // เพิ่ม state เก็บหมวดหมู่
  const [selectedCategory, setSelectedCategory] = useState(''); // หมวดหมู่ที่ถูกเลือก
  const [showAllCategories, setShowAllCategories] = useState(false); // สำหรับ toggle popup
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [ userId, setUserId] = useState([]);

  // ตรวจสอบหน้าที่มาจากไหน
  const fromPage = location.state?.fromPage || ""; // รับค่าหน้าก่อนหน้า ถ้ามี

  useEffect(() => {
    const checkAuthAndData = async () => {
      const response = await fetchWithAuth("/api/checkToken", {}, navigate);
  
      if (!response || !response.ok) {
        // fetchWithAuth จะ redirect ไป /User ให้อยู่แล้วหาก token หมดอายุ
        return;
      }
  
      // ✅ ตรวจสอบ token ผ่านแล้ว ค่อยตรวจสอบข้อมูลการจอง
      if (!tableNames || !fullName) {
        Swal.fire({
          icon: 'warning',
          title: 'เกิดข้อผิดพลาด',
          text: 'กรุณาจองโต๊ะก่อน',
          confirmButtonText: 'ตกลง',
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          navigate('/user');
        });
      }
    };
  
    checkAuthAndData(); // เรียก function ที่ควบคุมลำดับเอง
  }, [tableNames, fullName, navigate]);

  // โหลด cart จาก localStorage ครั้งเดียวเมื่อ cartKey พร้อม
  useEffect(() => {
    if (!cartKey || hasLoadedCart) return;

    const storedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
    console.log("ข้อมูลเดิมจาก localStorage:", storedCart);

    if (fromPage === "ReserEdit") {
      const editCart = location.state?.cart;
      if (editCart) {
        setCart(editCart);
      } else {
        setCart(storedCart);
      }
    } else {
      setCart(storedCart);
    }

    setHasLoadedCart(true);
  }, [cartKey, fromPage, location.state, hasLoadedCart]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');  // ดึง JWT token จาก localStorage
      try {
        // ดึงข้อมูลร้าน
        const restaurantResponse = await fetch(buildUrl('/api/Nrestaurant'), {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });        
        const restaurantData = await restaurantResponse.json();
        setRestaurantData({ name: restaurantData.name, description: restaurantData.description });
  
        // ดึงเมนู
        const menuResponse = await fetch(buildUrl('/api/menus'), {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const menuData = await menuResponse.json();
        if (menuData.success) {
          const filteredMenus = menuData.menus.filter(menu => menu.available === true);
          setMenus(filteredMenus);
          const uniqueCategories = ['รายการอาหารทั้งหมด', ...new Set(filteredMenus.map(menu => menu.category))];
          setCategories(uniqueCategories);
          setSelectedCategory('รายการอาหารทั้งหมด');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    if (!cartKey || !hasLoadedCart) return;
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey, hasLoadedCart]);

  // มีข้อมูลเดิมในตะกร้าไม่ต้องเพิ่มไปซ้ำให้ปรับจำนวนเอา
  useEffect(() => {
    const updatedCart = cart.map(item => {
      if (selectedMenu && selectedMenu.id === item.id) {
        return { ...item, quantity };
      }
      return item;
    });
    setCart(updatedCart);
  }, [selectedMenu, quantity]); // อัพเดตตะกร้าหลังจากแก้ไขจำนวนหรือเมนู  

  // Add item to cart
  const openAddToCartModal = (menu) => {
    const existingItem = cart.find(item => item.id === menu.id);

    setSelectedMenu(existingItem ? { ...existingItem } : menu); // ถ้ามีรายการอยู่ในตะกร้าแล้วให้ใช้ข้อมูลเดิม
    setQuantity(existingItem ? existingItem.quantity : 1); // ใช้จำนวนเดิมหรือเริ่มต้นที่ 1
    setShowModal(true);
  };

  const confirmAddToCart = () => {
    const updatedItem = { ...selectedMenu, quantity };
    // ตรวจสอบว่ามีเมนูนี้ในตะกร้าแล้วหรือยัง
    const existingItemIndex = cart.findIndex(item => item.id === selectedMenu.id);
    if (existingItemIndex !== -1) {
      // ถ้ามีรายการนี้แล้ว, อัพเดตจำนวน
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity = quantity;
      // console.log("อัปเดตรายการในตะกร้า:", updatedCart);
      setCart(updatedCart);
    } else {
      // ถ้าไม่มีรายการนี้ในตะกร้า, ให้เพิ่มรายการใหม่
      const newCart = [...cart, updatedItem];
      // console.log("🛒 เพิ่มรายการใหม่ในตะกร้า:", updatedItem);
      setCart(newCart);
    }
    setShowModal(false); // ปิด modal หลังจากเพิ่ม
  };

  // ฟังก์ชันจัดการของในตะกร้า
  const handleIncreaseQuantity = (index) => {
    const newCart = [...cart];
    newCart[index].quantity += 1;
    setCart(newCart);
  };

  const handleDecreaseQuantity = (index) => {
    const newCart = [...cart];
    if (newCart[index].quantity > 1) {
      newCart[index].quantity -= 1;
      setCart(newCart);
    }
  };

  const handleRemoveFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };
  
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const filteredMenus = selectedCategory === 'รายการอาหารทั้งหมด'
    ? menus
    : menus.filter(menu => menu.category === selectedCategory);

  return (
    <div className="w-full bg-white font-sans px-2 pt-10 pb-12 flex justify-center items-center">
      <div className="w-full max-w-4xl px-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <FaArrowLeft className="text-2xl cursor-pointer" onClick={() => navigate(-1)} />
            <span className="bg-gray-200 text-black px-4 py-2 rounded font-semibold">
              {tableNames} | {fullName}
            </span>
          </div>
          {/* ตะกร้าเเสดงเลข */}
          <div className="relative cursor-pointer" onClick={() => setShowCart(true)}>
            <FaShoppingCart className="text-xl" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="mt-4 pt-6">
          <p className="text-gray-400 text-2sm">{restaurantData.description}</p>
          <h1 className="text-4xl font-bold">{restaurantData.name}</h1>
        </div>

        {/* หมวดหมู่อาหาร */}
        <div className="pt-4">
          <div className="p-4 flex flex-wrap gap-6 items-center">
            {categories.slice(0, 2).map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`text-base font-semibold pb-1 ${selectedCategory === category ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-black'}`}
              >
                {category}
              </button>
            ))}
            {categories.length > 2 && (
              <button onClick={() => setShowAllCategories(true)} className="text-base font-semibold text-black">
                ...
              </button>
            )}
          </div>
        </div>

        {/* เมนูหมวดหมู่ทั้งหมด */}
        {showAllCategories && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-80 max-h-[80vh] overflow-y-auto shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-center">เลือกหมวดหมู่</h2>
              <div className="flex flex-col gap-4">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => { setSelectedCategory(category); setShowAllCategories(false); }}
                    className={`text-base text-left font-semibold ${selectedCategory === category ? 'text-yellow-500' : 'text-gray-700'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button onClick={() => setShowAllCategories(false)} className="text-lg text-gray-500 underline">
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        {/* รายการอาหารตาม category ที่เลือก */}
        <div className="pt-2">
          {filteredMenus.length > 0 ? (
            <div className="space-y-4">
              {filteredMenus.map((menu, index) => (
                <div key={index} className="flex items-start space-x-4 pb-4">
                  <img
                    src={`${process.env.REACT_APP_API_URL?.replace(/\/$/, '') || ''}${menu.image_url}`}
                    alt={menu.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 flex justify-between">
                    <div>
                      <h3 className="text-lg font-bold">ชื่อ : {menu.name}</h3>
                      <p className="text-zinc-500">{menu.description}</p>
                      <p className="font-semibold">ราคา : {menu.price} บาท</p>
                    </div>
                    <div className="flex justify-end mt-auto">
                      <button
                        className="bg-yellow-400 text-white px-2 rounded font-semibold"
                        onClick={() => openAddToCartModal(menu)}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">ไม่มีเมนูในหมวดหมู่นี้</p>
          )}
        </div>

        {/* Modal เพิ่มเมนูลงตะกร้า */}
        {showModal && selectedMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
              <img
                src={`${process.env.REACT_APP_API_URL?.replace(/\/$/, '') || ''}${selectedMenu.image_url}`}
                alt={selectedMenu.name}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h2 className="text-xl font-bold mb-1">{selectedMenu.name}</h2>
              <p className="text-gray-600 text-sm mb-2">{selectedMenu.description}</p>
              <p className="text-lg font-semibold mb-4">ราคา: {selectedMenu.price} บาท</p>

              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={decreaseQuantity}
                  className="bg-red-500 text-white rounded-full px-3 py-1 text-lg font-bold"
                >
                  −
                </button>
                <span className="text-lg font-bold">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className="bg-green-500 text-white rounded-full px-3 py-1 text-lg font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={confirmAddToCart}
                className="w-full bg-yellow-400 text-white py-2 rounded-lg font-bold text-lg"
              >
                เพิ่มลงในตะกร้า
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="mt-3 text-sm text-gray-500 underline w-full text-center"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* ตะกร้า */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl w-96 p-6 shadow-lg relative max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">ตะกร้า</h2>
              {cart.map((item, index) => (
                <div key={index} className="flex items-center mb-4">
                  <img
                    src={`${process.env.REACT_APP_API_URL?.replace(/\/$/, '') || ''}${item.image_url}`}
                    alt={item.name}
                    className="w-16 h-16 rounded object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-sm text-gray-500">฿{item.price}</p>
                    <div className="flex items-center mt-1">
                      <button
                        onClick={() => handleDecreaseQuantity(index)}
                        className="text-white bg-gray-400 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button
                        onClick={() => handleIncreaseQuantity(index)}
                        className="text-white bg-gray-400 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(index)}
                    className="text-yellow-500 text-xl ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* total */}
              <div className="mt-4 text-right font-bold text-xl">
                TOTAL: {cart.reduce((acc, item) => acc + item.price * item.quantity, 0)} บาท
              </div>

              {/* confirm button */}
              <button
                onClick={() => {
                  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
                  const tableNames = selectedTables.map(t => t.label).join(', '); // เอาไว้โชว์ในหน้า QR

                  navigate('/payment', {
                    state: {
                      totalAmount,
                      fullName,
                      tableNames,
                      cart,
                      selectedTables,
                      currentDate: location.state?.currentDate,
                      peopleCount: location.state?.peopleCount,
                      time: location.state?.time,
                      additionalDetails: location.state?.additionalDetails,
                      joinTables: location.state?.joinTables,
                      fromPage,
                    }
                  });
                }}
                className="mt-6 w-full bg-yellow-400 text-white py-2 rounded-lg font-bold text-lg"
              >
                ยืนยันออเดอร์
              </button>
              {/* close */}
              <button
                onClick={() => setShowCart(false)}
                className="absolute top-2 right-4 text-gray-500 text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReserFood;
