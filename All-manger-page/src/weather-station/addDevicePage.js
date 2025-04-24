import React, { useState, useEffect } from 'react';
import styles from './AddDevicePage.module.css';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

function AddDevicePage() {
    const navigate = useNavigate();
    const [deviceId, setDeviceId] = useState('');
    const [selectedStation, setSelectedStation] = useState('');
    const [stations, setStations] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/weather_station/stations');
                const data = await res.json();
                setStations(data);
            } catch (err) {
                console.error('ดึงข้อมูลศูนย์ไม่สำเร็จ', err);
            }
        };
        fetchStations();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!deviceId || !selectedStation) {
            setPopupMessage('กรุณากรอกข้อมูลให้ครบ');
            setShowPopup(true);
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/api/weather_station/add/device', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ device_id: deviceId, station_signature: selectedStation }),
            });

            const data = await res.json();

            if (res.ok) {
                setPopupMessage('✅ เพิ่มอุปกรณ์สำเร็จ');
            } else {
                setPopupMessage(`❌ ${data.message || 'เกิดข้อผิดพลาด'}`);
            }
        } catch (err) {
            setPopupMessage('❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        } finally {
            setShowPopup(true);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>จัดการอุปกรณ์ (Device Management)</div>

            <div className={styles["weather-header"]}>
                <div className={styles["icon-side"]}>
                    <img src="/images/weather station.svg" alt="icon" />
                </div>
                <div className={styles["label-side"]}>
                    <span>สถานีวัดสภาพอากาศ</span>
                </div>
            </div>

            <form className={styles["add-form"]} onSubmit={handleSubmit}>
                <h3>เพิ่มอุปกรณ์</h3>

                <label>ชื่ออุปกรณ์</label>
                <input
                    type="text"
                    placeholder="ชื่ออุปกรณ์"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                />

                <label>ชื่อศูนย์</label>
                <Select
                    options={stations.map((s) => ({
                        value: s.id_station,
                        label: s.name,
                    }))}
                    value={stations.find((s) => s.id_station === selectedStation)
                        ? {
                            value: selectedStation,
                            label: stations.find((s) => s.id_station === selectedStation).name,
                        }
                        : null}
                    onChange={(option) => setSelectedStation(option.value)}
                    placeholder="เลือกศูนย์โครงการ"
                    styles={{
                        control: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? '#E5D68E' : '#ffffff',
                            borderRadius: 20,
                            border: '2px solid #E5D68E',
                            borderColor: state.isFocused ? '#c2b23d' : '#E5D68E',
                            boxShadow: state.isFocused ? '0 0 4px rgba(229, 214, 142, 0.5)' : 'none',
                            padding: '1px 6px',
                            fontWeight: 'bold',
                            fontSize: '15px',
                            cursor: 'pointer',
                        }),
                        menu: (base) => ({
                            ...base,
                            borderRadius: 20,
                            border: '2px solid #E5D68E',
                            marginTop: 4,
                            overflow: 'hidden',
                            width: '100%',
                        }),
                        menuList: (base) => ({
                            ...base,
                            padding: 0,
                        }),
                        option: (base, state) => ({
                            ...base,
                            width: '100%',
                            boxSizing: 'border-box',
                            backgroundColor: state.isSelected
                                ? '#f5d762'
                                : state.isFocused
                                    ? '#f9f1c2'
                                    : '#fff',
                            color: '#000',
                            fontWeight: state.isSelected ? 'bold' : 'normal',
                            cursor: 'pointer',
                            padding: '10px 14px',
                            borderBottom: '1px solid #eee',
                        }),
                    }}
                />

                {showPopup && (
                    <div className={styles["popup-overlay"]}>
                        <div className={styles["popup-box"]}>
                            <p>{popupMessage}</p>
                            <div className={styles["popup-actions"]}>
                                <button
                                    className={styles["confirm-btn"]}
                                    onClick={() => {
                                        setShowPopup(false);
                                        if (popupMessage.includes('สำเร็จ')) {
                                            navigate('/');
                                        }
                                    }}
                                >
                                    ปิด
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles["form-actions"]}>
                    <button type="submit" className={styles["confirm-btn"]}>ยืนยัน</button>
                    <button type="button" className={styles["cancel-btn"]} onClick={() => navigate('/')}>
                        ยกเลิก
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddDevicePage;
