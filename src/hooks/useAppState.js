import { useState, useEffect } from 'react';
import {
  getAllUsers,
  createUser,
  deleteUser as deleteUserService,
  loginUser,
  getAllOrders,
  getAllItems,
  createItem,
  updateItem,
  deleteItem as deleteItemService,
  createOrder as createOrderService,
  updateOrder as updateOrderService,
  confirmOrder,
  createPricingBatch,
  applyPricingBatch,
  subscribeToOrders,
  subscribeToUsers,
  subscribeToItems
} from '../firebase/services';

export const useAppState = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data and set up real-time listeners
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedUsers = await getAllUsers();
        const loadedOrders = await getAllOrders();
        const loadedItems = await getAllItems();
        
        setUsers(loadedUsers);
        setOrders(loadedOrders);
        setItems(loadedItems);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();

    // Set up real-time listeners
    const unsubscribeOrders = subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
    });

    const unsubscribeUsers = subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);
    });

    const unsubscribeItems = subscribeToItems((updatedItems) => {
      setItems(updatedItems);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeUsers();
      unsubscribeItems();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleLogin = async (username, password) => {
    try {
      const user = await loginUser(username, password);
      if (user) {
        setCurrentUser(user);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCreateOrder = async (userId, items) => {
    try {
      const orderData = {
        userId,
        items,
      };
      await createOrderService(orderData);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  const handleUpdateOrder = async (orderId, items) => {
    try {
      await updateOrderService(orderId, { items });
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await confirmOrder(orderId);
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Failed to confirm order. Please try again.');
    }
  };

  const handleApplyGlobalPrices = async (itemPrices) => {
    try {
      const batchId = `batch_${Date.now()}`;
      await createPricingBatch({
        itemPrices,
        batchId
      });
      await applyPricingBatch(batchId, itemPrices);
    } catch (error) {
      console.error('Error applying prices:', error);
      alert('Failed to apply prices. Please try again.');
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await createUser({
        ...userData,
        role: 'user'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUserService(userId);
        
        const userOrders = orders.filter(o => o.userId === userId);
        for (const order of userOrders) {
          const { deleteOrder } = await import('../firebase/services');
          await deleteOrder(order.id);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleCreateItem = async (itemData) => {
    try {
      await createItem(itemData);
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item. Please try again.');
    }
  };

  const handleUpdateItem = async (itemId, itemData) => {
    try {
      await updateItem(itemId, itemData);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItemService(itemId);
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  return {
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
  };
};