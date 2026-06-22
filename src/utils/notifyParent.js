import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE = 'service_4ce99vq';
const EMAILJS_TEMPLATE_ID = 'template_cf9ed5g';

const EMAILJS_PUBLIC_KEY = 'Ykb96YHWkDSAebtYd';

let initialized = false;
function ensureInit() {
  if (!initialized) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    initialized = true;
  }
}

/**
 * Notify parent when inattentiveness is detected (used on Login and in Layout for learning pages).
 * Template must use: To = {{to_email}} (or your email service's "To" field), and {{childName}}, {{message}} in body.
 */
export async function notifyParentInattentive(parentEmail, childName) {
  if (!parentEmail || !parentEmail.includes('@')) return;
  ensureInit();
  const message = childName ? `${childName} was not alert. Please check in.` : 'Your child was not alert. Please check in.';
  try {
    await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE_ID, {
      to_email: parentEmail,
      to: parentEmail,
      childName: childName || 'Your child',
      message,
    }, EMAILJS_PUBLIC_KEY);
  } catch (err) {
    console.error('Level Up Learning – email failed:', err?.text || err?.message || err);
    console.error('Check: Service ID', EMAILJS_SERVICE, 'Template ID', EMAILJS_TEMPLATE, 'To:', parentEmail);
  }
}
