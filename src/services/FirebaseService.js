import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const saveRunToFirebase = async (runData) => {
  try {
    const runsCollection = collection(db, 'runs');
    const docRef = await addDoc(runsCollection, {
      ...runData,
      timestamp: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving run:', error);
    throw error;
  }
};

export const getUserRuns = async (userId) => {
  try {
    const runsCollection = collection(db, 'runs');
    const q = query(runsCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user runs:', error);
    throw error;
  }
};

export const updateRun = async (runId, updateData) => {
  try {
    const runRef = doc(db, 'runs', runId);
    await updateDoc(runRef, updateData);
  } catch (error) {
    console.error('Error updating run:', error);
    throw error;
  }
};

export const deleteRun = async (runId) => {
  try {
    const runRef = doc(db, 'runs', runId);
    await deleteDoc(runRef);
  } catch (error) {
    console.error('Error deleting run:', error);
    throw error;
  }
};

export const getUserStats = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const runsQuery = query(
      collection(db, 'runs'),
      where('userId', '==', userId)
    );
    const runsSnapshot = await getDocs(runsQuery);
    
    // If we're offline and don't have cached data, throw an error
    if (!userDoc.exists() && !runsSnapshot.docs.length) {
      throw new Error('offline');
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let totalMiles = 0;
    let totalTime = 0;
    let runsThisWeek = 0;
    
    runsSnapshot.forEach(doc => {
      const run = doc.data();
      totalMiles += run.distance || 0;
      totalTime += run.time || 0;
      
      if (new Date(run.timestamp) > weekAgo) {
        runsThisWeek++;
      }
    });
    
    return {
      totalMiles,
      runsThisWeek,
      averagePace: totalMiles > 0 ? totalTime / totalMiles : 0,
      favoriteRoutes: userDoc.data()?.favoriteRoutes?.length || 0
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

export const getUserRoutes = async (userId) => {
  try {
    const routesQuery = query(
      collection(db, 'routes'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(routesQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user routes:', error);
    throw error;
  }
}; 