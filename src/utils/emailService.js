// src/utils/emailService.js
// Minimal stub so the app runs without a real mail provider.

export async function sendPasswordResetEmail(email, token) {
  console.log(`[emailService] Password reset → ${email} token=${token}`);
  return true;
}

export async function sendVerificationEmail(email, token) {
  console.log(`[emailService] Verify email → ${email} token=${token}`);
  return true;
}

export async function sendEmail(to, subject, body) {
  console.log(`[emailService] sendEmail → ${to}, subject=${subject}`);
  return true;
}

// Default export for compatibility
const emailService = { sendPasswordResetEmail, sendVerificationEmail };
export default emailService;
