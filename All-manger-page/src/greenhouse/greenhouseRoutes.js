import { Routes, Route } from 'react-router-dom';
import GreenhouseMainPage from './sensor-greenhouse';
import AddDevicePage from './addDevicePage';

function WeatherRoutes() {
    return (
        <Routes>
            <Route path="/" element={<GreenhouseMainPage />} />
            <Route path="add" element={<AddDevicePage />} />
        </Routes>
    );
}

export default WeatherRoutes;
