import Product from '../models/Product.js';
import { s3, bucketName } from '../config/s3.js'; // Impor S3 config
import fs from 'fs'; // Node.js built-in module

// URL CloudFront Anda. Ganti dengan domain Anda.
const CLOUDFRONT_DOMAIN = 'https://d12345.cloudfront.net';

// Fungsi untuk mengunggah file ke S3
const uploadFile = (file) => {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename,
        ContentType: file.mimetype,
        ContentDisposition: 'inline',
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
        product.image = imageUrl;
        await product.save();
        
        res.json(product);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// Fungsi baru untuk mendapatkan semua produk dengan URL CDN
const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        
        // Iterasi produk dan ubah URL gambar ke CDN
        const productsWithCDN = products.map(product => {
            if (product.image) {
                // Dapatkan nama file dari URL S3
                const key = product.image.split('/').pop();
                // Ganti URL S3 dengan URL CloudFront
                product.image = `${CLOUDFRONT_DOMAIN}/${key}`;
            }
            return product;
        });

        res.json(productsWithCDN);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Produk tidak ditemukan' });
        }
        
        // Ubah URL gambar ke CDN untuk satu produk
        if (product.image) {
            const key = product.image.split('/').pop();
            product.image = `${CLOUDFRONT_DOMAIN}/${key}`;
        }
        
        res.json(product);
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
    getProductById
};