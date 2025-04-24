import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CategoryPage from './CategoryPage';
import DeviceManagement from './DeviceManagement'; // ต้องมีไฟล์นี้ด้วย

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CategoryPage />} />
        <Route path="/devices/:type" element={<DeviceManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
