# LinguaFlow - Video Translator Web Extension

A powerful, user-friendly web extension that translates video content and generates live closed captions with a beautiful Duolingo-inspired interface.

## ✨ Features

- **Real-time Video Translation**: Translate speech in videos to your preferred language
- **Live Closed Captioning**: Automatically generate and display captions for video content
- **Multi-language Support**: Support for 100+ languages
- **Duolingo-Inspired UI**: Clean, modern, and intuitive interface
- **Speech Recognition**: Leverages Web Speech API for accurate speech-to-text
- **Translation API Integration**: Uses Google Translate API for high-quality translations
- **One-Click Activation**: Simple toggle to enable/disable translation on any video
- **Customizable Settings**: Adjust caption size, speed, and language preferences

## 📋 Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer Mode** (top-right corner)
4. Click **Load unpacked** and select the extension folder
5. The extension icon will appear in your toolbar

## 🚀 How to Use

1. **Navigate to any website** with video content
2. **Click the LinguaFlow icon** in your extension toolbar
3. **Select your target language** from the dropdown
4. **Enable Captions** toggle to display translated captions
5. **Enable Audio Translation** to hear the translated speech
6. Captions and translations will appear in real-time

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **APIs Used**:
  - Web Speech API (Speech Recognition)
  - Google Translate API
  - HTML5 Audio/Video API
- **Browser APIs**: 
  - Content Scripts
  - Service Workers
  - Storage API

## 📁 Project Structure

```
.
├── manifest.json           # Extension configuration
├── popup.html              # Extension popup interface
├── popup.css               # Popup styling (Duolingo-inspired)
├── popup.js                # Popup logic and controls
├── content.js              # Content script for video manipulation
├── background.js           # Service worker for background tasks
├── styles.css              # Global styles
├── assets/
│   ├── icon-16.png         # Extension icon (16x16)
│   ├── icon-48.png         # Extension icon (48x48)
│   └── icon-128.png        # Extension icon (128x128)
├── index.html              # Main interface (optional landing page)
└── README.md               # This file
```

## ⚙️ Configuration

Edit your language preferences in the popup:

1. **Source Language**: Auto-detects from video language
2. **Target Language**: Choose from 100+ supported languages
3. **Caption Delay**: Adjust caption timing (milliseconds)
4. **Caption Size**: Small, Medium, Large
5. **Text Opacity**: Control caption transparency

## 🔧 Advanced Features

### Custom Language Pairs
You can add custom language pairs by modifying the language selection in `popup.js`.

### Keyboard Shortcuts
- `Ctrl + Shift + C`: Toggle captions
- `Ctrl + Shift + T`: Toggle translation
- `Ctrl + Shift + S`: Open settings

## 📝 Supported Languages

The extension supports translation between:
- Spanish, French, German, Italian, Portuguese
- Chinese (Simplified & Traditional), Japanese, Korean
- Arabic, Hindi, Russian, Turkish, Vietnamese
- And 80+ more languages

## 🐛 Troubleshooting

### Captions not appearing?
- Ensure the video is playing
- Check that captions are enabled in settings
- Refresh the page and try again

### Translation seems inaccurate?
- This is normal for real-time translation
- The accuracy improves with longer phrases
- Try adjusting caption delay settings

### Audio translation not working?
- Check browser permissions for microphone access
- Ensure your system has text-to-speech enabled
- Try reloading the extension

## 📜 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, suggestions, or feature requests, please open an issue on GitHub.

---

**Made with ❤️ to break down language barriers**
