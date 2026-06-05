const axios = require('axios');
// For a real scraper, we would use cheerio or puppeteer.
// Since we don't have them installed and they are heavy, I'll create a mock scraper
// that simulates fetching data from Faberlic and saving it to our DB.

const Product = require('../models/Product');

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

module.exports = { parseFaberlicProducts };
