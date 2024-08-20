const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "akshay348raina@gmail.com",
        pass: "uolt vpbd qexf hclo"
    }
})

module.exports = function(connection) {
    const express = require("express");
    const router = express.Router();

  
    const jwt = require('jsonwebtoken');

    router.post('/login', async (req, res) => {
        const { email, password } = req.body;

        try {
            connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
                if (err) return res.status(500).json({ message: 'Database error' });

                if (results.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

                const user = results[0];
                const token = jwt.sign({ email }, 'your_jwt_secret', { expiresIn: '1h' });

                res.json({ message: 'Login successful', token });
            });
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
            // console.log(err.message);
        }
    });

    router.patch('/togglestatus/:id', async (req, res) => {
        const { id } = req.params; 
        const { status } = req.body; 
        
    
        try {
            connection.query('UPDATE employees SET status = ? WHERE id = ?', [status, id], (err, results) => {
                if (err) {
                    console.error('Error updating employee status:', err);
                    return res.status(500).json({ error: 'Failed to update employee status' });
                }    
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: 'Employee not found' });
                }
    
                res.status(200).json({ message: 'Employee status updated successfully' });
            });
        } catch (error) {
            console.error('Error updating employee status:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
    
    
    


    router.post('/newpass', async (req, res) => {
        const { token, password } = req.body;
        // console.log("inside newpass api");

        if (!password) {
            return res.status(400).json({ message: 'New password is required' });
        }

        try {
            connection.query('SELECT * FROM users WHERE resetToken = ?', [token], async (err, results) => {
                if (err) return res.status(500).json({ message: 'Database error' });
                if (results.length === 0) return res.status(400).json({ message: 'Invalid token' });
                // console.log("connection successfully established");
    
                const user = results[0];
    
                try {
                    connection.query('UPDATE users SET password = ?, resetToken = NULL WHERE resetToken = ?', [password, token], (err) => {
                        if (err) return res.status(500).json({ message: 'Database error' });
    
                        res.json({ message: 'Password reset successfully' });
                    });
                } catch (err) {
                    return res.status(500).json({ message: 'Error updating password' });
                }
            });
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
    });

    
router.delete('/delete/:id', (req, res) => {
    const employeeId = req.params.id;
  
    connection.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ message: 'Transaction error', error: err });
        }
  
        connection.query(
            'UPDATE department SET hod_id = NULL WHERE hod_id = ?',
            [employeeId],
            (err, result) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ message: 'Error updating department', error: err });
                    });
                }
  
                connection.query(
                    'DELETE FROM employees WHERE id = ?',
                    [employeeId],
                    (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                res.status(500).json({ message: 'Error deleting employee', error: err });
                            });
                        }
  
                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    res.status(500).json({ message: 'Transaction commit error', error: err });
                                });
                            }
  
                            res.status(200).json({ message: 'Employee deleted successfully' });
                        });
                    }
                );
            }
        );
    });
  });

  router.delete('/deletecourse/:id', (req, res) => {
    const courseId = req.params.id;
  
    connection.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ message: 'Transaction error', error: err });
        }
  
        connection.query(
            'DELETE FROM courses WHERE id = ?',
                [courseId],
                (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ message: 'Error deleting course', error: err });
                        });
                    }

            connection.commit((err) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ message: 'Transaction commit error', error: err });
                    });
                }

                res.status(200).json({ message: 'Course deleted successfully' });
            });
            }
                
            
        );
    });
  });

    router.delete('/deletedept/:id', (req, res) => {
        const deptId = req.params.id;

        connection.beginTransaction((err) => {
            if (err) {
                return res.status(500).json({ message: 'Transaction error', error: err });
            }

            connection.query(
                'UPDATE employees SET department_id = NULL WHERE department_id = ?',
                [deptId],
                (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ message: 'Error updating employees', error: err });
                        });
                    }

                    connection.query(
                        'DELETE FROM department WHERE id = ?',
                        [deptId],
                        (err, result) => {
                            if (err) {
                                return connection.rollback(() => {
                                    res.status(500).json({ message: 'Error deleting department', error: err });
                                });
                            }

                            connection.commit((err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        res.status(500).json({ message: 'Transaction commit error', error: err });
                                    });
                                }

                                res.status(200).json({ message: 'Department deleted successfully' });
                            });
                        }
                    );
                }
            );
        });
    });


   

    router.post('/resetpassword', async (req, res) => {
        const { email } = req.body;
        // console.log(email);
        try {
            connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
                if (err) return res.status(500).json({ message: 'Database error' });
                if (results.length === 0) return res.status(400).json({ message: 'Email not found' });
    
                const resetToken = crypto.randomBytes(32).toString('hex');
    
                connection.query('UPDATE users SET resetToken = ? WHERE email = ?', [resetToken, email], (err) => {
                    if (err) return res.status(500).json({ message: 'Database error' });
    
                    const resetUrl = `http://localhost:3000/setpass/${resetToken}`;
    
                    const mailOptions = {
                        from: "akshay348raina@gmail.com",
                        to: email,
                        subject: 'Password Reset',
                        html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
                    };
    
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) return res.status(500).json({ message: 'Error sending email' });
                        res.json({ message: 'Password reset email sent' });
                    });
                });
            });
        } catch (err) {
            console.error("Server error:", err);
            res.status(500).json({ message: 'Server error' });
        }
    });




    router.post('/createemployee', (req, res) => {
        const { name, department, contact, age } = req.body;     
        connection.query('INSERT INTO employees (name, department_id, contact_info, age) VALUES (?, ?, ?, ?)', 
        [name, department, contact, age], (err, result) => {
            if (err) {
                console.error('Error creating employee:', err);
                return res.status(500).json({ message: 'Error creating employee' });
            }
            res.status(201).json({ message: 'Employee created successfully' });
        });
    });


    router.get('/view/:id', (req, res) => {
        
        const { id } = req.params;
        connection.query('SELECT e.id, e.name,d.dept_name, e.status, e.contact_info, e.age, e.courses_completed, e.credits_earned FROM employees e LEFT JOIN department d ON e.department_id = d.id WHERE e.id = ?', [id], (err, results) => {
            if (err) {
                console.error('Error fetching employee:', err);
                return res.status(500).json({ message: 'Error fetching employee' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Employee not found' });
            }
            res.json(results[0]);
        });
    });

    router.get('/viewcourse/:id', (req, res) => {
        
        const { id } = req.params;
        connection.query('SELECT * from courses WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error('Error fetching course:', err);
                return res.status(500).json({ message: 'Error fetching course' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Course not found' });
            }
            res.json(results[0]);
        });
    });

    router.put('/edit/:id', (req, res) => {
        const { id } = req.params;
        const { name, department, status, contact, age } = req.body;
        // console.log(department);
        connection.query('UPDATE employees SET name = ?, department_id = ?, status = ?, contact_info = ?, age = ? WHERE id = ?', [name, department, status, contact, age, id], (err, result) => {
            if (err) {
                console.error('Error updating employee:', err);
                return res.status(500).json({ message: 'Error updating employee' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Employee not found' });
            }
            res.status(200).json({ message: 'Employee updated successfully' });
        });
    });

    router.put('/updatedept/:id', (req, res) => {
        const deptId = req.params.id;
        const { dept_name, hod_id, status } = req.body;

        connection.beginTransaction((err) => {
            if (err) {
                return res.status(500).json({ message: 'Transaction error', error: err });
            }

            connection.query(
                'UPDATE department SET dept_name = ?, hod_id = ?, status = ? WHERE id = ?',
                [dept_name, hod_id, status, deptId],
                (err, result) => {
                    if (err) {
                        return connection.rollback(() => {
                            res.status(500).json({ message: 'Error updating department', error: err });
                        });
                    }

                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                res.status(500).json({ message: 'Transaction commit error', error: err });
                            });
                        }

                        res.status(200).json({ message: 'Department updated successfully' });
                    });
                }
            );
        });
    });


    router.post('/createdept', (req, res) => {
        const { name, hodId } = req.body;       
        connection.query('INSERT INTO department ( dept_name, hod_id) VALUES (?, ?)', 
        [name, hodId], (err, result) => {
            if (err) {
                console.error('Error creating Department:', err);
                return res.status(500).json({ message: 'Error creating Department' });
            }
            res.status(201).json({ message: 'Department created successfully' });
        });
    
    });

    
      
  
    return router;
  };
  