import { adminAuth, adminDb } from './admin-config';

/**
 * Verify if an email is an admin (checks ADMIN_EMAILS env var).
 */
export function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.trim().toLowerCase());
}

/**
 * Set custom claim for admin user
 */
export async function setAdminClaim(uid: string): Promise<void> {
  try {
    await adminAuth.setCustomUserClaims(uid, { admin: true });
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw error;
  }
}

/**
 * Create admin user
 */
export async function createAdminUser(email: string, password: string, name: string) {
  try {
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Set admin claim
    await setAdminClaim(userRecord.uid);

    // Add to admins collection
    await adminDb.collection('admins').doc(email).set({
      email,
      name,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return userRecord;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

/**
 * Verify ID token and check admin status
 */
export async function verifyAdminToken(idToken: string): Promise<{ uid: string; email?: string; isAdmin: boolean }> {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!email) {
      return { uid: decodedToken.uid, isAdmin: false };
    }

    const adminStatus = isAdmin(email);

    return {
      uid: decodedToken.uid,
      email,
      isAdmin: adminStatus,
    };
  } catch (error) {
    console.error('Error verifying admin token:', error);
    throw error;
  }
}

import admin from './admin-config';
