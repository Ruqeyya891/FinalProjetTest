const mongoose = require('mongoose');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { categories } = require('../utils/categories');

// Load environment variables
require('dotenv').config();

async function importProductsFromCSV(filePath) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read and parse CSV
    const csvFile = fs.readFileSync(filePath, 'utf8');
    const results = Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    });

    console.log(`📝 Parsed ${results.data.length} products from CSV`);

    const importedProducts = [];
    const errors = [];

    for (const row of results.data) {
      try {
        // Map CSV fields to product model
        const productData = {
          name: row.name || row.ad || '',
          sku: row.sku || row.artikul || row.article || '',
          description: row.description || row.aciklama || '',
          ingredients: row.ingredients || row.terkib || '',
          usage: row.usage || row.istifade || '',
          image: row.imageurl || row.image || row.photo || row.sekil || '',
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
        console.log(`✅ Imported: ${savedProduct.name}`);
      } catch (err) {
        console.error(`❌ Error importing row:`, err.message);
        errors.push({ row: row, error: err.message });
      }
    }

    console.log(`\n🎉 Import complete!`);
    console.log(`✅ Successfully imported: ${importedProducts.length}`);
    if (errors.length > 0) {
      console.log(`❌ Failed to import: ${errors.length}`);
      console.log('Errors:', errors);
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Import failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Usage: node server/scripts/importProducts.js <csv-file-path>
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('❌ Please provide a CSV file path');
  console.log('Usage: node server/scripts/importProducts.js <csv-file-path>');
  process.exit(1);
}

const resolvedPath = path.resolve(csvPath);
console.log(`📂 Loading CSV from: ${resolvedPath}`);
importProductsFromCSV(resolvedPath);