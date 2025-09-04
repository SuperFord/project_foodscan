import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { fetchWithAuth } from './fetchWithAuth';
import { buildUrl } from '../../utils/api';

function ReserFood() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedTables = [], fullName = []  } = location.state || {};
  const tableNames = selectedTables.map(t => t.label).join(', ');
  const [menus, setMenus] = useState([]);
  const [restaurantData, setRestaurantData] = useState({ name: '', description: '' });
  const [cart, setCart] = useState([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const cartKey = `cart_${fullName}_${selectedTables.map(t => t.label).join('_')}`;
  const [showCart, setShowCart] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [ userId, setUserId] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuthAndData = async () => {
      const response = await fetchWithAuth('/api/checkToken', {}, navigate);
  
      if (!response || !response.ok) {
        return;
      }
  
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
  
    checkAuthAndData();
  }, [tableNames, fullName, navigate]);

  // โหลด cart จาก localStorage
  useEffect(() => {
    if (!cartKey || hasLoadedCart) return;

    const storedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
    console.log("ข้อมูลเดิมจาก localStorage:", storedCart);
    setCart(storedCart);
    setHasLoadedCart(true);
  }, [cartKey, hasLoadedCart]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    if (!cartKey || !hasLoadedCart) return;
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey, hasLoadedCart]);

  // อัพเดตตะกร้าหลังจากแก้ไขจำนวนหรือเมนู
  useEffect(() => {
    const updatedCart = cart.map(item => {
      if (selectedMenu && selectedMenu.id === item.id) {
        return { ...item, quantity };
      }
      return item;
    });
    setCart(updatedCart);
  }, [selectedMenu, quantity]);

  // Add item to cart
  const openAddToCartModal = (menu) => {
    const existingItem = cart.find(item => item.id === menu.id);

    setSelectedMenu(existingItem ? { ...existingItem } : menu);
    setQuantity(existingItem ? existingItem.quantity : 1);
    setShowModal(true);
  };

  const confirmAddToCart = () => {
    const updatedItem = { ...selectedMenu, quantity };
    const existingItemIndex = cart.findIndex(item => item.id === selectedMenu.id);
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity = quantity;
      setCart(updatedCart);
    } else {
      const newCart = [...cart, updatedItem];
      setCart(newCart);
    }
    setShowModal(false);
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
    ? menus.filter(menu => menu.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : menus.filter(menu => menu.category === selectedCategory && menu.name.toLowerCase().includes(searchTerm.toLowerCase()));

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

        {/* Search and Category Section */}
         <div className="mt-8 mb-6">
           <div className="flex items-center gap-4">
             {/* Search Input */}
             <div className="flex-1 relative">
               <input
                 type="text"
                 placeholder="ค้นหาอาหาร..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent shadow-sm"
               />
               <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
               </div>
             </div>
             
             {/* Category Button */}
             <button
               onClick={() => setShowAllCategories(true)}
               className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
               </svg>
               <span>หมวดหมู่</span>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
             </button>
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
           {loading ? (
             <div className="text-center py-12">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
               <p className="text-gray-600">กำลังโหลดเมนู...</p>
             </div>
           ) : filteredMenus.length > 0 ? (
             <div className="space-y-6">
               {filteredMenus.map((menu, index) => (
                 <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                   <div className="flex items-start space-x-4">
                     <img
                       src={buildUrl(menu.image_url)}
                       alt={menu.name}
                       className="w-24 h-24 object-cover rounded-lg shadow-sm"
                     />
                     <div className="flex-1 flex justify-between">
                       <div className="flex-1">
                         <h3 className="text-xl font-bold text-gray-800 mb-2">{menu.name}</h3>
                         <p className="text-gray-600 text-sm mb-3 leading-relaxed">{menu.description}</p>
                         <div className="flex items-center justify-between">
                           <p className="text-lg font-bold text-yellow-600">฿ {menu.price} บาท</p>
                         </div>
                       </div>
                       <div className="flex items-center ml-4">
                         <button
                           className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md"
                           onClick={() => openAddToCartModal(menu)}
                         >
                           + เพิ่ม
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-12">
               <div className="text-gray-400 text-6xl mb-4">🍽️</div>
               <p className="text-gray-500 text-lg">ไม่มีเมนูในหมวดหมู่นี้</p>
               <p className="text-gray-400 text-sm mt-2">ลองค้นหาด้วยคำอื่นหรือเลือกหมวดหมู่อื่น</p>
             </div>
           )}
         </div>

        {/* Modal เพิ่มเมนูลงตะกร้า */}
        {showModal && selectedMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
              <img
                src={buildUrl(selectedMenu.image_url)}
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
                    src={buildUrl(item.image_url)}
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
                  const tableNames = selectedTables.map(t => t.label).join(', ');

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
