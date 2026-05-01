# PaperMu Admin Studio

PaperMu is an intelligent, cross-platform web control panel designed for managing, configuring, and monitoring Mu Online servers (such as OpenMU, TT, IGCN, MU2003, and mobile variants like Origin). 

Built to run anywhere, PaperMu connects directly to your server architecture native file systems and databases, offering a complete set of visual tools for game administration.

## 🚀 Features

- **Cross-Platform Compatibility:** Run your servers on Windows, WSL, cloud VPS, Android, or even embedded boards (Raspberry Pi/Orange Pi).
- **Web-Based Management:** Avoid editing `.txt` or `.bmd` files manually. Use visual tools for Spots, Shops, Items, CashShop, and Events.
- **SSH / Local File Access:** The panel connects natively via File System for local setups or via SSH (SFTP) for remote environments.
- **MSSQL & Database Integration:** Execute queries, manage accounts, and view live database stats natively through ODBC/SQL drivers.
- **AI-Powered Diagnostics:** Detect crashes and configuration errors instantly using integrated AI logs analysis.

## 🛠 Installation Guide

PaperMu is a full-stack Node.js (React/Express/Vite) application. It can be installed anywhere Node.js runs.

### 1. Windows Native (Classic)
Ideal for standard MuServer environments.
1. Download Node.js for Windows.
2. Clone or download this project.
3. Open CMD in the project folder and run:
   ```bash
   npm install
   npm run dev
   ```
4. Access `http://localhost:3000`
5. In the panel, go to **Setup & Instalação**, set `Caminho` to `C:\MuServer`. Connection mode: `Local/fs`.

### 2. WSL (Windows Subsystem for Linux)
Run the panel on Linux securely while targeting the Windows file system.
1. Inside WSL, run:
   ```bash
   npm install
   npm run dev
   ```
2. In the panel setup, set `Caminho` (Path) to: `/mnt/c/MuServer` using connection mode `Local/fs`.

### 3. Cloud VPS (Linux/Windows) via SSH
If your MuServer is hosted on an external VPS, you can run this panel remotely or locally (connecting via SSH).
1. Under **Setup & Instalação**, choose **Remoto OpenSSH VPS**.
2. Enter the VPS IP, Port (usually 22), Root User and Password.
3. PaperMu will securely tunnel SFTP commands to read and save files securely directly from the cloud without needing FTP clients.

### 4. Embedded Boards (Raspberry Pi, Orange Pi) - ARM Architecture
Building a low-power, lightweight retro MuServer using OpenMU or C++ emulators?
1. Install Node.js on your Pi (`apt-get install nodejs npm`).
2. Run `npm install` and `npm run start` (production script).
3. In the panel, define your path like `/home/pi/mu-server` or `/opt/papermu`.
4. It works flawlessly due to Node.js native cross-architecture support for basic file reading and writing.

### 5. Multi-platform / Android (Mobile Mu Servers)
If managing mobile repacks (like Mu Origin / Awakening) hosted in Docker/CentOS:
1. Connect via **Remoto OpenSSH VPS**.
2. Target the `/data` or `/opt/server` directories mapped to your Docker containers.

## 🤝 Support
Join the community at RageZone and contribute! This application is designed to modernize how we manage Mu Online networks and infrastructure.
