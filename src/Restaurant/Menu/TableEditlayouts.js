import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUpload } from "react-icons/fa";

function TableEditlayouts() {
  const navigate = useNavigate();
  const [tnumber, setTnumber] = useState("");
  const [tname, setTname] = useState("");
  const [timeRequired, setTimeRequired] = useState(""); // ✅ สำคัญมาก ต้องมี!
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // การตั้งค่าเวลาเปิด/ปิดการจอง (ให้แอดมินกำหนดสำหรับผู้ใช้)
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");

  useEffect(() => {
    fetchExistingData();
    fetchReservationWindow();
  }, []);

  const fetchExistingData = async () => {
    try {
        const mapResponse = await fetch("http://localhost:5000/api/table_map");
        const mapResult = await mapResponse.json();
        if (mapResult.success && mapResult.table_maps.length > 0) {
          setImageUrl(`http://localhost:5000${mapResult.table_maps[0].image_path}`);
        }
  
        const layoutResponse = await fetch("http://localhost:5000/api/table_layout");
        const layoutResult = await layoutResponse.json();
        if (layoutResult.success) {
          const tables = layoutResult.tables;
          setTnumber(tables.filter(table => table.tnumber).length); // นับเฉพาะ tnumber
          setTname(tables.map(table => table.tname).filter(name => name).join(", "));
          // โหลดค่าเวลาที่ต้องมารับโต๊ะจากข้อมูลเดิม ถ้ามี
          const existingTime = (tables.find(t => t.time_required) || {}).time_required || "";
          if (existingTime) {
            setTimeRequired(existingTime);
          }
        }
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
  };

  const fetchReservationWindow = async () => {
    try {
      const token = localStorage.getItem("restaurantToken");
      const res = await fetch("http://localhost:5000/api/settings/reservation-window", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setOpenTime(data.openTime || "");
        setCloseTime(data.closeTime || "");
      }
    } catch (err) {
      console.error("Error fetching reservation window:", err);
    }
  };

  const saveReservationWindow = async () => {
    try {
      const token = localStorage.getItem("restaurantToken");
      const res = await fetch("http://localhost:5000/api/settings/reservation-window", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          enabled: true,
          openTime,
          closeTime,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("บันทึกเวลาเปิด/ปิดการจองสำเร็จ");
        navigate("/table-map");
      } else {
        alert(data.message || "บันทึกเวลาไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Error saving reservation window:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };


  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
  };

  const handleSubmit = () => {
    if (!tnumber && !tname) {
      alert("กรุณากรอกข้อมูล");
      return;
    }
  
    // ดึงข้อมูลปัจจุบัน
    fetch("http://localhost:5000/api/table_map")
      .then((res) => res.json())
      .then((mapResult) => {
        const currentImageUrl = mapResult.success && mapResult.table_maps.length > 0
          ? `http://localhost:5000${mapResult.table_maps[0].image_path}`
          : null;
  
        return fetch("http://localhost:5000/api/table_layout");
      })
      .then((res) => res.json())
      .then((layoutResult) => {
        const currentTables = layoutResult.success && layoutResult.tables.length > 0 ? layoutResult.tables : [];
        const currentTnumber = currentTables.length.toString();
        const currentTname = currentTables.map(table => table.tname).join(", ");

  
        let imageChanged = false;
        let tnameChanged = false;
        let tnumberChanged = false;
  
        if (file) {
          imageChanged = true;
        }
  
        let formattedTname = tname
          .split(",")
          .map(name => name.trim())
          .filter(name => name)
          .join(", ");
  
        if (formattedTname !== currentTname) {
          tnameChanged = true;
        }
  
        // แปลง tnumber เป็นตัวเลขเพื่อเปรียบเทียบ
        if (parseInt(tnumber) !== parseInt(currentTnumber)) {
          tnumberChanged = true;
        }
  
        // ส่งข้อมูลไปยัง server.js ให้จัดการลบเอง
        fetch("http://localhost:5000/api/delete_table_data", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(localStorage.getItem("restaurantToken") ? { Authorization: `Bearer ${localStorage.getItem("restaurantToken")}` } : {}) },
          body: JSON.stringify({
            imageChanged,
            tnameChanged,
            tnumberChanged,
          }),
        })
          .then(() => {
            let uploadPromises = [];
  
            // อัปโหลดรูปใหม่ถ้ามีการเปลี่ยนแปลง
            if (imageChanged) {
              const imageFormData = new FormData();
              imageFormData.append("image", file);
              uploadPromises.push(
                fetch("http://localhost:5000/api/table_map", {
                  method: "POST",
                  headers: (localStorage.getItem("restaurantToken") ? { Authorization: `Bearer ${localStorage.getItem("restaurantToken")}` } : {}),
                  body: imageFormData,
                })
              );
            }
  
            // เพิ่มข้อมูล table_layout ใหม่ หรือ อัปเดตเฉพาะเวลา
            if (tnumber || formattedTname) {
              const layoutFormData = new FormData();
              layoutFormData.append("tnumber", tnumber);
              layoutFormData.append("tname", formattedTname);
              layoutFormData.append("time_required", timeRequired);
              uploadPromises.push(
                fetch("http://localhost:5000/api/table_layout", {
                  method: "POST",
                  headers: (localStorage.getItem("restaurantToken") ? { Authorization: `Bearer ${localStorage.getItem("restaurantToken")}` } : {}),
                  body: layoutFormData,
                })
              );
            } else if (timeRequired) {
              uploadPromises.push(
                fetch("http://localhost:5000/api/table_layout/time-required", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", ...(localStorage.getItem("restaurantToken") ? { Authorization: `Bearer ${localStorage.getItem("restaurantToken")}` } : {}) },
                  body: JSON.stringify({ time_required: timeRequired })
                })
              );
            }
  
            return Promise.all(uploadPromises);
          })
          .then(async () => {
            // บันทึกเวลาเปิด/ปิดการจอง (สำหรับผู้ใช้) ก่อน navigate
            const res = await fetch("http://localhost:5000/api/settings/reservation-window", {
              method: "PUT",
              headers: { "Content-Type": "application/json", ...(localStorage.getItem("restaurantToken") ? { Authorization: `Bearer ${localStorage.getItem("restaurantToken")}` } : {}) },
              body: JSON.stringify({ enabled: true, openTime, closeTime })
            });
            const ok = await res.json();
            if (!ok.success) {
              alert("บันทึกเวลาเปิด/ปิดการจองไม่สำเร็จ");
            }
            alert("บันทึกข้อมูลสำเร็จ!");
            navigate("/table-map");
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์!");
          });
      });
  };

  const handleImageClick = () => {
    document.getElementById("fileInput").click();
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-yellow-400 p-4 text-white">
        <FaArrowLeft
          className="text-2xl cursor-pointer ml-4"
          onClick={() => navigate("/table-map")}
        />
        <h1 className="flex-grow text-3xl font-bold text-center p-2">จัดการแผนผังโต๊ะ</h1>
      </div>

      {/* Upload Section */}
      <div className="p-4 w-full max-w-md">
        <h2 className="text-lg font-bold text-black">เเก้ไขรูปแผนผังโต๊ะของร้าน</h2>
        
        {/* แสดงรูปปัจจุบันหากยังไม่อัปโหลดไฟล์ใหม่ */}
        {!file ? (
          <div className="mt-4 relative cursor-pointer flex justify-center items-center">
            {imageUrl ? (
              <img src={imageUrl} alt="Table Map" className="w-128 h-128 object-cover rounded cursor-pointer" onClick={handleImageClick}/>
            ) : (
              <label className="mt-4 bg-yellow-100 p-6 rounded-lg flex flex-col items-center cursor-pointer" htmlFor="fileInput">
                <FaUpload className="text-yellow-500 text-7xl " />
                <span className="absolute top-0 right-0 bg-gray-500 text-white p-1 text-xs rounded-full">เปลี่ยนรูป</span>
                </label>
            )}
          </div>
        ) : (
          <div className="mt-4 relative cursor-pointer flex justify-center items-center" onClick={handleImageClick}>
            <img src={URL.createObjectURL(file)} alt={fileName} className="w-128 h-128 object-cover rounded" />
            <span className="absolute top-0 right-0 bg-gray-500 text-white p-1 text-xs rounded-full">เปลี่ยนรูป</span>
          </div>
        )}
        
        {/* ปุ่มไฟล์ซ่อนอยู่ */}
        <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Form Section */}
      <div className="p-4 w-full max-w-md">
        <div className="flex items-center justify-between w-full ">
          <label className="font-bold text-black">หมายเลขโต๊ะ</label>
          <button
            className="p-2 bg-gray-300 rounded text-lg w-10"
            onClick={() => setTnumber((prev) => Math.max(parseInt(prev) - 1))}
          >
            -
          </button>
          <input
            type="number"
            className="p-2 border border-gray-300 rounded w-18 text-center"
            placeholder="00"
            value={tnumber}
            onChange={(e) => setTnumber(e.target.value)}
          />
          <button
            className="p-2 bg-gray-300 rounded text-lg w-10"
            onClick={() => setTnumber((prev) => parseInt(prev) + 1)}
          >
            +
          </button>
        </div>

        <label className="block font-bold text-black mt-4">ชื่อโต๊ะ</label>
        
        <textarea
          className="w-full p-2 border border-gray-300 rounded mt-1 h-36"
          placeholder="กรอกชื่อโต๊ะทั้งหมด"
          value={tname}
          onChange={(e) => setTname(e.target.value)}
        ></textarea>
        <label className="block font-bold text-red-600 mt-1 text-right">* กรอกชื่อโต๊ะคั่นด้วย , เช่น T01,T02 *</label>

        <div className="mt-4 w-full">
        <label className="block font-bold text-black mb-1">🕒 เวลาที่ต้องมารับโต๊ะ</label>
        <input
          type="time"
          className="w-full p-3 border border-gray-300 rounded-md text-lg
             focus:outline-none focus:border-gray-300 focus:ring-0"
          value={timeRequired}
          onChange={(e) => setTimeRequired(e.target.value)}
        />
      </div>

        {/* ตั้งค่าเวลาเปิด/ปิดการจอง (สำหรับผู้ใช้) */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-bold text-black mb-3">ตั้งค่าเวลาเปิด/ปิดการจอง (สำหรับผู้ใช้)</h3>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div>
              <label className="block font-bold text-black mb-1">เวลาเปิด</label>
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-bold text-black mb-1">เวลาปิด</label>
              <input
                type="time"
                className="w-full p-2 border border-gray-300 rounded"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button className="w-full mt-6 p-3 bg-yellow-400 text-white font-bold rounded-xl" onClick={handleSubmit}>
          ยืนยัน
        </button>
      </div>
    </div>
  );
}

export default TableEditlayouts;