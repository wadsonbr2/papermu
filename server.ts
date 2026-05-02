import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { exec } from "child_process";
import os from "os";
import sql from "mssql";
import { Client } from "ssh2";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get real path. Defaults to WSL/Windows path, or local folder for sandbox.
let muServerPath = process.env.MUSERVER_PATH || (os.platform() === 'win32' ? "C:\\MuServer" : "/mnt/c/MuServer");

// Database configuration state
let dbConfig = {
  user: 'sa',
  password: '',
  server: process.env.DB_HOST || 'localhost',
  database: 'MuOnline',
  requestTimeout: 5000,
  connectionTimeout: 3000,
  options: {
    encrypt: false, // For local dev
    trustServerCertificate: true 
  }
};

// Connection Mode State
let connectionMode: 'local' | 'remote' = 'local';
let sshConfig = { host: '', port: 22, username: 'Administrator', password: '' };


let dbPool: sql.ConnectionPool | null = null;
let dbError: string | null = null;

async function connectDB() {
   try {
      if (dbPool) {
         await dbPool.close();
      }
      dbPool = await sql.connect(dbConfig);
      dbError = null;
      console.log("Connected to MSSQL Database successfully.");
   } catch (error: any) {
      dbError = error.message;
      dbPool = null;
      console.log("Failed to connect to DB:", error.message);
   }
}
// Try initial connection
connectDB().catch(console.error);

// Helper for SSH Execution
function executeRemote(cmd: string): Promise<{stdout: string, stderr: string}> {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
            conn.exec(cmd, (err, stream) => {
                if (err) { conn.end(); return reject(err); }
                let stdoutStr = '';
                let stderrStr = '';
                stream.on('close', () => { conn.end(); resolve({stdout: stdoutStr, stderr: stderrStr}); })
                      .on('data', (data: any) => stdoutStr += data.toString())
                      .stderr.on('data', (data: any) => stderrStr += data.toString());
            });
        }).on('error', reject).connect(sshConfig);
    });
}

function sftpOperation(operation: 'read' | 'write' | 'mkdir', filepath: string, content?: string): Promise<string | void> {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
             conn.sftp((err, sftp) => {
                 if (err) { conn.end(); return reject(err); }
                 
                 const windowsToLinuxPath = filepath.replace(/\\/g, '/'); // ensure standard format
                 
                 if (operation === 'read') {
                     sftp.readFile(windowsToLinuxPath, 'utf8', (err, data) => {
                         conn.end();
                         if (err) reject(err); else resolve(data.toString());
                     });
                 } else if (operation === 'write') {
                      sftp.writeFile(windowsToLinuxPath, content || '', 'utf8', (err) => {
                         conn.end();
                         if (err) reject(err); else resolve();
                      })
                 }
             });
        }).on('error', reject).connect(sshConfig);
    });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Real download and install endpoint
  app.post("/api/install-repack", async (req, res) => {
      const { link, title } = req.body;
      if (!link) return res.status(400).json({ error: "Missing link" });

      try {
          // If it's remote, we'd execute via SSH. Here we'd assume local or WSL.
          // Since GDrive folders are hard to download directly via curl without auth,
          // we use generic clone/download behavior for URLs ending in .zip or github repos.
          let cmd = '';
          const isWin = os.platform() === 'win32';
          
          if (link.includes("github.com")) {
              if (isWin) {
                  cmd = `cd /d "${muServerPath}" && git clone ${link} .`;
              } else {
                  cmd = `cd "${muServerPath}" && git clone ${link} .`;
              }
          } else if (link.endsWith(".zip")) {
              if (isWin) {
                  cmd = `cd /d "${muServerPath}" && curl -L -o repack.zip ${link} && tar -xf repack.zip`;
              } else {
                  cmd = `cd "${muServerPath}" && curl -L -o repack.zip ${link} && unzip repack.zip`;
              }
          } else {
               // Fallback: Just create a README in the folder since we can't easily auto-download google drive paths or arbitrary forums securely via curl without user tokens.
               // We will log this to the user.
               const readmeContent = `The repack ${title} was requested from:\n${link}\n\nPlease download it manually and place contents here if it's a Drive/Mega link format.`;
               fs.mkdirSync(muServerPath, { recursive: true });
               fs.writeFileSync(path.join(muServerPath, 'README-INSTALL.txt'), readmeContent);
               
               // Attempt to open the link in the browser if possible, but we are a server.
               return res.json({ success: true, message: "URL is a Drive/Mega or Forum link. Please download manually and extract to " + muServerPath, manual: true });
          }

          exec(cmd, (err, stdout, stderr) => {
              if (err) {
                  return res.status(500).json({ error: err.message, stderr });
              }
              res.json({ success: true, message: `Successfully downloaded and installed ${title}.`, stdout });
          });
      } catch (err: any) {
          res.status(500).json({ error: err.message });
      }
  });

  // DB Config API
  app.get("/api/db-config", (req, res) => {
     res.json({
         ...dbConfig,
         password: '', // don't send password back normally, but we keep it empty for security
         status: dbPool ? 'connected' : 'disconnected',
         error: dbError
     });
  });

  app.post("/api/db-config", async (req, res) => {
      const { user, password, server, database } = req.body;
      if (user) dbConfig.user = user;
      if (password) dbConfig.password = password;
      if (server) dbConfig.server = server;
      if (database) dbConfig.database = database;
      
      await connectDB();
      res.json({ success: dbPool !== null, error: dbError });
  });

  // Real Database Players API
  app.get("/api/players", async (req, res) => {
      if (!dbPool) {
          return res.status(500).json({ error: "Not connected to database. Please configure DB settings.", dbError });
      }

      try {
          // A standard query for MuOnline databases
          // We limit to 100 to avoid freezing on massive servers just in case
          const result = await dbPool.request().query(`
             SELECT TOP 100 
                Name, 
                Class, 
                cLevel, 
                ResetCount = ISNULL((SELECT ResetCount FROM Character WHERE Name = C.Name), 0),
                MapNumber, 
                MapPosX, 
                MapPosY,
                CtlCode,
                AccountID
             FROM Character C
             ORDER BY cLevel DESC
          `);
          
          res.json({ players: result.recordset });
      } catch (error: any) {
          // If ResetCount doesn't exist (depends on DB version like MUDatabase vs MU2003)
          try {
             const fallbackResult = await dbPool.request().query(`
                SELECT TOP 100 Name, Class, cLevel, 0 as ResetCount, MapNumber, MapPosX, MapPosY, CtlCode, AccountID
                FROM Character
                ORDER BY cLevel DESC
             `);
             res.json({ players: fallbackResult.recordset });
          } catch(fallbackError: any) {
             res.status(500).json({ error: fallbackError.message });
          }
      }
  });

  // Dashboard Stats API
  app.get("/api/dashboard-stats", async (req, res) => {
      if (!dbPool) {
          return res.json({ 
              totalAccounts: 0, 
              totalCharacters: 0, 
              totalGuilds: 0, 
              onlinePlayers: 0 
          });
      }

      try {
          // Count total accounts
          const accs = await dbPool.request().query('SELECT COUNT(*) as count FROM MEMB_INFO');
          // Count total characters
          const chars = await dbPool.request().query('SELECT COUNT(*) as count FROM Character');
          // Count guilds
          const guilds = await dbPool.request().query('SELECT COUNT(*) as count FROM Guild');
          // Count online players (usually ConnectStat = 1 in MEMB_STAT)
          let online = { recordset: [{ count: 0 }] };
          try {
             online = await dbPool.request().query('SELECT COUNT(*) as count FROM MEMB_STAT WHERE ConnectStat = 1');
          } catch(e) {
             // In case MEMB_STAT is missing or different
          }
          
          res.json({
              totalAccounts: accs.recordset[0].count,
              totalCharacters: chars.recordset[0].count,
              totalGuilds: guilds.recordset[0].count,
              onlinePlayers: online.recordset[0].count
          });
      } catch (error: any) {
          res.status(500).json({ error: error.message });
      }
  });

  // DB Query Execution API
  app.post("/api/db/execute", async (req, res) => {
      const { query } = req.body;
      if (!dbPool) {
          return res.status(500).json({ error: "Not connected to database." });
      }
      try {
          // Careful: this allows raw queries. Ensure this is only used locally!
          const result = await dbPool.request().query(query);
          res.json({ success: true, result: result.recordset, rowsAffected: result.rowsAffected });
      } catch (error: any) {
          res.status(500).json({ error: error.message });
      }
  });

  // Setup / Install API
  app.post("/api/install/folders", async (req, res) => {
     try {
         const folders = [
            "ConnectServer\\Data", "DataServer", "JoinServer", 
            "GameServer\\Data", "GameServer\\LOG", 
            "Data\\Local", "Data\\Monster", "Data\\EventItemBag"
         ];

         if (connectionMode === 'remote') {
            for (const f of folders) {
               await executeRemote(`mkdir "${muServerPath}\\${f}" 2>NUL`);
            }
            return res.json({ success: true });
         }

         folders.forEach(v => {
            const f = v.replace(/\\/g, path.sep);
            const fullPath = path.join(muServerPath, f);
            if (!fs.existsSync(fullPath)) {
               fs.mkdirSync(fullPath, { recursive: true });
            }
         });
         res.json({ success: true });
     } catch(e: any) {
         res.status(500).json({ error: e.message });
     }
  });

  app.post("/api/install/sql", async (req, res) => {
     const { saPassword, os: targetOs, method } = req.body;
     
     if (!saPassword || saPassword.length < 8) {
         return res.status(400).json({ error: "A senha do SA precisa ter no mínimo 8 caracteres." });
     }

     try {
         let cmd = "";
         const isWin = targetOs === 'windows' || (targetOs === 'auto' && os.platform() === 'win32');
         const isDocker = method === 'docker';

         if (isDocker) {
            cmd = `docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=${saPassword}" -p 1433:1433 --name mssql-server-mu -d mcr.microsoft.com/mssql/server:2019-latest`;
         } else if (isWin) {
            // Usa o Invoke-WebRequest para baixar o SQL Express e rodar silencioso
            cmd = `powershell -Command "Write-Output 'Downloading SQL Express...'; Invoke-WebRequest -Uri 'https://go.microsoft.com/fwlink/?linkid=866658' -OutFile 'sqlexpress.exe'; Write-Output 'Installing SQL Express Silently...'; Start-Process -Wait -FilePath '.\\sqlexpress.exe' -ArgumentList '/q', '/ACTION=Install', '/FEATURES=SQLEngine', '/INSTANCENAME=SQLEXPRESS', '/SQLSVCACCOUNT=\\"NT AUTHORITY\\Network Service\\"', '/SQLSYSADMINACCOUNTS=\\"BUILTIN\\ADMINISTRATORS\\"', '/AGTSVCACCOUNT=\\"NT AUTHORITY\\Network Service\\"', '/IACCEPTSQLSERVERLICENSETERMS', '/SECURITYMODE=SQL', '/SAPWD=\\"${saPassword}\\"' -NoNewWindow"`;
         } else {
            // Linux Apt
            cmd = `wget -qO- https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add - && sudo add-apt-repository "$(wget -qO- https://packages.microsoft.com/config/ubuntu/20.04/mssql-server-2019.list)" && sudo apt-get update && sudo apt-get install -y mssql-server && sudo MSSQL_SA_PASSWORD="${saPassword}" ACCEPT_EULA="Y" /opt/mssql/bin/mssql-conf -n setup`;
         }

         if (connectionMode === 'remote') {
            await executeRemote(cmd);
            return res.json({ success: true, message: "Comando de instalação SQL executado com sucesso no nó remoto." });
         } else {
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    return res.status(500).json({ error: err.message, stderr, stdout });
                }
                res.json({ success: true, message: `SQL Server Instalado localmente com sucesso!`, stdout });
            });
         }
     } catch(e: any) {
         res.status(500).json({ error: e.message });
     }
  });

  app.post("/api/update", async (req, res) => {
    try {
        const cmd = "git pull origin main && npm install && npm run build";
        exec(cmd, { cwd: process.cwd() }, (err, stdout, stderr) => {
           if (err) {
               return res.status(500).json({ error: err.message, stdout, stderr });
           }
           res.json({ success: true, message: "Painel atualizado com sucesso!", stdout });
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
  });

  // Config API
  app.get("/api/config", (req, res) => {
    res.json({ muServerPath, connectionMode, sshConfig: { ...sshConfig, password: '' } });
  });

  app.post("/api/config", (req, res) => {
    const { muServerPath: newPath, mode, ssh } = req.body;
    if(newPath) {
       muServerPath = newPath;
       if (connectionMode === 'local' && !fs.existsSync(muServerPath)) {
         fs.mkdirSync(muServerPath, { recursive: true });
       }
    }
    if (mode) connectionMode = mode;
    if (ssh) sshConfig = { ...sshConfig, ...ssh };
    
    res.json({ success: true, muServerPath, connectionMode });
  });

  // Get real host info
  app.get("/api/server-info", (req, res) => {
    res.json({
       os: os.type() + " " + os.release() + " (" + os.platform() + ")",
       cpu: os.cpus()[0]?.model || "Processador Desconhecido",
       storage: "Analisado pelo Host",
       ram: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
       playersOnline: 0,
       status: "online"
    });
  });

  // Process Control (Start/Stop using WSL integration or native Windows or SSH)
  app.post("/api/action/:cmd", async (req, res) => {
    const { cmd } = req.params;
    
    if (connectionMode === 'remote') {
         if (cmd === 'start') {
             const startCmd = `cd /d "${muServerPath}\\JoinServer" && start JoinServer.exe & cd /d "${muServerPath}\\GameServer" && start GameServer.exe`;
             try {
                const { stdout, stderr } = await executeRemote(startCmd);
                return res.json({ success: true, message: "Started servers remotely", stdout, stderr });
             } catch(err: any) {
                return res.json({ success: false, error: err.message });
             }
         } else if (cmd === 'stop') {
             try {
                const { stdout, stderr } = await executeRemote(`taskkill /F /IM GameServer.exe /IM JoinServer.exe`);
                return res.json({ success: true, message: "Stopped servers remotely", stdout, stderr });
             } catch(err: any) {
                return res.json({ success: false, error: err.message });
             }
         }
    }

    const isWsl = os.release().toLowerCase().includes("microsoft");
    const isWin = os.platform() === 'win32';
    
    if (cmd === 'start') {
        const joinServerPath = path.join(muServerPath, 'JoinServer');
        const gameServerPath = path.join(muServerPath, 'GameServer');
        
        let startCmd = '';
        if (isWin) {
            startCmd = `start /d "${joinServerPath}" JoinServer.exe & start /d "${gameServerPath}" GameServer.exe`;
        } else if (isWsl) {
            const winJsStr = path.join(joinServerPath).replace(/\/mnt\/([a-z])/gi, (m, drive) => `${drive.toUpperCase()}:`).replace(/\//g, '\\');
            const winGsStr = path.join(gameServerPath).replace(/\/mnt\/([a-z])/gi, (m, drive) => `${drive.toUpperCase()}:`).replace(/\//g, '\\');
            startCmd = `cmd.exe /c "start /d "${winJsStr}" JoinServer.exe & start /d "${winGsStr}" GameServer.exe"`;
        } else {
            console.log("Mocking start on unsupported platform");
            return res.json({ success: true, message: "Mock Started" });
        }
        
        exec(startCmd, (err, stdout, stderr) => {
            if(err) return res.json({ success: false, error: err.message, stderr });
            res.json({ success: true, message: "Started servers", stdout });
        });
    } else if (cmd === 'stop') {
        let stopCmd = '';
        if (isWin) {
            stopCmd = `taskkill /F /IM GameServer.exe /IM JoinServer.exe`;
        } else if (isWsl) {
            stopCmd = `cmd.exe /c "taskkill /F /IM GameServer.exe /IM JoinServer.exe"`;
        } else {
            return res.json({ success: true, message: "Mock Stopped" });
        }
        
        exec(stopCmd, (err, stdout, stderr) => {
             res.json({ success: true, message: "Stopped servers", stdout, stderr });
        });
    } else {
        res.status(400).json({ error: "Invalid command" });
    }
  });

  // Real File Management API
  app.get("/api/files/read", async (req, res) => {
      const { filepath } = req.query;
      if(!filepath) return res.status(400).json({ error: "Missing filepath" });
      const fullPath = connectionMode === 'remote' ? `${muServerPath}\\${filepath}` : path.join(muServerPath, filepath as string);
      
      try {
          if (connectionMode === 'remote') {
              const content = await sftpOperation('read', fullPath as string);
              return res.json({ content });
          } else {
              if(!fs.existsSync(fullPath)) {
                  let content = "";
                  if (String(filepath).includes("Shop")) content = "14 \t 9 \t 0 \t 0 \t 0 \t 0 \t 0 // Apple\n";
                  if (String(filepath).includes("MonsterSetBase")) content = "0\n// Map\tRadius\tX\tY\tDir\n0\t5\t135\t120\t-1\nend\n";
                  return res.json({ content });
              }
              const content = fs.readFileSync(fullPath, 'utf8');
              res.json({ content });
          }
      } catch (err: any) {
          res.status(500).json({ error: err.message });
      }
  });

  app.post("/api/files/write", async (req, res) => {
      const { filepath, content } = req.body;
      if(!filepath || typeof content !== 'string') return res.status(400).json({ error: "Invalid params" });
      
      const fullPath = connectionMode === 'remote' ? `${muServerPath}\\${filepath}` : path.join(muServerPath, filepath as string);
      try {
          if (connectionMode === 'remote') {
               await sftpOperation('write', fullPath, content);
               res.json({ success: true });
          } else {
               fs.mkdirSync(path.dirname(fullPath), { recursive: true });
               fs.writeFileSync(fullPath, content, 'utf8');
               res.json({ success: true });
          }
      } catch(err: any) {
           res.status(500).json({ error: err.message });
      }
  });

  // Real Logs API
  app.get("/api/logs", (req, res) => {
    // Para simplificar, lemos logs reais de uma pasta conhecida se existir, senao mock
    const logPath = path.join(muServerPath, "GameServer", "LOG");
    if(fs.existsSync(logPath)) {
        const files = fs.readdirSync(logPath).filter(f => f.endsWith('.txt'));
        if (files.length > 0) {
            files.sort((a,b) => fs.statSync(path.join(logPath, b)).mtimeMs - fs.statSync(path.join(logPath, a)).mtimeMs);
            const latestLog = path.join(logPath, files[0]);
            try {
               const content = fs.readFileSync(latestLog, 'utf8');
               const lines = content.split('\n').filter(Boolean).slice(-20);
               return res.json({ logs: lines });
            } catch(e) { /* ignore */ }
        }
    }
    res.json({ 
       logs: [
          "[GameServer] Start up initializing....",
          `[System] MuServerPath: ${muServerPath}`,
          "[Info] WSL / Windows System ready."
       ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
