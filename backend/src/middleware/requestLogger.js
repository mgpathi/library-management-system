/**
 * Request Logger Middleware
 * Logs incoming requests and outgoing responses
 */

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  console.log(`
    ┌─ ${req.method} ${req.originalUrl}
    ├─ Time: ${new Date().toISOString()}
    ├─ IP: ${req.ip}
    └─ User-Agent: ${req.get('user-agent')}
  `);

  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    console.log(`
    ┌─ Response: ${res.statusCode}
    ├─ Duration: ${duration}ms
    └─ ${res.statusCode >= 400 ? '✗ Error' : '✓ Success'}
    `);
    res.send = originalSend;
    return res.send(data);
  };

  next();
};

export default requestLogger;
