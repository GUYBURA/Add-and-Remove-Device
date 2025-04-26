const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gapv3',
});

// ✅ ดึงรายชื่ออุปกรณ์
router.get('/device', (req, res) => {
    const { role, uid } = req.query;

    let sql;
    let params = [];

    if (role === 'farmer') {
        if (!uid) {
            return res.status(400).json({ error: 'Missing uid for farmer role' });
        }
        sql = `
            SELECT 
              swg.device_id AS id,
              swg.device_id AS name,
              swg.status,
              hf.name_house AS greenhouse_name
            FROM acc_farmer AS af
            INNER JOIN housefarm AS hf ON af.link_user = hf.link_user
            INNER JOIN sensor_weather_greenhouse AS swg ON hf.id_farm_house = swg.greenhouse_id
            WHERE af.uid_line = ?
              AND swg.status != 'not register';
    `;
        params = [uid];
    } else {
        sql = `
        SELECT  
            swg.device_id AS id,
            swg.device_id AS name, 
            swg.status,
            hf.name_house AS greenhouse_name
        FROM sensor_weather_greenhouse as swg
        INNER JOIN housefarm hf ON swg.greenhouse_id = hf.id_farm_house
        WHERE swg.status IN ('on', 'off');
    `;
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.json({ message: 'No devices found' });
        }
        res.json(results);
    });
});

// ✅ ดึงชื่อโรงเรือนของ device
router.get('/device/:id', (req, res) => {
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
        res.json(results[0]);
    });
});

// ✅ ลบอุปกรณ์
router.put('/delete/device/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
      UPDATE sensor_weather_greenhouse 
      SET status = 'not register', greenhouse_id = NULL 
      WHERE device_id = ?
    `;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'ไม่พบอุปกรณ์ที่ต้องการอัปเดต' });
        res.json({ message: 'แก้ไขข้อมูลเรียบร้อยแล้ว' });
    });
});

// ✅ ดึงรายการโรงเรือน
router.get('/housefarm', (req, res) => {
    const { role, uid } = req.query;
    let sql;
    let params = [];

    if (role === 'farmer') {
        if (!uid) {
            return res.status(400).json({ error: 'Missing uid for farmer role' });
        }
        sql = `
            SELECT hf.id_farm_house, hf.name_house 
            FROM housefarm AS hf
            INNER JOIN acc_farmer AS af ON af.link_user = hf.link_user
            WHERE af.uid_line = ? 
              AND hf.status = 1
        `;
        params = [uid];
    } else {
        sql = `
            SELECT id_farm_house, name_house 
            FROM housefarm 
            WHERE status = 1;
        `;
    }

    db.query(sql, params, (err, results) => {   // ✅ ต้องใส่ params ตรงนี้
        if (err) return res.status(500).json({ message: 'ผิดพลาด', error: err.message });
        res.json(results);
    });
});

// ✅ เพิ่มอุปกรณ์
router.post('/add/device', (req, res) => {
    const device_id = req.body.device_id?.trim();
    const greenhouse_id = req.body.greenhouse_id;

    if (!device_id || !greenhouse_id) {
        return res.status(400).json({ message: 'กรุณาระบุ device_id และ greenhouse_id' });
    }

    const checkSql = `SELECT * FROM sensor_weather_greenhouse WHERE device_id = ? LIMIT 1`;
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
        UPDATE sensor_weather_greenhouse
        SET status = 'off', greenhouse_id = ?
        WHERE device_id = ?
    `;
        db.query(updateSql, [greenhouse_id, device_id], (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'อัปเดตอุปกรณ์ไม่สำเร็จ', error: updateErr.message });
            res.json({ message: 'ลงทะเบียนอุปกรณ์สำเร็จ' });
        });
    });
});

module.exports = router;
