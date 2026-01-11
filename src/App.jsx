import React, { useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';


const App = () => {
  const {
    currentUser,
    users,
    items,
    orders,
    loading,
    handleLogin,
    handleLogout,
    handleCreateOrder,
    handleUpdateOrder,
    handleConfirmOrder,
    handleApplyGlobalPrices,
    handleCreateUser,
    handleDeleteUser,
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem
  } = useAppState();

  // Initialize Firebase with default users (runs once)
  // useEffect(() => {
  //   initializeFirebase();
  // }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
    return (
      <AdminDashboard
        users={users}
        items={items}
        orders={orders}
        onCreateUser={handleCreateUser}
        onDeleteUser={handleDeleteUser}
        onConfirmOrder={handleConfirmOrder}
        onApplyGlobalPrices={handleApplyGlobalPrices}
        onCreateItem={handleCreateItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <UserDashboard
      user={currentUser}
      items={items}
      orders={orders}
      onCreateOrder={handleCreateOrder}
      onUpdateOrder={handleUpdateOrder}
      onLogout={handleLogout}
    />
  );
};

export default App;