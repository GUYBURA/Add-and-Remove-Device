import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './weather-station.module.css';

function WeatherMainPage() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceCenter, setDeviceCenter] = useState('');
  const [loadingCenter, setLoadingCenter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/weather_station/device');
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
      const res = await fetch(`http://localhost:3001/api/weather_station/device/${id}`);
      const data = await res.json();
      setDeviceCenter(data.center || 'ไม่พบข้อมูลศูนย์');
    } catch (err) {
      setDeviceCenter('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoadingCenter(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/weather_station/delete/device/${selectedDevice}`, {
        method: 'PUT',
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
    <div className={styles.container}>
      <div className={styles.header}>จัดการอุปกรณ์ (Device Management)</div>

      <div className={styles["weather-header"]}>
        <div className={styles["icon-side"]}>
          <img src="/images/weather station.svg" alt="weather station icon" />
        </div>
        <div className={styles["label-side"]}>
          <span>สถานีวัดสภาพอากาศ</span>
        </div>
      </div>

      <div className={styles["device-list"]}>
        {devices.map((device) => (
          <div className={styles["device-item"]} key={device.id}>
            <span className={`${styles["status-dot"]} ${device.status === 'on' ? styles["green-dot"] : styles["red-dot"]}`} />
            <div className={styles["device-center"]}>
              <span className={styles["device-name"]}>{device.name}</span>
            </div>
            <button className={styles["delete-button"]} onClick={() => handleDelete(device.id)}>
              <img src="/images/material-symbols--delete.svg" alt="delete" className={styles["trash-icon"]} />
            </button>
          </div>
        ))}
      </div>

      <div className={styles["add-button-container"]}>
        <button className={styles["add-button"]} onClick={() => navigate('/devices/weather/add')}>
          <span className={styles["icon-circle"]}>
            <img src="/images/lets-icons--add-ring-fill.svg" alt="plus icon" />
          </span>
        </button>
      </div>

      {showModal && (
        <div className={styles["modal-overlay"]}>
          <div className={styles["modal"]}>
            <p>ลบอุปกรณ์: {selectedDevice}</p>
            <p className={styles["modal-sub"]}>
              {loadingCenter ? 'กำลังโหลดข้อมูล...' : deviceCenter}
            </p>
            <div className={styles["modal-actions"]}>
              <button className={styles["confirm-btn"]} onClick={confirmDelete}>ยืนยัน</button>
              <button className={styles["cancel-btn"]} onClick={() => setShowModal(false)}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherMainPage;
