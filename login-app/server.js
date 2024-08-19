
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const port = 5000;
const app = express();
app.use(bodyParser.json());
app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Root',
  database: 'loginApp'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1); 
  }
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

app.get('/api/deptdetails/:id', (req, res) => {
  const deptId = req.params.id;
  const sql = 'SELECT dept_name, hod_id, status FROM department WHERE id = ?';
  
  connection.query(sql, [deptId], (err, result) => {
    if (err) {
      console.error('Error querying database:', err); // Log the error
      return res.status(500).json({ error: 'Failed to retrieve department details' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(result);
  });
});

app.get('/api/gethodid', (req, res) => {
  const sql = 'SELECT id, name FROM employees'; 
  connection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve employees' });
    }
    res.json(result);
  });
});

app.post('/api/createcourse', upload.single('course_image'), (req, res) => {
  const { course_title, short_description, source_link, credit_points, status } = req.body;
  const course_image = req.file ? req.file.filename : null;

  const sql = `INSERT INTO courses (course_title, course_image, short_description, source_link, credit_points, status) VALUES (?, ?, ?, ?, ?, ?)`;

  connection.execute(sql, [course_title, course_image, short_description, source_link, credit_points, status], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ error: 'Failed to create course' });
    }
    res.status(201).json({ message: 'Course created successfully', courseId: results.insertId });
  });
});

app.get('/api/courses', (req, res) => {
  const sql = 'SELECT * FROM courses';
  connection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve courses' });
    }
    res.json(result);
  });
});

app.get('/api/departments', (req, res) => {
  const sql = 'SELECT department.id, department.dept_name, employees.name, department.status FROM department LEFT JOIN employees ON department.hod_id = employees.id';
  connection.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve departments' });
    }
    res.json(result);
  });
});

app.put('/api/togglecoursestatus/:id', (req, res) => {
  const courseId = req.params.id;
  const { status } = req.body;

  const sql = `UPDATE courses SET status = ? WHERE id = ?`;

  connection.execute(sql, [status, courseId], (err, results) => {
      if (err) {
          console.error('Error updating status:', err);
          return res.status(500).json({ error: 'Failed to update course status' });
      }

      res.status(200).json({ message: 'Course status updated successfully' });
  });
});

app.put('/api/toggledeptstatus/:id', (req, res) => {
  const courseId = req.params.id;
  const { status } = req.body;

  const sql = `UPDATE department SET status = ? WHERE id = ?`;

  connection.execute(sql, [status, courseId], (err, results) => {
      if (err) {
          console.error('Error updating status:', err);
          return res.status(500).json({ error: 'Failed to update department status' });
      }

      res.status(200).json({ message: 'Department status updated successfully' });
  });
});

app.post('/api/updatecourse', upload.single('course_image'), (req, res) => {
  const { id, course_title, short_description, source_link, credit_points, status } = req.body;
  const course_image = req.file ? req.file.filename : null;

  let sql = `UPDATE courses SET course_title = ?, short_description = ?, source_link = ?, credit_points = ?, status = ?`;
  const values = [course_title, short_description, source_link, credit_points, status];

  if (course_image) {
    sql += `, course_image = ?`;
    values.push(course_image);
  }

  sql += ` WHERE id = ?`;
  values.push(id);

  connection.execute(sql, values, (err, results) => {
    if (err) {
      console.error('Error updating course:', err);
      return res.status(500).json({ error: 'Failed to update course' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.status(200).json({ message: 'Course updated successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
