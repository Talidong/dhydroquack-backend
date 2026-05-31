const db = require('../config/database');

// GET all devices — admin sees all, user sees all pero control is restricted
exports.getAllDevices = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT dc.*, t.team_name 
       FROM device_controls dc
       JOIN teams t ON dc.team_id = t.team_id`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// GET devices by team
exports.getDevicesByTeam = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM device_controls WHERE team_id = ?',
      [req.params.team_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// GET device by ID
exports.getDeviceById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM device_controls WHERE control_id = ?',
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Device not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// CONTROL device (ON/OFF) — team-based restriction
exports.controlDevice = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const { role, team_id } = req.user; // galing sa JWT token

    if (status !== 0 && status !== 1)
      return res.status(400).json({ error: 'Invalid status. Must be 0 or 1.' });

    // Kunin ang device para ma-check ang team
    const [rows] = await db.query(
      'SELECT * FROM device_controls WHERE control_id = ?', [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: 'Device not found' });

    const device = rows[0];

    // Team-based restriction — admin pwede lahat, user own team lang
    if (role !== 'admin' && device.team_id !== team_id) {
      return res.status(403).json({
        error: 'Access denied. You can only control devices assigned to your team.'
      });
    }

    await db.query(
      'UPDATE device_controls SET status = ? WHERE control_id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: `Device turned ${status === 1 ? 'ON' : 'OFF'} successfully`,
      control_id: id,
      status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// UPDATE device schedule — team-based restriction
exports.updateDevice = async (req, res) => {
  try {
    const { run_duration, interval_time, start_time, end_time } = req.body;
    const { id } = req.params;
    const { role, team_id } = req.user;

    const [rows] = await db.query(
      'SELECT * FROM device_controls WHERE control_id = ?', [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: 'Device not found' });

    const device = rows[0];

    // Team-based restriction
    if (role !== 'admin' && device.team_id !== team_id) {
      return res.status(403).json({
        error: 'Access denied. You can only update devices assigned to your team.'
      });
    }

    await db.query(
      `UPDATE device_controls 
       SET run_duration = ?, interval_time = ?, start_time = ?, end_time = ? 
       WHERE control_id = ?`,
      [run_duration, interval_time, start_time, end_time, id]
    );

    res.json({ success: true, message: 'Device schedule updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// CREATE device — admin only
exports.createDevice = async (req, res) => {
  try {
    const { team_id, device_name, device_type, run_duration, interval_time, start_time, end_time } = req.body;

    if (!team_id || !device_name || !device_type)
      return res.status(400).json({ error: 'team_id, device_name, and device_type are required' });

    const [result] = await db.query(
      `INSERT INTO device_controls 
       (team_id, device_name, device_type, status, run_duration, interval_time, start_time, end_time) 
       VALUES (?, ?, ?, 0, ?, ?, ?, ?)`,
      [team_id, device_name, device_type, run_duration, interval_time, start_time, end_time]
    );

    res.status(201).json({
      success: true,
      control_id: result.insertId,
      message: 'Device created successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// DELETE device — admin only
exports.deleteDevice = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM device_controls WHERE control_id = ?', [req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Device not found' });

    res.json({ success: true, message: 'Device deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};