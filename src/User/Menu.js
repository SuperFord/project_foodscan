import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from './Menu/fetchWithAuth';

function MenuWrapper() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const response = await fetchWithAuth("/api/checkToken", {}, navigate);
      if (!response) return;
    };
    checkToken();
  }, [navigate]);

  return null;
}

export default MenuWrapper;
