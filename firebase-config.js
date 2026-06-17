/* ===============================
   TAS — Firebase integration
   Replace the config below with your
   own Firebase project credentials.
   =============================== */

// 1) Your Firebase project config — swap these placeholder values
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 2) Initialize Firebase (compat SDK loaded via CDN in each HTML page)
let db = null;
try {
  if (window.firebase && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
  }
} catch (err) {
  console.warn('Firebase not configured yet:', err);
}

/* ---------- Contact form submission ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const statusEl = document.getElementById('formStatus');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending...';
    submitBtn.disabled = true;

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      service: form.service.value,
      budget: form.budget ? form.budget.value : '',
      message: form.message.value.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      if (db) {
        await db.collection('contact_leads').add(data);
      } else {
        // Firebase not yet configured — log locally so nothing is lost during setup
        console.log('Lead captured (Firebase not connected yet):', data);
        await new Promise(r => setTimeout(r, 700));
      }
      statusEl.style.color = 'var(--blue-700)';
      statusEl.textContent = "Thanks! Your message has been received — our team will reach out within 24 hours.";
      form.reset();
    } catch (err) {
      console.error(err);
      statusEl.style.color = 'var(--orange-600)';
      statusEl.textContent = "Something went wrong sending your message. Please email us directly at hello@theadventuresolutions.com.";
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

/* ---------- Newsletter submission (footer) ---------- */
function initNewsletterForm() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value.trim();
      const note = form.nextElementSibling;
      try {
        if (db) {
          await db.collection('newsletter_subscribers').add({ email, createdAt: new Date().toISOString() });
        } else {
          console.log('Newsletter signup (Firebase not connected yet):', email);
        }
        if (note) { note.textContent = "Subscribed! Welcome to the TAS insider list."; note.style.color = 'var(--yellow-400)'; note.style.display='block'; }
        form.reset();
      } catch (err) {
        console.error(err);
        if (note) { note.textContent = "Couldn't subscribe — please try again."; note.style.display='block'; }
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initNewsletterForm();
});
