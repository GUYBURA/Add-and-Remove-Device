import './CategoryPage.css';
import weatherIcon from './images/weather station.svg';
import greenhouseIcon from './images/sensorGH.svg';
import pumpIcon from './images/ControlPump.svg';

const userRole = 'admin'; // หรือ 'admin'

const categories = [
  {
    title: 'สถานีวัดสภาพอากาศ',
    icon: weatherIcon,
    color: '#d3b328',
    subColor: '#e9d88a',
    allowedRoles: ['admin'],
  },
  {
    title: 'ชุดวัดสภาพแวดล้อมในโรงเรือน',
    icon: greenhouseIcon,
    color: '#4caf50',
    subColor: '#a8e6a1',
    allowedRoles: ['admin', 'farmer'],
  },
  {
    title: 'ชุดควบคุมเครื่องสูบน้ำ',
    icon: pumpIcon,
    color: '#4e7ddc',
    subColor: '#acc3f2',
    allowedRoles: ['admin', 'farmer'],
  },

];

function CategoryPage() {
  return (
    <div className="container">
      <div className="header">จัดการอุปกรณ์ (Device Management)</div>
      {categories
        .filter(cat => cat.allowedRoles.includes(userRole))
        .map((cat, index) => (
          <div key={index} className="category-card">
            <div className="icon-side" style={{ backgroundColor: cat.color }}>
              <img src={cat.icon} alt={cat.title} />
            </div>
            <div className="content-side" style={{ '--mainColor': cat.color, '--subColor': cat.subColor }}>
              <div className="content-top">{cat.title}</div>
              <div className="content-bottom">
                <button className="manage-btn">จัดการอุปกรณ์</button>
              </div>
            </div>
          </div>
        ))}
    </div >
  );
}

export default CategoryPage;
