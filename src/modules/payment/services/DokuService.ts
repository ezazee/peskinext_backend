import crypto from 'crypto';


const DOKU_API_URL = process.env.DOKU_API_URL || "https://api-sandbox.doku.com";
const CLIENT_ID = process.env.SANDBOX_DOKU_CLIENT_ID || process.env.DOKU_CLIENT_ID;
const SECRET_KEY = process.env.SANDBOX_DOKU_SECRET_KEY || process.env.DOKU_SECRET_KEY;

if (!CLIENT_ID || !SECRET_KEY) {
    console.warn("⚠️ DOKU_CLIENT_ID or DOKU_SECRET_KEY is missing in environment variables.");
} else {
    console.log(`✅ DOKU Service initialized. Client-Id: ${CLIENT_ID}`);
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
    };
}

export const generatePaymentUrl = async (
    invoiceNumber: string,
    amount: number,
    customerData: { name: string; email: string; phone?: string }
): Promise<string> => {
    try {
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
                // Explicit notification URL as requested
                notification_url: "https://peskinext-backend.vercel.app/api/v1/payment/notification"
            }
        };

        const jsonBody = JSON.stringify(payload);

        // Calculate Signature
        // Component 1: Digest = BASE64(SHA256(Body))
        const digest = crypto.createHash('sha256').update(jsonBody).digest('base64');

        // Component 2: Signature String
        // Client-Id + \n + Request-Id + \n + Request-Timestamp + \n + Request-Target + \n + Digest
        const rawSignature = `Client-Id:${CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${targetPath}\nDigest:${digest}`;

        const hmac = crypto.createHmac('sha256', SECRET_KEY || '');
        hmac.update(rawSignature);
        const signature = `HMACSHA256=${hmac.digest('base64')}`;

        console.log(`🚀 Sending DOKU Request to ${DOKU_API_URL}${targetPath}`);
        console.log("DEBUG ENV VARS:", { CLIENT_ID: CLIENT_ID, SECRET_KEY_LEN: SECRET_KEY?.length });
        console.log("DEBUG HEADERS - Client-Id:", CLIENT_ID);
        console.log("DEBUG HEADERS - Signature:", signature);
        console.log("Payload:", jsonBody);

        const response = await fetch(`${DOKU_API_URL}${targetPath}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-Id': CLIENT_ID || '',
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

export const verifySignature = (headers: any, body: string): boolean => {
    // Basic verification logic for notification (if needed later)
    return true;
};

export const checkTransactionStatus = async (invoiceNumber: string): Promise<string | null> => {
    try {
        const requestId = `REQ-STATUS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z";
        const targetPath = `/orders/v1/status/${invoiceNumber}`;

        // For GET request, body is empty string
        const digest = crypto.createHash('sha256').update("").digest('base64');

        const rawSignature = `Client-Id:${CLIENT_ID}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${targetPath}\nDigest:${digest}`;

        const hmac = crypto.createHmac('sha256', SECRET_KEY || '');
        hmac.update(rawSignature);
        const signature = `HMACSHA256=${hmac.digest('base64')}`;

        console.log(`🔍 Checking DOKU Status for ${invoiceNumber}`);

        const response = await fetch(`${DOKU_API_URL}${targetPath}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Client-Id': CLIENT_ID || '',
                'Request-Id': requestId,
                'Request-Timestamp': requestTimestamp,
                'Signature': signature,
                'Digest': digest // Optional for GET usually but required by signature
            }
        });

        const data = await response.json() as any;
        console.log(`🔍 Doku Status Response for ${invoiceNumber}:`, JSON.stringify(data));

        if (response.ok && data.transaction?.status) {
            return data.transaction.status; // "SUCCESS", "FAILED", "PENDING"
        }

        return null;

    } catch (error: any) {
        console.error("❌ Error checking transaction status:", error);
        return null; // Don't throw, just return null so we don't break the UI
    }
};
