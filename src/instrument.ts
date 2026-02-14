import * as Sentry from "@sentry/node";

Sentry.init({
    dsn: "https://1c851575eb05016adba98aff67e59888@o4510883643719680.ingest.de.sentry.io/4510883671244880",
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
});
