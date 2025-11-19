import { sendPurchaseTicketEmail } from '../utils/nodemailer.js'; 

export default class PurchaseController {
    constructor(purchaseService) {
        this.purchaseService = purchaseService;
    }

    finalizePurchase = async (req, res, next) => {
        try {
            const userId = req.user?.id || req.session?.user?.id;
            if (!userId) {
                return res.status(401).json({
                    status: "error",
                    error: "No autenticado"
                });
            }
            const { cid } = req.params;
            const result = await this.purchaseService.finalizeCartPurchase(userId, cid);
            const { ticket, rejected } = result;

            if (!ticket) {
                return res.status(400).json({
                    status: "partial",
                    message: "No hubo stock suficiente para ningún producto.",
                    rejected
                });
            }

            const userEmail = req.user?.email || req.session?.user?.email;
            if (userEmail) {
                try {
                    await sendPurchaseTicketEmail(userEmail, ticket, rejected || []);
                    console.log('>>> purchase.controller: email enviado a', userEmail);
                } catch (mailErr) {
                    console.error('>>> purchase.controller: fallo al enviar email', mailErr);
                }
            } else {
                console.warn('>>> purchase.controller: no se encontró email de usuario para enviar ticket');
            }

            return res.status(201).json({
                status: rejected?.length > 0 ? "partial" : "success",
                ticket,
                rejected
            });

        } catch (err) {
            console.error(">>> purchase.controller: error", err);
            next(err);
        }
    };

}
