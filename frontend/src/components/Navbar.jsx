import React, { useState, useEffect, useRef } from 'react';
import { MapPin, UserCircle, ChevronDown, ShoppingCart, LogOut, LayoutDashboard, User, X, Search, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CategoryLine from './CategoryLine';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { defaultProducts } from '../data/defaultProducts';

const Navbar = () => {
  const { user, logout, getCartCount, location, updateLocation } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [customLocationInput, setCustomLocationInput] = useState('');
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const navigate = useNavigate();

  // Live search suggestion fetching with debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setShowSuggestions(true);
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await api.get(`/products?search=${encodeURIComponent(trimmed)}`);
        if (Array.isArray(results)) {
          setSuggestions(results.slice(0, 6));
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Live search error:', err);
        // Fallback filter using defaultProducts
        const lower = trimmed.toLowerCase();
        const words = lower.split(/\s+/).filter(Boolean);
        const fallback = defaultProducts.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          return words.some(w => name.includes(w) || desc.includes(w) || cat.includes(w));
        }).sort((a, b) => {
          const aInName = words.filter(w => a.name.toLowerCase().includes(w)).length;
          const bInName = words.filter(w => b.name.toLowerCase().includes(w)).length;
          return bInName - aInName;
        });
        setSuggestions(fallback.slice(0, 6));
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside and Escape key dismiss logic
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectProduct = (productId) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const words = query.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return text;

    const pattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-gray-900 font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  useEffect(() => {
    if (!showLocationModal) return;

    const timer = setTimeout(() => {
      const mapContainer = document.getElementById('leaflet-map-container');
      if (!mapContainer || !window.L) return;

      const initialCoords = [28.6139, 77.2090];
      
      // Fix default marker icon bug under Vite
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const map = L.map('leaflet-map-container', {
        center: initialCoords,
        zoom: 12,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);

      let marker = L.marker(initialCoords, { draggable: true }).addTo(map);

      const geocodeCoords = async (lat, lon) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
            headers: { 'Accept-Language': 'en' }
          });
          const data = await res.json();
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || "";
            const state = data.address.state || "";
            let locString = "";
            if (city && state) {
              locString = `${city}, ${state}`;
            } else if (city) {
              locString = city;
            } else if (state) {
              locString = state;
            } else {
              locString = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
            }
            setSelectedAddress(locString);
            setSelectedCoords([lat, lon]);
            marker.bindPopup(`<b>Selected:</b><br>${locString}`).openPopup();
          }
        } catch (err) {
          console.error(err);
          const fallback = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
          setSelectedAddress(fallback);
          setSelectedCoords([lat, lon]);
          marker.bindPopup(`<b>Selected coords:</b><br>${fallback}`).openPopup();
        }
      };

      geocodeCoords(initialCoords[0], initialCoords[1]);

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        geocodeCoords(lat, lng);
      });

      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        geocodeCoords(lat, lng);
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          const userLatLng = [latitude, longitude];
          map.setView(userLatLng, 13);
          marker.setLatLng(userLatLng);
          geocodeCoords(latitude, longitude);
        }, () => {});
      }

      return () => {
        map.remove();
      };
    }, 200);

    return () => clearTimeout(timer);
  }, [showLocationModal]);

  const handleDetectLocation = () => {
    setLocLoading(true);
    setLocError('');
    
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser");
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: { 'Accept-Language': 'en' }
          });
          const data = await res.json();
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || "";
            const state = data.address.state || "";
            let locString = "Unknown Location";
            if (city && state) {
              locString = `${city}, ${state}`;
            } else if (city) {
              locString = city;
            } else if (state) {
              locString = state;
            }
            updateLocation(locString);
            setShowLocationModal(false);
          } else {
            throw new Error("Unable to parse address");
          }
        } catch (err) {
          console.error(err);
          updateLocation(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
          setShowLocationModal(false);
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        console.error(err);
        if (err.code === err.PERMISSION_DENIED) {
          setLocError("Permission denied. Please grant location access or type manually.");
        } else {
          setLocError("Error retrieving GPS coordinates.");
        }
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleCustomLocationSubmit = (e) => {
    e.preventDefault();
    if (customLocationInput.trim()) {
      updateLocation(customLocationInput.trim());
      setCustomLocationInput('');
      setShowLocationModal(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleLogoClick = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate('/');
  };

  return (
    <div className='nav px-2 md:px-10 lg:px-20 border-b border-black/5 shadow-sm bg-gradient-to-b from-[#2ea9ed]/20 via-[#a8dbf7]/10 to-white relative z-50'>
      <div className='w-full flex items-center justify-between py-2'>
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <span className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white font-black text-base sm:text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 group-hover:shadow-indigo-500/30 transition-all duration-300">
            R
          </span>
          <span className="font-black text-lg sm:text-2xl tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            Prime
          </span>
        </div>

        <div 
          onClick={() => setShowLocationModal(true)}
          className="location flex items-center justify-center cursor-pointer gap-1.5 bg-black/5 hover:bg-black/10 px-3 py-1 rounded-full transition-all duration-300"
        >
          <MapPin className='mapi text-blue-600' size={14} />
          <p className='text-xs font-medium text-gray-700 hidden sm:inline'>Your Location</p>
          <span className='text-blue-600 text-xs hover:underline truncate max-w-[120px] font-semibold'>{location}</span>
        </div>
      </div>

      <div className="w-full pb-2 flex items-center justify-between gap-3 sm:gap-6 mt-1">
        <div ref={searchContainerRef} className="flex-grow max-w-2xl relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input 
              className='w-full border border-gray-300 rounded-full px-4 pl-10 pr-10 text-xs md:text-sm py-2 bg-white/90 focus:bg-white focus:border-blue-500 shadow-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none' 
              type="search" 
              placeholder="Search products by name, brand or category..." 
              value={searchQuery}
              onFocus={() => { if (searchQuery.trim()) setShowSuggestions(true); }}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            {searchQuery ? (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                title="Clear search"
              >
                <X size={14} />
              </button>
            ) : (
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                <Search size={14} />
              </button>
            )}
          </form>

          {/* Live Search Suggestions Dropdown */}
          {showSuggestions && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 transition-all animate-fadeIn">
              {isSearching ? (
                <div className="p-4 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Searching matching products...
                </div>
              ) : suggestions.length > 0 ? (
                <div>
                  <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <span>Products matching "{searchQuery}"</span>
                    <span className="text-blue-600 font-semibold">{suggestions.length} items</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {suggestions.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product.id)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50/70 cursor-pointer transition-colors group"
                      >
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-xl border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'; }}
                        />
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                            {highlightMatch(product.name, searchQuery)}
                          </p>
                          <span className="inline-block text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-0.5">
                            {product.category}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-black text-gray-900">
                            ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    onClick={handleSearchSubmit}
                    className="p-3 bg-gray-50 hover:bg-blue-600 hover:text-white border-t border-gray-100 text-center text-xs font-bold text-blue-600 cursor-pointer transition-colors flex items-center justify-center gap-1.5 group"
                  >
                    <span>View all search results for "{searchQuery}"</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-gray-500">
                  <p className="font-bold text-gray-700">No products found</p>
                  <p className="text-[11px] text-gray-400 mt-1">No product name matches "{searchQuery}". Try a different word!</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="user flex gap-3 md:gap-6 items-center flex-shrink-0">
          {/* User Account Dropdown */}
          <div className="relative">
            {user ? (
              <div 
                onClick={() => setShowDropdown(!showDropdown)}
                className="login flex items-center gap-1 cursor-pointer bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:shadow-md transition-all duration-300"
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
                <h1 className='text-xs md:text-sm font-medium text-gray-700 max-w-[80px] truncate hidden md:block'>{user.name}</h1>
                <ChevronDown className={`chevron text-gray-500 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} size={14} />
              </div>
            ) : (
              <Link 
                to="/login"
                className="login flex items-center gap-1 cursor-pointer bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-300 text-xs md:text-sm font-semibold"
              >
                <UserCircle size={15} />
                <h1>Login</h1>
              </Link>
            )}

            {/* Dropdown Menu */}
            {user && showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-600 uppercase">
                    {user.role}
                  </span>
                </div>
                
                <Link 
                  to="/dashboard" 
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={14} className="text-gray-400" />
                  My Dashboard
                </Link>

                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                  >
                    <LayoutDashboard size={14} className="text-gray-400" />
                    Admin Panel
                  </Link>
                )}

                <button 
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left border-t border-gray-100 mt-1"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <div 
            onClick={handleCartClick}
            className="cart flex items-center justify-center gap-1 md:gap-2 cursor-pointer bg-white border border-gray-200 hover:shadow-md transition-all duration-300 p-2 sm:px-3 sm:py-1.5 rounded-full relative"
          >
            <ShoppingCart className='text-gray-700' size={16} />
            <h1 className='text-xs md:text-sm font-medium text-gray-700 hidden sm:block'>Cart</h1>
            {getCartCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                {getCartCount()}
              </span>
            )}
          </div>
        </div>
      </div>

      <CategoryLine />

      {/* Location Selector Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden relative p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-900 tracking-tight text-sm">Select Delivery Location</h3>
              <button 
                onClick={() => {
                  setShowLocationModal(false);
                  setLocError('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {locError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg text-[10px] font-bold text-red-700 leading-normal">
                ⚠️ {locError}
              </div>
            )}

            <div className="space-y-4 text-xs">
              
              {/* Interactive Leaflet Map Selection */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-500 uppercase block">Map Location Picker (Click to select)</label>
                <div 
                  id="leaflet-map-container" 
                  className="w-full h-40 bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative z-10 shadow-inner"
                ></div>
                
                {selectedAddress && (
                  <div className="bg-blue-50/70 border border-blue-100/50 p-2.5 rounded-xl text-[10px] text-blue-800 font-bold flex items-start gap-1">
                    <span>📍</span>
                    <span>{selectedAddress}</span>
                  </div>
                )}

                {selectedCoords && (
                  <button 
                    type="button"
                    onClick={() => {
                      updateLocation(selectedAddress);
                      setShowLocationModal(false);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all duration-300 cursor-pointer active:scale-95 text-center block"
                  >
                    Confirm Map Pin Location
                  </button>
                )}
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-150"></div>
                <span className="flex-shrink mx-3 text-gray-300 text-[9px] uppercase font-bold">Or Options</span>
                <div className="flex-grow border-t border-gray-150"></div>
              </div>

              {/* Button: Use Current Geolocation */}
              <button 
                type="button"
                onClick={handleDetectLocation}
                disabled={locLoading}
                className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 font-extrabold rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 shadow-sm transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 cursor-pointer"
              >
                {locLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Detecting...
                  </>
                ) : (
                  <>
                    <MapPin size={14} />
                    Use Current Location
                  </>
                )}
              </button>

              {/* Form: Custom Input Location */}
              <form onSubmit={handleCustomLocationSubmit} className="space-y-2 pt-1">
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Enter Location Manually</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      required
                      value={customLocationInput}
                      onChange={(e) => setCustomLocationInput(e.target.value)}
                      placeholder="e.g. Mumbai, Maharashtra"
                      className="flex-grow border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                    <button 
                      type="submit"
                      className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap text-xs"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;