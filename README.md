# Flashcards (CSV) – Gutenberg Block

Create beautiful, interactive flashcards directly in WordPress using a simple CSV file.

Flashcards (CSV) is a custom Gutenberg block that transforms spreadsheet-based questions and answers into a modern, Notebook-style flashcard interface designed for training, SOPs, quizzes, onboarding, and educational content.

---

## ✨ Features

- Import flashcards from CSV (Question & Answer columns)
- Native Gutenberg block
- Clean Notebook-style dark UI
- Flip animation and navigation buttons
- Fullscreen mode for distraction-free learning
- Keyboard navigation (← → Enter / Space)
- Responsive and mobile-friendly design
- Works instantly after upload
- No database tables required
- No third-party dependencies

---

## 🚀 Installation

### Manual Installation

1. Download or clone this repository.
2. Upload the folder to:

wp-content/plugins/flashcards-block/


3. Activate the plugin from **WordPress Admin → Plugins**.
4. Edit a page or post and insert the **Flashcards (CSV)** block.

---

## 📂 CSV Format

Your CSV file must contain two columns:

```csv
Question,Answer
What is check-in time?,Standard check-in is from 2 PM.
What ID is required?,A government-issued ID is mandatory.

```
The header row is optional.

🧠 How It Works

Insert the Flashcards (CSV) block.

Upload your CSV file.

Questions and answers are imported into the page.

The CSV file is no longer required after import.

Visitors interact with the flashcards on the front-end.

🛠 Requirements
Requirement	Minimum Version
WordPress	6.0
PHP	7.4
Editor	Gutenberg
🧪 Notes

Flashcards are interactive on the live site only.

The editor displays a preview mode.

CSV import is used only while editing.

Very large decks (500+ cards) may impact performance.

🔍 SEO (Optional)

Flashcard content is rendered via JavaScript.

If search engine visibility for questions and answers is required, the plugin can be extended to output crawlable content in HTML format.

👨‍💻 Development

This plugin is written using:

Vanilla JavaScript

CSS

WordPress Block APIs

No build tools or frameworks are required.

Possible Extensions

Categories or tags per card

Multiple decks per page

Search and filtering

Assessment or scoring modes

Progress tracking

Randomised decks

🤝 Contributing

Contributions are very welcome.

Fork the repository

Create a feature branch

Commit your changes

Open a Pull Request

📄 License

GPL v2 or later

⭐ Support

If you find this plugin useful, please star the repository to support development.

