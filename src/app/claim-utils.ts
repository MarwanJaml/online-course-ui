import { Claim } from "./models/claim";

/**
 * Populate claims table with appropriate description
 * @param {Record} claims ID token claims
 * @returns claimsTable
 */
export const createClaimsTable = (claims: Record<string, any>): Claim[] => {
    const claimsTable: Claim[] = [];

    if (!claims) return claimsTable;

    Object.keys(claims).forEach((key) => {
        // Skip non-essential claims
        if (['uti', 'rh', 'aio', 'ver'].includes(key)) return;

        let value = claims[key];
        let description = '';

        switch (key) {
            case 'aud':
                description = "Identifies the intended recipient of the token (your app's Application ID)";
                break;
            case 'iss':
                description = 'Identifies the issuer/authorization server that issued the token';
                break;
            case 'iat':
            case 'nbf':
            case 'exp':
                populateClaim(
                    key,
                    changeDateFormat(+value),
                    getTimestampDescription(key),
                    claimsTable
                );
                return;
            case 'name':
                description = "User's display name (may not be unique)";
                break;
            case 'preferred_username':
                description = 'Primary username (email/phone) - mutable, not for authorization';
                break;
            case 'oid':
            case 'sub':
                // Convert to number if possible, otherwise create numeric hash
                value = convertToNumber(value);
                description = key === 'oid'
                    ? 'Immutable user object ID (converted to number)'
                    : 'Unique identifier for the user (converted to number)';
                break;
            case 'tid':
                description = 'Azure AD tenant ID where the user belongs';
                break;
            case 'upn':
                description = 'User Principal Name (may change over time)';
                break;
            case 'email':
                description = "User's email address";
                break;
            case 'roles':
                description = 'Application roles assigned to the user';
                break;
            case 'groups':
                description = 'Azure AD groups the user belongs to';
                break;
            default:
                // Handle any custom claims
                description = '';
        }

        // Handle array values (like roles/groups)
        if (Array.isArray(value)) {
            value.forEach((val) => {
                populateClaim(key, val, description, claimsTable);
            });
        } else {
            populateClaim(key, value, description, claimsTable);
        }
    });

    return claimsTable;
};

// Helper functions
const populateClaim = (claim: string, value: any, description: string, claimsTable: Claim[]): void => {
    claimsTable.push({
        claim: claim,
        value: value,
        description: description
    });
};

const changeDateFormat = (date: number): string => {
    const dateObj = new Date(date * 1000);
    return `${date} - [${dateObj.toString()}]`;
};

const getTimestampDescription = (key: string): string => {
    switch (key) {
        case 'iat': return '"Issued At" - when authentication occurred';
        case 'nbf': return '"Not Before" - token not valid before this time';
        case 'exp': return '"Expiration" - token not valid after this time';
        default: return '';
    }
};

/**
 * Converts a string ID to a number (or original value if conversion isn't possible)
 */
const convertToNumber = (id: any): number | any => {
    if (typeof id === 'number') return id;
    if (typeof id !== 'string') return id;

    // Case 1: Numeric string (e.g., "12345")
    if (/^\d+$/.test(id)) {
        return parseInt(id, 10);
    }

    // Case 2: UUID - create consistent numeric hash
    return hashStringToNumber(id);
};

/**
 * Creates a consistent numeric hash from a string
 */
const hashStringToNumber = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash);
};