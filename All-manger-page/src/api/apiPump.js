const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gapv3',
});

// ✅ ดึงรายชื่ออุปกรณ์ pump
router.get('/device', (req, res) => {
    const sql = `
      SELECT 
          sp.device_id AS id,
          sp.device_id AS name,
          sp.status,
          hf.name_house AS greenhouse_name
      FROM sensor_pump sp
      LEFT JOIN housefarm hf ON sp.greenhouse_pump_id = hf.id_farm_house
      WHERE sp.status = 'on' OR sp.status = 'off';
  `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ✅ ดึงชื่อโรงเรือนของอุปกรณ์ pump
router.get('/device/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
    SELECT hf.name_house AS greenhouse
    FROM sensor_pump sp
    JOIN housefarm hf ON sp.greenhouse_pump_id = hf.id_farm_house
    WHERE sp.device_id = ? LIMIT 1
  `;
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ center: 'ไม่พบข้อมูล' });
        res.json(results[0]);
    });
});

// ✅ ลบอุปกรณ์ pump
router.delete('/delete/device/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM sensor_pump WHERE device_id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'ไม่พบอุปกรณ์ที่ต้องการลบ' });
        res.json({ message: 'ลบอุปกรณ์เรียบร้อยแล้ว' });
    });
});

// ✅ ดึงรายการโรงเรือน
router.get('/housefarm', (req, res) => {
    const sql = `SELECT id_farm_house, name_house FROM housefarm WHERE status = 1;`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'ผิดพลาด', error: err.message });
        res.json(results);
    });
});

// ✅ เพิ่มอุปกรณ์ pump
router.post('/add/device', (req, res) => {
    const device_id = req.body.device_id?.trim();
    const greenhouse_pump_id = req.body.greenhouse_pump_id;

    if (!device_id || !greenhouse_pump_id) {
        return res.status(400).json({ message: 'กรุณาระบุ device_id และ greenhouse_id' });
    }

    const checkSql = `SELECT * FROM sensor_pump WHERE device_id = ? LIMIT 1`;
    db.query(checkSql, [device_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้ในระบบ' });

        const device = results[0];

        if (device.status !== 'not register') {
            const statusMessages = {
                on: 'อุปกรณ์นี้อยู่ในสถานะ เปิดใช้งาน\nไม่สามารถลงทะเบียนใหม่ได้',
                off: 'อุปกรณ์นี้อยู่ในสถานะ ปิดใช้งาน\nไม่สามารถลงทะเบียนใหม่ได้',
            };
            return res.status(400).json({ message: statusMessages[device.status] || 'ไม่สามารถลงทะเบียนได้ในสถานะนี้' });
        }

        const updateSql = `
        UPDATE sensor_pump
        SET status = 'off', greenhouse_pump_id = ?
        WHERE device_id = ?
    `;
        db.query(updateSql, [greenhouse_pump_id, device_id], (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'อัปเดตอุปกรณ์ไม่สำเร็จ', error: updateErr.message });
            res.json({ message: 'ลงทะเบียนอุปกรณ์สำเร็จ' });
        });
    });
});

module.exports = router;
