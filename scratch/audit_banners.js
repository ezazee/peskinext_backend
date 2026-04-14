import fetch from 'node-fetch';

async function auditBanners() {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/v1/banners');
        const json = await res.json();
        console.log("Banner Response Structure:", JSON.stringify(json, null, 2));
    } catch (e) {
        console.error("Failed to fetch banners:", e.message);
    }
}

auditBanners();
