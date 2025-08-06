const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql' // Gunakan 'mysql' karena RDS biasanya pakai MySQL
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Koneksi ke database berhasil.');
  } catch (error) {
    console.error('Gagal terhubung ke database:', error);
  }
};

module.exports = { sequelize, connectDB };