const Product = require('../models/Product');
const { s3, bucketName } = require('../config/s3'); // Impor S3 config
const fs = require('fs'); // Node.js built-in module

// Fungsi untuk mengunggah file ke S3
const uploadFile = (file) => {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename,
        ContentType: file.mimetype, // Ini penting
        ContentDisposition: 'inline', // Tambahkan baris ini
    };
    return s3.upload(uploadParams).promise();
};

const createProduct = async (req, res) => {
  const { name, description, price, stock } = req.body;
  const file = req.file;

  try {
    let imageUrl = '';
    if (file) {
        const result = await uploadFile(file);
        imageUrl = result.Location; // Dapatkan URL publik dari S3
        // Hapus file dari server setelah diunggah ke S3
        fs.unlinkSync(file.path);
    }
    
    const newProduct = await Product.create({ name, description, price, stock, image: imageUrl });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

const updateProduct = async (req, res) => {
  const { name, description, price, stock } = req.body;
  const file = req.file;

  try {
    let product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Produk tidak ditemukan' });
    }

    let imageUrl = product.image;
    if (file) {
        // Hapus gambar lama dari S3 jika ada
        if (imageUrl) {
            const oldKey = imageUrl.split('/').pop();
            await s3.deleteObject({ Bucket: bucketName, Key: oldKey }).promise();
        }
        const result = await uploadFile(file);
        imageUrl = result.Location;
        fs.unlinkSync(file.path);
    }
    
    product.name = name;
    product.description = description;
    product.price = price;
    product.stock = stock;
    product.image = imageUrl; // Simpan URL S3
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Fungsi baru untuk mendapatkan satu produk
const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Produk tidak ditemukan' });
        }
        res.json(product);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// ... (getProducts dan deleteProduct tidak berubah) ...
const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Produk tidak ditemukan' });
    }
    
    // Hapus gambar dari S3 sebelum menghapus produk dari DB
    if (product.image) {
        const oldKey = product.image.split('/').pop();
        await s3.deleteObject({ Bucket: bucketName, Key: oldKey }).promise();
    }
    
    await product.destroy();
    res.json({ msg: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};


module.exports = { 
    getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    getProductById // Tambahkan fungsi baru di sini
};
