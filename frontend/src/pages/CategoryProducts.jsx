import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { ArrowUpDown } from 'lucide-react';

const CategoryProducts = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get(`/products?category=${encodeURIComponent(category)}`);
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError(`Failed to fetch ${category} products`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [category]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="min-h-screen pb-16 bg-gray-50/50 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner with modern gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-12 mb-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
            <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" /></svg>
          </div>
          <span className="text-xs font-extrabold uppercase bg-white/20 px-3 py-1 rounded-full tracking-wider border border-white/10">
            Category
          </span>
          <h1 className="text-3xl sm:text-5xl font-black mt-4 tracking-tight">
            {category}
          </h1>
          <p className="text-sm text-blue-100/90 mt-2 max-w-xl font-medium">
            Explore our curated list of high-quality products in the {category} department. Find the best deals with express home shipping.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-8 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Department Shelf
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Showing {sortedProducts.length} items
            </p>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-center">
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
            <p className="text-sm text-gray-500 mt-3 font-semibold">Scanning shelf...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 text-center">
            <p className="font-bold">{error}</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl p-8">
            <p className="text-gray-500 font-medium">No products currently available in this category.</p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
