// ==========================================
// SOCKET CALL FLOW AUTOMATED TEST SCRIPT
// ==========================================
const { io } = require('../LegalLinkPakistan/node_modules/socket.io-client');

const BACKEND_URL = 'http://localhost:5000';

const clientA = io(BACKEND_URL, { transports: ['websocket'] });
const clientB = io(BACKEND_URL, { transports: ['websocket'] });

const userAId = '65f000000000000000000001';
const userBId = '65f000000000000000000002';

console.log('🔄 Connecting Socket Client A (Caller) & Socket Client B (Receiver)...');

let connectedCount = 0;

function checkReadyAndRunTest() {
  connectedCount++;
  if (connectedCount === 2) {
    console.log('🟢 Both sockets connected! Registering user IDs...');
    
    clientA.emit('registerUser', userAId);
    clientB.emit('registerUser', userBId);

    setTimeout(() => {
      console.log('📡 User A emitting callUser event to User B...');
      clientA.emit('callUser', {
        userToCall: userBId,
        signalData: { type: 'offer', sdp: 'test_sdp_payload' },
        from: clientA.id,
        isVideo: true,
        callerName: 'Adv. Test Partner',
        callerPic: '/uploads/profile/test.jpg',
        bookingId: '65f000000000000000000003'
      });
    }, 500);
  }
}

clientA.on('connect', () => {
  console.log('✅ Client A connected (Socket ID:', clientA.id, ')');
  checkReadyAndRunTest();
});

clientB.on('connect', () => {
  console.log('✅ Client B connected (Socket ID:', clientB.id, ')');
  checkReadyAndRunTest();
});

clientB.on('incomingCall', (data) => {
  console.log('🎉 SUCCESS! Client B received incomingCall socket event:');
  console.log(JSON.stringify(data, null, 2));
  
  console.log('📡 Testing acceptCall relay back to Client A...');
  clientB.emit('acceptCall', {
    to: data.from,
    signal: { type: 'answer', sdp: 'test_answer_sdp' }
  });
});

clientA.on('callAccepted', (signal) => {
  console.log('🎉 SUCCESS! Client A received callAccepted signal:', signal);
  console.log('🏆 CALL SOCKET FLOW TEST PASSED 100% PERFECTLY!');
  
  clientA.disconnect();
  clientB.disconnect();
  process.exit(0);
});

setTimeout(() => {
  console.error('❌ Timeout: Incoming call event not received within 10s.');
  process.exit(1);
}, 10000);
