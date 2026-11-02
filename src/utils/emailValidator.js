// Institutional Email Validation for MITS Gwalior
// Students must use official institute domains: @mitsgwl.ac.in or @mitsgwalior.in

export const ALLOWED_STUDENT_DOMAINS = ['mitsgwl.ac.in', 'mitsgwalior.in'];
export const PRIMARY_STUDENT_DOMAIN = 'mitsgwl.ac.in';
export const INSTITUTION_FACULTY_DOMAIN = 'mitsgwalior.in';

/**
 * Validates whether an email matches institutional rules for student registration.
 * Returns { valid: boolean, error?: string, domain?: string, enrollmentHint?: string }
 */
export function validateStudentEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email address is required.' };
  }

  const clean = email.trim().toLowerCase();
  const parts = clean.split('@');
  
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  const [username, domain] = parts;

  const isAllowed = ALLOWED_STUDENT_DOMAINS.includes(domain);
  if (!isAllowed) {
    return {
      valid: false,
      domain,
      error: `Invalid domain "@${domain}". Registration requires an official MITS college email (@${PRIMARY_STUDENT_DOMAIN} or @${INSTITUTION_FACULTY_DOMAIN}).`
    };
  }

  // Attempt to extract enrollment number or department code if formatted as username (e.g. puneet.btmc25 or 0901cs211045)
  return {
    valid: true,
    domain,
    username,
    cleanEmail: clean
  };
}

export function isInstitutionalEmail(email) {
  const clean = (email || '').trim().toLowerCase();
  return ALLOWED_STUDENT_DOMAINS.some(dom => clean.endsWith(`@${dom}`));
}
