// Entry Point
const express = require('express');
const connectDB = require('./database');
const authRoutes = require('./routes/authRoutes');

const app = express();

connectDB();

app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));