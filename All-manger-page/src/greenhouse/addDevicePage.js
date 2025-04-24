import React, { useState, useEffect } from 'react';
import styles from './AddDevicePage.module.css'; // ✅ ใช้ CSS Module
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

function AddDevicePage() {
    const navigate = useNavigate();
    const [deviceId, setDeviceId] = useState('');
    const [selectedGreenhouse, setSelectedGreenhouse] = useState('');
    const [greenhouses, setGreenhouses] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');

    useEffect(() => {
        const fetchGreenhouses = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/greenhouse/housefarm');
                const data = await res.json();
                setGreenhouses(data);
            } catch (err) {
                console.error('ดึงข้อมูลโรงเรือนไม่สำเร็จ', err);
            }
        };
        fetchGreenhouses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!deviceId || !selectedGreenhouse) {
            setPopupMessage('กรุณากรอกข้อมูลให้ครบ');
            setShowPopup(true);
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/api/greenhouse/add/device', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    device_id: deviceId,
                    greenhouse_id: selectedGreenhouse,
                }),
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

            <div className={styles["greenhouse-header"]}>
                <div className={styles["icon-side"]}>
                    <img src="/images/sensorGH.svg" alt="icon" />
                </div>
                <div className={styles["label-side"]}>
                    <span>ชุดวัดสภาพแวดล้อม<br />ภายในโรงเรือน</span>
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

                <label>โรงเรือน</label>
                <Select
                    options={greenhouses.map((gh) => ({
                        value: gh.id_farm_house,
                        label: gh.name_house,
                    }))}
                    value={greenhouses.find((gh) => gh.id_farm_house === selectedGreenhouse)
                        ? {
                            value: selectedGreenhouse,
                            label: greenhouses.find((gh) => gh.id_farm_house === selectedGreenhouse).name_house,
                        }
                        : null}
                    onChange={(option) => setSelectedGreenhouse(option.value)}
                    placeholder="เลือกโรงเรือน"
                    styles={{
                        control: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? '#50be5479' : '#ffffff',
                            borderRadius: 20,
                            border: '2px solid #50BE54',
                            borderColor: state.isFocused ? '#c2b23d' : '#E5D68E',
                            boxShadow: state.isFocused ? '0 0 4px rgba(80, 190, 84, 0.5)' : 'none',
                            padding: '4px 6px',
                            fontWeight: 'bold',
                            fontSize: '15px',
                            cursor: 'pointer',
                        }),
                        menu: (base) => ({
                            ...base,
                            borderRadius: 20,
                            border: '2px solid #50BE54',
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
                                ? 'rgba(80, 190, 84, 0.5)'
                                : state.isFocused
                                    ? 'rgba(80, 190, 84, 0.5)'
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
                    <button type="button" className={styles["cancel-btn"]} onClick={() => navigate('/')}>ยกเลิก</button>
                </div>
            </form>
        </div>
    );
}

export default AddDevicePage;
