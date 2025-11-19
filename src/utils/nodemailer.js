// src/utils/mailer.js
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// hmtl ticket
function buildTicketHtml(ticket, productsMap = {}, rejected = []) {
  const itemsHtml = (ticket.items || []).map(it => {
    const name = it.name || (productsMap[String(it.product)] && productsMap[String(it.product)].name) || String(it.product);
    return `
      <tr>
        <td style="padding:8px;border:1px solid #eaeaea">${name}</td>
        <td style="padding:8px;border:1px solid #eaeaea;text-align:center">${it.quantity}</td>
        <td style="padding:8px;border:1px solid #eaeaea;text-align:right">$${Number(it.unitPrice).toFixed(2)}</td>
        <td style="padding:8px;border:1px solid #eaeaea;text-align:right">$${(it.unitPrice * it.quantity).toFixed(2)}</td>
      </tr>`;
  }).join('');

  const rejectedHtml = (rejected && rejected.length) ? `
    <h4 style="color:#b45309">Productos no procesados</h4>
    <ul>
      ${rejected.map(r => `<li>${r.name || r.product} — Solicitado: ${r.requested}, Disponible: ${r.available}</li>`).join('')}
    </ul>` : '';

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111">
      <h2 style="color:#0d6efd">Gracias por tu compra</h2>
      <p>Tu ticket <strong>${ticket.code}</strong></p>

      <table style="border-collapse:collapse;width:100%;max-width:720px">
        <thead>
          <tr>
            <th style="padding:10px;border:1px solid #eaeaea;text-align:left">Producto</th>
            <th style="padding:10px;border:1px solid #eaeaea">Cant.</th>
            <th style="padding:10px;border:1px solid #eaeaea">Precio unit.</th>
            <th style="padding:10px;border:1px solid #eaeaea">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:10px;border:1px solid #eaeaea;text-align:right"><strong>Total</strong></td>
            <td style="padding:10px;border:1px solid #eaeaea;text-align:right"><strong>$${Number(ticket.amount || 0).toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>

      ${rejectedHtml}

      <p style="margin-top:18px;font-size:0.95rem;color:#666">Si tenés dudas, respondé este correo.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:12px 0" />
      <small style="color:#999">MiTienda • ${new Date(ticket.purchase_datetime || ticket.createdAt).toLocaleString()}</small>
    </div>
  `;
}

/**
 * sendPurchaseTicketEmail(toEmail, ticket, options)
 * options = { rejected: [], productsMap: { productId: {name} } }
 *
 * Usa el transporter Gmail exportado arriba.
 */
export async function sendPurchaseTicketEmail(toEmail, ticket, options = {}) {
  if (!toEmail) throw new Error('sendPurchaseTicketEmail: falta toEmail');
  if (!ticket) throw new Error('sendPurchaseTicketEmail: falta ticket');

  const { rejected = [], productsMap = {} } = options;

  try {
    try {
      await transporter.verify();
      console.log('Mailer: transporter.verify OK (Gmail).');
    } catch (verifyErr) {
      console.warn('Mailer: transporter.verify falló:', verifyErr && verifyErr.message);
    }

    const html = buildTicketHtml(ticket, productsMap, rejected);

    const mailOptions = {
      from: `"MiTienda" <${process.env.MAIL_USER}>`,
      to: toEmail,
      subject: `Tu compra - ${ticket.code}`,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('sendPurchaseTicketEmail: mail enviado, messageId=', info.messageId);
    return info;
  } catch (err) {
    console.error('sendPurchaseTicketEmail: error al enviar mail', err);
    throw err;
  }
}

export default sendPurchaseTicketEmail;
