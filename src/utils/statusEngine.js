import { isBefore, parseISO, startOfDay } from 'date-fns';

export function getDocumentStatus(requirement, matchedFile, expiryDate, submissionDeadline) {
    // 1. Missing: Required document, no file matched[cite: 15]
    if (requirement.mandatory && !matchedFile) {
        return { status: 'Missing', isBlocking: true };
    }

    // 2. Not provided: Optional document, no file matched[cite: 15]
    if (!requirement.mandatory && !matchedFile) {
        return { status: 'Not provided', isBlocking: false };
    }

    // If we have a file, we check expiry rules
    if (matchedFile && requirement.has_expiry) {
        // 3. Expiry date needed: File matched, but no date entered[cite: 15]
        if (!expiryDate) {
            return { status: 'Expiry date needed', isBlocking: true };
        }

        // Compare dates (stripping time to compare purely by day)
        const expiry = startOfDay(parseISO(expiryDate));
        const deadline = startOfDay(parseISO(submissionDeadline));

        // 4. Expired: Expiry date is before the submission deadline[cite: 15]
        if (isBefore(expiry, deadline)) {
            return { status: 'Expired', isBlocking: true };
        }
    }

    // 5. OK: Matched, and (if has_expiry) expiry date >= deadline[cite: 15]
    return { status: 'OK', isBlocking: false };
}