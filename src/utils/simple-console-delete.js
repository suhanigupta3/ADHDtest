/**
 * Simple Console Script to Delete All Firebase Data
 * 
 * Prerequisites:
 * 1. Import exposeFirebaseToConsole in your App.tsx
 * 2. Make sure you're logged in
 * 3. Open browser console (F12)
 * 4. Copy and paste this script
 * 
 * This script will delete ALL data for the currently logged-in user
 */

(function() {
  'use strict';
  
  // Check if Firebase instances are available
  if (typeof window.firebaseAuth === 'undefined' || typeof window.firebaseDb === 'undefined') {
    console.error('❌ Firebase instances not found on window object.');
    console.log('💡 Make sure to import exposeFirebaseToConsole in your App.tsx');
    console.log('💡 Or use the React component DataCleanupTool instead');
    return;
  }
  
  const auth = window.firebaseAuth;
  const db = window.firebaseDb;
  
  // Get current user
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.error('❌ No user logged in. Please log in first.');
    return;
  }
  
  console.log('🔍 Current User:', currentUser.email);
  console.log('🔑 User ID:', currentUser.uid);
  console.log('⚠️  WARNING: This will delete ALL data for this user!');
  
  // Ask for confirmation
  const confirmed = confirm(
    `Are you sure you want to delete ALL data for user:\n\n${currentUser.email}\n\nThis action cannot be undone!`
  );
  
  if (!confirmed) {
    console.log('❌ Operation cancelled by user');
    return;
  }
  
  console.log('🗑️ Starting deletion process...');
  
  // Function to delete a document and its subcollections
  async function deleteDocumentAndSubcollections(path) {
    try {
      const docRef = db.doc(path);
      const collections = await docRef.listCollections();
      
      // Delete all subcollections first
      for (const collection of collections) {
        const docs = await collection.get();
        for (const doc of docs.docs) {
          await doc.ref.delete();
        }
        console.log(`✅ Deleted subcollection: ${collection.id}`);
      }
      
      // Delete the main document
      await docRef.delete();
      console.log(`✅ Deleted document: ${path}`);
      return true;
    } catch (error) {
      console.log(`ℹ️ No document found or already deleted: ${path}`);
      return false;
    }
  }
  
  // Main deletion function
  async function deleteAllUserData() {
    const userId = currentUser.uid;
    let deletedCount = 0;
    
    try {
      // 1. Delete user consents
      try {
        await db.collection('userConsents').doc(userId).delete();
        console.log('✅ Deleted user consents');
        deletedCount++;
      } catch (error) {
        console.log('ℹ️ No user consents found or already deleted');
      }
      
      // 2. Delete game progress
      try {
        await db.collection('gameProgress').doc(userId).delete();
        console.log('✅ Deleted game progress');
        deletedCount++;
      } catch (error) {
        console.log('ℹ️ No game progress found or already deleted');
      }
      
      // 3. Delete all game data and subcollections
      const games = ['PatternMatch', 'BounceBack', 'FlutterFocus', 'BerryBlitz'];
      
      for (const gameName of games) {
        const gamePath = `users/${userId}/games/${gameName}`;
        const deleted = await deleteDocumentAndSubcollections(gamePath);
        if (deleted) deletedCount++;
      }
      
      // 4. Delete user document
      try {
        await db.collection('users').doc(userId).delete();
        console.log('✅ Deleted user document');
        deletedCount++;
      } catch (error) {
        console.log('ℹ️ No user document found or already deleted');
      }
      
      // 5. Delete FlutterFocus results
      try {
        const flutterResults = await db.collection('flutterFocusResults')
          .where('userId', '==', userId)
          .get();
        
        if (!flutterResults.empty) {
          const batch = db.batch();
          flutterResults.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          console.log(`✅ Deleted ${flutterResults.size} FlutterFocus results`);
          deletedCount++;
        }
      } catch (error) {
        console.log('ℹ️ No FlutterFocus results found or already deleted');
      }
      
      console.log(`🎉 Successfully deleted all data for user ${userId}`);
      console.log(`📊 Total items deleted: ${deletedCount}`);
      
      // Show success message
      alert(`✅ All user data deleted successfully!\n\nTotal items deleted: ${deletedCount}`);
      
    } catch (error) {
      console.error('❌ Error during deletion:', error);
      alert(`❌ Error deleting data: ${error.message}`);
    }
  }
  
  // Check what data exists
  async function checkUserData() {
    const userId = currentUser.uid;
    console.log(`🔍 Checking what data exists for user: ${userId}`);
    
    try {
      // Check user consents
      try {
        const consentDoc = await db.collection('userConsents').doc(userId).get();
        if (consentDoc.exists) {
          console.log('📋 User consents found');
        }
      } catch (error) {
        console.log('ℹ️ No user consents collection');
      }
      
      // Check game progress
      try {
        const gameProgressDoc = await db.collection('gameProgress').doc(userId).get();
        if (gameProgressDoc.exists) {
          console.log('📊 Game progress found');
        }
      } catch (error) {
        console.log('ℹ️ No game progress collection');
      }
      
      // Check game data
      const games = ['PatternMatch', 'BounceBack', 'FlutterFocus', 'BerryBlitz'];
      
      for (const gameName of games) {
        try {
          const gameDoc = await db.collection('users').doc(userId).collection('games').doc(gameName).get();
          if (gameDoc.exists) {
            const roundsSnapshot = await gameDoc.ref.collection('rounds').get();
            if (!roundsSnapshot.empty) {
              console.log(`🎮 ${gameName}: ${roundsSnapshot.size} rounds found`);
            } else {
              console.log(`🎮 ${gameName}: no rounds found`);
            }
          }
        } catch (error) {
          console.log(`🎮 ${gameName}: no data found`);
        }
      }
      
      // Check FlutterFocus results
      try {
        const flutterResults = await db.collection('flutterFocusResults')
          .where('userId', '==', userId)
          .get();
        
        if (!flutterResults.empty) {
          console.log(`📈 FlutterFocus results: ${flutterResults.size} found`);
        } else {
          console.log(`📈 FlutterFocus results: none found`);
        }
      } catch (error) {
        console.log(`📈 FlutterFocus results: collection not accessible`);
      }
      
    } catch (error) {
      console.error('❌ Error checking user data:', error);
    }
  }
  
  // Add functions to global scope
  window.deleteAllUserData = deleteAllUserData;
  window.checkUserData = checkUserData;
  
  console.log('🚀 Functions available:');
  console.log('  - checkUserData()     : Check what data exists');
  console.log('  - deleteAllUserData() : Delete all user data');
  console.log('');
  console.log('💡 Auto-checking user data...');
  
  // Auto-check data
  checkUserData();
  
})();
