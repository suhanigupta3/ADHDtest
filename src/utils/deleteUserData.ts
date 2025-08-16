import { 
  collection, 
  doc, 
  getDocs, 
  deleteDoc, 
  writeBatch,
  query,
  where,
  collectionGroup
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from 'firebase/auth';

/**
 * Deletes all Firebase data for the specified user
 * This includes:
 * - User consents
 * - Game progress
 * - All game data (PatternMatch, BounceBack, FlutterFocus, BerryBlitz)
 * - Game rounds subcollections
 * - Any other user-specific data
 */
export const deleteAllUserData = async (user: User): Promise<void> => {
  if (!user?.uid) {
    throw new Error('User ID is required');
  }

  const userId = user.uid;
  console.log(`🗑️ Starting deletion of all data for user: ${userId}`);

  try {
    const batch = writeBatch(db);
    let deletedCount = 0;

    // 1. Delete user consents
    try {
      const consentDoc = doc(db, 'userConsents', userId);
      await deleteDoc(consentDoc);
      console.log('✅ Deleted user consents');
      deletedCount++;
    } catch (error) {
      console.log('ℹ️ No user consents found or already deleted');
    }

    // 2. Delete game progress
    try {
      const gameProgressDoc = doc(db, 'gameProgress', userId);
      await deleteDoc(gameProgressDoc);
      console.log('✅ Deleted game progress');
      deletedCount++;
    } catch (error) {
      console.log('ℹ️ No game progress found or already deleted');
    }

    // 3. Delete all game data and subcollections
    const games = ['PatternMatch', 'BounceBack', 'FlutterFocus', 'BerryBlitz'];
    
    for (const gameName of games) {
      try {
        // Delete game rounds subcollections first
        const roundsRef = collection(db, 'users', userId, 'games', gameName, 'rounds');
        const roundsSnapshot = await getDocs(roundsRef);
        
        roundsSnapshot.forEach((roundDoc) => {
          batch.delete(roundDoc.ref);
        });
        
        if (!roundsSnapshot.empty) {
          console.log(`✅ Queued deletion of ${roundsSnapshot.size} rounds for ${gameName}`);
        }

        // Delete the main game document
        const gameDoc = doc(db, 'users', userId, 'games', gameName);
        batch.delete(gameDoc);
        console.log(`✅ Queued deletion of ${gameName} game data`);
        deletedCount++;
      } catch (error) {
        console.log(`ℹ️ No ${gameName} data found or already deleted`);
      }
    }

    // 4. Delete any other user-specific documents in the users collection
    try {
      const userDoc = doc(db, 'users', userId);
      batch.delete(userDoc);
      console.log('✅ Queued deletion of user document');
      deletedCount++;
    } catch (error) {
      console.log('ℹ️ No user document found or already deleted');
    }

    // 5. Delete any documents in the flutterFocusResults collection that belong to this user
    try {
      const flutterResultsQuery = query(
        collection(db, 'flutterFocusResults'),
        where('userId', '==', userId)
      );
      const flutterResultsSnapshot = await getDocs(flutterResultsQuery);
      
      flutterResultsSnapshot.forEach((resultDoc) => {
        batch.delete(resultDoc.ref);
      });
      
      if (!flutterResultsSnapshot.empty) {
        console.log(`✅ Queued deletion of ${flutterResultsSnapshot.size} FlutterFocus results`);
        deletedCount++;
      }
    } catch (error) {
      console.log('ℹ️ No FlutterFocus results found or already deleted');
    }

    // 6. Execute all deletions in a single batch
    if (deletedCount > 0) {
      await batch.commit();
      console.log(`🎉 Successfully deleted all data for user ${userId}`);
      console.log(`📊 Total items queued for deletion: ${deletedCount}`);
    } else {
      console.log('ℹ️ No data found to delete');
    }

  } catch (error) {
    console.error('❌ Error deleting user data:', error);
    throw error;
  }
};

/**
 * Alternative method using individual deletions (more verbose but easier to debug)
 * Use this if you encounter issues with batch operations
 */
export const deleteAllUserDataIndividually = async (user: User): Promise<void> => {
  if (!user?.uid) {
    throw new Error('User ID is required');
  }

  const userId = user.uid;
  console.log(`🗑️ Starting individual deletion of all data for user: ${userId}`);

  try {
    let deletedCount = 0;

    // 1. Delete user consents
    try {
      const consentDoc = doc(db, 'userConsents', userId);
      await deleteDoc(consentDoc);
      console.log('✅ Deleted user consents');
      deletedCount++;
    } catch (error) {
      console.log('ℹ️ No user consents found or already deleted');
    }

    // 2. Delete game progress
    try {
      const gameProgressDoc = doc(db, 'gameProgress', userId);
      await deleteDoc(gameProgressDoc);
      console.log('✅ Deleted game progress');
      deletedCount++;
    } catch (error) {
      console.log('ℹ️ No game progress found or already deleted');
    }

    // 3. Delete all game data and subcollections
    const games = ['PatternMatch', 'BounceBack', 'FlutterFocus', 'BerryBlitz'];
    
    for (const gameName of games) {
      try {
        // Delete game rounds subcollections first
        const roundsRef = collection(db, 'users', userId, 'games', gameName, 'rounds');
        const roundsSnapshot = await getDocs(roundsRef);
        
        for (const roundDoc of roundsSnapshot.docs) {
          await deleteDoc(roundDoc.ref);
        }
        
        if (!roundsSnapshot.empty) {
          console.log(`✅ Deleted ${roundsSnapshot.size} rounds for ${gameName}`);
        }

        // Delete the main game document
        const gameDoc = doc(db, 'users', userId, 'games', gameName);
        await deleteDoc(gameDoc);
        console.log(`✅ Deleted ${gameName} game data`);
        deletedCount++;
      } catch (error) {
        console.log(`ℹ️ No ${gameName} data found or already deleted`);
      }
    }

    // 4. Delete any other user-specific documents in the users collection
    try {
      const userDoc = doc(db, 'users', userId);
      await deleteDoc(userDoc);
      console.log('✅ Deleted user document');
      deletedCount++;
    } catch (error) {
      console.log('ℹ️ No user document found or already deleted');
    }

    // 5. Delete any documents in the flutterFocusResults collection that belong to this user
    try {
      const flutterResultsQuery = query(
        collection(db, 'flutterFocusResults'),
        where('userId', '==', userId)
      );
      const flutterResultsSnapshot = await getDocs(flutterResultsQuery);
      
      for (const resultDoc of flutterResultsSnapshot.docs) {
        await deleteDoc(resultDoc.ref);
      }
      
      if (!flutterResultsSnapshot.empty) {
        console.log(`✅ Deleted ${flutterResultsSnapshot.size} FlutterFocus results`);
        deletedCount++;
      }
    } catch (error) {
      console.log('ℹ️ No FlutterFocus results found or already deleted');
    }

    console.log(`🎉 Successfully deleted all data for user ${userId}`);
    console.log(`📊 Total items deleted: ${deletedCount}`);

  } catch (error) {
    console.error('❌ Error deleting user data:', error);
    throw error;
  }
};

/**
 * Utility function to check what data exists for a user before deletion
 */
export const checkUserDataExists = async (user: User): Promise<void> => {
  if (!user?.uid) {
    throw new Error('User ID is required');
  }

  const userId = user.uid;
  console.log(`🔍 Checking what data exists for user: ${userId}`);

  try {
    // Check user consents
    try {
      const consentDoc = doc(db, 'userConsents', userId);
      const consentSnapshot = await getDocs(collection(db, 'userConsents'));
      const userConsent = consentSnapshot.docs.find(doc => doc.id === userId);
      if (userConsent) {
        console.log('📋 User consents found');
      }
    } catch (error) {
      console.log('ℹ️ No user consents collection');
    }

    // Check game progress
    try {
      const gameProgressDoc = doc(db, 'gameProgress', userId);
      const gameProgressSnapshot = await getDocs(collection(db, 'gameProgress'));
      const userProgress = gameProgressSnapshot.docs.find(doc => doc.id === userId);
      if (userProgress) {
        console.log('📊 Game progress found');
      }
    } catch (error) {
      console.log('ℹ️ No game progress collection');
    }

    // Check game data
    const games = ['PatternMatch', 'BounceBack', 'FlutterFocus', 'BerryBlitz'];
    
    for (const gameName of games) {
      try {
        const gameDoc = doc(db, 'users', userId, 'games', gameName);
        const roundsRef = collection(db, 'users', userId, 'games', gameName, 'rounds');
        const roundsSnapshot = await getDocs(roundsRef);
        
        if (!roundsSnapshot.empty) {
          console.log(`🎮 ${gameName}: ${roundsSnapshot.size} rounds found`);
        } else {
          console.log(`🎮 ${gameName}: no rounds found`);
        }
      } catch (error) {
        console.log(`🎮 ${gameName}: no data found`);
      }
    }

    // Check FlutterFocus results
    try {
      const flutterResultsQuery = query(
        collection(db, 'flutterFocusResults'),
        where('userId', '==', userId)
      );
      const flutterResultsSnapshot = await getDocs(flutterResultsQuery);
      
      if (!flutterResultsSnapshot.empty) {
        console.log(`📈 FlutterFocus results: ${flutterResultsSnapshot.size} found`);
      } else {
        console.log(`📈 FlutterFocus results: none found`);
      }
    } catch (error) {
      console.log(`📈 FlutterFocus results: collection not accessible`);
    }

  } catch (error) {
    console.error('❌ Error checking user data:', error);
  }
};
