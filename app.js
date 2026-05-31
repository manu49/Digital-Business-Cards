const STORAGE_KEYS = {
  myCard: 'digital-business-card-my-card',
  collected: 'digital-business-card-collected',
};

/* ── DOM refs ─────────────────────────────────────────────── */
const form            = document.getElementById('my-card-form');
const nameInput       = document.getElementById('name');
const linkedinInput   = document.getElementById('linkedin');
const locationInput   = document.getElementById('location');
const feedback        = document.getElementById('my-card-feedback');
const importText      = document.getElementById('import-text');
const importButton    = document.getElementById('import-card');
const importFeedback  = document.getElementById('import-feedback');
const collectedList   = document.getElementById('collected-list');
const copyShareButton = document.getElementById('copy-share');
const shareTextButton = document.getElementById('share-text');
const shareNfcButton  = document.getElementById('share-nfc');
const receiveNfcButton = document.getElementById('receive-nfc');

/* Pass preview elements */
const previewName     = document.getElementById('preview-name');
const previewLocation = document.getElementById('preview-location');
const previewLinkedin = document.getElementById('preview-linkedin');
const myCardQrEl      = document.getElementById('my-card-qr');

/* Web card preview elements */
const wcAvatar       = document.getElementById('wc-avatar');
const wcName         = document.getElementById('wc-name');
const wcLocationText = document.getElementById('wc-location-text');
const wcLinkedinBtn  = document.getElementById('wc-linkedin-btn');
const wcQrEl         = document.getElementById('wc-qr');

/* View toggle */
const togglePassBtn   = document.getElementById('toggle-pass');
const toggleCardBtn   = document.getElementById('toggle-card');
const viewPass        = document.getElementById('view-pass');
const viewWebcard     = document.getElementById('view-webcard');

let myCard = null;
let collectedCards = [];
let myQrInstance = null;
let wcQrInstance = null;

/* ── Palette for collected pass headers ───────────────────── */
const PASS_COLORS = [
  ['#1a3faa', '#2553d8'],
  ['#065f46', '#059669'],
  ['#6d28d9', '#7c3aed'],
  ['#9d174d', '#be185d'],
  ['#92400e', '#b45309'],
  ['#1e3a5f', '#2563eb'],
];

function passColors(index) {
  return PASS_COLORS[index % PASS_COLORS.length];
}

/* ── QR code helpers ─────────────────────────────────────── */
function generateQR(container, text, size = 120) {
  container.innerHTML = '';
  if (typeof QRCode === 'undefined') {
    container.innerHTML = '<div class="qr-placeholder">' + Array(25).fill('<span></span>').join('') + '</div>';
    return null;
  }
  return new QRCode(container, {
    text,
    width: size,
    height: size,
    colorDark: '#111827',
    colorLight: '#f9fafb',
    correctLevel: QRCode.CorrectLevel.M,
  });
}

/* ── Storage ─────────────────────────────────────────────── */
function getStoredCard() {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.myCard);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function getStoredCollectedCards() {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.collected);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

/* ── View toggle ─────────────────────────────────────────── */
function activateView(view) {
  const isPass = view === 'pass';
  viewPass.hidden    = !isPass;
  viewWebcard.hidden =  isPass;
  togglePassBtn.classList.toggle('toggle-btn--active',  isPass);
  toggleCardBtn.classList.toggle('toggle-btn--active', !isPass);
  togglePassBtn.setAttribute('aria-pressed', String( isPass));
  toggleCardBtn.setAttribute('aria-pressed', String(!isPass));
}

togglePassBtn.addEventListener('click', () => activateView('pass'));
toggleCardBtn.addEventListener('click', () => activateView('card'));

/* ── Save ────────────────────────────────────────────────── */
function saveMyCard(card) {
  myCard = card;
  localStorage.setItem(STORAGE_KEYS.myCard, JSON.stringify(card));
  displayFeedback('Card saved — ready to share.');
  updateBoardingPassPreview(card);
  updateWebCardPreview(card);
}

function saveCollectedCards(cards) {
  collectedCards = cards;
  localStorage.setItem(STORAGE_KEYS.collected, JSON.stringify(cards));
  renderCollectedCards();
}

/* ── Live preview ────────────────────────────────────────── */
function updateBoardingPassPreview(card) {
  if (!card) return;
  previewName.textContent     = card.name     || '—';
  previewLocation.textContent = card.location || '—';
  previewLinkedin.textContent = linkedinHandle(card.linkedin);

  const qrData = JSON.stringify(card);
  if (myQrInstance && myQrInstance.makeCode) {
    myQrInstance.makeCode(qrData);
  } else {
    myQrInstance = generateQR(myCardQrEl, qrData, 120);
  }
}

/* ── Web card preview ────────────────────────────────────── */
function initials(name) {
  return (name || '').trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
}

/* Deterministic hue from name string */
function nameHue(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h) % 360;
}

function updateWebCardPreview(card) {
  if (!card) return;
  const hue = nameHue(card.name);
  wcAvatar.textContent = initials(card.name);
  wcAvatar.style.color = `hsl(${hue},55%,30%)`;
  wcName.textContent = card.name || '—';
  wcLocationText.textContent = card.location || '—';
  wcLinkedinBtn.href = card.linkedin || '#';
  wcLinkedinBtn.textContent = ''; // rebuild to keep SVG
  wcLinkedinBtn.insertAdjacentHTML('afterbegin', `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452H17.21v-5.569c0-1.328-.024-3.036-1.852-3.036-1.853 0-2.136 1.446-2.136 2.94v5.665H9.982V9.5h3.112v1.561h.045c.434-.821 1.493-1.687 3.073-1.687 3.287 0 3.894 2.163 3.894 4.977v6.101ZM5.337 7.932a1.81 1.81 0 1 1 0-3.62 1.81 1.81 0 0 1 0 3.62ZM6.956 20.452H3.718V9.5h3.238v10.952ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0Z"/></svg>`);
  wcLinkedinBtn.appendChild(document.createTextNode(' Connect on LinkedIn'));

  const qrData = JSON.stringify(card);
  if (wcQrInstance && wcQrInstance.makeCode) {
    wcQrInstance.makeCode(qrData);
  } else {
    wcQrInstance = generateQR(wcQrEl, qrData, 80);
  }
}

/* Strip protocol/www for display */
function linkedinHandle(url) {
  if (!url) return '—';
  return url.replace(/^https?:\/\/(www\.)?/, '');
}

/* ── Collected cards ─────────────────────────────────────── */
function renderCollectedCards() {
  collectedList.innerHTML = '';

  if (!collectedCards.length) {
    collectedList.innerHTML = '<p class="empty-state">No passes in your wallet yet.</p>';
    return;
  }

  collectedCards.forEach((card, index) => {
    const [colorA, colorB] = passColors(index);
    const article = document.createElement('article');
    article.className = 'boarding-pass mini-pass';
    article.innerHTML = `
      <div class="pass-header" style="background: linear-gradient(135deg, ${colorA} 0%, ${colorB} 100%);">
        <span class="pass-type-label">BUSINESS PASS</span>
        <span class="pass-no-expiry">NO EXPIRY</span>
      </div>
      <div class="pass-body">
        <div class="pass-field pass-field--name">
          <span class="field-label">CARDHOLDER</span>
          <span class="field-value">${escHtml(card.name)}</span>
        </div>
        <div class="pass-row">
          <div class="pass-field">
            <span class="field-label">LOCATION</span>
            <span class="field-value">${escHtml(card.location)}</span>
          </div>
          <div class="pass-field pass-field--right">
            <span class="field-label">NETWORK</span>
            <span class="field-value field-value--link">
              <a href="${escAttr(card.linkedin)}" target="_blank" rel="noreferrer">${escHtml(linkedinHandle(card.linkedin))}</a>
            </span>
          </div>
        </div>
      </div>
      <div class="perforated-divider">
        <div class="perf-notch perf-notch--left"></div>
        <div class="perf-line"></div>
        <div class="perf-notch perf-notch--right"></div>
      </div>
      <div class="pass-footer">
        <div class="qr-container" id="qr-${index}"></div>
        <div class="mini-pass-meta">
          <span class="scan-label">SCAN TO CONNECT</span>
        </div>
      </div>
    `;
    collectedList.appendChild(article);

    generateQR(document.getElementById(`qr-${index}`), JSON.stringify(card), 80);
  });
}

/* ── Feedback ────────────────────────────────────────────── */
function displayFeedback(msg, type = 'success') {
  feedback.textContent = msg;
  feedback.style.color = type === 'error' ? '#dc2626' : '#16a34a';
}

function displayImportFeedback(msg, type = 'success') {
  importFeedback.textContent = msg;
  importFeedback.style.color = type === 'error' ? '#dc2626' : '#16a34a';
}

/* ── Validation ──────────────────────────────────────────── */
function validateCard(card) {
  return (
    card &&
    typeof card.name === 'string' && card.name.trim() &&
    typeof card.linkedin === 'string' && card.linkedin.trim() &&
    typeof card.location === 'string' && card.location.trim()
  );
}

function isDuplicateCard(card) {
  return collectedCards.some(
    (e) =>
      e.name.trim().toLowerCase() === card.name.trim().toLowerCase() &&
      e.linkedin.trim().toLowerCase() === card.linkedin.trim().toLowerCase() &&
      e.location.trim().toLowerCase() === card.location.trim().toLowerCase()
  );
}

function addCollectedCard(card) {
  if (!validateCard(card)) {
    displayImportFeedback('Card is missing required fields.', 'error');
    return;
  }
  if (isDuplicateCard(card)) {
    displayImportFeedback('This pass is already in your wallet.', 'error');
    return;
  }
  saveCollectedCards([card, ...collectedCards]);
  displayImportFeedback('Pass added to wallet.');
}

function parseCardText(text) {
  try { return JSON.parse(text); } catch { return null; }
}

/* ── Clipboard ───────────────────────────────────────────── */
function copyToClipboard(text) {
  if (!navigator.clipboard) return Promise.reject(new Error('Clipboard unavailable'));
  return navigator.clipboard.writeText(text);
}

/* ── Sanitisation helpers ────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── Event listeners ─────────────────────────────────────── */
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const card = {
    name:     nameInput.value.trim(),
    linkedin: linkedinInput.value.trim(),
    location: locationInput.value.trim(),
  };
  if (!validateCard(card)) {
    displayFeedback('Please fill in all fields.', 'error');
    return;
  }
  saveMyCard(card);
});

/* Live preview while typing */
[nameInput, linkedinInput, locationInput].forEach((input) => {
  input.addEventListener('input', () => {
    const liveCard = {
      name:     nameInput.value.trim(),
      linkedin: linkedinInput.value.trim(),
      location: locationInput.value.trim(),
    };
    previewName.textContent     = liveCard.name     || '—';
    previewLocation.textContent = liveCard.location || '—';
    previewLinkedin.textContent = linkedinHandle(liveCard.linkedin) || '—';
    updateWebCardPreview(liveCard);
  });
});

copyShareButton.addEventListener('click', () => {
  if (!myCard) {
    displayFeedback('Save your card first.', 'error');
    return;
  }
  copyToClipboard(JSON.stringify(myCard))
    .then(() => displayFeedback('Card JSON copied to clipboard.'))
    .catch(() => displayFeedback('Could not copy automatically.', 'error'));
});

shareTextButton.addEventListener('click', async () => {
  if (!myCard) {
    displayFeedback('Save your card first.', 'error');
    return;
  }
  if (navigator.share) {
    try {
      await navigator.share({ title: `${myCard.name}'s Digital Pass`, text: JSON.stringify(myCard) });
      displayFeedback('Share sheet opened.');
    } catch {
      displayFeedback('Sharing cancelled.', 'error');
    }
  } else {
    displayFeedback('Web Share not available — use Copy instead.', 'error');
  }
});

shareNfcButton.addEventListener('click', async () => {
  if (!myCard) {
    displayFeedback('Save your card first.', 'error');
    return;
  }
  if (!('NDEFReader' in window)) {
    displayFeedback('NFC not supported in this browser.', 'error');
    return;
  }
  try {
    const ndef = new NDEFReader();
    await ndef.write(JSON.stringify(myCard));
    displayFeedback('Hold your device near the receiver.');
  } catch {
    displayFeedback('NFC write failed — check browser permissions.', 'error');
  }
});

receiveNfcButton.addEventListener('click', async () => {
  if (!('NDEFReader' in window)) {
    displayImportFeedback('NFC not supported in this browser.', 'error');
    return;
  }
  try {
    const ndef = new NDEFReader();
    await ndef.scan();
    displayImportFeedback('Ready — tap another device now.');
    ndef.onreading = (event) => {
      const decoder = new TextDecoder();
      const card = parseCardText(decoder.decode(event.message.records[0].data));
      if (!card) {
        displayImportFeedback('NFC data is not valid card JSON.', 'error');
        return;
      }
      addCollectedCard(card);
    };
    ndef.onreadingerror = () => displayImportFeedback('NFC read failed. Try again.', 'error');
  } catch {
    displayImportFeedback('NFC scan failed — check permissions.', 'error');
  }
});

importButton.addEventListener('click', () => {
  const text = importText.value.trim();
  if (!text) {
    displayImportFeedback('Paste card data first.', 'error');
    return;
  }
  const card = parseCardText(text);
  if (!card) {
    displayImportFeedback('Invalid format — paste the JSON card data.', 'error');
    return;
  }
  addCollectedCard(card);
});

/* ── Restore on load ─────────────────────────────────────── */
function restoreState() {
  myCard = getStoredCard();
  collectedCards = getStoredCollectedCards();

  if (myCard) {
    nameInput.value     = myCard.name;
    linkedinInput.value = myCard.linkedin;
    locationInput.value = myCard.location;
    updateBoardingPassPreview(myCard);
    updateWebCardPreview(myCard);
  }

  renderCollectedCards();
}

/* Wait for QRCode lib (loaded defer) */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', restoreState);
} else {
  restoreState();
}
