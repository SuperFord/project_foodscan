
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from './fetchWithAuth';
import { API_BASE } from "../../config";

function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const checkToken = async () => {
      const response = await fetchWithAuth("/api/checkToken", {}, navigate);
      if (!response) return;

      const res = await fetch(`${API_BASE}/api/user/history`, { method: 'GET' });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    };
    checkToken();
  }, [navigate]);

  return null;
}

export default History;
