# PaperMu Admin Studio

PaperMu is an intelligent, cross-platform web control panel designed for managing, configuring, and monitoring Mu Online servers (such as OpenMU, TT, IGCN, MU2003, and mobile variants like Origin). 

Built to run anywhere, PaperMu connects directly to your server architecture native file systems and databases, offering a complete set of visual tools for game administration.

## 🚀 Features

- **Cross-Platform Compatibility:** Run your servers on Windows, WSL, cloud VPS, Android, or even embedded boards (Raspberry Pi/Orange Pi).
- **Web-Based Management:** Avoid editing `.txt` or `.bmd` files manually. Use visual tools for Spots, Shops, Items, CashShop, and Events.
- **SSH / Local File Access:** The panel connects natively via File System for local setups or via SSH (SFTP) for remote environments.
- **MSSQL & Database Integration:** Execute queries, manage accounts, and view live database stats natively through ODBC/SQL drivers.
- **AI-Powered Diagnostics:** Detect crashes and configuration errors instantly using integrated AI logs analysis.

## 🛠 Installation Guide & Prerequisites

PaperMu is a full-stack Node.js application (React + Express + Vite). It can be installed anywhere Node.js runs.

### Prerequisites (For Clean Environments)

Before installing PaperMu, ensure your system has the required dependencies:

**For Windows:**
- Install [Node.js](https://nodejs.org/) (v18+ LTS recommended)
- Install Git for Windows (optional, for cloning the repo)

**For Clean Linux (Ubuntu/Debian) or WSL:**
Run the following commands to update your system and install the required base dependencies:
```bash
sudo apt-get update && sudo apt-get upgrade -y
# Install curl, git, and build tools
sudo apt-get install curl git build-essential -y
# Install Node.js (Current LTS via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 1. Windows Native (Classic)
Ideal for standard MuServer environments working directly on the Windows drives.
1. Clone or download this project.
   ```bash
   git clone https://github.com/wadsonbr2/papermu.git
   cd papermu
   ```
2. Install dependencies and run in production mode:
   ```bash
   npm install
   npm run build
   npm run start
   ```
3. Access `http://localhost:3000` in your browser.
4. In the panel, go to **Setup & Instalação**, set `Caminho` to `C:\MuServer`. Connection mode: `Local/fs`.

### 2. Linux (Clean VPS/Desktop) or WSL
Run the panel natively on Linux. If using WSL, it can efficiently manage your Windows files from a Linux environment.
1. Clone the repository and enter the directory:
   ```bash
   git clone https://github.com/wadsonbr2/papermu.git
   cd papermu
   ```
2. Install the application and start the server:
   ```bash
   npm install
   npm run build
   npm run start
   ```
3. Access `http://localhost:3000` in your browser.
4. In the panel setup:
   - **For native Linux:** Set `Caminho` to your Linux server folder (e.g., `/home/user/muserver` or `/opt/papermu`).
   - **For WSL targeting Windows files:** Set `Caminho` to `/mnt/c/MuServer` to manage files on your C: drive directly from the Linux subsystem.
   - Use connection mode `Local/Node FS`.

**Optional: Create global commands (`stamu` & `stomu`)**
To start and stop the panel from any folder, run these commands inside the `papermu` folder to create terminal aliases:
```bash
echo "alias stamu='cd ~/papermu && nohup npm run start > ~/papermu/papermu.log 2>&1 & echo \"PaperMu Admin Studio Started\"'" >> ~/.bashrc
echo "alias stomu='pkill -f \"server.ts\" && echo \"PaperMu Admin Studio Stopped\"'" >> ~/.bashrc
source ~/.bashrc
```
Now you can simply type `stamu` in any directory to start the panel, and `stomu` to stop it.

### 3. Cloud VPS (Linux/Windows) via SSH
If your MuServer is hosted on an external VPS, you can run this panel locally on your PC and connect to the VPS via SSH.
1. Under **Setup & Instalação**, choose **Remoto OpenSSH VPS**.
2. Enter the VPS IP, Port (usually 22), Root User and Password.
3. PaperMu will securely tunnel SFTP commands to read and save files securely directly from the cloud without needing FTP clients.

### 4. Embedded Boards (Raspberry Pi, Orange Pi) - ARM Architecture
Building a low-power, lightweight retro MuServer using OpenMU or C++ emulators?
1. Follow the clean Linux prerequisites to install Node.js on your Pi.
2. Run `npm install` and `npm run start` (production script).
3. In the panel, define your path like `/home/pi/mu-server` or `/opt/papermu`.
4. It works flawlessly due to Node.js native cross-architecture support for basic file reading and writing.

### 5. Multi-platform / Android (Mobile Mu Servers)
If managing mobile repacks (like Mu Origin / Awakening) hosted in Docker/CentOS:
1. Connect via **Remoto OpenSSH VPS**.
2. Target the `/data` or `/opt/server` directories mapped to your Docker containers.

## 🤝 Support
Join the community at RageZone and contribute! This application is designed to modernize how we manage Mu Online networks and infrastructure.
