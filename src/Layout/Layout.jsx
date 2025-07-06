import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";

function Layout() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const tokenData = localStorage.getItem("Token");
        if (!tokenData) {
          navigate("/login");
          return;
        }

        const parsedToken = JSON.parse(tokenData);
        const token = parsedToken?.token || parsedToken;

        if (!token) {
          navigate("/login");
          return;
        }

        // Token exists and is valid
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing token:", error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#16C47F] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600">
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex flex-col w-full">
        <Navbar />
        <main className="pl-[50px] md:pl-[60px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
