import styles from './pump-control.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function PumpControlMainPage() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceCenter, setDeviceCenter] = useState('');
  const [loadingCenter, setLoadingCenter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;
  const uid = location.state?.uid;

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const query = new URLSearchParams({ role, uid }).toString();
        const res = await fetch(`http://localhost:3001/api/pump/device?${query}`);
        const data = await res.json();

        if (Array.isArray(data)) {   // ✅ ต้องเช็คว่าข้อมูลเป็น array ก่อน
          setDevices(data);
        } else {
          setDevices([]);  // ถ้าไม่ใช่ array ให้เซต devices ว่างไปเลย ป้องกัน .map พัง
        }

      } catch (err) {
        console.error('โหลดรายการอุปกรณ์ล้มเหลว:', err);
        setDevices([]); // กันไว้ในกรณี error ก็เซตเป็น array ว่าง
      }
    };

    if (role) {
      loadDevices();
    }
  }, [role, uid]);

  const handleDelete = async (id) => {
    setSelectedDevice(id);
    setDeviceCenter('');
    setLoadingCenter(true);
    setShowModal(true);

    try {
      const res = await fetch(`http://localhost:3001/api/pump/device/${id}`);
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
      const res = await fetch(`http://localhost:3001/api/pump/delete/device/${selectedDevice}`, {
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

      <div className={styles["pump-header"]}>
        <div className={styles["icon-side"]}>
          <img src="/images/ControlPump.svg" alt="pump icon" />
        </div>
        <div className={styles["label-side"]}>
          <span>ชุดควบคุมเครื่องสูบน้ำ</span>
        </div>
      </div>

      <div className={styles["device-list"]}>
        {devices.map((device) => (
          <div className={styles["device-item"]} key={device.id}>
            <span className={`${styles["status-dot"]} ${device.status === 'on' ? styles["green-dot"] : styles["red-dot"]}`} />
            <div className={styles["device-center"]}>
              <span className={styles["device-name"]}>{device.greenhouse_name || 'ไม่ทราบ'}: {device.name}</span>
            </div>
            <button className={styles["delete-button"]} onClick={() => handleDelete(device.id)}>
              <img src="/images/material-symbols--delete.svg" alt="delete" className={styles["trash-icon"]} />
            </button>
          </div>
        ))}
      </div>

      <div className={styles["add-button-container"]}>
        <button className={styles["add-button"]} onClick={() => navigate('/devices/pump/add', { state: { role, uid } })}>
          <span className={styles["icon-circle"]}>
            <img src="/images/lets-icons--add-ring-fill.svg" alt="plus icon" />
          </span>
        </button>
      </div>

      {showModal && (
        <div className={styles["modal-overlay"]}>
          <div className={styles.modal}>
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


export default PumpControlMainPage;
