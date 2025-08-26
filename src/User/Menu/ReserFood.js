import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from './fetchWithAuth';
import { API_BASE } from "../../config";

export default function ReserFood() {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    const checkAuthAndData = async () => {
      const response = await fetchWithAuth("/api/checkToken", {}, navigate);
      if (!response) return;

        // ดึงข้อมูลร้าน
      const restaurantResponse = await fetch(`${API_BASE}/api/Nrestaurant`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await restaurantResponse.json();
      setRestaurant(data);
  
        // ดึงเมนู
      const menuResponse = await fetch(`${API_BASE}/api/menus`, {
        headers: { 'Content-Type': 'application/json' }
        });
        const menuData = await menuResponse.json();
      setMenus(menuData.menus || []);
    };

    checkAuthAndData();
  }, [navigate]);

  return null;
}
