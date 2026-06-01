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
import { db } from '@config/firebase';
import {
  getMockTestCatalog as localGetMockTestCatalog,
  saveMockTestCatalog as localSaveMockTestCatalog,
  getMockTestSubmissions as localGetSubmissions,
  saveMockTestSubmission as localSaveSubmission,
  setMockTestSubmissions as localSetSubmissions,
} from '@utils/mock-test-storage';

const TESTS_COLLECTION = 'mockTests';
const SUBMISSIONS_COLLECTION = 'mockTestSubmissions';

// ── Mock Tests Catalog ────────────────────────────────────────────────────────

export async function fetchMockTestCatalog() {
  if (!db) return localGetMockTestCatalog([]);

  try {
    const testsRef = collection(db, TESTS_COLLECTION);
    const snapshot = await getDocs(testsRef);
    const tests = snapshot.docs.map((docSnap) => docSnap.data());
    
    // Sort by startDate descending by default, or just return as is
    return tests.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  } catch (error) {
    console.error('Error fetching mock tests from Firestore:', error);
    return localGetMockTestCatalog([]);
  }
}

export async function saveMockTestToFirestore(test) {
  if (!db) {
    // In local mode, just grab the existing, update this one, and save.
    const current = localGetMockTestCatalog([]);
    const existingIndex = current.findIndex(t => t.id === test.id);
    if (existingIndex >= 0) {
      current[existingIndex] = test;
    } else {
      current.push(test);
    }
    localSaveMockTestCatalog(current);
    return;
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
    const current = localGetMockTestCatalog([]);
    localSaveMockTestCatalog(current.filter(t => t.id !== testId));
    return;
  }
  const docRef = doc(db, TESTS_COLLECTION, testId);
  await deleteDoc(docRef);
}

export async function addQuestionToTest(testId, question) {
  if (!db) {
    const current = localGetMockTestCatalog([]);
    const testIndex = current.findIndex(t => t.id === testId);
    if (testIndex >= 0) {
      current[testIndex].questions = current[testIndex].questions || [];
      current[testIndex].questions.push(question);
      localSaveMockTestCatalog(current);
    }
    return;
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
    let localSubmissions = localGetSubmissions();
    if (testId) {
      localSubmissions = localSubmissions.filter(s => s.testId === testId);
    }
    return localSubmissions;
  }

  try {
    let q = collection(db, SUBMISSIONS_COLLECTION);
    if (testId) {
      q = query(q, where('testId', '==', testId));
    }
    
    const snapshot = await getDocs(q);
    const submissions = snapshot.docs.map(docSnap => docSnap.data());
    // Sort by submittedAt descending
    return submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  } catch (error) {
    console.error('Error fetching submissions from Firestore:', error);
    return localGetSubmissions();
  }
}

export async function saveSubmission(submission) {
  if (!db) {
    return localSaveSubmission(submission);
  }

  const docRef = doc(db, SUBMISSIONS_COLLECTION, submission.id);
  await setDoc(docRef, {
    ...submission,
    createdAt: serverTimestamp(),
  });
}

export async function deleteSubmission(submissionId) {
  if (!db) {
    const current = localGetSubmissions();
    const updated = current.filter(s => s.id !== submissionId);
    localSetSubmissions(updated);
    return;
  }
  const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
  await deleteDoc(docRef);
}

export function subscribeToSubmissions(callback) {
  if (!db) {
    // Return a mock unsubscribe function if offline
    callback(localGetSubmissions());
    return () => {};
  }

  const q = query(collection(db, SUBMISSIONS_COLLECTION), orderBy('submittedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const submissions = snapshot.docs.map((docSnap) => docSnap.data());
    callback(submissions);
  }, (error) => {
    console.error('Error subscribing to submissions:', error);
    // fallback
    callback(localGetSubmissions());
  });
}

export async function fetchStudentSubmissions(uid) {
  if (!db) {
    const localSubmissions = localGetSubmissions();
    return localSubmissions.filter(s => s.submittedByUid === uid);
  }

  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where('submittedByUid', '==', uid)
    );
    const snapshot = await getDocs(q);
    const submissions = snapshot.docs.map(docSnap => docSnap.data());
    // Sort by submittedAt descending
    return submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    const localSubmissions = localGetSubmissions();
    return localSubmissions.filter(s => s.submittedByUid === uid);
  }
}

// ── Seed ──────────────────────────────────────────────────────────────────────

export async function seedMockTestsFromLocal(localTests) {
  if (!db) return;

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
