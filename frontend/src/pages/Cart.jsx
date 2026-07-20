import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal } = useApp();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : (subtotal > 0 ? 10 : 0);
  const tax = subtotal * 0.05; // 5% simulated tax
  const grandTotal = subtotal + shipping + tax;

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-br from-indigo-50/20 via-white to-blue-50/20">
        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-8 max-w-md text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={36} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Your cart is empty</h2>
          <p className="text-sm text-gray-400 mb-8 max-w-xs leading-relaxed">
            Looks like you haven't added anything to your cart yet. Head back to the store to explore our catalog.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div 
                key={item.product.id} 
                className="bg-white rounded-2xl border border-gray-100 hover:border-blue-100/50 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-sm hover:shadow transition-all duration-300 relative"
              >
                {/* Product Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                  <img 
                    src={item.product.image_url} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-grow text-center sm:text-left min-w-0">
                  <Link 
                    to={`/product/${item.product.id}`}
                    className="text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors line-clamp-1 block cursor-pointer"
                  >
                    {item.product.name}
                  </Link>
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase mt-0.5 inline-block">
                    {item.product.category}
                  </span>
                  <div className="text-sm font-bold text-blue-600 mt-1 sm:hidden">
                    ${item.product.price.toFixed(2)}
                  </div>
                </div>

                {/* Price (Large Screen) */}
                <div className="hidden sm:block text-right flex-shrink-0 pr-4">
                  <span className="text-xs text-gray-400 font-medium block">Price</span>
                  <span className="text-sm font-bold text-gray-800">${item.product.price.toFixed(2)}</span>
                </div>

                {/* Actions: Quantity picker & Remove */}
                <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-xs font-bold text-gray-800 min-w-[28px] text-center">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors mt-2"
            >
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
          </div>

          {/* Right: Order Summary */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-gray-800 tracking-tight pb-3 border-b border-gray-100">
              Order Summary
            </h3>

            <div className="space-y-3.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-semibold text-gray-700">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Shipping</span>
                <span className="font-semibold text-gray-700">
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated Tax (5%)</span>
                <span className="font-semibold text-gray-700">${tax.toFixed(2)}</span>
              </div>
            </div>

            {shipping > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                💡 Add <strong>${(100 - subtotal).toFixed(2)}</strong> more to unlock <strong>FREE Shipping</strong>!
              </div>
            )}

            <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-800">Grand Total</span>
              <span className="text-2xl font-black text-gray-900">${grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300 mt-4 cursor-pointer"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
