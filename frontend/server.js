const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());

// Melayani file statis dari folder public
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login-admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login-admin.html'));
});

app.get('/admin-dash.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dash.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server frontend berjalan di http://localhost:${PORT}`);
});