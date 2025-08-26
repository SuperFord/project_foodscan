import React, { useEffect, useState } from 'react';
import { API_BASE } from "../../config";

function History() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/restaurant/history`)
      .then(res => res.json())
      .then(setItems)
      .catch(() => setItems([]))
  }, []);

  return null;
}

export default History;
