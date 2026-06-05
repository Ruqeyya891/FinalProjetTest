const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { categories } = require('../utils/categories');
require('dotenv').config();

const PRODUCT_URL = 'https://faberlic.com/az/az/product/010501-093795?sponsornumber=745888604';

async function scrapeProductWithCheerio() {
  console.log('🚀 Starting Cheerio scraper...');
  try {
    console.log('🌐 Fetching product page...');
    // Set user agent to mimic browser
    const response = await axios.get(PRODUCT_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 30000
    });
    console.log('✅ Page fetched successfully!');

    const $ = cheerio.load(response.data);

    // Helper to get text safely
    const safeGetText = (selector, name) => {
      const el = $(selector).first();
      if (el.length) {
        const text = el.text().trim();
        console.log(`✅ ${name} found:`, text);
        return text;
      }
      console.error(`❌ ${name} not found with selector:`, selector);
      return '';
    };

    const safeGetAttr = (selector, attr, name) => {
      const el = $(selector).first();
      if (el.length) {
        const value = el.attr(attr);
        console.log(`✅ ${name} found:`, value);
        return value || '';
      }
      console.error(`❌ ${name} not found with selector:`, selector);
      return '';
    };

    // Step 1: Product name
    const name = safeGetText('h1', 'Product Name');

    // Step 2: SKU
    const urlSku = PRODUCT_URL.match(/product\/([^?]+)/)?.[1] || '';
    console.log('✅ SKU from URL:', urlSku);
    const sku = safeGetText('[data-sku], .sku, [class*="article"]', 'SKU') || urlSku;

    // Step 3: Prices
    let salePrice = 0;
    let catalogPrice = 0;
    const parsePrice = (text) => {
      if (!text) return 0;
      const match = text.replace(',', '.').match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    const salePriceText = safeGetText('.price__current, .sale-price, [class*="price-discount"], .discount-price', 'Sale Price');
    const catalogPriceText = safeGetText('.price__old, .old-price, [class*="price-original"]', 'Catalog Price');
    
    salePrice = parsePrice(salePriceText);
    catalogPrice = parsePrice(catalogPriceText) || salePrice;
    console.log('✅ Parsed Prices - Sale:', salePrice, 'Catalog:', catalogPrice);

    // Step 4: Image URL
    let imageUrl = safeGetAttr('img.product-image, .product-main-image img, [class*="product-photo"] img', 'src', 'Image URL');
    // Make sure image URL is absolute
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = new URL(imageUrl, PRODUCT_URL).href;
    }

    // Step 5: Breadcrumbs
    let breadcrumbs = [];
    const breadcrumbEls = $('.breadcrumbs a, .breadcrumb a, [class*="breadcrumbs"] a');
    if (breadcrumbEls.length) {
      breadcrumbs = breadcrumbEls.map((i, el) => $(el).text().trim()).get().filter(Boolean);
      console.log('✅ Breadcrumbs found:', breadcrumbs);
    } else {
      console.error('❌ Breadcrumbs not found');
    }

    // Step 6: Description, Ingredients, Usage
    const description = safeGetText('.product-description, [class*="description"]', 'Description');
    const ingredients = safeGetText('.product-ingredients, [class*="ingredient"], .composition', 'Ingredients');
    const usage = safeGetText('.product-usage, [class*="usage"], .how-to-use', 'Usage');

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

    // Map to Product model and save to database
    console.log('\n💾 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Map categories
    let categorySlug = '';
    let subCategorySlug = '';
    let childCategorySlug = '';
    let categoryName = '';
    let subCategoryName = '';
    let childCategoryName = '';

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

    for (let i = 0; i < breadcrumbs.length; i++) {
      const crumb = breadcrumbs[i].trim();
      if (!crumb) continue;
      
      const match = findCategoryInData(crumb);
      if (match) {
        if (match.parent && match.sub) {
          categoryName = match.parent.name;
          categorySlug = match.parent.slug;
          subCategoryName = match.sub.name;
          subCategorySlug = match.sub.slug;
          childCategoryName = match.name;
          childCategorySlug = match.slug;
        } else if (match.parent) {
          categoryName = match.parent.name;
          categorySlug = match.parent.slug;
          subCategoryName = match.name;
          subCategorySlug = match.slug;
        } else {
          categoryName = match.name;
          categorySlug = match.slug;
        }
      }
    }

    const productData = {
      name: scrapedData.name,
      sku: scrapedData.sku,
      description: scrapedData.description,
      ingredients: scrapedData.ingredients,
      usage: scrapedData.usage,
      image: scrapedData.imageUrl,
      price_catalog: scrapedData.catalogPrice,
      price_sale: scrapedData.salePrice,
      stock: 0,
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

    console.log('\n💾 Saving product to database...');
    const product = new Product(productData);
    const savedProduct = await product.save();
    console.log('✅ Product saved successfully! ID:', savedProduct._id);

  } catch (error) {
    console.error('\n❌ Cheerio scraping failed:', error.message);
    console.error('Full error:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data?.substring(0, 500));
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Done!');
  }
}

scrapeProductWithCheerio();
