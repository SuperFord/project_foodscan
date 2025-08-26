import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUpload } from "react-icons/fa";
import { API_BASE } from "../../config";

function TableLayouts() {
  const navigate = useNavigate();
  const [tnumber, setTnumber] = useState("");
  const [tname, setTname] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(""); // เก็บชื่อไฟล์ที่เลือก

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : ""); // แสดงชื่อไฟล์ที่เลือก
  };

  const handleSubmit = async () => {
    // ถ้าไม่กรอกข้อมูลใดเลยจะแจ้งเตือน
    if (!tnumber && !tname) {
      alert("กรุณากรอกข้อมูล");
      return;
    }

  
    let imageURL = null;
  
    // 1. อัปโหลดรูปภาพไปที่ table_map
    if (file) {
      const imageFormData = new FormData();
      imageFormData.append("image", file);
  
      try {
        const imageResponse = await fetch(`${API_BASE}/api/table_map`, {
          method: "POST",
          body: imageFormData,
        });
  
        const imageResult = await imageResponse.json();
        if (imageResult.success) {
          imageURL = imageResult.imageURL; // เก็บ URL ของรูปภาพ
        } else {
          alert("เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ!");
          return;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ!");
        return;
      }
    }
  
    // 2. บันทึกข้อมูลจำนวนโต๊ะและชื่อโต๊ะไปที่ table_layout
    try {
      const layoutFormData = new FormData();
      layoutFormData.append("tnumber", tnumber || ""); // ถ้าไม่มีค่าให้ส่งเป็น string ว่าง
      if (tname.trim()) {
        let formattedTname = tname
          .split(",")
          .map((name) => name.trim())
          .filter((name) => name !== "")
          .map((name, index) => `${index + 1}.${name}`)
          .join(",");
        layoutFormData.append("tname", formattedTname);
      }
  
      const layoutResponse = await fetch(`${API_BASE}/api/table_layout`, {
        method: "POST",
        body: layoutFormData,
      });
  
      const layoutResult = await layoutResponse.json();
      if (layoutResult.success) {
        alert("บันทึกข้อมูลสำเร็จ!");
  
        // 📌 ถ้ามีรูปภาพก็ส่งไปยัง table_map
        if (imageURL) {
          navigate("/Restaurant/Menu/TableMap", { state: { imageURL } });
        } else {
          navigate("/Restaurant/Menu/TableMap");
        }
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลแผงผังโต๊ะ!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์!");
    }
  };

  const handleImageClick = () => {
    // เปิดฟอร์มเลือกไฟล์ใหม่เมื่อคลิกที่รูปภาพ
    document.getElementById("fileInput").click();
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-yellow-400 p-4 text-white">
        <FaArrowLeft
          className="text-2xl cursor-pointer ml-4"
          onClick={() => navigate("/Restaurant/Menu")}
        />
        <h1 className="flex-grow text-3xl font-bold text-center p-2">จัดการเเผงผังโต๊ะ</h1>
      </div>

      {/* Upload Section */}
      <div className="p-4 w-full max-w-md ">
        <h2 className="text-lg font-bold text-black">อัปโหลดรูปเเผงผังโต๊ะของร้าน</h2>
        {!file ? (
          <label
            className="mt-4 bg-yellow-100 p-6 rounded-lg flex flex-col items-center cursor-pointer"
            htmlFor="fileInput"
          >
            <FaUpload className="text-yellow-500 text-2xl" />
            <span className="text-yellow-500 mt-2">เลือกไฟล์</span>
          </label>
        ) : (
          <div
            className="mt-4 relative cursor-pointer flex justify-center items-center"
            onClick={handleImageClick}
          >
            <img
              src={URL.createObjectURL(file)}
              alt={fileName}
              className="w-200 h-200 object-cover rounded"
            />
            <span className="absolute top-0 right-0 bg-gray-500 text-white p-1 text-xs rounded-full">
              แก้ไข
            </span>
          </div>
        )}

        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Form หมายเลขโต๊ะ กดปุ่มเพิ่มลด กรอกเลขได้ */}
      <div className="p-4 w-full max-w-md">
        <div className="flex items-center justify-between w-full ">
            <label className="font-bold text-black">หมายเลขโต๊ะ</label>
            <button
              className="p-2 bg-gray-300 rounded text-lg w-10"
              onClick={() => setTnumber((prev) => Math.max((parseInt(prev) || 0) - 1))}
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
              onClick={() => setTnumber((prev) => (parseInt(prev) || 0) + 1)}
            >
              +
            </button>
        </div>

        {/* <label className="block font-bold text-black mt-4">หรือหากเป็นชื่อโต๊ะ</label> */}

        <label className="block font-bold text-black mt-4">เพิ่มชื่อโต๊ะ</label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded mt-1 h-36"
          placeholder="กรอกชื่อโต๊ะทั้งหมด"
          value={tname}
          onChange={(e) => setTname(e.target.value)}
        ></textarea>
        <label className="block font-bold text-red-600 mt-4 text-right">* กรอกชื่อโต๊ะคั่นด้วย , เช่น T01,T02 *</label>
        <button
          className="w-full mt-6 p-3 bg-yellow-400 text-white font-bold rounded-xl"
          onClick={handleSubmit}
        >
          ยืนยัน
        </button>
      </div>
    </div>
  );
}
export default TableLayouts;
