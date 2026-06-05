const Product = require('../models/Product');
const { parseFaberlicProducts } = require('../utils/scraper');

const categoryHierarchy = {
  'QULLUQ': ['Üz qulluğu', 'Bədənə qulluq', 'Saçlar', 'Boyama', 'Aromaterapiya', 'Ağız boşluğunun gigiyenası', 'Gigiyena', 'Kişilərə', 'Kosmesevtika', 'Uşaqlara'],
  'MAKIYAJ': ['Gözlər', 'Dodaqlar', 'Üz', 'Dırnaqlar', 'Qaşlar'],
  'PARFÜMERİYA': [],
  'DƏB': [],
  'SAĞLAMLIQ': [],
  'EV': [],
  'UŞAQLARA': [],
  'BİZNES': [],
  'AKSİYALAR': [],
  'ENDİRİM': []
};

// @desc Get all products
// @route GET /api/products
const getProducts = async (req, res) => {
    try {
        const { 
          category, 
          subcategory, 
          item, 
          search, 
          isAdmin,
          isInStock,
          isSuperPrice,
          isNew,
          isDiscount,
          isPromotion,
          isHit,
          collection,
          productType,
          productEffect,
          skinType,
          hairType,
          minPrice,
          maxPrice
        } = req.query;
        let query = {};

        // Regular users only see active AND in-stock products
        if (!isAdmin) {
            query.isActive = true;
            query.isInStock = true;
        }

        // Category filtering logic
        if (item) {
            query.category = item;
        } else if (subcategory) {
            query.category = subcategory;
        } else if (category) {
            // If only main category is selected, we search for products that match 
            // the main category OR belong to its hierarchy.
            if (categoryHierarchy[category] && categoryHierarchy[category].length > 0) {
                query.category = { $in: [category, ...categoryHierarchy[category]] };
            } else {
                query.category = category;
            }
        }

        // Boolean filters - if user explicitly requests, use their choice
        if (isInStock !== undefined && isInStock !== null) {
            query.isInStock = isInStock === 'true';
        }
        
        if (isSuperPrice === 'true') query.isSuperPrice = true;
        if (isNew === 'true') query.isNew = true;
        
        // Handle OR logic for discount and promotion if both are requested
        if (isDiscount === 'true' && isPromotion === 'true') {
            query.$or = [{ isDiscount: true }, { isPromotion: true }];
        } else {
            if (isDiscount === 'true') query.isDiscount = true;
            if (isPromotion === 'true') query.isPromotion = true;
        }
        
        if (isHit === 'true') query.isHit = true;

        // String filters
        if (collection) query.collection = collection;
        if (productType) query.productType = productType;
        if (productEffect) query.productEffect = productEffect;
        if (skinType) query.skinType = skinType;
        if (hairType) query.hairType = hairType;

        // Price range filter
        if (minPrice || maxPrice) {
            query.price_sale = {};
            if (minPrice) query.price_sale.$gte = Number(minPrice);
            if (maxPrice) query.price_sale.$lte = Number(maxPrice);
        }

        // Search filter
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query);
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Get a single product by ID
// @route GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const { isAdmin } = req.query;
        
        let query = { _id: req.params.id };
        
        // Regular users only see active AND in-stock products
        if (!isAdmin) {
            query.isActive = true;
            query.isInStock = true;
        }
        
        const product = await Product.findOne(query);
        if (!product) {
            return res.status(404).json({ message: 'Məhsul tapılmadı' });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Sync products from Faberlic website
// @route POST /api/products/sync
const syncProducts = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ message: 'URL daxil edilməlidir' });
        }
        const result = await parseFaberlicProducts(url);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Create a new product (Admin)
// @route POST /api/products
const createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Update product (Admin)
// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Məhsul tapılmadı' });
        }
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc Delete product (Admin)
// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Məhsul tapılmadı' });
        }
        res.status(200).json({ message: 'Məhsul silindi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    syncProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
