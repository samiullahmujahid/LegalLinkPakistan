const { protect } = require('../src/middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const Client = require('../src/models/Client');
const Lawyer = require('../src/models/Lawyer');
const Admin = require('../src/models/Admin');

jest.mock('jsonwebtoken');
jest.mock('../src/models/Client');
jest.mock('../src/models/Lawyer');
jest.mock('../src/models/Admin');

describe('Auth Middleware - protect', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('should return 401 if Authorization header is missing', async () => {
    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized, no token provided.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if Authorization header does not start with Bearer', async () => {
    req.headers.authorization = 'InvalidToken abc';
    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not authorized, no token provided.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if token has no ID payload', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ role: 'Client' }); // No id or _id

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid token payload.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if user does not exist in DB', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user-id', role: 'Client' });
    Client.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });
    Lawyer.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });
    Admin.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User not found in DB.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 403 if user is suspended and suspension has not expired', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user-id', role: 'Client' });
    
    const mockUser = {
      _id: 'user-id',
      isSuspended: true,
      suspendedUntil: new Date(Date.now() + 100000), // future date
      suspensionReason: 'Violation of terms',
      toObject: () => ({ _id: 'user-id', isSuspended: true, suspendedUntil: new Date(Date.now() + 100000), suspensionReason: 'Violation of terms' })
    };

    Client.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        isSuspended: true,
        message: expect.stringContaining('Your account has been suspended')
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('should call next() if token is valid and user is not suspended', async () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ id: 'user-id', role: 'Client' });

    const mockUser = {
      _id: 'user-id',
      isSuspended: false,
      toObject: () => ({ _id: 'user-id', isSuspended: false })
    };

    Client.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    await protect(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.role).toBe('Client');
    expect(next).toHaveBeenCalled();
  });
});
