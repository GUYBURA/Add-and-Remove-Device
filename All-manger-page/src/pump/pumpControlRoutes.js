import { Routes, Route } from 'react-router-dom';
import PumpControlMainPage from './pump-control';
import AddDevicePage from './addDevicePage';

function WeatherRoutes() {
    return (
        <Routes>
            <Route path="/" element={<PumpControlMainPage />} />
            <Route path="add" element={<AddDevicePage />} />
        </Routes>
    );
}

export default WeatherRoutes;
