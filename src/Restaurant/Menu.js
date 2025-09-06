import React, { useEffect, useState } from 'react';
import { buildUrl } from "../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import menuImg from "./img/menu.png";
import tableImg from "./img/table.png";
import notibellImg from "./img/notibell.png";
import statustableImg from "./img/statustable.png";
import historyImg from "./img/history.png";
import QrImg from "./img/Qr.png";
import QrandtableImg from "./img/111.png";

function Menu() {
  const navigate = useNavigate();
  const [hasTableLayout, setHasTableLayout] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changePasswordError, setChangePasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    checkTableLayout();
    loadAdminInfo();
  }, []);

  const checkTableLayout = async () => {
    try {
      const response = await fetch(buildUrl("/api/table_layout"));
      const result = await response.json();
      if (result.success && result.tables.length > 0) {
        setHasTableLayout(true); // ถ้ามีข้อมูลให้ไปหน้า Table_map
      }
    } catch (error) {
      console.error("Error checking table layout:", error);
    }
  };

  const loadAdminInfo = () => {
    const adminData = localStorage.getItem('restaurantAdmin');
    if (adminData) {
      setAdminInfo(JSON.parse(adminData));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('restaurantToken');
    localStorage.removeItem('restaurantAdmin');
            navigate('/restaurant-login');
  };

  const handleAdminManagement = () => {
    setShowAdminModal(true);
    fetchAdmins();
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('restaurantToken');
      if (!token) {
        alert('กรุณาเข้าสู่ระบบใหม่');
        navigate('/restaurant-login');
        return;
      }
      const res = await fetch(buildUrl('/api/restaurant/admins'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
        navigate('/restaurant-login');
        return;
      }
      const data = await res.json();
      if (data.success) setAdmins(data.admins || []);
      else setAdmins([]);
    } catch (e) {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminData.username || !newAdminData.password) {
      setErrorMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('restaurantToken');
      if (!token) {
        alert('กรุณาเข้าสู่ระบบใหม่');
        navigate('/restaurant-login');
        return;
      }
      const res = await fetch(buildUrl('/api/restaurant/admins'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: newAdminData.username, password: newAdminData.password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire({ title: 'สำเร็จ!', text: 'เพิ่มแอดมินสำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false });
        setShowAddAdminModal(false);
        setNewAdminData({ username: '', password: '' });
        setErrorMessage('');
        fetchAdmins();
      } else {
        setErrorMessage(data.message || 'เกิดข้อผิดพลาดในการเพิ่มแอดมิน');
      }
    } catch (e) {
      setErrorMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId, username) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบแอดมิน "${username}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });
    if (!result.isConfirmed) return;
    try {
      const token = localStorage.getItem('restaurantToken');
      if (!token) {
        alert('กรุณาเข้าสู่ระบบใหม่');
        navigate('/restaurant-login');
        return;
      }
      const res = await fetch(buildUrl(`/api/restaurant/admins/${adminId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire({ title: 'สำเร็จ!', text: 'ลบแอดมินสำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false });
        fetchAdmins();
      } else {
        Swal.fire({ title: 'เกิดข้อผิดพลาด', text: data.message || 'เกิดข้อผิดพลาดในการลบแอดมิน', icon: 'error' });
      }
    } catch (e) {
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', icon: 'error' });
    }
  };

  const fetchAdminEmail = async () => {
    try {
      const token = localStorage.getItem('restaurantToken');
      if (!token) {
        alert('กรุณาเข้าสู่ระบบใหม่');
        navigate('/restaurant-login');
        return;
      }
      const res = await fetch(buildUrl('/api/restaurant/notification-email'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) setAdminEmail(data.email || '');
    } catch {}
  };

  const handleSetAdminEmail = async () => {
    if (!adminEmail.trim()) {
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'กรุณากรอกอีเมล', icon: 'error' });
      return;
    }
    try {
      const token = localStorage.getItem('restaurantToken');
      if (!token) {
        alert('กรุณาเข้าสู่ระบบใหม่');
        navigate('/restaurant-login');
        return;
      }
      const res = await fetch(buildUrl('/api/restaurant/notification-email'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: adminEmail.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire({ title: 'สำเร็จ!', text: 'ตั้งค่าอีเมลแอดมินสำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false });
        setShowEmailSettings(false);
      } else {
        Swal.fire({ title: 'เกิดข้อผิดพลาด', text: data.message || 'เกิดข้อผิดพลาดในการตั้งค่าอีเมล', icon: 'error' });
      }
    } catch (e) {
      Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', icon: 'error' });
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = changePasswordData;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangePasswordError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setIsChangingPassword(true);
    setChangePasswordError('');

    try {
      const token = localStorage.getItem('restaurantToken');
      if (!token) {
        alert('กรุณาเข้าสู่ระบบใหม่');
        navigate('/restaurant-login');
        return;
      }

      const res = await fetch(buildUrl('/api/restaurant/change-password'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire({ 
          title: 'สำเร็จ!', 
          text: 'เปลี่ยนรหัสผ่านสำเร็จ', 
          icon: 'success', 
          timer: 1500, 
          showConfirmButton: false 
        });
        setShowChangePasswordModal(false);
        setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setChangePasswordError('');
      } else {
        setChangePasswordError(data.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      }
    } catch (e) {
      setChangePasswordError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const menuItems = [
    { id: 1, name: "จัดการอาหาร", image: menuImg, path: "/listfood" },
    { id: 2, name: "จัดการแผนผังโต๊ะและเวลาเปิด - ปิด", image: tableImg, path: hasTableLayout ? "/table-map" : "/table-layouts" },
    { id: 3, name: "รายการจองโต๊ะ", image: notibellImg, path: "/table-reservation" },
    { id: 4, name: "สถานะโต๊ะ", image: statustableImg, path: "/table-status" },
    { id: 5, name: "ประวัติการจองโต๊ะทั้งหมด", image: historyImg, path: "/restaurant-history" },
    { id: 6, name: "ตั้งค่า QR การชำระเงิน", image: QrImg, path: "/QRSettings" },
    { id: 7, name: "จัดการสลิปและจองโต๊ะ", image: QrandtableImg, path: "/payment-slip-management" },
  ];
  
  return (
    <div className="p-8">
      {/* Header with Admin Info and Logout */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-left">
          {adminInfo && (
            <div className="text-sm text-gray-600">
              <p>ยินดีต้อนรับ, <span className="font-semibold text-yellow-600">{adminInfo.username}</span></p>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            เปลี่ยนรหัสผ่าน
          </button>
          <button
            onClick={handleAdminManagement}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            จัดการข้อมูล
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      <div className="text-3xl font-bold text-center mb-4 mt-6 relative">
        เลือกเมนู
        <div className="w-2/3 h-0.5 bg-yellow-200 mx-auto mt-3"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 max-w-7xl mx-auto">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className="block bg-yellow-200 border border-gray-300 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-6 text-center w-full"
          >
            <img src={item.image} alt={item.name} className="w-20 h-20 object-cover mx-auto rounded-md mb-3" />
            <div className="text-base font-semibold text-gray-800 leading-tight">{item.name}</div>
          </Link>
        ))}
      </div>

      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">จัดการข้อมูลแอดมิน</h2>
              <button
                onClick={() => { setShowAdminModal(false); setShowAddAdminModal(false); setNewAdminData({ username: '', password: '' }); setErrorMessage(''); }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                <FaTimes />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">สรุปข้อมูลแอดมิน</h3>
                <p className="text-base text-blue-600">มีแอดมินทั้งหมด <span className="font-bold text-blue-800">{admins.length}</span> คน</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">รายชื่อแอดมินทั้งหมด</h3>
                <button onClick={() => setShowAddAdminModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <FaPlus /> เพิ่มแอดมิน
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อผู้ใช้</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สร้าง</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin, index) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{admin.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.created_at ? new Date(admin.created_at).toLocaleDateString('th-TH') : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-2">
                            <button onClick={() => handleDeleteAdmin(admin.id, admin.username)} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs">ลบ</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {loading && (
                      <tr><td className="px-6 py-4" colSpan={4}>กำลังโหลด...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {admins.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">ไม่มีข้อมูลแอดมิน</div>
              )}
            </div>

            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">ตั้งค่าการแจ้งเตือนอีเมล</h3>
                <button
                  onClick={() => { setShowEmailSettings(!showEmailSettings); if (!showEmailSettings) { fetchAdminEmail(); } }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {showEmailSettings ? 'ปิด' : 'ตั้งค่า'}
                </button>
              </div>
              {showEmailSettings && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">อีเมลนี้จะได้รับการแจ้งเตือนเมื่อมีลูกค้าจองโต๊ะและสั่งอาหารล่วงหน้า</p>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="กรอกอีเมลแอดมินร้าน"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleSetAdminEmail} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">บันทึก</button>
                  </div>
                </div>
              )}
            </div>

            {showAddAdminModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">เพิ่มแอดมินใหม่</h2>
                    <button onClick={() => { setShowAddAdminModal(false); setNewAdminData({ username: '', password: '' }); setErrorMessage(''); }} className="text-gray-500 hover:text-gray-700 text-2xl">
                      <FaTimes />
                    </button>
                  </div>
                  {errorMessage && (<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{errorMessage}</div>)}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้ใช้</label>
                      <input type="text" value={newAdminData.username} onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="กรอกชื่อผู้ใช้" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่าน</label>
                      <input type="password" value={newAdminData.password} onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="กรอกรหัสผ่าน" />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button onClick={() => { setShowAddAdminModal(false); setNewAdminData({ username: '', password: '' }); setErrorMessage(''); }} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors" disabled={isLoading}>ยกเลิก</button>
                      <button onClick={handleAddAdmin} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50" disabled={isLoading}>{isLoading ? 'กำลังเพิ่ม...' : 'ยืนยัน'}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal สำหรับเปลี่ยนรหัสผ่าน */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">เปลี่ยนรหัสผ่าน</h2>
              <button 
                onClick={() => { 
                  setShowChangePasswordModal(false); 
                  setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); 
                  setChangePasswordError(''); 
                }} 
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
            
            {changePasswordError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {changePasswordError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่านปัจจุบัน</label>
                <input 
                  type="password" 
                  value={changePasswordData.currentPassword} 
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="กรอกรหัสผ่านปัจจุบัน" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={changePasswordData.newPassword} 
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="กรอกรหัสผ่านใหม่" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ยืนยันรหัสผ่านใหม่</label>
                <input 
                  type="password" 
                  value={changePasswordData.confirmPassword} 
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
                  placeholder="ยืนยันรหัสผ่านใหม่" 
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => { 
                    setShowChangePasswordModal(false); 
                    setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); 
                    setChangePasswordError(''); 
                  }} 
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors" 
                  disabled={isChangingPassword}
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleChangePassword} 
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50" 
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'กำลังเปลี่ยน...' : 'ยืนยัน'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Menu;