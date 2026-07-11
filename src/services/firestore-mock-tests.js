import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@config/firebase';

const TESTS_COLLECTION = 'mockTests';

// ── Mock Tests Catalog ────────────────────────────────────────────────────────

export async function fetchMockTestCatalog() {
  if (!db) {
    throw new Error('Firestore database not available');
  }

  try {
    const testsRef = collection(db, TESTS_COLLECTION);
    const snapshot = await getDocs(testsRef);
    const tests = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      // Always carry the Firestore document ID as _docId so we can delete by it
      return { ...data, _docId: docSnap.id };
    });
    
    const sorted = [...tests];
    sorted.sort((a, b) => {
      const aTime = a?.startDate ? new Date(a.startDate).getTime() : 0;
      const bTime = b?.startDate ? new Date(b.startDate).getTime() : 0;
      return bTime - aTime;
    });
    return sorted;
  } catch (error) {
    console.error('Error fetching mock tests from Firestore:', error);
    throw error;
  }
}

export async function saveMockTestToFirestore(test) {
  if (!db) {
    throw new Error('Firestore database not available');
  }
  if (!auth?.currentUser) {
    throw new Error('Not authenticated with Firebase');
  }

  const docRef = doc(db, TESTS_COLLECTION, test.id);
  await setDoc(docRef, {
    ...test,
    updatedAt: serverTimestamp(),
    createdAt: test.createdAt || serverTimestamp(),
  }, { merge: true });
}

export async function deleteMockTestFromFirestore(testId) {
  if (!db) {
    throw new Error('Firestore database not available');
  }
  if (!auth?.currentUser) {
    throw new Error('Not authenticated with Firebase');
  }
  if (!testId || typeof testId !== 'string' || !testId.trim()) {
    throw new Error('Invalid test ID — cannot delete.');
  }
  
  const docRef = doc(db, TESTS_COLLECTION, testId.trim());
  await deleteDoc(docRef);
}

export async function addQuestionToTest(testId, question) {
  if (!db) {
    throw new Error('Firestore database not available');
  }
  if (!auth?.currentUser) {
    throw new Error('Not authenticated with Firebase');
  }

  const docRef = doc(db, TESTS_COLLECTION, testId);
  await updateDoc(docRef, {
    questions: arrayUnion(question),
    updatedAt: serverTimestamp(),
  });
}

// ── Seed ──────────────────────────────────────────────────────────────────────

export async function seedMockTestsFromLocal(localTests) {
  if (!db) {
    throw new Error('Firestore database not available');
  }
  if (!auth?.currentUser) {
    throw new Error('Not authenticated with Firebase');
  }

  for (const test of localTests) {
    const docRef = doc(db, TESTS_COLLECTION, test.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        ...test,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }
}