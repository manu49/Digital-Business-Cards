const STORAGE_KEYS = {
  myCard: 'digital-business-card-my-card',
  collected: 'digital-business-card-collected',
};

const form = document.getElementById('my-card-form');
const nameInput = document.getElementById('name');
const linkedinInput = document.getElementById('linkedin');
const locationInput = document.getElementById('location');
const shareOutput = document.getElementById('share-output');
const feedback = document.getElementById('my-card-feedback');
const importText = document.getElementById('import-text');
const importButton = document.getElementById('import-card');
const importFeedback = document.getElementById('import-feedback');
const collectedList = document.getElementById('collected-list');
const copyShareButton = document.getElementById('copy-share');
const shareTextButton = document.getElementById('share-text');
const shareNfcButton = document.getElementById('share-nfc');
const receiveNfcButton = document.getElementById('receive-nfc');

let myCard = null;
let collectedCards = [];

function getStoredCard() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.myCard);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function getStoredCollectedCards() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.collected);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

function saveMyCard(card) {
  myCard = card;
  localStorage.setItem(STORAGE_KEYS.myCard, JSON.stringify(card));
  displayFeedback('Your card is saved. Use Share or NFC to exchange it.');
  renderShareOutput();
}

function saveCollectedCards(cards) {
  collectedCards = cards;
  localStorage.setItem(STORAGE_KEYS.collected, JSON.stringify(cards));
  renderCollectedCards();
}

function renderShareOutput() {
  if (!myCard) {
    shareOutput.textContent = 'Save your card first to share it.';
    return;
  }

  const json = JSON.stringify(myCard, null, 2);
  shareOutput.textContent = json;
}

function renderCollectedCards() {
  collectedList.innerHTML = '';

  if (!collectedCards.length) {
    collectedList.innerHTML = '<p>No cards collected yet.</p>';
    return;
  }

  collectedCards.forEach((card) => {
    const cardItem = document.createElement('article');
    cardItem.className = 'card-item';
    cardItem.innerHTML = `
      <h3>${card.name}</h3>
      <p><strong>Location:</strong> ${card.location}</p>
      <p><strong>LinkedIn:</strong> <a href="${card.linkedin}" target="_blank" rel="noreferrer">${card.linkedin}</a></p>
    `;
    collectedList.appendChild(cardItem);
  });
}

function displayFeedback(message, type = 'success') {
  feedback.textContent = message;
  feedback.style.color = type === 'error' ? '#f87171' : '#a3e635';
}

function displayImportFeedback(message, type = 'success') {
  importFeedback.textContent = message;
  importFeedback.style.color = type === 'error' ? '#f87171' : '#a3e635';
}

function validateCard(card) {
  return (
    card &&
    typeof card.name === 'string' &&
    card.name.trim() &&
    typeof card.linkedin === 'string' &&
    card.linkedin.trim() &&
    typeof card.location === 'string' &&
    card.location.trim()
  );
}

function isDuplicateCard(card) {
  return collectedCards.some(
    (existing) =>
      existing.name.trim().toLowerCase() === card.name.trim().toLowerCase() &&
      existing.linkedin.trim().toLowerCase() === card.linkedin.trim().toLowerCase() &&
      existing.location.trim().toLowerCase() === card.location.trim().toLowerCase()
  );
}

function addCollectedCard(card) {
  if (!validateCard(card)) {
    displayImportFeedback('Card is missing required fields.', 'error');
    return;
  }

  if (isDuplicateCard(card)) {
    displayImportFeedback('This card is already in your collection.', 'error');
    return;
  }

  saveCollectedCards([card, ...collectedCards]);
  displayImportFeedback('Card imported successfully.');
}

function parseCardText(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    return null;
  }
}

function copyToClipboard(text) {
  if (!navigator.clipboard) {
    return Promise.reject(new Error('Clipboard API unavailable.'));
  }
  return navigator.clipboard.writeText(text);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const card = {
    name: nameInput.value.trim(),
    linkedin: linkedinInput.value.trim(),
    location: locationInput.value.trim(),
  };

  if (!validateCard(card)) {
    displayFeedback('Please fill in all fields with valid values.', 'error');
    return;
  }

  saveMyCard(card);
});

copyShareButton.addEventListener('click', () => {
  if (!myCard) {
    displayFeedback('Save your card first to copy the share code.', 'error');
    return;
  }

  const json = JSON.stringify(myCard);
  copyToClipboard(json)
    .then(() => {
      displayFeedback('Share code copied to clipboard.');
    })
    .catch(() => {
      displayFeedback('Unable to copy automatically. Use the text below.', 'error');
    });
});

shareTextButton.addEventListener('click', async () => {
  if (!myCard) {
    displayFeedback('Save your card first to share it.', 'error');
    return;
  }

  const text = JSON.stringify(myCard);
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'My digital business card',
        text,
      });
      displayFeedback('Share sheet opened.');
    } catch (error) {
      displayFeedback('Sharing was canceled or unsupported.', 'error');
    }
  } else {
    displayFeedback('Web Share API not available. Copy the share code instead.', 'error');
  }
});

importButton.addEventListener('click', () => {
  const text = importText.value.trim();
  if (!text) {
    displayImportFeedback('Paste card data before importing.', 'error');
    return;
  }

  const card = parseCardText(text);
  if (!card) {
    displayImportFeedback('Invalid card format. Paste the JSON card data.', 'error');
    return;
  }

  addCollectedCard(card);
});

shareNfcButton.addEventListener('click', async () => {
  if (!myCard) {
    displayFeedback('Save your card first to share via NFC.', 'error');
    return;
  }

  if (!('NDEFReader' in window)) {
    displayFeedback('NFC is not supported in this browser.', 'error');
    return;
  }

  try {
    const ndef = new NDEFReader();
    await ndef.write(JSON.stringify(myCard));
    displayFeedback('Hold your phone near the receiver to transfer your card.');
  } catch (error) {
    console.error(error);
    displayFeedback('NFC write failed. Ensure browser NFC permissions are allowed.', 'error');
  }
});

receiveNfcButton.addEventListener('click', async () => {
  if (!('NDEFReader' in window)) {
    displayImportFeedback('NFC is not supported in this browser.', 'error');
    return;
  }

  try {
    const ndef = new NDEFReader();
    await ndef.scan();
    displayImportFeedback('Ready to receive via NFC. Tap another device now.');

    ndef.onreading = (event) => {
      const decoder = new TextDecoder();
      const record = event.message.records[0];
      const json = decoder.decode(record.data);
      const card = parseCardText(json);
      if (!card) {
        displayImportFeedback('Received NFC data is not valid card JSON.', 'error');
        return;
      }
      addCollectedCard(card);
    };

    ndef.onreadingerror = () => {
      displayImportFeedback('Failed to read from NFC. Try again.', 'error');
    };
  } catch (error) {
    console.error(error);
    displayImportFeedback('NFC scan failed. Ensure browser permissions are allowed.', 'error');
  }
});

function restoreState() {
  myCard = getStoredCard();
  collectedCards = getStoredCollectedCards();

  if (myCard) {
    nameInput.value = myCard.name;
    linkedinInput.value = myCard.linkedin;
    locationInput.value = myCard.location;
  }

  renderShareOutput();
  renderCollectedCards();
}

restoreState();
