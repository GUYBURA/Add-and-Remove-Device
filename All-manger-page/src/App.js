import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CategoryPage from './components/CategoryPage.js';
import WeatherPageRoutes from './weather-station/weatherRoutes.js';
import GreenhousePageRoutes from './greenhouse/greenhouseRoutes.js';
import PumpPageRoutes from './pump/pumpControlRoutes.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CategoryPage />} />
        <Route path="/devices/weather/*" element={<WeatherPageRoutes />} />
        <Route path="/devices/greenhouse/*" element={<GreenhousePageRoutes />} />
        <Route path="/devices/pump/*" element={<PumpPageRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
