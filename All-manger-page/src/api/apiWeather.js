const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gapv3',
});

router.get('/device', (req, res) => {
    const sql = `SELECT device_id AS id, device_id AS name, status FROM sensor_weather_station WHERE status = 'on' OR status = 'off';`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get('/device/:id', (req, res) => {
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
        res.json(results[0]);
    });
});

router.delete('/delete/device/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM sensor_weather_station WHERE device_id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'ไม่พบอุปกรณ์ที่ต้องการลบ' });
        res.json({ message: 'ลบอุปกรณ์เรียบร้อยแล้ว' });
    });
});

router.get('/stations', (req, res) => {
    const sql = `SELECT id_station, name FROM station_list WHERE is_use = 1`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'ผิดพลาด', error: err.message });
        res.json(results);
    });
});

router.post('/add/device', (req, res) => {
    const device_id = req.body.device_id?.trim();
    const station_signature = req.body.station_signature?.trim();

    if (!device_id || !station_signature) {
        return res.status(400).json({ message: 'กรุณาระบุ device_id และ station_signature' });
    }

    const checkSql = `SELECT * FROM sensor_weather_station WHERE device_id = ? LIMIT 1`;
    db.query(checkSql, [device_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้ในระบบ' });

        const device = results[0];
        if (device.status !== 'not register') {
            const msg = {
                on: 'อุปกรณ์นี้เปิดใช้งานอยู่',
                off: 'อุปกรณ์นี้ปิดใช้งานอยู่',
            };
            return res.status(400).json({ message: msg[device.status] || 'สถานะไม่ถูกต้อง' });
        }

        const updateSql = `UPDATE sensor_weather_station SET status = 'off', station_signature = ? WHERE device_id = ?`;
        db.query(updateSql, [station_signature, device_id], (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'อัปเดตล้มเหลว', error: updateErr.message });
            res.json({ message: 'ลงทะเบียนอุปกรณ์สำเร็จ' });
        });
    });
});

module.exports = router;
