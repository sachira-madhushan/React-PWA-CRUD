let socket;

export function connectToHost(hostIP) {
  socket = new WebSocket(`ws://${hostIP}:3001`);

  socket.onopen = () => {
    console.log('[CLIENT] Connected to host');
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log('[CLIENT] Received:', msg);
  };

  socket.onerror = (error) => {
    console.error('[CLIENT] WebSocket Error:', error);
  };

  socket.onclose = () => {
    console.log('[CLIENT] Disconnected');
  };
}

export function sendMessageToHost(message) {
  socket.send(JSON.stringify(message));
}
