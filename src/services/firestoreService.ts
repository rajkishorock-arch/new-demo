import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  collectionGroup,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { AnalysisResult, RiskLevel, AnalysisType } from '../engine/phishingEngine';

export type UserRole = 'user' | 'admin';

export interface UserStats {
  totalAnalyses: number;
  highRiskCount: number;
  suspiciousCount: number;
  cautionCount: number;
  lowRiskCount: number;
}

export interface UserProfileData {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  role: UserRole;
  createdAt?: any;
  updatedAt?: any;
  stats: UserStats;
}

export interface StoredAnalysisRecord {
  id: string;
  userId?: string;
  userEmail?: string;
  type: AnalysisType;
  riskScore: number;
  riskLevel: RiskLevel;
  inputSummary: string;
  detectedSignals: string[];
  findingsCount: number;
  recommendations: string[];
  summaryWhy: string;
  createdAt: any;
  fullReportSnapshot?: {
    findings: any[];
    evidenceMap: any;
    engineVersion: string;
  };
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: any;
  status: 'new' | 'read' | 'resolved';
}

const DEFAULT_ADMIN_EMAILS = [
  'admin@phishingdecoder.com',
  'admin@geckhagaria.ac.in',
  'rajkishorock@gmail.com'
];

export const getAdminEmails = (): string[] => {
  const envAdmins = (import.meta as any).env?.VITE_ADMIN_EMAILS
    ? String((import.meta as any).env.VITE_ADMIN_EMAILS).split(',').map(e => e.trim().toLowerCase())
    : [];
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...envAdmins]));
};

// 1. Create or update user profile upon authentication
export const createOrUpdateUserProfile = async (
  user: User,
  extraProfileData?: { fullName?: string }
): Promise<UserProfileData> => {
  if (!user || !user.uid) {
    throw new Error('User UID is missing.');
  }

  const userDocRef = doc(db, 'users', user.uid);
  const displayName =
    extraProfileData?.fullName ||
    user.displayName ||
    (user.email ? user.email.split('@')[0] : 'Security Analyst');

  const userEmail = (user.email || '').trim().toLowerCase();
  const isAdminEmail = getAdminEmails().includes(userEmail);

  const docSnap = await getDoc(userDocRef);

  if (!docSnap.exists()) {
    const assignedRole: UserRole = isAdminEmail ? 'admin' : 'user';

    const newUserData: UserProfileData = {
      uid: user.uid,
      displayName,
      email: user.email || '',
      photoURL: user.photoURL || null,
      role: assignedRole,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      stats: {
        totalAnalyses: 0,
        highRiskCount: 0,
        suspiciousCount: 0,
        cautionCount: 0,
        lowRiskCount: 0
      }
    };

    await setDoc(userDocRef, newUserData);
    return newUserData;
  } else {
    const existing = docSnap.data() as UserProfileData;
    const updates: Record<string, any> = {};

    // Ensure role exists while preserving administrative privileges
    if (!existing.role) {
      existing.role = isAdminEmail ? 'admin' : 'user';
      updates.role = existing.role;
    } else if (isAdminEmail && existing.role !== 'admin') {
      existing.role = 'admin';
      updates.role = 'admin';
    }

    // Ensure stats structure exists if created under an older schema
    if (!existing.stats) {
      existing.stats = {
        totalAnalyses: 0,
        highRiskCount: 0,
        suspiciousCount: 0,
        cautionCount: 0,
        lowRiskCount: 0
      };
      updates.stats = existing.stats;
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(userDocRef, updates).catch(() => {});
    }

    return existing;
  }
};

// 2. Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  if (!uid) return null;
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfileData;
  }
  return null;
};

// 3. Save an analysis record to users/{uid}/analyses exclusively (idempotent write)
export const saveAnalysisRecord = async (
  uid: string,
  result: AnalysisResult,
  userEmail?: string
): Promise<string | null> => {
  if (!uid) {
    console.warn('[Analysis] Cannot save: authenticated UID is missing.');
    return null;
  }

  // Idempotency: Use deterministic result.id as the document ID
  const analysisDocId = result.id;
  const docRef = doc(db, 'users', uid, 'analyses', analysisDocId);

  const signalTitles = result.findings.map(f => f.title);

  const recordData: StoredAnalysisRecord = {
    id: analysisDocId,
    userId: uid,
    userEmail: userEmail || '',
    type: result.type,
    riskScore: result.riskScore,
    riskLevel: result.riskLevel,
    inputSummary: result.inputSummary,
    detectedSignals: signalTitles,
    findingsCount: result.findings.length,
    recommendations: result.recommendations,
    summaryWhy: result.summaryWhy,
    createdAt: serverTimestamp(),
    fullReportSnapshot: {
      findings: result.findings,
      evidenceMap: result.evidenceMap,
      engineVersion: result.engineVersion
    }
  };

  try {
    // Check if this exact analysis document already exists to ensure strict write idempotency
    const existingSnap = await getDoc(docRef);
    const isNewDocument = !existingSnap.exists();

    await setDoc(docRef, recordData, { merge: true });

    // Atomically increment user statistics ONLY for genuinely new documents
    if (isNewDocument) {
      try {
        const userDocRef = doc(db, 'users', uid);
        const updates: Record<string, any> = {
          'stats.totalAnalyses': increment(1),
          updatedAt: serverTimestamp()
        };

        if (result.riskLevel === 'HIGH RISK') {
          updates['stats.highRiskCount'] = increment(1);
        } else if (result.riskLevel === 'SUSPICIOUS') {
          updates['stats.suspiciousCount'] = increment(1);
        } else if (result.riskLevel === 'CAUTION') {
          updates['stats.cautionCount'] = increment(1);
        } else {
          updates['stats.lowRiskCount'] = increment(1);
        }

        await updateDoc(userDocRef, updates).catch(() => {});
      } catch (statErr) {
        // Non-fatal
      }
    }

    return analysisDocId;
  } catch (err: any) {
    console.error(`[Analysis] save failed: ${err?.code} - ${err?.message}`);
    return null;
  }
};

// 4. Get recent analyses for a user (one-time fetch)
export const getUserAnalyses = async (
  uid: string,
  maxRecords: number = 100
): Promise<StoredAnalysisRecord[]> => {
  if (!uid) return [];

  const parseDocSnapshot = (querySnapshot: any): StoredAnalysisRecord[] => {
    const list: StoredAnalysisRecord[] = [];
    querySnapshot.forEach((docSnap: any) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        userId: data.userId || uid,
        userEmail: data.userEmail || '',
        type: data.type || 'url',
        riskScore: data.riskScore ?? 0,
        riskLevel: data.riskLevel || 'LOW',
        inputSummary: data.inputSummary || 'Inspected item',
        detectedSignals: data.detectedSignals || [],
        findingsCount: data.findingsCount ?? (data.detectedSignals?.length || 0),
        recommendations: data.recommendations || [],
        summaryWhy: data.summaryWhy || '',
        createdAt: data.createdAt,
        fullReportSnapshot: data.fullReportSnapshot
      });
    });
    return list;
  };

  try {
    const analysesRef = collection(db, 'users', uid, 'analyses');
    let q;
    try {
      q = query(analysesRef, orderBy('createdAt', 'desc'), limit(maxRecords));
    } catch {
      q = query(analysesRef, limit(maxRecords));
    }
    const snap = await getDocs(q);
    return parseDocSnapshot(snap);
  } catch (err: any) {
    console.error(`[Analysis] Read from users/${uid}/analyses failed (${err?.code}): ${err?.message}`);
    return [];
  }
};

// 5. Real-time listener for user analyses
export const subscribeToUserAnalyses = (
  uid: string,
  onUpdate: (records: StoredAnalysisRecord[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  if (!uid) {
    onUpdate([]);
    return () => {};
  }

  const analysesRef = collection(db, 'users', uid, 'analyses');
  let q;
  try {
    q = query(analysesRef, orderBy('createdAt', 'desc'), limit(100));
  } catch {
    q = query(analysesRef, limit(100));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const records: StoredAnalysisRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        records.push({
          id: docSnap.id,
          userId: data.userId || uid,
          userEmail: data.userEmail || '',
          type: data.type || 'url',
          riskScore: data.riskScore ?? 0,
          riskLevel: data.riskLevel || 'LOW',
          inputSummary: data.inputSummary || 'Inspected item',
          detectedSignals: data.detectedSignals || [],
          findingsCount: data.findingsCount ?? (data.detectedSignals?.length || 0),
          recommendations: data.recommendations || [],
          summaryWhy: data.summaryWhy || '',
          createdAt: data.createdAt,
          fullReportSnapshot: data.fullReportSnapshot
        });
      });
      onUpdate(records);
    },
    (error) => {
      console.warn('[Analysis] Real-time listener error:', error);
      if (onError) onError(error);
    }
  );
};

// 6. Delete an analysis record (deletes from users/{uid}/analyses ONLY)
export const deleteAnalysisRecord = async (uid: string, recordId: string): Promise<boolean> => {
  if (!uid || !recordId) return false;
  try {
    const docRef = doc(db, 'users', uid, 'analyses', recordId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Failed to delete analysis record:', err);
    return false;
  }
};

// 7. ADMIN: Subscribe to all registered users
export const subscribeToAllUsers = (
  onUpdate: (users: UserProfileData[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  const usersRef = collection(db, 'users');
  let q;
  try {
    q = query(usersRef, orderBy('createdAt', 'desc'), limit(200));
  } catch {
    q = query(usersRef, limit(200));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const list: UserProfileData[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfileData;
        list.push({
          ...data,
          uid: docSnap.id,
          role: data.role || 'user'
        });
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('[AdminUsers] Real-time listener error:', error);
      if (onError) onError(error);
    }
  );
};

// 8. ADMIN: Update a user's role (admin-only)
export const updateUserRole = async (
  targetUid: string,
  newRole: UserRole
): Promise<boolean> => {
  if (!targetUid) return false;
  try {
    const userDocRef = doc(db, 'users', targetUid);
    await updateDoc(userDocRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.error('[Admin] Failed to update user role:', err);
    return false;
  }
};

// 9. ADMIN: Subscribe to all analyses across users
// Uses collectionGroup('analyses') with graceful fallback to scanning all users
export const subscribeToAllAnalyses = (
  onUpdate: (records: StoredAnalysisRecord[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  try {
    const groupQuery = query(collectionGroup(db, 'analyses'), orderBy('createdAt', 'desc'), limit(150));
    return onSnapshot(
      groupQuery,
      (snapshot) => {
        const list: StoredAnalysisRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: data.userId || (docSnap.ref.parent?.parent?.id) || '',
            userEmail: data.userEmail || '',
            type: data.type || 'url',
            riskScore: data.riskScore ?? 0,
            riskLevel: data.riskLevel || 'LOW',
            inputSummary: data.inputSummary || 'Inspected item',
            detectedSignals: data.detectedSignals || [],
            findingsCount: data.findingsCount ?? (data.detectedSignals?.length || 0),
            recommendations: data.recommendations || [],
            summaryWhy: data.summaryWhy || '',
            createdAt: data.createdAt,
            fullReportSnapshot: data.fullReportSnapshot
          });
        });
        onUpdate(list);
      },
      async (err) => {
        console.warn('[AdminAnalyses] collectionGroup listener issue, attempting fallback aggregation:', err?.message);
        // Fallback: Fetch directly from users' analyses
        try {
          const usersSnap = await getDocs(query(collection(db, 'users'), limit(50)));
          const allRecords: StoredAnalysisRecord[] = [];
          for (const uDoc of usersSnap.docs) {
            const uData = uDoc.data();
            const aSnap = await getDocs(query(collection(db, 'users', uDoc.id, 'analyses'), limit(20)));
            aSnap.forEach((aDoc) => {
              const d = aDoc.data();
              allRecords.push({
                id: aDoc.id,
                userId: uDoc.id,
                userEmail: uData.email || d.userEmail || '',
                type: d.type || 'url',
                riskScore: d.riskScore ?? 0,
                riskLevel: d.riskLevel || 'LOW',
                inputSummary: d.inputSummary || 'Inspected item',
                detectedSignals: d.detectedSignals || [],
                findingsCount: d.findingsCount ?? (d.detectedSignals?.length || 0),
                recommendations: d.recommendations || [],
                summaryWhy: d.summaryWhy || '',
                createdAt: d.createdAt,
                fullReportSnapshot: d.fullReportSnapshot
              });
            });
          }
          // Sort by createdAt desc
          allRecords.sort((a, b) => {
            const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return tB - tA;
          });
          onUpdate(allRecords);
        } catch (fallbackErr) {
          if (onError) onError(fallbackErr);
        }
      }
    );
  } catch (initErr) {
    if (onError) onError(initErr);
    return () => {};
  }
};

// 10. CONTACT FORM: Submit a real contact message to contactMessages
export const createContactMessage = async (
  name: string,
  email: string,
  message: string,
  subject?: string
): Promise<string | null> => {
  try {
    const colRef = collection(db, 'contactMessages');
    const docRef = await addDoc(colRef, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || 'General Inquiry',
      message: message.trim(),
      status: 'new',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err: any) {
    console.error('[Contact] Failed to submit message:', err);
    return null;
  }
};

// 11. ADMIN: Subscribe to real contact messages
export const subscribeToContactMessages = (
  onUpdate: (messages: ContactMessage[]) => void,
  onError?: (err: any) => void
): Unsubscribe => {
  const colRef = collection(db, 'contactMessages');
  let q;
  try {
    q = query(colRef, orderBy('createdAt', 'desc'), limit(100));
  } catch {
    q = query(colRef, limit(100));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ContactMessage[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          name: d.name || 'Anonymous',
          email: d.email || 'No email',
          subject: d.subject || 'Inquiry',
          message: d.message || '',
          createdAt: d.createdAt,
          status: d.status || 'new'
        });
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('[Contact] Real-time listener error:', err);
      if (onError) onError(err);
    }
  );
};

// 12. ADMIN: Update contact message status
export const updateContactMessageStatus = async (
  messageId: string,
  status: 'new' | 'read' | 'resolved'
): Promise<boolean> => {
  if (!messageId) return false;
  try {
    const docRef = doc(db, 'contactMessages', messageId);
    await updateDoc(docRef, { status });
    return true;
  } catch (err) {
    console.error('[Contact] Failed to update message status:', err);
    return false;
  }
};

// 13. ADMIN: Delete a contact message
export const deleteContactMessage = async (messageId: string): Promise<boolean> => {
  if (!messageId) return false;
  try {
    const docRef = doc(db, 'contactMessages', messageId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('[Contact] Failed to delete contact message:', err);
    return false;
  }
};
