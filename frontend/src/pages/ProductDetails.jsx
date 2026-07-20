import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { Star, ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw, Plus, Minus } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError('Product not found or network error');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product, quantity);
      alert(`${quantity} x ${product.name} added to cart successfully!`);
    }
  };

  const handleBuyNow = () => {
    if (product && product.stock > 0) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 text-red-700 p-8 rounded-3xl border border-red-100 shadow-sm inline-block">
          <p className="font-bold text-lg mb-4">{error || 'Product not found'}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow transition-colors">
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to previous page
        </button>

        {/* Product Card Container */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Left: Product Image */}
          <div className="relative pt-[100%] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Right: Info and Actions */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category tag */}
              <span className="inline-block bg-blue-50 text-blue-600 text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider border border-blue-100 mb-4">
                {product.category}
              </span>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                {product.name}
              </h1>

              {/* Ratings */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < 4 ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                ))}
                <span className="text-xs text-gray-400 font-semibold ml-2">(4.0 out of 5 from 42 verified reviews)</span>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
                <span className="text-xs text-gray-400 font-bold block mb-1">Selling Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900">${product.price.toFixed(2)}</span>
                  <span className="text-sm text-gray-400 line-through">${(product.price * 1.25).toFixed(2)}</span>
                  <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">20% OFF</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Overview</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Stock Status & Quantity Picker */}
              <div className="flex items-center gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Availability</h3>
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                      In Stock ({product.stock} units)
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                      Sold Out
                    </span>
                  )}
                </div>

                {product.stock > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Quantity</h3>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                      <button 
                        onClick={handleDecrement}
                        className="p-2 hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 text-sm font-bold text-gray-800 min-w-[40px] text-center">
                        {quantity}
                      </span>
                      <button 
                        onClick={handleIncrement}
                        className="p-2 hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              {product.stock > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow"
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Buy It Now
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-6 rounded-xl bg-gray-100 text-gray-400 font-bold cursor-not-allowed text-center"
                >
                  Out of Stock
                </button>
              )}

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-gray-100 text-center">
                <div className="flex flex-col items-center">
                  <ShieldCheck size={18} className="text-blue-600 mb-1" />
                  <span className="text-[10px] font-bold text-gray-700">Secured Checkout</span>
                </div>
                <div className="flex flex-col items-center">
                  <Truck size={18} className="text-blue-600 mb-1" />
                  <span className="text-[10px] font-bold text-gray-700">Free Express Delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw size={18} className="text-blue-600 mb-1" />
                  <span className="text-[10px] font-bold text-gray-700">30-Day Easy Returns</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
