const { chromium } = require('playwright');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { categories } = require('../utils/categories');
require('dotenv').config();

const PRODUCT_URL = 'https://faberlic.com/az/az/product/010501-093795?sponsornumber=745888604';

async function scrapeProduct() {
  console.log('🚀 Starting browser...');
  const browser = await chromium.launch({ headless: false }); // Headless false to see what's happening
  const page = await browser.newPage();

  try {
    console.log('🌐 Navigating to product page...');
    await page.goto(PRODUCT_URL, { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for key elements to load
    console.log('⏳ Waiting for page elements to load...');
    
    // Function to safely get text with selector and log errors
    const safeGetText = async (selector, name) => {
      try {
        await page.waitForSelector(selector, { timeout: 10000 });
        const text = await page.locator(selector).first().innerText();
        console.log(`✅ ${name} found:`, text.trim());
        return text.trim();
      } catch (e) {
        console.error(`❌ ${name} not found with selector:`, selector);
        return '';
      }
    };

    const safeGetAttribute = async (selector, attr, name) => {
      try {
        await page.waitForSelector(selector, { timeout: 10000 });
        const value = await page.locator(selector).first().getAttribute(attr);
        console.log(`✅ ${name} found:`, value);
        return value;
      } catch (e) {
        console.error(`❌ ${name} not found with selector:`, selector);
        return '';
      }
    };

    // Step 1: Get product name
    const name = await safeGetText('h1', 'Product Name');

    // Step 2: Get SKU/Article (from URL or page)
    const urlSku = PRODUCT_URL.match(/product\/([^?]+)/)?.[1] || '';
    console.log('✅ SKU from URL:', urlSku);
    const sku = await safeGetText('[data-sku], .sku, [class*="article"]', 'SKU') || urlSku;

    // Step 3: Get prices
    // Try common price selectors
    let salePrice = 0;
    let catalogPrice = 0;
    try {
      // Try to find sale price (usually discounted price)
      const salePriceText = await safeGetText('.price__current, .sale-price, [class*="price-discount"], .discount-price', 'Sale Price');
      // Try catalog price (original price)
      const catalogPriceText = await safeGetText('.price__old, .old-price, [class*="price-original"]', 'Catalog Price');
      
      // Parse numbers (remove non-digit/decimal characters)
      const parsePrice = (text) => {
        const match = text.replace(',', '.').match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
      };
      
      salePrice = parsePrice(salePriceText);
      catalogPrice = parsePrice(catalogPriceText) || salePrice;
      console.log('✅ Parsed Prices - Sale:', salePrice, 'Catalog:', catalogPrice);
    } catch (e) {
      console.error('❌ Error getting prices:', e);
    }

    // Step 4: Get main image
    const imageUrl = await safeGetAttribute('img.product-image, .product-main-image img, [class*="product-photo"] img', 'src', 'Image URL');

    // Step 5: Get breadcrumbs for categories
    let breadcrumbs = [];
    try {
      await page.waitForSelector('.breadcrumbs, .breadcrumb, [class*="breadcrumbs"]', { timeout: 10000 });
      breadcrumbs = await page.locator('.breadcrumbs a, .breadcrumb a, [class*="breadcrumbs"] a').allTextContents();
      console.log('✅ Breadcrumbs found:', breadcrumbs);
    } catch (e) {
      console.error('❌ Breadcrumbs not found');
    }

    // Step 6: Get description, ingredients, usage
    // Try to find these in tabs or sections
    const description = await safeGetText('.product-description, [class*="description"]', 'Description');
    const ingredients = await safeGetText('.product-ingredients, [class*="ingredient"], .composition', 'Ingredients');
    const usage = await safeGetText('.product-usage, [class*="usage"], .how-to-use', 'Usage');

    // Collect all data
    const scrapedData = {
      name,
      sku,
      salePrice,
      catalogPrice,
      imageUrl,
      description,
      ingredients,
      usage,
      breadcrumbs
    };

    console.log('\n🎉 Scraped Data Complete:');
    console.log(JSON.stringify(scrapedData, null, 2));

    // Now map to Product model and save to database
    console.log('\n💾 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Try to find category slugs from breadcrumbs
    let categorySlug = '';
    let subCategorySlug = '';
    let childCategorySlug = '';
    let categoryName = '';
    let subCategoryName = '';
    let childCategoryName = '';

    // Helper to find category by name or slug
    const findCategoryInData = (name) => {
      const normalized = name.toLowerCase().trim();
      for (const cat of categories) {
        if (cat.name.toLowerCase() === normalized || cat.slug === normalized) {
          return cat;
        }
        for (const sub of cat.subCategories || []) {
          if (sub.name.toLowerCase() === normalized || sub.slug === normalized) {
            return { ...sub, parent: cat };
          }
          for (const child of sub.childCategories || []) {
            if (child.name.toLowerCase() === normalized || child.slug === normalized) {
              return { ...child, parent: cat, sub: sub };
            }
          }
        }
      }
      return null;
    };

    // Map breadcrumbs to category structure
    for (let i = 0; i < breadcrumbs.length; i++) {
      const crumb = breadcrumbs[i].trim();
      if (!crumb) continue;
      
      const match = findCategoryInData(crumb);
      if (match) {
        if (match.parent && match.sub) {
          // It's a child category
          categoryName = match.parent.name;
          categorySlug = match.parent.slug;
          subCategoryName = match.sub.name;
          subCategorySlug = match.sub.slug;
          childCategoryName = match.name;
          childCategorySlug = match.slug;
        } else if (match.parent) {
          // It's a subcategory
          categoryName = match.parent.name;
          categorySlug = match.parent.slug;
          subCategoryName = match.name;
          subCategorySlug = match.slug;
        } else {
          // It's a main category
          categoryName = match.name;
          categorySlug = match.slug;
        }
      }
    }

    // Create product data
    const productData = {
      name: scrapedData.name,
      sku: scrapedData.sku,
      description: scrapedData.description,
      ingredients: scrapedData.ingredients,
      usage: scrapedData.usage,
      image: scrapedData.imageUrl,
      price_catalog: scrapedData.catalogPrice,
      price_sale: scrapedData.salePrice,
      stock: 0, // Default since no stock info
      categoryName,
      categorySlug,
      subCategoryName,
      subCategorySlug,
      childCategoryName,
      childCategorySlug,
      isInStock: true,
      isNew: false,
      isDiscount: scrapedData.catalogPrice > scrapedData.salePrice,
      isSuperPrice: false,
      isHit: false,
      isActive: true
    };

    console.log('\n📦 Product Data for Save:');
    console.log(JSON.stringify(productData, null, 2));

    // Save to database
    console.log('\n💾 Saving product to database...');
    const product = new Product(productData);
    const savedProduct = await product.save();
    console.log('✅ Product saved successfully! ID:', savedProduct._id);

  } catch (error) {
    console.error('\n❌ Scraping failed with error:', error);
  } finally {
    console.log('\n🔌 Closing browser...');
    await browser.close();
    await mongoose.disconnect();
    console.log('✅ Done!');
  }
}

// Run the scraper
scrapeProduct();
