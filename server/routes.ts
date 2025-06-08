import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      
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
          message: "İç sunucu hatası" 
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
