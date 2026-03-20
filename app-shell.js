const installAppBtn = document.getElementById('installAppBtn');

let deferredInstallPrompt = null;

function isNativeShell() {
  const capacitor = window.Capacitor;
  if (!capacitor) return false;
  if (typeof capacitor.isNativePlatform === 'function') return capacitor.isNativePlatform();
  if (typeof capacitor.getPlatform === 'function') {
    const platform = capacitor.getPlatform();
    return Boolean(platform && platform !== 'web');
  }
  return false;
}

function isStandaloneApp() {
  return isNativeShell()
    || window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function syncInstallButton() {
  if (!installAppBtn) return;
  installAppBtn.hidden = isStandaloneApp() || !deferredInstallPrompt;
  installAppBtn.disabled = !deferredInstallPrompt;
}

async function disableNativeShellServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch (error) {
    console.warn('Native shell service worker cleanup failed.', error);
  }
}

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    if (isNativeShell()) {
      disableNativeShellServiceWorkers();
      return;
    }
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('Service worker registration failed.', error);
    });
  });
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  syncInstallButton();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  syncInstallButton();
});

if (installAppBtn) {
  installAppBtn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    try {
      await deferredInstallPrompt.userChoice;
    } catch (error) {
      console.warn('Install prompt was dismissed before completion.', error);
    }
    deferredInstallPrompt = null;
    syncInstallButton();
  });
}

document.addEventListener('DOMContentLoaded', syncInstallButton);
