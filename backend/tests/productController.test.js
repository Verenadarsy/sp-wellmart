const { getProducts } = require('../controllers/ProductController');
const Product = require('../models/Product');

// Mock res object
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  send: jest.fn()
};

// Mock req (tidak dipakai, tapi tetap perlu)
const req = {};

// Mock CLOUDFRONT_DOMAIN
jest.mock('../config/s3.js', () => ({
  bucketName: 'mock-bucket',
  s3: {}
}));

// Mock model
jest.mock('../models/Product');

describe('getProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return products with image URLs replaced with CDN domain', async () => {
    const mockProducts = [
      { id: 1, name: 'Produk A', image: 'https://s3.amazonaws.com/mock-bucket/file1.jpg' },
      { id: 2, name: 'Produk B', image: null }
    ];

    Product.findAll.mockResolvedValue(mockProducts);

    await getProducts(req, res);

    expect(res.json).toHaveBeenCalledWith([
      { id: 1, name: 'Produk A', image: 'https://d1e23un174ohj2.cloudfront.net/file1.jpg' },
      { id: 2, name: 'Produk B', image: null }
    ]);
  });

  it('should return 500 on error', async () => {
    Product.findAll.mockRejectedValue(new Error('DB Error'));

    await getProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Server error');
  });
});
