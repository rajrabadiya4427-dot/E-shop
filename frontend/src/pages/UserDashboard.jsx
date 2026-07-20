import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { User, Package, Calendar, MapPin, Truck, ChevronDown, ChevronUp, Clock, AlertTriangle } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const data = await api.get('/orders');
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load your orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserOrders();
  }, []);

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // Helper to check active status stage
  const getStatusStep = (status) => {
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-8">
          My Account Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: User Profile Details */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-2xl uppercase shadow-inner mb-3">
                {user?.name.charAt(0)}
              </div>
              <h2 className="text-lg font-bold text-gray-800">{user?.name}</h2>
              <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-blue-50 text-blue-600 uppercase tracking-wider border border-blue-100">
                {user?.role} Account
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <User size={14} className="text-gray-400" />
                <div>
                  <span className="text-gray-400 block font-bold">Full Name</span>
                  <span className="font-semibold text-gray-700">{user?.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package size={14} className="text-gray-400" />
                <div>
                  <span className="text-gray-400 block font-bold">Email Address</span>
                  <span className="font-semibold text-gray-700">{user?.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={14} className="text-gray-400" />
                <div>
                  <span className="text-gray-400 block font-bold">Account Tier</span>
                  <span className="font-semibold text-gray-700">Preferred Gold Member</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: User Orders list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Package size={18} className="text-blue-600" /> Order History
              </h2>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-500 mt-2 font-semibold">Retrieving orders...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-semibold text-center border border-red-100">
                  {error}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <Package className="mx-auto text-gray-300 mb-3" size={32} />
                  <p className="text-gray-500 text-sm font-medium">You haven't placed any orders yet.</p>
                  <Link to="/" className="inline-block mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    const statusStep = getStatusStep(order.status);
                    const isCancelled = order.status === 'Cancelled';

                    return (
                      <div 
                        key={order.id}
                        className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                          isExpanded ? 'border-blue-200 shadow-md' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        {/* Summary Header */}
                        <div 
                          onClick={() => toggleExpandOrder(order.id)}
                          className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 bg-white cursor-pointer select-none"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-gray-400 block font-semibold">ORDER #{order.id.slice(0, 8)}</span>
                            <span className="text-xs font-bold text-gray-800">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[10px] text-gray-400 block font-bold">Total</span>
                              <span className="text-sm font-black text-gray-900">${order.total_amount.toFixed(2)}</span>
                            </div>

                            <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full border ${
                              isCancelled 
                                ? 'bg-red-50 text-red-600 border-red-100'
                                : order.status === 'Delivered'
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {order.status}
                            </span>

                            {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="bg-slate-50/50 border-t border-gray-100 p-5 space-y-6">
                            
                            {/* Tracking Timeline */}
                            {!isCancelled ? (
                              <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <Truck size={14} className="text-blue-600" /> Tracking Details
                                </h3>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2 max-w-xl mx-auto py-4">
                                  {['Pending', 'Processing', 'Shipped', 'Delivered'].map((stepName, idx) => {
                                    const isActive = idx <= statusStep;
                                    const isCurrent = idx === statusStep;
                                    
                                    return (
                                      <React.Fragment key={stepName}>
                                        <div className="flex items-center gap-2 sm:flex-col sm:text-center flex-1">
                                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                                            isActive 
                                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200' 
                                              : 'bg-white text-gray-400 border-gray-200'
                                          }`}>
                                            {isActive ? '✓' : idx + 1}
                                          </div>
                                          <div className="text-left sm:text-center mt-1">
                                            <span className={`text-[10px] font-bold block ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                                              {stepName}
                                            </span>
                                            {isCurrent && (
                                              <span className="text-[8px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-1 rounded-full uppercase">
                                                Active
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        {idx < 3 && (
                                          <div className={`hidden sm:block h-0.5 flex-grow transition-colors ${
                                            idx < statusStep ? 'bg-blue-600' : 'bg-gray-200'
                                          }`}></div>
                                        )}
                                      </React.Fragment>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-center gap-2.5 text-red-700">
                                <AlertTriangle size={16} />
                                <span className="text-xs font-bold">This order was cancelled by the administrator.</span>
                              </div>
                            )}

                            {/* Order Details & Items */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Item Details</h4>
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center bg-white border border-gray-100 rounded-xl p-2.5 text-xs">
                                      <div className="truncate max-w-[160px]">
                                        <span className="font-bold text-gray-800 block truncate">{item.product?.name || 'Deleted Product'}</span>
                                        <span className="text-[10px] text-gray-400 font-medium">Quantity: {item.quantity}</span>
                                      </div>
                                      <span className="font-bold text-gray-700">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3.5 text-xs text-gray-600">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Delivery Summary</h4>
                                <div className="space-y-1.5">
                                  <div className="flex items-start gap-1">
                                    <MapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span><strong>Address:</strong> {order.shipping_address}</span>
                                  </div>
                                  <div className="flex items-start gap-1">
                                    <Clock size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span><strong>Payment Method:</strong> {order.payment_method} ({order.payment_status === 'Paid' ? 'Paid Online' : 'Pending Verification'})</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
