// import { collection, getDocs, addDoc } from 'firebase/firestore';
// import { db } from './config';


// const initialItems = [
//   { name: 'Tomato 5/6', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1546470427-227b2cd60e5e?w=300', unit: 'BOX', notes: '' },
//   { name: 'Green Pepper (22lb)', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300', unit: 'BOX', notes: '' },
//   { name: 'Spanish Onion (50lb)', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=300', unit: 'CASE', notes: '' },
//   { name: 'Red Onion (25 lb)', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300', unit: 'CASE', notes: '' },
//   { name: 'Romaine Heart Lettuce', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300', unit: 'BOX', notes: '12 BAG' },
//   { name: 'Roma Tomato (6x7)', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300', unit: 'BOX', notes: '' },
//   { name: 'Baby Spinach (2 lb)', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300', unit: 'BAG', notes: '' },
//   { name: 'Carrots (5LB)', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300', unit: 'BAG', notes: '' },
//   { name: 'Broccoli', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300', unit: 'HEAD', notes: '' },
//   { name: 'Green Onion', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1629798365315-fd6bc32af7c3?w=300', unit: 'BUNCH', notes: '' },
//   { name: 'Mushrooms', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1621341005613-a6c8d26a1e28?w=300', unit: 'BOX', notes: '' },
//   { name: 'Cilantro', category: 'Herbs', image: 'https://images.unsplash.com/photo-1599603917277-37177a2df976?w=300', unit: 'BUNCH', notes: '' },
//   { name: 'Red Pepper', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300', unit: 'BOX', notes: '' },
//   { name: 'Rosemary', category: 'Herbs', image: 'https://images.unsplash.com/photo-1584278681403-3c1f3aa09153?w=300', unit: 'BOX', notes: '' },
//   { name: 'Strawberry', category: 'Fruits', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300', unit: 'CASE', notes: '8 BOX' },
//   { name: 'Blueberry', category: 'Fruits', image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=300', unit: 'CASE', notes: '12 BOX' },
//   { name: 'Cantaloupe', category: 'Fruits', image: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=300', unit: 'CASE', notes: '' },
//   { name: 'Honeydew', category: 'Fruits', image: 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?w=300', unit: 'CASE', notes: '' },
//   { name: 'Orange (33LB)', category: 'Fruits', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300', unit: 'EACH', notes: '' },
//   { name: 'Pineapple', category: 'Fruits', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300', unit: 'EACH', notes: '' },
//   { name: 'Grapes (1.5-2 lb)', category: 'Fruits', image: 'https://images.unsplash.com/photo-1599819177795-f0d6a8deb357?w=300', unit: 'BAG', notes: '' },
//   { name: 'Banana', category: 'Fruits', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300', unit: 'BOX', notes: '' },
//   { name: 'Zucchini', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=300', unit: 'BOX', notes: '' },
//   { name: 'Blackberry', category: 'Fruits', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300', unit: 'CASE', notes: '12 BOX' }
// ];

// export const initializeFirebase = async () => {
//   try {
//     let initialized = false;
    
//     // Check and initialize items
//     const itemsCol = collection(db, 'items');
//     const itemSnapshot = await getDocs(itemsCol);
    
//     if (itemSnapshot.empty) {
//       console.log('Initializing default items...');
//       for (const item of initialItems) {
//         await addDoc(itemsCol, item);
//       }
//       console.log('Default items created!');
//       initialized = true;
//     }
    
//     if (initialized) {
//       return true;
//     } else {
//       console.log('Database already initialized');
//       return false;
//     }
//   } catch (error) {
//     console.error('Error initializing Firebase:', error);
//     return false;
//   }
// };