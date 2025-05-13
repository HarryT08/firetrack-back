import { supabase } from "./supabaseClient.js";
import { enviarCorreoBoletin } from "./correo.js";

export const guardarSuscriptor = async (email) => {
  const existe = await pool.query(
    "SELECT * FROM suscriptores WHERE email = $1",
    [email]
  );
  if (existe.rows.length > 0) return false;
  await pool.query("INSERT INTO suscriptores (email) VALUES ($1)", [email]);
  return true;
};

export const enviarBoletin = async () => {
  const { data: correos, error } = await supabase
    .from("suscriptores")
    .select("*");

  if (error) {
    throw new Error("Error al obtener suscriptores: " + error.message);
  }

  if (!correos || correos.length === 0) {
    console.log("No hay suscriptores para enviar el boletín.");
    return;
  }

  const destinatarios = correos.map((r) => r.email);

  const html = `
    <h2>🔥 Nuevos puntos de calor detectados</h2>
    <p>Consulta el mapa en tiempo real para ver los incendios forestales activos en Colombia.</p>
    <a href="https://firetrack-seven.vercel.app/alertas" target="_blank">Ver mapa</a>
  `;

  await enviarCorreoBoletin(destinatarios, html);
};

export const registrarVisita = async () => {
  await pool.query("INSERT INTO visitas (momento) VALUES (NOW())");
};

export const contarVisitas = async () => {
  const res = await pool.query("SELECT COUNT(*) FROM visitas");
  return parseInt(res.rows[0].count);
};
