import React, { useState, useEffect, useCallback } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

// Custom Switch component
const Switch = ({ checked, onChange, disabled, className = "" }) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`
                h-6 w-11
                ${checked ? 'bg-yellow-500' : 'bg-gray-400'}
                relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
        >
            <span
                className={`
                    h-5 w-5
                    ${checked ? 'translate-x-6' : 'translate-x-1'}
                    inline-block transform rounded-full bg-white transition-transform duration-200 ease-in-out
                `}
            />
        </button>
    );
};

const TableStatus = () => {
    const [tables, setTables] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Get restaurant token from localStorage
    const getToken = () => {
        return localStorage.getItem('restaurantToken');
    };

    // Check if token is expired
    const isTokenExpired = (token) => {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch (error) {
            return true;
        }
    };

    // Handle authentication
    const handleAuth = () => {
        const token = getToken();
        if (!token || isTokenExpired(token)) {
            localStorage.removeItem('restaurantToken');
            localStorage.removeItem('restaurantAdmin');
            navigate('/restaurant-login');
            return null;
        }
        return token;
    };

    const fetchData = async () => {
        try {
            const token = handleAuth();
            if (!token) return;

            const response = await fetch("http://localhost:5000/api/table_today", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    // กรองโต๊ะที่มี tname หรือ tnumber อย่างน้อยหนึ่งตัว
                    const validTables = result.tables.filter(table => {
                        const hasTname = table.tname && table.tname !== null && table.tname !== undefined && table.tname !== '';
                        const hasTnumber = table.tnumber && table.tnumber !== null && table.tnumber !== undefined && table.tnumber !== '';
                        return hasTname || hasTnumber; // มีอย่างน้อยหนึ่งตัว
                    });

                    const sortedTables = validTables.sort((a, b) => {
                        // เรียงลำดับตาม tnumber ก่อน (ถ้ามี) แล้วตาม tname
                        const aNumber = parseInt(a.tnumber) || 0;
                        const bNumber = parseInt(b.tnumber) || 0;
                        
                        if (aNumber !== 0 && bNumber !== 0 && aNumber !== bNumber) {
                            return aNumber - bNumber;
                        }
                        
                        const aName = (a.tname || '').toLowerCase();
                        const bName = (b.tname || '').toLowerCase();
                        return aName.localeCompare(bName);
                    });
        
                    setTables(sortedTables);
                }
            }
        } catch (error) {
            // Error handling without console.log
        }
    };

    const updateTableStatus = async (tableId, newStatus) => {
        if (!tableId) {
            return;
        }
        
        setLoading(true);
        try {
            const token = handleAuth();
            if (!token) return;

            const response = await fetch(`http://localhost:5000/api/table_status/${tableId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // อัปเดตสถานะใน state
                    setTables(prevTables => 
                        prevTables.map(table => 
                            table.id === tableId 
                                ? { ...table, status: newStatus }
                                : table
                        )
                    );
                }
            }
        } catch (error) {
            // Error handling without console.log
        } finally {
            setLoading(false);
        }
    };

    const updateAllTablesStatus = async (newStatus) => {
        setLoading(true);
        try {
            const token = handleAuth();
            if (!token) return;

            const response = await fetch("http://localhost:5000/api/table_status/all", {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // อัปเดตสถานะทั้งหมดใน state
                    setTables(prevTables => 
                        prevTables.map(table => ({ ...table, status: newStatus }))
                    );
                }
            }
        } catch (error) {
            // Error handling without console.log
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = useCallback((tableId, tableName) => {
        if (expanded === tableId) {
            setExpanded(null);
            setReservation(null);
        } else {
            setExpanded(tableId);
            fetchReservationDetails(tableName);
        }
    }, [expanded]);

    const fetchReservationDetails = async (tableName) => {
        try {
            const token = handleAuth();
            if (!token) return;

            const response = await fetch(`http://localhost:5000/api/reservation_by_table?table=${encodeURIComponent(tableName)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.reservation) {
                    setReservation(result.reservation);
                } else {
                    setReservation(null);
                }
            } else {
                setReservation(null);
            }
        } catch (error) {
            // Error handling without console.log
            setReservation(null);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // คำนวณจำนวนโต๊ะในแต่ละสถานะ
    const availableTables = tables.filter(table => table.status === 1).length;
    const occupiedTables = tables.filter(table => table.status === 2).length;
    const totalTables = tables.length;

    // ตรวจสอบสถานะทั้งหมด
    const allTablesAvailable = totalTables > 0 && availableTables === totalTables;
    const allTablesOccupied = totalTables > 0 && occupiedTables === totalTables;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/restaurant-menu')}
                            className="text-white hover:text-yellow-100 transition-colors duration-200"
                        >
                            <FaArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-3xl font-bold text-white text-center flex-1">สถานะโต๊ะ</h1>
                        <div className="w-6"></div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Master Control Panel */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {/* <h2 className="text-xl font-semibold text-gray-800">ควบคุมสถานะโต๊ะทั้งหมด</h2>
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">ปิดทั้งหมด</span>
                            <Switch
                                checked={allTablesOccupied}
                                onChange={(checked) => updateAllTablesStatus(checked ? 2 : 1)}
                                disabled={loading}
                                className="scale-125"
                            />
                            <span className="text-sm text-gray-600">เปิดทั้งหมด</span>
                        </div> */}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-2xl font-bold text-green-600">{availableTables}</div>
                            <div className="text-sm text-green-700">โต๊ะว่าง</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="text-2xl font-bold text-red-600">{occupiedTables}</div>
                            <div className="text-sm text-red-700">โต๊ะไม่ว่าง</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">{totalTables}</div>
                            <div className="text-sm text-blue-700">โต๊ะทั้งหมด</div>
                        </div>
                    </div>
                </div>

                {/* Tables Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tables.map((table, idx) => {
                        // สร้างชื่อโต๊ะโดยแสดงเฉพาะข้อมูลที่มีค่า
                        let tableName = '';
                        if (table.tname && table.tname !== null && table.tname !== undefined && table.tname !== '') {
                            tableName += table.tname;
                        }
                        if (table.tnumber && table.tnumber !== null && table.tnumber !== undefined && table.tnumber !== '') {
                            if (tableName) tableName += ' '; // เพิ่มช่องว่างถ้ามีทั้งสอง
                            tableName += table.tnumber;
                        }
                        
                        const isTableAvailable = table.status === 1;
                        const isExpanded = expanded === table.id;

                        return (
                            <div key={table.id || idx} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                {/* Table Header */}
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">{tableName}</h3>
                                        <Switch
                                            checked={isTableAvailable}
                                            onChange={(checked) => updateTableStatus(table.id, checked ? 1 : 2)}
                                            disabled={loading}
                                        />
                                    </div>
                                    
                                    {/* Status Badge */}
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        isTableAvailable 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {isTableAvailable ? 'ว่าง' : 'ไม่ว่าง'}
                                    </div>
                                    
                                    {/* Expand Button */}
                                    <button
                                        onClick={() => toggleExpand(table.id, tableName)}
                                        className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors py-2 rounded-lg hover:bg-gray-50"
                                    >
                                        <span className="text-sm font-medium">
                                            {isExpanded ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
                                        </span>
                                        {isExpanded ? (
                                            <IoIosArrowDown className="w-4 h-4" />
                                        ) : (
                                            <IoIosArrowForward className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {/* Expandable Content */}
                                {isExpanded && (
                                    <div className="px-6 pb-6">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-800 mb-3">รายละเอียดการจอง</h4>
                                            {reservation ? (
                                                <div className="space-y-2 text-sm">
                                                    {reservation.setable && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">โต๊ะ:</span>
                                                            <span className="font-medium">{reservation.setable}</span>
                                                        </div>
                                                    )}
                                                    {reservation.username && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">ชื่อ:</span>
                                                            <span className="font-medium">{reservation.username}</span>
                                                        </div>
                                                    )}
                                                    {reservation.people && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">จำนวนคน:</span>
                                                            <span className="font-medium">{reservation.people}</span>
                                                        </div>
                                                    )}
                                                    {reservation.time && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">เวลา:</span>
                                                            <span className="font-medium">{reservation.time}</span>
                                                        </div>
                                                    )}
                                                    {reservation.date && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">วันที่:</span>
                                                            <span className="font-medium">{reservation.date}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-sm">ไม่มีข้อมูลการจอง</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {tables.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg">ไม่พบข้อมูลโต๊ะ</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TableStatus;
