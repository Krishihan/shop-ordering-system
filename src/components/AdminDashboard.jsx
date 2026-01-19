import React, { useState } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  Plus,
  Trash2,
  LogOut,
  FileText,
  DollarSign,
  Edit2,
  BoxIcon,
  Download,
  History,
  Database // Added Database Icon
} from 'lucide-react';

// Added onInitializeDatabase to props
const AdminDashboard = ({
  users,
  items,
  orders,
  onCreateUser,
  onDeleteUser,
  onConfirmOrder,
  onApplyGlobalPrices,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onLogout,
  // onInitializeDatabase // New Prop
}) => {
  const [view, setView] = useState('orders');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [prices, setPrices] = useState({});
  const [userError, setUserError] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', shopName: '' });
  const [newItem, setNewItem] = useState({ name: '', category: '', image: '', unit: 'BOX' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // New state for initialization loading
  const [isInitializing, setIsInitializing] = useState(false);

  // Separate current and past orders
  const currentOrders = orders.filter(o => o.status === 'pending' || (o.status === 'confirmed' && !o.batchId));
  const pastOrders = orders.filter(o => o.status === 'completed' && o.batchId);
  const confirmedOrders = orders.filter(o => o.status === 'confirmed' && !o.batchId);
  const hasConfirmedOrders = confirmedOrders.length > 0;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError('');
    const result = await onCreateUser(newUser);
    if (result.success) {
      setNewUser({ username: '', password: '', shopName: '' });
      setShowUserForm(false);
    } else {
      setUserError(result.error);
    }
  };

  const handleCreateItem = (e) => {
    e.preventDefault();
    if (editingItem) {
      onUpdateItem(editingItem.id, newItem);
      setEditingItem(null);
    } else {
      onCreateItem(newItem);
    }
    setNewItem({ name: '', category: '', image: '', unit: 'BOX' });
    setShowItemForm(false);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    // Add unit here
    setNewItem({ name: item.name, category: item.category, image: item.image, unit: item.unit || 'BOX' });
    setShowItemForm(true);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // // New Handler for Database Initialization
  // const handleInitializeClick = async () => {
  //   if (!onInitializeDatabase) return;
  //   if (window.confirm("This will add default users and items if the database is empty. Continue?")) {
  //     setIsInitializing(true);
  //     await onInitializeDatabase();
  //     setIsInitializing(false);
  //     alert("Initialization check complete!");
  //   }
  // };

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
      setView('orders');
    }
  };

  const generateCombinedPDF = () => {
    const combined = getCombinedOrder();
    const pdfContent = `
═══════════════════════════════════════
    COMBINED ORDER FOR PURCHASE
═══════════════════════════════════════

Generated: ${new Date().toLocaleString()}
Total Confirmed Orders: ${confirmedOrders.length}

Items to Purchase:
───────────────────────────────────────
${combined.map((item, i) => `${i + 1}. ${item.name} (${item.category})
   Quantity: ${item.quantity} units`).join('\n\n')}

═══════════════════════════════════════
Use this list for bulk purchasing
═══════════════════════════════════════
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `combined-order-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const generateUserReceipt = (order) => {
    const user = users.find(u => u.id === order.userId);
    const receipt = `
═══════════════════════════════════════
            ORDER RECEIPT
═══════════════════════════════════════

Shop: ${user?.shopName}
Order ID: ${order.id.slice(0, 8)}
Date: ${new Date(order.date).toLocaleString()}
Status: ${order.status.toUpperCase()}

Items:
───────────────────────────────────────
${order.items.map((item, i) => {
      const price = order.itemPrices?.[item.id] || 0;
      const total = item.quantity * price;
      return `${i + 1}. ${item.name}
   Qty: ${item.quantity} × ₹${price.toFixed(2)} = ₹${total.toFixed(2)}`;
    }).join('\n\n')}

───────────────────────────────────────
TOTAL AMOUNT: ₹${order.totalAmount?.toFixed(2) || '0.00'}
───────────────────────────────────────

Thank you for your order!
═══════════════════════════════════════
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${user?.shopName}-${order.id.slice(0, 8)}.txt`;
    a.click();
  };

  const groupOrdersByBatch = () => {
    const batches = {};
    pastOrders.forEach(order => {
      if (!batches[order.batchId]) {
        batches[order.batchId] = [];
      }
      batches[order.batchId].push(order);
    });
    return Object.entries(batches).reverse();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm">Manage orders, users, and inventory</p>
          </div>

          <div className="flex gap-3">
            {/* NEW: Database Initialization Button */}
            {/* {onInitializeDatabase && (
              <button 
                onClick={handleInitializeClick} 
                disabled={isInitializing}
                className={`flex items-center gap-2 px-4 py-2 border border-indigo-200 text-indigo-700 rounded-lg transition-all ${isInitializing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50 hover:scale-105'}`}
              >
                <Database className={`w-4 h-4 ${isInitializing ? 'animate-spin' : ''}`} />
                {isInitializing ? 'Seeding...' : 'Seed DB'}
              </button>
            )} */}

            <button onClick={handleLogoutClick} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all hover:scale-105">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4 mb-6 flex-wrap">
          <button onClick={() => setView('orders')} className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${view === 'orders' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <Package className="w-4 h-4 inline mr-2" />
            Current Orders
          </button>
          <button onClick={() => setView('history')} className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${view === 'history' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <History className="w-4 h-4 inline mr-2" />
            Past Orders
          </button>
          <button onClick={() => setView('combined')} className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${view === 'combined' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <ShoppingCart className="w-4 h-4 inline mr-2" />
            Combined Order
            {hasConfirmedOrders && <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">{confirmedOrders.length}</span>}
          </button>
          <button onClick={() => setView('pricing')} className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${view === 'pricing' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <DollarSign className="w-4 h-4 inline mr-2" />
            Set Prices
            {hasConfirmedOrders && <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">!</span>}
          </button>
          <button onClick={() => setView('items')} className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${view === 'items' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <BoxIcon className="w-4 h-4 inline mr-2" />
            Items
          </button>
          <button onClick={() => setView('users')} className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${view === 'users' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
            <Users className="w-4 h-4 inline mr-2" />
            Users
          </button>
        </div>

        {/* Current Orders View */}
        {view === 'orders' && (
          <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Current Orders</h2>
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <button onClick={handleConfirmAllOrders} className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-md text-sm flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Confirm All Pending ({orders.filter(o => o.status === 'pending').length})
                </button>
              )}
            </div>
            {currentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No current orders</p>
            ) : (
              <div className="space-y-4">
                {currentOrders.map(order => {
                  const user = users.find(u => u.id === order.userId);
                  return (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">{user?.shopName}</p>
                          <p className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          {order.status === 'pending' && (
                            <button onClick={() => onConfirmOrder(order.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 text-sm">
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Past Orders (History) View */}
        {view === 'history' && (
          <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Past Orders (Completed Batches)</h2>
            {pastOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No past orders yet</p>
            ) : (
              <div className="space-y-6">
                {groupOrdersByBatch().map(([batchId, batchOrders], batchIndex) => (
                  <div key={batchId} className="border-2 border-indigo-200 rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-blue-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg text-indigo-900">Batch #{batchIndex + 1}</h3>
                      <span className="text-sm text-gray-600">{batchOrders.length} orders</span>
                    </div>
                    <div className="space-y-3">
                      {batchOrders.map(order => {
                        const user = users.find(u => u.id === order.userId);
                        return (
                          <div key={order.id} className="bg-white border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-semibold text-gray-800">Order #{order.id.slice(0, 8)}</p>
                                <p className="text-sm text-gray-600">{user?.shopName}</p>
                                <p className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                  Completed
                                </span>
                                <button onClick={() => generateUserReceipt(order)} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105" title="Download Receipt">
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2 mb-3">
                              {order.items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span className="text-gray-700">{item.name}</span>
                                  <div className="text-right">
                                    <span className="text-gray-600">x {item.quantity} </span>
                                    <span className="text-gray-500">@ ₹{(order.itemPrices?.[item.id] || 0).toFixed(2)}</span>
                                    <span className="ml-2 font-medium">₹{(item.quantity * (order.itemPrices?.[item.id] || 0)).toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="pt-3 border-t flex justify-between font-semibold">
                              <span>Total Amount:</span>
                              <span className="text-green-600">₹{order.totalAmount?.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Combined Order View */}
        {view === 'combined' && (
          <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Combined Order (Confirmed Orders)</h2>
            {!hasConfirmedOrders ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No confirmed orders yet. Confirm orders first.</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong className="text-lg">{confirmedOrders.length}</strong> confirmed orders ready for pricing
                  </p>
                </div>
                <div className="space-y-3">
                  {getCombinedOrder().map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-3 hover:bg-gray-50 px-2 rounded transition-colors">
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      <p className="text-lg font-bold text-indigo-600">Qty: {item.quantity}</p>
                    </div>
                  ))}
                  <button onClick={generateCombinedPDF} className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg font-medium flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" />
                    Download Purchase List
                  </button>
                  <button onClick={() => setView('pricing')} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg font-medium flex items-center justify-center gap-2">
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
          <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Set Item Prices (One-Time)</h2>
            {!hasConfirmedOrders ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No confirmed orders waiting for pricing</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 mb-2">
                    <strong>Important:</strong> Set prices once for all items. These prices will be applied to all {confirmedOrders.length} confirmed orders.
                  </p>
                  <p className="text-sm text-amber-700">Only items that were actually ordered are shown below.</p>
                </div>
                <div className="space-y-4 mb-4">
                  {getOrderedItemsOnly().map(item => {
                    const combinedItem = getCombinedOrder().find(ci => ci.id === item.id);
                    return (
                      <div key={item.id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 mb-3">
                          <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg shadow-sm" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-lg">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.category}</p>
                            <p className="text-sm font-medium text-indigo-600">Total Ordered: {combinedItem?.quantity || 0} units</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price per unit (₹)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Enter price"
                            value={prices[item.id] || ''}
                            onChange={(e) => setPrices({ ...prices, [item.id]: parseFloat(e.target.value) })}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            required
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={handleApplyPrices} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg font-medium text-lg">
                  Apply Prices to All {confirmedOrders.length} Orders
                </button>
              </div>
            )}
          </div>
        )}

        {/* Items Management */}
        {view === 'items' && (
          <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Manage Items</h2>
              <button onClick={() => { setShowItemForm(!showItemForm); setEditingItem(null); setNewItem({ name: '', category: '', image: '' }); }} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {showItemForm && (
              <form onSubmit={handleCreateItem} className="mb-6 p-4 border-2 border-indigo-200 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 animate-slideDown">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />

                  {/* NEW UNIT SELECTOR */}
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="BOX">BOX</option>
                    <option value="CASE">CASE</option>
                    <option value="EACH">EACH</option>
                    <option value="BUNCH">BUNCH</option>
                    <option value="HEAD">HEAD</option>
                    <option value="BAG">BAG</option>
                    <option value="KG">KG</option>
                  </select>

                  <input
                    type="url"
                    placeholder="Image URL"
                    value={newItem.image}
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105">
                    {editingItem ? 'Update Item' : 'Create Item'}
                  </button>
                  <button type="button" onClick={() => { setShowItemForm(false); setEditingItem(null); setNewItem({ name: '', category: '', image: '' }); }} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {items.map(item => (
                <div key={item.id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all transform hover:scale-105">
                  <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3 shadow-sm" />
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditItem(item)} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-1">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button onClick={() => onDeleteItem(item.id)} className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm flex items-center justify-center gap-1">
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
          <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Manage Users</h2>
              <button onClick={() => { setShowUserForm(!showUserForm); setUserError(''); }} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>

            {showUserForm && (
              <form onSubmit={handleCreateUser} className="mb-6 p-4 border-2 border-indigo-200 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 animate-slideDown">
                {userError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm font-medium">❌ {userError}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
                  <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
                  <input type="text" placeholder="Shop Name" value={newUser.shopName} onChange={(e) => setNewUser({ ...newUser, shopName: e.target.value })} className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105">
                    Create User
                  </button>
                  <button type="button" onClick={() => { setShowUserForm(false); setUserError(''); }} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {users.filter(u => u.role === 'user').map(user => (
                <div key={user.id} className="flex justify-between items-center border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div>
                    <p className="font-semibold text-gray-800">{user.shopName}</p>
                    <p className="text-sm text-gray-600">Username: {user.username}</p>
                  </div>
                  <button onClick={() => onDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-all transform hover:scale-110">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
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
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;