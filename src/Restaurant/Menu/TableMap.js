import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function Table_map() {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(""); // เก็บ URL ของรูปแผนผังโต๊ะ
  const [tables, setTables] = useState([]); // เก็บข้อมูลโต๊ะทั้งหมด
  const [timeRequired, setTimeRequired] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");


  useEffect(() => {
    fetchTableData();
    fetchReservationWindow();
  }, []);

  const fetchTableData = async () => {
    try {
      // ดึงข้อมูลรูปแผนผังโต๊ะ
      const mapResponse = await fetch("http://localhost:5000/api/table_map");
      const mapResult = await mapResponse.json();
      if (mapResult.success && mapResult.table_maps.length > 0) {
        setImageUrl(`http://localhost:5000${mapResult.table_maps[0].image_path}`);
      }

      // ดึงข้อมูลโต๊ะจาก table_layout
      const tableResponse = await fetch("http://localhost:5000/api/table_layout");
      const tableResult = await tableResponse.json();
      if (tableResult.success) {
        setTables(tableResult.tables); // ✅ เก็บทั้ง object
        if (tableResult.tables.length > 0) {
          setTimeRequired(tableResult.tables[0].time_required); // ✅ ดึงเวลาจากตัวแรก
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchReservationWindow = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/settings/reservation-window");
      const data = await res.json();
      if (data.success) {
        setOpenTime(data.openTime || "");
        setCloseTime(data.closeTime || "");
      }
    } catch (err) {
      console.error("Error fetching reservation window:", err);
    }
  };


  // ฟังก์ชันเรียงข้อมูลตัวเลขก่อน ตามด้วยตัวอักษร
  const sortTableNames = (tableList) => {
    let numbers = tableList.filter(name => !isNaN(name)).map(Number).sort((a, b) => a - b);
    let letters = tableList.filter(name => isNaN(name)).sort();
    return [...numbers, ...letters];
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-50 to-white">
      {/* Header */}
      <div className="w-full p-4 text-white text-xl font-semibold flex justify-center items-center relative bg-gradient-to-r from-yellow-400 to-yellow-500 shadow">
        <FaArrowLeft
          className="text-2xl cursor-pointer absolute left-4"
                      onClick={() => navigate("/restaurant-menu")}
        />
        <span>แผนผังโต๊ะ</span>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card: Table map image */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">รูปแผนผังโต๊ะ</h2>
          </div>
          <div className="p-4">
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img src={imageUrl} alt="Table Map" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-64 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                ไม่มีรูปแผนผังโต๊ะ
              </div>
            )}
          </div>
        </div>

        {/* Card: Details */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">รายละเอียด</h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Time chips */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500 mb-1">เวลาเปิดจองโต๊ะ</div>
                <div className="text-gray-900 font-semibold">{openTime || "--:--"}</div>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-500 mb-1">เวลาปิดจองโต๊ะ</div>
                <div className="text-gray-900 font-semibold">{closeTime || "--:--"}</div>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 col-span-2">
                <div className="text-sm text-gray-500 mb-1">เวลาที่ต้องมารับโต๊ะ</div>
                <div className="text-gray-900 font-semibold">{timeRequired || "-"}</div>
              </div>
            </div>

            {/* Tables chips */}
            <div>
              <div className="text-sm text-gray-500 mb-2">โต๊ะทั้งหมด</div>
              {tables && tables.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sortTableNames(tables.map(t => t.tname || t.tnumber)).map((name, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 border border-yellow-200">
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400">ไม่มีข้อมูลโต๊ะ</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-6">
        <div className="max-w-4xl mx-auto flex justify-center">
          <button
            className="w-full lg:w-auto px-10 py-4 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-xl shadow transition-colors"
            onClick={() => navigate("/table-edit-layouts")}
          >
            แก้ไขแผนผัง
          </button>
        </div>
      </div>
    </div>
  );
}