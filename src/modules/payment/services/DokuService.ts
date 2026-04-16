import crypto from 'crypto';

/**
 * Helper to get DOKU keys directly from Environment Variables for maximum security.
 */
function getDokuEnvConfig() {
    const isProduction = process.env.DOKU_MODE === 'production';
    
    let clientId, secretKey, apiUrl;

    if (isProduction) {
        apiUrl = process.env.LIVE_DOKU_BASE_URL || "https://api.doku.com";
        clientId = process.env.LIVE_DOKU_CLIENT_ID;
        secretKey = process.env.LIVE_DOKU_SECRET_KEY;
    } else {
        apiUrl = process.env.SANDBOX_DOKU_BASE_URL || "https://api-sandbox.doku.com";
        clientId = process.env.SANDBOX_DOKU_CLIENT_ID;
        secretKey = process.env.SANDBOX_DOKU_SECRET_KEY;
    }

    return {
        apiUrl,
        clientId,
        secretKey,
        isProduction
    };
}

interface PaymentRequest {
    order: {
        invoice_number: string;
        amount: number;
        callback_url?: string;
    };
    customer: {
        name: string;
        email: string;
        phone?: string;
    };
    payment: {
        payment_due_date: number;
        notification_url?: string;
        payment_method_types?: string[];
    };
}

async function fetchWithRetry(url: string, options: any, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, options);
            return res;
        } catch (err: any) {
            console.warn(`⚠️ DOKU Fetch Attempt ${i + 1} failed: ${err.message}`);
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    throw new Error("Fetch failed after retries");
}

export const generatePaymentUrl = async (
    invoiceNumber: string,
    amount: number,
    customerData: { name: string; email: string; phone?: string }
): Promise<string> => {
    try {
        const { apiUrl, clientId, secretKey } = getDokuEnvConfig();
        
        if (!clientId || !secretKey) {
            throw new Error("DOKU Configuration missing in .env (CLIENT_ID or SECRET_KEY)");
        }

        const requestId = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z";
        const targetPath = "/checkout/v1/payment";

        const payload: PaymentRequest = {
            order: {
                invoice_number: invoiceNumber,
                amount: amount,
                callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/account/transaction`
            },
            customer: {
                name: customerData.name,
                email: customerData.email,
                phone: customerData.phone
            },
            payment: {
                payment_due_date: 60, // 60 minutes
                notification_url: "https://peskinext-backend.vercel.app/api/v1/payment/notification"
            }
        };

        const jsonBody = JSON.stringify(payload);
        const digest = crypto.createHash('sha256').update(jsonBody).digest('base64');
        const rawSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${targetPath}\nDigest:${digest}`;

        const hmac = crypto.createHmac('sha256', secretKey);
        hmac.update(rawSignature);
        const signature = `HMACSHA256=${hmac.digest('base64')}`;

        const response = await fetchWithRetry(`${apiUrl}${targetPath}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-Id': clientId,
                'Request-Id': requestId,
                'Request-Timestamp': requestTimestamp,
                'Signature': signature,
                'Digest': digest
            },
            body: jsonBody
        });

        const data = await response.json() as any;

        if (response.ok && (data.responseCode === "SUCCESS" || (Array.isArray(data.message) && data.message[0] === "SUCCESS"))) {
            return data.response.payment.url;
        } else {
            console.error("❌ DOKU Error Response:", data);
            throw new Error(data.message || data.error?.message || "Failed to generate payment URL");
        }

    } catch (error: any) {
        console.error("❌ Exception in generatePaymentUrl:", error);
        throw new Error(error.message);
    }
};

export const checkTransactionStatus = async (invoiceNumber: string): Promise<string | null> => {
    try {
        const { apiUrl, clientId, secretKey } = getDokuEnvConfig();
        if (!clientId || !secretKey) return null;

        const requestId = `REQ-STATUS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z";
        const targetPath = `/orders/v1/status/${invoiceNumber}`;
        const digest = "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=";
        const rawSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${targetPath}`;

        const hmac = crypto.createHmac('sha256', secretKey);
        hmac.update(rawSignature);
        const signature = `HMACSHA256=${hmac.digest('base64')}`;

        const response = await fetch(`${apiUrl}${targetPath}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Client-Id': clientId,
                'Request-Id': requestId,
                'Request-Timestamp': requestTimestamp,
                'Signature': signature,
                'Digest': digest
            }
        });

        const data = await response.json() as any;
        if (response.ok && data.transaction?.status) {
            return data.transaction.status;
        }
        return null;
    } catch (error: any) {
        console.error("❌ Error checking transaction status:", error);
        return null;
    }
};

/**
 * Verify DOKU notification webhook signature (HMAC-SHA256).
 * 
 * DOKU sends these headers with each notification:
 * - Client-Id
 * - Request-Id
 * - Request-Timestamp
 * - Signature (format: "HMACSHA256=<base64>")
 * 
 * The signature is computed over:
 *   Client-Id + "\n" + Request-Id + "\n" + Request-Timestamp + "\n" + Request-Target + "\n" + Digest
 * where Digest = SHA256(body) in base64.
 */
export const verifySignature = (headers: any, body: string): boolean => {
    try {
        const { secretKey, clientId } = getDokuEnvConfig();

        if (!secretKey || !clientId) {
            console.error("❌ DOKU verifySignature: Missing secretKey or clientId in env");
            return false;
        }

        const signatureHeader = headers['signature'] || headers['Signature'];
        const requestId = headers['request-id'] || headers['Request-Id'];
        const requestTimestamp = headers['request-timestamp'] || headers['Request-Timestamp'];
        const incomingClientId = headers['client-id'] || headers['Client-Id'];

        if (!signatureHeader || !requestId || !requestTimestamp) {
            console.error("❌ DOKU verifySignature: Missing required headers");
            return false;
        }

        // Verify Client-Id matches our config
        if (incomingClientId && incomingClientId !== clientId) {
            console.error("❌ DOKU verifySignature: Client-Id mismatch");
            return false;
        }

        // Extract the base64 signature from "HMACSHA256=<base64>"
        const signatureParts = signatureHeader.split('=');
        if (signatureParts.length < 2 || !signatureParts[0]?.startsWith('HMACSHA256')) {
            console.error("❌ DOKU verifySignature: Invalid signature format");
            return false;
        }
        // Rejoin in case base64 contains '='
        const incomingSignature = signatureParts.slice(1).join('=');

        // Compute digest of the raw body
        const digest = crypto.createHash('sha256').update(body || '').digest('base64');

        // Notification target path
        const targetPath = '/api/v1/payment/notification';

        // Reconstruct the signature component string
        const rawSignature = [
            `Client-Id:${clientId}`,
            `Request-Id:${requestId}`,
            `Request-Timestamp:${requestTimestamp}`,
            `Request-Target:${targetPath}`,
            `Digest:${digest}`
        ].join('\n');

        // Compute expected HMAC
        const hmac = crypto.createHmac('sha256', secretKey);
        hmac.update(rawSignature);
        const expectedSignature = hmac.digest('base64');

        // Time-safe comparison to prevent timing attacks
        const expected = Buffer.from(expectedSignature, 'base64');
        const incoming = Buffer.from(incomingSignature, 'base64');

        if (expected.length !== incoming.length) {
            console.error("❌ DOKU verifySignature: Signature length mismatch");
            return false;
        }

        const isValid = crypto.timingSafeEqual(expected, incoming);

        if (!isValid) {
            console.error("❌ DOKU verifySignature: Signature mismatch — possible tampering!");
        }

        return isValid;
    } catch (error) {
        console.error("❌ DOKU verifySignature exception:", error);
        return false;
    }
};
