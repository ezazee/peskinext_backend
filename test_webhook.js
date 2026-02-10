const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const API_URL = 'http://127.0.0.1:5000/api/v1/payment/notification'; // Force IPv4

console.log("🚀 DOKU Webhook Simulator");
console.log("This script simulates a SUCCESS payment notification from DOKU.");
console.log("Ensure your backend is running on " + API_URL);
console.log("---------------------------------------------------");

rl.question('Enter Invoice Number (e.g. INV-1739xxxx): ', (invoiceNumber) => {
    if (!invoiceNumber) {
        console.error("❌ Invoice number is required!");
        rl.close();
        return;
    }

    const payload = {
        order: {
            invoice_number: invoiceNumber,
            amount: 100000 // Dummy amount
        },
        transaction: {
            status: 'SUCCESS',
            date: new Date().toISOString(),
            original_request_id: 'REQ-SIM-' + Date.now()
        }
    };

    console.log(`\n📤 Sending Webhook for ${invoiceNumber}...`);

    axios.post(API_URL, payload)
        .then(response => {
            console.log("\n✅ Response Received:");
            console.log("Status:", response.status);
            console.log("Data:", response.data);
            console.log("\nCheck your backend logs to see if Biteship order was created.");
        })
        .catch(error => {
            console.error("\n❌ Error Sending Webhook:");
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Data:", error.response.data);
            } else {
                console.error(error.message);
            }
        })
        .finally(() => {
            rl.close();
        });
});
