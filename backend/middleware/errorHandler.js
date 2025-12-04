// Standard error response format
export class ApiError extends Error {
  constructor(statusCode, message, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error codes
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  
  // Resources
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Business Logic
  ROOM_NOT_AVAILABLE: 'ROOM_NOT_AVAILABLE',
  RESERVATION_CONFLICT: 'RESERVATION_CONFLICT',
  CAPACITY_EXCEEDED: 'CAPACITY_EXCEEDED',
  INVALID_DATE: 'INVALID_DATE',
  
  // System
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

// Pre-defined error factories
export const createError = {
  // Authentication errors
  unauthorized: (message = 'Access token required', details = null) => 
    new ApiError(401, message, ERROR_CODES.UNAUTHORIZED, details),
  
  forbidden: (message = 'Insufficient permissions', details = null) => 
    new ApiError(403, message, ERROR_CODES.FORBIDDEN, details),
  
  invalidCredentials: (message = 'Invalid username or password', details = null) => 
    new ApiError(401, message, ERROR_CODES.INVALID_CREDENTIALS, details),
  
  tokenExpired: (message = 'Token expired', details = null) => 
    new ApiError(401, message, ERROR_CODES.TOKEN_EXPIRED, details),
  
  invalidToken: (message = 'Invalid token', details = null) => 
    new ApiError(401, message, ERROR_CODES.INVALID_TOKEN, details),
  
  // Validation errors
  validation: (message, details = null) => 
    new ApiError(400, message, ERROR_CODES.VALIDATION_ERROR, details),
  
  requiredField: (fieldName) => 
    new ApiError(400, `${fieldName} is required`, ERROR_CODES.REQUIRED_FIELD_MISSING, { field: fieldName }),
  
  invalidFormat: (fieldName, expectedFormat = null) => 
    new ApiError(400, `Invalid format for ${fieldName}`, ERROR_CODES.INVALID_FORMAT, { 
      field: fieldName, 
      expectedFormat 
    }),
  
  invalidDateRange: (message = 'Invalid date range', details = null) => 
    new ApiError(400, message, ERROR_CODES.INVALID_DATE_RANGE, details),
  
  // Resource errors
  notFound: (resource = 'Resource', id = null) => 
    new ApiError(404, `${resource} not found`, ERROR_CODES.RESOURCE_NOT_FOUND, { resource, id }),
  
  alreadyExists: (resource = 'Resource', details = null) => 
    new ApiError(409, `${resource} already exists`, ERROR_CODES.RESOURCE_ALREADY_EXISTS, { resource, ...details }),
  
  conflict: (message, details = null) => 
    new ApiError(409, message, ERROR_CODES.RESOURCE_CONFLICT, details),
  
  // Hotel-specific errors
  roomNotAvailable: (roomNumber, dates = null) => 
    new ApiError(409, `Room ${roomNumber} is not available`, ERROR_CODES.ROOM_NOT_AVAILABLE, { 
      roomNumber, 
      dates 
    }),
  
  reservationConflict: (roomNumber, conflictDates = null) => 
    new ApiError(409, `Room ${roomNumber} is already booked for the selected dates`, ERROR_CODES.RESERVATION_CONFLICT, { 
      roomNumber, 
      conflictDates 
    }),
  
  capacityExceeded: (roomNumber, maxCapacity, requestedGuests) => 
    new ApiError(400, `Room ${roomNumber} can accommodate maximum ${maxCapacity} guests. You selected ${requestedGuests} guests.`, ERROR_CODES.CAPACITY_EXCEEDED, { 
      roomNumber, 
      maxCapacity, 
      requestedGuests 
    }),
  
  invalidDate: (message = 'Invalid date', details = null) => 
    new ApiError(400, message, ERROR_CODES.INVALID_DATE, details),
  
  // System errors
  database: (message = 'Database operation failed', details = null) => 
    new ApiError(500, message, ERROR_CODES.DATABASE_ERROR, details),
  
  internal: (message = 'Internal server error', details = null) => 
    new ApiError(500, message, ERROR_CODES.INTERNAL_ERROR, details),
  
  serviceUnavailable: (message = 'Service temporarily unavailable', details = null) => 
    new ApiError(503, message, ERROR_CODES.SERVICE_UNAVAILABLE, details),
  
  rateLimitExceeded: (message = 'Rate limit exceeded', retryAfter = null) => 
    new ApiError(429, message, ERROR_CODES.RATE_LIMIT_EXCEEDED, { retryAfter })
};

// Standard success response format
export const createSuccessResponse = (data = null, message = 'Success', metadata = {}) => ({
  success: true,
  message,
  data,
  metadata: {
    timestamp: new Date().toISOString(),
    ...metadata
  }
});

// Standard error response format
export const createErrorResponse = (error, includeStack = false) => {
  const response = {
    success: false,
    error: {
      message: error.message || 'An error occurred',
      code: error.code || ERROR_CODES.INTERNAL_ERROR,
      statusCode: error.statusCode || 500
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: null // Can be set by request middleware
    }
  };

  // Add details if available
  if (error.details) {
    response.error.details = error.details;
  }

  // Add stack trace in development
  if (includeStack && error.stack) {
    response.error.stack = error.stack;
  }

  return response;
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  // Default to 500 server error
  let statusCode = 500;
  let errorResponse;

  // Handle known API errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorResponse = createErrorResponse(err, process.env.NODE_ENV === 'development');
  }
  // Handle Sequelize validation errors
  else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    const details = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    
    const validationError = createError.validation('Validation failed', details);
    errorResponse = createErrorResponse(validationError, false);
  }
  // Handle Sequelize unique constraint errors
  else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    const field = err.errors[0]?.path || 'unknown';
    const conflictError = createError.alreadyExists('Resource', { field });
    errorResponse = createErrorResponse(conflictError, false);
  }
  // Handle Sequelize foreign key constraint errors
  else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    const foreignKeyError = createError.validation('Invalid reference', {
      field: err.fields,
      table: err.table
    });
    errorResponse = createErrorResponse(foreignKeyError, false);
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse = createErrorResponse(createError.invalidToken(), false);
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorResponse = createErrorResponse(createError.tokenExpired(), false);
  }
  // Handle CORS errors
  else if (err.message && err.message.includes('CORS')) {
    statusCode = 403;
    const corsError = createError.forbidden('CORS policy violation');
    errorResponse = createErrorResponse(corsError, false);
  }
  // Handle syntax errors (malformed JSON)
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    const syntaxError = createError.validation('Malformed JSON in request body');
    errorResponse = createErrorResponse(syntaxError, false);
  }
  // Handle generic errors
  else {
    const genericError = createError.internal(
      process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    );
    errorResponse = createErrorResponse(genericError, process.env.NODE_ENV === 'development');
  }

  // Set request ID if available
  if (req.id) {
    errorResponse.metadata.requestId = req.id;
  }

  // Log error (in production, you might want to use a proper logging service)
  console.error('API Error:', {
    path: req.path,
    method: req.method,
    statusCode,
    error: err.message,
    stack: err.stack,
    requestId: req.id,
    timestamp: new Date().toISOString()
  });

  res.status(statusCode).json(errorResponse);
};

// Async wrapper to catch promises
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found middleware (should be used before error handler)
export const notFoundHandler = (req, res, next) => {
  const error = createError.notFound(`Route ${req.originalUrl}`, { 
    method: req.method,
    path: req.originalUrl 
  });
  next(error);
};

// Request ID middleware (optional, for tracking)
export const requestIdMiddleware = (req, res, next) => {
  req.id = req.headers['x-request-id'] || 
           `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Validation helper functions
export const validateRequired = (fields, data) => {
  const missing = fields.filter(field => 
    data[field] === undefined || 
    data[field] === null || 
    (typeof data[field] === 'string' && data[field].trim() === '')
  );
  
  if (missing.length > 0) {
    throw createError.validation(
      `Required fields are missing: ${missing.join(', ')}`,
      { missingFields: missing }
    );
  }
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError.invalidFormat('email', 'valid email address');
  }
};

export const validateDate = (dateString, fieldName = 'date') => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw createError.invalidFormat(fieldName, 'YYYY-MM-DD');
  }
  return date;
};

export const validateDateRange = (startDate, endDate, fieldNames = ['startDate', 'endDate']) => {
  const start = validateDate(startDate, fieldNames[0]);
  const end = validateDate(endDate, fieldNames[1]);
  
  if (end <= start) {
    throw createError.invalidDateRange(`${fieldNames[1]} must be after ${fieldNames[0]}`);
  }
  
  return { start, end };
};