import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Select from "react-select";
import Swal from 'sweetalert2';
import { fetchWithAuth } from './fetchWithAuth';

export default function ReserTable() {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(""); 
  const [tables, setTables] = useState([]); 
  const [selectedTables, setSelectedTables] = useState([]); 
  const [joinTables, setJoinTables] = useState(false); 
  const [reservationEnabled, setReservationEnabled] = useState(false);
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [isClosedNow, setIsClosedNow] = useState(false);

  const token = localStorage.getItem('token');  // ดึง JWT token จาก localStorage

  const fetchTableData = useCallback(async () => {
    try {
      const mapResponse = await fetch("/api/table_map");
      const mapResult = await mapResponse.json();
      if (mapResult.success && mapResult.table_maps.length > 0) {
        setImageUrl(`${process.env.REACT_APP_API_URL?.replace(/\/$/, '') || ''}${mapResult.table_maps[0].image_path}`);
      }
      const tableResponse = await fetch("/api/Rtable_layout");
      const tableResult = await tableResponse.json();
      if (tableResult.success && Array.isArray(tableResult.tables)) {
        // console.log("Table Result: ", tableResult.tables);
        // กรองโต๊ะที่มีสถานะเป็น 2 ออกจากรายการ
        const availableTables = tableResult.tables.filter(table => table.status !== 2);
        let tableList = availableTables.map(table => table.tname || table.tnumber);
        setTables(sortTableNames(tableList));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchTableData();
    fetchReservationWindow();
  }, [fetchTableData]);

  const fetchReservationWindow = async () => {
    try {
      const res = await fetch("/api/settings/reservation-window");
      const data = await res.json();
      if (data.success) {
        setReservationEnabled(Boolean(data.enabled));
        setOpenTime(data.openTime || "");
        setCloseTime(data.closeTime || "");
        computeClosedNow(Boolean(data.enabled), data.openTime, data.closeTime);

        // ถ้าอยู่นอกเวลา ให้แจ้งเตือนและเด้งกลับหน้าเมนู
        const nowClosed = (() => {
          if (!Boolean(data.enabled) || !data.openTime || !data.closeTime) return true;
          const now = new Date();
          const [oh, om] = String(data.openTime).split(":").map(Number);
          const [ch, cm] = String(data.closeTime).split(":").map(Number);
          const open = new Date(now);
          open.setHours(oh, om, 0, 0);
          const close = new Date(now);
          close.setHours(ch, cm, 0, 0);
          if (close <= open) {
            return !(now >= open || now < close);
          }
          return !(now >= open && now < close);
        })();

        if (nowClosed) {
          Swal.fire({
            icon: 'warning',
            title: 'อยู่นอกเวลาการจอง',
            text: 'กรุณากลับมาใหม่ในช่วงเวลาที่เปิดให้จอง',
            confirmButtonText: 'ตกลง',
            timer: 2500,
            timerProgressBar: true,
          }).then(() => navigate('/user-menu'));
        }
      }
    } catch (err) {
      console.error("Error fetching reservation window:", err);
    }
  };

  const computeClosedNow = (enabled, openT, closeT) => {
    if (!enabled) {
      setIsClosedNow(true);
      return;
    }
    if (!openT || !closeT) {
      setIsClosedNow(true);
      return;
    }
    try {
      const now = new Date();
      const [oh, om] = String(openT).split(":").map(Number);
      const [ch, cm] = String(closeT).split(":").map(Number);
      const open = new Date(now);
      open.setHours(oh, om, 0, 0);
      const close = new Date(now);
      close.setHours(ch, cm, 0, 0);

      let openNow = false;
      if (close <= open) {
        // ข้ามวัน: เปิดถ้า ตอนนี้ >= เปิด หรือ ตอนนี้ < ปิด
        openNow = now >= open || now < close;
      } else {
        openNow = now >= open && now < close;
      }
      setIsClosedNow(!openNow);
    } catch (e) {
      setIsClosedNow(true);
    }
  };

  //เช็คหมายวันนั้นมีการจองโต๊ะสั่งอาหารหรือยัง
  useEffect(() => {
    const token = localStorage.getItem("token");
  
    //เช็ค token ว่ามีการ login มายัง
    const checkToken = async () => {
      const response = await fetchWithAuth("/api/checkToken", {}, navigate);  // ใช้ fetchWithAuth ในการเช็ค token
        if (!response) {
          // fetchWithAuth จะ redirect ไป /User ให้อยู่แล้วถ้า token หมดอายุ
          return;
        }
        if (!response.ok) {
          console.error("Token invalid or other error");
        }
    };
    checkToken();

    const checkExistingReservation = async () => {
      try {
        const res = await fetch("/api/reservation/today", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const data = await res.json();

        if (data.length > 0) {
          // ถ้ามีการจองวันนี้อยู่แล้วให้เปลี่ยนเส้นทาง
          navigate("/user-detail");
        }
        
        // 🕒 เช็คเวลาเกิน 19:30
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // if (currentHour > 19 || (currentHour === 19 && currentMinute >= 30)) {
        //   Swal.fire({
        //     icon: 'warning',
        //     title: 'เกิดข้อผิดพลาด',
        //     text: 'หลังเวลา 19:30 น. จะไม่สามารถจองโต๊ะล่วงหน้าได้ กรุณา walk-in ที่ร้าน',
        //     confirmButtonText: 'ตกลง',
        //     timer: 3000,
        //     timerProgressBar: true,
        //   }).then(() => {
        //     navigate("/User/Menu");
        //   });
        // }

      } catch (err) {
        console.error("Error checking reservation:", err);
      }
    };
    checkExistingReservation();
  }, [token,navigate,isClosedNow]);

  const sortTableNames = (tableList) => {
    return tableList.sort((a, b) => a.localeCompare(b, "th", { numeric: true }));
  };

  const tableOptions = tables.map(table => ({
    value: table,
    label: table
  }));

  const handleNext = () => {
    if (selectedTables.length === 0) {
      alert("กรุณาเลือกโต๊ะก่อนดำเนินการต่อ");
      return;
    }
  
    navigate("/user-reservation", {
      state: {
        selectedTables: selectedTables,
        joinTables: joinTables
      }
    });
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 text-black">
                    <FaArrowLeft className="text-2xl cursor-pointer ml-2" onClick={() => navigate("/user-menu")} />
        <div className="flex-grow text-3xl font-bold text-center p-2">จองโต๊ะ</div>
      </div>

      {/* Table Map */}
      <div className="p-2 w-full max-w-md">
        {imageUrl && <img src={imageUrl} alt="Table Map" className="w-200 h-200 object-cover rounded" />}
      </div>

      {/* Closed banner */}
      {isClosedNow && (
        <div className="p-3 bg-red-100 text-red-700 rounded text-center w-full max-w-md">
          ขออภัย ขณะนี้ระบบการจองปิดให้บริการ กรุณาจองได้ในช่วงเวลาที่กำหนด
        </div>
      )}

      {/* Table Selection */}
      <div className="p-4 w-full max-w-md text-black">
        <Select
          isMulti
          isDisabled={isClosedNow}
          options={tableOptions}
          value={selectedTables}
          onChange={setSelectedTables}
          className="basic-multi-select"
          classNamePrefix="Select"
          placeholder="กรุณาเลือกโต๊ะ (สามารถเลือกได้หลายโต๊ะ)"
        />
      </div>

      {/* Join Tables Checkbox */}
      <div className="p-4 w-full max-w-md text-black flex items-center ">
        <input
          type="checkbox"
          id="joinTables"
          checked={joinTables}
          onChange={(e) => setJoinTables(e.target.checked)}
          className="mr-2 w-6 h-6"
        />
        <label htmlFor="joinTables" className="text-lg mr-2">ต้องการต่อโต๊ะ</label> 
        <label htmlFor="joinTables" className="text-lg text-zinc-700"> (ได้เฉพาะโต๊ะที่ติดกันเท่านั้น) </label>
      </div>

      {/* Next Button */}
      <div className="w-full flex justify-center mt-6">
        <button 
          className={`w-3/4 max-w-xs p-3 font-bold rounded-xl ${isClosedNow || selectedTables.length === 0 ? "bg-yellow-400 text-white cursor-not-allowed" : "bg-yellow-400 text-white"}`}
          onClick={handleNext}
          disabled={isClosedNow || selectedTables.length === 0}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}
