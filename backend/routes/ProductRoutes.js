const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct, getProductById} = require('../controllers/ProductController');
const authMiddleware = require('../Middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Simpan file sementara di folder 'uploads'

router.get('/', getProducts);
router.get('/:id', getProductById); 
router.post('/', authMiddleware, upload.single('image'), createProduct);
router.put('/:id', authMiddleware, upload.single('image'), updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;