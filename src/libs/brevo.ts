import * as Brevo from "@getbrevo/brevo";
import { BREVO_API_KEY } from "../config/env";

export const transactionalEmailsApi = new Brevo.TransactionalEmailsApi();

// Set API Key
transactionalEmailsApi.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);
