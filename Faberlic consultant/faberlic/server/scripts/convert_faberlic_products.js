const fs = require('fs');
const path = require('path');

// CSV Template headers
const CSV_HEADERS = [
  'name',
  'sku',
  'imageUrl',
  'catalogPrice',
  'salePrice',
  'categorySlug',
  'subCategorySlug',
  'childCategorySlug',
  'description',
  'inStock',
  'isDiscount'
];

function jsonToCsv(products, outputPath = 'faberlic_products.csv') {
  // Create CSV rows
  const csvRows = [
    CSV_HEADERS.join(','), // Header row
    ...products.map(product => {
      // Escape commas and quotes in fields
      const escapeField = (field) => {
        if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field ?? '';
      };

      // Map product to CSV fields (you may need to adjust based on actual Faberlic JSON structure!)
      return CSV_HEADERS.map(header => {
        switch (header) {
          case 'name':
            return escapeField(product.name || product.title || '');
          case 'sku':
            return escapeField(product.sku || product.artikul || product.article || '');
          case 'imageUrl':
            return escapeField(product.imageUrl || product.image || product.photo || '');
          case 'catalogPrice':
            return product.catalogPrice || product.price_catalog || product.originalPrice || product.price || 0;
          case 'salePrice':
            return product.salePrice || product.price_sale || product.price || 0;
          case 'categorySlug':
            return escapeField(product.categorySlug || '');
          case 'subCategorySlug':
            return escapeField(product.subCategorySlug || '');
          case 'childCategorySlug':
            return escapeField(product.childCategorySlug || '');
          case 'description':
            return escapeField(product.description || product.about || '');
          case 'inStock':
            return product.inStock !== false ? 'true' : 'false';
          case 'isDiscount':
            return product.isDiscount || (product.catalogPrice && product.salePrice && product.salePrice < product.catalogPrice) ? 'true' : 'false';
          default:
            return '';
        }
      }).join(',');
    })
  ];

  // Write CSV to file
  fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf8');
  console.log(`✅ CSV created successfully at: ${path.resolve(outputPath)}`);
}

// Example: If you have a faberlic_products.json file, uncomment below:
// const rawData = fs.readFileSync('faberlic_products.json', 'utf8');
// const products = JSON.parse(rawData);
// jsonToCsv(products);

console.log('📝 CSV converter ready!');
console.log('1. Create a "faberlic_products.json" file with your product data');
console.log('2. Uncomment the example code at the bottom');
console.log('3. Run: node server/scripts/convert_faberlic_products.js');