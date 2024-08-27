const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const saltRounds = 10;
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

    // router.post('/login', async (req, res) => {
    //     const { email, password } = req.body;

    //     try {
    //         connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    //             if (err) return res.status(500).json({ message: 'Database error' });

    //             if (results.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    //             const user = results[0];
    //             const token = jwt.sign({ email }, 'your_jwt_secret', { expiresIn: '1h' });

    //             res.json({ message: 'Login successful', token });
    //         });
    //     } catch (err) {
    //         res.status(500).json({ message: 'Server error' });
    //         // console.log(err.message);
    //     }
    // });
    

    router.post('/login', async (req, res) => {
        const { email, password } = req.body;

        try {
            connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
                if (err) return res.status(500).json({ message: 'Database error' });

                if (results.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

                const user = results[0];

                const passwordMatch = await bcrypt.compare(password, user.password);

                if (!passwordMatch) {
                    return res.status(400).json({ message: 'Invalid credentials' });
                }

                const token = jwt.sign({ email }, 'your_jwt_secret', { expiresIn: '1h' });

                res.json({ message: 'Login successful', token });
            });
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
    });

    // router.post('/employeelogin', async (req, res) => {
    //     const { email, password } = req.body;

    //     try {
    //         connection.query('SELECT id FROM employees WHERE email = ? AND password = ?', [email, password], (err, results) => {
    //             if (err) return res.status(500).json({ message: 'Database error' });

    //             if (results.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    //             const user = results[0];
    //             const token = jwt.sign({ email }, 'your_jwt_secret', { expiresIn: '1h' });

    //             res.json({ message: 'Login successful', token, id: user.id });
    //         });
    //     } catch (err) {
    //         res.status(500).json({ message: 'Server error' });
    //         // console.log(err.message);
    //     }
    // });
    router.post('/employeelogin', async (req, res) => {
        const { email, password } = req.body;
    
        try {
            connection.query('SELECT id, password FROM employees WHERE email = ?', [email], async (err, results) => {
                if (err) return res.status(500).json({ message: 'Database error' });
    
                if (results.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
    
                const user = results[0];
    
                const passwordMatch = await bcrypt.compare(password, user.password);
    
                if (!passwordMatch) {
                    return res.status(400).json({ message: 'Invalid credentials' });
                }
    
                const token = jwt.sign({ email }, 'your_jwt_secret', { expiresIn: '1h' });
    
                res.json({ message: 'Login successful', token, id: user.id });
            });
        } catch (err) {
            res.status(500).json({ message: 'Server error' });
        }
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
    router.post('/resetemppassword', async (req, res) => {
        const { email } = req.body;
        // console.log(email);
        try {
            connection.query('SELECT * FROM employees WHERE email = ?', [email], (err, results) => {
                if (err) return res.status(500).json({ message: 'Database error' });
                if (results.length === 0) return res.status(400).json({ message: 'Email not found' });
    
                const resetToken = crypto.randomBytes(32).toString('hex');
    
                connection.query('UPDATE employees SET resetToken = ? WHERE email = ?', [resetToken, email], (err) => {
                    if (err) return res.status(500).json({ message: 'Database error' });
    
                    const resetUrl = `http://localhost:3000/setemppass/${resetToken}`;
    
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


    // router.post('/newpass', async (req, res) => {
    //     const { token, password } = req.body;

    //     if (!password) {
    //         return res.status(400).json({ message: 'New password is required' });
    //     }

    //     try {
    //         connection.query('SELECT * FROM users WHERE resetToken = ?', [token], async (err, results) => {
    //             if (err) return res.status(500).json({ message: 'Database error' });
    //             if (results.length === 0) return res.status(400).json({ message: 'Invalid token' });
    
    //             const user = results[0];
    
    //             try {
    //                 connection.query('UPDATE users SET password = ?, resetToken = NULL WHERE resetToken = ?', [password, token], (err) => {
    //                     if (err) return res.status(500).json({ message: 'Database error' });
    
    //                     res.json({ message: 'Password reset successfully' });
    //                 });
    //             } catch (err) {
    //                 return res.status(500).json({ message: 'Error updating password' });
    //             }
    //         });
    //     } catch (err) {
    //         res.status(500).json({ message: 'Server error' });
    //     }
    // });

    router.post('/newpass', async (req, res) => {
        const { token, password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'New password is required' });
        }

        try {
            connection.query('SELECT * FROM users WHERE resetToken = ?', [token], async (err, results) => {
                if (err) return res.status(500).json({ message: 'Database error' });
                if (results.length === 0) return res.status(400).json({ message: 'Invalid token' });

                const user = results[0];

                try {
                    const hashedPassword = await bcrypt.hash(password, 10);

                    connection.query('UPDATE users SET password = ?, resetToken = NULL WHERE resetToken = ?', [hashedPassword, token], (err) => {
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

    // router.post('/newemppass', async (req, res) => {
    //     const { token, password } = req.body;

    //     if (!password) {
    //         return res.status(400).json({ message: 'New password is required' });
    //     }

    //     try {
    //         connection.query('SELECT * FROM employees WHERE resetToken = ?', [token], async (err, results) => {
    //             if (err) return res.status(500).json({ message: 'Database error' });
    //             if (results.length === 0) return res.status(400).json({ message: 'Invalid token' });
    //             // console.log("connection successfully established");
    
    //             const user = results[0];
    
    //             try {
    //                 connection.query('UPDATE employees SET password = ?, resetToken = NULL WHERE resetToken = ?', [password, token], (err) => {
    //                     if (err) return res.status(500).json({ message: 'Database error' });
    
    //                     res.json({ message: 'Password reset successfully' });
    //                 });
    //             } catch (err) {
    //                 return res.status(500).json({ message: 'Error updating password' });
    //             }
    //         });
    //     } catch (err) {
    //         res.status(500).json({ message: 'Server error' });
    //     }
    // });

    router.post('/newemppass', async (req, res) => {
        const { token, password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'New password is required' });
        }

        try {
            connection.query('SELECT * FROM employees WHERE resetToken = ?', [token], async (err, results) => {
                if (err) return res.status(500).json({ message: 'Database error' });
                if (results.length === 0) return res.status(400).json({ message: 'Invalid token' });

                const user = results[0];

                try {
                    const hashedPassword = await bcrypt.hash(password, saltRounds);

                    connection.query('UPDATE employees SET password = ?, resetToken = NULL WHERE resetToken = ?', [hashedPassword, token], (err) => {
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

    router.post('/createemployee', (req, res) => {
        const { name, email, department, contact, age } = req.body;     
        connection.query('INSERT INTO employees (name, email, department_id, contact_info, age, status) VALUES (?, ?, ?, ?, ?, "inactive")', 
        [name, email, department, contact, age], (err, result) => {
            if (err) {
                console.error('Error creating employee:', err);
                return res.status(500).json({ message: 'Error creating employee' });
            }
            res.status(201).json({ message: 'Employee created successfully' });
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


    router.get('/view/:id', (req, res) => {
        
        const { id } = req.params;
        connection.query('SELECT e.id, e.name, e.email, d.dept_name, e.status, e.contact_info, e.age, e.courses_completed, e.credits_earned FROM employees e LEFT JOIN department d ON e.department_id = d.id WHERE e.id = ?', [id], (err, results) => {
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
        const { name, email, department, status, contact, age } = req.body;
        // console.log(department);
        connection.query('UPDATE employees SET name = ?, email=?, department_id = ?, status = ?, contact_info = ?, age = ? WHERE id = ?', [name, email, department, status, contact, age, id], (err, result) => {
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

    router.get('/fullleaderboard', async (req, res) => {
        try {
            const query = `
                SELECT 
                    e.id,
                    e.name,
                    e.credits_earned,
                    e.courses_completed,
                    d.dept_name,
                    JSON_ARRAYAGG(JSON_OBJECT('course_id', ec.course_id, 'completion_date', ec.completion_date)) as completed_courses
                FROM 
                    employees e
                JOIN 
                    department d ON e.department_id = d.id
                LEFT JOIN 
                    employee_courses ec ON e.id = ec.employee_id
                WHERE 
                    e.status = 'active'
                GROUP BY 
                    e.id, e.name, e.credits_earned, d.dept_name
                ORDER BY 
                    e.credits_earned DESC;
            `;
            
            const [results] = await connection.execute(query);
    
            const parsedResults = results.map(employee => ({
                ...employee,
                completed_courses: employee.completed_courses ? JSON.parse(employee.completed_courses) : []
            }));
    
            res.json(parsedResults);
        } catch (error) {
            console.error('Error fetching full leaderboard:', error);
            res.status(500).json({ error: 'Failed to fetch leaderboard' });
        }
    });

    
    router.post('/enroll-course', (req, res) => {
        const { course_id, employee_id } = req.body;
    
        if (!course_id || !employee_id) {
            return res.status(400).json({ status: 'error', message: 'Missing course_id or employee_id' });
        }
    
        const enrollmentCheckQuery = `
            SELECT * FROM enrolled_courses 
            WHERE course_id = ? AND employee_id = ?
        `;
        connection.query(enrollmentCheckQuery, [course_id, employee_id], (err, enrollmentResults) => {
            if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
            if (enrollmentResults.length > 0) {
                return res.status(400).json({ status: 'error', message: 'Already enrolled' });
            }
    
            const completionCheckQuery = `
                SELECT * FROM employee_courses 
                WHERE employee_id = ? AND course_id = ?  
            `;
            connection.query(completionCheckQuery, [employee_id, course_id], (err, completionResults) => {
                if (err) {
                    console.log(err.message);
                    return res.status(500).json({ status: 'error', message: 'Database error' });
                }
                if (completionResults.length > 0) {
                    return res.status(400).json({ status: 'error', message: 'Course already completed' });
                }
    
                const statusCheckQuery = `
                    SELECT status FROM employees 
                    WHERE id = ?
                `;
                connection.query(statusCheckQuery, [employee_id], (err, statusResults) => {
                    if (err) return res.status(500).json({ status: 'error', message: 'Database error' });
    
                    if (statusResults.length > 0 && statusResults[0].status !== 'active') {
                        const updateStatusQuery = `
                            UPDATE employees SET status = 'active' 
                            WHERE id = ?
                        `;
                        connection.query(updateStatusQuery, [employee_id], (err) => {
                            if (err) return res.status(500).json({ status: 'error', message: 'Failed to update employee status' });
                        });
                    }
    
                    const insertQuery = `
                        INSERT INTO enrolled_courses (employee_id, course_id) 
                        VALUES (?, ?)
                    `;
                    connection.query(insertQuery, [employee_id, course_id], (err) => {
                        if (err) return res.status(500).json({ status: 'error', message: err.message });
    
                        res.status(200).json({ status: 'success', message: 'Enrollment successful' });
                    });
                });
            });
        });
    });
    

const formatDateForMySQL = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};



router.post('/complete-course', (req, res) => {
    const { course_id, employee_id, credit_points, submission_date, certificate_url } = req.body;

    if (!course_id || !employee_id || !credit_points || !submission_date || !certificate_url) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    connection.beginTransaction(err => {
        if (err) return res.status(500).json({ status: 'error', message: 'Transaction start failed' });

        const updateEmployeeQuery = `
            UPDATE employees 
            SET credits_earned = credits_earned + ?, courses_completed = courses_completed + 1 
            WHERE id = ?
        `;
        connection.query(updateEmployeeQuery, [credit_points, employee_id], (err, employeeResults) => {
            if (err) {
                console.log(err);
                return connection.rollback(() => {
                    return res.status(500).json({ status: 'error', message: 'Failed to update employees table' });
                });
            }

            const updateCourseQuery = `
                UPDATE courses 
                SET completions = completions + 1 
                WHERE id = ?
            `;
            connection.query(updateCourseQuery, [course_id], (err, courseResults) => {
                if (err) {
                    console.log(err);
                    return connection.rollback(() => {
                        return res.status(500).json({ status: 'error', message: 'Failed to update courses table' });
                    });
                }

                const updateCertificateReviewQuery = `
                    UPDATE certificate_review 
                    SET status = 'accepted' 
                    WHERE employee_id = ? AND course_id = ?
                `;
                connection.query(updateCertificateReviewQuery, [employee_id, course_id], (err, reviewResults) => {
                    if (err) {
                        console.log(err);
                        return connection.rollback(() => {
                            return res.status(500).json({ status: 'error', message: 'Failed to update certificate_review table' });
                        });
                    }

                    const getStartDateQuery = `
                        SELECT enrolled_date 
                        FROM enrolled_courses 
                        WHERE employee_id = ? AND course_id = ?
                    `;
                    connection.query(getStartDateQuery, [employee_id, course_id], (err, startDateResults) => {
                        if (err) {
                            console.log(err);
                            return connection.rollback(() => {
                                return res.status(500).json({ status: 'error', message: 'Failed to retrieve start date' });
                            });
                        }

                        const start_date = startDateResults[0]?.enrolled_date;
                        if (!start_date) {
                            return connection.rollback(() => {
                                return res.status(400).json({ status: 'error', message: 'No enrollment record found' });
                            });
                        }

                        const newStartDate = formatDateForMySQL(start_date);
                        const newEndDate = formatDateForMySQL(submission_date);

                        const insertEmployeeCourseQuery = `
                            INSERT INTO employee_courses (employee_id, course_id, completion_date, certificate, start_date)
                            VALUES (?, ?, ?, ?, ?)
                        `;
                        connection.query(insertEmployeeCourseQuery, [employee_id, course_id, newEndDate, certificate_url, newStartDate], (err, insertResults) => {
                            if (err) {
                                console.log(err);
                                return connection.rollback(() => {
                                    return res.status(500).json({ status: 'error', message: 'Failed to insert into employee_courses table' });
                                });
                            }

                            const deleteEnrolledQuery = `
                                DELETE FROM enrolled_courses 
                                WHERE employee_id = ? AND course_id = ?
                            `;
                            connection.query(deleteEnrolledQuery, [employee_id, course_id], (err, deleteResults) => {
                                if (err) {
                                    console.log(err);
                                    return connection.rollback(() => {
                                        return res.status(500).json({ status: 'error', message: 'Failed to delete from enrolled_courses table' });
                                    });
                                }

                                connection.commit(err => {
                                    if (err) {
                                        console.log(err);
                                        return connection.rollback(() => {
                                            return res.status(500).json({ status: 'error', message: 'Transaction commit failed' });
                                        });
                                    }

                                    res.status(200).json({ status: 'success', message: 'Course completion recorded successfully' });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});


router.post('/reject-certificate', (req, res) => {
    const { course_id, employee_id } = req.body;

    if (!course_id || !employee_id) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    // Start the transaction
    connection.beginTransaction(err => {
        if (err) {
            console.error('Transaction start failed:', err);
            return res.status(500).json({ status: 'error', message: 'Transaction start failed' });
        }

        const updateEnrolled = `
            UPDATE enrolled_courses 
            SET status = 'ongoing'
            WHERE employee_id = ? AND course_id = ?
        `;
        connection.query(updateEnrolled, [employee_id, course_id], (err, employeeResults) => {
            if (err) {
                console.error('Failed to update enrolled table:', err);
                return connection.rollback(() => {
                    return res.status(500).json({ status: 'error', message: 'Failed to update enrolled table' });
                });
            }

            const updateCertificateQuery = `
                DELETE FROM certificate_review 
                WHERE course_id = ? AND employee_id = ?
            `;
            connection.query(updateCertificateQuery, [course_id, employee_id], (err, courseResults) => {
                if (err) {
                    console.error('Failed to update certificate table:', err);
                    return connection.rollback(() => {
                        return res.status(500).json({ status: 'error', message: 'Failed to update certificate table' });
                    });
                }

                // Commit the transaction
                connection.commit(err => {
                    if (err) {
                        console.error('Transaction commit failed:', err);
                        return connection.rollback(() => {
                            return res.status(500).json({ status: 'error', message: 'Transaction commit failed' });
                        });
                    }

                    res.status(200).json({ status: 'success', message: 'Certificate rejected and course status updated successfully' });
                });
            });
        });
    });
});


   
      
   return router;
};
  