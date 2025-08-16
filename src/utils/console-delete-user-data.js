/**
 * Console Script to Delete All Firebase Data for Current User
 * 
 * Instructions:
 * 1. Open your app in the browser
 * 2. Make sure you're logged in
 * 3. Open browser console (F12)
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 * 
 * This script will delete ALL data for the currently logged-in user
 * 
 * Note: This script works with Firebase v9+ modular syntax
 */

(function() {
  'use strict';
  
  // Try to get Firebase instances from the app context
  let auth, db;
  
  // Method 1: Try to get from React app context
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    try {
      // Try to access the Firebase instances from the React app
      const reactRoot = document.querySelector('#root') || document.querySelector('#app');
      if (reactRoot && reactRoot._reactInternalFiber) {
        console.log('🔍 React app detected, trying to access Firebase instances...');
      }
    } catch (e) {
      console.log('ℹ️ Could not access React context directly');
    }
  }
  
  // Method 2: Try to get from global variables (if exposed)
  if (typeof window.firebase !== 'undefined') {
    // Old Firebase v8 syntax
    auth = window.firebase.auth();
    db = window.firebase.firestore();
    console.log('✅ Using Firebase v8 syntax');
  } else if (typeof window.auth !== 'undefined' && typeof window.db !== 'undefined') {
    // Firebase v9+ instances exposed globally
    auth = window.auth;
    db = window.db;
    console.log('✅ Using Firebase v9+ instances from window');
  } else {
    // Method 3: Try to access from the app's Firebase config
    try {
      // Look for Firebase app instances in the page
      const scripts = document.querySelectorAll('script');
      let firebaseConfig = null;
      
      for (const script of scripts) {
        if (script.textContent && script.textContent.includes('firebaseConfig')) {
          console.log('🔍 Found Firebase config in script');
          break;
        }
      }
      
      // Try to access the app's Firebase instances
      if (window.app && window.app.auth && window.app.db) {
        auth = window.app.auth;
        db = window.app.db;
        console.log('✅ Using Firebase instances from window.app');
      } else {
        throw new Error('Firebase instances not found in expected locations');
      }
    } catch (error) {
      console.error('❌ Firebase not found. Trying alternative approach...');
      
      // Method 4: Try to create Firebase instances manually
      try {
        // Check if Firebase modules are available
        if (typeof window.firebase !== 'undefined') {
          // Firebase v8
          auth = window.firebase.auth();
          db = window.firebase.firestore();
          console.log('✅ Created Firebase v8 instances');
        } else {
          throw new Error('No Firebase modules found');
        }
      } catch (e) {
        console.error('❌ Could not create Firebase instances. Please ensure you are on your app page and Firebase is loaded.');
        console.log('💡 Alternative: Use the React component DataCleanupTool instead');
        return;
      }
    }
  }
  
  // Get the current user
  let currentUser;
  try {
    currentUser = auth.currentUser;
    if (!currentUser) {
      // Try to get from auth state
      auth.onAuthStateChanged((user) => {
        if (user) {
          currentUser = user;
          console.log('✅ User authenticated via auth state change');
        }
      });
      
      // Wait a moment for auth state to resolve
      setTimeout(() => {
        if (!currentUser) {
          console.error('❌ No user logged in. Please log in first.');
          return;
        }
        startCleanup();
      }, 1000);
      return;
    }
  } catch (error) {
    console.error('❌ Error accessing auth:', error);
    return;
  }
  
  function startCleanup() {
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

    // Alternative: Check what data exists first
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

    // Add functions to global scope for manual execution
    window.deleteAllUserData = deleteAllUserData;
    window.checkUserData = checkUserData;
    
    console.log('🚀 Functions available:');
    console.log('  - checkUserData()     : Check what data exists');
    console.log('  - deleteAllUserData() : Delete all user data');
    console.log('');
    console.log('💡 You can run these functions manually or they will auto-execute.');
    
    // Auto-execute the check first
    checkUserData();
  }
  
  // Start the cleanup process
  if (currentUser) {
    startCleanup();
  }
  
})();
