//middleware that handles JWT (JSON Web Token) authentication
//to protect  routes

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  /* const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const bearerToken = token.split(' ')[1]; */
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token not given or uncorrectly' });
  }

  const token = authHeader.split(' ')[1];

  try {
    
    const decoded =jwt.verify(token, process.env.JWT_SECRET);
      //trazas
      //req.user = { _id: decoded.id, email: decoded.email };
      req.user = {
        id: decoded.id,
        email: decoded.email,
        companyId: decoded.companyId || null //por si no se necesita darle null
      };
      //console.log("Decoded token:", decoded);
      //console.log("User ID from token:", req.user.id); 
      next();
  } catch (err) {
    return res.status(403).json({ message: 'Unvlaid token' });
  }
};

module.exports = authenticate;
