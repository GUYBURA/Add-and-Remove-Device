const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// 🔧 แก้ไขให้ตรงกับการเชื่อมต่อของคุณ
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gapv3',
});

// ✅ GET /api/devices — ดึงรายชื่อทั้งหมด
app.get('/api/greenhouse/device', (req, res) => {
    const sql = `
        SELECT 
            swg.device_id AS id,
            swg.device_id AS name,
            swg.status,
            hf.name_house AS greenhouse_name
        FROM sensor_weather_greenhouse swg
        LEFT JOIN housefarm hf ON swg.greenhouse_id = hf.id_farm_house
        WHERE swg.status = 'on' OR swg.status = 'off';
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// ✅ GET /api/device/:id — ดึง station_signature ของอุปกรณ์
app.get('/api/greenhouse/device/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
      SELECT hf.name_house AS greenhouse
      FROM sensor_weather_greenhouse swgh
      JOIN housefarm hf ON swgh.greenhouse_id = hf.id_farm_house
      WHERE swgh.device_id = ? LIMIT 1
    `;

    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ center: 'ไม่พบข้อมูล' });
        res.json(results[0]);  // ส่ง { center: "ชื่อศูนย์เต็ม" }
    });
});
// ✅ DELETE /api/device/:id — ลบอุปกรณ์จากฐานข้อมูล
app.delete('/api/greenhouse/delete/device/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM sensor_weather_greenhouse WHERE device_id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'ไม่พบอุปกรณ์ที่ต้องการลบ' });
        res.json({ message: 'ลบอุปกรณ์เรียบร้อยแล้ว' });
    });
});
// ดึง station ทั้งหมด
app.get('/api/greenhouse/housefarm', (req, res) => {
    const sql = `SELECT id_farm_house, name_house FROM housefarm WHERE status = 1;`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'ผิดพลาด', error: err.message });
        res.json(results);
    });
});

app.post('/api/greenhouse/add/device', (req, res) => {
    const device_id = req.body.device_id?.trim();
    const greenhouse_id = req.body.greenhouse_id;


    if (!device_id || !greenhouse_id) {
        return res.status(400).json({ message: 'กรุณาระบุ device_id และ greenhouse_id' });
    }

    // ✅ ตรวจสอบว่า device_id มีอยู่ และ status เป็น 'not register'
    const checkSql = `SELECT * FROM sensor_weather_greenhouse WHERE device_id = ? LIMIT 1`;

    db.query(checkSql, [device_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบอุปกรณ์', error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้ในระบบ' });
        }

        const device = results[0];

        if (device.status !== 'not register') {
            const statusMessages = {
                on: 'อุปกรณ์นี้อยู่ในสถานะ เปิดใช้งาน\nไม่สามารถลงทะเบียนใหม่ได้',
                off: 'อุปกรณ์นี้อยู่ในสถานะ ปิดใช้งาน\nไม่สามารถลงทะเบียนใหม่ได้',
            };

            return res.status(400).json({ message: statusMessages[device.status] || 'ไม่สามารถลงทะเบียนได้ในสถานะนี้' });
        }

        // ✅ ทำการอัปเดตอุปกรณ์ให้เป็นสถานะ 'off' และผูก station
        const updateSql = `
            UPDATE sensor_weather_greenhouse
            SET status = 'off', greenhouse_id = ?
            WHERE device_id = ?
        `;

        db.query(updateSql, [greenhouse_id, device_id], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ message: 'อัปเดตอุปกรณ์ไม่สำเร็จ', error: updateErr.message });
            }

            res.json({ message: 'ลงทะเบียนอุปกรณ์สำเร็จ' });
        });
    });
});

// ✅ Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
