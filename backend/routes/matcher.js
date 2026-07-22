const express = require('express');
const router = express.Router();
const { matchResumeToJob } = require('../aiService');

router.post('/', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Both resumeText and jobDescription are required' });
    }

    const result = await matchResumeToJob(resumeText, jobDescription);
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to generate match analysis' });
  }
});

module.exports = router;