import { Routes, Route } from 'react-router-dom';
import WeatherMainPage from './weather-station';
import AddDevicePage from './addDevicePage';

function WeatherRoutes() {
    return (
        <Routes>
            <Route path="/" element={<WeatherMainPage />} />
            <Route path="add" element={<AddDevicePage />} />
        </Routes>
    );
}

export default WeatherRoutes;
