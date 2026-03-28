# 📈 NEPSE IPO Tracker
### Built by **Kris** — JESS, Dhangadhi, Nepal

A clean, beautiful web app to track **Nepal Stock Exchange (NEPSE)** IPOs in real-time. Get notified about new ordinary share IPOs, see open/upcoming ones, and track closed IPOs with their current market status.

---

## ✨ Features

- 🟢 **Open IPOs** — currently accepting applications
- 🔜 **Upcoming IPOs** — announced but not yet open
- ✅ **Closed IPOs** — with current market price & gain/loss
- 🔔 **Browser Notifications** — get alerted on new IPOs
- 🌙 **Dark Mode** — clean dark blue theme
- 📱 **Responsive** — works on mobile & desktop
- 🔄 **Auto-refresh** — every 5 minutes
- 💾 **Seen IPO tracking** — remembers which IPOs you've seen

---

## 🚀 How to Use

### Option 1 — Open Directly
Just open `index.html` in any browser. No setup needed!

### Option 2 — Host on GitHub Pages (Free)
1. Create a new GitHub repo (e.g., `nepse-ipo-tracker`)
2. Upload all 3 files: `index.html`, `style.css`, `app.js`
3. Go to **Settings → Pages → Source: main branch / root**
4. Your site will be live at: `https://yourusername.github.io/nepse-ipo-tracker`

---

## 📡 Data Source

Data is fetched from **[Merolagani.com](https://merolagani.com)** via a free CORS proxy.  
If live fetch fails, the app shows realistic **sample/cached data** automatically.

> ⚠️ No paid API key needed. This is 100% free.

### To apply for IPOs:
👉 Go to **[MeroShare](https://meroshare.cdsc.com.np/)** — the official CDSC platform

---

## 📁 Project Files

```
nepse-ipo-tracker/
├── index.html    ← Main HTML structure
├── style.css     ← All styles + dark mode + animations
├── app.js        ← Data fetching + rendering + notifications
└── README.md     ← This file
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| HTML5 | Structure |
| CSS3 | Styling, animations, dark mode |
| Vanilla JavaScript | Logic, data fetching |
| Google Fonts (Sora + JetBrains Mono) | Typography |
| AllOrigins Proxy | CORS bypass for Merolagani |
| Browser Notification API | IPO alerts |
| localStorage | Save seen IPOs + theme preference |

---

## 🙋 About

Made by **Kris (Krish Chand)**  
Class 9 — Jaycees Everest Secondary School (JESS), Dhangadhi, Kailali, Nepal  
Passionate about coding, AI, and technology 🚀

---

*Data sourced from Merolagani.com and ShareSansar.com. This is an independent tracker, not affiliated with NEPSE or SEBON.*
