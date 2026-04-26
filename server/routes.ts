import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";

type RateState = { count: number; resetAt: number };
const CONTACT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const CONTACT_RATE_LIMIT_MAX = 5; // per IP per window
const rateByIp = new Map<string, RateState>();

function getClientIp(req: any): string {
  const xfwd = req.headers?.["x-forwarded-for"];
  if (typeof xfwd === "string" && xfwd.length > 0) return xfwd.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cur = rateByIp.get(ip);
  if (!cur || cur.resetAt <= now) {
    rateByIp.set(ip, { count: 1, resetAt: now + CONTACT_RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (cur.count >= CONTACT_RATE_LIMIT_MAX) return true;
  cur.count += 1;
  return false;
}

function getMailer() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM;
  const to = process.env.MAIL_TO;

  if (!host || !port || !user || !pass || !from || !to) return null;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return { transporter, from, to };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const ip = getClientIp(req);
      if (isRateLimited(ip)) {
        return res.status(429).json({
          success: false,
          message: "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.",
        });
      }

      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);

      const mailer = getMailer();
      if (mailer) {
        const safeSubject = validatedData.subject?.slice(0, 140) ?? "Yeni İletişim Mesajı";
        const text = [
          `Ad: ${validatedData.name}`,
          `Email: ${validatedData.email}`,
          `Konu: ${validatedData.subject}`,
          "",
          validatedData.message,
        ].join("\n");

        // Fire-and-forget, but await to surface errors in dev logs.
        await mailer.transporter.sendMail({
          from: mailer.from,
          to: mailer.to,
          replyTo: validatedData.email,
          subject: `Portfolio İletişim: ${safeSubject}`,
          text,
        });
      }
      
      res.json({ 
        success: true, 
        message: "Mesajınız başarıyla gönderildi!",
        id: message.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Geçersiz form verileri", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "İç sunucu hatası",
          error: (error as any)?.message 
        });
      }
    }
  });

  // GitHub API proxy to avoid CORS issues
  app.get("/api/github/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const response = await fetch(`https://api.github.com/users/${username}`);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "GitHub verilerini alırken hata oluştu" 
      });
    }
  });

  app.get("/api/github/:username/repos", async (req, res) => {
    try {
      const { username } = req.params;
      const { sort = "updated", per_page = "100" } = req.query;
      
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=${sort}&per_page=${per_page}`
      );
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "GitHub repo verilerini alırken hata oluştu" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
