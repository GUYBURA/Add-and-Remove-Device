import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import AddDevicePage from './addDevicePage'; // เพิ่มตรงนี้

function MainPage() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceCenter, setDeviceCenter] = useState('');
  const [loadingCenter, setLoadingCenter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // ใช้ navigate ไปหน้าอื่น

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/greenhouse/device');
        const data = await res.json();
        setDevices(data);
      } catch (err) {
        console.error('โหลดรายการอุปกรณ์ล้มเหลว:', err);
      }
    };
    loadDevices();
  }, []);

  const handleDelete = async (id) => {
    setSelectedDevice(id);
    setDeviceCenter('');
    setLoadingCenter(true);
    setShowModal(true);

    try {
      const res = await fetch(`http://localhost:3001/api/greenhouse/device/${id}`);
      const data = await res.json();
      setDeviceCenter(data.greenhouse || 'ไม่พบข้อมูลศูนย์');
    } catch (err) {
      setDeviceCenter('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoadingCenter(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/greenhouse/delete/device/${selectedDevice}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setDevices(devices.filter((d) => d.id !== selectedDevice));
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการลบ');
      }
    } catch (err) {
      alert('ลบไม่สำเร็จ');
    } finally {
      setShowModal(false);
      setSelectedDevice(null);
      setDeviceCenter('');
    }
  };

  return (
    <div className="container">
      <div className="header">จัดการอุปกรณ์ (Device Management)</div>

      <div className="greenhouse-header">
        <div className="icon-side">
          <img src="/images/sensorGH.svg" alt="sensor greenhouse icon" />
        </div>
        <div className="label-side">
          <span>ชุดวัดสภาพแวดล้อม<br />ภายในโรงเรือน</span>

        </div>
      </div>

      <div className="device-list">
        {devices.map((device) => (
          <div className="device-item" key={device.id}>
            <span className={`status-dot ${device.status === 'on' ? 'green-dot' : 'red-dot'}`} />

            <div className="device-center">
              <span className="device-name">
                {device.greenhouse_name || 'ไม่ทราบ'}: {device.name}
              </span>
            </div>

            <button className="delete-button" onClick={() => handleDelete(device.id)}>
              <img
                src="/images/material-symbols--delete.svg"
                alt="delete"
                className="trash-icon"
              />
            </button>
          </div>
        ))}
      </div>


      <div className="add-button-container">
        <button className="add-button" onClick={() => navigate('/add')}>
          <span className="icon-circle">
            <img src="/images/lets-icons--add-ring-fill.svg" alt="plus icon" />
          </span>
        </button>
      </div>

      {
        showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <p>ลบอุปกรณ์: {selectedDevice}</p>
              <p className="modal-sub">
                {loadingCenter ? 'กำลังโหลดข้อมูล...' : deviceCenter}
              </p>
              <div className="modal-actions">
                <button className="confirm-btn" onClick={confirmDelete}>ยืนยัน</button>
                <button className="cancel-btn" onClick={() => setShowModal(false)}>ยกเลิก</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

// 🧭 ใช้ Router ครอบ
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/add" element={<AddDevicePage />} />
      </Routes>
    </Router>
  );
}

export default App;
