# Email not received – where to check

If you already set **To = {{to_email}}**, **From Name = Level Up Learning**, and body with **{{childName}}** and **{{message}}**, use this checklist.

---

## 1. Match IDs in code and EmailJS dashboard

In your project the code uses:

| What        | Value in code          | Where to see it in EmailJS |
|------------|------------------------|----------------------------|
| Service ID | `service_0geog7m`      | **Email Services** → your service → **Service ID** |
| Template ID| `template_cf9ed5g`    | **Email Templates** → your template → **Template ID** (in URL or template settings) |
| Public Key | `Ykb96YHWkDSAebtYd`   | **Account** → **API Keys** (or **General** → Public Key) |

- Open [EmailJS Dashboard](https://dashboard.emailjs.com).
- **Email Services**: open your service and confirm **Service ID** is exactly `service_0geog7m`. If yours is different, either change the code in `src/utils/notifyParent.js` (lines 3–5) to match the dashboard, or create a new service and use its ID.
- **Email Templates**: open your template; the URL or template settings show the **Template ID** (e.g. `template_xxxxx`). It must match `template_cf9ed5g` exactly, or update the code.
- **Account → API Keys**: confirm the **Public Key** is `Ykb96YHWkDSAebtYd`, or update the code.

If any of these don’t match, the request can fail and no email is sent.

---

## 2. Email service (Gmail / Outlook etc.) is connected

- Go to **Email Services** in EmailJS.
- Open the service you use for this app.
- It must show as **Connected** (e.g. Gmail “Connected”).
- If not, connect or reconnect the account and complete the verification (e.g. allow less secure apps / app password if required).

---

## 3. Template “To” and variables

- **To Email** must be exactly: `{{to_email}}` (no space, no typo).
- In the body you must use: `{{childName}}` and `{{message}}` (same spelling).
- Save the template after any change.

---

## 4. Browser console (see the real error)

1. Open your app in the browser (after parent registers and child is on a learning page or login).
2. Press **F12** (or right‑click → Inspect) → open the **Console** tab.
3. Wait for the inattentiveness timer (~20 seconds) or stay on the page so it triggers.
4. Look for a red line like: **Level Up Learning – email failed: …**

What you might see:

- **Invalid public key** or **401** → Public key in code doesn’t match Account → API Keys. Fix the key in `src/utils/notifyParent.js` or in the dashboard.
- **Template not found** / **404** → Template ID in code doesn’t match the template. Fix `EMAILJS_TEMPLATE` in `src/utils/notifyParent.js` or use the template ID from the dashboard.
- **Service not found** → Service ID in code doesn’t match. Fix `EMAILJS_SERVICE` in `src/utils/notifyParent.js`.
- **Blocked** / **block list** → In EmailJS check **Suppressions** (or block list) and make sure the parent’s email is not blocked.
- **Rate limit** / **429** → You’ve hit EmailJS limits. Wait or upgrade plan.
- **Network error** → Firewall/adblock or network blocking `api.emailjs.com`. Try another network or disable extensions.

The console also logs **To:** and the **parent email** so you can confirm the right address is being sent.

---

## 5. Parent’s inbox and spam

- Confirm the **parent’s email** (the one they entered when registering) is correct (no typo).
- Check **Spam / Junk** for that address.
- If the parent uses Gmail, check **Promotions** and **Updates** tabs.
- Ask them to add the sender (your EmailJS “From” address / “Level Up Learning”) to contacts to reduce filtering.

---

## 6. Registration and context (so email is actually sent)

- The parent must **complete registration** (child name, parent email, avatar, login pictures, class, grade) and then the **child** must **log in** (click their picture).
- The inattentiveness email is sent only when:
  - **Layout** (learning pages like Home, Listening, etc.): `registeredChild` from context has `parentEmail` and the 20s timer runs.
  - **Login page (child view)**: same, with the 20s timer in child mode.
- If the user refreshes the page, `registeredChild` may be lost (unless you persist it). So for a test: register → child logs in → go to Home → wait 20+ seconds without refreshing, and check the console for the log line above.

---

## Quick summary

1. **Dashboard**: Service ID = `service_0geog7m`, Template ID = `template_cf9ed5g`, Public Key = `Ykb96YHWkDSAebtYd` (or update code to match your dashboard).
2. **Email service**: Connected and verified in EmailJS.
3. **Template**: To = `{{to_email}}`, body has `{{childName}}` and `{{message}}`, saved.
4. **Console**: After 20s on a learning page, look for “Level Up Learning – email failed:” and fix the reported error.
5. **Inbox**: Check spam and correct parent email.

If you tell me the **exact error message** from the console (the line after “Level Up Learning – email failed:”), I can tell you the next step.
