import React, { useState } from 'react';
import { LogOut, Edit } from 'lucide-react';

const UserDashboard = ({ user, items, orders, onCreateOrder, onUpdateOrder, onLogout }) => {
  const [currentOrder, setCurrentOrder] = useState([]);
  const [viewMode, setViewMode] = useState('create');
  const [editingOrderId, setEditingOrderId] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.shopName}</h1>
            <p className="text-gray-600 text-sm">User Dashboard</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setViewMode('create')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'create' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {editingOrderId ? 'Edit Order' : 'Create Order'}
          </button>
          <button
            onClick={() => setViewMode('view')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'view' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Orders
          </button>
        </div>

        {viewMode === 'create' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Available Items</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map(item => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                      <button
                        onClick={() => addToOrder(item)}
                        disabled={pendingOrder && !editingOrderId}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Add to Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Order */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Current Order</h2>
                {currentOrder.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items added yet</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {currentOrder.map(item => (
                        <div key={item.id} className="flex items-center justify-between border-b pb-3">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleCompleteOrder}
                      disabled={pendingOrder && !editingOrderId}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {editingOrderId ? 'Update Order' : 'Complete Order'}
                    </button>
                    {pendingOrder && !editingOrderId && (
                      <p className="text-sm text-amber-600 mt-2 text-center">
                        You have a pending order. Wait for admin confirmation.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">My Orders</h2>
            {userOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {userOrders.map(order => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="text-gray-600">x {item.quantity}</span>
                          {order.totalAmount && (
                            <span className="font-medium">₹{(item.quantity * (order.itemPrices?.[item.id] || 0)).toFixed(2)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {order.totalAmount && (
                      <div className="mt-3 pt-3 border-t flex justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-green-600">₹{order.totalAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;