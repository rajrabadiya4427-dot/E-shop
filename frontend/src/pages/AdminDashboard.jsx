import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Users, Package, DollarSign, ShoppingBag, Plus, Trash2, Edit2, 
  X, Check, AlertCircle, ShoppingCart, RefreshCw, Upload, Image as ImageIcon, Home as HomeIcon
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'users'
  const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalSales: 0 });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Modal State for Product CRUD
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null if adding, product object if editing
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Fashion',
    image_url: '',
    stock: '',
    tag: 'none'
  });

  const categories = ['Fashion', 'Mobiles', 'Electronics', 'Beauty', 'Home', 'Books', 'Furniture'];

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const statsData = await api.get('/admin/stats');
      setStats(statsData);

      const productsData = await api.get('/products');
      setProducts(productsData);

      const ordersData = await api.get('/admin/orders');
      setOrders(ordersData);

      const usersData = await api.get('/admin/users');
      setUsers(usersData);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard content. Please check permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pollNewOrders = async () => {
    try {
      const ordersData = await api.get('/admin/orders');
      
      // If we already have orders loaded in state, and new fetch has more items
      if (orders.length > 0 && ordersData.length > orders.length) {
        // Find the new order (the first one, which is the most recent)
        const latestNewOrder = ordersData[0];
        
        if (latestNewOrder) {
          const customerName = latestNewOrder.user?.name || 'A Customer';
          const itemsCount = latestNewOrder.items?.length || 0;
          const address = latestNewOrder.shipping_address || 'N/A';
          
          setNewOrderNotification({
            id: latestNewOrder.id,
            customer: customerName,
            address: address,
            items: itemsCount,
            total: latestNewOrder.total_amount
          });
          
          // Clear notification toast after 8 seconds
          setTimeout(() => {
            setNewOrderNotification(null);
          }, 8000);
        }
      }
      
      // Update orders list and dashboard statistics silently in the background
      setOrders(ordersData);
      const statsData = await api.get('/admin/stats');
      setStats(statsData);
    } catch (err) {
      console.error("Silent background polling failed:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      pollNewOrders();
    }, 6000); // Check for new orders every 6 seconds
    
    return () => clearInterval(interval);
  }, [orders]);

  // Show Toast
  const triggerNotification = (type, message) => {
    if (type === 'success') {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 4000);
    }
  };

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: 'Fashion',
      image_url: '',
      stock: '',
      tag: 'none'
    });
    setShowModal(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image_url: product.image_url,
      stock: product.stock,
      tag: product.tag || 'none'
    });
    setShowModal(true);
  };

  // Handle Input Changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value });
  };

  // Drag and Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed!');
      return;
    }
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const data = await api.upload('/admin/upload', formData);
      setProductForm(prev => ({
        ...prev,
        image_url: data.url
      }));
      triggerNotification('success', 'Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      triggerNotification('error', err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadImageFile(e.target.files[0]);
    }
  };

  // Submit Product Form (Create / Update)
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');

    if (!productForm.image_url) {
      triggerNotification('error', 'Please upload an image or provide an image URL');
      setActionLoading(false);
      return;
    }

    const formattedForm = {
      ...productForm,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock) || 0
    };

    try {
      if (editingProduct) {
        // Edit flow
        const updated = await api.put(`/admin/products/${editingProduct.id}`, formattedForm);
        setProducts(products.map((p) => p.id === editingProduct.id ? updated : p));
        triggerNotification('success', 'Product updated successfully!');
      } else {
        // Add flow
        const created = await api.post('/admin/products', formattedForm);
        setProducts([created, ...products]);
        triggerNotification('success', 'Product created successfully!');
      }
      setShowModal(false);
      
      // Update statistics count
      const statsData = await api.get('/admin/stats');
      setStats(statsData);
    } catch (err) {
      console.error(err);
      triggerNotification('error', err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
      triggerNotification('success', 'Product deleted successfully!');
      
      // Update statistics count
      const statsData = await api.get('/admin/stats');
      setStats(statsData);
    } catch (err) {
      console.error(err);
      triggerNotification('error', err.message || 'Deletion failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Change Order Status
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map((o) => o.id === orderId ? updated : o));
      triggerNotification('success', `Order status updated to ${newStatus}`);
      
      // Sync stats sales
      const statsData = await api.get('/admin/stats');
      setStats(statsData);
    } catch (err) {
      console.error(err);
      triggerNotification('error', 'Failed to update order status');
    }
  };

  // Change Order Payment Status
  const handleOrderPaymentStatusChange = async (orderId, newPayStatus) => {
    try {
      const updated = await api.put(`/admin/orders/${orderId}/status`, { payment_status: newPayStatus });
      setOrders(orders.map((o) => o.id === orderId ? updated : o));
      triggerNotification('success', `Payment status updated to ${newPayStatus}`);
      
      // Sync stats sales
      const statsData = await api.get('/admin/stats');
      setStats(statsData);
    } catch (err) {
      console.error(err);
      triggerNotification('error', 'Failed to update payment status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Real-time Order Notification Toast */}
      {newOrderNotification && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-2xl w-80 sm:w-96 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-start">
            <h4 className="font-extrabold text-blue-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
              New Order Received!
            </h4>
            <button 
              onClick={() => setNewOrderNotification(null)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <div className="mt-3 text-xs space-y-1.5 text-gray-300 leading-normal">
            <p><strong>Customer:</strong> {newOrderNotification.customer}</p>
            <p><strong>Shipping To:</strong> {newOrderNotification.address}</p>
            <p><strong>Order Items:</strong> {newOrderNotification.items} items</p>
            <div className="flex justify-between border-t border-slate-800 pt-2.5 mt-2 font-bold text-white">
              <span>Charged Total</span>
              <span className="text-blue-400">${newOrderNotification.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Admin Console</h1>
            <p className="text-xs text-gray-500 mt-1">Configure catalogs, verify transactions, and monitor registered directory lists.</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link 
              to="/"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm text-xs font-bold transition-all cursor-pointer"
            >
              <HomeIcon size={14} /> Go to Storefront
            </Link>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-gray-300 rounded-xl bg-white shadow-sm text-xs font-bold text-gray-600 transition-all cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Console
            </button>
          </div>
        </div>

        {/* Dynamic Alerts */}
        {successMsg && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl flex items-center gap-2">
            <Check size={16} className="text-green-600" />
            <p className="text-xs text-green-700 font-bold">{successMsg}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <p className="text-xs text-red-700 font-bold">{error}</p>
          </div>
        )}

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
            <DollarSign className="absolute right-4 bottom-4 w-12 h-12 opacity-15" />
            <span className="text-[10px] sm:text-xs font-extrabold uppercase text-indigo-100">Total Sales</span>
            <h3 className="text-xl sm:text-3xl font-black mt-2">${stats.totalSales.toFixed(2)}</h3>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
            <ShoppingBag className="absolute right-4 bottom-4 w-12 h-12 opacity-15" />
            <span className="text-[10px] sm:text-xs font-extrabold uppercase text-emerald-100">Total Orders</span>
            <h3 className="text-xl sm:text-3xl font-black mt-2">{stats.totalOrders}</h3>
          </div>
          <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
            <Users className="absolute right-4 bottom-4 w-12 h-12 opacity-15" />
            <span className="text-[10px] sm:text-xs font-extrabold uppercase text-sky-100">Customers</span>
            <h3 className="text-xl sm:text-3xl font-black mt-2">{stats.totalUsers}</h3>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
            <Package className="absolute right-4 bottom-4 w-12 h-12 opacity-15" />
            <span className="text-[10px] sm:text-xs font-extrabold uppercase text-amber-100">Catalog Size</span>
            <h3 className="text-xl sm:text-3xl font-black mt-2">{stats.totalProducts}</h3>
          </div>
        </div>

        {/* Tab Controls & Add Product Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 gap-4">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('products')} 
              className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all ${
                activeTab === 'products' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Products Catalogue
            </button>
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all ${
                activeTab === 'orders' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Manage Orders
            </button>
            <button 
              onClick={() => setActiveTab('users')} 
              className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all ${
                activeTab === 'users' ? 'border-blue-600 text-blue-600 font-extrabold' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              User Accounts
            </button>
          </div>

          {activeTab === 'products' && (
            <button 
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all self-start sm:self-auto cursor-pointer mb-2"
            >
              <Plus size={14} /> Add New Product
            </button>
          )}
        </div>

        {/* Loading Shell */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500 mt-3 font-semibold">Syncing dashboards...</p>
          </div>
        ) : (
          /* TAB 1: PRODUCT MANAGEMENT */
          activeTab === 'products' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                      <th className="py-4 px-6">Image</th>
                      <th className="py-4 px-6">Product details</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Stock</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-800 max-w-xs truncate">
                          <div>{product.name}</div>
                          <span className="text-[9px] text-gray-400 font-mono font-medium block truncate mt-0.5">{product.id}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-block bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full text-[9px] uppercase">{product.category}</span>
                        </td>
                        <td className="py-4 px-6 font-bold">${product.price.toFixed(2)}</td>
                        <td className="py-4 px-6 font-semibold">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            product.stock === 0 
                              ? 'bg-red-50 text-red-600' 
                              : product.stock <= 5 
                              ? 'bg-orange-50 text-orange-600' 
                              : 'bg-green-50 text-green-600'
                          }`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td className="py-4 px-6 flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* TAB 2: MANAGE ORDERS */}
        {!loading && activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Customer info</th>
                    <th className="py-4 px-6">Items & Amount</th>
                    <th className="py-4 px-6">Payment Mode</th>
                    <th className="py-4 px-6">Payment status</th>
                    <th className="py-4 px-6">Delivery status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-gray-800">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-800">{order.user?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{order.user?.email || 'N/A'}</div>
                        <div className="text-[9px] text-slate-500 mt-1 max-w-xs truncate" title={order.shipping_address}>
                          Addr: {order.shipping_address}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="max-w-[180px] space-y-0.5">
                          {order.items?.map((item) => (
                            <div key={item.id} className="text-[10px] truncate text-slate-500">
                              • {item.product?.name || 'Deleted Product'} <strong>(x{item.quantity})</strong>
                            </div>
                          ))}
                        </div>
                        <div className="font-black text-gray-900 mt-1.5">${order.total_amount.toFixed(2)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold uppercase text-gray-500">{order.payment_method}</div>
                        {order.payment_method === 'UPI' && order.transaction_id && (
                          <div className="text-[9px] text-blue-600 font-extrabold mt-1 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 select-all" title="Click to copy UPI Ref ID">
                            UTR: {order.transaction_id}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <select 
                          value={order.payment_status}
                          onChange={(e) => handleOrderPaymentStatusChange(order.id, e.target.value)}
                          className={`border rounded-lg px-2 py-1 font-semibold text-[10px] outline-none ${
                            order.payment_status === 'Paid' ? 'border-green-200 text-green-600 bg-green-50' : 
                            (order.payment_status === 'Pending Verification' ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-orange-200 text-orange-600 bg-orange-50')
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Pending Verification">Verification Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <select 
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                          className={`border rounded-lg px-2 py-1 font-semibold text-[10px] outline-none ${
                            order.status === 'Delivered' 
                              ? 'border-green-200 text-green-600 bg-green-50' 
                              : order.status === 'Cancelled'
                              ? 'border-red-200 text-red-600 bg-red-50'
                              : 'border-blue-200 text-blue-600 bg-blue-50'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: USER ACCOUNTS */}
        {!loading && activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="py-4 px-6">User ID</th>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Account Role</th>
                    <th className="py-4 px-6">Registration date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-gray-400">{user.id}</td>
                      <td className="py-4 px-6 font-bold text-gray-800">{user.name}</td>
                      <td className="py-4 px-6">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-block font-extrabold px-2 py-0.5 rounded-full text-[9px] uppercase border ${
                          user.role === 'admin' 
                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                            : 'bg-sky-50 text-sky-600 border-sky-100'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 font-semibold">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADD / EDIT PRODUCT MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden relative flex flex-col max-h-[90vh]">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-black text-gray-900 tracking-tight">
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Product to Catalog'}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleProductSubmit} className="p-6 space-y-4 overflow-y-auto flex-grow text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Product Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={productForm.name}
                    onChange={handleFormChange}
                    placeholder="Enter product title..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Overview / Description</label>
                  <textarea 
                    name="description"
                    required
                    rows={3}
                    value={productForm.description}
                    onChange={handleFormChange}
                    placeholder="Write details description overview..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      name="price"
                      required
                      value={productForm.price}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Available Stock</label>
                    <input 
                      type="number" 
                      name="stock"
                      required
                      value={productForm.stock}
                      onChange={handleFormChange}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Category</label>
                    <select 
                      name="category"
                      value={productForm.category}
                      onChange={handleFormChange}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Product Promotion Tag</label>
                    <select 
                      name="tag"
                      value={productForm.tag}
                      onChange={handleFormChange}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer bg-white"
                    >
                      <option value="none">Standard (No Promo Section)</option>
                      <option value="trending">Suggested For You / Trending</option>
                      <option value="offer">Deals & Offers</option>
                      <option value="new">New Arrivals</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Product Image</label>
                  
                  {/* Drag and Drop Zone */}
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[120px] mb-2 ${
                      dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/30'
                    }`}
                    onClick={() => document.getElementById('image-file-input').click()}
                  >
                    <input 
                      id="image-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw size={20} className="text-blue-500 animate-spin" />
                        <span className="text-[11px] text-gray-500 font-semibold">Uploading image...</span>
                      </div>
                    ) : productForm.image_url ? (
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                          <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left overflow-hidden flex-grow">
                          <p className="text-[9px] text-green-600 font-bold uppercase mb-0.5">Image Selected</p>
                          <p className="text-[10px] text-gray-500 truncate">{productForm.image_url}</p>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductForm(prev => ({ ...prev, image_url: '' }));
                            }}
                            className="text-[10px] text-red-500 font-bold hover:underline mt-1 focus:outline-none"
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-[11px] text-gray-600 font-medium">Drag & drop image here, or <span className="text-blue-500 font-bold hover:underline">browse</span></span>
                        <span className="text-[9px] text-gray-400">Supports JPG, PNG, WEBP, GIF</span>
                      </div>
                    )}
                  </div>

                  {/* Fallback Direct Input */}
                  <input 
                    type="text" 
                    name="image_url"
                    value={productForm.image_url}
                    onChange={handleFormChange}
                    placeholder="Or paste direct image URL (https://...)"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold text-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={actionLoading}
                    className="flex items-center gap-1 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:bg-blue-400"
                  >
                    {actionLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>{editingProduct ? 'Save Changes' : 'Create Product'}</>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
