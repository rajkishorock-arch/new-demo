import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { AnalysisResult, RiskLevel, AnalysisType } from '../engine/phishingEngine';

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
  createdAt?: any;
  updatedAt?: any;
  stats: UserStats;
}

export interface StoredAnalysisRecord {
  id: string;
  type: AnalysisType;
  riskScore: number;
  riskLevel: RiskLevel;
  inputSummary: string;
  detectedSignals: string[];
  findingsCount: number;
  recommendations: string[];
  summaryWhy: string;
  createdAt: any;
  // Non-sensitive full report snapshot for re-inspection
  fullReportSnapshot?: {
    findings: any[];
    evidenceMap: any;
    engineVersion: string;
  };
}

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

  const docSnap = await getDoc(userDocRef);

  if (!docSnap.exists()) {
    const newUserData: UserProfileData = {
      uid: user.uid,
      displayName,
      email: user.email || '',
      photoURL: user.photoURL || null,
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
    // Ensure stats structure exists if created under an older schema
    if (!existing.stats) {
      existing.stats = {
        totalAnalyses: 0,
        highRiskCount: 0,
        suspiciousCount: 0,
        cautionCount: 0,
        lowRiskCount: 0
      };
      await updateDoc(userDocRef, { stats: existing.stats });
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

// 3. Save an analysis record to users/{uid}/analyses and update user aggregate metrics
export const saveAnalysisRecord = async (
  uid: string,
  result: AnalysisResult
): Promise<string | null> => {
  if (!uid) return null;

  try {
    const analysesRef = collection(db, 'users', uid, 'analyses');

    // Extract non-sensitive signals for indexing & display
    const signalTitles = result.findings.map(f => f.title);

    const recordData: Omit<StoredAnalysisRecord, 'id'> = {
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

    const docRef = await addDoc(analysesRef, recordData);

    // Atomically increment user statistics
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

    await updateDoc(userDocRef, updates).catch(() => {
      // Ignore if user doc not fully initialized
    });

    return docRef.id;
  } catch (err) {
    console.error('Failed to save analysis record to Firestore:', err);
    return null;
  }
};

// 4. Get recent analyses for a user
export const getUserAnalyses = async (
  uid: string,
  maxRecords: number = 50
): Promise<StoredAnalysisRecord[]> => {
  if (!uid) return [];

  try {
    const analysesRef = collection(db, 'users', uid, 'analyses');
    const q = query(analysesRef, orderBy('createdAt', 'desc'), limit(maxRecords));
    const querySnapshot = await getDocs(q);

    const records: StoredAnalysisRecord[] = [];
    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      records.push({
        id: docSnap.id,
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

    return records;
  } catch (err) {
    console.error('Failed to fetch user analyses from Firestore:', err);
    return [];
  }
};

// 5. Delete an analysis record
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
