import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const enviarCorreoBoletin = async (destinatarios, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Alerta de Incendios" <${process.env.EMAIL_FROM}>`,
    to: destinatarios.join(","),
    subject: "🔥 Nuevos puntos de calor detectados",
    html,
  });
};

export const enviarCorreoConfirmacion = async (destinatario) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"FireTrack Alertas" <${process.env.EMAIL_FROM}>`,
    to: destinatario,
    subject: "🔥 Confirmación de suscripción a FireTrack",
    html: `
      <h2>¡Gracias por suscribirte a FireTrack!</h2>
      <p>Recibirás alertas sobre incendios forestales detectados en Colombia.</p>
      <p>Puedes ver el mapa en tiempo real aquí:</p>
      <a href="https://firetrack-seven.vercel.app/alertas" target="_blank">Mapa de Alertas</a>
      <br/><br/>
      <p>🚨 Por favor, no respondas a este mensaje. Si recibiste este correo por error, ignóralo.</p>
    `,
  });
};