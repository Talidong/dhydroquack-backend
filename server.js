require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// 1. Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));
app.use(express.json());

// 2. Routes
const userRoutes = require('./routes/users');
const plantRoutes = require('./routes/plants');
const deviceRoutes = require('./routes/devices');
const sensorRoutes = require('./routes/sensors');
const notificationRoutes = require('./routes/notifications');
const authRoutes = require('./routes/authRoutes'); // ← DAGDAG

// 3. Bind sa URL endpoints
app.use('/api/users', userRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes); // ← DAGDAG

// Base route para sa testing
app.get('/', (req, res) => {
  res.json({ message: 'DHydroQuack Backend API is running successfully!' });
});

// 4. 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 5. Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 DHydroQuack Server is happily running on port ${PORT}`);
});