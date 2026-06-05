const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const { categories, slugify } = require('./categories');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/faberlic';

// Function to guess category slugs from existing product data
const guessCategorySlugs = (product) => {
  const categoryName = product.category?.toUpperCase();
  let categorySlug = '';
  let subCategorySlug = '';
  let childCategorySlug = '';

  // Find main category
  const mainCat = categories.find(c => c.name.toUpperCase() === categoryName);
  if (mainCat) {
    categorySlug = mainCat.slug;

    // Try to find subcategory
    for (const subCat of mainCat.subCategories) {
      if (product.description?.includes(subCat.name) || product.name?.includes(subCat.name)) {
        subCategorySlug = subCat.slug;

        // Try to find child category
        for (const childCat of subCat.childCategories) {
          if (product.description?.includes(childCat.name) || product.name?.includes(childCat.name)) {
            childCategorySlug = childCat.slug;
            break;
          }
        }
        break;
      }
    }
  }

  // If we couldn't find, try to match based on common keywords
  if (!categorySlug) {
    if (product.category?.includes('SAÇ') || product.category?.includes('ŞAMPUN')) {
      categorySlug = 'qulluq';
      subCategorySlug = 'saclar';
      if (product.name?.includes('ŞAMPUN') || product.category?.includes('ŞAMPUN')) {
        childCategorySlug = 'sampunlar';
      }
    } else if (product.category?.includes('MAKYAJ')) {
      categorySlug = 'makiyaj';
    }
  }

  return { categorySlug, subCategory: '', subCategorySlug, childCategory: '', childCategorySlug };
};

// Run migration
const migrate = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');

    console.log('Fetching products...');
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);

    let updatedCount = 0;

    for (const product of products) {
      const slugs = guessCategorySlugs(product);
      
      // Only update if we found something or if the fields are missing
      if (!product.categorySlug || slugs.categorySlug) {
        await Product.findByIdAndUpdate(product._id, {
          ...slugs,
          category: product.category || 'QULLUQ'
        });
        updatedCount++;
        console.log(`Updated product: ${product.name}`);
      }
    }

    console.log(`Migration complete! Updated ${updatedCount} products`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
