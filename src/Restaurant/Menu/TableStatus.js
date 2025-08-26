import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import axios from 'axios';
import { API_BASE } from "../config";

function TableStatus() {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [reservation, setReservation] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const resTables = await axios.get(`${API_BASE}/api/table_today`);
            if (resTables.data.success) {
                const sortedTables = resTables.data.tables.sort((a, b) => {
                    // ฟังก์ชันเพื่อดึงชื่อและเลขจากแต่ละแถว
                    const getNameParts = (table) => {
                        return {
                            name: (table.tname || '').toLowerCase(),
                            number: parseInt(table.tnumber) || 0
                        };
                    };
                
                    // ดึงข้อมูลจากแต่ละแถว
                    const aParts = getNameParts(a);
                    const bParts = getNameParts(b);
                
                    // 1. เปรียบเทียบเลขก่อน
                    if (aParts.number !== bParts.number) {
                        return aParts.number - bParts.number; // เลขน้อยก่อน
                    }

                    // 2. ถ้าเลขเท่ากัน ให้เปรียบเทียบตัวอักษร
                    return aParts.name.localeCompare(bParts.name); // ตัวอักษร A-Z
                });
    
                setTables(sortedTables);
            } else {
                console.error("Failed to fetch table data");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const getStatusColor = (status) => {
        return status === 1 ? "bg-green-500" : "bg-red-500";
    };

    const toggleExpand = async (tableId, tableName) => {
        if (expanded === tableId) {
            setExpanded(null);
            setReservation(null);
            return;
        }
    
        setExpanded(tableId);
    
        try {
            const res = await axios.get(`${API_BASE}/api/reservation_by_table`, {
                params: { table: tableName }
            });
    
            if (res.data.success && res.data.reservation) {
                setReservation(res.data.reservation);
                // console.log("Reservation data:", res.data.reservation);
            } else {
                setReservation(null);
            }
        } catch (error) {
            console.error("Error fetching reservation:", error);
            setReservation(null);
        }
    };

    return (
        <div className="w-full h-screen bg-white flex flex-col items-center">
            {/* Header */}
            <div className="w-full flex items-center justify-between bg-yellow-400 p-4 text-white">
                <FaArrowLeft
                    className="text-2xl cursor-pointer ml-4"
                    onClick={() => navigate("/Restaurant/Menu")}
                />
                <h1 className="flex-grow text-3xl font-bold text-center p-2">สถานะโต๊ะปัจจุบัน</h1>
            </div>

            {/* Table list */}
            <table className="w-full text-lg table-fixed">
            <thead>
                <tr className="bg-white border border-black">
                <th className="p-2 pl-20 w-[30%] text-left whitespace-nowrap">โต๊ะ</th>
                <th className="p-2 w-[40%]">สถานะ</th>
                <th className="w-[30%]"></th>
                </tr>
            </thead>
            <tbody>
                {Array.isArray(tables) && tables.length > 0 ? (
                    tables.map((table, idx) => {
                    const statusColor = getStatusColor(table.status);
                    const tableName = `${table.tname || ''} ${table.tnumber || ''}`.trim();
                    const isExpanded = expanded === idx;

                    return (
                        <React.Fragment key={idx}>
                        <tr
                            className="bg-gray-100 border border-black cursor-pointer hover:bg-yellow-100"
                            onClick={() => toggleExpand(idx, tableName)}
                        >
                            <td className="p-4 pl-20 w-[30%] text-left whitespace-nowrap">{tableName || 'ไม่มีข้อมูล'}</td>
                            <td className="p-4 w-[40%]">
                                <div className="flex justify-center">
                                    <div className={`w-4 h-4 rounded-full ${statusColor}`} />
                                </div>
                            </td>
                            <td className="p-4 pl-14 w-[30%]">
                            {isExpanded ? <IoIosArrowDown /> : <IoIosArrowForward />}
                            </td>
                        </tr>

                        {isExpanded && (
                            <tr className="bg-yellow-50">
                            <td colSpan="3" className="p-4 pl-16 text-gray-700">
                                {/* แสดงรายละเอียดเพิ่มเติมของโต๊ะนี้ */}
                                {!reservation && (
                                    <div><strong>สถานะ:</strong> {table.status === 1 ? 'ว่าง' : 'ไม่ว่าง'}</div>
                                )}
                                {reservation ? (
                                    <>                                
                                        <div><strong>โต๊ะ:</strong> {reservation && reservation.setable ? `${reservation.setable.replace(',' , ', ' , ' ,')}` : '-'}</div>
                                        <div><strong>ชื่อ:</strong> {reservation.username}</div>
                                    </>
                                ) : (
                                    <div className="text-gray-500 mt-2">ไม่มีข้อมูลการจอง</div>
                                )}
                            </td>
                            </tr>
                        )}
                        </React.Fragment>
                    );
                    })
                ) : (
                    <tr>
                    <td colSpan="3" className="text-center p-4">ไม่พบข้อมูลโต๊ะ</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export default TableStatus;
