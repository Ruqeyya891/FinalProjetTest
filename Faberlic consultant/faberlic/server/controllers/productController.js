const Product = require('../models/Product');
const CatalogCycle = require('../models/CatalogCycle');
const Series = require('../models/Series');
const { parseFaberlicProducts, scrapeFaberlicCatalog, generateExcelFromProducts } = require('../utils/scraper');
const { categories } = require('../utils/categories');
const slugify = require('../utils/slugify');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

// Helper function to get active catalog
const getActiveCatalog = async () => {
  const now = new Date();
  return await CatalogCycle.findOne({
    startDate: { $lte: now },
    endDate: { $gte: now },
    isActive: true,
  });
};

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
        let andConditions = [];

        // Regular users only see active OR out_of_stock products (not passive)
        if (!isAdmin) {
            andConditions.push({ status: { $ne: 'passive' } });
        }

        // Category filtering logic with backward compatibility
        if (category) {
            // Match either in categories array OR in old single category fields
            andConditions.push({
                $or: [
                    { 
                        'categories.categorySlug': category,
                        ...(subcategory && { 'categories.subCategorySlug': subcategory }),
                        ...(childCategory && { 'categories.childCategorySlug': childCategory })
                    },
                    {
                        categorySlug: category,
                        ...(subcategory && { subCategorySlug: subcategory }),
                        ...(childCategory && { childCategorySlug: childCategory })
                    }
                ]
            });
        }

        // Boolean filters - if user explicitly requests, use their choice
        if (isInStock !== undefined && isInStock !== null) {
            andConditions.push({ isInStock: isInStock === 'true' });
        }
        
        if (isSuperPrice === 'true') andConditions.push({ isSuperPrice: true });
        if (isNew === 'true') andConditions.push({ isNew: true });
        
        // Handle OR logic for discount and promotion if both are requested
        if (isDiscount === 'true' && isPromotion === 'true') {
            andConditions.push({ $or: [{ isDiscount: true }, { isPromotion: true }] });
        } else {
            if (isDiscount === 'true') andConditions.push({ isDiscount: true });
            if (isPromotion === 'true') andConditions.push({ isPromotion: true });
        }
        
        if (isHit === 'true') andConditions.push({ isHit: true });

        // String filters
        if (collection) andConditions.push({ collection });
        if (series) andConditions.push({ seriesSlug: series });
        if (productType) andConditions.push({ productType });
        if (productEffect) andConditions.push({ productEffect });
        if (skinType) andConditions.push({ skinType });
        if (hairType) andConditions.push({ hairType });

        // Search filter - search across multiple fields
        if (search) {
            andConditions.push({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { sku: { $regex: search, $options: 'i' } },
                    { article: { $regex: search, $options: 'i' } },
                    { artikul: { $regex: search, $options: 'i' } },
                    { seriesName: { $regex: search, $options: 'i' } },
                    { seriesSlug: { $regex: search, $options: 'i' } },
                    { collection: { $regex: search, $options: 'i' } }
                ]
            });
        }

        // Build the final query
        if (andConditions.length > 0) {
            query = { $and: andConditions };
        }

        const products = await Product.find(query);
        const activeCatalog = await getActiveCatalog();
        
        // Add active catalog price to each product
        const productsWithActivePrice = products.map(product => {
            const productObj = product.toObject();
            if (activeCatalog && product.catalogPrices) {
                const activePrice = product.catalogPrices.find(
                    cp => cp.catalogId.toString() === activeCatalog._id.toString()
                );
                productObj.activeCatalogPrice = activePrice;
                productObj.hasActiveCatalogPrice = !!activePrice;
                productObj.activeCatalog = activeCatalog;
            } else {
                productObj.activeCatalogPrice = null;
                productObj.hasActiveCatalogPrice = false;
                productObj.activeCatalog = null;
            }
            return productObj;
        });
        
        res.status(200).json(productsWithActivePrice);
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
        
        // Regular users only see active OR out_of_stock products (not passive)
        if (!isAdmin) {
            query.status = { $ne: 'passive' };
        }
        
        const product = await Product.findOne(query);
        if (!product) {
            return res.status(404).json({ message: 'Məhsul tapılmadı' });
        }
        
        const productObj = product.toObject();
        const activeCatalog = await getActiveCatalog();
        
        if (activeCatalog && product.catalogPrices) {
            const activePrice = product.catalogPrices.find(
                cp => cp.catalogId.toString() === activeCatalog._id.toString()
            );
            productObj.activeCatalogPrice = activePrice;
            productObj.hasActiveCatalogPrice = !!activePrice;
            productObj.activeCatalog = activeCatalog;
        } else {
            productObj.activeCatalogPrice = null;
            productObj.hasActiveCatalogPrice = false;
            productObj.activeCatalog = null;
        }
        
        res.status(200).json(productObj);
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

// @desc Update product status (Admin)
// @route PATCH /api/products/:id/status
const updateProductStatus = async (req, res) => { 
    try { 
        console.log("STATUS ROUTE HIT"); 
        console.log("ID:", req.params.id); 
        console.log("BODY:", req.body); 
 
        const { id } = req.params; 
        const { status } = req.body; 
 
        if (!["active", "passive", "out_of_stock"].includes(status)) { 
            return res.status(400).json({ message: "Invalid status value" }); 
        } 

        // First check if the product exists
        const existingProduct = await Product.findById(id);
        if (!existingProduct) { 
            return res.status(404).json({ message: "Product not found" }); 
        }
        
        console.log("Existing product found, updating status...");
        
        // Now update without runValidators first to test
        const product = await Product.findByIdAndUpdate( 
            id, 
            { status }, 
            { new: true } 
        ); 
 
        return res.json({ 
            success: true, 
            product 
        }); 
    } catch (error) { 
        console.error("STATUS BACKEND ERROR:", error); 
        console.error("Error stack:", error.stack);
        return res.status(500).json({ 
            message: error.message 
        }); 
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

// @desc Scrape Faberlic catalog and generate Excel
// @route POST /api/products/scrape-and-export
const scrapeAndExport = async (req, res) => {
  console.log("SCRAPE STARTED");
  console.log("Request body:", req.body);
  
  try {
    const { catalogUrl } = req.body;
    if (!catalogUrl) {
      return res.status(400).json({ success: false, message: 'Kataloq linki daxil edilməlidir' });
    }
    console.log("URL:", catalogUrl);

    // Scrape products
    const scrapeResult = await scrapeFaberlicCatalog(catalogUrl);
    if (!scrapeResult.success) {
      return res.status(500).json(scrapeResult);
    }

    // Generate Excel file name with timestamp
    const timestamp = Date.now();
    const fileName = `faberlic_products_${timestamp}.xlsx`;

    // Generate Excel
    const excelResult = generateExcelFromProducts(scrapeResult.products, fileName);
    if (!excelResult.success) {
      return res.status(500).json(excelResult);
    }

    // Log the results
    console.log(`Scraping summary: ${scrapeResult.pageCount} pages, ${scrapeResult.products.length} products found`);

    // Return file URL (assuming we serve uploads from /uploads)
    res.status(200).json({
      success: true,
      products: scrapeResult.products,
      pageCount: scrapeResult.pageCount,
      productCount: scrapeResult.products.length,
      downloadUrl: `/uploads/${fileName}`
    });
  } catch (error) {
    console.error("SCRAPE ERROR:", error);
    return res.status(500).json({
      message: error.message,
      stack: error.stack
    });
  }
};

module.exports = {
    getProducts,
    getProductById,
    syncProducts,
    createProduct,
    updateProduct,
    updateProductStatus,
    deleteProduct,
    importProducts,
    scrapeAndExport
};
