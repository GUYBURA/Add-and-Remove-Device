const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ รวม API
const apiRoutes = require('./src/api'); // ใช้ index.js ที่รวมไว้
app.use('/api', apiRoutes);

// ✅ Start
app.listen(port, () => {
    console.log(`✅ API Server running at http://localhost:${port}`);
});
