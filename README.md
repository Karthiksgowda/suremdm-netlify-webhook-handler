## Deployment Instructions
1. Fork the repository: [https://github.com/osparhar/suremdm-netlify-webhook-handler](https://github.com/osparhar/suremdm-netlify-webhook-handler).
2. In Netlify, create a new site from the forked repository (Dashboard > New site from Git).
3. Set environment variables in Netlify (Site configuration > Environment variables):
   - `GMAIL_APP_PASSWORD`: Gmail App Password (generate at https://myaccount.google.com/apppasswords).
   - `GMAIL_SENDER_ADDRESS`: Your Gmail address.
   - `GMAIL_USERNAME`: Your Gmail address.
   - `SEND_TO_EMAIL_ADDRESS`: Recipient email for notifications.
   - `SUREMDM_API_KEY`: SureMDM API key (from SureMDM Console > Settings > API Key).
   - `SUREMDM_API_PASSWORD`: SureMDM API password (if required).
   - `SUREMDM_API_URL`: SureMDM server URL (e.g., https://hosted.42gears.com).
   - `SUREMDM_API_USERNAME`: SureMDM API username (if required).
4. Note the webhook URL: `https://your-site-name.netlify.app/.netlify/functions/webhook-handler`.
5. In SureMDM Console > Account Settings > Webhooks:
   - Add the webhook URL.
   - Select desired events (e.g., Device Online).
   - Save the webhook.
6. Test by triggering an event in SureMDM’s main grid. Check Netlify logs (Functions > webhook-handler > Logs) and SureMDM Webhook logs.
