import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const repositoryRoot = resolve(import.meta.dirname, '..');
const backendRoot = resolve(repositoryRoot, 'apps', 'backend');
const virtualEnvironmentPython = resolve(
  backendRoot,
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
);
const python =
  process.env.PYTHON ??
  (existsSync(virtualEnvironmentPython)
    ? virtualEnvironmentPython
    : process.platform === 'win32'
      ? 'python'
      : 'python3');

const child = spawn(python, process.argv.slice(2), {
  cwd: backendRoot,
  env: process.env,
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error(`Unable to start Python: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
