const express = require('express');
const router = express.Router();
const { login, registerAdmin } = require('../controllers/AuthController');

router.post('/login', login);
// Gunakan route ini hanya untuk mendaftarkan admin pertama kali.
// Hapus atau amankan route ini setelah admin pertama terdaftar.
router.post('/register', registerAdmin); 

module.exports = router;