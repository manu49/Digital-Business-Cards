# Digital Business Cards

A lightweight static web app for creating a personal digital business card and collecting cards from others.

## Features

- Create your own card with `name`, `LinkedIn`, and `location`
- Store your personal card in browser storage
- Collect business cards from other people
- Share your card using copy/paste, the Web Share API, or NFC when supported
- Receive cards from another phone using Web NFC when available

## Files

- `index.html` – app user interface
- `styles.css` – styling for the app
- `app.js` – card storage, sharing, and NFC logic

## How to use

1. Open `index.html` in a browser.
2. Fill in your personal card and click **Save My Card**.
3. Share using the generated JSON code or use **Share Text**.
4. Paste a shared card into the import box and click **Import Card**.
5. View all collected cards in the **Collected Cards** section.

> NFC features require a secure browser environment and supported device.
