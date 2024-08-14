const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const router=express.Router();

const port = 5000;
const app = express();
app.use(bodyParser.json());
app.use(cors());


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Root',
  database: 'loginApp'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  // console.log('MySQL connected');
});

app.use('/api', require('./login')(connection));


app.get('/users', (req, res) => {
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    res.json(results);
  });
});

app.get('/employees', (req, res) => {
  connection.query('SELECT employees.id, employees.name, department.dept_name, employees.status, employees.contact_info, employees.age FROM employees LEFT JOIN department ON employees.department_id = department.id;', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    
    res.json(results);
  });
});

app.get('/api/viewdept', (req, res) => {
  const sql = 'SELECT id, dept_name FROM department'; 
  connection.query(sql, (err, result) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to retrieve departments' });
      }
      res.json(result);
  });
});



app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
