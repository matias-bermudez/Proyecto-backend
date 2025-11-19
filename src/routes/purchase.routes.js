import { Router } from 'express';
import passport from 'passport';
import { requireAuth } from '../utils/middlewares/auth.js';
import { purchaseController } from '../controllers/index.js';

const router = Router();

router.post('/:cid/checkout', passport.authenticate('jwt', { session: false }), purchaseController.finalizePurchase);

export default router;
