"use client"

import React, { useEffect, useState } from "react";
import { API_BASE } from "../../config";

export default function QRSettings() {
  const [enableQR, setEnableQR] = useState(false)
  const [requireQR, setRequireQR] = useState(false)
  const [promptpayNumber, setPromptpayNumber] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/settings/qr-payment`)
      const data = await response.json()
      if (data.success) {
          setEnableQR(Boolean(data.enableQR))
          setRequireQR(Boolean(data.requireQR))
        setPromptpayNumber(data.promptpayNumber || "")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch(`${API_BASE}/api/settings/qr-payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enableQR, requireQR, promptpayNumber }),
      })
      await response.json()
    } finally {
      setSaving(false)
    }
  }

  return null
}
