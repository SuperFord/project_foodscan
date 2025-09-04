
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaFilter, FaCalendarAlt, FaClock } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { FiHome, FiUser } from "react-icons/fi";
import { fetchWithAuth } from './fetchWithAuth';

// Custom Thai Date Picker Component
const ThaiDatePicker = ({ value, onChange, label, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const thaiDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  const formatThaiDate = (date) => {
    if (!date) return '';
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear();
    const thaiYear = year > 2500 ? year : year + 543;
    return `${day} ${month} ${thaiYear}`;
  };

  const formatInputDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCurrentMonth(date);
    onChange(formatInputDate(date));
    setIsOpen(false);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <FaCalendarAlt className="inline mr-2" />
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={selectedDate ? formatThaiDate(selectedDate) : ''}
          placeholder={placeholder || "เลือกวันที่"}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent cursor-pointer bg-white"
        />
        <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ‹
            </button>
            <div className="text-center">
              <div className="font-semibold text-gray-800">
                {thaiMonths[currentMonth.getMonth()]} {currentMonth.getFullYear() > 2500 ? currentMonth.getFullYear() : currentMonth.getFullYear() + 543}
              </div>
            </div>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {thaiDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => day && handleDateSelect(day)}
                disabled={!day}
                className={`
                  p-2 text-sm rounded hover:bg-yellow-100 transition-colors
                  ${!day ? 'invisible' : ''}
                  ${isToday(day) ? 'bg-yellow-200 font-bold' : ''}
                  ${isSelected(day) ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'text-gray-700'}
                `}
              >
                {day ? day.getDate() : ''}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                setSelectedDate(null);
                onChange('');
                setIsOpen(false);
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              ล้าง
            </button>
            <button
              onClick={() => handleDateSelect(new Date())}
              className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              วันนี้
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function History() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const token = localStorage.getItem('token');

  useEffect(() => {
    // ตรวจสอบ Token
    const checkToken = async () => {
      const response = await fetchWithAuth('/api/checkToken', {}, navigate);
      if (!response) {
        return;
      }
      if (!response.ok) {
        console.error("Token ไม่ถูกต้องหรือเกิดข้อผิดพลาด");
      }
    };

    // ดึงประวัติการจองและเรียงจากใหม่ไปเก่า
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch(buildUrl('/api/user/history'), {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          // เรียงข้อมูลจากใหม่ไปเก่าโดยใช้ฟิลด์ date
          const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
          setReservations(sortedData);
          setFilteredReservations(sortedData);
        } else {
          console.error("ข้อมูลที่ได้ไม่ใช่ array:", data);
          setReservations([]);
          setFilteredReservations([]);
        }
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการดึงประวัติการจอง:", err);
        setError('ไม่สามารถโหลดข้อมูลได้');
        setReservations([]);
        setFilteredReservations([]);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
    fetchHistory();
  }, [navigate]);

  // ฟังก์ชันกรองข้อมูล
  useEffect(() => {
    let filtered = [...reservations];

    // Debug: ดูรูปแบบวันที่จากเซิร์ฟเวอร์
    if (reservations.length > 0) {
      console.log('Sample reservation date:', reservations[0].date);
      console.log('Start date:', startDate);
      console.log('End date:', endDate);
    }

    // กรองตามวันที่
    if (startDate && endDate) {
      filtered = filtered.filter(res => {
        try {
          // แปลงวันที่จาก DD/MM/YYYY เป็น Date object
          const [day, month, year] = res.date.split('/');
          const reservationDate = new Date(parseInt(year) - 543, parseInt(month) - 1, parseInt(day));
          
          // แปลงวันที่จาก YYYY-MM-DD เป็น Date object
          const start = new Date(startDate + 'T00:00:00');
          const end = new Date(endDate + 'T23:59:59');
          
          // ตรวจสอบว่าวันที่ถูกต้อง
          if (isNaN(reservationDate.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.log('Invalid date:', { reservationDate: res.date, startDate, endDate });
            return false;
          }
          
          return reservationDate >= start && reservationDate <= end;
        } catch (error) {
          console.error('Error filtering date:', error);
          return false;
        }
      });
    } else if (startDate) {
      filtered = filtered.filter(res => {
        try {
          // แปลงวันที่จาก DD/MM/YYYY เป็น Date object
          const [day, month, year] = res.date.split('/');
          const reservationDate = new Date(parseInt(year) - 543, parseInt(month) - 1, parseInt(day));
          
          // แปลงวันที่จาก YYYY-MM-DD เป็น Date object
          const start = new Date(startDate + 'T00:00:00');
          
          if (isNaN(reservationDate.getTime()) || isNaN(start.getTime())) {
            console.log('Invalid start date:', { reservationDate: res.date, startDate });
            return false;
          }
          
          return reservationDate >= start;
        } catch (error) {
          console.error('Error filtering start date:', error);
          return false;
        }
      });
    } else if (endDate) {
      filtered = filtered.filter(res => {
        try {
          // แปลงวันที่จาก DD/MM/YYYY เป็น Date object
          const [day, month, year] = res.date.split('/');
          const reservationDate = new Date(parseInt(year) - 543, parseInt(month) - 1, parseInt(day));
          
          // แปลงวันที่จาก YYYY-MM-DD เป็น Date object
          const end = new Date(endDate + 'T23:59:59');
          
          if (isNaN(reservationDate.getTime()) || isNaN(end.getTime())) {
            console.log('Invalid end date:', { reservationDate: res.date, endDate });
            return false;
          }
          
          return reservationDate <= end;
        } catch (error) {
          console.error('Error filtering end date:', error);
          return false;
        }
      });
    }

    setFilteredReservations(filtered);
  }, [reservations, startDate, endDate]);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'เสร็จสิ้น';
      case 'cancelled':
        return 'ยกเลิก';
      case 'pending':
        return 'รอดำเนินการ';
      default:
        return 'ไม่ระบุ';
    }
  };

  const formatDate = (dateString) => {
    // แปลงวันที่จาก DD/MM/YYYY เป็น Date object เหมือนกับส่วนกรอง
    const [day, month, year] = dateString.split('/');
    const date = new Date(parseInt(year) - 543, parseInt(month) - 1, parseInt(day));
    
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const dayNum = date.getDate();
    const monthName = thaiMonths[date.getMonth()];
    const thaiYear = parseInt(year); // ใช้ปี พ.ศ. โดยตรงจากข้อมูล
    
    return `${dayNum} ${monthName} ${thaiYear}`;
  };

  return (
    <div className="w-full h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 text-white shadow-lg">
        <FaArrowLeft className="text-2xl cursor-pointer hover:text-yellow-200 transition" onClick={() => navigate("/user-setting")} />
        <h1 className="text-2xl font-bold text-center flex-grow">ประวัติการจอง</h1>
        <div className="w-8"></div>
      </div>

      {/* Date Filter Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Date Filter */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ThaiDatePicker
                value={startDate}
                onChange={setStartDate}
                label="วันที่เริ่มต้น"
                placeholder="เลือกวันที่เริ่มต้น"
              />
              <ThaiDatePicker
                value={endDate}
                onChange={setEndDate}
                label="วันที่สิ้นสุด"
                placeholder="เลือกวันที่สิ้นสุด"
              />
            </div>
            {(startDate || endDate) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              แสดงผล {filteredReservations.length} รายการจากทั้งหมด {reservations.length} รายการ
            </div>
            {loading && (
              <div className="flex items-center space-x-2 text-yellow-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span className="text-sm">กำลังโหลด...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* แสดงประวัติ */}
      <div className="max-w-6xl mx-auto p-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {error ? 'เกิดข้อผิดพลาด' : 'ไม่พบข้อมูลการจอง'}
              </h3>
              <p className="text-gray-500">
                {error || 'ไม่พบประวัติการจองในวันที่เลือก'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((res, index) => (
              <div key={res.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div
                  className="flex justify-between items-center p-4 cursor-pointer bg-gradient-to-r from-gray-50 to-white"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">โต๊ะ:</span> {res.setable}
                      </div>
                      <div>
                        <span className="font-medium">เวลา:</span> {res.time}
                      </div>
                      <div>
                        <span className="font-medium">วันที่:</span> {formatDate(res.date)}
                      </div>
                      <div>
                        <span className="font-medium">จำนวน:</span> {res.people} คน
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl text-gray-400 ml-4">
                    {expandedIndex === index ? <IoIosArrowDown /> : <IoIosArrowForward />}
                  </div>
                </div>

                {/* ข้อมูลเพิ่มเติม */}
                {expandedIndex === index && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* ข้อมูลการจอง */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <FaCalendarAlt className="mr-2 text-yellow-500" />
                          ข้อมูลการจอง
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium text-gray-700">ชื่อ:</span> {res.username}</div>
                          <div><span className="font-medium text-gray-700">อีเมล:</span> {res.email}</div>
                          <div><span className="font-medium text-gray-700">รายละเอียด:</span> {res.detail || '-'}</div>
                        </div>
                      </div>

                      {/* สรุปการจอง */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <FaClock className="mr-2 text-yellow-500" />
                          สรุปการจอง
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium text-gray-700">โต๊ะ:</span> {res.setable}</div>
                          <div><span className="font-medium text-gray-700">จำนวนคน:</span> {res.people} คน</div>
                          <div><span className="font-medium text-gray-700">ราคารวม:</span> <span className="font-bold text-green-600">{res.total.toLocaleString()} บาท</span></div>
                        </div>
                      </div>
                    </div>

                    {/* รายการอาหาร */}
                    <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <FaFilter className="mr-2 text-yellow-500" />
                        รายการอาหาร
                      </h3>
                      {res.foods && res.foods.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">ชื่ออาหาร</th>
                                <th className="py-3 px-4 text-center font-semibold text-gray-700 border-b">จำนวน</th>
                                <th className="py-3 px-4 text-right font-semibold text-gray-700 border-b">ราคา</th>
                              </tr>
                            </thead>
                            <tbody>
                              {res.foods.map((food, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-4 text-gray-800">{food.name}</td>
                                  <td className="py-3 px-4 text-center text-gray-600">{food.quantity}</td>
                                  <td className="py-3 px-4 text-right text-gray-600">{food.totalpq} บาท</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-yellow-50">
                                <td colSpan="2" className="py-3 px-4 text-right font-bold text-gray-800">
                                  ราคารวมทั้งหมด:
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-yellow-600">
                                  {res.total.toLocaleString()} บาท
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-2xl mb-2">🍽️</div>
                          <p>ไม่มีรายการอาหาร</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* แถบนำทางด้านล่าง */}
      <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white flex justify-around items-center py-4 shadow-lg">
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

export default History;
