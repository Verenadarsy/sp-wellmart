const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
const User = require('./models/user'); // Impor model User
const bcrypt = require('bcryptjs'); // Impor bcryptjs

const authRoutes = require('./routes/AuthRoutes');
const productRoutes = require('./routes/ProductRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
// Fungsi untuk menyinkronkan database dan membuat admin pertama
const setupDatabase = async () => {
    try {
        await connectDB(); // Hubungkan ke database
        
        // Sinkronkan semua model. { alter: true } akan membuat/mengubah tabel tanpa menghapus data
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully.');

        // Cek apakah sudah ada admin
        const adminExists = await User.findOne({ where: { email: 'superadmin@wellmart.com' } });
        
        if (!adminExists) {
            // Jika belum ada, buat admin super pertama
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt); // Password default

            await User.create({
                email: 'superadmin@wellmart.com',
                password: hashedPassword,
            });
            console.log('Superadmin pertama berhasil dibuat.');
        } else {
            console.log('Superadmin sudah ada.');
        }
    } catch (error) {
        console.error('Gagal saat setup database:', error);
    }
};

// Jalankan fungsi setupDatabase sebelum server dimulai
setupDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));