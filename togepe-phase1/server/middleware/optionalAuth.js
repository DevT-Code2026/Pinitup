import jwt from "jsonwebtoken";

// Like `protect`, but does NOT reject unauthenticated requests.
// If a valid Bearer token is present, decodes it and attaches
// req.user = { id, role, name, email }.
// If no token or an invalid token, the request passes through
// with req.user left undefined — the downstream handler can
// check req.user?.id to differentiate guests from logged-in users.
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch {
    // Token invalid or expired — just continue as guest.
  }

  next();
};

export default optionalAuth;

