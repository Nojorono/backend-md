const io = require('socket.io-client');

let socket;

beforeEach((done) => {
  socket = io.connect('http://localhost:9001', {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket'],
  });
  socket.on('connect', () => {
    done();
  });
});

afterEach((done) => {
  if (socket.connected) {
    socket.disconnect();
  }
  done();
});

test('should communicate', (done) => {
  socket.emit('hello', 'world');
  socket.on('echo', (message) => {
    expect(message).toBe('world');
    done();
  });
});