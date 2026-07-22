const express = require('express');
const router = express.Router();
const pool = require('../db');
const redisClient = require('../redisClient');
const reminderQueue = require('../queues/reminderQueue');
const authMiddleware = require('../middleware/authMiddleware');

// Protect every route in this file — user must be logged in
router.use(authMiddleware);

// CREATE - add a new application
router.post('/', async (req, res) => {
  try {
    const { company, role, status, deadline, notes, email } = req.body;

    const result = await pool.query(
      `INSERT INTO applications (company, role, status, deadline, notes, user_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [company, role, status || 'applied', deadline, notes, req.userId]
    );

    // Invalidate this user's cached list since data changed
    await redisClient.del(`applications:user:${req.userId}`);

    // Queue a reminder email if a deadline and email were provided
    if (deadline && email) {
      const delay = new Date(deadline).getTime() - Date.now() - 24 * 60 * 60 * 1000; // 1 day before deadline
      await reminderQueue.add(
        'sendReminder',
        { email, company, role, deadline },
        { delay: delay > 0 ? delay : 0 }
      );
      console.log(`Reminder queued for ${company}`);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// READ - get all applications for the logged-in user
router.get('/', async (req, res) => {
  try {
    const cacheKey = `applications:user:${req.userId}`;

    // 1. Check cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('Serving from CACHE');
      return res.json(JSON.parse(cached));
    }

    // 2. Cache miss — fetch from Postgres, scoped to this user only
    console.log('Serving from DATABASE');
    const result = await pool.query(
      'SELECT * FROM applications WHERE user_id = $1 ORDER BY id DESC',
      [req.userId]
    );

    // 3. Store in cache for next time (expires in 60 seconds)
    await redisClient.setEx(cacheKey, 60, JSON.stringify(result.rows));

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// READ - get one application by id (only if it belongs to this user)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM applications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE - edit an application (only if it belongs to this user)
router.put('/:id', async (req, res) => {
  try {
    const { company, role, status, deadline, notes } = req.body;
    const result = await pool.query(
      `UPDATE applications SET company=$1, role=$2, status=$3, deadline=$4, notes=$5
       WHERE id=$6 AND user_id=$7 RETURNING *`,
      [company, role, status, deadline, notes, req.params.id, req.userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    await redisClient.del(`applications:user:${req.userId}`);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE - remove an application (only if it belongs to this user)
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM applications WHERE id=$1 AND user_id=$2 RETURNING *',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    await redisClient.del(`applications:user:${req.userId}`);

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;