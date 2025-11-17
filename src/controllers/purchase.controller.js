// src/controllers/purchase.controller.js
export default class PurchaseController {
    constructor(purchaseService) {
        this.purchaseService = purchaseService;
    }

    // POST /api/carts/:cid/checkout  (o /purchase — elige tu preferida)
    finalizePurchase = async (req, res, next) => {
  try {
    console.log('>>> purchase.controller: request received', { params: req.params, user: req.user ? req.user._id : (req.session && req.session.user && req.session.user.id) });
    const { cid } = req.params;
    const userId = req.user ? req.user._id : (req.session && req.session.user && req.session.user.id);
    if (!userId) {
      console.log('>>> purchase.controller: no userId, abort');
      return res.status(401).json({ status: 'error', error: 'No autenticado' });
    }

    const result = await this.purchaseService.finalizeCartPurchase(userId, cid);
    console.log('>>> purchase.controller: purchase result', result && result.ticket ? { ticketId: result.ticket._id, code: result.ticket.code } : { result });

    return res.status(201).json({ status: 'success', ticket: result.ticket });
  } catch (err) {
    console.error('>>> purchase.controller: error', err);
    next(err);
  }
}

}
