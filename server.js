import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./supabaseClient.js";
import cron from "node-cron";
import { enviarBoletin } from "./boletin.js";
import { enviarCorreoConfirmacion } from "./correo.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Guardar correo
app.post("/api/suscripcion", async (req, res) => {
  const { email } = req.body;
  const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!valido) return res.status(400).json({ message: "Correo inválido." });

  const { data, error } = await supabase
    .from("suscriptores")
    .insert([{ email }]);

  if (error) {
    if (error.code === "23505") {
      res.json({ message: "Ya estás suscrito ✅" });
    } else {
      console.error("Error al insertar:", error);
      res.status(500).json({ message: "Error al suscribir." });
    }
  } else {
    try {
      await enviarCorreoConfirmacion(email);
      res.json({ message: "¡Suscripción exitosa! Te enviamos un correo 📬" });
    } catch (e) {
      console.error("Error al enviar confirmación:", e);
      res.json({ message: "¡Suscripción exitosa! Pero no pudimos enviarte el correo." });
    }
  }
});

// Registrar visita
app.post("/api/visita", async (req, res) => {
  const { error } = await supabase.from("visitas").insert({});
  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al registrar visita." });
  }
  res.json({ message: "Visita registrada." });
});

// Obtener total de visitas
app.get("/api/visitas", async (req, res) => {
  const { count, error } = await supabase
    .from("visitas")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al contar visitas." });
  }

  res.json({ total: count });
});

app.post("/api/enviar-boletin", async (req, res) => {
  try {
    await enviarBoletin();
    res.json({ message: "Boletín enviado con éxito." });
  } catch (err) {
    console.error("Error al enviar boletín:", err);
    res.status(500).json({ message: "Error al enviar el boletín." });
  }
});

cron.schedule("0 8 * * *", async () => {
  console.log("⏰ Ejecutando envío automático de boletín...");
  try {
    await enviarBoletin();
    console.log("✅ Boletín enviado automáticamente.");
  } catch (err) {
    console.error("❌ Error en cron de boletín:", err);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
});