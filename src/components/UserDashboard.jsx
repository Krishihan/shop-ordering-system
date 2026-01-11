import React, { useState } from 'react';
import { 
  LogOut, 
  Edit, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Package, 
  AlertCircle,
  ChevronRight,
  Search
} from 'lucide-react';

const UserDashboard = ({ user, items, orders, onCreateOrder, onUpdateOrder, onLogout }) => {
  const [currentOrder, setCurrentOrder] = useState([]);
  const [viewMode, setViewMode] = useState('create');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  const handleLogoutClick = () => {
  setShowLogoutModal(true);
};

  const userOrders = orders.filter(o => o.userId === user.id);
  const pendingOrder = userOrders.find(o => o.status === 'pending');

  const addToOrder = (item) => {
    const existing = currentOrder.find(i => i.id === item.id);
    if (existing) {
      setCurrentOrder(currentOrder.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      setCurrentOrder(currentOrder.filter(i => i.id !== itemId));
    } else {
      setCurrentOrder(currentOrder.map(i => 
        i.id === itemId ? { ...i, quantity } : i
      ));
    }
  };

  const handleCompleteOrder = () => {
    if (currentOrder.length === 0) {
      alert('Please add items to your order');
      return;
    }
    
    if (editingOrderId) {
      onUpdateOrder(editingOrderId, currentOrder);
    } else {
      onCreateOrder(user.id, currentOrder);
    }
    
    setCurrentOrder([]);
    setEditingOrderId(null);
    setViewMode('view');
  };

  const handleEditOrder = (order) => {
    setCurrentOrder(order.items);
    setEditingOrderId(order.id);
    setViewMode('create');
  };

  // Helper for Status Styles
  const getStatusStyle = (status) => {
    switch(status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 font-sans">
      
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-blue-500 p-2 rounded-lg text-white shadow-lg">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                {user.shopName}
              </h1>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">User Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
        
        {/* Tab Controls */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex gap-2">
            <button
              onClick={() => setViewMode('create')}
              className={`px-8 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'create' 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Plus className="w-4 h-4" />
              {editingOrderId ? 'Edit Order' : 'New Order'}
            </button>
            <button
              onClick={() => setViewMode('view')}
              className={`px-8 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                viewMode === 'view' 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              My Orders
            </button>
          </div>
        </div>

        {viewMode === 'create' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Catalog Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Catalog</h2>
                <div className="text-sm text-gray-500">{items.length} items available</div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {items.map(item => (
                  <div key={item.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden flex flex-col">
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm uppercase tracking-wide">
                        {item.category}
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">Premium quality item ready for order.</p>
                      </div>
                      
                      <button
                        onClick={() => addToOrder(item)}
                        disabled={pendingOrder && !editingOrderId}
                        className="mt-4 w-full bg-white text-indigo-600 border-2 border-indigo-100 py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-indigo-600"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Section (Sticky) */}
            <div className="lg:col-span-1 lg:sticky lg:top-24">
              <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-300 ${editingOrderId ? 'ring-2 ring-amber-400' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-600" />
                    Current Order
                  </h2>
                  {editingOrderId && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded">EDITING MODE</span>
                  )}
                </div>

                {currentOrder.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Your cart is empty</p>
                    <p className="text-xs text-gray-400 mt-1">Select items from the catalog</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {currentOrder.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-600 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-green-600 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                       <button
                        onClick={handleCompleteOrder}
                        disabled={pendingOrder && !editingOrderId}
                        className={`w-full py-4 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
                           editingOrderId 
                           ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                           : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                      >
                        {editingOrderId ? 'Update Order' : 'Complete Order'}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      {pendingOrder && !editingOrderId && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-700 font-medium leading-relaxed">
                            You have a pending order. Please wait for admin confirmation before creating a new one.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-800">Order History</h2>
            </div>
            
            {userOrders.length === 0 ? (
               <div className="text-center py-16">
                 <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Clock className="w-8 h-8 text-gray-400" />
                 </div>
                 <p className="text-gray-500 font-medium">No past orders found</p>
               </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {userOrders.map(order => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-lg font-bold text-gray-800">Order #{order.id}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {order.totalAmount && (
                          <div className="text-right">
                             <p className="text-xs text-gray-500 uppercase tracking-wide">Total Amount</p>
                             <p className="text-xl font-bold text-green-600">₹{order.totalAmount.toFixed(2)}</p>
                          </div>
                        )}
                        
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="p-2 bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg transition-all shadow-sm"
                            title="Edit Order"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center text-xs font-bold text-gray-600">{item.quantity}</span>
                              <span className="text-gray-700 font-medium truncate max-w-[120px]">{item.name}</span>
                            </div>
                            {order.totalAmount && (
                              <span className="font-semibold text-gray-500">₹{(item.quantity * (order.itemPrices?.[item.id] || 0)).toFixed(2)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm p-6 animate-fadeIn">
            
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 p-2 rounded-xl">
                <LogOut className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Confirm Logout
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to logout from your account? You’ll need to log in again to continue.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="px-5 py-2 rounded-xl text-white font-bold bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}


      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;