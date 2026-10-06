import { isBefore, parseISO, startOfDay } from 'date-fns';

/**
 * Evaluates compliance status of a tender requirement document.
 * 
 * Rules:
 * 1. 'Missing': Mandatory requirement with no file matched.
 * 2. 'Not provided': Optional requirement with no file matched.
 * 3. 'Expiry date needed': File matched and expiry is required, but no expiry date selected.
 * 4. 'Expired': File matched and expiry date is strictly before the submission deadline.
 * 5. 'OK': File matched and (if expiry required) expiry date is on or after the deadline.
 * 
 * @param {Object} requirement - Tender requirement definition
 * @param {Object|null} matchedFile - Mapped file object or null
 * @param {string|null} expiryDate - Expiry date string (YYYY-MM-DD)
 * @param {string} submissionDeadline - Tender submission deadline date string (YYYY-MM-DD)
 * @returns {{ status: 'OK'|'Missing'|'Expired'|'Expiry date needed'|'Not provided', isBlocking: boolean }}
 */
export function getDocumentStatus(requirement, matchedFile, expiryDate, submissionDeadline) {
  // 1. Missing: Mandatory requirement, no file matched
  if (requirement.mandatory && !matchedFile) {
    return { status: 'Missing', isBlocking: true };
  }

  // 2. Not provided: Optional requirement, no file matched
  if (!requirement.mandatory && !matchedFile) {
    return { status: 'Not provided', isBlocking: false };
  }

  // If a file is matched and the requirement mandates an expiry check
  if (matchedFile && requirement.has_expiry) {
    // 3. Expiry date needed: File matched, but no date entered
    if (!expiryDate) {
      return { status: 'Expiry date needed', isBlocking: true };
    }

    try {
      // Compare dates using date-fns startOfDay for accurate calendar-day comparison
      const expiry = startOfDay(parseISO(expiryDate));
      const deadline = startOfDay(parseISO(submissionDeadline || '2026-11-15'));

      // 4. Expired: Expiry date is before the submission deadline
      if (isBefore(expiry, deadline)) {
        return { status: 'Expired', isBlocking: true };
      }
    } catch (err) {
      console.error('Error parsing dates in statusEngine:', err);
      return { status: 'Expiry date needed', isBlocking: true };
    }
  }

  // 5. OK: Matched, and (if has_expiry) expiry date >= deadline
  return { status: 'OK', isBlocking: false };
}