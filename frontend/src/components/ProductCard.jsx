import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const name  = product.name?.en || product.name || 'Product';
  const image = product.images?.[0];
  const isDigital = product.productType === 'digital';

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const renderStars = (rating = 0) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  return (
    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Image */}
        <div style={{
          height: 180,
          background: isDigital
            ? 'linear-gradient(135deg, #EEF0FF 0%, #C7D2FE 100%)'
            : 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {image ? (
            <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '3.5rem' }}>
              {isDigital ? '💻' : '📦'}
            </span>
          )}

          {/* Badge */}
          <span className={`badge ${isDigital ? 'badge-digital' : 'badge-physical'}`}
            style={{ position: 'absolute', top: 10, left: 10 }}>
            {isDigital ? '⚡ Digital' : '📦 Physical'}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontSize: '0.75rem', color: '#6B7280',
            marginBottom: '0.25rem', textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {product.category?.name?.en || 'Uncategorized'}
          </div>

          <h4 style={{
            fontSize: '0.95rem', fontWeight: 600,
            color: '#111827', marginBottom: '0.35rem',
            lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {name}
          </h4>

          {/* Stars */}
          <div style={{ marginBottom: '0.5rem' }}>
            <span className="stars">{renderStars(product.averageRating)}</span>
            <span style={{ fontSize: '0.75rem', color: '#6B7280', marginLeft: 4 }}>
              ({product.numReviews || 0})
            </span>
          </div>

          {/* Price + Add button */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginTop: 'auto',
          }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6C63FF' }}>
                €{(product.priceWithVAT || product.price * 1.19).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                incl. 19% VAT
              </div>
            </div>

            <button onClick={handleAdd} className="btn btn-primary btn-sm">
              + Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;