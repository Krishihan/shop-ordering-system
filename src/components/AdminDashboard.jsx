import React, { useState } from 'react';
import { Users, Package, ShoppingCart, Plus, Trash2, LogOut, FileText, DollarSign, Edit2, BoxIcon } from 'lucide-react';

const AdminDashboard = ({ users, items, orders, onCreateUser, onDeleteUser, onConfirmOrder, onApplyGlobalPrices, onCreateItem, onUpdateItem, onDeleteItem, onLogout }) => {
  const [view, setView] = useState('orders');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [prices, setPrices] = useState({});
  const [newUser, setNewUser] = useState({ username: '', password: '', shopName: '' });
  const [newItem, setNewItem] = useState({ name: '', category: '', image: '' });

  // Get confirmed orders that don't have prices yet
  const confirmedOrders = orders.filter(o => o.status === 'confirmed' && !o.batchId);
  const hasConfirmedOrders = confirmedOrders.length > 0;

  const handleCreateUser = (e) => {
    e.preventDefault();
    onCreateUser(newUser);
    setNewUser({ username: '', password: '', shopName: '' });
    setShowUserForm(false);
  };

  const handleCreateItem = (e) => {
    e.preventDefault();
    if (editingItem) {
      onUpdateItem(editingItem.id, newItem);
      setEditingItem(null);
    } else {
      onCreateItem(newItem);
    }
    setNewItem({ name: '', category: '', image: '' });
    setShowItemForm(false);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({ name: item.name, category: item.category, image: item.image });
    setShowItemForm(true);
  };

  const handleConfirmAllOrders = () => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    if (pendingOrders.length === 0) {
      alert('No pending orders to confirm');
      return;
    }
    if (window.confirm(`Confirm ${pendingOrders.length} pending orders?`)) {
      pendingOrders.forEach(order => onConfirmOrder(order.id));
    }
  };

  const getCombinedOrder = () => {
    const combined = {};
    
    confirmedOrders.forEach(order => {
      order.items.forEach(item => {
        if (combined[item.id]) {
          combined[item.id].quantity += item.quantity;
        } else {
          combined[item.id] = { ...item };
        }
      });
    });
    
    return Object.values(combined);
  };

  const getOrderedItemsOnly = () => {
    const combinedItems = getCombinedOrder();
    return items.filter(item => combinedItems.some(ci => ci.id === item.id));
  };

  const handleApplyPrices = () => {
    const orderedItems = getOrderedItemsOnly();
    const allPricesSet = orderedItems.every(item => prices[item.id] && prices[item.id] > 0);
    
    if (!allPricesSet) {
      alert('Please set prices for all ordered items');
      return;
    }

    if (window.confirm(`Apply these prices to ${confirmedOrders.length} confirmed orders?`)) {
      onApplyGlobalPrices(prices);
      setPrices({});
      setShowPricing(false);
      setView('orders');
    }
  };

  const generateCombinedPDF = () => {
    const combined = getCombinedOrder();
    const pdfContent = `
COMBINED ORDER FOR PURCHASE
Generated: ${new Date().toLocaleDateString()}

Total Confirmed Orders: ${confirmedOrders.length}

Items to Purchase:
${combined.map(item => `${item.name} (${item.category}) - Quantity: ${item.quantity}`).join('\n')}

---
Use this list for bulk purchasing
    `;
    alert('Combined Order PDF (Demo):\n\n' + pdfContent);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm">Manage orders, users, and inventory</p>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4 mb-6 flex-wrap">
          <button onClick={() => setView('orders')} className={`px-6 py-2 rounded-lg font-medium transition-colors ${view === 'orders' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <Package className="w-4 h-4 inline mr-2" />
            All Orders
          </button>
          <button onClick={() => setView('combined')} className={`px-6 py-2 rounded-lg font-medium transition-colors ${view === 'combined' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <ShoppingCart className="w-4 h-4 inline mr-2" />
            Combined Order
            {hasConfirmedOrders && <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">{confirmedOrders.length}</span>}
          </button>
          <button onClick={() => setView('pricing')} className={`px-6 py-2 rounded-lg font-medium transition-colors ${view === 'pricing' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <DollarSign className="w-4 h-4 inline mr-2" />
            Set Prices
            {hasConfirmedOrders && <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">!</span>}
          </button>
          <button onClick={() => setView('items')} className={`px-6 py-2 rounded-lg font-medium transition-colors ${view === 'items' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <BoxIcon className="w-4 h-4 inline mr-2" />
            Items
          </button>
          <button onClick={() => setView('users')} className={`px-6 py-2 rounded-lg font-medium transition-colors ${view === 'users' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <Users className="w-4 h-4 inline mr-2" />
            Users
          </button>
        </div>

        {/* Orders View */}
        {view === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">All Orders</h2>
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <button onClick={handleConfirmAllOrders} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Confirm All Pending
                </button>
              )}
            </div>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const user = users.find(u => u.id === order.userId);
                  return (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">{user?.shopName}</p>
                          <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'pending' ? 'bg-amber-100 text-amber-800' : order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          {order.status === 'pending' && (
                            <button onClick={() => onConfirmOrder(order.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                              Confirm
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.name}</span>
                            <span className="text-gray-600">x {item.quantity}</span>
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
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Combined Order View */}
        {view === 'combined' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Combined Order (Confirmed Orders)</h2>
            {!hasConfirmedOrders ? (
              <p className="text-gray-500 text-center py-8">No confirmed orders yet. Confirm orders first.</p>
            ) : (
              <div>
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{confirmedOrders.length}</strong> confirmed orders ready for pricing
                  </p>
                </div>
                <div className="space-y-3">
                  {getCombinedOrder().map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      <p className="text-lg font-bold text-indigo-600">Qty: {item.quantity}</p>
                    </div>
                  ))}
                  <button onClick={generateCombinedPDF} className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" />
                    Download Purchase List PDF
                  </button>
                  <button onClick={() => setView('pricing')} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Continue to Set Prices
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pricing View */}
        {view === 'pricing' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Set Item Prices (One-Time)</h2>
            {!hasConfirmedOrders ? (
              <p className="text-gray-500 text-center py-8">No confirmed orders waiting for pricing</p>
            ) : (
              <div>
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>Important:</strong> Set prices once for all items. These prices will be applied to all {confirmedOrders.length} confirmed orders.
                  </p>
                  <p className="text-sm text-amber-700">Only items that were actually ordered are shown below.</p>
                </div>
                <div className="space-y-4 mb-4">
                  {getOrderedItemsOnly().map(item => {
                    const combinedItem = getCombinedOrder().find(ci => ci.id === item.id);
                    return (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-4 mb-2">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.category}</p>
                            <p className="text-sm text-indigo-600">Total Ordered: {combinedItem?.quantity || 0} units</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price per unit (₹)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Enter price"
                            value={prices[item.id] || ''}
                            onChange={(e) => setPrices({ ...prices, [item.id]: parseFloat(e.target.value) })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={handleApplyPrices} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg">
                  Apply Prices to All {confirmedOrders.length} Orders
                </button>
              </div>
            )}
          </div>
        )}

        {/* Items Management */}
        {view === 'items' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Manage Items</h2>
              <button onClick={() => { setShowItemForm(!showItemForm); setEditingItem(null); setNewItem({ name: '', category: '', image: '' }); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {showItemForm && (
              <form onSubmit={handleCreateItem} className="mb-6 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="px-4 py-2 border rounded-lg" required />
                  <input type="text" placeholder="Category" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="px-4 py-2 border rounded-lg" required />
                  <input type="url" placeholder="Image URL" value={newItem.image} onChange={(e) => setNewItem({ ...newItem, image: e.target.value })} className="px-4 py-2 border rounded-lg" required />
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    {editingItem ? 'Update Item' : 'Create Item'}
                  </button>
                  <button type="button" onClick={() => { setShowItemForm(false); setEditingItem(null); setNewItem({ name: '', category: '', image: '' }); }} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {items.map(item => (
                <div key={item.id} className="border rounded-lg p-4">
                  <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditItem(item)} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-1">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button onClick={() => onDeleteItem(item.id)} className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center justify-center gap-1">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users View */}
        {view === 'users' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Users</h2>
              <button onClick={() => setShowUserForm(!showUserForm)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>

            {showUserForm && (
              <form onSubmit={handleCreateUser} className="mb-6 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="px-4 py-2 border rounded-lg" required />
                  <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="px-4 py-2 border rounded-lg" required />
                  <input type="text" placeholder="Shop Name" value={newUser.shopName} onChange={(e) => setNewUser({ ...newUser, shopName: e.target.value })} className="px-4 py-2 border rounded-lg" required />
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Create User
                  </button>
                  <button type="button" onClick={() => setShowUserForm(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {users.filter(u => u.role === 'user').map(user => (
                <div key={user.id} className="flex justify-between items-center border rounded-lg p-4">
                  <div>
                    <p className="font-semibold text-gray-800">{user.shopName}</p>
                    <p className="text-sm text-gray-600">Username: {user.username}</p>
                  </div>
                  <button onClick={() => onDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;