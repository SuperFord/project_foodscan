import React, { useState, useEffect } from 'react';
import { buildUrl } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarAlt, FaFilter, FaSearch, FaUser, FaUtensils } from "react-icons/fa";

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
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
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
  const [error, setError] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('restaurantToken');
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(buildUrl('/api/restaurant/history'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.status === 401 || res.status === 403) {
          setError('กรุณาเข้าสู่ระบบแอดมินใหม่');
          localStorage.removeItem('restaurantToken');
          localStorage.removeItem('restaurantAdmin');
          navigate('/restaurant-login');
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setReservations(data);
          setFilteredReservations(data);
        } else if (Array.isArray(data?.reservations)) {
          setReservations(data.reservations);
          setFilteredReservations(data.reservations);
        } else {
          setReservations([]);
          setFilteredReservations([]);
        }
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลได้');
        setReservations([]);
        setFilteredReservations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  useEffect(() => {
    let filtered = reservations;

    if (startDate && endDate) {
      filtered = filtered.filter(res => {
        const [day, month, year] = (res.date || '').split('/');
        if (!day || !month || !year) return false;
        const reservationDate = new Date(parseInt(year) - 543, parseInt(month) - 1, parseInt(day));

        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return reservationDate >= start && reservationDate <= end;
      });
    } else if (startDate) {
      filtered = filtered.filter(res => {
        const [day, month, year] = (res.date || '').split('/');
        if (!day || !month || !year) return false;
        const reservationDate = new Date(parseInt(year) - 543, parseInt(month) - 1, parseInt(day));
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        return reservationDate >= start;
      });
    } else if (endDate) {
      filtered = filtered.filter(res => {
        const [day, month, year] = (res.date || '').split('/');
        if (!day || !month || !year) return false;
        const reservationDate = new Date(parseInt(year) - 543, parseInt(month) - 1, parseInt(day));
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return reservationDate <= end;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(res =>
        res.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.setable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReservations(filtered);
  }, [reservations, startDate, endDate, searchTerm]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const formatDate = (dateString) => {
    const [day, month, year] = (dateString || '').split('/');
    if (!day || !month || !year) return dateString || '-';
    const thaiYear = parseInt(year);
    const thaiMonth = parseInt(month);
    const thaiDay = parseInt(day);
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return `${thaiDay} ${thaiMonths[thaiMonth - 1]} ${thaiYear}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ensureFoodList = (res) => res.foodorder || res.foods || [];
  const ensureTotal = (res) => {
    if (typeof res.total === 'number') return res.total;
    const list = ensureFoodList(res);
    return list.reduce((sum, f) => sum + (Number(f.totalpq) || 0), 0);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full flex items-center justify-between bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 text-white shadow-lg">
        <FaArrowLeft className="text-2xl cursor-pointer ml-4 hover:text-yellow-100 transition-colors" onClick={() => navigate("/restaurant-menu")} />
        <h1 className="flex-grow text-3xl font-bold text-center p-2">ประวัติการจอง</h1>
        <div className="w-8"></div>
      </div>

      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาจากชื่อผู้จองหรืออีเมล"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                showFilters 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaFilter />
              <span>ตัวกรอง</span>
            </button>
            {(startDate || endDate || searchTerm) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>

          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          )}
        </div>
      </div>

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

      <div className="max-w-6xl mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : filteredReservations.length > 0 ? (
          <div className="space-y-4">
            {filteredReservations.map((res, index) => (
              <div key={res.id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
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
                </div>
                {expandedIndex === index && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <FaUser className="mr-2 text-yellow-500" />
                          ข้อมูลลูกค้า
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium text-gray-700">ชื่อ:</span> {res.username}</div>
                          <div><span className="font-medium text-gray-700">อีเมล:</span> {res.email}</div>
                          <div><span className="font-medium text-gray-700">รายละเอียดเพิ่มเติม:</span> {res.detail || '-'}</div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <FaCalendarAlt className="mr-2 text-yellow-500" />
                          รายละเอียดการจอง
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium text-gray-700">โต๊ะ:</span> {res.setable}</div>
                          <div><span className="font-medium text-gray-700">จำนวนคน:</span> {res.people} คน</div>
                          <div><span className="font-medium text-gray-700">วันที่:</span> {formatDate(res.date)}</div>
                          <div><span className="font-medium text-gray-700">เวลา:</span> {res.time}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <FaUtensils className="mr-2 text-yellow-500" />
                        รายการอาหาร
                      </h3>
                      {ensureFoodList(res).length > 0 ? (
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
                              {ensureFoodList(res).map((food, idx) => (
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
                                  {ensureTotal(res).toLocaleString()} บาท
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FaUtensils className="text-4xl mx-auto mb-2 text-gray-300" />
                          <p>ไม่มีรายการอาหาร</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {error ? 'เกิดข้อผิดพลาด' : 'ไม่พบข้อมูลการจอง'}
              </h3>
              <p className="text-gray-500">
                {error || 'ไม่พบประวัติการจองที่ตรงกับเงื่อนไขการค้นหา'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
