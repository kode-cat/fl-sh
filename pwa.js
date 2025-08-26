// PWA functionality
let deferredPrompt;
const installButton = document.getElementById('installPwa');
const offlineStatusBar = document.getElementById('offlineStatus');

// Check if the app is already installed
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('App is already installed and running in standalone mode');
  if (installButton) {
    installButton.style.display = 'none';
  }
}

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show the install button
  if (installButton) {
    installButton.style.display = 'block';
  }
});

// Install button click handler
if (installButton) {
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
    // Hide the install button
    installButton.style.display = 'none';
  });
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Determine the correct path for the service worker
    const swPath = location.pathname.includes('/fl-sh/') ? '/fl-sh/sw.js' : '/sw.js';
    
    // Register the service worker
    navigator.serviceWorker.register(swPath)
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Check for updates to the service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available, show refresh button
              showRefreshUI();
            }
          });
        });
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);
        
        // Try with a relative path as fallback
        console.log('Trying fallback service worker registration...');
        navigator.serviceWorker.register('./sw.js')
          .then(registration => {
            console.log('Fallback ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(fallbackError => {
            console.error('Fallback ServiceWorker registration also failed: ', fallbackError);
          });
      });
      
    // Handle controller change (when a new service worker takes over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload the page to ensure all assets are updated
      window.location.reload();
    });
  });
}

// Function to show refresh UI when a new service worker is available
function showRefreshUI() {
  // Create a notification to inform the user about the update
  const updateNotification = document.createElement('div');
  updateNotification.className = 'fixed bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center space-x-3';
  updateNotification.innerHTML = `
    <span>New version available!</span>
    <button id="refreshApp" class="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100 transition-colors">
      Refresh
    </button>
  `;
  document.body.appendChild(updateNotification);
  
  // Add click event to refresh button
  document.getElementById('refreshApp').addEventListener('click', () => {
    // Tell the service worker to skipWaiting
    navigator.serviceWorker.ready.then(registration => {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    });
    // Remove the notification
    updateNotification.remove();
  });
}

// Online/Offline status handling
function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  
  if (offlineStatusBar) {
    if (!isOnline) {
      offlineStatusBar.classList.remove('hidden');
      // Use the log function if it exists, otherwise use console
      if (typeof log === 'function') {
        log('App is running in offline mode. P2P connections on the same network will still work.', 'system');
      } else {
        console.log('App is running in offline mode. P2P connections on the same network will still work.');
      }
    } else {
      offlineStatusBar.classList.add('hidden');
      // Use the log function if it exists, otherwise use console
      if (typeof log === 'function') {
        log('App is back online.', 'success');
      } else {
        console.log('App is back online.');
      }
    }
  }
  
  // Update UI elements based on online status
  const connectBtn = document.getElementById('connectBtn');
  if (connectBtn) {
    // Even in offline mode, local network connections should work
    // connectBtn.disabled = !isOnline;
  }
  
  // If we're offline, preemptively load the offline PeerJS fallback
  if (!isOnline && !window._offlinePeerJSLoaded) {
    loadOfflinePeerJSFallback();
  }
}

// Load the offline PeerJS fallback
function loadOfflinePeerJSFallback() {
  // Check if we've already tried to load it
  if (window._offlinePeerJSLoaded) return;
  window._offlinePeerJSLoaded = true;
  
  // Try to fetch the fallback from cache
  fetch('./offline-peerjs-fallback.js')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load offline PeerJS fallback');
      return response.text();
    })
    .then(scriptText => {
      // Only execute if PeerJS is not already available
      if (typeof Peer === 'undefined') {
        // Create and execute the script
        const script = document.createElement('script');
        script.textContent = scriptText;
        document.head.appendChild(script);
        console.log('Loaded offline PeerJS fallback');
      }
    })
    .catch(err => {
      console.error('Error loading offline PeerJS fallback:', err);
    });
}

// Listen for online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial check
updateOnlineStatus();
