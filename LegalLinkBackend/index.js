// ==========================================
// 1. IMPORTS & ENVIRONMENT CONFIG
// ==========================================
const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');

dotenv.config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const connectDB = require('./src/config/db');
const socketService = require('./src/services/socketService');
const { createAndSendNotification } = require('./src/services/notificationService');
const { protect } = require('./src/middlewares/authMiddleware');

// Route Imports
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes'); 
const notificationRoutes = require('./src/routes/notificationRoutes');

const Message = require('./src/models/Message');
const Booking = require('./src/models/Booking');
const User = require('./src/models/User');

// ==========================================
// 2. DATABASE CONNECTION & SERVER INIT
// ==========================================
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
socketService.init(io);

// ==========================================
// 3. MIDDLEWARES & STATIC SERVING
// ==========================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads/audio');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const chatUploadDir = path.join(__dirname, 'uploads/chat');
if (!fs.existsSync(chatUploadDir)) {
  fs.mkdirSync(chatUploadDir, { recursive: true });
}
const evidenceUploadDir = path.join(__dirname, 'uploads/evidence');
if (!fs.existsSync(evidenceUploadDir)) {
  fs.mkdirSync(evidenceUploadDir, { recursive: true });
}

// ==========================================
// 4. MULTER & FILE STORAGE CONFIG
// ==========================================
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const chatStorage = multer.diskStorage({
  destination: chatUploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const uploadChatFile = multer({ storage: chatStorage });

// ==========================================
// 5. REALTIME SOCKET.IO HANDLERS
// ==========================================
const { connectedUsers } = require('./src/services/socketService');

io.on('connection', (socket) => {
  socket.on('registerUser', (userId) => {
    if (userId) {
      connectedUsers.set(userId.toString(), socket.id);
      socket.userId = userId.toString();
      console.log(`[Socket] User ${userId} registered with socket ID ${socket.id}`);
    }
  });

  socket.on('joinRoom', (bookingId) => socket.join(bookingId));

  socket.on('sendMessage', async (data) => {
    try {
      const newMessage = new Message({
        bookingId: data.bookingId,
        sender: data.sender,
        text: data.text,
        type: data.type || 'text',
        fileName: data.fileName || null,
        replyTo: data.replyTo || null
      });
      await newMessage.save();
      io.to(data.bookingId).emit('receiveMessage', newMessage);

      // Trigger chat notification
      const booking = await Booking.findById(data.bookingId);
      if (booking) {
        if (booking.deletedBy && booking.deletedBy.length > 0) {
          booking.deletedBy = [];
          await booking.save();
        }
        const receiverId = booking.clientId.toString() === data.sender.toString()
          ? booking.lawyerId
          : booking.clientId;
        
        const senderUser = await User.findById(data.sender);
        const senderName = senderUser ? senderUser.name : "Legal Link Contact";
        
        let bodyText = data.text || "Sent an attachment 📎";
        if (data.type === 'voice') {
          bodyText = "Sent a voice note 🎙️";
        }

        await createAndSendNotification(
          receiverId,
          `New Message from ${senderName}`,
          bodyText,
          'chat',
          { bookingId: data.bookingId }
        );
      }
    } catch (error) { console.error("Socket Error:", error); }
  });

  socket.on('callUser', (data) => {
    const targetSocketId = connectedUsers.get(data.userToCall.toString());
    if (targetSocketId) {
      io.to(targetSocketId).emit('incomingCall', {
        signal: data.signalData,
        from: data.from,
        callerId: socket.userId,
        isVideo: data.isVideo,
        callerName: data.callerName,
        callerPic: data.callerPic,
        bookingId: data.bookingId
      });
    }
  });

  // Relay call accepted answers to original caller
  socket.on('acceptCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });

  // Relay ice connection candidates between peers
  socket.on('ice-candidate', (data) => {
    const targetSocketId = connectedUsers.get(data.to.toString());
    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', data.candidate);
    }
  });

  // Save WebRTC call ended logs dynamically as chat messages
  socket.on('callLog', async (data) => {
    try {
      const callMessage = new Message({
        bookingId: data.bookingId,
        sender: '000000000000000000000000', // System sender ID representation
        text: data.message || 'Call ended',
        type: 'call_log'
      });
      await callMessage.save();
      io.to(data.bookingId).emit('receiveMessage', callMessage);
    } catch (err) {
      console.error("Socket callLog error:", err);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`[Socket] User ${socket.userId} disconnected`);
    }
  });
});

// ==========================================
// 6. STRIPE PAYMENT INTENT ROUTE
// ==========================================
app.post('/api/bookings/payment/intent', async (req, res) => {
  try {
    const { amount, bookingId } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'pkr',
      metadata: { bookingId }
    });
    return res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) { return res.status(500).json({ success: false, message: "Payment setup failed" }); }
});

// ==========================================
// 7. CHAT MEDIA & AUDIO UPLOAD HANDLERS
// ==========================================
// Helper to save base64 chat attachments
const saveBase64ChatFile = (base64Str, filename, subfolder) => {
  try {
    if (!base64Str) return null;
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let base64Data = base64Str;
    if (matches && matches.length === 3) {
      base64Data = matches[2];
    }
    const buffer = Buffer.from(base64Data, 'base64');
    const uploadPath = path.join(__dirname, 'uploads', subfolder, filename);
    fs.writeFileSync(uploadPath, buffer);
    return `uploads/${subfolder}/${filename}`;
  } catch (e) {
    console.error("saveBase64ChatFile error:", e);
    return null;
  }
};

// Dynamic upload middleware wrappers to bypass Multer stream hijacking on JSON requests
const uploadAudioMiddleware = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return upload.any()(req, res, next);
  }
  next();
};

const uploadChatMiddleware = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return uploadChatFile.any()(req, res, next);
  }
  next();
};

// Dual-path support for voice note uploads (accepting 'file' or 'audio' field keys)
const handleAudioUpload = (req, res) => {
  if (req.body.fileBase64) {
    const filename = `voice-${Date.now()}.wav`;
    const savedPath = saveBase64ChatFile(req.body.fileBase64, filename, 'audio');
    if (savedPath) {
      const fileUrl = `${req.protocol}://${req.get('host')}/${savedPath}`;
      return res.status(200).json({ success: true, url: fileUrl, fileUrl: fileUrl });
    }
    return res.status(500).json({ success: false, message: 'Failed to write base64 audio' });
  }

  const file = req.file || (req.files && req.files[0]);
  if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/audio/${file.filename}`;
  res.status(200).json({ success: true, url: fileUrl, fileUrl: fileUrl });
};
app.post('/api/chat/upload-audio', uploadAudioMiddleware, handleAudioUpload);
app.post('/api/upload/audio', uploadAudioMiddleware, handleAudioUpload);

const handleChatFileUpload = (req, res) => {
  if (req.body.fileBase64) {
    const originalName = req.body.fileName || 'file.jpg';
    const filename = `${Date.now()}-${originalName}`;
    const savedPath = saveBase64ChatFile(req.body.fileBase64, filename, 'chat');
    if (savedPath) {
      const fileUrl = `${req.protocol}://${req.get('host')}/${savedPath}`;
      return res.status(200).json({ success: true, url: fileUrl, fileUrl: fileUrl });
    }
    return res.status(500).json({ success: false, message: 'Failed to write base64 file' });
  }

  const file = req.file || (req.files && req.files[0]);
  if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/chat/${file.filename}`;
  res.status(200).json({ success: true, url: fileUrl, fileUrl: fileUrl });
};
app.post('/api/chat/upload-file', uploadChatMiddleware, handleChatFileUpload);

// ==========================================
// 8. ROUTE MODULE REGISTRATION
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/complaints', complaintRoutes); 
app.use('/api/notifications', notificationRoutes);

// ==========================================
// 9. CHAT & MESSAGE MANAGEMENT ENDPOINTS
// ==========================================
app.get('/api/chat/:bookingId', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const messages = await Message.find({ 
      bookingId: req.params.bookingId,
      deletedBy: { $ne: userId }
    }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, messages });
  } catch (err) { res.status(500).json({ success: false, message: "Error fetching history" }); }
});

app.get('/api/chat/list/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const chats = await Booking.find({
      $or: [{ clientId: userId }, { lawyerId: userId }],
      status: 'confirmed',
      deletedBy: { $ne: userId }
    }).populate('lawyerId', 'name profilePic profilePicUri').populate('clientId', 'name profilePic profilePicUri');

    const chatsWithLastMessage = await Promise.all(chats.map(async (chat) => {
      // Find the last message that is NOT deleted for this user
      const lastMsg = await Message.findOne({ 
        bookingId: chat._id,
        deletedBy: { $ne: userId }
      }).sort({ createdAt: -1 }).lean();

      let chatObj = chat.toObject ? chat.toObject() : chat;
      if (!chatObj.clientId) {
        const rawBooking = await Booking.findById(chat._id).select('clientId');
        if (rawBooking && rawBooking.clientId) {
          const LawyerModel = require('./src/models/Lawyer');
          const lawyerClient = await LawyerModel.findById(rawBooking.clientId).select('name profilePic profilePicUri');
          if (lawyerClient) {
            chatObj.clientId = {
              _id: lawyerClient._id,
              name: lawyerClient.name,
              profilePic: lawyerClient.profilePic,
              profilePicUri: lawyerClient.profilePicUri
            };
          }
        }
      }

      return {
        ...chatObj,
        lastMessage: lastMsg || null
      };
    }));

    res.status(200).json({ success: true, chats: chatsWithLastMessage });
  } catch (err) { 
    console.error("Fetch Chat List Error:", err);
    res.status(500).json({ success: false, message: "Error fetching chat list" }); 
  }
});

app.delete('/api/chat/message/:messageId', protect, async (req, res) => {
  try {
    const { deleteType } = req.body; // 'me' or 'everyone'
    const userId = req.user._id || req.user.id;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (deleteType === 'everyone') {
      if (message.sender.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized to delete for everyone" });
      }
      message.text = "This message was deleted";
      message.type = "deleted";
      await message.save();

      io.to(message.bookingId.toString()).emit('messageDeleted', {
        messageId: message._id,
        text: message.text,
        type: message.type
      });
    } else {
      if (!message.deletedBy.includes(userId)) {
        message.deletedBy.push(userId);
        await message.save();
      }
    }

    return res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete Message Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/chat/chat/:bookingId', protect, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    if (!booking.deletedBy.includes(userId)) {
      booking.deletedBy.push(userId);
      await booking.save();
    }

    await Message.updateMany(
      { bookingId, deletedBy: { $ne: userId } },
      { $addToSet: { deletedBy: userId } }
    );

    return res.status(200).json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Delete Chat Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 10. BACKGROUND JOBS & HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Background job to clean up expired bookings (payment deadline passed)
setInterval(async () => {
  try {
    const expiredBookings = await Booking.find({
      status: 'accepted',
      paymentDeadline: { $ne: null, $lt: new Date() }
    }).populate('lawyerId', 'name').populate('clientId', 'name');

    if (expiredBookings.length > 0) {
      for (const booking of expiredBookings) {
        booking.status = 'rejected';
        await booking.save();
        
        const lawyerName = booking.lawyerId?.name || "Legal Consultant";
        const clientName = booking.clientId?.name || "Client";

        // Notify Client
        await createAndSendNotification(
          booking.clientId._id || booking.clientId,
          "Booking Cancelled",
          `Your appointment request with ${lawyerName} was cancelled due to payment expiry.`,
          "booking",
          { bookingId: booking._id }
        );

        // Notify Lawyer
        await createAndSendNotification(
          booking.lawyerId._id || booking.lawyerId,
          "Booking Cancelled",
          `The appointment request from ${clientName} has been cancelled because the payment was not made in time.`,
          "booking",
          { bookingId: booking._id }
        );
      }
      console.log(`[Expiry Job] Automatically cancelled ${expiredBookings.length} unpaid bookings.`);
    }
  } catch (error) {
    console.error("[Expiry Job] Error checking expired bookings:", error);
  }
}, 30000); 

// ==========================================
// 11. GLOBAL ERROR HANDLER & SERVER LISTEN
// ==========================================
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
});