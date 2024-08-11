import { Router } from 'express';
import redirect from './redirect/Redirect';

const oauth = Router();

oauth.use('/redirect', redirect);

export default oauth;
