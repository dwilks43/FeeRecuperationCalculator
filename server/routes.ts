import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from 'crypto';
import { storage } from "./storage";

function generateISOAmpLoginLink(
  email: string,
  name: string,
  destination: string = "/dustin"
): string {
  const secretKey = process.env.ISO_AMP_SECRET_KEY;
  if (!secretKey) {
    throw new Error("ISO_AMP_SECRET_KEY not found in environment variables");
  }
  
  const message = {
    email: email,
    name: name,
    destination: destination,
  };
  
  // JSON stringify and hex encode
  const messageJson = JSON.stringify(message);
  const hexEncodedMessage = Buffer.from(messageJson).toString("hex");
  
  // Get Unix timestamp
  const unixTime = Math.floor(Date.now() / 1000);
  
  // Create message blob
  const version = "1";
  const messageBlob = hexEncodedMessage + unixTime + version;
  
  // Generate HMAC signature
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(messageBlob)
    .digest("hex");
  
  // Build URL
  const baseUrl = "https://dmprocessing.isoquote.com/login_via_link";
  return `${baseUrl}?m=${hexEncodedMessage}&s=${signature}&t=${unixTime}&v=${version}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ISO Amp One-Click Login Route
  app.get("/api/iso-amp-quote", (req, res) => {
    try {
      const loginLink = generateISOAmpLoginLink(
        "dustin@dmprocessing.com",  // Sales rep email
        "Dustin Wilkins",           // Sales rep name  
        "/dustin"                   // ISO Amp destination path
      );
      res.redirect(loginLink);
    } catch (error) {
      console.error("Error generating ISO Amp link:", error);
      res.status(500).send("Error connecting to ISO Amp");
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
