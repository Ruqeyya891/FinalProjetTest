const slugify = (text) => {
  if (!text) return '';
  const azChars = {
    'ə': 'e', 'ı': 'i', 'ö': 'o', 'ü': 'u', 'ğ': 'g', 'ş': 's', 'ç': 'c',
    'Ə': 'E', 'İ': 'I', 'Ö': 'O', 'Ü': 'U', 'Ğ': 'G', 'Ş': 'S', 'Ç': 'C'
  };
  return text
    .toLowerCase()
    .split('')
    .map(char => azChars[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

module.exports = slugify;
