<div align="center">
  <img src="public/favicon.svg" alt="Stocker Logo" width="120" />

  # Stocker 📦💰
  
  **Your All-in-One Personal Inventory & Money Planner.**

  [![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-success?logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
  [![Zustand](https://img.shields.io/badge/Zustand-State-black?logo=react)](https://github.com/pmndrs/zustand)
  [![Dexie](https://img.shields.io/badge/Dexie.js-IndexedDB-orange)](https://dexie.org/)

  <p align="center">
    Stocker is a modern, mobile-first Progressive Web App (PWA) built to help you seamlessly track your physical belongings and manage your financial budget all in one beautifully designed dashboard. 
  </p>
</div>

---

## ✨ Features

### 📦 Inventory Management
- **Smart Tracking:** Add, categorize, and track your physical items.
- **Barcode & QR Scanner:** Instantly scan items using your phone's camera to add or search for products.
- **Quick Sales:** Sell items directly from your inventory. It automatically deducts stock and logs the income to your money dashboard!
- **Stock Status Alerts:** Stay on top of "Low Stock" or "Out of Stock" items.

### 💸 Money & Budgeting
- **Transactions Tracker:** Log your income and expenses seamlessly.
- **Budgeting Limits:** Set monthly limits for categories and receive visual alerts when you approach or exceed them.
- **Savings Goals:** Create custom savings goals and track your progress to financial freedom.

### 🌍 Global & Smart
- **Live Exchange Rates:** Auto-fetches live currency rates (like TWD and IDR) so you always have accurate conversions.
- **Offline Capable:** Powered by `Dexie.js` (IndexedDB) so it works even without an internet connection.
- **PWA Ready:** Install Stocker directly to your phone or desktop home screen for a native app experience.

---

## 🚀 Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Modern Glassmorphism & Dark Mode support)
- **State Management:** Zustand
- **Local Database:** Dexie.js (IndexedDB wrapper)
- **Icons:** Lucide React
- **Barcode Scanner:** html5-qrcode
- **PWA Plugin:** vite-plugin-pwa

---

## 🛠️ Getting Started

Follow these instructions to set up Stocker locally on your machine.

### Prerequisites
- Node.js (v18+)
- npm or yarn or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/stocker.git
   cd stocker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Testing on Mobile (Local Network):**
   To test the Barcode/Camera features on your mobile device, the app must be served securely. Run:
   ```bash
   npm run dev --host
   ```
   *Then, open the `https://<your-local-ip>:5173` link provided in the terminal on your phone.*

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🎨 UI/UX Highlights

- **Dynamic Theming:** Seamlessly switches between Dark and Light mode following system preferences.
- **Mobile First:** Designed to look and feel like a native mobile application.
- **Interactive Animations:** Uses micro-interactions and smooth transitions to create an engaging user experience.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check out the [issues page](https://github.com/your-username/stocker/issues) if you want to contribute.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <i>Built with ❤️ for better personal management.</i>
</div>
