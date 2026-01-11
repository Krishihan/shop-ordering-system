// import { collection, getDocs, addDoc } from 'firebase/firestore';
// import { db } from './config';

// const initialUsers = [
//   { username: 'admin', password: 'admin123', role: 'admin', shopName: 'Admin' },
//   { username: 'shop1', password: 'shop123', role: 'user', shopName: 'Shop One' },
//   { username: 'shop2', password: 'shop123', role: 'user', shopName: 'Shop Two' }
// ];

// export const initializeFirebase = async () => {
//   try {
//     // Check if users already exist
//     const usersCol = collection(db, 'users');
//     const userSnapshot = await getDocs(usersCol);
    
//     if (userSnapshot.empty) {
//       console.log('Initializing default users...');
      
//       for (const user of initialUsers) {
//         await addDoc(usersCol, user);
//       }
      
//       console.log('Default users created successfully!');
//       return true;
//     } else {
//       console.log('Users already exist in database');
//       return false;
//     }
//   } catch (error) {
//     console.error('Error initializing Firebase:', error);
//     return false;
//   }
// };

// // Run this once to initialize your database
// // You can call this from your App.jsx or run it manually in console
// // initializeFirebase();