import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Hero from '../components/home/Hero';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { defaultProducts } from '../data/defaultProducts';
import { ArrowUpDown, Flame, Sparkles, Gift, Truck, ShieldCheck, Headset, RotateCcw, Star } from 'lucide-react';

// Subcomponent: Services Section
const ServicesGrid = () => {
  const services = [
    {
      icon: <Truck size={20} className="text-blue-600" />,
      title: "Free Shipping",
      desc: "On all order amounts above $50"
    },
    {
      icon: <ShieldCheck size={20} className="text-emerald-600" />,
      title: "Secure Checkout",
      desc: "Protected by Stripe gateway"
    },
    {
      icon: <Headset size={20} className="text-indigo-600" />,
      title: "24/7 Live Support",
      desc: "Dedicated assistant helpline"
    },
    {
      icon: <RotateCcw size={20} className="text-rose-600" />,
      title: "Easy Returns",
      desc: "30-day money-back guarantee"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 mt-6">
      {services.map((s, idx) => (
        <div 
          key={idx} 
          className="bg-white border border-gray-100/80 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="p-3 bg-gray-50 rounded-xl flex-shrink-0">
            {s.icon}
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-gray-900 leading-tight">{s.title}</h4>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Subcomponent: Customer Feedback
const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: "Aarav Sharma",
      role: "Verified Buyer",
      rating: 5,
      comment: "Incredibly fast shipping and secure checkout. The Vertex Phone 15 Pro I bought is absolutely original and premium!",
      avatar: "AS"
    },
    {
      id: 2,
      name: "Meera Patel",
      role: "Interior Designer",
      rating: 5,
      comment: "I purchased the Mid-Century Lounge Chair. The wood finish is solid and the assembly was a breeze. Highly recommended!",
      avatar: "MP"
    },
    {
      id: 3,
      name: "Karan Singhal",
      role: "Regular Customer",
      rating: 4,
      comment: "Superb product choices. Customer helpline helped me immediately update my shipment address. Will order again soon.",
      avatar: "KS"
    }
  ];

  return (
    <div className="mt-16 mb-12">
      <div className="text-center mb-8">
        <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Customer Reviews</h2>
        <p className="text-xs text-gray-500 mt-1 font-medium">Hear stories from our satisfied buyers worldwide</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r) => (
          <div 
            key={r.id} 
            className="bg-white border border-gray-100/70 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Rating stars */}
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={`${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              <p className="text-xs leading-relaxed text-gray-600 italic">"{r.comment}"</p>
            </div>
            
            <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-[10px] uppercase">
                {r.avatar}
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-gray-900 leading-tight">{r.name}</h5>
                <span className="text-[9px] font-bold text-gray-400">{r.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Subcomponent for horizontal sliders
const ProductSlider = ({ title, products, icon }) => {
  if (products.length === 0) return null;
  
  return (
    <div className="mb-10 bg-white border border-gray-100/80 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
        <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
          Swipe ➔
        </span>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory hide-scrollbar">
        {products.map((product) => (
          <div key={product.id} className="snap-center min-w-[260px] max-w-[260px] flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const url = search ? `/products?search=${encodeURIComponent(search)}` : '/products';
        const data = await api.get(url);
        setProducts(data);
      } catch (err) {
        console.error(err);
        // Fallback filter using defaultProducts if API fails
        if (search) {
          const lower = search.toLowerCase();
          const words = lower.split(/\s+/).filter(Boolean);
          const filtered = defaultProducts.filter(p => {
            const name = p.name.toLowerCase();
            const desc = (p.description || '').toLowerCase();
            const cat = (p.category || '').toLowerCase();
            return words.some(w => name.includes(w) || desc.includes(w) || cat.includes(w));
          }).sort((a, b) => {
            const aInName = words.filter(w => a.name.toLowerCase().includes(w)).length;
            const bInName = words.filter(w => b.name.toLowerCase().includes(w)).length;
            return bInName - aInName;
          });
          setProducts(filtered);
        } else {
          setProducts(defaultProducts);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search]);

  // Sort logic
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // featured (default)
  });

  // Section classifications
  const trendingProducts = products.filter((p) => p.tag === 'trending');
  const offerProducts = products.filter((p) => p.tag === 'offer');
  const newProducts = products.filter((p) => p.tag === 'new');

  return (
    <div className="relative pb-16 bg-gray-50/50">
      {/* Banner slider - Hide when searching */}
      {!search && <Hero />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Assurances Section - Hide when searching */}
        {!search && <ServicesGrid />}

        {/* FLIPKART STYLE SECTIONS: Only display on standard home page without search query */}
        {!search && !loading && (
          <div className="mt-4">
            {/* Section 1: Suggested For You / Trending */}
            <ProductSlider 
              title="Suggested For You" 
              products={trendingProducts} 
              icon={<Flame size={18} className="text-orange-500 fill-orange-500" />} 
            />

            {/* Section 2: Trending Offers */}
            <ProductSlider 
              title="Deals & Offers of the Day" 
              products={offerProducts} 
              icon={<Gift size={18} className="text-rose-500" />} 
            />

            {/* Section 3: New Arrivals */}
            <ProductSlider 
              title="New Arrivals" 
              products={newProducts} 
              icon={<Sparkles size={18} className="text-amber-500 fill-amber-500" />} 
            />
          </div>
        )}

        {/* Dynamic Header & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-8 border-b border-gray-200 mt-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {search ? `Search results for "${search}"` : 'All Collections'}
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Showing {sortedProducts.length} items
            </p>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-center">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm text-xs font-semibold text-gray-700">
              <ArrowUpDown size={14} className="text-gray-400" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Product Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500 mt-3 font-semibold">Loading catalog...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 text-center">
            <p className="font-bold">{error}</p>
            <button 
              onClick={() => setSearchParams({})} 
              className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
            >
              Clear filters
            </button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl p-8">
            <p className="text-gray-500 font-medium">No products found matching your criteria.</p>
            {search && (
              <button 
                onClick={() => setSearchParams({})} 
                className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Products Grid */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* Customer Testimonials - Hide when searching */}
            {!search && <Testimonials />}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;