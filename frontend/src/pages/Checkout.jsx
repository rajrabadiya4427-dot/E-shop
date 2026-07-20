import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { MapPin, CheckCircle2, QrCode, DollarSign, ArrowRight, ArrowLeft } from 'lucide-react';

// Interactive Card Preview component
const CardPreview = ({ number, name, expiry, cvv, focus }) => {
  const formattedNumber = number.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim();
  const formattedExpiry = expiry || 'MM/YY';
  const isCvvFocused = focus === 'cvv';

  return (
    <div className="w-full max-w-[320px] h-[190px] mx-auto mb-6 perspective-1000">
      <div className={`relative w-full h-full duration-500 transform-style-3d ${isCvvFocused ? 'rotate-y-180' : ''}`}>
        
        {/* Front */}
        <div className="absolute inset-0 w-full h-full rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-gray-800 to-indigo-950 text-white flex flex-col justify-between shadow-lg border border-slate-700 backface-hidden">
          <div className="flex justify-between items-start">
            <div className="w-10 h-7 bg-amber-400/80 rounded-md shadow-sm border border-amber-300"></div>
            <span className="text-xs font-black tracking-wider italic text-slate-400">SECUREPAY</span>
          </div>

          <div className="text-lg font-bold tracking-widest font-mono text-slate-100 select-none my-1">
            {formattedNumber}
          </div>

          <div className="flex justify-between items-end">
            <div>
              <span className="text-[8px] uppercase text-slate-400 block font-semibold mb-0.5">Card Holder</span>
              <span className="text-xs font-bold tracking-wide uppercase truncate max-w-[140px] block">
                {name || 'YOUR NAME'}
              </span>
            </div>
            <div>
              <span className="text-[8px] uppercase text-slate-400 block font-semibold mb-0.5">Expires</span>
              <span className="text-xs font-bold tracking-wide font-mono block">
                {formattedExpiry}
              </span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-slate-900 via-gray-800 to-indigo-950 text-white flex flex-col justify-between py-5 shadow-lg border border-slate-700 backface-hidden rotate-y-180">
          <div className="w-full h-9 bg-black/80 my-1"></div>
          <div className="px-5 mt-1">
            <span className="text-[8px] uppercase text-slate-400 block font-semibold mb-0.5">CVV</span>
            <div className="flex items-center">
              <div className="h-6 bg-slate-100/10 border border-slate-100/5 rounded-md flex-grow flex items-center px-2 italic text-[10px] select-none text-slate-400">
                {name || 'YOUR NAME'}
              </div>
              <div className="w-10 h-6 bg-white text-gray-900 rounded-md font-mono flex items-center justify-center text-xs font-bold tracking-wider ml-3">
                {cvv || '•••'}
              </div>
            </div>
          </div>
          <div className="px-5 text-[7px] text-slate-500 leading-none mt-1">
            Demo use only. Do not type real credit card details.
          </div>
        </div>

      </div>
    </div>
  );
};

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useApp();
  const navigate = useNavigate();

  // Step state: 1 = Shipping, 2 = Payment, 3 = Confirmation
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // Address State
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'COD'
  
  // Razorpay and Mock state variables
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState(null);

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + shipping + tax;

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!address || !city || !state || !zip) {
        setError('Please fill in all shipping details');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCancelPayment = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/cancel-payment`);
      setError('Payment cancelled. Stock restored and order cancelled.');
    } catch (err) {
      console.error('[Payment] Error cancelling payment session:', err);
    }
  };

  const handleMockPaymentResponse = async (isSuccess) => {
    setShowMockModal(false);
    if (!isSuccess) {
      setError('Payment simulation declined or failed.');
      await handleCancelPayment(mockPaymentData.order_id);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/orders/verify', {
        order_id: mockPaymentData.order_id,
        razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
        razorpay_order_id: mockPaymentData.id,
        razorpay_signature: 'sig_mock_' + Math.random().toString(36).substr(2, 24),
        is_mock: true
      });

      if (response.success) {
        setPlacedOrder(response.order);
        clearCart();
        setStep(3);
      } else {
        setError('Payment verification failed.');
      }
    } catch (err) {
      console.error('[Payment] Mock verification failed:', err);
      setError(err.message || 'Payment verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const shipping_address = `${address}, ${city}, ${state} - ${zip}`;
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      // Place order via API
      const result = await api.post('/orders', {
        shipping_address,
        payment_method: paymentMethod,
        items
      });

      if (paymentMethod === 'UPI' && result.payment_session) {
        const session = result.payment_session;
        if (session.isMock) {
          // Open custom React modal simulator
          setMockPaymentData({
            id: session.id,
            amount: session.amount,
            order_id: result.id
          });
          setShowMockModal(true);
        } else {
          // Open real Razorpay Checkout overlay
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            setError('Failed to load Razorpay Payment Gateway. Check your internet connection.');
            setLoading(false);
            return;
          }

          const options = {
            key: session.key_id,
            amount: session.amount,
            currency: session.currency,
            name: "E-Shop Store",
            description: `Payment for Order #${result.id.slice(-6)}`,
            order_id: session.id,
            handler: async function (response) {
              setLoading(true);
              try {
                const verifyRes = await api.post('/orders/verify', {
                  order_id: result.id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                });
                
                if (verifyRes.success) {
                  setPlacedOrder(verifyRes.order);
                  clearCart();
                  setStep(3);
                } else {
                  setError('Payment verification failed.');
                }
              } catch (verifyErr) {
                setError(verifyErr.message || 'Payment verification failed.');
              } finally {
                setLoading(false);
              }
            },
            modal: {
              ondismiss: async function () {
                setLoading(false);
                await handleCancelPayment(result.id);
              }
            },
            prefill: {
              name: "Customer",
              email: "customer@example.com"
            },
            theme: {
              color: "#2563EB"
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      } else {
        // COD order
        setPlacedOrder(result);
        clearCart();
        setStep(3);
      }
    } catch (err) {
      console.error('[Payment] Placement error:', err);
      setError(err.message || 'Failed to place order. Try again.');
      setLoading(false);
    }
  };

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg">
          <p className="font-bold text-gray-800 mb-4">You have no items in the cart to checkout.</p>
          <Link to="/" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 mb-10 max-w-lg mx-auto">
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
            <span className={`text-xs font-bold ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Shipping</span>
          </div>
          <div className="h-0.5 w-8 sm:w-16 bg-gray-200"></div>
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
            <span className={`text-xs font-bold ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Payment</span>
          </div>
          <div className="h-0.5 w-8 sm:w-16 bg-gray-200"></div>
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</span>
            <span className={`text-xs font-bold ${step === 3 ? 'text-blue-600' : 'text-gray-400'}`}>Confirmation</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 max-w-3xl mx-auto">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* STEP 1: SHIPPING ADDRESS */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form */}
            <form onSubmit={handleNextStep} className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 space-y-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-blue-600" /> Shipping Details
              </h2>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Street Address</label>
                <input 
                  type="text" 
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat No, House Name, Street"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">City</label>
                  <input 
                    type="text" 
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New Delhi"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">State</label>
                  <input 
                    type="text" 
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Delhi"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">ZIP Code</label>
                  <input 
                    type="text" 
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="110001"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <Link to="/cart" className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
                  Modify Cart
                </Link>
                <button 
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow transition-all duration-300"
                >
                  Payment Methods <ArrowRight size={14} />
                </button>
              </div>
            </form>

            {/* Cart Summary */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 space-y-4">
              <h3 className="text-sm font-black text-gray-900 tracking-tight pb-2 border-b border-gray-100">Checkout summary</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center text-xs gap-3">
                    <span className="text-gray-500 truncate max-w-[140px]">{item.product.name} <strong className="text-gray-700">x{item.quantity}</strong></span>
                    <span className="font-semibold text-gray-700">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="font-semibold text-gray-700">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Shipping</span><span className="font-semibold text-gray-700">${shipping.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Tax</span><span className="font-semibold text-gray-700">${tax.toFixed(2)}</span></div>
                <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-sm"><span className="text-gray-800">Total</span><span className="text-blue-600">${grandTotal.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT METHODS */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Payment Panel */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
                <QrCode size={18} className="text-blue-600" /> Select Payment Method
              </h2>

              {/* Selector */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'UPI' ? 'border-blue-500 bg-blue-50/50 text-blue-600 font-bold' : 'border-gray-100 hover:border-gray-200 text-gray-600'
                  }`}
                >
                  <QrCode size={24} className="mb-2" />
                  <span className="text-xs">Scan & Pay (UPI QR)</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50/50 text-blue-600 font-bold' : 'border-gray-100 hover:border-gray-200 text-gray-600'
                  }`}
                >
                  <DollarSign size={24} className="mb-2" />
                  <span className="text-xs">Cash on Delivery (COD)</span>
                </button>
              </div>

              {/* UPI / RAZORPAY INTERFACE */}
              {paymentMethod === 'UPI' && (
                <div className="pt-4 border-t border-gray-100 text-center flex flex-col items-center py-8 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                    <QrCode size={24} />
                  </div>
                  <h4 className="font-extrabold text-gray-800 text-sm">Pay Securely Online</h4>
                  <p className="text-xs text-gray-500 max-w-sm mt-1 leading-normal">
                    You can pay the full amount of <strong className="text-gray-800">${grandTotal.toFixed(2)}</strong> using Google Pay, Paytm, PhonePe, Debit/Credit Card, Net Banking, or digital wallets.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full font-bold text-[10px] uppercase tracking-wider border border-green-100 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Secure Auto-verification Active
                  </div>
                </div>
              )}

              {/* CASH ON DELIVERY INTERFACE */}
              {paymentMethod === 'COD' && (
                <div className="pt-4 border-t border-gray-100 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-xs font-bold text-gray-700 block mb-1">Cash on Delivery (COD) Details:</span>
                  <p className="text-xs text-gray-500 leading-normal">
                    You can pay the full amount of <strong>${grandTotal.toFixed(2)}</strong> in cash to the delivery agent. Please ensure correct details are provided.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <button 
                  onClick={() => setStep(1)} 
                  className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Address
                </button>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md hover:shadow transition-all duration-300 disabled:bg-blue-400 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Confirm Payment & Place Order</>
                  )}
                </button>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 space-y-4">
              <h3 className="text-sm font-black text-gray-900 tracking-tight pb-2 border-b border-gray-100">Delivery details</h3>
              <div className="text-xs text-gray-600 leading-relaxed">
                <span className="font-bold text-gray-800 block mb-1">Shipping Destination:</span>
                <p className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-slate-500 font-medium">
                  {address}, {city}, {state} - {zip}
                </p>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between border-t border-gray-100 pt-2 font-bold text-sm">
                <span className="text-gray-800">Grand Total</span>
                <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ORDER CONFIRMED */}
        {step === 3 && placedOrder && (
          <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                {placedOrder.payment_status === 'Pending Verification' ? 'Reference Submitted!' : 'Order Confirmed!'}
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed px-4">
                {placedOrder.payment_status === 'Pending Verification' 
                  ? 'Thank you for submitting your transaction reference. Our accounting team will verify the payment soon, and your order will be approved shortly.' 
                  : 'Thank you for your purchase. Your payment was processed successfully.'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-xs space-y-2.5 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Order ID:</span>
                <span className="font-mono font-bold text-gray-800 truncate max-w-[180px]">{placedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Charged:</span>
                <span className="font-bold text-blue-600">${placedOrder.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Status:</span>
                <span className="font-bold uppercase text-green-600">{placedOrder.payment_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Delivery Mode:</span>
                <span className="font-bold text-gray-800">{placedOrder.payment_method === 'COD' ? 'Cash on Delivery' : 'Standard Express'}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <Link 
                to="/dashboard"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Track Order Status
              </Link>
              <Link 
                to="/"
                className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all"
              >
                Back to Shop Catalog
              </Link>
            </div>
          </div>
        )}

        {/* RZP SIMULATOR MODAL FOR TESTING */}
        {showMockModal && mockPaymentData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden relative flex flex-col p-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                  <QrCode size={18} className="text-blue-600 animate-pulse" /> Razorpay Payment Gateway Simulator
                </h3>
                <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Test Mode</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Transaction Amount</span>
                <div className="text-3xl font-black text-blue-600 font-mono">${(mockPaymentData.amount / 100).toFixed(2)}</div>
                <p className="text-xs text-gray-500 leading-normal max-w-xs mx-auto">
                  Verify the dynamic checkout flow immediately. Simulated payment credentials will be cryptographically verified by your server.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 text-xs text-left space-y-2 text-slate-500">
                <div className="flex justify-between"><span>Merchant Store:</span> <span className="font-bold text-gray-800">E-Shop Store</span></div>
                <div className="flex justify-between"><span>Payment Session:</span> <span className="font-mono text-gray-800 text-[10px] truncate max-w-[180px]">{mockPaymentData.id}</span></div>
                <div className="flex justify-between"><span>Payment Options:</span> <span className="font-bold text-gray-800">All UPI & Credit Cards</span></div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => handleMockPaymentResponse(true)}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} /> Simulate Payment Success
                </button>
                <button
                  onClick={() => handleMockPaymentResponse(false)}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Simulate Payment Failure
                </button>
                <button
                  onClick={() => {
                    setShowMockModal(false);
                    handleCancelPayment(mockPaymentData.order_id);
                  }}
                  className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel & Exit Checkout
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Checkout;
