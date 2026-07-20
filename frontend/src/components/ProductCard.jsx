import React from 'react';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useApp();

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden relative">
      {/* Category Tag */}
      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[10px] font-extrabold px-2.5 py-1 rounded-full text-blue-600 uppercase tracking-wider shadow-sm z-10 border border-gray-100">
        {product.category}
      </span>

      {/* Stock warning */}
      {product.stock <= 5 && product.stock > 0 && (
        <span className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
          Only {product.stock} left
        </span>
      )}
      {product.stock === 0 && (
        <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
          Out of stock
        </span>
      )}

      {/* Product Image */}
      <div className="relative pt-[100%] overflow-hidden bg-gray-50 flex items-center justify-center">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Quick View Button overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link 
            to={`/product/${product.id}`}
            className="p-2.5 bg-white text-gray-800 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-300 shadow-md hover:scale-110"
          >
            <Eye size={18} />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-1 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className={i < 4 ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
          ))}
          <span className="text-[10px] text-gray-400 font-medium ml-1">(4.0)</span>
        </div>

        <Link 
          to={`/product/${product.id}`}
          className="text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 min-h-[40px] mb-2 cursor-pointer"
        >
          {product.name}
        </Link>

        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div>
            <span className="text-xs text-gray-400 font-medium block">Price</span>
            <span className="text-lg font-black text-gray-900">${product.price.toFixed(2)}</span>
          </div>

          <button
            onClick={() => product.stock > 0 && addToCart(product, 1)}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-xl transition-all duration-300 shadow-sm ${
              product.stock > 0 
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={product.stock > 0 ? "Add to Cart" : "Out of stock"}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
