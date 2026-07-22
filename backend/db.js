const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, //so when upload in git no one can see my db password as its in .env file
  port: process.env.DB_PORT,
});

module.exports = pool;
//connects postgre to nodejs 
//This creates a reusable connection "pool" to Postgres — think of it as a set of open phone lines to your database that your app can borrow from instead of dialing fresh every time.