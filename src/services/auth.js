import { auth } from "../services/firebase";


export const requireAuth = async (req, res, next)=>{

  if (req.headers.authorization) {
    const authparts = req.headers.authorization.split(' ');
    if (authparts.length<2) {
      return res.status(400).send('Invalid Authorization header.');
    }

    if (authparts[0]!=='Bearer') {
      return res.status(400).send('Requires Bearer token');
    }

    try {
      const decodedToken = await auth().verifyIdToken(authparts[1]);
      req.token = decodedToken;
      req.uid = decodedToken.uid;
      req.auser = await auth().getUser(req.uid); 
      next();
    } catch(e) {
      res.status(403).send('Unauthorized.')
    }
  } else {
    res.status(403).send('Unauthorized.')
  }
}