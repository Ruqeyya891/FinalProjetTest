const axios = require('axios');
const cheerio = require('cheerio');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const Product = require('../models/Product');

// Helper to extract numbers from string
const extractNumber = (str) => {
  if (!str) return 0;
  const match = str.replace(',', '.').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

// Scrape Faberlic products from a catalog link
const scrapeFaberlicCatalog = async (catalogUrl) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const allProducts = [];
  let currentPage = 1;
  let hasNextPage = true;

  try {
    console.log(`Scraping Faberlic catalog from ${catalogUrl}...`);

    while (hasNextPage) {
      console.log(`Processing page ${currentPage}...`);

      let pageUrl = catalogUrl;
      if (currentPage > 1) {
        // Handle pagination (adjust selector based on actual Faberlic site)
        if (pageUrl.includes('?')) {
          pageUrl += `&page=${currentPage}`;
        } else {
          pageUrl += `?page=${currentPage}`;
        }
      }

      console.log(`Navigating to: ${pageUrl}`);
      await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3000); // Wait for JS to load

      // Extract products from current page
      const productsOnPage = await page.evaluate(() => {
        const products = [];
        
        // Common Faberlic selectors
        const productCards = document.querySelectorAll(
          '.catalog-item, .goods__item, .product, .item, [class*="catalog__item"], [class*="goods-item"]'
        );
        
        console.log(`Found ${productCards.length} product cards on page`);
        
        productCards.forEach(card => {
          let sku = '';
          let name = '';
          let catalogPrice = 0;
          let salePrice = 0;
          let discountPercent = 0;
          let image = '';

          // Try to find SKU
          const skuEl = card.querySelector('[data-sku], [class*="sku"], [class*="article"], [class*="artikul"], .item__sku');
          if (skuEl) {
            sku = skuEl.dataset.sku || skuEl.textContent.trim();
          }

          // Try to find product name
          const nameEl = card.querySelector('.item__title, .product__title, .catalog-item__title, [class*="title"], [class*="name"]');
          if (nameEl) name = nameEl.textContent.trim();

          // Try to find prices
          const priceEls = card.querySelectorAll('.price, .item__price, .catalog-item__price, [class*="price"]');
          let prices = [];
          priceEls.forEach(el => {
            const text = el.textContent.trim();
            if (text) {
              const num = parseFloat(text.replace(',', '.').replace(/[^\d.,]/g, ''));
              if (!isNaN(num)) {
                prices.push(num);
              }
            }
          });
          if (prices.length >= 2) {
            catalogPrice = prices[0];
            salePrice = prices[1];
          } else if (prices.length === 1) {
            catalogPrice = prices[0];
            salePrice = prices[0];
          }

          // Try to find discount
          const discountEl = card.querySelector('.discount, .item__discount, .sale, [class*="discount"], [class*="sale"]');
          if (discountEl) {
            const text = discountEl.textContent.trim();
            discountPercent = parseInt(text.replace(/[^\d]/g, ''));
          }

          // Try to find image
          const imgEl = card.querySelector('img');
          if (imgEl) {
            image = imgEl.src || imgEl.dataset.src || imgEl.getAttribute('data-src') || '';
          }

          if (name) { // If at least name is found, include it (even if SKU is missing)
            products.push({ sku, name, catalogPrice, salePrice, discountPercent, image });
          }
        });

        return products;
      });

      console.log(`Found ${productsOnPage.length} products on page ${currentPage}`);
      
      if (currentPage === 1 && productsOnPage.length === 0) {
        await browser.close();
        return { success: false, message: "Məhsul kartları tapılmadı", products: [] };
      }
      
      allProducts.push(...productsOnPage);

      // Check if there's a next page (Faberlic common selectors)
      hasNextPage = await page.evaluate(() => {
        const nextBtn = document.querySelector(
          '.pagination__next, .next-page, [class*="next"], a[rel="next"], [aria-label*="next"], .btn-next'
        );
        return !!nextBtn && !nextBtn.disabled && !nextBtn.classList.contains('disabled');
      });

      currentPage++;
    }

    console.log(`Scraping complete! Found ${allProducts.length} products from ${currentPage - 1} pages`);
    await browser.close();

    return { 
      success: true, 
      products: allProducts, 
      pageCount: currentPage - 1 
    };

  } catch (error) {
    console.error('Scraping error:', error);
    await browser.close();
    return { success: false, error: error.message };
  }
};

// Generate Excel file from scraped products
const generateExcelFromProducts = (products, fileName = 'faberlic_products.xlsx') => {
  try {
    const worksheetData = products.map(p => ({
      'SKU': p.sku,
      'Məhsul adı': p.name,
      'Kataloq qiyməti': p.catalogPrice,
      'Endirim': p.discountPercent + '%',
      'Satış qiyməti': p.salePrice,
      'Şəkil': p.image
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Məhsullar');

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    XLSX.writeFile(workbook, filePath);

    return { success: true, filePath, fileName };
  } catch (error) {
    console.error('Excel generation error:', error);
    return { success: false, error: error.message };
  }
};

// Original parse function (keep for compatibility)
const parseFaberlicProducts = async (categoryUrl) => {
  try {
    console.log(`Parsing products from ${categoryUrl}...`);
    
    // Mocked parsed data
    const mockProducts = [
      {
        name: 'Oksigenli Göz Kremi',
        description: 'Göz ətrafı qırışları azaldır.',
        price_catalog: 12.50,
        price_anbar: 9.00,
        price_sale: 10.50,
        category: 'QULLUQ',
        image: 'https://images.unsplash.com/photo-1594465919760-441fe5908ab0',
        sku: 'FAB-001',
        stock: 100,
        ingredients: 'Aqua, Oxygen, Vitamins',
        usage: 'Gündə 2 dəfə göz ətrafına çəkin.',
        isActive: true
      },
      {
        name: 'Expert Bərpaedici Mask',
        description: 'Saçları dərindən bərpa edir.',
        price_catalog: 18.00,
        price_anbar: 13.50,
        price_sale: 15.00,
        category: 'MAKIYAJ',
        image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f',
        sku: 'FAB-002',
        stock: 50,
        ingredients: 'Keratin, Oils',
        usage: 'Saçda 10 dəqiqə saxlayın və yuyun.',
        isActive: true
      }
    ];

    for (const prod of mockProducts) {
      await Product.findOneAndUpdate(
        { sku: prod.sku },
        prod,
        { upsert: true, new: true }
      );
    }

    return { success: true, count: mockProducts.length };
  } catch (error) {
    console.error('Scraping error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { parseFaberlicProducts, scrapeFaberlicCatalog, generateExcelFromProducts };
