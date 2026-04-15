const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting PharmCare Development Suite...');

// 1. Start Backend
const backend = spawn('node', ['server.js'], { 
  stdio: 'inherit', 
  shell: true 
});

// 2. Start Frontend
const frontend = spawn('npm.cmd', ['run', 'dev'], { 
  cwd: path.join(__dirname, 'pharmcare-app'),
  stdio: 'inherit', 
  shell: true 
});

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

frontend.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
  process.exit(code);
});
