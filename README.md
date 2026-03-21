# Multiple Design Station Display

A browser-based real-time departure board for Berlin public transport (BVG/VBB), inspired by the classic DAISY LED displays and modern TFT screens found at Berlin stations.

## ✨ Features

- 🟠 Daisy Mode — authentic LED look with orange-on-black display, pixel grid filter and scrolling ticker
- 🖥️ TFT Mode — modern LCD display with colored line badges
- 🔍 Station Search — live search across all VBB(Berlin and Brandenburg area) stops
- 🚇 Filters — toggle S-Bahn, U-Bahn, Tram, Bus and Regional trains individually
- 🔄 Auto Refresh — departures reload automatically every 20–30 seconds
- ⌨️ ESC — return to the start menu at any time

## 🚀 Quick Start

### Requirements

- A modern browser (Chrome, Firefox, Edge)
- VS Code with the Live Server extension — or any local web server or a standart webserver


### Installation

> [!CAUTION]
> This Project fetch Data from api third party api. If your unsure, please make sure to read the documentation of the vbb api first!
> https://v6.vbb.transport.rest/

bash
git clone https://github.com/BerlinTransport/bvg_daisy_station_display.git
cd bvg_daisy_station_display
Then in VS Code: right-click index.html → "Open with Live Server"

Or alternatively with Python:

bash
python -m http.server 8080
http://localhost:8080

> [!NOTE]
> ⚠️ The app does not work by opening it directly as a file:// URL, as browsers block external scripts and stylesheets in that case!

## 📁 Project Structure

    bvg_daisy_station_display/
    ├── index.html
    ├── css/
    │   ├── base.css          # Variables, reset, global footer
    │   ├── startmenu.css     # Configuration menu
    │   ├── monitor-daisy.css # Daisy display
    │   └── monitor-tft.css   # TFT display
    └── js/
        ├── globals.js        # Global variables & helper functions
        ├── config.js         # Line colors, button handlers
        ├── search.js         # Station search & API call
        ├── render-daisy.js   # Rendering — Daisy mode
        ├── render-tft.js     # Rendering — TFT mode
        └── monitor.js        # Update loop, ESC handler

## ⚙️ Configuration
Option	Description
Variant	Daisy (LED) or TFT (LCD)
Line Budget	Maximum number of departures displayed
Character Threshold	Destination text wraps or shrinks beyond this length
Ticker	Enable/disable scrolling text band (Daisy only)
Filters	Toggle individual transport types


## 🔌 API

This project uses the public VBB REST API v6:

https://v6.vbb.transport.rest

Station search: GET /locations?query=...

Departures: GET /stops/{id}/departures

The API is provided by VBB — Verkehrsverbund Berlin-Brandenburg and is free to use. Further documentation: vbb-rest on GitHub.
