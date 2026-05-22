import net from 'net';

const prefix = process.env.NEXT_PUBLIC_STACK_PORT_PREFIX || '81';
const ports = process.argv.slice(2).map(p => {
  // Replace the bash-style default with the actual prefix
  return p.replace(/\$\{NEXT_PUBLIC_STACK_PORT_PREFIX:-81\}/g, prefix);
});

async function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(1000);
    socket.on('error', onError);
    socket.on('timeout', onError);
    socket.connect(parseInt(port), 'localhost', () => {
      socket.destroy();
      resolve(true);
    });
  });
}

async function waitUntilReady() {
  console.log(`Waiting for ports to be ready: ${ports.join(', ')}`);
  for (const port of ports) {
    let ready = false;
    while (!ready) {
      ready = await isPortOpen(port);
      if (!ready) {
        process.stdout.write('.');
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    console.log(`\nPort ${port} is ready!`);
  }
}

waitUntilReady().catch(console.error);
