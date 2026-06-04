// LinguaFlow Content Script - Handles video translation and captioning

const LinguaFlow = {
    settings: {},
    captionContainer: null,
    isActive: false,
    mediaElements: [],
    recognitionInstance: null,

    async init() {
        // Load settings
        await this.loadSettings();
        
        // Inject styles
        this.injectStyles();
        
        // Find video elements
        this.findMediaElements();
        
        // Monitor for new videos
        this.observeDOM();
        
        // Listen for popup messages
        this.setupMessageListener();
        
        console.log('LinguaFlow initialized on page');
    },

    async loadSettings() {
        return new Promise((resolve) => {
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
                this.settings = items;
                resolve();
            });
        });
    },

    injectStyles() {
        const styleId = 'linguaflow-styles';
        if (document.getElementById(styleId)) return;

        const styles = `
            #linguaflow-caption-container {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, ${this.settings.captionOpacity});
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 500;
                z-index: 999999;
                max-width: 90%;
                text-align: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.4;
                word-wrap: break-word;
                animation: slideUp 0.3s ease;
            }

            #linguaflow-caption-container.top {
                bottom: auto;
                top: 20px;
            }

            #linguaflow-caption-container.center {
                bottom: auto;
                top: 50%;
                transform: translate(-50%, -50%);
            }

            #linguaflow-caption-container.small {
                font-size: 12px;
                padding: 8px 15px;
            }

            #linguaflow-caption-container.medium {
                font-size: 16px;
                padding: 12px 20px;
            }

            #linguaflow-caption-container.large {
                font-size: 20px;
                padding: 15px 25px;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }

            .linguaflow-badge {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 10px 15px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                z-index: 999998;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .linguaflow-badge:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
            }
        `;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = styles;
        document.head.appendChild(style);
    },

    findMediaElements() {
        const videos = document.querySelectorAll('video');
        this.mediaElements = [];
        
        videos.forEach((video) => {
            if (!this.mediaElements.includes(video)) {
                this.mediaElements.push(video);
                this.attachVideoListeners(video);
            }
        });
    },

    attachVideoListeners(video) {
        video.addEventListener('play', () => {
            if (this.settings.captionsEnabled) {
                this.startCaption();
            }
        });

        video.addEventListener('pause', () => {
            this.stopCaption();
        });
    },

    observeDOM() {
        const observer = new MutationObserver(() => {
            this.findMediaElements();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'settingsUpdated') {
                this.loadSettings().then(() => {
                    if (this.isActive) {
                        this.updateCaptionStyles();
                    }
                });
            }
            sendResponse({ received: true });
        });
    },

    createCaptionContainer() {
        if (this.captionContainer) return this.captionContainer;

        this.captionContainer = document.createElement('div');
        this.captionContainer.id = 'linguaflow-caption-container';
        this.captionContainer.className = `${this.settings.captionSize} ${this.settings.captionPosition}`;
        document.body.appendChild(this.captionContainer);

        return this.captionContainer;
    },

    displayCaption(text) {
        const container = this.createCaptionContainer();
        container.textContent = text;
        container.style.display = 'block';

        // Auto-hide after delay
        setTimeout(() => {
            container.style.display = 'none';
        }, 4000 + this.settings.captionDelay);
    },

    updateCaptionStyles() {
        if (!this.captionContainer) return;

        this.captionContainer.className = `${this.settings.captionSize} ${this.settings.captionPosition}`;
        this.captionContainer.style.backgroundColor = `rgba(0, 0, 0, ${this.settings.captionOpacity})`;
    },

    startCaption() {
        this.isActive = true;
        this.createCaptionContainer();
        
        if (this.settings.audioTranslationEnabled) {
            this.initializeSpeechRecognition();
        } else {
            this.displayCaption('🌍 LinguaFlow Active - Translating to ' + this.getLanguageName(this.settings.targetLanguage));
        }
    },

    stopCaption() {
        this.isActive = false;
        if (this.captionContainer) {
            this.captionContainer.style.display = 'none';
        }
        this.stopSpeechRecognition();
    },

    initializeSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.displayCaption('Speech recognition not supported in your browser');
            return;
        }

        if (this.recognitionInstance) return;

        this.recognitionInstance = new SpeechRecognition();
        this.recognitionInstance.continuous = true;
        this.recognitionInstance.interimResults = true;
        this.recognitionInstance.lang = 'en-US'; // Auto-detect in future

        this.recognitionInstance.onstart = () => {
            this.displayCaption('🎤 Listening...');
        };

        this.recognitionInstance.onresult = async (event) => {
            let transcript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }

            if (transcript.trim()) {
                this.displayCaption('🔄 Translating: ' + transcript);
                const translated = await this.translateText(transcript, this.settings.targetLanguage);
                this.displayCaption(translated);
            }
        };

        this.recognitionInstance.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.displayCaption('❌ Error: ' + event.error);
        };

        try {
            this.recognitionInstance.start();
        } catch (e) {
            console.log('Speech recognition already started');
        }
    },

    stopSpeechRecognition() {
        if (this.recognitionInstance) {
            try {
                this.recognitionInstance.stop();
                this.recognitionInstance = null;
            } catch (e) {
                console.log('Speech recognition stop error:', e);
            }
        }
    },

    async translateText(text, targetLang) {
        try {
            // Using Google Translate API (free endpoint)
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
            );
            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData.translatedText) {
                return data.responseData.translatedText;
            }
            return text; // Return original if translation fails
        } catch (e) {
            console.error('Translation error:', e);
            return text;
        }
    },

    getLanguageName(code) {
        const languages = {
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'zh-TW': 'Chinese (Traditional)',
            'ru': 'Russian',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'tr': 'Turkish',
            'vi': 'Vietnamese',
            'th': 'Thai',
            'pl': 'Polish',
            'sv': 'Swedish',
            'nl': 'Dutch',
            'el': 'Greek',
            'he': 'Hebrew'
        };
        return languages[code] || code;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LinguaFlow.init());
} else {
    LinguaFlow.init();
}
