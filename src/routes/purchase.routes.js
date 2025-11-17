import { Router } from 'express';
import passport from 'passport';
import { authorize } from '../middlewares/authorize.js';
import { purchaseController } from '../controllers/index.js';

const router = Router();

// Solo usuarios autenticados (role 'user' normalmente)
router.post('/:cid/checkout', passport.authenticate('jwt', { session: false }), authorize('user'), purchaseController.finalizePurchase);

export default router;
