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
const SUBMISSIONS_COLLECTION = 'mockTestSubmissions';

// ── Mock Tests Catalog ────────────────────────────────────────────────────────

export async function fetchMockTestCatalog() {
  if (!db) {
    throw new Error('Firestore database not available');
  }

  try {
    const testsRef = collection(db, TESTS_COLLECTION);
    const snapshot = await getDocs(testsRef);
    const tests = snapshot.docs.map((docSnap) => docSnap.data());
    
    return tests.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
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
  
  const docRef = doc(db, TESTS_COLLECTION, testId);
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

// ── Submissions ───────────────────────────────────────────────────────────────

export async function fetchSubmissions(testId = null) {
  if (!db) {
    throw new Error('Firestore database not available');
  }

  try {
    let q = collection(db, SUBMISSIONS_COLLECTION);
    if (testId) {
      q = query(q, where('testId', '==', testId));
    }
    
    const snapshot = await getDocs(q);
    const submissions = snapshot.docs.map(docSnap => docSnap.data());
    return submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  } catch (error) {
    console.error('Error fetching submissions from Firestore:', error);
    throw error;
  }
}

export async function saveSubmission(submission) {
  if (!db) {
    throw new Error('Firestore database not available');
  }
  if (!auth?.currentUser) {
    throw new Error('Not authenticated with Firebase');
  }

  const docRef = doc(db, SUBMISSIONS_COLLECTION, submission.id);
  await setDoc(docRef, {
    ...submission,
    createdAt: serverTimestamp(),
  });
}

export async function deleteSubmission(submissionId) {
  if (!db) {
    throw new Error('Firestore database not available');
  }
  if (!auth?.currentUser) {
    throw new Error('Not authenticated with Firebase');
  }
  
  const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
  await deleteDoc(docRef);
}

export function subscribeToSubmissions(callback) {
  if (!db) {
    throw new Error('Firestore database not available');
  }

  const q = query(collection(db, SUBMISSIONS_COLLECTION), orderBy('submittedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const submissions = snapshot.docs.map((docSnap) => docSnap.data());
    callback(submissions);
  }, (error) => {
    console.error('Error subscribing to submissions:', error);
    throw error;
  });
}

export async function fetchStudentSubmissions(uid) {
  if (!db) {
    throw new Error('Firestore database not available');
  }

  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where('submittedByUid', '==', uid)
    );
    const snapshot = await getDocs(q);
    const submissions = snapshot.docs.map(docSnap => docSnap.data());
    return submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    throw error;
  }
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