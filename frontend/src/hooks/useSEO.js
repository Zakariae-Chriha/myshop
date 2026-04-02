import { useEffect } from 'react';

const useSEO = ({ title, description }) => {
  useEffect(() => {
    // Title
    document.title = title ? `${title} | DigitalShop` : 'DigitalShop — Premium Digital & Physical Products';

    // Description meta
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description || 'DigitalShop — Buy premium digital and physical products. Fast delivery, secure payment, GDPR compliant.';
  }, [title, description]);
};

export default useSEO;
