import jwt from 'jsonwebtoken'
// Middleware
function authMiddleware(req, res, next) {
    // Get token from headers or query string
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    try {
      // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded.id;
        req.token = token
        next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
}

export default authMiddleware