const { createAndSendNotification } = require('../src/services/notificationService');
const Notification = require('../src/models/Notification');
const socketService = require('../src/services/socketService');

jest.mock('../src/models/Notification');
jest.mock('../src/services/socketService');

describe('Notification Service - createAndSendNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return null if recipientId is not provided', async () => {
    const result = await createAndSendNotification(null, 'Test Title', 'Test Body', 'chat');
    expect(result).toBeNull();
    expect(Notification).not.toHaveBeenCalled();
  });

  test('should save notification and return it', async () => {
    const mockNotificationInstance = {
      save: jest.fn().mockResolvedValue(true),
      recipient: 'user-123',
      title: 'New Message',
      body: 'Hello',
      type: 'chat',
      data: {}
    };

    Notification.mockImplementation(() => mockNotificationInstance);
    socketService.getIO.mockReturnValue(null); // Offline test

    const result = await createAndSendNotification('user-123', 'New Message', 'Hello', 'chat');

    expect(Notification).toHaveBeenCalledWith({
      recipient: 'user-123',
      title: 'New Message',
      body: 'Hello',
      type: 'chat',
      data: {}
    });
    expect(mockNotificationInstance.save).toHaveBeenCalled();
    expect(result).toBe(mockNotificationInstance);
  });

  test('should emit event via socket if recipient is online', async () => {
    const mockNotificationInstance = {
      save: jest.fn().mockResolvedValue(true),
      recipient: 'user-123',
      title: 'New Message',
      body: 'Hello',
      type: 'chat',
      data: {}
    };

    Notification.mockImplementation(() => mockNotificationInstance);

    const mockIo = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    };
    socketService.getIO.mockReturnValue(mockIo);
    
    // Set connectedUsers mock Behavior
    socketService.connectedUsers = {
      get: jest.fn().mockReturnValue('socket-id-456')
    };

    const result = await createAndSendNotification('user-123', 'New Message', 'Hello', 'chat');

    expect(socketService.getIO).toHaveBeenCalled();
    expect(socketService.connectedUsers.get).toHaveBeenCalledWith('user-123');
    expect(mockIo.to).toHaveBeenCalledWith('socket-id-456');
    expect(mockIo.emit).toHaveBeenCalledWith('newNotification', mockNotificationInstance);
    expect(result).toBe(mockNotificationInstance);
  });
});
