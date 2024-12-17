const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection(`mysql://root:HbccbTnDCnlGaGqRskEsYkWkUsVDooUu@autorack.proxy.rlwy.net:22819/railway`);

db.connect(err => { 
    if (err) {
        console.error('Error connecting to MySQL Database:', err.message);
        throw err;
    }
    console.log('Connected to MySQL Database!');
});

app.post('/add-employee', (req, res) => {
    const { name, employeeId, email, phone, department, dateOfJoining, role } = req.body;

    if (!name || !employeeId || !email || !phone || !department || !dateOfJoining || !role) {
        return res.status(400).send('All fields are required.');
    }

    const checkQuery = 'SELECT * FROM Employees WHERE employeeId = ? OR email = ?';
    db.query(checkQuery, [employeeId, email], (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message);
            return res.status(400).send('Server error.');
        }

        if (results.length > 0) {
            return res.status(400).send('Employee ID or Email already exists.');
        }

        const insertQuery = 'INSERT INTO Employees (name, employeeId, email, phone, department, dateOfJoining, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(insertQuery, [name, employeeId, email, phone, department, dateOfJoining, role], (err, result) => {
            if (err) {
                console.error('Error executing query:', err.message);
                return res.status(500).send('Error adding employee.');
            }
            res.send('Employee added successfully!');
        });
    });
});

app.get('/employees', (req, res) => {
    const fetchQuery = 'SELECT * FROM Employees';

    db.query(fetchQuery, (err, results) => {
        if (err) {
            console.error('Error fetching employees:', err.message);
            return res.status(500).send('Error fetching employees.');
        }

        res.json(results);
    });
});

app.put('/employees/:employeeId', (req, res) => {
    const { employeeId } = req.params;
    const { name, email, phone, department, dateOfJoining, role } = req.body;

    if (!name || !email || !phone || !department || !dateOfJoining || !role) {
        return res.status(400).send('All fields are required.');
    }

    const updateQuery = `
        UPDATE Employees 
        SET name = ?, email = ?, phone = ?, department = ?, dateOfJoining = ?, role = ?
        WHERE employeeId = ?
    `;

    db.query(
        updateQuery,
        [name, email, phone, department, dateOfJoining, role, employeeId],
        (err, result) => {
            if (err) {
                console.error('Error updating employee:', err.message);
                return res.status(500).send('Error updating employee.');
            }

            if (result.affectedRows === 0) {
                return res.status(404).send('Employee not found.');
            }

            res.send('Employee updated successfully!');
        }
    );
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
