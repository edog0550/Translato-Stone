// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initializeEventListeners();
    setupCollapsibleSections();
});

// Load settings from storage
function loadSettings() {
    chrome.storage.sync.get({
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
    }, (items) => {
        document.getElementById('targetLanguage').value = items.targetLanguage;
        document.getElementById('captionsToggle').checked = items.captionsEnabled;
        document.getElementById('audioToggle').checked = items.audioTranslationEnabled;
        document.getElementById('autoDetectToggle').checked = items.autoDetectEnabled;
        document.getElementById('captionSize').value = items.captionSize;
        document.getElementById('captionOpacity').value = items.captionOpacity;
        document.getElementById('captionDelay').value = items.captionDelay;
        document.getElementById('captionPosition').value = items.captionPosition;
        document.getElementById('translationService').value = items.translationService;
        document.getElementById('speechRecognition').value = items.speechRecognition;
        
        updateOpacityDisplay();
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Language selection
    document.getElementById('targetLanguage').addEventListener('change', (e) => {
        saveSettings({ targetLanguage: e.target.value });
        notifyContentScript();
    });

    // Caption toggle
    document.getElementById('captionsToggle').addEventListener('change', (e) => {
        saveSettings({ captionsEnabled: e.target.checked });
        notifyContentScript();
    });

    // Audio translation toggle
    document.getElementById('audioToggle').addEventListener('change', (e) => {
        saveSettings({ audioTranslationEnabled: e.target.checked });
        notifyContentScript();
    });

    // Auto-detect toggle
    document.getElementById('autoDetectToggle').addEventListener('change', (e) => {
        saveSettings({ autoDetectEnabled: e.target.checked });
        notifyContentScript();
    });

    // Caption size
    document.getElementById('captionSize').addEventListener('change', (e) => {
        saveSettings({ captionSize: e.target.value });
        notifyContentScript();
    });

    // Caption opacity
    document.getElementById('captionOpacity').addEventListener('input', (e) => {
        saveSettings({ captionOpacity: parseFloat(e.target.value) });
        updateOpacityDisplay();
        notifyContentScript();
    });

    // Caption delay
    document.getElementById('captionDelay').addEventListener('change', (e) => {
        saveSettings({ captionDelay: parseInt(e.target.value) });
        notifyContentScript();
    });

    // Caption position
    document.getElementById('captionPosition').addEventListener('change', (e) => {
        saveSettings({ captionPosition: e.target.value });
        notifyContentScript();
    });

    // Translation service
    document.getElementById('translationService').addEventListener('change', (e) => {
        saveSettings({ translationService: e.target.value });
    });

    // Speech recognition
    document.getElementById('speechRecognition').addEventListener('change', (e) => {
        saveSettings({ speechRecognition: e.target.value });
    });

    // Reset settings
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
        chrome.runtime.openOptionsPage?.();
    });

    // Footer buttons
    document.getElementById('helpBtn').addEventListener('click', showHelp);
    document.getElementById('feedbackBtn').addEventListener('click', showFeedback);
    document.getElementById('rateBtn').addEventListener('click', openRating);
}

// Setup collapsible sections
function setupCollapsibleSections() {
    const headers = document.querySelectorAll('.section-header-btn');
    headers.forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            content.classList.toggle('active');
        });
    });
}

// Save settings to storage
function saveSettings(settings) {
    chrome.storage.sync.set(settings);
}

// Update opacity display
function updateOpacityDisplay() {
    const opacity = parseFloat(document.getElementById('captionOpacity').value);
    document.getElementById('opacityValue').textContent = Math.round(opacity * 100) + '%';
}

// Notify content script of changes
function notifyContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'settingsUpdated' }).catch(() => {
                // Silently fail if content script not loaded
            });
        }
    });
}

// Reset settings to default
function resetSettings() {
    if (confirm('Are you sure? This will reset all settings to default.')) {
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
        
        chrome.storage.sync.set(defaultSettings, () => {
            loadSettings();
            showNotification('Settings reset to default!');
        });
    }
}

// Show help
function showHelp() {
    alert(
        'LinguaFlow Help:\n\n' +
        '1. Select your target language\n' +
        '2. Toggle "Enable Captions" to show translations\n' +
        '3. Toggle "Translate Audio" to hear speech-to-speech translation\n' +
        '4. Customize caption settings in the "Caption Settings" section\n' +
        '5. The extension will automatically detect language in videos\n\n' +
        'Keyboard Shortcuts:\n' +
        'Ctrl+Shift+C - Toggle captions\n' +
        'Ctrl+Shift+T - Toggle translation'
    );
}

// Show feedback
function showFeedback() {
    chrome.tabs.create({
        url: 'https://github.com/edog0550/translating-web-extension/issues'
    });
}

// Open rating
function openRating() {
    chrome.tabs.create({
        url: 'https://chrome.google.com/webstore'
    });
}

// Show notification
function showNotification(message) {
    // Could be enhanced with a toast notification UI
    console.log(message);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey) {
        if (e.key === 'C') {
            document.getElementById('captionsToggle').click();
        } else if (e.key === 'T') {
            document.getElementById('audioToggle').click();
        }
    }
});
