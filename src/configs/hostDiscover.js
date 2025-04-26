const dgram = require('dgram');
const os = require('os');

const udpSocket = dgram.createSocket('udp4');

const PORT = 4000;
const BROADCAST_INTERVAL = 2000;

function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  for (const iface of Object.values(networkInterfaces)) {
    for (const network of iface) {
      if (network.family === 'IPv4' && !network.internal) {
        return network.address;
      }
    }
  }
  return '127.0.0.1';
}

function startBroadcasting() {
  const localIP = getLocalIP();
  const message = Buffer.from('I_AM_HOST:' + localIP);

  setInterval(() => {
    udpSocket.send(message, 0, message.length, PORT, '255.255.255.255', (err) => {
      if (err) {
        console.error("Error in UDP broadcast:", err);
      }
    });
  }, BROADCAST_INTERVAL);

  console.log(`Host is broadcasting on ${localIP}`);
}

startBroadcasting();
