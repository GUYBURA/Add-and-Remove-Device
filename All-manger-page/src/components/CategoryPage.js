import styles from './CategoryPage.module.css';
import weatherIcon from '../images/weather station.svg';
import greenhouseIcon from '../images/sensorGH.svg';
import pumpIcon from '../images/ControlPump.svg';
import { useNavigate } from 'react-router-dom';

const userRole = 'farmer'; // หรือ 'farmer'
const userUid = 'U9dc7e4d3e19d44d0e5aaab17438073ba';
const categories = [
  {
    id: 'weather',
    title: 'สถานีวัดสภาพอากาศ',
    icon: weatherIcon,
    color: '#d3b328',
    subColor: '#e9d88a',
    allowedRoles: ['admin'],
  },
  {
    id: 'greenhouse',
    title: 'ชุดวัดสภาพแวดล้อมในโรงเรือน',
    icon: greenhouseIcon,
    color: '#4caf50',
    subColor: '#a8e6a1',
    allowedRoles: ['admin', 'farmer'],
  },
  {
    id: 'pump',
    title: 'ชุดควบคุมเครื่องสูบน้ำ',
    icon: pumpIcon,
    color: '#4e7ddc',
    subColor: '#acc3f2',
    allowedRoles: ['admin', 'farmer'],
  },
];

function CategoryPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>จัดการอุปกรณ์ (Device Management)</div>
      {categories
        .filter(cat => cat.allowedRoles.includes(userRole))
        .map((cat, index) => (
          <div key={index} className={styles["category-card"]}>
            <div
              className={styles["icon-side"]}
              style={{ backgroundColor: cat.color }}
            >
              <img src={cat.icon} alt={cat.title} />
            </div>
            <div
              className={styles["content-side"]}
              style={{
                '--mainColor': cat.color,
                '--subColor': cat.subColor,
              }}
            >
              <div className={styles["content-top"]}>{cat.title}</div>
              <div className={styles["content-bottom"]}>
                <button
                  className={styles["manage-btn"]}
                  onClick={() => navigate(`/devices/${cat.id}`, { state: { role: userRole, uid: userUid } })}
                >
                  จัดการอุปกรณ์
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

export default CategoryPage;
