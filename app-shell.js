const installAppBtn = document.getElementById('installAppBtn');

let deferredInstallPrompt = null;

function isStandaloneApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function syncInstallButton() {
  if (!installAppBtn) return;
  installAppBtn.hidden = isStandaloneApp() || !deferredInstallPrompt;
  installAppBtn.disabled = !deferredInstallPrompt;
}

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
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
