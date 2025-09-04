"use client"

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { QRCodeCanvas } from "qrcode.react"
import { buildUrl } from '../../utils/api'
import generatePayload from "promptpay-qr"
import { CheckCircle, AlertTriangle, Loader2, Upload, X, Clock, CreditCard, Smartphone } from "lucide-react"

function PaymentQR() {
  const [qrEnabled, setQrEnabled] = useState(true)
  const [promptpayNumber, setPromptpayNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [uploadedSlip, setUploadedSlip] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [showUploadSection, setShowUploadSection] = useState(true)

  const navigate = useNavigate()
  const location = useLocation()

  const {
    totalAmount,
    fullName,
    tableNames,
    cart,
    selectedTables,
    currentDate,
    peopleCount,
    time,
    additionalDetails,
    joinTables,
  } = location.state || {}

  useEffect(() => {
    fetchQRSettings()
  }, [])

  const fetchQRSettings = async () => {
    try {
      const response = await fetch(buildUrl('/api/settings/promptpay'))
      const data = await response.json()

      if (data.success) {
        setQrEnabled(true)
        setPromptpayNumber(data.promptpayNumber || "")
      } else {
        setError("ไม่สามารถโหลดการตั้งค่า QR ได้")
      }
      setLoading(false)
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล")
      setLoading(false)
    }
  }

  const handleSlipUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith("image/")) {
      setUploadError("กรุณาเลือกไฟล์รูปภาพเท่านั้น")
      return
    }

    // ตรวจสอบขนาดไฟล์ (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("ขนาดไฟล์ต้องไม่เกิน 5MB")
      return
    }

    setUploading(true)
    setUploadError("")

    const formData = new FormData()
    formData.append("paymentSlip", file)
    formData.append(
      "reservationData",
      JSON.stringify({
        fullName,
        tableNames,
        totalAmount,
        currentDate,
        time,
        peopleCount,
        cart: cart || [],
        selectedTables: selectedTables || [],
        additionalDetails,
        joinTables,
      }),
    )

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(buildUrl('/api/upload-payment-slip'), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setUploadedSlip({
          file,
          url: data.fileUrl || URL.createObjectURL(file),
          uploadId: data.uploadId,
          fileName: data.fileName,
          filePath: data.filePath,
        })
        setShowUploadSection(false)
      } else {
        setUploadError(data.message || "เกิดข้อผิดพลาดในการอัปโหลด")
      }
    } catch (err) {
      setUploadError("เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง")
    } finally {
      setUploading(false)
    }
  }

  const removeUploadedSlip = () => {
    if (uploadedSlip?.url && uploadedSlip.url.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedSlip.url)
    }
    setUploadedSlip(null)
    setShowUploadSection(false)
  }

  const navigateBack = () => {
    navigate('/user-menu', {
      state: {
        cart,
        selectedTables,
        fullName,
        currentDate,
        peopleCount,
        time,
        additionalDetails,
        joinTables,
        paymentSlipId: uploadedSlip?.uploadId,
        paymentSlipUrl: uploadedSlip?.url,
        paymentSlipFileName: uploadedSlip?.fileName,
        totalAmount,
        paymentCompleted: true,
      },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <Loader2 className="animate-spin text-4xl text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h1>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            กลับหน้าเดิม
          </button>
        </div>
      </div>
    )
  }

  // ตรวจสอบว่ามีเลขพร้อมเพย์หรือไม่
  if (!promptpayNumber && qrEnabled) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">ไม่พบเลขพร้อมเพย์</h1>
            <p className="text-gray-600 mb-6">กรุณาติดต่อร้านเพื่อตั้งค่าเลขพร้อมเพย์</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            กลับหน้าเดิม
          </button>
        </div>
      </div>
    )
  }

  // QR ปิดแต่ระบบบังคับให้ต้องชำระ
  if (!qrEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white text-center p-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-green-600 mb-4">สามารถจองได้โดยไม่ต้องชำระ</h1>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md">
            <p className="text-gray-700 font-medium mb-2">รายละเอียดการจอง</p>
            <div className="text-left space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">โต๊ะ:</span> {tableNames}
              </p>
              <p>
                <span className="font-medium">ชื่อ:</span> {fullName}
              </p>
              <p>
                <span className="font-medium">จำนวนคน:</span> {peopleCount} คน
              </p>
              <p>
                <span className="font-medium">เวลา:</span> {time}
              </p>
              <p>
                <span className="font-medium">ยอดรวม:</span> {Number(totalAmount).toFixed(2)} บาท
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={navigateBack}
          className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors"
        >
          ไปยืนยันการจอง
        </button>
      </div>
    )
  }

  // QR เปิดอยู่ - แสดง QR Code
  const amount = Number(totalAmount)
  let qrData = ""

  try {
    qrData = generatePayload(promptpayNumber, { amount })
  } catch (err) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">ไม่สามารถสร้าง QR Code ได้</h1>
            <p className="text-gray-600 mb-6">เลขพร้อมเพย์ไม่ถูกต้อง กรุณาติดต่อร้าน</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            กลับหน้าเดิม
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-2">
            <CreditCard className="w-8 h-8 text-yellow-500 mr-2" />
            <h1 className="text-3xl font-bold text-gray-800">QR ชำระเงิน</h1>
          </div>
          <div className="w-16 h-1 bg-yellow-400 mx-auto rounded-full"></div>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h2 className="font-semibold text-gray-700 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            รายละเอียดการจอง
          </h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">โต๊ะ:</span> {tableNames}
            </p>
            <p>
              <span className="font-medium">ชื่อ:</span> {fullName}
            </p>
            <p>
              <span className="font-medium">จำนวนคน:</span> {peopleCount} คน
            </p>
            <p>
              <span className="font-medium">เวลา:</span> {time}
            </p>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-6">
          <QRCodeCanvas value={qrData} size={200} level="M" includeMargin={true} className="mx-auto" />
        </div>

        {/* Amount */}
        <div className="mb-6">
          <p className="text-lg text-gray-600 mb-2">ยอดชำระทั้งหมด</p>
          <p className="text-3xl font-bold text-green-600">{amount.toFixed(2)} บาท</p>
        </div>

        {/* PromptPay Info */}
        <div className="bg-blue-50 rounded-lg p-3 mb-6 flex items-center">
          <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
          <p className="text-sm text-blue-700">
            <span className="font-medium">เลขพร้อมเพย์:</span> {promptpayNumber}
          </p>
        </div>

        {/* Payment Slip Upload Section */}
        {showUploadSection && (
          <div className="mb-6">
            {!uploadedSlip ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center justify-center">
                    <Upload className="w-5 h-5 mr-2 text-blue-500" />
                    กรุณาอัปโหลดสลิปการโอนเงิน
                  </h3>
                  <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    ⚠️ หากไม่อัปโหลดสลิปจะไม่สามารถกดยืนยันได้
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSlipUpload}
                    className="hidden"
                    id="payment-slip-input"
                    disabled={uploading}
                  />
                  
                  <label
                    htmlFor="payment-slip-input"
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
                      uploading 
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? "กำลังอัปโหลด..." : "เลือกไฟล์สลิป"}</span>
                  </label>

                  {uploadError && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{uploadError}</div>}

                  {uploading && (
                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                      <Loader2 className="animate-spin w-4 h-4" />
                      <span className="text-sm">กำลังอัปโหลดไปยังเซิร์ฟเวอร์...</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  รองรับไฟล์: JPG, PNG, GIF (ขนาดไม่เกิน 5MB)
                  <br />
                  <span className="text-green-600">✓ ไฟล์จะถูกบันทึกในระบบเซิร์ฟเวอร์</span>
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-green-700 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>อัปโหลดสลิปสำเร็จ</span>
                  </h3>
                  <button onClick={removeUploadedSlip} className="text-red-500 hover:text-red-700 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={uploadedSlip.url}
                      alt="Payment slip"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-700">{uploadedSlip.fileName || uploadedSlip.file.name}</p>
                    <p className="text-xs text-gray-500">{(uploadedSlip.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="text-xs text-green-600">✓ บันทึกในระบบเซิร์ฟเวอร์แล้ว</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-500 mb-6 text-left">
          <div className="space-y-1">
            <p>1. เปิดแอปธนาคารของคุณ</p>
            <p>2. สแกน QR Code ด้านบน</p>
            <p>3. ตรวจสอบยอดเงินและชำระ</p>
            <p>4. อัปโหลดสลิปการโอนเงิน</p>
            <p>5. กดยืนยันการจอง</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!uploadedSlip && (
            <button
              onClick={() => setShowUploadSection(true)}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              อัปโหลดสลิปการโอนเงิน
            </button>
          )}

          <button
            onClick={navigateBack}
            disabled={!uploadedSlip}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
              uploadedSlip 
                ? "bg-yellow-400 hover:bg-yellow-500 text-white" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {uploadedSlip ? "ยืนยันการจอง" : "กรุณาอัปโหลดสลิปก่อน"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentQR
