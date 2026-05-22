import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prefix = process.env.NEXT_PUBLIC_STACK_PORT_PREFIX || '81';
const projectName = `stack-dependencies-${prefix}`;
const composeFile = path.resolve(__dirname, '../docker/dependencies/docker.compose.yaml');

const args = [
  'compose',
  '-p', projectName,
  '-f', composeFile,
  ...process.argv.slice(2)
];

console.log(`Running: docker ${args.join(' ')}`);

const child = spawn('docker', args, {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
