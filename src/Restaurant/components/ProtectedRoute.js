import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('restaurantToken');
      
      if (!token) {
        navigate('/restaurant-login');
        return;
      }

      try {
        const response = await fetch('/api/restaurant/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Token ไม่ถูกต้องหรือหมดอายุ
          localStorage.removeItem('restaurantToken');
          localStorage.removeItem('restaurantAdmin');
          navigate('/restaurant-login');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('restaurantToken');
        localStorage.removeItem('restaurantAdmin');
        navigate('/restaurant-login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
