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
    <div className="w-full h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-yellow-400 p-4 text-white">
        <FaArrowLeft className="text-2xl cursor-pointer ml-4" onClick={() => navigate("/Restaurant/Menu")} />
        <h1 className="flex-grow text-3xl font-bold text-center p-2">แผนผังโต๊ะ</h1>
      </div>

      {/* แสดงรูปแผนผังโต๊ะ */}
      <div className="p-4 w-full max-w-md">
        <h2 className="text-lg font-bold text-black">รูปแผนผังโต๊ะ</h2>
        {imageUrl && (
          <div className="mt-4 flex justify-center items-center">
            <img src={imageUrl} alt="Table Map" className="w-200 h-200 object-cover rounded" />
          </div>
        )}
      </div>

      {/* แสดงรายการโต๊ะ */}
      <div className="pl-4 w-full max-w-md text-black">
        <h2 className="text-xl font-bold">โต๊ะทั้งหมด :</h2>
        <p>{tables.map(t => t.tname || t.tnumber).join(", ")}</p>

        {timeRequired && (
          <p className="mt-2">เวลาที่ต้องมารับโต๊ะ : {timeRequired}</p>
        )}

        {(openTime || closeTime) && (
          <p className="mt-2">เวลาเปิด/ปิดการจอง (สำหรับผู้ใช้) : {openTime || "--:--"} - {closeTime || "--:--"}</p>
        )}
      </div>

      {/* ปุ่ม */}
      <div className="pt-2 w-full flex justify-center mt-6">
        <button className="w-3/4 max-w-xs p-3 bg-yellow-400 text-white font-bold rounded-xl"
          onClick={() => navigate("/Restaurant/Menu/TableEditlayouts")}>
          แก้ไข
        </button>
      </div>
    </div>
  );
}