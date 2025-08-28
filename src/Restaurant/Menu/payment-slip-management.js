"use client"

import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { buildUrl } from "../../utils/api"

// CSS for animations
const modalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideIn {
    from { transform: translateY(-50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
`

function PaymentSlipManagement() {
  const navigate = useNavigate()
  const [slips, setSlips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSlip, setSelectedSlip] = useState(null)
  const [filter, setFilter] = useState("all")
  const [updating, setUpdating] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [showRejectModal, setShowRejectModal] = useState(null)
  const [rejectNote, setRejectNote] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState({ show: false, message: "", type: "" })

  const formatThaiBuddhistDate = (iso) => {
    if (!iso) return ""
    const [year, month, day] = iso.split("-").map((v) => Number(v))
    if (!year || !month || !day) return ""
    const buddhistYear = year + 543
    const dd = String(day).padStart(2, "0")
    const mm = String(month).padStart(2, "0")
    return `${dd}/${mm}/${buddhistYear}`
  }

  // Thai Buddhist Era date picker state
  const today = new Date()
  const currentBEYear = today.getFullYear() + 543
  const [filterDay, setFilterDay] = useState("")
  const [filterMonth, setFilterMonth] = useState("")
  const [filterYearBE, setFilterYearBE] = useState("")

  const getDaysInMonth = (month, gregorianYear) => {
    if (!month || !gregorianYear) return 31
    return new Date(gregorianYear, month, 0).getDate()
  }

  const months = [
    { value: 1, label: "มกราคม" },
    { value: 2, label: "กุมภาพันธ์" },
    { value: 3, label: "มีนาคม" },
    { value: 4, label: "เมษายน" },
    { value: 5, label: "พฤษภาคม" },
    { value: 6, label: "มิถุนายน" },
    { value: 7, label: "กรกฎาคม" },
    { value: 8, label: "สิงหาคม" },
    { value: 9, label: "กันยายน" },
    { value: 10, label: "ตุลาคม" },
    { value: 11, label: "พฤศจิกายน" },
    { value: 12, label: "ธันวาคม" },
  ]

  const yearsBE = (() => {
    const range = []
    const start = currentBEYear - 5
    const end = currentBEYear + 5
    for (let y = end; y >= start; y--) range.push(y)
    return range
  })()

  const updateDateFilterFromBE = (day, month, yearBE) => {
    if (!day || !month || !yearBE) {
      setDateFilter("")
      return
    }
    const gYear = Number(yearBE) - 543
    const dd = String(day).padStart(2, "0")
    const mm = String(month).padStart(2, "0")
    setDateFilter(`${gYear}-${mm}-${dd}`)
  }

  const fetchSlips = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filter !== "all") {
        params.append("status", filter)
      }
      if (dateFilter) {
        params.append("date", dateFilter)
      }

      const url = buildUrl(`/api/payment-slips?${params}`)
      const token = localStorage.getItem("restaurantToken")
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setSlips(data.slips || [])
      } else {
        throw new Error(data.message || "ไม่สามารถโหลดข้อมูลสลิปได้")
      }
    } catch (error) {
      // Error handling without console.log
    } finally {
      setLoading(false)
    }
  }, [filter, dateFilter])

  useEffect(() => {
    fetchSlips()
  }, [fetchSlips])

  const updateSlipStatus = async (slipId, status, note = "") => {
    setUpdating(slipId)
    try {
      const token = localStorage.getItem("restaurantToken")
      const response = await fetch(buildUrl(`/api/payment-slips/${slipId}/status`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status, note }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchSlips()
        setSelectedSlip(null)
        setShowRejectModal(null)
        setRejectNote("")

        // แสดงข้อความที่แตกต่างกันตามสถานะ
        const message = status === "approved" ? "อนุมัติสลิปเรียบร้อยแล้ว" : "ปฏิเสธสลิปและยกเลิกการจองเรียบร้อยแล้ว"
        const type = status === "approved" ? "success" : "error"

        setShowSuccessModal({ show: true, message, type })
        
        // ปิด modal อัตโนมัติหลังจาก 1 วินาที
        setTimeout(() => {
          setShowSuccessModal({ show: false, message: "", type: "" })
        }, 1000)
      } else {
        alert(data.message || "ไม่สามารถอัปเดตสถานะได้")
      }
    } catch (error) {
      // Error handling without console.log
    } finally {
      setUpdating(null)
    }
  }

  const handleReject = () => {
    if (showRejectModal && rejectNote.trim()) {
      updateSlipStatus(showRejectModal, "rejected", rejectNote)
    } else {
      alert("กรุณาระบุเหตุผลในการปฏิเสธสลิป")
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "รอตรวจสอบ", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      approved: { label: "อนุมัติแล้ว", className: "bg-green-100 text-green-800 border-green-200" },
      rejected: { label: "ปฏิเสธ", className: "bg-red-100 text-red-800 border-red-200" },
    }

    const config = statusConfig[status] || statusConfig.pending

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>{config.label}</span>
    )
  }

  const getStatusCount = (status) => {
    return slips.filter((slip) => slip.status === status).length
  }

  const filteredSlips = slips.filter((slip) => {
    if (!slip.reservation_data) return false

    const matchesSearch =
      (slip.reservation_data.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (slip.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (slip.reservation_data.tableNames || "").toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchSlips}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{modalStyles}</style>
      <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">จัดการสลิปการจ่ายเงิน</h1>
              <p className="text-gray-600">ตรวจสอบและอนุมัติสลิปการจ่ายเงินจากลูกค้า</p>
              <p className="text-sm text-red-600 mt-1">⚠️ การปฏิเสธสลิปจะทำการยกเลิกการจองโต๊ะด้วย</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate("/restaurant-menu")}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={fetchSlips}
                className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                รีเฟรช
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">รอตรวจสอบ</p>
                <p className="text-2xl font-bold text-yellow-500">{getStatusCount("pending")}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">อนุมัติแล้ว</p>
                <p className="text-2xl font-bold text-green-600">{getStatusCount("approved")}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ปฏิเสธ</p>
                <p className="text-2xl font-bold text-red-600">{getStatusCount("rejected")}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">กรองตามสถานะ</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "ทั้งหมด", count: slips.length },
                  { key: "pending", label: "รอตรวจสอบ", count: getStatusCount("pending") },
                  { key: "approved", label: "อนุมัติแล้ว", count: getStatusCount("approved") },
                  { key: "rejected", label: "ปฏิเสธ", count: getStatusCount("rejected") },
                  // { key: "used", label: "ใช้งานแล้ว", count: getStatusCount("used") },
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filter === key ? "bg-yellow-400 text-white" : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
            </div>

            {/* Date Filter (พ.ศ.) */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">กรองตามวันที่ (พ.ศ.)</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={filterDay}
                  onChange={(e) => {
                    const v = e.target.value
                    setFilterDay(v)
                    updateDateFilterFromBE(v, filterMonth, filterYearBE)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="">วัน</option>
                  {Array.from({ length: getDaysInMonth(filterMonth, filterYearBE ? Number(filterYearBE) - 543 : today.getFullYear()) }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  value={filterMonth}
                  onChange={(e) => {
                    const v = e.target.value
                    setFilterMonth(v)
                    // reset day if overflow
                    const maxDays = getDaysInMonth(v, filterYearBE ? Number(filterYearBE) - 543 : today.getFullYear())
                    if (filterDay && Number(filterDay) > maxDays) setFilterDay(String(maxDays))
                    updateDateFilterFromBE(filterDay && Number(filterDay) <= maxDays ? filterDay : String(maxDays), v, filterYearBE)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="">เดือน</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <select
                  value={filterYearBE}
                  onChange={(e) => {
                    const v = e.target.value
                    setFilterYearBE(v)
                    const maxDays = getDaysInMonth(filterMonth, v ? Number(v) - 543 : today.getFullYear())
                    if (filterDay && Number(filterDay) > maxDays) setFilterDay(String(maxDays))
                    updateDateFilterFromBE(filterDay && Number(filterDay) <= maxDays ? filterDay : String(maxDays), filterMonth, v)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  <option value="">ปี (พ.ศ.)</option>
                  {yearsBE.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {/* <span className="text-sm text-gray-600">ค่าที่ใช้กับ API:</span> */}
                {/* <span className="text-sm font-medium">{dateFilter || "-"}</span> */}
                {dateFilter && (
                  <button
                    onClick={() => { setFilterDay(""); setFilterMonth(""); setFilterYearBE(""); setDateFilter("") }}
                    className="ml-auto px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    ล้างค่า
                  </button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล, หรือโต๊ะ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Slips List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredSlips.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบสลิปการจ่ายเงิน</h3>
              <p className="text-gray-500">ลองเปลี่ยนตัวกรองหรือเงื่อนไขการค้นหา</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ลูกค้า
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การจอง
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จำนวนเงิน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่อัปโหลด
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSlips.map((slip) => (
                    <tr key={slip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {slip.reservation_data?.fullName || "ไม่ระบุ"}
                          </div>
                          <div className="text-sm text-gray-500">{slip.email || "ไม่ระบุ"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            โต๊ะ: {slip.reservation_data?.tableNames || "ไม่ระบุ"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {slip.reservation_data?.currentDate || "ไม่ระบุ"} เวลา{" "}
                            {slip.reservation_data?.time || "ไม่ระบุ"}
                          </div>
                          <div className="text-sm text-gray-500">{slip.reservation_data?.peopleCount || 0} คน</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-green-600">
                          ฿{Number(slip.amount || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(slip.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(slip.created_at).toLocaleString("th-TH")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedSlip(slip)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                            title="ดูสลิป"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>

                          {slip.status === "pending" && (
                            <>
                              <button
                                onClick={() => updateSlipStatus(slip.id, "approved")}
                                disabled={updating === slip.id}
                                className="text-green-600 hover:text-green-800 transition-colors disabled:opacity-50 p-1"
                                title="อนุมัติ"
                              >
                                {updating === slip.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </button>
                              <button
                                onClick={() => setShowRejectModal(slip.id)}
                                disabled={updating === slip.id}
                                className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 p-1"
                                title="ปฏิเสธและยกเลิกการจอง"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => { setShowRejectModal(null); setRejectNote("") }}>
            <div className="bg-white rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ ปฏิเสธสลิปและยกเลิกการจอง</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">
                    <strong>คำเตือน:</strong> การปฏิเสธสลิปนี้จะทำให้:
                  </p>
                  <ul className="text-red-700 text-sm mt-2 list-disc list-inside">
                    <li>ยกเลิกการจองโต๊ะของลูกค้า</li>
                    <li>ปลดสถานะโต๊ะให้ว่างอัตโนมัติ</li>
                    <li>ลบข้อมูลการจองออกจากระบบ</li>
                  </ul>
                </div>
                <p className="text-gray-600 mb-4">กรุณาระบุเหตุผลในการปฏิเสธสลิปนี้</p>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="เช่น สลิปไม่ชัดเจน, จำนวนเงินไม่ถูกต้อง, สลิปปลอม ฯลฯ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  rows={4}
                />
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setShowRejectModal(null)
                      setRejectNote("")
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectNote.trim() || updating === showRejectModal}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {updating === showRejectModal ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        กำลังดำเนินการ...
                      </>
                    ) : (
                      "ปฏิเสธและยกเลิกการจอง"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slip Detail Modal */}
        {selectedSlip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSlip(null)}>
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">รายละเอียดสลิปการจ่ายเงิน</h2>
                  <button onClick={() => setSelectedSlip(null)} className="text-gray-500 hover:text-gray-700 p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Slip Image */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">สลิปการจ่ายเงิน</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={buildUrl(selectedSlip.slip_path)}
                      alt="Payment slip"
                      className="w-full max-w-md mx-auto"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuC5hOC4oeC5iOC4quC4suC4oeC4suC4o+C4luC5guC4q+C4leC4o+C4ueC4m+C4oOC4suC4nOC5hOC4lOC5iDwvdGV4dD48L3N2Zz4="
                      }}
                    />
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">ข้อมูลลูกค้า</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">ชื่อ:</span> {selectedSlip.reservation_data?.fullName || "ไม่ระบุ"}
                      </p>
                      <p>
                        <span className="font-medium">อีเมล:</span> {selectedSlip.email || "ไม่ระบุ"}
                      </p>
                      <p>
                        <span className="font-medium">จำนวนเงิน:</span>{" "}
                        <span className="text-lg font-bold text-green-600">
                          ฿{Number(selectedSlip.amount || 0).toLocaleString()}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">สถานะ:</span> {getStatusBadge(selectedSlip.status)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">ข้อมูลการจอง</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">โต๊ะ:</span> {selectedSlip.reservation_data?.tableNames || "ไม่ระบุ"}
                      </p>
                      <p>
                        <span className="font-medium">วันที่:</span>{" "}
                        {selectedSlip.reservation_data?.currentDate || "ไม่ระบุ"}
                      </p>
                      <p>
                        <span className="font-medium">เวลา:</span> {selectedSlip.reservation_data?.time || "ไม่ระบุ"}
                      </p>
                      <p>
                        <span className="font-medium">จำนวนคน:</span> {selectedSlip.reservation_data?.peopleCount || 0}{" "}
                        คน
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons
                {selectedSlip.status === "pending" && (
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => updateSlipStatus(selectedSlip.id, "approved")}
                      disabled={updating === selectedSlip.id}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {updating === selectedSlip.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          กำลังดำเนินการ...
                        </>
                      ) : (
                        "อนุมัติ"
                      )}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(selectedSlip.id)}
                      disabled={updating === selectedSlip.id}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors disabled:opacity-50"
                    >
                      ปฏิเสธและยกเลิกการจอง
                    </button>
                  </div>
                )} */}

                {/* Warning for rejected slips */}
                {selectedSlip.status === "rejected" && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">⚠️ สลิปนี้ถูกปฏิเสธแล้ว</p>
                    <p className="text-red-700 text-sm mt-1">การจองโต๊ะที่เกี่ยวข้องได้ถูกยกเลิกแล้ว</p>
                    {selectedSlip.admin_note && (
                      <div className="mt-2">
                        <p className="font-medium text-red-600">เหตุผล:</p>
                        <p className="text-sm text-red-700">{selectedSlip.admin_note}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
                 )}

        {/* Success/Error Modal */}
        {showSuccessModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowSuccessModal({ show: false, message: "", type: "" })}>
            <div className="bg-white rounded-xl max-w-md w-full transform transition-all duration-300 scale-100 shadow-2xl border-0 animate-slideIn" onClick={(e) => e.stopPropagation()}>
              <div className="p-8 text-center relative">
                {/* Close button */}
                <button
                  onClick={() => setShowSuccessModal({ show: false, message: "", type: "" })}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Icon */}
                <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                  showSuccessModal.type === "success" 
                    ? "bg-gradient-to-br from-green-100 to-green-200 shadow-lg" 
                    : "bg-gradient-to-br from-red-100 to-red-200 shadow-lg"
                }`}>
                  {showSuccessModal.type === "success" ? (
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                {/* Title */}
                <h3 className={`text-xl font-bold mb-3 ${
                  showSuccessModal.type === "success" 
                    ? "text-green-800" 
                    : "text-red-800"
                }`}>
                  {showSuccessModal.type === "success" ? "✅ สำเร็จแล้ว!" : "❌ เรียบร้อยแล้ว!"}
                </h3>

                {/* Message */}
                <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                  {showSuccessModal.message}
                </p>

                {/* Button */}
                <button
                  onClick={() => setShowSuccessModal({ show: false, message: "", type: "" })}
                  className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${
                    showSuccessModal.type === "success"
                      ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                      : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                  }`}
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  )
}

export default PaymentSlipManagement