import { useEffect } from 'react';

const setMeta = (selector, attr, value) => {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [key, val] = attr.split('=');
    el.setAttribute(key, val.replace(/"/g, ''));
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

const useSEO = ({ title, description, image } = {}) => {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ZC Brands`
      : 'ZC Brands — Selected German Quality';
    const desc = description ||
      'ZC Brands — Selected German Quality. Buy premium digital and physical products. Fast delivery, secure payment, GDPR compliant.';
    const img = image || `${window.location.origin}/logo.png`;
    const url = window.location.href;

    document.title = fullTitle;

    // Standard meta
    setMeta('meta[name="description"]', 'name=description', desc);

    // Open Graph
    setMeta('meta[property="og:title"]',       'property=og:title',       fullTitle);
    setMeta('meta[property="og:description"]',  'property=og:description',  desc);
    setMeta('meta[property="og:image"]',        'property=og:image',        img);
    setMeta('meta[property="og:url"]',          'property=og:url',          url);
    setMeta('meta[property="og:type"]',         'property=og:type',         'website');
    setMeta('meta[property="og:site_name"]',    'property=og:site_name',    'ZC Brands');

    // Twitter Card
    setMeta('meta[name="twitter:card"]',        'name=twitter:card',        'summary_large_image');
    setMeta('meta[name="twitter:title"]',       'name=twitter:title',       fullTitle);
    setMeta('meta[name="twitter:description"]', 'name=twitter:description', desc);
    setMeta('meta[name="twitter:image"]',       'name=twitter:image',       img);
  }, [title, description, image]);
};

export default useSEO;
