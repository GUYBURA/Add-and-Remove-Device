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
app.get('/api/devices', (req, res) => {
    const sql = `
        SELECT device_id AS id, device_id AS name, status
        FROM sensor_weather_station
        WHERE status = 'on' OR status = 'off';
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// ✅ GET /api/device/:id — ดึง station_signature ของอุปกรณ์
app.get('/api/device/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
      SELECT sl.name AS center
      FROM sensor_weather_station sws
      JOIN station_list sl ON sws.station_signature = sl.id_station
      WHERE sws.device_id = ? LIMIT 1
    `;

    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ center: 'ไม่พบข้อมูล' });
        res.json(results[0]);  // ส่ง { center: "ชื่อศูนย์เต็ม" }
    });
});
// ✅ DELETE /api/device/:id — ลบอุปกรณ์จากฐานข้อมูล
app.delete('/api/device/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM sensor_weather_station WHERE device_id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'ไม่พบอุปกรณ์ที่ต้องการลบ' });
        res.json({ message: 'ลบอุปกรณ์เรียบร้อยแล้ว' });
    });
});
// ดึง station ทั้งหมด
app.get('/api/stations', (req, res) => {
    const sql = `SELECT id_station, name FROM station_list WHERE is_use = 1`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'ผิดพลาด', error: err.message });
        res.json(results);
    });
});

app.post('/api/device', (req, res) => {
    const device_id = req.body.device_id?.trim();
    const station_signature = req.body.station_signature?.trim();


    if (!device_id || !station_signature) {
        return res.status(400).json({ message: 'กรุณาระบุ device_id และ station_signature' });
    }

    // ✅ ตรวจสอบว่า device_id มีอยู่ และ status เป็น 'not register'
    const checkSql = `SELECT * FROM sensor_weather_station WHERE device_id = ? LIMIT 1`;

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
            UPDATE sensor_weather_station
            SET status = 'off', station_signature = ?
            WHERE device_id = ?
        `;

        db.query(updateSql, [station_signature, device_id], (updateErr) => {
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
