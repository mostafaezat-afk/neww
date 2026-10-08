import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  getDocFromServer,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Task, TaskStatus, UserProfile, ServiceCategory, ServiceArea, AppSystemConfig } from '../types';
import { INITIAL_TASKS, INITIAL_USERS_DIRECTORY, SERVICE_CATEGORIES, INITIAL_SERVICE_AREAS, DEFAULT_SYSTEM_CONFIG } from '../mockData';

const TASKS_COLLECTION = 'tasks';
const USERS_COLLECTION = 'users';
const CATEGORIES_COLLECTION = 'categories';
const AREAS_COLLECTION = 'areas';
const CONFIG_COLLECTION = 'system_config';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Validate Firestore connection on boot as required by system guidelines.
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: client is offline.');
      return false;
    }
    // Document might not exist which is expected, but network connection to server succeeded
    return true;
  }
}

// Automatically test connection on module load
testConnection();

/**
 * Subscribes in real-time to all tasks from Firebase Firestore.
 * Automatically synchronizes changes across all devices (phones, tablets, web).
 */
export function subscribeToCloudTasks(
  onUpdate: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  try {
    const tasksRef = collection(db, TASKS_COLLECTION);

    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty on first setup, seed with INITIAL_TASKS so the app looks great immediately
          seedInitialTasks();
          onUpdate(INITIAL_TASKS);
          return;
        }

        const cloudTasks: Task[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Task;
          cloudTasks.push({
            ...data,
            id: docSnap.id,
          });
        });

        onUpdate(cloudTasks);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, TASKS_COLLECTION);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, TASKS_COLLECTION);
    return () => {};
  }
}

/**
 * Seed initial sample tasks to Cloud Firestore if empty.
 */
async function seedInitialTasks() {
  try {
    for (const task of INITIAL_TASKS) {
      await setDoc(doc(db, TASKS_COLLECTION, task.id), task, { merge: true });
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, TASKS_COLLECTION);
  }
}

/**
 * Saves or updates a task in Cloud Firestore so all devices see it immediately.
 */
export async function saveTaskToCloud(task: Task): Promise<void> {
  try {
    await setDoc(doc(db, TASKS_COLLECTION, task.id), task, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${TASKS_COLLECTION}/${task.id}`);
  }
}

/**
 * Updates a task status in Cloud Firestore (in_progress, pending, closed).
 */
export async function updateTaskStatusInCloud(taskId: string, status: TaskStatus): Promise<void> {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(taskRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${TASKS_COLLECTION}/${taskId}`);
  }
}

/**
 * Updates task fields (e.g., rating, comments).
 */
export async function updateTaskFieldsInCloud(taskId: string, fields: Partial<Task>): Promise<void> {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(taskRef, fields);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${TASKS_COLLECTION}/${taskId}`);
  }
}

/**
 * Saves a user profile to Cloud Firestore so users are recognized across devices.
 */
export async function saveUserToCloud(user: UserProfile): Promise<void> {
  try {
    const userId = user.phone || user.id || `user-${Date.now()}`;
    await setDoc(doc(db, USERS_COLLECTION, userId), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COLLECTION}/${user.id}`);
  }
}

/**
 * Seed initial sample users if collection is empty.
 */
export async function seedInitialUsers(): Promise<void> {
  try {
    for (const u of INITIAL_USERS_DIRECTORY) {
      const docKey = u.phone || u.id;
      await setDoc(doc(db, USERS_COLLECTION, docKey), u, { merge: true });
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, USERS_COLLECTION);
  }
}

/**
 * Fetches all registered users from Cloud Firestore.
 */
export async function fetchUsersFromCloud(): Promise<UserProfile[]> {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    if (querySnapshot.empty) {
      await seedInitialUsers();
      return INITIAL_USERS_DIRECTORY;
    }
    const users: UserProfile[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push(docSnap.data() as UserProfile);
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
    return INITIAL_USERS_DIRECTORY;
  }
}

/**
 * Real-time subscription to all registered users (for Admin / Support recharging panel).
 */
export function subscribeToAllUsers(
  onUpdate: (users: UserProfile[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    return onSnapshot(
      usersRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedInitialUsers();
          onUpdate(INITIAL_USERS_DIRECTORY);
          return;
        }
        const users: UserProfile[] = [];
        snapshot.forEach((d) => {
          users.push(d.data() as UserProfile);
        });
        onUpdate(users);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, USERS_COLLECTION);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, USERS_COLLECTION);
    return () => {};
  }
}

/**
 * Real-time subscription to current user's profile in Cloud Firestore.
 * When support/admin recharges their balance or points, this listener immediately updates their app!
 */
export function subscribeToUserProfile(
  userPhone: string,
  onUpdate: (user: UserProfile) => void
): Unsubscribe {
  if (!userPhone) return () => {};
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userPhone);
    return onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        onUpdate(data);
      }
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${USERS_COLLECTION}/${userPhone}`);
    return () => {};
  }
}

/**
 * Recharges balance, points, or free requests for any user in Cloud Firestore.
 * Used by Support / Admin to add funds or points to any user's account.
 */
export async function rechargeUserInCloud(
  userPhoneOrId: string,
  balanceDelta: number,
  pointsDelta: number = 0,
  freeRequestsDelta: number = 0
): Promise<{ success: boolean; updatedUser?: UserProfile; message: string }> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, userPhoneOrId);
    const snap = await getDoc(userDocRef);

    let existingData: UserProfile;
    if (snap.exists()) {
      existingData = snap.data() as UserProfile;
    } else {
      // Find matching user from directory or create fallback
      const found = INITIAL_USERS_DIRECTORY.find(
        (u) => u.phone === userPhoneOrId || u.id === userPhoneOrId
      );
      if (found) {
        existingData = found;
      } else {
        return {
          success: false,
          message: `المستخدم بالرقم (${userPhoneOrId}) غير مسجل في قاعدة البيانات.`,
        };
      }
    }

    const newBalance = Math.max(0, (existingData.balance || 0) + balanceDelta);
    const newPoints = Math.max(0, (existingData.technicianPoints || 0) + pointsDelta);
    const newFreeRequests = Math.max(
      0,
      (existingData.freeRequestsLeft || 0) + freeRequestsDelta
    );

    const updatedUser: UserProfile = {
      ...existingData,
      balance: newBalance,
      technicianPoints: newPoints,
      freeRequestsLeft: newFreeRequests,
    };

    await setDoc(userDocRef, updatedUser, { merge: true });

    return {
      success: true,
      updatedUser,
      message: `تم شحن الحساب بنجاح! الرصيد الجديد: ${newBalance} ج.م | النقاط: ${newPoints} | الطلبات المجانية: ${newFreeRequests}`,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${USERS_COLLECTION}/${userPhoneOrId}`);
    return {
      success: false,
      message: 'تعذر الاتصال بقاعدة البيانات لشحن الحساب، يرجى المحاولة لاحقاً.',
    };
  }
}

/**
 * -------------------------------------------------------------
 * CATEGORIES MANAGEMENT (أقسام وخدمات التطبيق)
 * -------------------------------------------------------------
 */

export function subscribeToCategories(
  onUpdate: (categories: ServiceCategory[]) => void
): Unsubscribe {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedInitialCategories();
          onUpdate(SERVICE_CATEGORIES);
          return;
        }
        const cats: ServiceCategory[] = [];
        snapshot.forEach((d) => {
          cats.push({ ...(d.data() as ServiceCategory), id: d.id });
        });
        onUpdate(cats);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, CATEGORIES_COLLECTION);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, CATEGORIES_COLLECTION);
    return () => {};
  }
}

async function seedInitialCategories() {
  try {
    for (const cat of SERVICE_CATEGORIES) {
      await setDoc(doc(db, CATEGORIES_COLLECTION, cat.id), cat, { merge: true });
    }
  } catch {
    // Ignore seed errors
  }
}

export async function saveCategoryToCloud(cat: ServiceCategory): Promise<boolean> {
  try {
    const catId = cat.id || `cat-${Date.now()}`;
    await setDoc(doc(db, CATEGORIES_COLLECTION, catId), { ...cat, id: catId }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${CATEGORIES_COLLECTION}/${cat.id}`);
    return false;
  }
}

export async function deleteCategoryFromCloud(catId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, catId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${CATEGORIES_COLLECTION}/${catId}`);
    return false;
  }
}

/**
 * -------------------------------------------------------------
 * SERVICE AREAS MANAGEMENT (مناطق وأحياء التغطية)
 * -------------------------------------------------------------
 */

export function subscribeToServiceAreas(
  onUpdate: (areas: ServiceArea[]) => void
): Unsubscribe {
  try {
    const colRef = collection(db, AREAS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          seedInitialAreas();
          onUpdate(INITIAL_SERVICE_AREAS);
          return;
        }
        const areas: ServiceArea[] = [];
        snapshot.forEach((d) => {
          areas.push({ ...(d.data() as ServiceArea), id: d.id });
        });
        onUpdate(areas);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, AREAS_COLLECTION);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, AREAS_COLLECTION);
    return () => {};
  }
}

async function seedInitialAreas() {
  try {
    for (const area of INITIAL_SERVICE_AREAS) {
      await setDoc(doc(db, AREAS_COLLECTION, area.id), area, { merge: true });
    }
  } catch {
    // Ignore seed errors
  }
}

export async function saveServiceAreaToCloud(area: ServiceArea): Promise<boolean> {
  try {
    const areaId = area.id || `area-${Date.now()}`;
    await setDoc(doc(db, AREAS_COLLECTION, areaId), { ...area, id: areaId }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${AREAS_COLLECTION}/${area.id}`);
    return false;
  }
}

export async function deleteServiceAreaFromCloud(areaId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, AREAS_COLLECTION, areaId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${AREAS_COLLECTION}/${areaId}`);
    return false;
  }
}

/**
 * -------------------------------------------------------------
 * SYSTEM CONFIG (إعدادات النظام العامة)
 * -------------------------------------------------------------
 */

export function subscribeToSystemConfig(
  onUpdate: (config: AppSystemConfig) => void
): Unsubscribe {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, 'general');
    return onSnapshot(
      docRef,
      (snap) => {
        if (!snap.exists()) {
          setDoc(docRef, DEFAULT_SYSTEM_CONFIG, { merge: true });
          onUpdate(DEFAULT_SYSTEM_CONFIG);
          return;
        }
        onUpdate(snap.data() as AppSystemConfig);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `${CONFIG_COLLECTION}/general`);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${CONFIG_COLLECTION}/general`);
    return () => {};
  }
}

export async function saveSystemConfigToCloud(config: AppSystemConfig): Promise<boolean> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, 'general');
    await setDoc(docRef, config, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${CONFIG_COLLECTION}/general`);
    return false;
  }
}


