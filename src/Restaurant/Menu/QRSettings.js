"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { buildUrl } from "../../utils/api"
import { FaArrowLeft, FaSave, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa"

function QRSettings() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [promptpayNumber, setPromptpayNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // success, error, warning
  const navigate = useNavigate()

  const showMessage = useCallback((text, type = "success") => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage("")
      setMessageType("")
    }, 5000)
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem("restaurantToken")
      const response = await fetch(buildUrl("/api/settings/qr-payment"), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (response.status === 401 || response.status === 403) {
        setLoading(false)
        showMessage("กรุณาเข้าสู่ระบบแอดมินก่อน", "error")
        localStorage.removeItem("restaurantToken")
        localStorage.removeItem("restaurantAdmin")
        navigate("/restaurant-login")
        return
      }
      const data = await response.json()

      if (data.success) {
        setIsEnabled(data.enableQR || false)
        setPromptpayNumber(data.promptpayNumber || "")
      } else {
        showMessage("เกิดข้อผิดพลาดในการโหลดข้อมูล", "error")
      }
      setLoading(false)
    } catch (err) {
      // Error handling without console.log
    }
  }, [showMessage])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = async () => {
    setSaving(true)
    setMessage("")

    // ตรวจสอบว่าถ้าเปิด QR ต้องมีเลขพร้อมเพย์
    if (isEnabled && !promptpayNumber.trim()) {
      showMessage("กรุณาใส่เลขพร้อมเพย์ก่อนเปิดใช้งาน QR", "error")
      setSaving(false)
      return
    }

    // ตรวจสอบรูปแบบเลขพร้อมเพย์
    if (promptpayNumber && !/^[0-9]{10,13}$/.test(promptpayNumber.replace(/[-\s]/g, ""))) {
      showMessage("เลขพร้อมเพย์ต้องเป็นตัวเลข 10-13 หลัก", "error")
      setSaving(false)
      return
    }

    try {
      const requestData = {
        enableQR: isEnabled,
        promptpayNumber: promptpayNumber.trim(),
      }

      const token = localStorage.getItem("restaurantToken")
      const response = await fetch(buildUrl("/api/settings/qr-payment"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (data.success) {
        showMessage("บันทึกการตั้งค่าสำเร็จ", "success")
        // รีเฟรชข้อมูลหลังจากบันทึกสำเร็จ
        setTimeout(() => {
          fetchSettings()
        }, 1000)
      } else {
        showMessage(data.message || "เกิดข้อผิดพลาดในการบันทึก", "error")
      }
    } catch (err) {
      // Error handling without console.log
      showMessage("เกิดข้อผิดพลาดในการบันทึก", "error")
    } finally {
      setSaving(false)
    }
  }

  const formatPromptpayNumber = (value) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 13) {
      setPromptpayNumber(numbers)
    }
  }

  const validatePromptpayNumber = useCallback((number) => {
    if (!number) return { isValid: false, message: "กรุณาใส่เลขพร้อมเพย์" }
    if (number.length < 10) return { isValid: false, message: "เลขพร้อมเพย์ต้องมีอย่างน้อย 10 หลัก" }
    if (number.length > 13) return { isValid: false, message: "เลขพร้อมเพย์ต้องไม่เกิน 13 หลัก" }
    if (!/^[0-9]+$/.test(number)) return { isValid: false, message: "เลขพร้อมเพย์ต้องเป็นตัวเลขเท่านั้น" }
    return { isValid: true, message: "รูปแบบถูกต้อง" }
  }, [])

  const promptpayValidation = validatePromptpayNumber(promptpayNumber)

  if (loading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-yellow-400 p-4 text-white shadow-md">
        <FaArrowLeft
          className="text-2xl cursor-pointer ml-4 hover:text-yellow-200 transition-colors"
                      onClick={() => navigate("/restaurant-menu")}
        />
        <h1 className="flex-grow text-3xl font-bold text-center p-2">การตั้งค่า QR พร้อมเพย์</h1>
        <div className="w-8"></div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-center font-medium flex items-center justify-center space-x-2 ${
              messageType === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : messageType === "error"
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : "bg-yellow-100 text-yellow-800 border border-yellow-200"
            }`}
          >
            {messageType === "success" && <FaCheckCircle />}
            {messageType === "error" && <FaExclamationTriangle />}
            {messageType === "warning" && <FaInfoCircle />}
            <span>{message}</span>
          </div>
        )}

        {/* PromptPay Number Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center space-x-2">
            <span>เลขพร้อมเพย์</span>
            {promptpayNumber && promptpayValidation.isValid && <FaCheckCircle className="text-green-500" />}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">หมายเลขโทรศัพท์หรือเลขประจำตัวประชาชน</label>
              <input
                type="text"
                value={promptpayNumber}
                onChange={(e) => formatPromptpayNumber(e.target.value)}
                placeholder="เช่น 0812345678 หรือ 1234567890123"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                  promptpayNumber
                    ? promptpayValidation.isValid
                      ? "border-green-300 focus:ring-green-400"
                      : "border-red-300 focus:ring-red-400"
                    : "border-gray-300 focus:ring-yellow-400"
                }`}
                maxLength="13"
              />
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500">รองรับเลขโทรศัพท์ (10 หลัก) หรือเลขประจำตัวประชาชน (13 หลัก)</p>
                {promptpayNumber && (
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-blue-600">ความยาว: {promptpayNumber.length} หลัก</p>
                    <span className={`text-sm ${promptpayValidation.isValid ? "text-green-600" : "text-red-600"}`}>
                      {promptpayValidation.message}
                    </span>
                  </div>
                )}
                {!promptpayNumber && (
                  <div className="flex items-center text-orange-600 text-sm space-x-1">
                    <FaInfoCircle />
                    <span>ต้องใส่เลขพร้อมเพย์ก่อนเปิดใช้งาน QR</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* QR Payment Enable/Disable */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">สถานะ QR Payment</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">เปิด/ปิดระบบ QR Payment</p>
                <p className="text-sm text-gray-500 mt-1">
                  สถานะปัจจุบัน:{" "}
                  <span className={`font-medium ${isEnabled ? "text-green-600" : "text-red-600"}`}>
                    {isEnabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </p>
                {isEnabled && !promptpayValidation.isValid && (
                  <p className="text-sm text-red-500 mt-1 flex items-center space-x-1">
                    <FaExclamationTriangle />
                    <span>ต้องใส่เลขพร้อมเพย์ที่ถูกต้องก่อน</span>
                  </p>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
              </label>
            </div>
          </div>
          
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <button
            onClick={updateSettings}
            disabled={saving || (isEnabled && !promptpayValidation.isValid)}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center mx-auto space-x-2 ${
              saving || (isEnabled && !promptpayValidation.isValid)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            <FaSave className="text-xl" />
            <span>{saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}</span>
          </button>
          {isEnabled && !promptpayValidation.isValid && (
            <p className="text-red-500 text-sm mt-2 flex items-center justify-center space-x-1">
              <FaExclamationTriangle />
              <span>กรุณาใส่เลขพร้อมเพย์ที่ถูกต้องก่อนเปิดใช้งาน QR</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default QRSettings
