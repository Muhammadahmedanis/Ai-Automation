import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useEffect } from 'react';

function Layout() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("Token"));
    // console.log(token);
    const token1 = token?.token || token 
    if(!token1){
      navigate('/login');
      return;
    } 

    if(token1) {
      navigate('/');
      return;
    } 
  }, [navigate])

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