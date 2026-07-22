const authRouter = require('./routes/auth');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const applicationsRouter = require('./routes/applications');
const matcherRouter = require('./routes/matcher');
const rateLimiter = require('./rateLimiter'); 
const app = express();



app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});
app.use('/api/auth', authRouter); 
app.use('/api', rateLimiter);
app.use('/api/applications', applicationsRouter);
app.use('/api/matcher', matcherRouter);
app.get('/', (req, res) => {
  res.send('Job Tracker API is running');
});

const PORT = process.env.PORT || 5000;
console.log("Server file loaded");
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});