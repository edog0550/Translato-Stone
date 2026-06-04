// LinguaFlow Background Service Worker

// Initialize extension on install/update
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.tabs.create({ url: 'index.html' });
        initializeDefaultSettings();
    } else if (details.reason === 'update') {
        console.log('LinguaFlow updated');
    }
});

// Initialize default settings
function initializeDefaultSettings() {
    const defaultSettings = {
        targetLanguage: 'es',
        captionsEnabled: true,
        audioTranslationEnabled: false,
        autoDetectEnabled: true,
        captionSize: 'medium',
        captionOpacity: 0.9,
        captionDelay: 200,
        captionPosition: 'bottom',
        translationService: 'google',
        speechRecognition: 'native'
    };

    chrome.storage.sync.get(defaultSettings, (items) => {
        if (!items.targetLanguage) {
            chrome.storage.sync.set(defaultSettings);
        }
    });
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // Open popup (automatic in manifest v3)
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
        chrome.storage.sync.get(null, (items) => {
            sendResponse({ settings: items });
        });
        return true;
    } else if (request.action === 'saveSettings') {
        chrome.storage.sync.set(request.settings, () => {
            sendResponse({ saved: true });
        });
        return true;
    }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-captions') {
        toggleCaptions();
    } else if (command === 'toggle-translation') {
        toggleTranslation();
    }
});

function toggleCaptions() {
    chrome.storage.sync.get({ captionsEnabled: true }, (items) => {
        const newState = !items.captionsEnabled;
        chrome.storage.sync.set({ captionsEnabled: newState });
        
        // Notify all tabs
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, { action: 'settingsUpdated' }).catch(() => {
                    // Silently fail for inactive tabs
                });
            });
        });
    });
}

function toggleTranslation() {
    chrome.storage.sync.get({ audioTranslationEnabled: false }, (items) => {
        const newState = !items.audioTranslationEnabled;
        chrome.storage.sync.set({ audioTranslationEnabled: newState });
        
        // Notify all tabs
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, { action: 'settingsUpdated' }).catch(() => {
                    // Silently fail for inactive tabs
                });
            });
        });
    });
}

// Update badge on storage change
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        if (changes.captionsEnabled) {
            updateBadge(changes.captionsEnabled.newValue);
        }
    }
});

function updateBadge(enabled) {
    if (enabled) {
        chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
        chrome.action.setBadgeText({ text: 'ON' });
    } else {
        chrome.action.setBadgeText({ text: '' });
    }
}

// Initialize badge on startup
chrome.storage.sync.get({ captionsEnabled: true }, (items) => {
    updateBadge(items.captionsEnabled);
});
