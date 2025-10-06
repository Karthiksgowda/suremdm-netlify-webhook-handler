## Deployment Instructions
1. Fork the repository: [https://github.com/osparhar/suremdm-netlify-webhook-handler](https://github.com/osparhar/suremdm-netlify-webhook-handler).
2. In Netlify, create a new site from the forked repository (Dashboard > New site from Git).
3. Set environment variables in Netlify (Site configuration > Environment variables):
   - `GMAIL_APP_PASSWORD`: Gmail App Password (generate at https://myaccount.google.com/apppasswords).
   - `GMAIL_SENDER_ADDRESS`: Your Gmail address.
   - `GMAIL_USERNAME`: Your Gmail address.
   - `SEND_TO_EMAIL_ADDRESS`: Recipient email for notifications.
   - `SUREMDM_API_URL`: SureMDM API URL (e.g. https://<acme-example>.suremdm.io/api ) .
   - `SUREMDM_API_KEY`: SureMDM API key (from SureMDM Console > Account Settings > Account Management > API Key).
   - `SUREMDM_API_USERNAME`: SureMDM API username (Create a special user account for API calls).
   - `SUREMDM_API_PASSWORD`: SureMDM API password (Use the password for the account created above).
4. Note the Netlify webhook URL: `https://your-site-name.netlify.app/.netlify/functions/webhook-handler`.
5. In SureMDM Console > Account Settings > Enterprise Integrations > Webhooks:
   - Select Enable Webhooks checkbox.
   - Add a Webhook Endpoint.
   - Select desired events (e.g., Device Enrollment, Device Deleted).
   - Save the webhook.
7. Test by triggering an event in SureMDM’s main grid. Check Netlify logs (Functions > webhook-handler > Logs) and SureMDM Webhook logs. If the webhook handler function is called, it will fetch the device details for which the vent was triggered, and an email will be sent to the recipient email address.
