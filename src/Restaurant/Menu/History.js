import React, { useState, useEffect } from 'react';
import { API_BASE } from "../../config";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaCog } from "react-icons/fa";

function History() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/restaurant/history`)
      .then(res => res.json())
      .then(data => setReservations(data))
      .catch(err => console.error(err));
  }, []);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="w-full h-screen bg-white">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-yellow-400 p-4 text-white">
        <FaArrowLeft className="text-2xl cursor-pointer ml-4" onClick={() => navigate("/Restaurant/Menu")} />
        <h1 className="flex-grow text-3xl font-bold text-center p-2">ประวัติการจอง</h1>
      </div>

      {reservations.map((res, index) => (
        <div key={res.id} className="border-b border-gray-300 bg-white">
          {/* แถบบน */}
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleExpand(index)}
          >
            <div>
              <div className="font-semibold">หมายเลขจอง: {res.code}</div>
              <div>โต๊ะ: {res.setable}</div>
              <div>เวลา: {res.time} {res.date}</div>
            </div>
            <div className="text-xl">{expandedIndex === index ? '▼' : '▶︎'}</div>
          </div>

          {/* ข้อมูลเพิ่มเติม */}
          {expandedIndex === index && (
            <div className="bg-gray-50 px-6 p-4 pb-4 text-sm text-black">
              <div><strong>ชื่อ:</strong> {res.username}</div>
              <div><strong>อีเมล:</strong> {res.email}</div>
              <div><strong>เวลาและวันที่นัดหมาย:</strong> {res.time} {res.date}</div>
              <div><strong>โต๊ะ:</strong> {res.setable}</div>
              <div><strong>จำนวน:</strong> {res.people} คน</div>
              <div><strong>รายละเอียดเพิ่มเติม:</strong> {res.detail || '-'}</div>
                {/* รายการอาหาร */}
                <div className="">
                  <div className="font-semibold">รายการอาหาร</div>
                  {res.foods && res.foods.length > 0 ? (
                    <div className="w-fit mx-auto mt-2">
                      <table className="border border-black text-sm w-full">
                        <thead className="bg-white">
                          <tr>
                            <th className="py-1 px-6 border border-black">ชื่ออาหาร</th>
                            <th className="py-1 px-6 border border-black">จำนวน</th>
                            <th className="py-1 px-6 border border-black">ราคา</th>
                          </tr>
                        </thead>
                        <tbody>
                          {res.foods.map((food, idx) => (
                            <tr key={idx} className="text-center">
                              <td className="py-1 px-6 border border-black">{food.name}</td>
                              <td className="py-1 px-6 border border-black">{food.quantity}</td>
                              <td className="py-1 px-6 border border-black">{food.totalpq}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="2" className="py-1 px-6 border border-black text-center font-bold">
                              ราคารวม
                            </td>
                            <td className="py-1 px-6 border border-black text-right font-bold">
                              {res.total.toLocaleString()} บาท
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 mt-2">ไม่มีรายการอาหาร</div>
                  )}
                </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default History;
