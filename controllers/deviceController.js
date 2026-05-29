const db = require('../config/database');

// Get all devices
exports.getAllDevices = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM device_controls');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get device by ID
exports.getDeviceById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM device_controls WHERE control_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Device not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Create device
exports.createDevice = async (req, res) => {
  try {
    const { device_type, status, run_duration, interval_time, start_time, end_time } = req.body;

    // Validate status — dapat 0 o 1 lang (tinyint)
    if (status !== undefined && status !== 0 && status !== 1) {
      return res.status(400).json({ error: 'Invalid status value. Must be 0 or 1.' });
    }

    const resolvedStatus = status !== undefined ? status : 0;

    const [result] = await db.query(
      'INSERT INTO device_controls (device_type, status, run_duration, interval_time, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
      [device_type, resolvedStatus, run_duration, interval_time, start_time, end_time]
    );

    res.status(201).json({
      control_id: result.insertId,
      device_type,
      status: resolvedStatus,
      run_duration,
      interval_time,
      start_time,
      end_time,
      message: 'Device control created successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update device
exports.updateDevice = async (req, res) => {
  try {
    const { device_type, status, run_duration, interval_time, start_time, end_time } = req.body;

    // Validate status — dapat 0 o 1 lang (tinyint)
    if (status !== undefined && status !== 0 && status !== 1) {
      return res.status(400).json({ error: 'Invalid status value. Must be 0 or 1.' });
    }

    const [result] = await db.query(
      'UPDATE device_controls SET device_type = ?, status = ?, run_duration = ?, interval_time = ?, start_time = ?, end_time = ? WHERE control_id = ?',
      [device_type, status, run_duration, interval_time, start_time, end_time, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ success: true, message: 'Device control updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Delete device
exports.deleteDevice = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM device_controls WHERE control_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ success: true, message: 'Device control deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};