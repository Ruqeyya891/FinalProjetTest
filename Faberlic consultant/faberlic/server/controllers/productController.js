const Product = require('../models/Product');
const { parseFaberlicProducts } = require('../utils/scraper');
const { categories, slugify } = require('../utils/categories');
const Papa = require('papaparse');
const fs = require('fs');

// @desc Get all products
// @route GET /api/products
const getProducts = async (req, res) => {
    try {
        const { 
          category, 
          subcategory, 
          childCategory,
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
          series,
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
            query.$and = [
                { $or: [{ status: 'active' }, { isActive: true }] }, // Backward compatibility
                { isInStock: true }
            ];
        }

        // Category filtering logic with slugs
        if (childCategory) {
            query.childCategorySlug = childCategory;
        } else if (subcategory) {
            query.subCategorySlug = subcategory;
        } else if (category) {
            query.categorySlug = category;
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
        if (series) query.seriesSlug = series;
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

        // Search filter - search across multiple fields
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { article: { $regex: search, $options: 'i' } },
                { artikul: { $regex: search, $options: 'i' } },
                { seriesName: { $regex: search, $options: 'i' } },
                { seriesSlug: { $regex: search, $options: 'i' } },
                { collection: { $regex: search, $options: 'i' } }
            ];
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
            query.$and = [
                { $or: [{ status: 'active' }, { isActive: true }] }, // Backward compatibility
                { isInStock: true }
            ];
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

// @desc Import products from CSV (Admin)
// @route POST /api/products/import
const importProducts = async (req, res) => {
    console.log('🔍 Step 4: Import endpoint hit!'); // Debug log 4
    try {
        console.log('🔍 Step 5: req.file:', req.file); // Debug log 5
        if (!req.file) {
            console.error('❌ No file uploaded!');
            return res.status(400).json({ message: 'Fayl yüklənməyib' });
        }

        // Parse CSV file
        const csvFile = fs.readFileSync(req.file.path, 'utf8');
        console.log('🔍 Step 6: CSV file content:', csvFile.slice(0, 200)); // Debug log 6 (truncated)
        const results = Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        });
        console.log('🔍 Step 7: Parsed CSV results:', results); // Debug log 7
        console.log('🔍 Step 8: Number of rows:', results.data.length); // Debug log 8

        const importedProducts = [];
        const errors = [];

        for (const row of results.data) {
            try {
                // Map CSV fields to product model
                const images = (row.imageurl || row.image || row.photo || row.sekil || '').split(',').map(img => img.trim()).filter(img => img);
                
                const productData = {
                    name: row.name || row.ad || '',
                    sku: row.sku || row.artikul || row.article || '',
                    description: row.description || row.aciklama || '',
                    ingredients: row.ingredients || row.terkib || '',
                    usage: row.usage || row.istifade || '',
                    images: images,
                    weight: {
                        value: row.weightValue ? parseFloat(row.weightValue) : null,
                        unit: row.weightUnit || 'q'
                    },
                    volume: {
                        value: row.volumeValue ? parseFloat(row.volumeValue) : null,
                        unit: row.volumeUnit || 'ml'
                    },
                    price_catalog: parseFloat(row.catalogprice || row.price_catalog || row.katalogqiymeti || 0),
                    price_sale: parseFloat(row.saleprice || row.price_sale || row.satisqiymeti || 0),
                    price_anbar: parseFloat(row.stockprice || row.anbarprice || row.price_anbar || 0),
                    stock: parseInt(row.stock || 0),
                    categorySlug: row.categoryslug || row.category_slug || '',
                    subCategorySlug: row.subcategoryslug || row.subcategory_slug || '',
                    childCategorySlug: row.childcategoryslug || row.childcategory_slug || '',
                    isInStock: row.instock?.toString().toLowerCase() === 'true' || true,
                    isNew: row.isnew?.toString().toLowerCase() === 'true' || false,
                    isDiscount: row.isdiscount?.toString().toLowerCase() === 'true' || false,
                    isSuperPrice: row.issuperprice?.toString().toLowerCase() === 'true' || false,
                    isHit: row.ishit?.toString().toLowerCase() === 'true' || false,
                    isActive: true
                };

                // Try to find category names from slugs
                const findCategoryBySlug = (slug) => {
                    if (!slug) return { name: '', slug: '' };
                    const mainCat = categories.find(c => c.slug === slug);
                    if (mainCat) return { name: mainCat.name, slug: mainCat.slug };
                    for (const cat of categories) {
                        const sub = cat.subCategories?.find(s => s.slug === slug);
                        if (sub) return { name: sub.name, slug: sub.slug };
                        for (const sub of cat.subCategories || []) {
                            const child = sub.childCategories?.find(ch => ch.slug === slug);
                            if (child) return { name: child.name, slug: child.slug };
                        }
                    }
                    return { name: '', slug };
                };

                productData.categoryName = findCategoryBySlug(productData.categorySlug).name;
                productData.subCategoryName = findCategoryBySlug(productData.subCategorySlug).name;
                productData.childCategoryName = findCategoryBySlug(productData.childCategorySlug).name;

                // Save product
                const product = new Product(productData);
                const savedProduct = await product.save();
                importedProducts.push(savedProduct);
            } catch (err) {
                errors.push({ row: row, error: err.message });
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: 'Import tamamlandı',
            imported: importedProducts.length,
            errors: errors.length > 0 ? errors : undefined
        });
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
    deleteProduct,
    importProducts
};
