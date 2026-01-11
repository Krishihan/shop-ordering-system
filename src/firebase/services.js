import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';

// ============ USERS ============

export const getAllUsers = async () => {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  return userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createUser = async (userData) => {
  // Check if username already exists
  const usersCol = collection(db, 'users');
  const usernameQuery = query(usersCol, where('username', '==', userData.username));
  const usernameSnapshot = await getDocs(usernameQuery);
  
  if (!usernameSnapshot.empty) {
    throw new Error('USERNAME_EXISTS');
  }
  
  // Check if shop name already exists
  const shopNameQuery = query(usersCol, where('shopName', '==', userData.shopName));
  const shopNameSnapshot = await getDocs(shopNameQuery);
  
  if (!shopNameSnapshot.empty) {
    throw new Error('SHOPNAME_EXISTS');
  }
  
  const docRef = await addDoc(usersCol, userData);
  return { id: docRef.id, ...userData };
};

export const updateUser = async (userId, userData) => {
  const userDoc = doc(db, 'users', userId);
  await updateDoc(userDoc, userData);
};

export const deleteUser = async (userId) => {
  const userDoc = doc(db, 'users', userId);
  await deleteDoc(userDoc);
};

export const loginUser = async (username, password) => {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('username', '==', username), where('password', '==', password));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const userDoc = querySnapshot.docs[0];
  return { id: userDoc.id, ...userDoc.data() };
};

// ============ ITEMS ============

export const getAllItems = async () => {
  const itemsCol = collection(db, 'items');
  const itemSnapshot = await getDocs(itemsCol);
  return itemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createItem = async (itemData) => {
  const itemsCol = collection(db, 'items');
  const docRef = await addDoc(itemsCol, itemData);
  return { id: docRef.id, ...itemData };
};

export const updateItem = async (itemId, itemData) => {
  const itemDoc = doc(db, 'items', itemId);
  await updateDoc(itemDoc, itemData);
};

export const deleteItem = async (itemId) => {
  const itemDoc = doc(db, 'items', itemId);
  await deleteDoc(itemDoc);
};

export const subscribeToItems = (callback) => {
  const itemsCol = collection(db, 'items');
  
  return onSnapshot(itemsCol, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
};

// ============ ORDERS ============

export const getAllOrders = async () => {
  const ordersCol = collection(db, 'orders');
  const q = query(ordersCol, orderBy('date', 'desc'));
  const orderSnapshot = await getDocs(q);
  return orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getOrdersByUser = async (userId) => {
  const ordersCol = collection(db, 'orders');
  const q = query(ordersCol, where('userId', '==', userId), orderBy('date', 'desc'));
  const orderSnapshot = await getDocs(q);
  return orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createOrder = async (orderData) => {
  const ordersCol = collection(db, 'orders');
  const docRef = await addDoc(ordersCol, {
    ...orderData,
    date: new Date().toISOString(),
    status: 'pending',
    totalAmount: null,
    batchId: null
  });
  return { id: docRef.id, ...orderData };
};

export const updateOrder = async (orderId, orderData) => {
  const orderDoc = doc(db, 'orders', orderId);
  await updateDoc(orderDoc, orderData);
};

export const confirmOrder = async (orderId) => {
  const orderDoc = doc(db, 'orders', orderId);
  await updateDoc(orderDoc, { status: 'confirmed' });
};

export const deleteOrder = async (orderId) => {
  const orderDoc = doc(db, 'orders', orderId);
  await deleteDoc(orderDoc);
};

// ============ PRICING BATCHES ============

export const createPricingBatch = async (batchData) => {
  const batchesCol = collection(db, 'pricingBatches');
  const docRef = await addDoc(batchesCol, {
    ...batchData,
    createdAt: new Date().toISOString()
  });
  return { id: docRef.id, ...batchData };
};

export const getPricingBatches = async () => {
  const batchesCol = collection(db, 'pricingBatches');
  const q = query(batchesCol, orderBy('createdAt', 'desc'));
  const batchSnapshot = await getDocs(q);
  return batchSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const applyPricingBatch = async (batchId, itemPrices) => {
  // Get all confirmed orders without a batch
  const ordersCol = collection(db, 'orders');
  const q = query(ordersCol, where('status', '==', 'confirmed'), where('batchId', '==', null));
  const orderSnapshot = await getDocs(q);
  
  // Update each order with calculated prices
  const updatePromises = orderSnapshot.docs.map(async (orderDoc) => {
    const order = orderDoc.data();
    let totalAmount = 0;
    
    order.items.forEach(item => {
      totalAmount += item.quantity * (itemPrices[item.id] || 0);
    });
    
    await updateDoc(doc(db, 'orders', orderDoc.id), {
      batchId,
      itemPrices,
      totalAmount,
      status: 'completed'
    });
  });
  
  await Promise.all(updatePromises);
};

// ============ REAL-TIME LISTENERS ============

export const subscribeToOrders = (callback) => {
  const ordersCol = collection(db, 'orders');
  const q = query(ordersCol, orderBy('date', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(orders);
  });
};

export const subscribeToUsers = (callback) => {
  const usersCol = collection(db, 'users');
  
  return onSnapshot(usersCol, (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(users);
  });
};