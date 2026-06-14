let io = null;
const connectedUsers = new Map(); // userId string -> socketId string

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
