// ==========================================
// STATE & USER DIRECTORY
// ==========================================
let io = null;
const connectedUsers = new Map(); // userId string -> socketId string

// ==========================================
// SERVICE INITIALIZATION & EXPORTS
// ==========================================
module.exports = {
  init: (socketIoInstance) => {
    io = socketIoInstance;
    return io;
  },
  getIO: () => {
    return io;
  },
  connectedUsers
};
