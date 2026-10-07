var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_crypto2 = __toESM(require("crypto"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var pdfParseModule = __toESM(require("pdf-parse"), 1);
var import_mammoth = __toESM(require("mammoth"), 1);
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_docx2 = require("docx");

// src/data/templates.ts
var singleColumnTemplates = [
  { id: "sc-01-editorial", name: "Editorial Minimal", category: "professionnel", description: { fr: "Mod\xE8le \xE9l\xE9gant, discret et tr\xE8s lisible.", en: "Clean and elegant resume for modern professionals.", ar: "\u0646\u0645\u0637 \u0623\u0646\u064A\u0642 \u0648\u0645\u0631\u064A\u062D \u0644\u0644\u0642\u0631\u0627\u0621\u0629." }, layoutType: "single-column-editorial", defaultAccent: "#0F172A", defaultSecondaryAccent: "#475569", defaultFont: "inter" },
  { id: "sc-02-luxe-gold", name: "Luxe Gold", category: "executif", description: { fr: "CV premium avec accents dor\xE9s pour les postes de direction.", en: "Executive look with gold accents and strong hierarchy.", ar: "\u062A\u0635\u0645\u064A\u0645 \u062A\u0646\u0641\u064A\u0630\u064A \u0630\u0647\u0628\u064A \u0644\u0644\u062A\u0642\u062F\u064A\u0645 \u0625\u0644\u0649 \u0645\u0646\u0627\u0635\u0628 \u0627\u0644\u0642\u064A\u0627\u062F\u0629." }, layoutType: "single-column-luxe", defaultAccent: "#B68D40", defaultSecondaryAccent: "#E2C88E", defaultFont: "playfair" },
  { id: "sc-03-emerald", name: "Emerald Flow", category: "moderne", description: { fr: "Mise en page moderne aux tons verts.", en: "Fresh modern resume with emerald tones.", ar: "\u0646\u0645\u0637 \u062D\u062F\u064A\u062B \u0628\u0623\u0644\u0648\u0627\u0646 \u062E\u0636\u0631\u0627\u0621 \u0645\u0646\u0639\u0634\u0629." }, layoutType: "single-column-emerald", defaultAccent: "#0F766E", defaultSecondaryAccent: "#34D399", defaultFont: "poppins" },
  { id: "sc-04-academic", name: "Academic Serif", category: "academique", description: { fr: "Parfait pour les profils universitaires et chercheurs.", en: "A classic academic layout for research and teaching profiles.", ar: "\u0646\u0645\u0637 \u0623\u0643\u0627\u062F\u064A\u0645\u064A \u0643\u0644\u0627\u0633\u064A\u0643\u064A \u0644\u0644\u0628\u0627\u062D\u062B\u064A\u0646 \u0648\u0627\u0644\u0645\u0639\u0644\u0645\u064A\u0646." }, layoutType: "single-column-academic", defaultAccent: "#1E293B", defaultSecondaryAccent: "#64748B", defaultFont: "merriweather" },
  { id: "sc-05-coral", name: "Coral Pulse", category: "creatif", description: { fr: "Plus dynamique et visuel pour les profils cr\xE9atifs.", en: "Bold creative layout with warm coral tones.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0625\u0628\u062F\u0627\u0639\u064A \u062F\u0627\u0641\u0626 \u0645\u0639 \u0644\u0645\u0633\u0627\u062A \u0628\u0631\u062A\u0642\u0627\u0644\u064A\u0629." }, layoutType: "single-column-coral", defaultAccent: "#F97316", defaultSecondaryAccent: "#FDBA74", defaultFont: "montserrat" },
  { id: "sc-06-tech", name: "Tech Mono", category: "technique", description: { fr: "Design technique inspir\xE9 du coding et des dashboards.", en: "Technical template inspired by code editors and dashboards.", ar: "\u062A\u0635\u0645\u064A\u0645 \u062A\u0642\u0646\u064A \u0645\u0633\u062A\u0648\u062D\u0649 \u0645\u0646 \u0648\u0627\u062C\u0647\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u0629." }, layoutType: "single-column-tech", defaultAccent: "#0F172A", defaultSecondaryAccent: "#22C55E", defaultFont: "source-sans" },
  { id: "sc-07-noir", name: "Noir Executive", category: "executif", description: { fr: "CV premium en noir, minimaliste et impactant.", en: "Dark executive resume with outstanding contrast.", ar: "\u062A\u0646\u0633\u064A\u0642 \u062A\u0646\u0641\u064A\u0630\u064A \u062F\u0627\u0643\u0646 \u064A\u0639\u0637\u064A \u062D\u0636\u0648\u0631\u064B\u0627 \u0642\u0648\u064A\u064B\u0627." }, layoutType: "single-column-noir", defaultAccent: "#111827", defaultSecondaryAccent: "#94A3B8", defaultFont: "inter" },
  { id: "sc-08-nordic", name: "Nordic Pure", category: "minimaliste", description: { fr: "Calme, net et professionnel pour les candidatures s\xE9rieuses.", en: "Minimal and serene template for methodical professionals.", ar: "\u0646\u0645\u0637 \u0647\u0627\u062F\u0626 \u0648\u0648\u0627\u0636\u062D \u0644\u0644\u0645\u062D\u062A\u0631\u0641\u064A\u0646 \u0627\u0644\u0645\u0646\u0638\u0645\u064A\u0646." }, layoutType: "single-column-nordic", defaultAccent: "#334155", defaultSecondaryAccent: "#CBD5E1", defaultFont: "roboto" },
  { id: "sc-09-indigo", name: "Indigo Banner", category: "professionnel", description: { fr: "Mise en page structur\xE9e avec bandeau accentu\xE9.", en: "Structured resume with a strong banner identity.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0645\u0646\u0638\u0645 \u0645\u0639 \u0634\u0631\u064A\u0637 \u0644\u0648\u0646\u064A \u0628\u0627\u0631\u0632." }, layoutType: "single-column-indigo", defaultAccent: "#4338CA", defaultSecondaryAccent: "#A5B4FC", defaultFont: "poppins" },
  { id: "sc-10-ocean", name: "Ocean Wave", category: "moderne", description: { fr: "Ambiance marine douce et professionnelle.", en: "Soft ocean palette for calm, modern profiles.", ar: "\u0623\u0644\u0648\u0627\u0646 \u0628\u062D\u0631\u064A\u0629 \u0647\u0627\u062F\u0626\u0629 \u0648\u0645\u062A\u0646\u0627\u0633\u0642\u0629." }, layoutType: "single-column-ocean", defaultAccent: "#0369A1", defaultSecondaryAccent: "#67E8F9", defaultFont: "inter" },
  { id: "sc-11-bento", name: "Bento Grid", category: "technique", description: { fr: "Structure en blocs pour un maximum de clart\xE9.", en: "Grid-based layout for a clean, precise presentation.", ar: "\u0647\u064A\u0643\u0644 \u0634\u0628\u0643\u064A \u064A\u0628\u0631\u0632 \u0627\u0644\u0648\u0636\u0648\u062D \u0648\u0627\u0644\u0631\u0648\u062A\u064A\u0646." }, layoutType: "single-column-bento", defaultAccent: "#0EA5E9", defaultSecondaryAccent: "#7DD3FC", defaultFont: "source-sans" },
  { id: "sc-12-arch", name: "Arch Header", category: "professionnel", description: { fr: "En-t\xEAte arrondi et design architectural.", en: "Rounded editorial look with an architectural header.", ar: "\u0631\u0623\u0633 \u0645\u0645\u064A\u0632 \u0628\u062A\u0635\u0645\u064A\u0645 \u0645\u0639\u0645\u0627\u0631\u064A \u0623\u0646\u064A\u0642." }, layoutType: "single-column-arch", defaultAccent: "#1F2937", defaultSecondaryAccent: "#60A5FA", defaultFont: "lora" },
  { id: "sc-13-editorial-serif", name: "Editorial Serif", category: "classique", description: { fr: "Style \xE9ditorial plus classique avec serif.", en: "Classic serif layout for a formal impression.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0643\u0644\u0627\u0633\u0643\u064A \u0628\u0646\u0645\u0637 \u062A\u062D\u0631\u064A\u0631\u064A\u0629 \u0631\u0633\u0645\u064A." }, layoutType: "single-column-editorial-serif", defaultAccent: "#374151", defaultSecondaryAccent: "#D6D3D1", defaultFont: "merriweather" },
  { id: "sc-14-compact-ats", name: "ATS Compact", category: "professionnel", description: { fr: "Parfait pour les candidatures ATS et tr\xE8s lisibles.", en: "ATS-friendly and highly readable compact layout.", ar: "\u0646\u0645\u0637 \u0645\u0646\u0627\u0633\u0628 \u0644\u0623\u0646\u0638\u0645\u0629 ATS \u0648\u0633\u0647\u0644 \u0627\u0644\u0642\u0631\u0627\u0621\u0629." }, layoutType: "single-column-ats", defaultAccent: "#1D4ED8", defaultSecondaryAccent: "#93C5FD", defaultFont: "roboto" },
  { id: "sc-15-metro", name: "Metro Pills", category: "moderne", description: { fr: "Mise en page visuelle et \xE9lectrisante.", en: "Visual and dynamic layout with pill elements.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0645\u0631\u0626\u064A \u062F\u064A\u0646\u0627\u0645\u064A\u0643\u064A \u0645\u0639 \u0639\u0646\u0627\u0635\u0631 \u0645\u0633\u062A\u062F\u064A\u0631\u0629." }, layoutType: "single-column-metro", defaultAccent: "#0F766E", defaultSecondaryAccent: "#A7F3D0", defaultFont: "poppins" },
  { id: "sc-16-burgundy", name: "Burgundy Line", category: "executif", description: { fr: "Tonalit\xE9s profondes et contenues.", en: "Refined and striking burgundy-led design.", ar: "\u062A\u062F\u0631\u062C\u0627\u062A \u0639\u0645\u064A\u0642\u0629 \u0648\u0631\u0627\u0642\u064A\u0629 \u0641\u064A \u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u0628\u0648\u0631\u063A\u0646\u062F\u064A." }, layoutType: "single-column-burgundy", defaultAccent: "#7F1D1D", defaultSecondaryAccent: "#FCA5A5", defaultFont: "lora" },
  { id: "sc-17-cyan", name: "Cyan Minimal", category: "minimaliste", description: { fr: "Minimaliste, lumineux et facile \xE0 scanner.", en: "Very light and airy template with cyan details.", ar: "\u0646\u0645\u0637 \u062E\u0641\u064A\u0641 \u0648\u0645\u0634\u0631\u0642 \u0645\u0639 \u0644\u0645\u0633\u0627\u062A \u0633\u0645\u0627\u0648\u064A\u0629." }, layoutType: "single-column-cyan", defaultAccent: "#0891B2", defaultSecondaryAccent: "#A5F3FC", defaultFont: "inter" },
  { id: "sc-18-gold-ring", name: "Gold Ring", category: "luxury", description: { fr: "Un CV premium avec un cadre m\xE9tallique tr\xE8s \xE9l\xE9gant.", en: "Luxury styling with elegant metallic framing.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0641\u0627\u062E\u0631 \u0628\u0625\u0637\u0627\u0631 \u0630\u0647\u0628\u064A \u0623\u0646\u064A\u0642." }, layoutType: "single-column-gold-ring", defaultAccent: "#B45309", defaultSecondaryAccent: "#FDE68A", defaultFont: "playfair" },
  { id: "sc-19-sylvie", name: "Sylvie Wave", category: "creative", description: { fr: "Style narratif avec forme organique et superbe lisibilit\xE9.", en: "Organic wave layout for creative professionals.", ar: "\u0623\u0633\u0644\u0648\u0628 \u0625\u0628\u062F\u0627\u0639\u064A \u0645\u0639 \u0623\u0634\u0643\u0627\u0644 \u0645\u0627\u0626\u064A\u0629 \u0646\u0627\u0639\u0645\u0629." }, layoutType: "single-column-sylvie", defaultAccent: "#7C3AED", defaultSecondaryAccent: "#C4B5FD", defaultFont: "poppins" },
  { id: "sc-20-baxter", name: "Baxter Diagonal", category: "professionnel", description: { fr: "Hauteur visuelle et traits structurants.", en: "Diagonal rhythm and a strong visual structure.", ar: "\u0647\u064A\u0643\u0644 \u0628\u0635\u0631\u064A \u0645\u062A\u0648\u0627\u0632\u0646 \u0645\u0639 \u062E\u0637\u0648\u0637 \u0645\u0627\u0626\u0644\u0629." }, layoutType: "single-column-baxter", defaultAccent: "#312E81", defaultSecondaryAccent: "#FBBF24", defaultFont: "montserrat" },
  { id: "sc-21-glass", name: "Glass Panel", category: "moderne", description: { fr: "Effet verre et sobri\xE9t\xE9 premium.", en: "Glassmorphism-inspired resume with premium feel.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0632\u062C\u0627\u062C\u064A \u0623\u0646\u064A\u0642 \u0648\u0645\u0645\u064A\u0632." }, layoutType: "single-column-glass", defaultAccent: "#1D4ED8", defaultSecondaryAccent: "#BFDBFE", defaultFont: "inter" },
  { id: "sc-22-sage", name: "Sage Precision", category: "minimaliste", description: { fr: "Palette douce et propre pour un style minimaliste.", en: "Soft sage color palette with a neat layout.", ar: "\u0623\u0644\u0648\u0627\u0646 \u0632\u064A\u062A\u0648\u0646\u064A\u0629 \u0647\u0627\u062F\u0626\u0629 \u0645\u0639 \u062A\u0635\u0645\u064A\u0645 \u0645\u0646\u0638\u0645." }, layoutType: "single-column-sage", defaultAccent: "#4D7C0F", defaultSecondaryAccent: "#A3E635", defaultFont: "source-sans" },
  { id: "sc-23-royal", name: "Royal Blue", category: "executif", description: { fr: "Confiance et pr\xE9sence pour les profils hi\xE9rarchiques.", en: "High-trust royal blue resume for leadership profiles.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0645\u0648\u062B\u0648\u0642 \u0628\u0623\u0644\u0648\u0627\u0646 \u0632\u0631\u0642\u0627\u0621 \u0645\u0644\u0643\u064A\u0629." }, layoutType: "single-column-royal", defaultAccent: "#1E3A8A", defaultSecondaryAccent: "#93C5FD", defaultFont: "montserrat" },
  { id: "sc-24-sunset", name: "Sunset Ribbon", category: "creatif", description: { fr: "Ambiance chaude et m\xE9morable.", en: "Warm and memorable creative resume style.", ar: "\u0623\u0633\u0644\u0648\u0628 \u062F\u0627\u0641\u0626 \u0644\u0627 \u064A\u064F\u0646\u0633\u0649." }, layoutType: "single-column-sunset", defaultAccent: "#F97316", defaultSecondaryAccent: "#FDE68A", defaultFont: "lora" },
  { id: "sc-25-garden", name: "Garden Soft", category: "moderne", description: { fr: "Clart\xE9, douceur et naturel dans un format efficace.", en: "Natural and polished modern template with soft tones.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0639\u0635\u0631\u064A \u0647\u0627\u062F\u0626 \u0645\u0639 \u0644\u0645\u0633\u0627\u062A \u0637\u0628\u064A\u0639\u064A\u0629." }, layoutType: "single-column-garden", defaultAccent: "#15803D", defaultSecondaryAccent: "#86EFAC", defaultFont: "inter" },
  { id: "sc-26-midnight", name: "Midnight Heist", category: "professionnel", description: { fr: "Design noir profond pour un impact fort en ligne.", en: "Deep midnight styling for high-contrast presentation.", ar: "\u062A\u0635\u0645\u064A\u0645 \u062F\u0627\u0643\u0646 \u0642\u0648\u064A \u064A\u0628\u0631\u0632 \u062D\u0636\u0648\u0631\u0643." }, layoutType: "single-column-midnight", defaultAccent: "#111827", defaultSecondaryAccent: "#38BDF8", defaultFont: "roboto" },
  { id: "sc-27-ivory", name: "Ivory Edge", category: "classique", description: { fr: "CV classe et d\xE9licat sur fond neutre.", en: "Polished ivory template with subtle structure.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0643\u0644\u0627\u0633\u0643\u064A \u0623\u0628\u064A\u0636 \u062F\u0627\u0641\u0626 \u0648\u062F\u0642\u064A\u0642." }, layoutType: "single-column-ivory", defaultAccent: "#4B5563", defaultSecondaryAccent: "#D1D5DB", defaultFont: "merriweather" },
  { id: "sc-28-fresh", name: "Fresh Slate", category: "professionnel", description: { fr: "Tr\xE8s lisible et moderne pour tous types de postes.", en: "Readable, contemporary and adaptable to multiple sectors.", ar: "\u0646\u0645\u0637 \u0639\u0635\u0631\u064A \u0633\u0647\u0644 \u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0648\u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u062A\u0646\u0648\u0639\u0629." }, layoutType: "single-column-fresh", defaultAccent: "#334155", defaultSecondaryAccent: "#94A3B8", defaultFont: "source-sans" },
  { id: "sc-29-pastel", name: "Pastel Studio", category: "creatif", description: { fr: "Couleurs douces et structure harmonieuse.", en: "Pastel accents with comfortable spacing and balance.", ar: "\u0623\u0644\u0648\u0627\u0646 \u0646\u0627\u0639\u0645\u0629 \u0645\u0639 \u062A\u0646\u0633\u064A\u0642 \u0645\u062A\u0648\u0627\u0632\u0646." }, layoutType: "single-column-pastel", defaultAccent: "#A21CAF", defaultSecondaryAccent: "#F9A8D4", defaultFont: "poppins" },
  { id: "sc-30-trust", name: "Trust Ledger", category: "executif", description: { fr: "Style s\xE9rieux, structur\xE9 pour les fonctions de responsabilit\xE9.", en: "Responsible and structured with highly trustworthy tone.", ar: "\u0623\u0633\u0644\u0648\u0628 \u062C\u0627\u062F \u0648\u0645\u0646\u0638\u0645 \u0644\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0643\u0628\u0631\u0649." }, layoutType: "single-column-trust", defaultAccent: "#0F172A", defaultSecondaryAccent: "#A78BFA", defaultFont: "inter" },
  { id: "sc-31-sunlit", name: "Sunlit Grid", category: "professionnel", description: { fr: "Luminosit\xE9 douce et structure claire.", en: "Bright and tidy structure with gentle warmth.", ar: "\u0625\u0636\u0627\u0621\u0629 \u0646\u0627\u0639\u0645\u0629 \u0648\u0628\u0646\u064A\u0629 \u0648\u0627\u0636\u062D\u0629." }, layoutType: "single-column-sunlit", defaultAccent: "#F59E0B", defaultSecondaryAccent: "#FDE68A", defaultFont: "inter" },
  { id: "sc-32-atelier-slate", name: "Atelier Slate", category: "moderne", description: { fr: "Mat\xE9rialit\xE9 l\xE9g\xE8re avec un rendu premium.", en: "Clean premium material feel with refined balance.", ar: "\u0645\u0638\u0647\u0631 \u0641\u0627\u062E\u0631 \u0645\u0639 \u062A\u0648\u0627\u0632\u0646 \u0623\u0646\u064A\u0642." }, layoutType: "single-column-atelier-slate", defaultAccent: "#475569", defaultSecondaryAccent: "#E2E8F0", defaultFont: "source-sans" },
  { id: "sc-33-verdant", name: "Verdant Flow", category: "minimaliste", description: { fr: "Palette verte tr\xE8s naturelle et apaisante.", en: "A calm green aesthetic with excellent readability.", ar: "\u0623\u0644\u0648\u0627\u0646 \u062E\u0636\u0631\u0627\u0621 \u0647\u0627\u062F\u0626\u0629 \u0648\u0633\u0647\u0644\u0629 \u0627\u0644\u0642\u0631\u0627\u0621\u0629." }, layoutType: "single-column-verdant", defaultAccent: "#15803D", defaultSecondaryAccent: "#A7F3D0", defaultFont: "roboto" },
  { id: "sc-34-pixel-work", name: "Pixel Work", category: "technique", description: { fr: "Design technique orient\xE9 donn\xE9es et pr\xE9cision.", en: "Data-driven technical layout with strong precision.", ar: "\u062A\u0635\u0645\u064A\u0645 \u062A\u0642\u0646\u064A \u062F\u0642\u064A\u0642 \u0648\u0645\u0648\u062C\u0647 \u0644\u0644\u0628\u064A\u0627\u0646\u0627\u062A." }, layoutType: "single-column-pixel-work", defaultAccent: "#1D4ED8", defaultSecondaryAccent: "#93C5FD", defaultFont: "source-sans" },
  { id: "sc-35-lotus", name: "Lotus Card", category: "creatif", description: { fr: "Un profil cr\xE9atif entre douceur et pr\xE9sence.", en: "Refined creative layout with soft visual motion.", ar: "\u0646\u0645\u0637 \u0625\u0628\u062F\u0627\u0639\u064A \u062F\u0642\u064A\u0642 \u0645\u0639 \u062D\u0631\u0643\u0629 \u0628\u0635\u0631\u064A\u0629 \u0646\u0627\u0639\u0645\u0629." }, layoutType: "single-column-lotus", defaultAccent: "#BE185D", defaultSecondaryAccent: "#FBCFE8", defaultFont: "poppins" }
];
var twoColumnTemplates = [
  { id: "tc-01-corporate", name: "Corporate Split", category: "professionnel", description: { fr: "Version 2 colonnes id\xE9ale pour un profil solide et complet.", en: "Classic split layout for comprehensive profiles.", ar: "\u062A\u0646\u0633\u064A\u0642 \u062B\u0646\u0627\u0626\u064A \u0627\u0644\u0623\u0639\u0645\u062F\u0629 \u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0643\u0627\u0645\u0644\u0629." }, layoutType: "two-column-corporate", defaultAccent: "#1D4ED8", defaultSecondaryAccent: "#93C5FD", defaultFont: "inter" },
  { id: "tc-02-slate", name: "Slate Profile", category: "moderne", description: { fr: "Sidebar de qualit\xE9 et lisibilit\xE9 maximale.", en: "Strong sidebar presence with a modern tone.", ar: "\u0634\u0631\u064A\u0637 \u062C\u0627\u0646\u0628\u064A \u0642\u0648\u064A \u0645\u0639 \u0631\u0624\u064A\u0629 \u0645\u0645\u062A\u0627\u0632\u0629." }, layoutType: "two-column-slate", defaultAccent: "#334155", defaultSecondaryAccent: "#E2E8F0", defaultFont: "source-sans" },
  { id: "tc-03-amber", name: "Amber Executive", category: "executif", description: { fr: "Un style tr\xE8s professionnel, inspir\xE9 du corporate premium.", en: "Premium executive split with warm accents.", ar: "\u062A\u0646\u0633\u064A\u0642 \u062A\u0646\u0641\u064A\u0630\u064A \u0641\u0627\u062E\u0631 \u0645\u0639 \u0644\u0645\u0633\u0627\u062A \u062F\u0627\u0641\u0626\u0629." }, layoutType: "two-column-amber", defaultAccent: "#B45309", defaultSecondaryAccent: "#FCD34D", defaultFont: "lora" },
  { id: "tc-04-azure", name: "Azure Deck", category: "technique", description: { fr: "Parfait pour les profils techniques et analytiques.", en: "Analytical and technical layout with a blue identity.", ar: "\u062A\u0646\u0633\u064A\u0642 \u062A\u0642\u0646\u064A \u0648\u062A\u062D\u0644\u064A\u0644\u064A \u0628\u0632\u0631\u0642 \u0648\u0627\u0636\u062D." }, layoutType: "two-column-azure", defaultAccent: "#0EA5E9", defaultSecondaryAccent: "#BAE6FD", defaultFont: "roboto" },
  { id: "tc-05-forest", name: "Forest Signal", category: "minimaliste", description: { fr: "Palette verte et structur\xE9e pour les profils de gestion.", en: "Balanced green theme for managed and reliable profiles.", ar: "\u0623\u0644\u0648\u0627\u0646 \u062E\u0636\u0631\u0627\u0621 \u0645\u062A\u0648\u0627\u0632\u0646\u0629 \u0648\u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629." }, layoutType: "two-column-forest", defaultAccent: "#166534", defaultSecondaryAccent: "#86EFAC", defaultFont: "inter" },
  { id: "tc-06-ruby", name: "Ruby Frame", category: "creatif", description: { fr: "Mise en page expressive avec accents rouges.", en: "Creative and expressive split with ruby tones.", ar: "\u062A\u0646\u0633\u064A\u0642 \u0625\u0628\u062F\u0627\u0639\u064A \u0645\u0639 \u0644\u0645\u0633\u0627\u062A \u062D\u0645\u0631\u0627\u0621 \u0642\u0648\u064A\u0629." }, layoutType: "two-column-ruby", defaultAccent: "#BE123C", defaultSecondaryAccent: "#FBCFE8", defaultFont: "poppins" },
  { id: "tc-07-graphite", name: "Graphite Edge", category: "professionnel", description: { fr: "Classe et discret pour les postes de responsabilit\xE9.", en: "Professional and understated design for senior roles.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0647\u0627\u062F\u0626 \u0648\u0627\u062D\u062A\u0631\u0627\u0641\u064A \u0644\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0639\u0644\u064A\u0627." }, layoutType: "two-column-graphite", defaultAccent: "#374151", defaultSecondaryAccent: "#D1D5DB", defaultFont: "inter" },
  { id: "tc-08-rose", name: "Rose Atelier", category: "creatif", description: { fr: "Style cr\xE9atif l\xE9ger avec charme et personnalit\xE9.", en: "Warm and feminine layout with light modern personality.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0623\u0646\u062B\u0648\u064A \u0648\u062C\u0630\u0627\u0628 \u0645\u0639 \u062A\u0641\u0627\u0635\u064A\u0644 \u0628\u064A\u0636\u0627\u0621 \u062F\u0627\u0641\u0626\u0629." }, layoutType: "two-column-rose", defaultAccent: "#C026D3", defaultSecondaryAccent: "#F5D0FE", defaultFont: "montserrat" },
  { id: "tc-09-sky", name: "Sky Matrix", category: "technique", description: { fr: "Tr\xE8s lisible et orient\xE9 comp\xE9tences.", en: "Skill-focused matrix with a clear professional rhythm.", ar: "\u0647\u064A\u0643\u0644 \u0645\u0647\u0627\u0631\u0627\u062A\u064A \u0633\u0631\u064A\u0639 \u0648\u0645\u0628\u0627\u0634\u0631." }, layoutType: "two-column-sky", defaultAccent: "#0284C7", defaultSecondaryAccent: "#BAE6FD", defaultFont: "roboto" },
  { id: "tc-10-maison", name: "Maison Classic", category: "classique", description: { fr: "Un rendu classique et rassurant.", en: "Classic comfort for formal, stable profiles.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0643\u0644\u0627\u0633\u064A\u0643\u064A \u0645\u0631\u064A\u062D \u0648\u0645\u0648\u062B\u0648\u0642." }, layoutType: "two-column-maison", defaultAccent: "#B45309", defaultSecondaryAccent: "#FDE68A", defaultFont: "lora" },
  { id: "tc-11-onyx", name: "Onyx Contrast", category: "executif", description: { fr: "Un design tr\xE8s fort pour les profils de direction.", en: "High contrast black design for leadership roles.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0623\u0633\u0648\u062F \u0642\u0648\u064A \u0644\u0644\u0642\u064A\u0627\u062F\u0629." }, layoutType: "two-column-onyx", defaultAccent: "#111827", defaultSecondaryAccent: "#9CA3AF", defaultFont: "inter" },
  { id: "tc-12-cobalt", name: "Cobalt Link", category: "professionnel", description: { fr: "Mise en page particuli\xE8rement lisible pour les r\xE9seaux.", en: "Readable and practical for business and network-oriented roles.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0639\u0645\u0644\u064A \u0648\u0633\u0647\u0644 \u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0644\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0647\u0646\u064A\u0629." }, layoutType: "two-column-cobalt", defaultAccent: "#1D4ED8", defaultSecondaryAccent: "#BFDBFE", defaultFont: "poppins" },
  { id: "tc-13-sage", name: "Sage Matrix", category: "professionnel", description: { fr: "Palette douce et structure nette pour les profils bien organis\xE9s.", en: "Soft sage for well-structured and balanced profiles.", ar: "\u0623\u0644\u0648\u0627\u0646 \u062E\u0635\u0628\u0629 \u0645\u0639 \u062A\u0646\u0638\u064A\u0645 \u0648\u0627\u0636\u062D." }, layoutType: "two-column-sage-matrix", defaultAccent: "#4D7C0F", defaultSecondaryAccent: "#BEF264", defaultFont: "source-sans" },
  { id: "tc-14-ivory-grid", name: "Ivory Grid", category: "classique", description: { fr: "Approche claire et \xE9l\xE9gante sur fond neutre.", en: "Classic neutral grid with a polished finish.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0643\u0644\u0627\u0633\u064A\u0643\u064A \u0645\u062D\u0627\u064A\u062F \u0645\u0639 \u0644\u0645\u0633\u0629 \u0646\u0647\u0627\u0626\u064A\u0629 \u0623\u0646\u064A\u0642\u0629." }, layoutType: "two-column-ivory-grid", defaultAccent: "#475569", defaultSecondaryAccent: "#E2E8F0", defaultFont: "merriweather" },
  { id: "tc-15-lunar", name: "Lunar Form", category: "creatif", description: { fr: "Mod\xE8le cr\xE9atif avec personnalit\xE9 affirm\xE9e.", en: "Creative structure with a luminous personality.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0625\u0628\u062F\u0627\u0639\u064A \u064A\u0644\u0639\u0628 \u0639\u0644\u0649 \u0627\u0644\u0625\u0636\u0627\u0621\u0629 \u0648\u0627\u0644\u0623\u0644\u0648\u0627\u0646." }, layoutType: "two-column-lunar", defaultAccent: "#7C3AED", defaultSecondaryAccent: "#DDD6FE", defaultFont: "montserrat" },
  { id: "tc-16-mint", name: "Mint Signal", category: "moderne", description: { fr: "Tonalit\xE9s fra\xEEches et ponctu\xE9es de dynamisme.", en: "Fresh mint profile with smooth modern rhythm.", ar: "\u0623\u0644\u0648\u0627\u0646 \u0645\u0646\u0639\u0634\u0629 \u0645\u0639 \u0625\u064A\u0642\u0627\u0639 \u0639\u0635\u0631\u064A \u0633\u0644\u0633." }, layoutType: "two-column-mint", defaultAccent: "#10B981", defaultSecondaryAccent: "#A7F3D0", defaultFont: "inter" },
  { id: "tc-17-sand", name: "Sand Confidence", category: "executif", description: { fr: "Ambiance de confiance et de stabilit\xE9.", en: "Warm reassuring tone for leadership and consultants.", ar: "\u0623\u0633\u0644\u0648\u0628 \u0648\u0627\u062B\u0642 \u0648\u062F\u0627\u0641\u0626 \u0644\u0644\u0645\u0633\u062A\u0634\u0627\u0631\u064A\u0646 \u0648\u0627\u0644\u0642\u064A\u0627\u062F\u0629." }, layoutType: "two-column-sand", defaultAccent: "#A16207", defaultSecondaryAccent: "#FDE68A", defaultFont: "lora" },
  { id: "tc-18-terracotta", name: "Terracotta System", category: "professionnel", description: { fr: "Profil chaud, structur\xE9 et tr\xE8s visible.", en: "Warm terracotta profile with high readability.", ar: "\u062A\u0635\u0645\u064A\u0645 \u062F\u0627\u0641\u0626 \u0648\u0633\u0647\u0644 \u0627\u0644\u0642\u0631\u0627\u0621\u0629." }, layoutType: "two-column-terracotta", defaultAccent: "#C2410C", defaultSecondaryAccent: "#FDBA74", defaultFont: "roboto" },
  { id: "tc-19-ice", name: "Ice Horizon", category: "moderne", description: { fr: "Palette claire et tr\xE8s a\xE9rienne.", en: "Airy resume with cool lights and open space.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0646\u0627\u0639\u0645 \u0648\u0645\u0634\u0631\u0642 \u0645\u0639 \u0645\u0633\u0627\u062D\u0627\u062A \u0648\u0627\u0633\u0639\u0629." }, layoutType: "two-column-ice", defaultAccent: "#0284C7", defaultSecondaryAccent: "#E0F2FE", defaultFont: "source-sans" },
  { id: "tc-20-bandeau", name: "Bandeau Accent", category: "professionnel", description: { fr: "Cadre de contenu avec accent fort sur l\u2019en-t\xEAte.", en: "Strong header accent for a decisive identity.", ar: "\u0631\u0623\u0633 \u0628\u0627\u0631\u0632 \u0645\u0639 \u0647\u0648\u064A\u0629 \u0648\u0627\u0636\u062D\u0629." }, layoutType: "two-column-bandeau", defaultAccent: "#7C2D12", defaultSecondaryAccent: "#FDBA74", defaultFont: "poppins" },
  { id: "tc-21-aqua", name: "Aqua Pulse", category: "technique", description: { fr: "Courbes et structuration pour mettre en valeur les comp\xE9tences.", en: "Skill-driven layout with fluid aqua accents.", ar: "\u062A\u0646\u0633\u064A\u0642 \u062A\u0642\u0646\u064A \u0645\u0639 \u0623\u0644\u0648\u0627\u0646 \u0645\u0627\u0626\u064A\u0629 \u0646\u0627\u0639\u0645\u0629." }, layoutType: "two-column-aqua", defaultAccent: "#0EA5A4", defaultSecondaryAccent: "#99F6E4", defaultFont: "inter" },
  { id: "tc-22-dune", name: "Dune Classic", category: "classique", description: { fr: "Mod\xE8le classique, \xE9quilibr\xE9 et rassurant.", en: "Balanced classic resume with natural warmth.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0643\u0644\u0627\u0633\u064A\u0643\u064A \u0645\u062A\u0648\u0627\u0632\u0646 \u0648\u062F\u0627\u0641\u0626." }, layoutType: "two-column-dune", defaultAccent: "#A16207", defaultSecondaryAccent: "#FDE68A", defaultFont: "merriweather" },
  { id: "tc-23-lilac", name: "Lilac Block", category: "creative", description: { fr: "Mise en page douce et originale.", en: "Original and soft layout with lilac personality.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0644\u0637\u064A\u0641 \u0648\u0645\u0645\u064A\u0632 \u0628\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0628\u0646\u0641\u0633\u062C\u064A\u0629." }, layoutType: "two-column-lilac", defaultAccent: "#7C3AED", defaultSecondaryAccent: "#DDD6FE", defaultFont: "montserrat" },
  { id: "tc-24-signal", name: "Signal Grid", category: "moderne", description: { fr: "Blocs solides pour le storytelling professionnel.", en: "Modern grid with decisive blocks and excellent readability.", ar: "\u0634\u0628\u0643\u0629 \u062D\u062F\u064A\u062B\u0629 \u0645\u0639 \u0643\u062A\u0644 \u0648\u0627\u0636\u062D\u0629 \u0648\u0633\u0647\u0644\u0629 \u0627\u0644\u0642\u0631\u0627\u0621\u0629." }, layoutType: "two-column-signal", defaultAccent: "#2563EB", defaultSecondaryAccent: "#BFDBFE", defaultFont: "inter" },
  { id: "tc-25-petal", name: "Petal Canvas", category: "creatif", description: { fr: "Calme, original et tr\xE8s esth\xE9tique.", en: "Fresh creative canvas with a soft visual rhythm.", ar: "\u0642\u0645\u0627\u0634 \u0625\u0628\u062F\u0627\u0639\u064A \u0646\u0627\u0639\u0645 \u0648\u062C\u0630\u0627\u0628." }, layoutType: "two-column-petal", defaultAccent: "#EC4899", defaultSecondaryAccent: "#FBCFE8", defaultFont: "poppins" },
  { id: "tc-26-atelier", name: "Atelier Noir", category: "professionnel", description: { fr: "Style chic et intelligent pour les profils premium.", en: "Premium black-and-white styling for contemporary profiles.", ar: "\u0623\u0633\u0644\u0648\u0628 \u0641\u0627\u062E\u0631 \u0628\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u0623\u0633\u0648\u062F \u0648\u0627\u0644\u0623\u0628\u064A\u0636." }, layoutType: "two-column-atelier", defaultAccent: "#111827", defaultSecondaryAccent: "#E5E7EB", defaultFont: "lora" },
  { id: "tc-27-ripple", name: "Ripple Commerce", category: "commercial", description: { fr: "Id\xE9al pour les profils orient\xE9s ventes et commerce.", en: "Effective for sales, commerce and customer-facing roles.", ar: "\u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u0627\u0644\u062A\u0633\u0648\u064A\u0642\u064A\u0629." }, layoutType: "two-column-ripple", defaultAccent: "#F59E0B", defaultSecondaryAccent: "#FDE68A", defaultFont: "roboto" },
  { id: "tc-28-spring", name: "Spring Edge", category: "moderne", description: { fr: "Palette vivante, claire et \xE9quilibr\xE9e.", en: "Fresh and vibrant modern styling with positive energy.", ar: "\u0623\u0644\u0648\u0627\u0646 \u0645\u0646\u0639\u0634\u0629 \u0648\u0637\u0627\u0642\u0629 \u0625\u064A\u062C\u0627\u0628\u064A\u0629." }, layoutType: "two-column-spring", defaultAccent: "#10B981", defaultSecondaryAccent: "#BBF7D0", defaultFont: "inter" },
  { id: "tc-29-studio", name: "Studio Board", category: "professionnel", description: { fr: "Tr\xE8s utile pour les profils polyvalents.", en: "Versatile studio template for multi-role profiles.", ar: "\u062A\u0635\u0645\u064A\u0645 \u0645\u062A\u0639\u062F\u062F \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0627\u062A \u0644\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0645\u062A\u0646\u0648\u0639\u0629." }, layoutType: "two-column-studio", defaultAccent: "#0F172A", defaultSecondaryAccent: "#A5B4FC", defaultFont: "montserrat" },
  { id: "tc-30-nova", name: "Nova Split", category: "executif", description: { fr: "La version 2 colonnes la plus premium et r\xE9solue.", en: "High-end split version for decisive and senior profiles.", ar: "\u0646\u0633\u062E\u0629 \u062B\u0646\u0627\u0626\u064A\u0629 \u0627\u0644\u0623\u0639\u0645\u062F\u0629 \u0641\u0627\u062E\u0631\u0629 \u0648\u0645\u062A\u0645\u0627\u0633\u0643\u0629." }, layoutType: "two-column-nova", defaultAccent: "#312E81", defaultSecondaryAccent: "#C4B5FD", defaultFont: "playfair" },
  { id: "tc-31-cascade", name: "Cascade Studio", category: "professionnel", description: { fr: "Structure b\xE2tie sur des blocs de contenu tr\xE8s lisibles.", en: "Balanced content blocks for a polished business profile.", ar: "\u0647\u064A\u0643\u0644 \u0645\u062A\u0648\u0627\u0632\u0646 \u0645\u0639 \u0643\u062A\u0644 \u0645\u062D\u062A\u0648\u0649 \u0648\u0627\u0636\u062D\u0629." }, layoutType: "two-column-cascade", defaultAccent: "#1D4ED8", defaultSecondaryAccent: "#BFDBFE", defaultFont: "inter" },
  { id: "tc-32-orbit", name: "Orbit Co", category: "technique", description: { fr: "Un design moderne inspir\xE9 des dashboards m\xE9tier.", en: "Dashboard-inspired format for modern technical roles.", ar: "\u062A\u0646\u0633\u064A\u0642 \u062D\u062F\u064A\u062B \u0645\u0633\u062A\u0648\u062D\u0649 \u0645\u0646 \u0644\u0648\u062D\u0627\u062A \u0627\u0644\u062A\u062D\u0643\u0645." }, layoutType: "two-column-orbit", defaultAccent: "#0EA5E9", defaultSecondaryAccent: "#A5F3FC", defaultFont: "roboto" },
  { id: "tc-33-bordeaux", name: "Bordeaux Tension", category: "executif", description: { fr: "Une pr\xE9sence plus affirm\xE9e pour les profils seniors.", en: "Strong premium tone for senior and leadership backgrounds.", ar: "\u0647\u0648\u064A\u0629 \u0642\u0648\u064A\u0629 \u0644\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0627\u062A \u0627\u0644\u0631\u0627\u0642\u064A\u0629." }, layoutType: "two-column-bordeaux", defaultAccent: "#7F1D1D", defaultSecondaryAccent: "#FCA5A5", defaultFont: "playfair" },
  { id: "tc-34-voyage", name: "Voyage Minimal", category: "moderne", description: { fr: "Minimaliste, ouvert et tr\xE8s lisible.", en: "Open and airy minimalist layout for modern hiring.", ar: "\u062A\u0646\u0633\u064A\u0642 \u0645\u0641\u062A\u0648\u062D \u0648\u0647\u0627\u062F\u0626 \u0644\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u062D\u062F\u064A\u062B\u0629." }, layoutType: "two-column-voyage", defaultAccent: "#334155", defaultSecondaryAccent: "#CBD5E1", defaultFont: "lora" },
  { id: "tc-35-solar", name: "Solar Frame", category: "creatif", description: { fr: "\xC9nergie chaude et design visuel impactant.", en: "Warm energy and memorable visual framing.", ar: "\u0623\u0644\u0648\u0627\u0646 \u062F\u0627\u0641\u0626\u0629 \u0648\u062A\u0635\u0645\u064A\u0645 \u0628\u0635\u0631\u064A \u0648\u0627\u0636\u062D." }, layoutType: "two-column-solar", defaultAccent: "#EA580C", defaultSecondaryAccent: "#FDBA74", defaultFont: "montserrat" }
];
var templates = [
  ...singleColumnTemplates.map((template) => ({ ...template, layoutFamily: "single-column" })),
  ...twoColumnTemplates.map((template) => ({ ...template, layoutFamily: "two-column-left" }))
];
var headerStyles = [
  "banner",
  "clean",
  "card",
  "arch",
  "modern-split",
  "minimal",
  "luxury-gold",
  "ocean-wave",
  "diagonal-split",
  "organic-arch",
  "sidebar-top",
  "tech-arches",
  "arc-contour",
  "sylvie-wave",
  "baxter-diagonal",
  "two-tone-split",
  "two-tone-stripe",
  "wave-bottom",
  "wave-top",
  "wave-double",
  "curved-wave-badge",
  "simple-minimal"
];
var sectionHeaderStyles = [
  "underline",
  "pill",
  "banner",
  "left-border",
  "boxed",
  "stars",
  "double-line",
  "arch-block",
  "badge-header",
  "badge-line",
  "icon-inline",
  "minimal"
];
var skillsDisplayModes = [
  "badges",
  "grid",
  "progress",
  "tags",
  "tech-cards",
  "cards-modern",
  "pill-bars",
  "matrix-cards",
  "compact-chips",
  "minimal-cards",
  "executive-tags",
  "categorized-pills",
  "stepped-levels",
  "grid-3",
  "stripped-table",
  "dots"
];
var photoFrameStyles = [
  "ronde",
  "carree",
  "arrondie",
  "hexagone",
  "arche",
  "galet",
  "cameo",
  "losange",
  "carree-doree",
  "passe-partout"
];
var timelineStyles = ["none", "line-dots", "accent-pills", "left-bar"];
var waveStyles = ["wave-smooth", "wave-double", "diagonal", "arch-dome", "hex-grid", "minimal-stripes", "blob", "curved"];
var footerStyles = [
  "banner-solid",
  "cards-grid",
  "minimal-inline",
  "pill-floating",
  "modern-split",
  "dark-tech",
  "classic-divider",
  "executive-signature",
  "soft-pills",
  "architect-metric"
];
var decorativeWaveTemplateIds = new Set(
  templates.slice(0, 10).map((template) => template.id)
);
var canUseDecorativeWave = (templateId) => Boolean(templateId) && decorativeWaveTemplateIds.has(templateId);
var getDesignVariant = (index, layoutFamily) => {
  const isSingleColumn = layoutFamily === "single-column";
  const base = index % headerStyles.length;
  const photoIndex = index % photoFrameStyles.length;
  const timelineIndex = index % timelineStyles.length;
  const footerIndex = index % footerStyles.length;
  const sectionIndex = (index * 2 + 1) % sectionHeaderStyles.length;
  const skillIndex = (index * 3 + (isSingleColumn ? 1 : 5)) % skillsDisplayModes.length;
  return {
    headerStyle: headerStyles[base],
    sectionHeaderStyle: sectionHeaderStyles[sectionIndex],
    skillsDisplayMode: skillsDisplayModes[skillIndex],
    photoPosition: isSingleColumn ? index % 3 === 0 ? "in-sidebar" : "in-header" : "in-sidebar",
    photoFrameStyle: photoFrameStyles[photoIndex],
    timelineStyle: timelineStyles[timelineIndex],
    typeVague: index < 10 ? waveStyles[index % waveStyles.length] : void 0,
    footerStyle: footerStyles[footerIndex],
    footerBackgroundColor: ["#0F172A", "#E2E8F0", "#F8FAFC", "#111827"][index % 4],
    footerTextColor: index % 2 === 0 ? "#FFFFFF" : "#0F172A",
    sidebarBackgroundColor: layoutFamily === "single-column" ? "#FFFFFF" : "#F8FAFC"
  };
};
var BUILT_IN_TEMPLATES = templates.map((template, index) => {
  const design = getDesignVariant(index, template.layoutFamily);
  return {
    id: template.id,
    name: `N\xB0 ${String(index + 1).padStart(2, "0")} \u2014 ${template.name}`,
    category: template.category,
    description: template.description,
    layoutType: template.layoutType,
    layoutFamily: template.layoutFamily,
    defaultAccent: template.defaultAccent,
    defaultSecondaryAccent: template.defaultSecondaryAccent,
    defaultFont: template.defaultFont,
    supportsSecondaryAccent: true,
    badgeText: template.layoutFamily === "single-column" ? "1 colonne" : "2 colonnes",
    previewImage: `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80`,
    preview: template.layoutFamily === "single-column" ? "single" : "double",
    themeConfig: {
      headerStyle: design.headerStyle,
      sectionHeaderStyle: design.sectionHeaderStyle,
      skillsDisplayMode: design.skillsDisplayMode,
      sidebarBackgroundColor: design.sidebarBackgroundColor,
      photoPosition: design.photoPosition,
      photoFrameStyle: design.photoFrameStyle,
      timelineStyle: design.timelineStyle,
      typeVague: design.typeVague,
      footerStyle: design.footerStyle,
      footerBackgroundColor: design.footerBackgroundColor,
      footerTextColor: design.footerTextColor,
      backgroundPattern: ["grid", "waves", "dots", "stripes"][index % 4]
    }
  };
});
var CUSTOM_MODEL_STORAGE_KEY = "admin_custom_templates";
function readAdminCustomTemplates() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_MODEL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      id: item.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: item.name || "Mod\xE8le personnalis\xE9",
      category: item.category || "professionnel",
      description: item.description || { fr: "Mod\xE8le personnalis\xE9 cr\xE9\xE9 par l\u2019admin.", en: "Admin-created custom template." },
      layoutType: item.layoutType || "single-column-custom",
      layoutFamily: item.layoutFamily || "single-column",
      defaultAccent: item.defaultAccent || "#0F172A",
      defaultSecondaryAccent: item.defaultSecondaryAccent || "#E2E8F0",
      defaultFont: item.defaultFont || "inter",
      badgeText: "Admin",
      previewImage: item.previewImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
      preview: item.preview || "single",
      requiredTier: "freemium",
      themeConfig: {
        headerStyle: item.themeConfig?.headerStyle || "clean",
        sectionHeaderStyle: item.themeConfig?.sectionHeaderStyle || "underline",
        skillsDisplayMode: item.themeConfig?.skillsDisplayMode || "badges",
        sidebarBackgroundColor: item.themeConfig?.sidebarBackgroundColor || "#F8FAFC",
        photoPosition: item.themeConfig?.photoPosition || "in-header",
        photoFrameStyle: item.themeConfig?.photoFrameStyle || "ronde",
        timelineStyle: item.themeConfig?.timelineStyle || "none",
        typeVague: void 0,
        footerStyle: item.themeConfig?.footerStyle || "minimal-inline",
        footerBackgroundColor: item.themeConfig?.footerBackgroundColor || "#0F172A",
        footerTextColor: item.themeConfig?.footerTextColor || "#FFFFFF",
        backgroundPattern: item.themeConfig?.backgroundPattern || "dots"
      }
    }));
  } catch {
    return [];
  }
}
var CV_TEMPLATES = [...BUILT_IN_TEMPLATES, ...readAdminCustomTemplates()];

// src/data/templatePresets.ts
var makeSection = (type, titre, colonne, contenu, zone = "principale", ordre) => ({
  id: `${type}-${Math.random().toString(36).slice(2, 9)}`,
  type,
  titre,
  colonne,
  zone,
  ordre,
  visible: true,
  contenu
});
var baseProfile = (name, job, langue) => ({
  nomComplet: name,
  titreProfessionnel: job,
  email: "contact@example.com",
  telephone: "+33 6 12 34 56 78",
  adresse: "Paris, France",
  siteWeb: "www.moncv.fr",
  linkedin: "linkedin.com/in/moncv",
  github: "github.com/moncv",
  resume: langue === "en" ? "Dynamic and results-oriented professional with a strong track record in delivering structured projects and creating value for teams and customers." : langue === "ar" ? "\u0645\u062D\u062A\u0631\u0641 \u062F\u064A\u0646\u0627\u0645\u064A\u0643\u064A \u064A\u0631\u0643\u0632 \u0639\u0644\u0649 \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0648\u064A\u062D\u0633\u0646 \u0627\u0644\u0623\u062F\u0627\u0621 \u0645\u0646 \u062E\u0644\u0627\u0644 \u062A\u0646\u0638\u064A\u0645 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0648\u062A\u0642\u062F\u064A\u0645 \u0642\u064A\u0645\u0629 \u0645\u0644\u0645\u0648\u0633\u0629 \u0644\u0644\u0641\u0631\u064A\u0642 \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u0621." : "Professionnel dynamique et orient\xE9 r\xE9sultats, capable de structurer des projets, accompagner les \xE9quipes et cr\xE9er de la valeur concr\xE8te."
});
var baseExperience = () => [
  {
    id: "exp-1",
    poste: "Chef de projet digital",
    entreprise: "Entreprise de services",
    ville: "Paris",
    dateDebut: "2022",
    dateFin: "Aujourd\u2019hui",
    actuel: true,
    description: "Pilotage de projets digitaux \xE0 forte valeur ajout\xE9e, coordination de plusieurs parties prenantes et optimisation des processus.",
    taches: ["Conduite de projets", "Analyse de besoins", "Pilotage de roadmap"],
    outils: [{ id: "tool-1", nom: "Notion" }, { id: "tool-2", nom: "Power BI" }]
  },
  {
    id: "exp-2",
    poste: "Consultant junior",
    entreprise: "Cabinet conseil",
    ville: "Lyon",
    dateDebut: "2020",
    dateFin: "2022",
    actuel: false,
    description: "Accompagnement des \xE9quipes dans la mise en place d\u2019outils et l\u2019am\xE9lioration des performances op\xE9rationnelles.",
    taches: ["Audit", "Process optimisation", "Support client"],
    outils: [{ id: "tool-3", nom: "Excel" }, { id: "tool-4", nom: "Tableau" }]
  }
];
var baseFormation = () => [
  {
    id: "edu-1",
    diplome: "Master Management / Marketing digital",
    etablissement: "Universit\xE9 Paris-Saclay",
    ville: "Paris",
    dateDebut: "2018",
    dateFin: "2020",
    actuel: false,
    description: "Sp\xE9cialisation en gestion de projet et innovation digitale."
  },
  {
    id: "edu-2",
    diplome: "Licence Economie et gestion",
    etablissement: "Universit\xE9 de Lyon",
    ville: "Lyon",
    dateDebut: "2015",
    dateFin: "2018",
    actuel: false,
    description: "Formation orient\xE9e gestion, statistiques et strat\xE9gie."
  }
];
var baseCompetences = () => [
  { id: "skill-1", nom: "Gestion de projet", niveau: 9, listSousCompetences: [{ id: "sub-1", nom: "Planning" }, { id: "sub-2", nom: "Pilotage" }] },
  { id: "skill-2", nom: "Analyse de donn\xE9es", niveau: 8, listSousCompetences: [{ id: "sub-3", nom: "Power BI" }, { id: "sub-4", nom: "Excel" }] },
  { id: "skill-3", nom: "Communication", niveau: 8, listSousCompetences: [{ id: "sub-5", nom: "R\xE9daction" }, { id: "sub-6", nom: "Pr\xE9sentation" }] },
  { id: "skill-4", nom: "M\xE9thodes agiles", niveau: 7, listSousCompetences: [{ id: "sub-7", nom: "Scrum" }, { id: "sub-8", nom: "Kanban" }] }
];
var baseProjects = () => [
  {
    id: "project-1",
    titre: "Transformation digitale RH",
    role: "Chef de projet",
    sousTitre: "Optimisation utilisateur",
    dateDebut: "2023",
    dateFin: "2024",
    description: "Mise en place d\u2019outils de gestion, am\xE9lioration de la productivit\xE9 et automatisation des processus de suivi."
  }
];
var baseLanguages = () => [
  { id: "lang-1", langue: "Fran\xE7ais", niveau: "Natif" },
  { id: "lang-2", langue: "Anglais", niveau: "Courant" },
  { id: "lang-3", langue: "Espagnol", niveau: "Interm\xE9diaire" }
];
var buildSections = (templateId, langue) => {
  const templateName = templateId.includes("tc-") ? "Professionnel" : "Profil";
  const roleLabel = langue === "en" ? "Project Manager" : langue === "ar" ? "\u0645\u062F\u064A\u0631 \u0645\u0634\u0631\u0648\u0639" : "Chef de projet";
  return [
    makeSection("profil", "Profil", "principale", baseProfile("Alexandre Martin", roleLabel, langue), "principale", 0),
    makeSection("experience", "Exp\xE9rience", templateId.includes("tc-") ? "gauche" : "principale", baseExperience(), templateId.includes("tc-") ? "gauche" : "principale", 1),
    makeSection("formation", "Formation", templateId.includes("tc-") ? "droite" : "principale", baseFormation(), templateId.includes("tc-") ? "droite" : "principale", 2),
    makeSection("competences", "Comp\xE9tences", templateId.includes("tc-") ? "gauche" : "principale", baseCompetences(), templateId.includes("tc-") ? "gauche" : "principale", 3),
    makeSection("projets", "Projets", templateId.includes("tc-") ? "droite" : "principale", baseProjects(), templateId.includes("tc-") ? "droite" : "principale", 4),
    makeSection("langues", "Langues", templateId.includes("tc-") ? "gauche" : "principale", baseLanguages(), templateId.includes("tc-") ? "gauche" : "principale", 5)
  ];
};
var buildPresetForTemplate = (templateId, langue = "fr") => {
  const template = CV_TEMPLATES.find((item) => item.id === templateId) || CV_TEMPLATES[0];
  const isTwoColumn = template.layoutFamily === "two-column-left";
  const theme = template.themeConfig || {};
  const headerStyle = theme.headerStyle || (isTwoColumn ? "modern-split" : "clean");
  const sectionHeaderStyle = theme.sectionHeaderStyle || "underline";
  const skillsMode = theme.skillsDisplayMode || "badges";
  const photoPosition = theme.photoPosition || (isTwoColumn ? "in-sidebar" : "in-header");
  const photoFrameStyle = theme.photoFrameStyle || "ronde";
  const footerStyle = theme.footerStyle || "banner-solid";
  const preset = {
    id: `${templateId}-${Date.now()}`,
    templateId,
    langue,
    titre: `${template.name} \u2022 ${langue === "en" ? "Resume" : langue === "ar" ? "\u0633\u064A\u0631\u0629 \u0630\u0627\u062A\u064A\u0629" : "CV"}`,
    couleurAccent: template.defaultAccent,
    couleurAccentSecondaire: template.defaultSecondaryAccent,
    couleurFond: "#FFFFFF",
    couleurFondSidebar: isTwoColumn ? "#F8FAFC" : "#FFFFFF",
    couleurTexte: "#0F172A",
    couleurTexteSidebar: "#0F172A",
    couleurTitreSection: template.defaultAccent,
    couleurTitreSectionSidebar: template.defaultAccent,
    couleurFondProfil: template.defaultAccent,
    couleurTexteProfil: "#FFFFFF",
    police: template.defaultFont,
    nombreColonnes: isTwoColumn ? 2 : 1,
    positionSidebar: isTwoColumn ? "gauche" : "gauche",
    largeurColonneGauche: 32,
    styleEnTete: headerStyle,
    styleEnTeteSection: sectionHeaderStyle,
    styleCompetences: skillsMode,
    timelineStyle: theme.timelineStyle || "line-dots",
    typeVague: canUseDecorativeWave(template.id) && theme.typeVague ? theme.typeVague : void 0,
    typeVaguePosition: canUseDecorativeWave(template.id) ? "haut" : void 0,
    displayTitle: "nom",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    afficherPhoto: true,
    photoPosition,
    photoForme: photoFrameStyle,
    formePhoto: photoFrameStyle,
    stylePiedDePage: footerStyle,
    styleFooterContact: footerStyle,
    couleurFondFooterContact: theme.footerBackgroundColor || "#0F172A",
    couleurTexteFooterContact: theme.footerTextColor || "#FFFFFF",
    couleurFondPiedDePage: theme.footerBackgroundColor || "#0F172A",
    couleurTextePiedDePage: theme.footerTextColor || "#FFFFFF",
    sections: buildSections(templateId, langue),
    statutPaiement: "NON_PAYE",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  return preset;
};
var TEMPLATE_PRESETS = Object.fromEntries(
  CV_TEMPLATES.map((template) => [template.id, buildPresetForTemplate(template.id, "fr")])
);
function getPresetForTemplate(templateId, langue = "fr") {
  const preset = TEMPLATE_PRESETS[templateId];
  if (preset) {
    return {
      ...preset,
      langue,
      sections: JSON.parse(JSON.stringify(preset.sections || buildSections(templateId, langue))),
      titre: `${templateId} \u2022 ${langue === "en" ? "Resume" : langue === "ar" ? "\u0633\u064A\u0631\u0629 \u0630\u0627\u062A\u064A\u0629" : "CV"}`
    };
  }
  const fallback = buildPresetForTemplate(CV_TEMPLATES[0].id, langue);
  return { ...fallback, templateId, langue };
}
function getCleanPresetForTemplate(templateId, langue = "fr") {
  const preset = getPresetForTemplate(templateId, langue);
  return {
    ...preset,
    sections: JSON.parse(JSON.stringify(preset.sections || [])),
    titre: `Nouveau CV ${langue === "en" ? "resume" : langue === "ar" ? "\u0633\u064A\u0631\u0629 \u0630\u0627\u062A\u064A\u0629" : "CV"}`
  };
}

// src/db/dbAdapter.ts
var import_crypto = __toESM(require("crypto"), 1);

// src/db/index.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = require("pg");

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  appSettings: () => appSettings,
  coverLetters: () => coverLetters,
  cvs: () => cvs,
  documents: () => documents,
  passwordResets: () => passwordResets,
  payments: () => payments,
  subscriptions: () => subscriptions,
  users: () => users
});
var import_pg_core = require("drizzle-orm/pg-core");
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  nom: (0, import_pg_core.text)("nom").notNull(),
  email: (0, import_pg_core.text)("email").notNull().unique(),
  motDePasseHash: (0, import_pg_core.text)("mot_de_passe_hash").notNull(),
  role: (0, import_pg_core.text)("role").default("USER").notNull(),
  // 'USER' | 'ADMIN'
  subscriptionTier: (0, import_pg_core.text)("subscription_tier").default("freemium").notNull(),
  // 'freemium' | 'classique' | 'premium'
  subscriptionExpiresAt: (0, import_pg_core.timestamp)("subscription_expires_at"),
  langue: (0, import_pg_core.text)("langue").default("fr").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var documents = (0, import_pg_core.pgTable)("documents", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  userId: (0, import_pg_core.text)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: (0, import_pg_core.text)("type").notNull(),
  // 'CV' | 'COVER_LETTER'
  cvId: (0, import_pg_core.text)("cv_id").references(() => documents.id, { onDelete: "set null" }),
  // Self-referential FK: cover letters linked to source CV
  titre: (0, import_pg_core.text)("titre").notNull(),
  templateId: (0, import_pg_core.text)("template_id").notNull(),
  langue: (0, import_pg_core.text)("langue").default("fr").notNull(),
  content: (0, import_pg_core.jsonb)("content").notNull(),
  // Unified JSON payload for CV data or Letter data
  entreprise: (0, import_pg_core.text)("entreprise"),
  poste: (0, import_pg_core.text)("poste"),
  destinataire: (0, import_pg_core.text)("destinataire"),
  objet: (0, import_pg_core.text)("objet"),
  statutPaiement: (0, import_pg_core.text)("statut_paiement").default("PAYE").notNull(),
  isArchived: (0, import_pg_core.boolean)("is_archived").default(false).notNull(),
  isPublic: (0, import_pg_core.boolean)("is_public").default(false).notNull(),
  metadata: (0, import_pg_core.jsonb)("metadata"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var cvs = (0, import_pg_core.pgTable)("cvs", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  userId: (0, import_pg_core.text)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  titre: (0, import_pg_core.text)("titre").notNull(),
  templateId: (0, import_pg_core.text)("template_id").notNull(),
  langue: (0, import_pg_core.text)("langue").default("fr").notNull(),
  cvData: (0, import_pg_core.jsonb)("cv_data").notNull(),
  statutPaiement: (0, import_pg_core.text)("statut_paiement").default("PAYE").notNull(),
  isArchived: (0, import_pg_core.boolean)("is_archived").default(false).notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var coverLetters = (0, import_pg_core.pgTable)("cover_letters", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  userId: (0, import_pg_core.text)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  titre: (0, import_pg_core.text)("titre").notNull(),
  templateId: (0, import_pg_core.text)("template_id").notNull(),
  langue: (0, import_pg_core.text)("langue").default("fr").notNull(),
  letterData: (0, import_pg_core.jsonb)("letter_data").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var payments = (0, import_pg_core.pgTable)("payments", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  utilisateurId: (0, import_pg_core.text)("utilisateur_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  planTier: (0, import_pg_core.text)("plan_tier").notNull(),
  montant: (0, import_pg_core.integer)("montant").notNull(),
  devise: (0, import_pg_core.text)("devise").default("FCFA").notNull(),
  referenceTransaction: (0, import_pg_core.text)("reference_transaction").notNull().unique(),
  provider: (0, import_pg_core.text)("provider").default("ikeepay").notNull(),
  providerTransactionId: (0, import_pg_core.text)("provider_transaction_id"),
  metadata: (0, import_pg_core.jsonb)("metadata"),
  statut: (0, import_pg_core.text)("statut").default("EN_ATTENTE").notNull(),
  // 'EN_ATTENTE' | 'VALIDE' | 'REJETE'
  valideLe: (0, import_pg_core.timestamp)("valide_le"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var subscriptions = (0, import_pg_core.pgTable)("subscriptions", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  userId: (0, import_pg_core.text)("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  paymentId: (0, import_pg_core.text)("payment_id").references(() => payments.id),
  planTier: (0, import_pg_core.text)("plan_tier").notNull(),
  startsAt: (0, import_pg_core.timestamp)("starts_at").notNull(),
  expiresAt: (0, import_pg_core.timestamp)("expires_at").notNull(),
  statut: (0, import_pg_core.text)("statut").default("ACTIF").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var appSettings = (0, import_pg_core.pgTable)("app_settings", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  adminPaidMatrix: (0, import_pg_core.jsonb)("admin_paid_matrix"),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var passwordResets = (0, import_pg_core.pgTable)("password_resets", {
  email: (0, import_pg_core.text)("email").primaryKey(),
  token: (0, import_pg_core.text)("token").notNull(),
  expiresAt: (0, import_pg_core.timestamp)("expires_at").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});

// src/db/index.ts
var createPool = () => {
  if (!global._postgresPool) {
    const connectionConfig = process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {
      host: process.env.SQL_HOST || "localhost",
      port: parseInt(process.env.SQL_PORT || "5432", 10),
      user: process.env.SQL_USER || "postgres",
      password: process.env.SQL_PASSWORD || "postgres",
      database: process.env.SQL_DB_NAME || "cv_builder_db"
    };
    global._postgresPool = new import_pg.Pool({
      ...connectionConfig,
      max: 10,
      connectionTimeoutMillis: 15e3
    });
    global._postgresPool.on("error", (err) => {
      console.error("Unexpected error on idle SQL pool client:", err);
    });
  }
  return global._postgresPool;
};
var pool = createPool();
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// src/db/dbAdapter.ts
var import_drizzle_orm = require("drizzle-orm");

// src/db/sqliteEngine.ts
var import_node_sqlite = require("node:sqlite");
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var DB_DIR = import_path.default.join(process.cwd(), "data");
var DB_PATH = import_path.default.join(DB_DIR, "app.db");
var LEGACY_JSON_PATH = import_path.default.join(DB_DIR, "db.json");
if (!import_fs.default.existsSync(DB_DIR)) {
  import_fs.default.mkdirSync(DB_DIR, { recursive: true });
}
var sqliteDbInstance = null;
function getSqliteDb() {
  if (!sqliteDbInstance) {
    sqliteDbInstance = new import_node_sqlite.DatabaseSync(DB_PATH);
    sqliteDbInstance.exec("PRAGMA foreign_keys = OFF;");
    sqliteDbInstance.exec("PRAGMA journal_mode = WAL;");
    initTables(sqliteDbInstance);
    migrateLegacyJsonData(sqliteDbInstance);
  }
  return sqliteDbInstance;
}
function initTables(db2) {
  db2.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      motDePasseHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      subscriptionTier TEXT NOT NULL DEFAULT 'freemium',
      subscriptionExpiresAt TEXT,
      langue TEXT DEFAULT 'fr',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('CV', 'COVER_LETTER')),
      cvId TEXT,
      titre TEXT NOT NULL,
      templateId TEXT NOT NULL DEFAULT 'classique',
      langue TEXT DEFAULT 'fr',
      content TEXT NOT NULL,
      entreprise TEXT,
      poste TEXT,
      destinataire TEXT,
      objet TEXT,
      statutPaiement TEXT DEFAULT 'PAYE',
      isArchived INTEGER DEFAULT 0,
      isPublic INTEGER DEFAULT 0,
      metadata TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (cvId) REFERENCES documents(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sqlite_docs_user_type ON documents(userId, type);
    CREATE INDEX IF NOT EXISTS idx_sqlite_docs_cv_id ON documents(cvId);
    CREATE INDEX IF NOT EXISTS idx_sqlite_docs_updated_at ON documents(updatedAt);
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS cvs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      titre TEXT NOT NULL,
      templateId TEXT NOT NULL DEFAULT 'classique',
      langue TEXT DEFAULT 'fr',
      cvData TEXT NOT NULL,
      isPublic INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS cover_letters (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      cvId TEXT,
      titre TEXT NOT NULL,
      templateId TEXT NOT NULL DEFAULT 'classique',
      langue TEXT DEFAULT 'fr',
      entreprise TEXT,
      poste TEXT,
      destinataire TEXT,
      objet TEXT,
      letterData TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      planTier TEXT NOT NULL,
      montant REAL NOT NULL,
      devise TEXT NOT NULL DEFAULT 'FCFA',
      referenceTransaction TEXT UNIQUE NOT NULL,
      statut TEXT NOT NULL DEFAULT 'succeeded',
      methodePaiement TEXT DEFAULT 'ikeepay',
      datePaiement TEXT NOT NULL,
      metaData TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      email TEXT PRIMARY KEY,
      token TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      paymentId TEXT,
      planTier TEXT NOT NULL,
      startsAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      statut TEXT NOT NULL DEFAULT 'ACTIF',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (paymentId) REFERENCES payments(id) ON DELETE SET NULL
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS user_activity (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      activityType TEXT NOT NULL,
      description TEXT,
      metadata TEXT,
      createdAt TEXT NOT NULL
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      isRead INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);
}
function migrateLegacyJsonData(db2) {
  try {
    const userCountStmt = db2.prepare("SELECT COUNT(*) as count FROM users");
    const userCountRow = userCountStmt.get();
    let importedUsers = false;
    if (userCountRow.count === 0 && import_fs.default.existsSync(LEGACY_JSON_PATH)) {
      try {
        const rawJson = import_fs.default.readFileSync(LEGACY_JSON_PATH, "utf-8");
        const legacyData = JSON.parse(rawJson);
        if (Array.isArray(legacyData.users)) {
          const insertUser = db2.prepare(`
            INSERT OR IGNORE INTO users (id, nom, email, motDePasseHash, role, subscriptionTier, subscriptionExpiresAt, langue, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          for (const u of legacyData.users) {
            insertUser.run(
              u.id || `u-${Math.random().toString(36).substring(2)}`,
              u.nom || "Utilisateur",
              (u.email || "").toLowerCase().trim(),
              u.motDePasseHash || import_bcryptjs.default.hashSync("password123", 10),
              u.role || "USER",
              u.subscriptionTier || "freemium",
              u.subscriptionExpiresAt || null,
              u.langue || "fr",
              u.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
              u.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
            );
          }
          importedUsers = true;
        }
        if (Array.isArray(legacyData.cvs)) {
          const insertCv = db2.prepare(`
            INSERT OR IGNORE INTO cvs (id, userId, titre, templateId, langue, cvData, isPublic, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          const ensureUser = db2.prepare(`
            INSERT OR IGNORE INTO users (id, nom, email, motDePasseHash, role, subscriptionTier, langue, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 'USER', 'freemium', 'fr', ?, ?)
          `);
          for (const c of legacyData.cvs) {
            const ownerId = c.userId || c.utilisateurId || "u-admin-1";
            const nowIso = (/* @__PURE__ */ new Date()).toISOString();
            ensureUser.run(ownerId, `Utilisateur ${ownerId.substring(0, 8)}`, `${ownerId}@cv-platform.internal`, import_bcryptjs.default.hashSync("password123", 10), nowIso, nowIso);
            insertCv.run(
              c.id,
              ownerId,
              c.titre || c.titreCV || "Mon CV",
              c.templateId || "classique",
              c.langue || "fr",
              JSON.stringify(c),
              c.isPublic ? 1 : 0,
              c.createdAt || c.dateCreation || (/* @__PURE__ */ new Date()).toISOString(),
              c.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
            );
          }
        }
        if (Array.isArray(legacyData.letters)) {
          const insertLetter = db2.prepare(`
            INSERT OR IGNORE INTO cover_letters (id, userId, cvId, titre, templateId, langue, entreprise, poste, destinataire, objet, letterData, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          const ensureUser = db2.prepare(`
            INSERT OR IGNORE INTO users (id, nom, email, motDePasseHash, role, subscriptionTier, langue, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 'USER', 'freemium', 'fr', ?, ?)
          `);
          for (const l of legacyData.letters) {
            const ownerId = l.userId || l.utilisateurId || "u-admin-1";
            const nowIso = (/* @__PURE__ */ new Date()).toISOString();
            ensureUser.run(ownerId, `Utilisateur ${ownerId.substring(0, 8)}`, `${ownerId}@cv-platform.internal`, import_bcryptjs.default.hashSync("password123", 10), nowIso, nowIso);
            insertLetter.run(
              l.id,
              ownerId,
              l.cvId || null,
              l.titre || "Lettre de motivation",
              l.templateId || "classique",
              l.langue || "fr",
              l.entreprise || "",
              l.poste || "",
              l.destinataire || "",
              l.objet || "",
              JSON.stringify(l),
              l.createdAt || l.dateCreation || (/* @__PURE__ */ new Date()).toISOString(),
              l.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
            );
          }
        }
        if (legacyData.appSettings && typeof legacyData.appSettings === "object") {
          const insertSetting = db2.prepare(`
            INSERT OR REPLACE INTO app_settings (key, value, updatedAt) VALUES (?, ?, ?)
          `);
          insertSetting.run(
            "global_config",
            JSON.stringify(legacyData.appSettings),
            (/* @__PURE__ */ new Date()).toISOString()
          );
        }
      } catch (e) {
        console.warn("Could not parse legacy db.json for migration:", e);
      }
    }
    const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || "").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
    if (adminEmail && adminPassword) {
      const adminCheck = db2.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
      if (!adminCheck) {
        const adminHash = import_bcryptjs.default.hashSync(adminPassword, 12);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        db2.prepare(`
          INSERT INTO users (id, nom, email, motDePasseHash, role, subscriptionTier, langue, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(`u-admin-${Date.now()}`, "Administrateur Principal", adminEmail, adminHash, "ADMIN", "premium", "fr", now, now);
        console.log(`[SQLITE BOOTSTRAP] Compte admin initialis\xE9 avec succ\xE8s pour ${adminEmail}`);
      }
    }
    const settingsCheck = db2.prepare("SELECT key FROM app_settings WHERE key = ?").get("global_config");
    if (!settingsCheck) {
      const defaultConfig = {
        paiementActif: true,
        pricingPlans: [
          { code: "decouverte", nom: "D\xE9couverte / Gratuit", prix: 0, devise: "FCFA", description: "Acc\xE8s aux fonctionnalit\xE9s de base" },
          { code: "classique", nom: "Pass Classique (7 Jours)", prix: 2500, devise: "FCFA", description: "G\xE9n\xE9ration IA illimit\xE9e + Export PDF" },
          { code: "premium", nom: "Pass Premium Pro (30 Jours)", prix: 5e3, devise: "FCFA", description: "Acc\xE8s complet Studio + Ciblage d'offres + Support prioritaire" }
        ],
        adminPaidMatrix: {
          studioMenus: {
            creativeTemplates: { isPaid: true, label: "Mod\xE8les Cr\xE9atifs & Design" },
            designerCanvas: { isPaid: true, label: "Visual Designer Canvas" },
            translatorAI: { isPaid: true, label: "Traducteur IA Multi-langues" },
            letterGenerator: { isPaid: true, label: "G\xE9n\xE9rateur de Lettre IA" },
            jobTargeting: { isPaid: true, label: "Ciblage d'Offre d'Emploi" },
            linkedinGenerator: { isPaid: true, label: "Optimiseur de Profil LinkedIn" },
            careerTools: { isPaid: false, label: "Outils de Carri\xE8re" }
          },
          subOptions: {
            pdfExportWatermarkFree: { isPaid: true, label: "Export PDF HD sans Filigrane" },
            aiAutoFix: { isPaid: true, label: "Correction Automatique IA" },
            customFonts: { isPaid: true, label: "Polices Typographiques Premium" },
            unlimitedCVs: { isPaid: true, label: "Cr\xE9ation de CVs Illimit\xE9s" },
            highPrioritySupport: { isPaid: false, label: "Support Client" }
          }
        }
      };
      db2.prepare(`
        INSERT INTO app_settings (key, value, updatedAt) VALUES (?, ?, ?)
      `).run("global_config", JSON.stringify(defaultConfig), (/* @__PURE__ */ new Date()).toISOString());
    }
  } catch (err) {
    console.warn("Error during SQLite database initialization or migration:", err);
  }
}

// src/db/dbAdapter.ts
var isSqlAvailable = () => {
  return !!process.env.DATABASE_URL || !!process.env.SQL_HOST;
};
var dbAdapter = {
  // -------------------------------------------------------------------
  // USERS
  // -------------------------------------------------------------------
  async findUserByEmail(email) {
    const normalized = email.toLowerCase().trim();
    if (isSqlAvailable()) {
      try {
        const results = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.email, normalized));
        return results[0] || null;
      } catch (err) {
        console.warn("PostgreSQL query failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    const row = sqlite.prepare("SELECT * FROM users WHERE LOWER(email) = ?").get(normalized);
    if (!row) return null;
    return {
      ...row,
      subscriptionExpiresAt: row.subscriptionExpiresAt ? new Date(row.subscriptionExpiresAt) : null,
      createdAt: row.createdAt ? new Date(row.createdAt) : /* @__PURE__ */ new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : /* @__PURE__ */ new Date()
    };
  },
  async findUserById(id) {
    if (isSqlAvailable()) {
      try {
        const results = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.id, id));
        return results[0] || null;
      } catch (err) {
        console.warn("PostgreSQL query failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    const row = sqlite.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!row) return null;
    return {
      ...row,
      subscriptionExpiresAt: row.subscriptionExpiresAt ? new Date(row.subscriptionExpiresAt) : null,
      createdAt: row.createdAt ? new Date(row.createdAt) : /* @__PURE__ */ new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : /* @__PURE__ */ new Date()
    };
  },
  async ensureUserInPostgres(userId) {
    if (!isSqlAvailable() || !userId) return;
    try {
      const existing = await db.select({ id: users.id }).from(users).where((0, import_drizzle_orm.eq)(users.id, userId));
      if (existing && existing.length > 0) return;
      const sqlite = getSqliteDb();
      const u = sqlite.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (u) {
        const normEmail = (u.email || `user_${userId}@moncvpro.internal`).toLowerCase().trim();
        const existingEmail = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.email, normEmail));
        const safeEmail = existingEmail && existingEmail.length > 0 && existingEmail[0].id !== userId ? `user_${userId}_${Date.now()}@moncvpro.internal` : normEmail;
        await db.insert(users).values({
          id: userId,
          nom: u.nom || "Utilisateur",
          email: safeEmail,
          motDePasseHash: u.motDePasseHash || "$2b$10$fallbackhash12345678901234567890",
          role: u.role || "USER",
          subscriptionTier: u.subscriptionTier || "freemium",
          subscriptionExpiresAt: u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt) : null,
          langue: u.langue || "fr",
          createdAt: u.createdAt ? new Date(u.createdAt) : /* @__PURE__ */ new Date(),
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : /* @__PURE__ */ new Date()
        }).onConflictDoNothing();
      } else {
        await db.insert(users).values({
          id: userId,
          nom: "Utilisateur",
          email: `user_${userId}@moncvpro.internal`.toLowerCase(),
          motDePasseHash: "$2b$10$fallbackhash12345678901234567890",
          role: "USER",
          subscriptionTier: "freemium",
          subscriptionExpiresAt: null,
          langue: "fr",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).onConflictDoNothing();
      }
    } catch (e) {
      console.warn("ensureUserInPostgres warning:", e);
    }
  },
  async ensureUserInSqlite(userId, fallbackInfo) {
    if (!userId) return;
    try {
      const sqlite = getSqliteDb();
      const existing = sqlite.prepare("SELECT id FROM users WHERE id = ?").get(userId);
      if (existing) return;
      let u = null;
      if (isSqlAvailable()) {
        try {
          const pgUsers = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.id, userId));
          if (pgUsers && pgUsers[0]) {
            u = pgUsers[0];
          }
        } catch {
        }
      }
      const nowIso = (/* @__PURE__ */ new Date()).toISOString();
      const nom = u?.nom || fallbackInfo?.nom || "Utilisateur";
      const email = (u?.email || fallbackInfo?.email || `user_${userId}@moncvpro.internal`).toLowerCase().trim();
      const motDePasseHash = u?.motDePasseHash || "$2b$10$fallbackhash12345678901234567890";
      const role = u?.role || fallbackInfo?.role || "USER";
      const subscriptionTier = u?.subscriptionTier || fallbackInfo?.subscriptionTier || "freemium";
      const subscriptionExpiresAt = u?.subscriptionExpiresAt ? u.subscriptionExpiresAt instanceof Date ? u.subscriptionExpiresAt.toISOString() : String(u.subscriptionExpiresAt) : null;
      const langue = u?.langue || "fr";
      const existingByEmail = sqlite.prepare("SELECT id FROM users WHERE email = ?").get(email);
      const safeEmail = existingByEmail && existingByEmail.id !== userId ? `user_${userId}_${Date.now()}@moncvpro.internal` : email;
      sqlite.prepare(`
        INSERT OR IGNORE INTO users (id, nom, email, motDePasseHash, role, subscriptionTier, subscriptionExpiresAt, langue, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        nom,
        safeEmail,
        motDePasseHash,
        role,
        subscriptionTier,
        subscriptionExpiresAt,
        langue,
        nowIso,
        nowIso
      );
    } catch (e) {
      console.warn("ensureUserInSqlite warning:", e);
    }
  },
  async syncAllSqliteUsersToPostgres() {
    if (!isSqlAvailable()) return;
    try {
      const sqlite = getSqliteDb();
      const allSqliteUsers = sqlite.prepare("SELECT * FROM users").all();
      for (const u of allSqliteUsers) {
        await this.ensureUserInPostgres(u.id);
      }
    } catch (e) {
      console.warn("syncAllSqliteUsersToPostgres notice:", e);
    }
  },
  async createUser(data) {
    const newId = data.id || `u-${import_crypto.default.randomUUID()}`;
    const normalizedEmail = data.email.toLowerCase().trim();
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const parsedSubDate = data.subscriptionExpiresAt ? new Date(data.subscriptionExpiresAt) : null;
    const newUser = {
      id: newId,
      nom: data.nom,
      email: normalizedEmail,
      motDePasseHash: data.motDePasseHash,
      role: data.role || "USER",
      subscriptionTier: data.subscriptionTier || "freemium",
      subscriptionExpiresAt: parsedSubDate ? parsedSubDate.toISOString() : null,
      langue: data.langue || "fr",
      createdAt: nowIso,
      updatedAt: nowIso
    };
    if (isSqlAvailable()) {
      try {
        const pgUserValues = {
          id: newId,
          nom: data.nom,
          email: normalizedEmail,
          motDePasseHash: data.motDePasseHash,
          role: data.role || "USER",
          subscriptionTier: data.subscriptionTier || "freemium",
          subscriptionExpiresAt: parsedSubDate,
          langue: data.langue || "fr",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        const existingUsers = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.email, normalizedEmail));
        if (existingUsers && existingUsers.length > 0) {
          const matched = existingUsers[0];
          await db.update(users).set({
            nom: data.nom,
            motDePasseHash: data.motDePasseHash,
            role: data.role || matched.role,
            subscriptionTier: data.subscriptionTier || matched.subscriptionTier,
            subscriptionExpiresAt: parsedSubDate || matched.subscriptionExpiresAt,
            langue: data.langue || matched.langue,
            updatedAt: /* @__PURE__ */ new Date()
          }).where((0, import_drizzle_orm.eq)(users.id, matched.id));
          newUser.id = matched.id;
        } else {
          await db.insert(users).values(pgUserValues).onConflictDoUpdate({
            target: users.id,
            set: {
              nom: data.nom,
              email: normalizedEmail,
              motDePasseHash: data.motDePasseHash,
              role: data.role || "USER",
              subscriptionTier: data.subscriptionTier || "freemium",
              subscriptionExpiresAt: parsedSubDate,
              langue: data.langue || "fr",
              updatedAt: /* @__PURE__ */ new Date()
            }
          });
        }
      } catch (err) {
        console.warn("PostgreSQL insert user failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    sqlite.prepare(`
      INSERT OR REPLACE INTO users (id, nom, email, motDePasseHash, role, subscriptionTier, subscriptionExpiresAt, langue, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newUser.id,
      newUser.nom,
      newUser.email,
      newUser.motDePasseHash,
      newUser.role,
      newUser.subscriptionTier,
      newUser.subscriptionExpiresAt,
      newUser.langue,
      newUser.createdAt,
      newUser.updatedAt
    );
    return newUser;
  },
  async updateUser(id, updates) {
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const cleanUpdates = { ...updates, updatedAt: nowIso };
    if (isSqlAvailable()) {
      try {
        await this.ensureUserInPostgres(id);
        const pgUpdates = {};
        if (updates.nom !== void 0) pgUpdates.nom = updates.nom;
        if (updates.email !== void 0) pgUpdates.email = updates.email.toLowerCase().trim();
        if (updates.motDePasseHash !== void 0) pgUpdates.motDePasseHash = updates.motDePasseHash;
        if (updates.role !== void 0) pgUpdates.role = updates.role;
        if (updates.subscriptionTier !== void 0) pgUpdates.subscriptionTier = updates.subscriptionTier;
        if (updates.subscriptionExpiresAt !== void 0) {
          pgUpdates.subscriptionExpiresAt = updates.subscriptionExpiresAt ? new Date(updates.subscriptionExpiresAt) : null;
        }
        if (updates.langue !== void 0) pgUpdates.langue = updates.langue;
        pgUpdates.updatedAt = /* @__PURE__ */ new Date();
        await db.update(users).set(pgUpdates).where((0, import_drizzle_orm.eq)(users.id, id));
        return this.findUserById(id);
      } catch (err) {
        console.warn("PostgreSQL update user failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    const existing = sqlite.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!existing) return null;
    const nom = cleanUpdates.nom !== void 0 ? cleanUpdates.nom : existing.nom;
    const email = cleanUpdates.email !== void 0 ? cleanUpdates.email.toLowerCase().trim() : existing.email;
    const motDePasseHash = cleanUpdates.motDePasseHash !== void 0 ? cleanUpdates.motDePasseHash : existing.motDePasseHash;
    const role = cleanUpdates.role !== void 0 ? cleanUpdates.role : existing.role;
    const subscriptionTier = cleanUpdates.subscriptionTier !== void 0 ? cleanUpdates.subscriptionTier : existing.subscriptionTier;
    const subExpires = cleanUpdates.subscriptionExpiresAt !== void 0 ? cleanUpdates.subscriptionExpiresAt ? new Date(cleanUpdates.subscriptionExpiresAt).toISOString() : null : existing.subscriptionExpiresAt;
    const langue = cleanUpdates.langue !== void 0 ? cleanUpdates.langue : existing.langue;
    sqlite.prepare(`
      UPDATE users SET nom = ?, email = ?, motDePasseHash = ?, role = ?, subscriptionTier = ?, subscriptionExpiresAt = ?, langue = ?, updatedAt = ?
      WHERE id = ?
    `).run(nom, email, motDePasseHash, role, subscriptionTier, subExpires, langue, nowIso, id);
    return this.findUserById(id);
  },
  async getAllUsers() {
    if (isSqlAvailable()) {
      try {
        return await db.select().from(users);
      } catch (err) {
        console.warn("PostgreSQL query failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    return sqlite.prepare("SELECT * FROM users ORDER BY createdAt DESC").all();
  },
  // -------------------------------------------------------------------
  // CVS & UNIFIED DOCUMENTS
  // -------------------------------------------------------------------
  async getCvsByUserId(userId) {
    if (isSqlAvailable()) {
      try {
        const docRows2 = await db.select().from(documents).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(documents.userId, userId), (0, import_drizzle_orm.eq)(documents.type, "CV")));
        if (docRows2 && docRows2.length > 0) {
          return docRows2.map((d) => {
            const contentObj = typeof d.content === "object" && d.content ? d.content : {};
            return {
              ...contentObj,
              id: d.id,
              userId: d.userId,
              utilisateurId: d.userId,
              titre: d.titre,
              templateId: d.templateId,
              langue: d.langue,
              statutPaiement: d.statutPaiement,
              isArchived: d.isArchived,
              isPublic: d.isPublic,
              createdAt: d.createdAt,
              updatedAt: d.updatedAt
            };
          });
        }
        return await db.select().from(cvs).where((0, import_drizzle_orm.eq)(cvs.userId, userId));
      } catch (err) {
        console.warn("PostgreSQL query failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    const docRows = sqlite.prepare("SELECT * FROM documents WHERE userId = ? AND type = 'CV' ORDER BY updatedAt DESC").all(userId);
    if (docRows && docRows.length > 0) {
      return docRows.map((r) => {
        let parsedData = {};
        try {
          parsedData = JSON.parse(r.content);
        } catch (e) {
        }
        return {
          ...parsedData,
          id: r.id,
          userId: r.userId,
          utilisateurId: r.userId,
          titre: r.titre,
          templateId: r.templateId,
          langue: r.langue,
          statutPaiement: r.statutPaiement,
          isArchived: !!r.isArchived,
          isPublic: !!r.isPublic,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        };
      });
    }
    const rows = sqlite.prepare("SELECT * FROM cvs WHERE userId = ? ORDER BY updatedAt DESC").all(userId);
    return rows.map((r) => {
      let parsedData = {};
      try {
        parsedData = JSON.parse(r.cvData);
      } catch (e) {
      }
      return {
        ...parsedData,
        id: r.id,
        userId: r.userId,
        utilisateurId: r.userId,
        titre: r.titre,
        templateId: r.templateId,
        langue: r.langue,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      };
    });
  },
  async reassignUserDocuments(oldUserId, newUserId) {
    if (isSqlAvailable()) {
      try {
        await this.ensureUserInPostgres(newUserId);
        await db.update(documents).set({ userId: newUserId }).where((0, import_drizzle_orm.eq)(documents.userId, oldUserId));
        await db.update(cvs).set({ userId: newUserId }).where((0, import_drizzle_orm.eq)(cvs.userId, oldUserId));
        await db.update(coverLetters).set({ userId: newUserId }).where((0, import_drizzle_orm.eq)(coverLetters.userId, oldUserId));
      } catch (err) {
        console.warn("PostgreSQL reassignUserDocuments fallback:", err);
      }
    }
    try {
      await this.ensureUserInSqlite(newUserId);
      const sqlite = getSqliteDb();
      sqlite.prepare("UPDATE documents SET userId = ? WHERE userId = ?").run(newUserId, oldUserId);
      sqlite.prepare("UPDATE cvs SET userId = ? WHERE userId = ?").run(newUserId, oldUserId);
      sqlite.prepare("UPDATE cover_letters SET userId = ? WHERE userId = ?").run(newUserId, oldUserId);
    } catch (err) {
      console.warn("SQLite reassignUserDocuments error:", err);
    }
  },
  async getCvById(id) {
    if (isSqlAvailable()) {
      try {
        const docRes = await db.select().from(documents).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(documents.id, id), (0, import_drizzle_orm.eq)(documents.type, "CV")));
        if (docRes && docRes[0]) {
          const d = docRes[0];
          const contentObj = typeof d.content === "object" && d.content ? d.content : {};
          return {
            ...contentObj,
            id: d.id,
            userId: d.userId,
            utilisateurId: d.userId,
            titre: d.titre,
            templateId: d.templateId,
            langue: d.langue,
            statutPaiement: d.statutPaiement,
            isArchived: d.isArchived,
            isPublic: d.isPublic,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
          };
        }
        const results = await db.select().from(cvs).where((0, import_drizzle_orm.eq)(cvs.id, id));
        return results[0] || null;
      } catch (err) {
        console.warn("PostgreSQL query failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    const docRow = sqlite.prepare("SELECT * FROM documents WHERE id = ? AND type = 'CV'").get(id);
    if (docRow) {
      let parsedData2 = {};
      try {
        parsedData2 = JSON.parse(docRow.content);
      } catch (e) {
      }
      return {
        ...parsedData2,
        id: docRow.id,
        userId: docRow.userId,
        utilisateurId: docRow.userId,
        titre: docRow.titre,
        templateId: docRow.templateId,
        langue: docRow.langue,
        createdAt: docRow.createdAt,
        updatedAt: docRow.updatedAt
      };
    }
    const r = sqlite.prepare("SELECT * FROM cvs WHERE id = ?").get(id);
    if (!r) return null;
    let parsedData = {};
    try {
      parsedData = JSON.parse(r.cvData);
    } catch (e) {
    }
    return {
      ...parsedData,
      id: r.id,
      userId: r.userId,
      utilisateurId: r.userId,
      titre: r.titre,
      templateId: r.templateId,
      langue: r.langue,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    };
  },
  async createCv(data) {
    let newId = data.id || `cv-${import_crypto.default.randomUUID()}`;
    if (data.id) {
      const existingDoc = await this.getCvById(data.id);
      if (existingDoc && (existingDoc.userId || existingDoc.utilisateurId) && (existingDoc.userId || existingDoc.utilisateurId) !== data.userId) {
        newId = `cv-${import_crypto.default.randomUUID()}`;
      }
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const fullCvData = {
      ...data.cvData,
      id: newId,
      utilisateurId: data.userId,
      userId: data.userId,
      titre: data.titre,
      templateId: data.templateId,
      langue: data.langue || "fr",
      updatedAt: nowIso
    };
    if (isSqlAvailable()) {
      try {
        await this.ensureUserInPostgres(data.userId);
        await db.insert(documents).values({
          id: newId,
          userId: data.userId,
          type: "CV",
          cvId: null,
          titre: data.titre,
          templateId: data.templateId,
          langue: data.langue || "fr",
          content: fullCvData,
          statutPaiement: data.statutPaiement || "PAYE",
          isArchived: data.isArchived || false,
          isPublic: false,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: documents.id,
          set: {
            titre: data.titre,
            templateId: data.templateId,
            langue: data.langue || "fr",
            content: fullCvData,
            updatedAt: /* @__PURE__ */ new Date()
          }
        });
        await db.insert(cvs).values({
          id: newId,
          userId: data.userId,
          titre: data.titre,
          templateId: data.templateId,
          langue: data.langue || "fr",
          cvData: fullCvData,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: cvs.id,
          set: {
            titre: data.titre,
            templateId: data.templateId,
            langue: data.langue || "fr",
            cvData: fullCvData,
            updatedAt: /* @__PURE__ */ new Date()
          }
        });
        return fullCvData;
      } catch (err) {
        console.warn("PostgreSQL insert CV failed, using SQLite:", err);
      }
    }
    await this.ensureUserInSqlite(data.userId);
    try {
      const sqlite = getSqliteDb();
      sqlite.prepare(`
        INSERT OR REPLACE INTO documents (id, userId, type, cvId, titre, templateId, langue, content, statutPaiement, isArchived, isPublic, createdAt, updatedAt)
        VALUES (?, ?, 'CV', NULL, ?, ?, ?, ?, 'PAYE', 0, 0, ?, ?)
      `).run(
        newId,
        data.userId,
        data.titre,
        data.templateId || "classique",
        data.langue || "fr",
        JSON.stringify(fullCvData),
        nowIso,
        nowIso
      );
      sqlite.prepare(`
        INSERT OR REPLACE INTO cvs (id, userId, titre, templateId, langue, cvData, isPublic, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId,
        data.userId,
        data.titre,
        data.templateId || "classique",
        data.langue || "fr",
        JSON.stringify(fullCvData),
        0,
        nowIso,
        nowIso
      );
    } catch (sqliteErr) {
      console.warn("SQLite saveCv warning:", sqliteErr);
    }
    return fullCvData;
  },
  async updateCvWhitelisted(id, userId, allowedUpdates) {
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const existing = await this.getCvById(id);
    if (!existing) return null;
    const mergedCvData = {
      ...existing,
      ...allowedUpdates.cvData || allowedUpdates,
      id,
      userId,
      utilisateurId: userId,
      updatedAt: nowIso
    };
    const newTitre = allowedUpdates.titre || mergedCvData.titre || existing.titre || "Mon CV";
    const newTemplateId = allowedUpdates.templateId || mergedCvData.templateId || existing.templateId || "classique";
    const newLangue = allowedUpdates.langue || mergedCvData.langue || existing.langue || "fr";
    if (isSqlAvailable()) {
      try {
        await this.ensureUserInPostgres(userId);
        await db.update(documents).set({
          titre: newTitre,
          templateId: newTemplateId,
          langue: newLangue,
          content: mergedCvData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(documents.id, id), (0, import_drizzle_orm.eq)(documents.userId, userId)));
        await db.update(cvs).set({
          titre: newTitre,
          templateId: newTemplateId,
          langue: newLangue,
          cvData: mergedCvData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(cvs.id, id), (0, import_drizzle_orm.eq)(cvs.userId, userId)));
        return mergedCvData;
      } catch (err) {
        console.warn("PostgreSQL update CV failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    sqlite.prepare(`
      UPDATE documents SET titre = ?, templateId = ?, langue = ?, content = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `).run(newTitre, newTemplateId, newLangue, JSON.stringify(mergedCvData), nowIso, id, userId);
    sqlite.prepare(`
      UPDATE cvs SET titre = ?, templateId = ?, langue = ?, cvData = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `).run(newTitre, newTemplateId, newLangue, JSON.stringify(mergedCvData), nowIso, id, userId);
    return mergedCvData;
  },
  async deleteCv(id, userId) {
    if (isSqlAvailable()) {
      try {
        await db.delete(documents).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(documents.id, id), (0, import_drizzle_orm.eq)(documents.userId, userId)));
        await db.delete(cvs).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(cvs.id, id), (0, import_drizzle_orm.eq)(cvs.userId, userId)));
        return true;
      } catch (err) {
        console.warn("PostgreSQL delete CV failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    sqlite.prepare("DELETE FROM documents WHERE id = ? AND userId = ?").run(id, userId);
    const res = sqlite.prepare("DELETE FROM cvs WHERE id = ? AND userId = ?").run(id, userId);
    return res.changes > 0;
  },
  // -------------------------------------------------------------------
  // LETTERS & UNIFIED DOCUMENTS
  // -------------------------------------------------------------------
  async getLettersByUserId(userId) {
    if (isSqlAvailable()) {
      try {
        const docRows2 = await db.select().from(documents).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(documents.userId, userId), (0, import_drizzle_orm.eq)(documents.type, "COVER_LETTER")));
        if (docRows2 && docRows2.length > 0) {
          return docRows2.map((d) => {
            const contentObj = typeof d.content === "object" && d.content ? d.content : {};
            return {
              ...contentObj,
              id: d.id,
              userId: d.userId,
              utilisateurId: d.userId,
              cvId: d.cvId,
              titre: d.titre,
              templateId: d.templateId,
              langue: d.langue,
              entreprise: d.entreprise,
              poste: d.poste,
              destinataire: d.destinataire,
              objet: d.objet,
              statutPaiement: d.statutPaiement,
              isArchived: d.isArchived,
              createdAt: d.createdAt,
              updatedAt: d.updatedAt
            };
          });
        }
        return await db.select().from(coverLetters).where((0, import_drizzle_orm.eq)(coverLetters.userId, userId));
      } catch (err) {
        console.warn("PostgreSQL query letters failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    const docRows = sqlite.prepare("SELECT * FROM documents WHERE userId = ? AND type = 'COVER_LETTER' ORDER BY updatedAt DESC").all(userId);
    if (docRows && docRows.length > 0) {
      return docRows.map((r) => {
        let parsed = {};
        try {
          parsed = JSON.parse(r.content);
        } catch (e) {
        }
        return {
          ...parsed,
          id: r.id,
          userId: r.userId,
          utilisateurId: r.userId,
          cvId: r.cvId,
          titre: r.titre,
          templateId: r.templateId,
          langue: r.langue,
          entreprise: r.entreprise,
          poste: r.poste,
          destinataire: r.destinataire,
          objet: r.objet,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        };
      });
    }
    const rows = sqlite.prepare("SELECT * FROM cover_letters WHERE userId = ? ORDER BY updatedAt DESC").all(userId);
    return rows.map((r) => {
      let parsed = {};
      try {
        parsed = JSON.parse(r.letterData);
      } catch (e) {
      }
      return {
        ...parsed,
        id: r.id,
        userId: r.userId,
        utilisateurId: r.userId,
        titre: r.titre,
        templateId: r.templateId,
        langue: r.langue,
        entreprise: r.entreprise,
        poste: r.poste,
        destinataire: r.destinataire,
        objet: r.objet,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      };
    });
  },
  async getLetterById(id) {
    if (isSqlAvailable()) {
      try {
        const docRes = await db.select().from(documents).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(documents.id, id), (0, import_drizzle_orm.eq)(documents.type, "COVER_LETTER")));
        if (docRes && docRes[0]) {
          const d = docRes[0];
          const contentObj = typeof d.content === "object" && d.content ? d.content : {};
          return {
            ...contentObj,
            id: d.id,
            userId: d.userId,
            utilisateurId: d.userId,
            cvId: d.cvId,
            titre: d.titre,
            templateId: d.templateId,
            langue: d.langue,
            entreprise: d.entreprise,
            poste: d.poste,
            destinataire: d.destinataire,
            objet: d.objet,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
          };
        }
        const results = await db.select().from(coverLetters).where((0, import_drizzle_orm.eq)(coverLetters.id, id));
        return results[0] || null;
      } catch (err) {
        console.warn("PostgreSQL query letter failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    const docRow = sqlite.prepare("SELECT * FROM documents WHERE id = ? AND type = 'COVER_LETTER'").get(id);
    if (docRow) {
      let parsed2 = {};
      try {
        parsed2 = JSON.parse(docRow.content);
      } catch (e) {
      }
      return {
        ...parsed2,
        id: docRow.id,
        userId: docRow.userId,
        utilisateurId: docRow.userId,
        cvId: docRow.cvId,
        titre: docRow.titre,
        templateId: docRow.templateId,
        langue: docRow.langue,
        entreprise: docRow.entreprise,
        poste: docRow.poste,
        destinataire: docRow.destinataire,
        objet: docRow.objet,
        createdAt: docRow.createdAt,
        updatedAt: docRow.updatedAt
      };
    }
    const r = sqlite.prepare("SELECT * FROM cover_letters WHERE id = ?").get(id);
    if (!r) return null;
    let parsed = {};
    try {
      parsed = JSON.parse(r.letterData);
    } catch (e) {
    }
    return {
      ...parsed,
      id: r.id,
      userId: r.userId,
      utilisateurId: r.userId,
      titre: r.titre,
      templateId: r.templateId,
      langue: r.langue,
      entreprise: r.entreprise,
      poste: r.poste,
      destinataire: r.destinataire,
      objet: r.objet,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    };
  },
  async createLetter(data) {
    const newId = data.id || `lettre-${import_crypto.default.randomUUID()}`;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const fullData = {
      ...data.letterData,
      id: newId,
      userId: data.userId,
      utilisateurId: data.userId,
      titre: data.titre,
      templateId: data.templateId || "classique",
      langue: data.langue || "fr",
      updatedAt: nowIso
    };
    const targetCvId = data.letterData?.cvId || data.letterData?.cv_id || null;
    if (isSqlAvailable()) {
      try {
        await this.ensureUserInPostgres(data.userId);
        let validCvId = null;
        if (targetCvId) {
          const cvCheck = await db.select({ id: documents.id }).from(documents).where((0, import_drizzle_orm.eq)(documents.id, targetCvId));
          if (cvCheck && cvCheck.length > 0) {
            validCvId = targetCvId;
          }
        }
        await db.insert(documents).values({
          id: newId,
          userId: data.userId,
          type: "COVER_LETTER",
          cvId: validCvId,
          titre: data.titre,
          templateId: data.templateId || "classique",
          langue: data.langue || "fr",
          content: fullData,
          entreprise: data.letterData?.entreprise || "",
          poste: data.letterData?.poste || "",
          destinataire: data.letterData?.destinataire || "",
          objet: data.letterData?.objet || "",
          statutPaiement: "PAYE",
          isArchived: false,
          isPublic: false,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: documents.id,
          set: {
            titre: data.titre,
            templateId: data.templateId || "classique",
            langue: data.langue || "fr",
            content: fullData,
            entreprise: data.letterData?.entreprise || "",
            poste: data.letterData?.poste || "",
            destinataire: data.letterData?.destinataire || "",
            objet: data.letterData?.objet || "",
            updatedAt: /* @__PURE__ */ new Date()
          }
        });
        await db.insert(coverLetters).values({
          id: newId,
          userId: data.userId,
          titre: data.titre,
          templateId: data.templateId || "classique",
          langue: data.langue || "fr",
          letterData: fullData,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: coverLetters.id,
          set: {
            titre: data.titre,
            templateId: data.templateId || "classique",
            langue: data.langue || "fr",
            letterData: fullData,
            updatedAt: /* @__PURE__ */ new Date()
          }
        });
        return fullData;
      } catch (err) {
        console.warn("PostgreSQL insert Letter failed, using SQLite:", err);
      }
    }
    await this.ensureUserInSqlite(data.userId);
    try {
      const sqlite = getSqliteDb();
      sqlite.prepare(`
        INSERT OR REPLACE INTO documents (id, userId, type, cvId, titre, templateId, langue, content, entreprise, poste, destinataire, objet, statutPaiement, isArchived, isPublic, createdAt, updatedAt)
        VALUES (?, ?, 'COVER_LETTER', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAYE', 0, 0, ?, ?)
      `).run(
        newId,
        data.userId,
        targetCvId,
        data.titre,
        data.templateId || "classique",
        data.langue || "fr",
        JSON.stringify(fullData),
        data.letterData?.entreprise || "",
        data.letterData?.poste || "",
        data.letterData?.destinataire || "",
        data.letterData?.objet || "",
        nowIso,
        nowIso
      );
      sqlite.prepare(`
        INSERT OR REPLACE INTO cover_letters (id, userId, cvId, titre, templateId, langue, entreprise, poste, destinataire, objet, letterData, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId,
        data.userId,
        targetCvId,
        data.titre,
        data.templateId || "classique",
        data.langue || "fr",
        data.letterData?.entreprise || "",
        data.letterData?.poste || "",
        data.letterData?.destinataire || "",
        data.letterData?.objet || "",
        JSON.stringify(fullData),
        nowIso,
        nowIso
      );
    } catch (sqliteErr) {
      console.warn("SQLite saveLetter warning:", sqliteErr);
    }
    return fullData;
  },
  async updateLetterWhitelisted(id, userId, allowedUpdates) {
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const existing = await this.getLetterById(id);
    if (!existing) return null;
    const mergedData = {
      ...existing,
      ...allowedUpdates.letterData || allowedUpdates,
      id,
      userId,
      utilisateurId: userId,
      updatedAt: nowIso
    };
    const newTitre = allowedUpdates.titre || mergedData.titre || existing.titre || "Lettre de motivation";
    const newTemplateId = allowedUpdates.templateId || mergedData.templateId || existing.templateId || "classique";
    const newLangue = allowedUpdates.langue || mergedData.langue || existing.langue || "fr";
    if (isSqlAvailable()) {
      try {
        await this.ensureUserInPostgres(userId);
        await db.update(documents).set({
          titre: newTitre,
          templateId: newTemplateId,
          langue: newLangue,
          entreprise: mergedData.entreprise || "",
          poste: mergedData.poste || "",
          destinataire: mergedData.destinataire || "",
          objet: mergedData.objet || "",
          content: mergedData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(documents.id, id), (0, import_drizzle_orm.eq)(documents.userId, userId)));
        await db.update(coverLetters).set({
          titre: newTitre,
          templateId: newTemplateId,
          langue: newLangue,
          letterData: mergedData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(coverLetters.id, id), (0, import_drizzle_orm.eq)(coverLetters.userId, userId)));
        return mergedData;
      } catch (err) {
        console.warn("PostgreSQL update Letter failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    sqlite.prepare(`
      UPDATE documents SET titre = ?, templateId = ?, langue = ?, content = ?, entreprise = ?, poste = ?, destinataire = ?, objet = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `).run(
      newTitre,
      newTemplateId,
      newLangue,
      JSON.stringify(mergedData),
      mergedData.entreprise || "",
      mergedData.poste || "",
      mergedData.destinataire || "",
      mergedData.objet || "",
      nowIso,
      id,
      userId
    );
    sqlite.prepare(`
      UPDATE cover_letters SET titre = ?, templateId = ?, langue = ?, entreprise = ?, poste = ?, destinataire = ?, objet = ?, letterData = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `).run(
      newTitre,
      newTemplateId,
      newLangue,
      mergedData.entreprise || "",
      mergedData.poste || "",
      mergedData.destinataire || "",
      mergedData.objet || "",
      JSON.stringify(mergedData),
      nowIso,
      id,
      userId
    );
    return mergedData;
  },
  async deleteLetter(id, userId) {
    if (isSqlAvailable()) {
      try {
        await db.delete(documents).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(documents.id, id), (0, import_drizzle_orm.eq)(documents.userId, userId)));
        await db.delete(coverLetters).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(coverLetters.id, id), (0, import_drizzle_orm.eq)(coverLetters.userId, userId)));
        return true;
      } catch (err) {
        console.warn("PostgreSQL delete Letter failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    sqlite.prepare("DELETE FROM documents WHERE id = ? AND userId = ?").run(id, userId);
    const res = sqlite.prepare("DELETE FROM cover_letters WHERE id = ? AND userId = ?").run(id, userId);
    return res.changes > 0;
  },
  // -------------------------------------------------------------------
  // UNIFIED DOCUMENT HELPERS (CVs + Letters)
  // -------------------------------------------------------------------
  async getAllDocumentsByUserId(userId) {
    if (isSqlAvailable()) {
      try {
        const rows = await db.select().from(documents).where((0, import_drizzle_orm.eq)(documents.userId, userId));
        return rows;
      } catch (err) {
        console.warn("PostgreSQL query unified documents failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    return sqlite.prepare("SELECT * FROM documents WHERE userId = ? ORDER BY updatedAt DESC").all(userId);
  },
  // -------------------------------------------------------------------
  // PAYMENTS
  // -------------------------------------------------------------------
  async createPayment(data) {
    const ownerId = data.utilisateurId || data.userId || "u-system";
    const newId = data.id || `pay-${import_crypto.default.randomUUID()}`;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const newPayment = {
      id: newId,
      utilisateurId: ownerId,
      userId: ownerId,
      planTier: data.planTier,
      montant: data.montant,
      devise: data.devise || "FCFA",
      referenceTransaction: data.referenceTransaction,
      provider: data.provider || "ikeepay",
      providerTransactionId: data.providerTransactionId || null,
      metadata: data.metadata || null,
      statut: data.statut || "EN_ATTENTE",
      valideLe: null,
      createdAt: nowIso,
      updatedAt: nowIso
    };
    await this.ensureUserInPostgres(ownerId);
    await this.ensureUserInSqlite(ownerId, {
      email: data.metadata?.userEmail,
      nom: data.metadata?.userName
    });
    if (isSqlAvailable()) {
      try {
        await db.insert(payments).values({
          id: newId,
          utilisateurId: ownerId,
          planTier: data.planTier,
          montant: data.montant,
          devise: data.devise || "FCFA",
          referenceTransaction: data.referenceTransaction,
          provider: data.provider || "ikeepay",
          providerTransactionId: data.providerTransactionId || null,
          metadata: data.metadata || null,
          statut: data.statut || "EN_ATTENTE",
          valideLe: null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).onConflictDoNothing();
      } catch (err) {
        console.warn("PostgreSQL insert payment failed, using SQLite:", err);
      }
    }
    try {
      const sqlite = getSqliteDb();
      sqlite.prepare(`
        INSERT INTO payments (id, userId, planTier, montant, devise, referenceTransaction, statut, methodePaiement, datePaiement, metaData)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newPayment.id,
        ownerId,
        newPayment.planTier,
        newPayment.montant,
        newPayment.devise,
        newPayment.referenceTransaction,
        newPayment.statut,
        newPayment.provider,
        nowIso,
        newPayment.metadata ? JSON.stringify(newPayment.metadata) : null
      );
    } catch (sqliteErr) {
      console.warn("SQLite payment insert warning:", sqliteErr);
    }
    return newPayment;
  },
  async getPaymentById(id) {
    if (isSqlAvailable()) {
      try {
        const results = await db.select().from(payments).where((0, import_drizzle_orm.eq)(payments.id, id));
        if (results && results[0]) {
          const r = results[0];
          return {
            ...r,
            userId: r.utilisateurId,
            utilisateurId: r.utilisateurId,
            methodePaiement: r.provider,
            provider: r.provider,
            metaData: r.metadata ? JSON.stringify(r.metadata) : null,
            metadata: r.metadata
          };
        }
      } catch (err) {
        console.warn("PostgreSQL getPaymentById fallback to SQLite:", err);
      }
    }
    try {
      const sqlite = getSqliteDb();
      const row = sqlite.prepare("SELECT * FROM payments WHERE id = ?").get(id);
      if (!row) return null;
      return {
        ...row,
        utilisateurId: row.userId,
        provider: row.methodePaiement,
        metadata: row.metaData ? JSON.parse(row.metaData) : null
      };
    } catch (err) {
      console.warn("SQLite getPaymentById error:", err);
      return null;
    }
  },
  async findPaymentByRef(reference, userId) {
    if (isSqlAvailable()) {
      try {
        const results = await db.select().from(payments).where((0, import_drizzle_orm.eq)(payments.referenceTransaction, reference));
        if (results && results[0]) {
          const r = results[0];
          if (userId && r.utilisateurId !== userId) return null;
          return {
            ...r,
            userId: r.utilisateurId,
            utilisateurId: r.utilisateurId,
            methodePaiement: r.provider,
            provider: r.provider,
            metaData: r.metadata ? JSON.stringify(r.metadata) : null,
            metadata: r.metadata
          };
        }
      } catch (err) {
        console.warn("PostgreSQL findPaymentByRef fallback to SQLite:", err);
      }
    }
    try {
      const sqlite = getSqliteDb();
      const row = sqlite.prepare("SELECT * FROM payments WHERE referenceTransaction = ? OR id = ?").get(reference, `pay-${reference}`);
      if (!row) return null;
      if (userId && row.userId !== userId) return null;
      return {
        ...row,
        utilisateurId: row.userId,
        provider: row.methodePaiement,
        metadata: row.metaData ? JSON.parse(row.metaData) : null
      };
    } catch (err) {
      console.warn("SQLite findPaymentByRef error:", err);
      return null;
    }
  },
  async updatePaymentStatus(id, statut, noteOrDate) {
    const validDate = noteOrDate instanceof Date ? noteOrDate : /* @__PURE__ */ new Date();
    const noteAdmin = typeof noteOrDate === "string" ? noteOrDate : void 0;
    if (isSqlAvailable()) {
      try {
        await db.update(payments).set({
          statut,
          valideLe: validDate,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm.eq)(payments.id, id));
      } catch (err) {
        console.warn("PostgreSQL update payment failed, using SQLite:", err);
      }
    }
    try {
      const sqlite = getSqliteDb();
      if (noteAdmin) {
        sqlite.prepare(`
          UPDATE payments SET statut = ?, datePaiement = ?, metaData = json_set(COALESCE(metaData, '{}'), '$.noteAdmin', ?) WHERE id = ?
        `).run(statut, validDate.toISOString(), noteAdmin, id);
      } else {
        sqlite.prepare(`
          UPDATE payments SET statut = ?, datePaiement = ? WHERE id = ?
        `).run(statut, validDate.toISOString(), id);
      }
    } catch (sqliteErr) {
      console.warn("SQLite updatePaymentStatus warning:", sqliteErr);
    }
  },
  async claimAndValidatePayment(id) {
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    let pgClaimed = false;
    let sqliteClaimed = false;
    if (isSqlAvailable()) {
      try {
        const updateRes = await db.update(payments).set({
          statut: "VALIDE",
          valideLe: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(payments.id, id), (0, import_drizzle_orm.eq)(payments.statut, "EN_ATTENTE"))).returning({ id: payments.id });
        if (updateRes && updateRes.length > 0) pgClaimed = true;
      } catch (err) {
        console.warn("PostgreSQL claim payment failed:", err);
      }
    }
    try {
      const sqlite = getSqliteDb();
      const info = sqlite.prepare(`
        UPDATE payments SET statut = 'VALIDE', datePaiement = ? WHERE id = ? AND statut = 'EN_ATTENTE'
      `).run(nowIso, id);
      if (info && info.changes > 0) sqliteClaimed = true;
    } catch (sqliteErr) {
      console.warn("SQLite claim payment warning:", sqliteErr);
    }
    return pgClaimed || sqliteClaimed;
  },
  async createSubscriptionRecord(data) {
    const id = `sub-${import_crypto.default.randomUUID()}`;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    await this.ensureUserInPostgres(data.userId);
    await this.ensureUserInSqlite(data.userId);
    if (isSqlAvailable()) {
      try {
        await db.insert(subscriptions).values({
          id,
          userId: data.userId,
          paymentId: data.paymentId || null,
          planTier: data.planTier,
          startsAt: new Date(data.startsAt),
          expiresAt: new Date(data.expiresAt),
          statut: "ACTIF",
          createdAt: /* @__PURE__ */ new Date()
        });
      } catch (err) {
        console.warn("PostgreSQL insert subscription failed:", err);
      }
    }
    try {
      const sqlite = getSqliteDb();
      sqlite.prepare(`
        INSERT INTO subscriptions (id, userId, paymentId, planTier, startsAt, expiresAt, statut, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, data.userId, data.paymentId || null, data.planTier, data.startsAt, data.expiresAt, "ACTIF", nowIso);
    } catch (sqliteErr) {
      console.warn("SQLite insert subscription warning:", sqliteErr);
    }
    return { id, ...data, statut: "ACTIF", createdAt: nowIso };
  },
  async getUserSubscriptions(userId) {
    const sqlite = getSqliteDb();
    const rows = sqlite.prepare("SELECT * FROM subscriptions WHERE userId = ? ORDER BY createdAt DESC").all(userId);
    return rows;
  },
  async getAllPayments() {
    if (isSqlAvailable()) {
      try {
        const results = await db.select().from(payments);
        if (results && results.length > 0) {
          return results.reverse().map((r) => ({
            ...r,
            userId: r.utilisateurId,
            utilisateurId: r.utilisateurId,
            methodePaiement: r.provider,
            provider: r.provider,
            datePaiement: r.valideLe ? r.valideLe.toISOString() : r.createdAt ? r.createdAt.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
            metaData: r.metadata ? JSON.stringify(r.metadata) : null,
            metadata: r.metadata
          }));
        }
      } catch (err) {
        console.warn("PostgreSQL getAllPayments fallback to SQLite:", err);
      }
    }
    try {
      const sqlite = getSqliteDb();
      const rows = sqlite.prepare("SELECT * FROM payments ORDER BY datePaiement DESC").all();
      return rows.map((r) => ({
        ...r,
        utilisateurId: r.userId,
        provider: r.methodePaiement,
        metadata: r.metaData ? JSON.parse(r.metaData) : null
      }));
    } catch (err) {
      console.warn("SQLite getAllPayments error:", err);
      return [];
    }
  },
  // -------------------------------------------------------------------
  // APP SETTINGS
  // -------------------------------------------------------------------
  async getAppSettings() {
    if (isSqlAvailable()) {
      try {
        const rows = await db.select().from(appSettings).where((0, import_drizzle_orm.eq)(appSettings.id, "global_config"));
        if (rows && rows.length > 0 && rows[0].adminPaidMatrix) {
          return rows[0].adminPaidMatrix;
        }
      } catch (err) {
        console.warn("PostgreSQL getAppSettings query failed, using SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    const row = sqlite.prepare("SELECT value FROM app_settings WHERE key = ?").get("global_config");
    if (!row) return {};
    try {
      return JSON.parse(row.value);
    } catch (e) {
      return {};
    }
  },
  async updateAppSettings(updates) {
    const current = await this.getAppSettings();
    const merged = { ...current, ...updates };
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    if (isSqlAvailable()) {
      try {
        await db.insert(appSettings).values({
          id: "global_config",
          adminPaidMatrix: merged,
          updatedAt: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: appSettings.id,
          set: {
            adminPaidMatrix: merged,
            updatedAt: /* @__PURE__ */ new Date()
          }
        });
      } catch (err) {
        console.warn("PostgreSQL updateAppSettings failed:", err);
      }
    }
    const sqlite = getSqliteDb();
    sqlite.prepare(`
      INSERT OR REPLACE INTO app_settings (key, value, updatedAt) VALUES (?, ?, ?)
    `).run("global_config", JSON.stringify(merged), nowIso);
    return merged;
  },
  // -------------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------------
  async createNotification(data) {
    const newId = data.id || `notif-${Date.now()}-${import_crypto.default.randomBytes(4).toString("hex")}`;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const newNotif = {
      id: newId,
      titre: data.titre,
      message: data.message,
      type: data.type || "SYSTEM",
      cible: data.cible || "TOUS",
      lien: data.lien || "",
      badge: data.badge || "",
      envoyeParEmail: Boolean(data.envoyeParEmail),
      nombreEmailsEnvoyes: data.nombreEmailsEnvoyes || 0,
      luPar: [],
      dateCreation: nowIso,
      auteur: data.auteur || "Administrateur"
    };
    const sqlite = getSqliteDb();
    sqlite.prepare(`
      INSERT INTO notifications (id, userId, title, message, type, isRead, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(newId, data.cible || "TOUS", data.titre, JSON.stringify(newNotif), data.type || "info", 0, nowIso);
    return newNotif;
  },
  async getAllNotifications() {
    const sqlite = getSqliteDb();
    const rows = sqlite.prepare("SELECT message FROM notifications ORDER BY createdAt DESC").all();
    return rows.map((r) => {
      try {
        return JSON.parse(r.message);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  },
  async getNotificationsForUser(userId, userTier = "freemium") {
    const all = await this.getAllNotifications();
    return all.filter((n) => {
      if (!n.cible || n.cible === "TOUS") return true;
      if (n.cible === userTier) return true;
      return false;
    }).map((n) => ({
      ...n,
      isRead: Array.isArray(n.luPar) && n.luPar.includes(userId)
    }));
  },
  async markNotificationRead(notificationId, userId) {
    const sqlite = getSqliteDb();
    const row = sqlite.prepare("SELECT message FROM notifications WHERE id = ?").get(notificationId);
    if (!row) return false;
    try {
      const notif = JSON.parse(row.message);
      if (!Array.isArray(notif.luPar)) notif.luPar = [];
      if (!notif.luPar.includes(userId)) {
        notif.luPar.push(userId);
        sqlite.prepare("UPDATE notifications SET message = ? WHERE id = ?").run(JSON.stringify(notif), notificationId);
      }
      return true;
    } catch (e) {
      return false;
    }
  },
  async markAllNotificationsRead(userId) {
    const all = await this.getAllNotifications();
    const sqlite = getSqliteDb();
    for (const notif of all) {
      if (!Array.isArray(notif.luPar)) notif.luPar = [];
      if (!notif.luPar.includes(userId)) {
        notif.luPar.push(userId);
        sqlite.prepare("UPDATE notifications SET message = ? WHERE id = ?").run(JSON.stringify(notif), notif.id);
      }
    }
    return true;
  },
  async deleteNotification(notificationId) {
    const sqlite = getSqliteDb();
    const res = sqlite.prepare("DELETE FROM notifications WHERE id = ?").run(notificationId);
    return res.changes > 0;
  },
  // -------------------------------------------------------------------
  // PASSWORD RESETS
  // -------------------------------------------------------------------
  async savePasswordResetToken(email, token, expiresAt) {
    const normalizedEmail = email.toLowerCase().trim();
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const expiresAtIso = expiresAt.toISOString();
    if (isSqlAvailable()) {
      try {
        await db.insert(passwordResets).values({
          email: normalizedEmail,
          token,
          expiresAt,
          createdAt: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: passwordResets.email,
          set: {
            token,
            expiresAt,
            createdAt: /* @__PURE__ */ new Date()
          }
        });
      } catch (err) {
        console.warn("PostgreSQL save password reset token failed, fallback to SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    sqlite.prepare(`
      INSERT OR REPLACE INTO password_resets (email, token, expiresAt, createdAt)
      VALUES (?, ?, ?, ?)
    `).run(normalizedEmail, token, expiresAtIso, nowIso);
    return { email: normalizedEmail, token, expiresAt: expiresAtIso };
  },
  async findPasswordResetToken(token) {
    if (isSqlAvailable()) {
      try {
        const results = await db.select().from(passwordResets).where((0, import_drizzle_orm.eq)(passwordResets.token, token));
        if (results[0]) {
          return {
            email: results[0].email,
            token: results[0].token,
            expiresAt: results[0].expiresAt instanceof Date ? results[0].expiresAt.toISOString() : String(results[0].expiresAt)
          };
        }
      } catch (err) {
        console.warn("PostgreSQL find reset token failed, fallback to SQLite:", err);
      }
    }
    const sqlite = getSqliteDb();
    const row = sqlite.prepare("SELECT * FROM password_resets WHERE token = ?").get(token);
    if (!row) return null;
    return {
      email: row.email,
      token: row.token,
      expiresAt: row.expiresAt
    };
  },
  async deletePasswordResetToken(email) {
    const normalizedEmail = email.toLowerCase().trim();
    if (isSqlAvailable()) {
      try {
        await db.delete(passwordResets).where((0, import_drizzle_orm.eq)(passwordResets.email, normalizedEmail));
      } catch (err) {
        console.warn("PostgreSQL delete reset token failed:", err);
      }
    }
    const sqlite = getSqliteDb();
    sqlite.prepare("DELETE FROM password_resets WHERE email = ?").run(normalizedEmail);
    return true;
  }
};

// src/lib/firebase-admin.ts
var import_app = require("firebase-admin/app");
var import_auth = require("firebase-admin/auth");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "flowing-spark-cnzsc",
  appId: "1:761181219557:web:a48ebfe99850456f31c20c",
  apiKey: "AIzaSyBh2BD2saumrM4U6WKsEkXNfe2N08MNfsE",
  authDomain: "flowing-spark-cnzsc.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-cvbuilder-f3657bc6-7a65-4076-9e4d-86daf3213566",
  storageBucket: "flowing-spark-cnzsc.firebasestorage.app",
  messagingSenderId: "761181219557",
  measurementId: "",
  oAuthClientId: "761181219557-h1ttvmbg2op5ostvnkce1tpgo6kpmv54.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// src/lib/firebase-admin.ts
if (!(0, import_app.getApps)().length) {
  (0, import_app.initializeApp)({
    projectId: firebase_applet_config_default.projectId
  });
}
var adminAuth = (0, import_auth.getAuth)();

// src/utils/capitalization.ts
var PROPER_NOUNS_MAP = {
  // Companies & Brands
  google: "Google",
  microsoft: "Microsoft",
  amazon: "Amazon",
  apple: "Apple",
  facebook: "Facebook",
  meta: "Meta",
  linkedin: "LinkedIn",
  github: "GitHub",
  gitlab: "GitLab",
  twitter: "Twitter",
  uber: "Uber",
  airbnb: "Airbnb",
  netflix: "Netflix",
  spotify: "Spotify",
  stripe: "Stripe",
  oracle: "Oracle",
  ibm: "IBM",
  salesforce: "Salesforce",
  adobe: "Adobe",
  cisco: "Cisco",
  intel: "Intel",
  sap: "SAP",
  samsung: "Samsung",
  orange: "Orange",
  mtn: "MTN",
  moov: "Moov",
  airtel: "Airtel",
  totalenergies: "TotalEnergies",
  total: "Total",
  renault: "Renault",
  peugeot: "Peugeot",
  airbus: "Airbus",
  bnp: "BNP Paribas",
  societegenerale: "Soci\xE9t\xE9 G\xE9n\xE9rale",
  capgemini: "Capgemini",
  atos: "Atos",
  soprasteria: "Sopra Steria",
  wave: "Wave",
  // Tech Stack & Languages
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  react: "React.js",
  "react.js": "React.js",
  reactjs: "React.js",
  nextjs: "Next.js",
  "next.js": "Next.js",
  vue: "Vue.js",
  "vue.js": "Vue.js",
  angular: "Angular",
  node: "Node.js",
  "node.js": "Node.js",
  nodejs: "Node.js",
  express: "Express.js",
  docker: "Docker",
  kubernetes: "Kubernetes",
  aws: "AWS",
  azure: "Azure",
  gcp: "Google Cloud Platform",
  sql: "SQL",
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  mongodb: "MongoDB",
  redis: "Redis",
  git: "Git",
  graphql: "GraphQL",
  rest: "REST API",
  html: "HTML5",
  css: "CSS3",
  tailwind: "Tailwind CSS",
  tailwindcss: "Tailwind CSS",
  bootstrap: "Bootstrap",
  figma: "Figma",
  photoshop: "Photoshop",
  jira: "Jira",
  confluence: "Confluence",
  // Cities
  paris: "Paris",
  lyon: "Lyon",
  marseille: "Marseille",
  bordeaux: "Bordeaux",
  toulouse: "Toulouse",
  nantes: "Nantes",
  lille: "Lille",
  douala: "Douala",
  yaounde: "Yaound\xE9",
  abidjan: "Abidjan",
  dakar: "Dakar",
  casablanca: "Casablanca",
  tunis: "Tunis",
  alger: "Alger",
  kinshasa: "Kinshasa",
  brazzaville: "Brazzaville",
  libreville: "Libreville",
  lom\u00E9: "Lom\xE9",
  cotonou: "Cotonou",
  bamako: "Bamako",
  niamey: "Niamey",
  ouagadougou: "Ouagadougou",
  montreal: "Montr\xE9al",
  quebec: "Qu\xE9bec",
  brussels: "Bruxelles",
  bruxelles: "Bruxelles",
  geneve: "Gen\xE8ve",
  geneva: "Gen\xE8ve",
  london: "Londres",
  londres: "Londres",
  newyork: "New York",
  "new york": "New York"
};
function autoFixCapitalization(input) {
  if (input === null || input === void 0) {
    return input;
  }
  if (typeof input === "string") {
    const strInput = input;
    if (!strInput.trim()) return input;
    if (strInput.startsWith("#") || strInput.startsWith("http://") || strInput.startsWith("https://") || strInput.includes("@") || /^[0-9a-fA-F-]{8,}$/.test(strInput)) {
      return input;
    }
    let cleaned = strInput;
    Object.keys(PROPER_NOUNS_MAP).forEach((key) => {
      const target = PROPER_NOUNS_MAP[key];
      const regex = new RegExp(`\\b${key}\\b`, "gi");
      cleaned = cleaned.replace(regex, target);
    });
    cleaned = cleaned.replace(/(?:^|[.!?]\s+|\n+)([a-zà-ÿ])/g, (match) => {
      return match.toUpperCase();
    });
    return cleaned;
  }
  if (Array.isArray(input)) {
    return input.map((item) => autoFixCapitalization(item));
  }
  if (typeof input === "object") {
    const result = {};
    const skipKeys = [
      "id",
      "type",
      "icon",
      "url",
      "email",
      "phone",
      "telephone",
      "couleurAccent",
      "couleurAccentSecondaire",
      "couleurTitreSection",
      "primaryColor",
      "secondaryColor",
      "headingColor",
      "backgroundColor",
      "misAJourLe",
      "creeLe",
      "createdAt",
      "updatedAt"
    ];
    for (const key of Object.keys(input)) {
      const val = input[key];
      if (skipKeys.includes(key)) {
        result[key] = val;
      } else {
        result[key] = autoFixCapitalization(val);
      }
    }
    return result;
  }
  return input;
}

// src/utils/dynamicCoverLetterEngine.ts
function buildGeminiCoverLetterPrompt(input, candidateName, candidateTitle) {
  const { cv, langue = "fr", entreprise = "", poste = "", ton = "professionnel", pointsCles = "" } = input;
  const langLabel = langue === "en" ? "Anglais (English)" : langue === "ar" ? "Arabe (Arabic)" : "Fran\xE7ais";
  const targetCompany = autoFixCapitalization(entreprise.trim() || "Entreprise Cible");
  const targetPost = autoFixCapitalization(poste.trim() || candidateTitle || "Professionnel Rapprocheur");
  const expSection = cv?.sections?.find((s) => s.type === "experience");
  const skillsSection = cv?.sections?.find((s) => s.type === "competences" || s.type === "skills");
  const eduSection = cv?.sections?.find((s) => s.type === "formation" || s.type === "education");
  const expSummary = Array.isArray(expSection?.contenu) ? expSection.contenu.slice(0, 3).map((e) => `${e.poste || e.titre} chez ${e.entreprise || e.employeur || ""} (${e.periode || e.date || ""}): ${e.description || e.realisations || ""}`).join("; ") : "Exp\xE9rience significative dans le secteur.";
  const skillsSummary = Array.isArray(skillsSection?.contenu) ? skillsSection.contenu.map((s) => typeof s === "string" ? s : s.nom || s.title || "").filter(Boolean).slice(0, 8).join(", ") : "Comp\xE9tences techniques et relationnelles solides.";
  const eduSummary = Array.isArray(eduSection?.contenu) ? eduSection.contenu.slice(0, 2).map((e) => `${e.diplome || e.titre} \xE0 ${e.etablissement || e.ecole || ""}`).join("; ") : "Formation acad\xE9mique.";
  return `Tu es un expert ex\xE9cutif en recrutement RH et r\xE9daction de lettres de motivation de haut niveau.
R\xE9dige une lettre de motivation AUTHENTIQUE, PERSUASIVE, HUMAINE et PERCUTANTE en ${langLabel}.

INFORMATIONS CANDIDAT:
- Nom: ${autoFixCapitalization(candidateName)}
- Titre / Poste actuel: ${autoFixCapitalization(candidateTitle)}
- Exp\xE9riences et r\xE9alisations cl\xE9s: ${expSummary}
- Comp\xE9tences prouv\xE9es: ${skillsSummary}
- Formation: ${eduSummary}

INFORMATIONS CIBLE:
- Entreprise vis\xE9e: ${targetCompany}
- Poste vis\xE9: ${targetPost}
- Tonalit\xE9 souhait\xE9e: ${ton}
- Consignes / points particuliers: ${pointsCles || "Maximiser la pertinence et le style professionnel"}

EXIGENCES ET R\xC8GLES CRUCIALES DE R\xC9DACTION :
1. INTERDICTION DE VOCABULAIRE AI / CLICH\xC9S SAAS : Banis strictement les mots "synergie", "catalyseur", "professionnel chevronn\xE9", "au sein de votre prestigieuse entreprise", "cadre stimulant", "dynamique", "passionn\xE9 par". Adopte un style humain direct, sobre, \xE9l\xE9gant et ax\xE9 sur les faits.
2. \xC9QUILIBRE CANDIDAT / ENTREPRISE : Consacre un paragraphe entier (paragrapheAdequationEntreprise) sp\xE9cifiquement aux enjeux, projets, positionnement ou mission de ${targetCompany}, en montrant pr\xE9cis\xE9ment comment la contribution du candidat r\xE9pond directement \xE0 LEURS besoins actuels.
3. COH\xC9RENCE TECHNIQUE PARFAITE : Toute comp\xE9tence technique mentionn\xE9e dans la lettre doit trouver une justification directe dans les r\xE9alisations concr\xE8tes des exp\xE9riences du candidat.
4. APPEL \xC0 L'ACTION EXPLICITE OBLIGATOIRE (CONCLUSION) : Le dernier paragraphe (paragrapheConclusion) DOIT SE TERMINER PAR UNE DEMANDE ET PROPOSITION D'ENTRETIEN directe et courtoise pour solliciter un \xE9change de vive voix avec le recruteur.
5. CORRECTION DE LA CASSE : Capitalise correctement les noms propres, noms d'entreprises (${targetCompany}), villes et projets (Title Case).

R\xC9PONDS STRICTEMENT EN FORMAT JSON VALIDE respectant exactement ce sch\xE9ma :
{
  "destinataire": "Direction des Ressources Humaines / Responsable du Recrutement",
  "entreprise": "${targetCompany}",
  "poste": "${targetPost}",
  "objet": "Candidature au poste de ${targetPost} - ${autoFixCapitalization(candidateName)}",
  "formulePolitesseEntree": "Madame, Monsieur,",
  "paragrapheAccroche": "Texte de l'accroche directe et fluide",
  "paragrapheValeurAjoutee": "Texte d\xE9montrant la valeur ajout\xE9e avec preuves factuelles",
  "paragrapheAdequationEntreprise": "Texte centr\xE9 sur ${targetCompany}, ses d\xE9fis et l'apport concret pour elle",
  "paragrapheConclusion": "Texte de conclusion se terminant par un appel \xE0 l'action explicite pour un entretien",
  "formulePolitesseSortie": "Je vous prie d'agr\xE9er, Madame, Monsieur, l'expression de mes salutations distingu\xE9es.",
  "texteComplet": "Texte int\xE9gral r\xE9uni"
}`;
}
function generateDynamicFallbackLetter(input, candidateName, candidateTitle) {
  const { cv, langue = "fr", entreprise = "", poste = "", ton = "professionnel", pointsCles = "" } = input;
  const targetCompany = autoFixCapitalization(entreprise.trim() || "votre entreprise");
  const targetPost = autoFixCapitalization(poste.trim() || candidateTitle || "ce poste");
  const name = autoFixCapitalization(candidateName || "Candidat");
  const expSection = cv?.sections?.find((s) => s.type === "experience");
  const skillsSection = cv?.sections?.find((s) => s.type === "competences" || s.type === "skills");
  const experiences = Array.isArray(expSection?.contenu) ? expSection.contenu : [];
  const latestExp = experiences[0] || {};
  const previousRole = autoFixCapitalization(latestExp.poste || latestExp.titre || candidateTitle || "professionnel qualifi\xE9");
  const previousCompany = autoFixCapitalization(latestExp.entreprise || latestExp.employeur || "");
  const skillsList = Array.isArray(skillsSection?.contenu) ? skillsSection.contenu.map((s) => typeof s === "string" ? s : s.nom || s.title || "").filter(Boolean) : [];
  const topSkillsStr = skillsList.length > 0 ? skillsList.slice(0, 4).map((s) => autoFixCapitalization(s)).join(", ") : "gestion de projets, analyse op\xE9rationnelle et r\xE9solution de probl\xE8mes complexes";
  const randIndex = Math.abs((targetCompany.length + targetPost.length + Date.now()) % 3);
  let accroche = "";
  let valeurAjoutee = "";
  let adequation = "";
  let conclusion = "";
  if (langue === "en") {
    const accrochesEn = [
      `I am writing to express my strong interest in the ${targetPost} position at ${targetCompany}. Having served as ${previousRole}${previousCompany ? ` at ${previousCompany}` : ""}, I bring practical expertise directly relevant to your upcoming projects.`,
      `The ${targetPost} role at ${targetCompany} aligns perfectly with my professional background. As a ${previousRole}, I have systematically delivered measurable outcomes in fast-paced environments.`,
      `I am pleased to submit my application for the ${targetPost} opportunity at ${targetCompany}. My solid background in ${topSkillsStr} provides a strong foundation to support your team's key objectives.`
    ];
    const valeursEn = [
      `Throughout my recent engagements, I have focused on achieving high-quality deliverables. Utilizing skills in ${topSkillsStr}, I have streamlined daily operations and led key initiatives to success. ${pointsCles ? `My focus on ${pointsCles} further enhances my operational agility.` : ""}`,
      `My professional path is defined by concrete achievements. In my work as ${previousRole}, I applied key strengths in ${topSkillsStr} to address complex requirements while meeting strict quality standards. ${pointsCles ? `My expertise in ${pointsCles} enables me to adapt quickly.` : ""}`,
      `In my role as ${previousRole}, I consistently translated operational goals into clear action plans. My proficiency in ${topSkillsStr} drives my structured and results-oriented approach.`
    ];
    const adequationsEn = [
      `${targetCompany}'s commitment to quality and strategic development makes it an exceptional organization. I have followed your recent growth, and I am keen to apply my experience directly to solve your current business challenges.`,
      `What specifically draws me to ${targetCompany} is your clear strategic direction. Joining your team as ${targetPost} will allow me to dedicate my expertise to strengthening your project delivery.`,
      `I closely follow ${targetCompany}'s contributions to the sector. I am confident that my technical grounding and methodology will contribute directly to achieving your upcoming targets.`
    ];
    const conclusionsEn = [
      `I would be delighted to meet with you for an interview to discuss how my profile aligns with your expectations and to elaborate on my contributions. Thank you for your time and consideration.`,
      `I welcome the opportunity to discuss my application in detail during an interview. I am available at your convenience to schedule a meeting.`,
      `I look forward to an interview where I can present my background and demonstrate how my skills can immediately benefit ${targetCompany}.`
    ];
    accroche = accrochesEn[randIndex];
    valeurAjoutee = valeursEn[randIndex];
    adequation = adequationsEn[randIndex];
    conclusion = conclusionsEn[randIndex];
    return {
      destinataire: "Hiring Manager / Talent Acquisition",
      entreprise: targetCompany,
      poste: targetPost,
      objet: `Application for ${targetPost} - ${name}`,
      formulePolitesseEntree: "Dear Hiring Manager,",
      paragrapheAccroche: accroche,
      paragrapheValeurAjoutee: valeurAjoutee,
      paragrapheAdequationEntreprise: adequation,
      paragrapheConclusion: conclusion,
      formulePolitesseSortie: "Sincerely,",
      texteComplet: `Dear Hiring Manager,

${accroche}

${valeurAjoutee}

${adequation}

${conclusion}

Sincerely,

${name}`
    };
  }
  const accrochesFr = [
    `C'est avec un vif int\xE9r\xEAt que je vous soumets ma candidature pour le poste de ${targetPost} au sein de ${targetCompany}. Fort(e) de mes r\xE9ussites en tant que ${previousRole}${previousCompany ? ` chez ${previousCompany}` : ""}, j'ai d\xE9velopp\xE9 un savoir-faire op\xE9rationnel directement transf\xE9rable \xE0 vos projets actuels.`,
    `Le poste de ${targetPost} propos\xE9 par ${targetCompany} retient toute mon attention. Mon parcours d'action en tant que ${previousRole} m'a permis d'acqu\xE9rir une ma\xEEtrise solide des enjeux de votre secteur d'activit\xE9.`,
    `Je vous adresse ma candidature pour le poste de ${targetPost} au sein de ${targetCompany}. Mon exp\xE9rience confirm\xE9e dans la mise en \u0153uvre de ${topSkillsStr} me permet d'apporter une contribution rapide et efficace \xE0 vos \xE9quipes.`
  ];
  const valeursFr = [
    `Au cours de mes missions pr\xE9c\xE9dentes, j'ai veill\xE9 \xE0 obtenir des r\xE9sultats concrets et mesurables. Gr\xE2ce \xE0 la pratique r\xE9guli\xE8re de ${topSkillsStr}, j'ai optimis\xE9 les processus existants et garanti le respect rigoureux des objectifs fix\xE9s. ${pointsCles ? `De plus, ma pratique de ${pointsCles} renforce directement ma capacit\xE9 \xE0 g\xE9rer des priorit\xE9s exigeantes.` : ""}`,
    `Mon parcours professionnel repose sur la rigueur op\xE9rationnelle et l'efficacit\xE9 sur le terrain. En mobilisant mes comp\xE9tences en ${topSkillsStr}, j'ai men\xE9 \xE0 bien des projets d'envergure tout en garantissant des standards de qualit\xE9 \xE9lev\xE9s. ${pointsCles ? `Mon orientation vers ${pointsCles} constitue un atout pr\xE9cieux au quotidien.` : ""}`,
    `En tant que ${previousRole}, j'ai d\xE9velopp\xE9 une m\xE9thode de travail m\xE9thodique ax\xE9e sur les objectifs. Ma ma\xEEtrise de ${topSkillsStr} me permet de structurer rapidement les actions n\xE9cessaires pour r\xE9pondre aux exigences strat\xE9giques.`
  ];
  const adequationsFr = [
    `Les projets r\xE9cents et les orientations strat\xE9giques de ${targetCompany} d\xE9montrent un positionnement clair sur le march\xE9. Votre recherche d'excellence correspond parfaitement \xE0 mes m\xE9thodes de travail, et je souhaite mettre mon \xE9nergie au service de vos objectifs.`,
    `Je suis avec attention le d\xE9veloppement de ${targetCompany}. Int\xE9grer vos \xE9quipes en tant que ${targetPost} me donnera l'opportunit\xE9 d'apporter des r\xE9ponses cibl\xE9es aux besoins actuels de votre organisation.`,
    `L'ambition et la rigueur de ${targetCompany} retiennent tout mon int\xE9r\xEAt. Je suis convaincu(e) que la mise en pratique de mes comp\xE9tences techniques apportera une valeur ajout\xE9e directe \xE0 vos projets futurs.`
  ];
  const conclusionsFr = [
    `Je serais tr\xE8s heureux(se) de vous rencontrer lors d'un entretien pour \xE9changer de vive voix sur la fa\xE7on dont mes comp\xE9tences peuvent contribuer au succ\xE8s de vos projets. Je vous remercie pour l'attention port\xE9e \xE0 ma candidature.`,
    `Je me tiens \xE0 votre enti\xE8re disposition pour convenir d'un entretien au cours duquel je pourrai vous exposer plus en d\xE9tail mes motivations et mon exp\xE9rience.`,
    `C'est avec plaisir que je me rendrai disponible pour un entretien afin d'aborder vos attentes pour le poste de ${targetPost} et de vous pr\xE9senter mes r\xE9alisations.`
  ];
  accroche = accrochesFr[randIndex];
  valeurAjoutee = valeursFr[randIndex];
  adequation = adequationsFr[randIndex];
  conclusion = conclusionsFr[randIndex];
  const fullText = `Madame, Monsieur,

${accroche}

${valeurAjoutee}

${adequation}

${conclusion}

Veuillez agr\xE9er, Madame, Monsieur, l'expression de mes salutations distingu\xE9es.

${name}`;
  return {
    destinataire: "Direction des Ressources Humaines / Recrutement",
    entreprise: targetCompany,
    poste: targetPost,
    objet: `Candidature au poste de ${targetPost} - ${name}`,
    formulePolitesseEntree: "Madame, Monsieur,",
    paragrapheAccroche: accroche,
    paragrapheValeurAjoutee: valeurAjoutee,
    paragrapheAdequationEntreprise: adequation,
    paragrapheConclusion: conclusion,
    formulePolitesseSortie: "Veuillez agr\xE9er, Madame, Monsieur, l'expression de mes salutations distingu\xE9es.",
    texteComplet: fullText
  };
}

// src/utils/jobTargetingEngine.ts
function normalizeKey(str) {
  return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, " ").trim();
}
var BRAND_COLORS = {
  google: { primary: "#4285F4", secondary: "#EA4335", name: "Bleu Google" },
  microsoft: { primary: "#0078D4", secondary: "#107C41", name: "Bleu Microsoft" },
  apple: { primary: "#1C1C1E", secondary: "#0071E3", name: "Gris Apple" },
  amazon: { primary: "#FF9900", secondary: "#146EB4", name: "Orange Amazon" },
  meta: { primary: "#0081FB", secondary: "#0064E0", name: "Bleu Meta" },
  facebook: { primary: "#1877F2", secondary: "#0064E0", name: "Bleu Facebook" },
  netflix: { primary: "#E50914", secondary: "#B81D24", name: "Rouge Netflix" },
  spotify: { primary: "#1DB954", secondary: "#191414", name: "Vert Spotify" },
  uber: { primary: "#000000", secondary: "#276EF1", name: "Noir Uber" },
  airbnb: { primary: "#FF5A5F", secondary: "#00A699", name: "Corail Airbnb" },
  salesforce: { primary: "#00A1E0", secondary: "#032D60", name: "Bleu Salesforce" },
  capgemini: { primary: "#0070AD", secondary: "#12ABDB", name: "Bleu Capgemini" },
  bnp: { primary: "#00915A", secondary: "#1E3A8A", name: "Vert BNP Paribas" },
  societe: { primary: "#E2001A", secondary: "#1E293B", name: "Rouge Soci\xE9t\xE9 G\xE9n\xE9rale" },
  total: { primary: "#ED0000", secondary: "#0055A5", name: "Rouge TotalEnergies" },
  orange: { primary: "#FF7900", secondary: "#000000", name: "Orange Orange" },
  loreal: { primary: "#C8A96E", secondary: "#000000", name: "Or L'Or\xE9al" },
  lvmh: { primary: "#1E1E1E", secondary: "#C5A059", name: "Noir & Or LVMH" },
  renault: { primary: "#ECA900", secondary: "#000000", name: "Jaune Renault" },
  airbus: { primary: "#00205B", secondary: "#0085CA", name: "Bleu Airbus" },
  sncf: { primary: "#6E1B73", secondary: "#0088CE", name: "Prune SNCF" },
  engie: { primary: "#00A3E0", secondary: "#002B49", name: "Bleu ENGIE" },
  danone: { primary: "#003399", secondary: "#4A90E2", name: "Bleu Danone" },
  carrefour: { primary: "#00387B", secondary: "#E2001A", name: "Bleu Carrefour" },
  thales: { primary: "#002F6C", secondary: "#E30613", name: "Bleu Thales" },
  michelin: { primary: "#003399", secondary: "#FFD700", name: "Bleu Michelin" },
  sanofi: { primary: "#7A00E6", secondary: "#00D1B2", name: "Violet Sanofi" }
};
function detectOfferBrandColors(entreprise, texte) {
  const normEnt = normalizeKey(entreprise || "");
  const normTxt = normalizeKey(texte || "");
  for (const [brand, colors] of Object.entries(BRAND_COLORS)) {
    if (normEnt.includes(brand) || entreprise && normTxt.slice(0, 300).includes(brand)) {
      return colors;
    }
  }
  const hexMatch = (texte || "").match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
  if (hexMatch) {
    return {
      primary: hexMatch[0],
      secondary: "#2563EB",
      name: `Couleur d\xE9tect\xE9e (${hexMatch[0]})`
    };
  }
  if (normTxt.includes("sante") || normTxt.includes("medical") || normTxt.includes("pharma")) {
    return { primary: "#0D9488", secondary: "#0284C7", name: "Teal Sant\xE9" };
  }
  if (normTxt.includes("finance") || normTxt.includes("banque") || normTxt.includes("assurance")) {
    return { primary: "#1E3A8A", secondary: "#059669", name: "Bleu Marine Finance" };
  }
  if (normTxt.includes("ecologie") || normTxt.includes("environnement") || normTxt.includes("rse")) {
    return { primary: "#15803D", secondary: "#047857", name: "Vert For\xEAt RSE" };
  }
  if (normTxt.includes("luxe") || normTxt.includes("mode") || normTxt.includes("beaute")) {
    return { primary: "#18181B", secondary: "#B45309", name: "Noir & Ambre Luxe" };
  }
  if (normTxt.includes("tech") || normTxt.includes("informatique") || normTxt.includes("developpeur")) {
    return { primary: "#2563EB", secondary: "#7C3AED", name: "Bleu Royal Tech" };
  }
  return { primary: "#1D4ED8", secondary: "#3B82F6", name: "Bleu Cobalt Professionnel" };
}
function generateTargetingSuggestions(params) {
  const { cv, offre = {}, rawText = "", langue = "fr" } = params;
  const combinedText = `${rawText} ${offre.titrePoste || ""} ${offre.description || ""} ${offre.texteComplet || ""}`.trim();
  let detectedTitle = offre.titrePoste || "";
  if (!detectedTitle && combinedText) {
    const lines = combinedText.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.length > 5 && line.length < 70 && !line.includes("http") && !line.includes("@")) {
        detectedTitle = line.replace(/^(poste|offre|recrutement|titre)\s*:\s*/i, "");
        break;
      }
    }
  }
  detectedTitle = autoFixCapitalization(detectedTitle || "Poste Cible");
  let detectedCompany = offre.entreprise || "";
  if (!detectedCompany && combinedText) {
    const compMatch = combinedText.match(/(?:chez|société|entreprise|groupe|cabinet|company)\s+([A-Z][a-zA-Z0-9\s&.-]{2,30})/i);
    if (compMatch) {
      detectedCompany = compMatch[1].trim();
    }
  }
  detectedCompany = autoFixCapitalization(detectedCompany || "Entreprise Cible");
  const brandColors = detectOfferBrandColors(detectedCompany, combinedText);
  const primaryColor = offre.couleurDetectee || brandColors.primary;
  const secondaryColor = offre.couleurSecondaire || brandColors.secondary;
  const candidateSkills = [];
  const compSec = cv?.sections?.find((s) => s.type === "competences");
  if (compSec && Array.isArray(compSec.contenu)) {
    compSec.contenu.forEach((c) => {
      if (c.nom) candidateSkills.push(c.nom);
    });
  }
  const rawKeywords = [
    ...offre.competencesClesRequises || [],
    ...offre.competencesRequises || [],
    ...offre.competencesCles || []
  ];
  if (rawKeywords.length === 0 && combinedText) {
    const commonTerms = [
      "Gestion de projet",
      "Management d'\xE9quipe",
      "Relation client",
      "N\xE9gociation",
      "Communication",
      "Analyse de donn\xE9es",
      "Excel avanc\xE9",
      "Reporting",
      "Agilit\xE9 / Scrum",
      "R\xE9solution de probl\xE8mes",
      "CRM",
      "ERP",
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "SQL",
      "Marketing digital",
      "SEO",
      "Gestion budg\xE9taire",
      "Vente B2B",
      "Prospection commerciale",
      "Service client",
      "Strat\xE9gie"
    ];
    commonTerms.forEach((term) => {
      if (normalizeKey(combinedText).includes(normalizeKey(term))) {
        rawKeywords.push(term);
      }
    });
  }
  const competencesPriorisees = Array.from(new Set(rawKeywords)).map((kw, idx) => {
    const isAlreadyPresent = candidateSkills.some((cs) => normalizeKey(cs) === normalizeKey(kw) || normalizeKey(cs).includes(normalizeKey(kw)));
    const priorite = idx < 3 ? "haute" : idx < 6 ? "moyenne" : "standard";
    return {
      nom: kw,
      priorite,
      dejaPresente: isAlreadyPresent,
      justification: isAlreadyPresent ? "D\xE9j\xE0 valoris\xE9e dans votre profil" : idx < 3 ? "Comp\xE9tence cl\xE9 primordiale pour ce poste" : "Comp\xE9tence technique ou m\xE9thodologique appr\xE9ci\xE9e"
    };
  });
  const profilSec = cv?.sections?.find((s) => s.type === "profil");
  const expSec = cv?.sections?.find((s) => s.type === "experience");
  const candidateDomain = expSec?.contenu?.[0]?.poste || profilSec?.contenu?.titreProfessionnel || detectedTitle;
  const topMatchedSkills = competencesPriorisees.slice(0, 3).map((c) => c.nom).join(", ");
  let resumeSuggere = "";
  if (langue === "en") {
    resumeSuggere = `Results-oriented professional with confirmed expertise in ${candidateDomain}, targeting the ${detectedTitle} position at ${detectedCompany}. Proven track record in executing key projects, driving operational efficiency, and leveraging core competencies in ${topMatchedSkills || "project management and technical excellence"}. Committed to bringing rigor, collaborative energy, and tangible value to ${detectedCompany}.`;
  } else if (langue === "ar") {
    resumeSuggere = `\u0645\u062D\u062A\u0631\u0641 \u062F\u064A\u0646\u0627\u0645\u064A\u0643\u064A \u0648\u0645\u0648\u062C\u0647 \u0646\u062D\u0648 \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u064A\u0633\u062A\u0647\u062F\u0641 \u0645\u0646\u0635\u0628 ${detectedTitle} \u0644\u062F\u0649 ${detectedCompany}. \u064A\u062A\u0645\u062A\u0639 \u0628\u062E\u0628\u0631\u0629 \u0645\u062B\u0628\u062A\u0629 \u0648\u0642\u062F\u0631\u0629 \u0639\u0627\u0644\u064A\u0629 \u0639\u0644\u0649 \u062A\u062D\u0642\u064A\u0642 \u0627\u0644\u0623\u0647\u062F\u0627\u0641 \u0648\u0627\u0644\u062A\u0645\u064A\u0632 \u0627\u0644\u062A\u0634\u063A\u064A\u0644\u064A.`;
  } else {
    resumeSuggere = `Professionnel rigoureux et engag\xE9, fort d'une exp\xE9rience confirm\xE9e dans les domaines li\xE9s \xE0 ${candidateDomain}, je candidate avec d\xE9termination au poste de ${detectedTitle} au sein de ${detectedCompany}. Mon parcours m'a permis de d\xE9velopper une solide ma\xEEtrise op\xE9rationnelle${topMatchedSkills ? ` ax\xE9e notamment sur ${topMatchedSkills}` : ""}, alliant m\xE9thode, esprit d'\xE9quipe et orientation r\xE9sultats. Pleinement mobilis\xE9 pour apporter une valeur ajout\xE9e imm\xE9diate et contribuer activement aux r\xE9ussites strat\xE9giques de vos \xE9quipes.`;
  }
  const suggestionsProfil = {
    titreSuggere: detectedTitle,
    resumeSuggere: autoFixCapitalization(resumeSuggere)
  };
  const suggestionsExperiences = [];
  if (expSec && Array.isArray(expSec.contenu)) {
    expSec.contenu.forEach((exp, index) => {
      const expTitle = exp.poste || "Poste occup\xE9";
      const expEntreprise = exp.entreprise || "Entreprise";
      const origDesc = (exp.description || "").trim();
      const rawLines = origDesc ? origDesc.split("\n").map((l) => l.trim()).filter(Boolean) : [];
      let reformulatedLines = [];
      if (rawLines.length > 0) {
        const cleanedLines = rawLines.map((l) => {
          return l.replace(/^[-•*]\s*/, "").replace(/^\d+[\).]\s*/, "").replace(/^(pilotage et r[ée]alisation des missions cl[ée]s\s*:\s*|ma[îi]trise op[ée]rationnelle et application rigoureuse\s*:\s*|optimisation des processus et obtention de r[ée]sultats concrets\s*:\s*|responsable de\s+|en charge de\s+|charg[ée] de\s+|mission\s*:\s*|t[âa]che\s*:\s*)/i, "").trim();
        }).filter(Boolean);
        const actionVerbs = [
          "Pilotage et ex\xE9cution m\xE9thodique de",
          "Coordination op\xE9rationnelle et suivi rigoureux de",
          "Conception, mise en \u0153uvre et optimisation de",
          "Gestion quotidienne, contr\xF4le qualit\xE9 et fiabilisation de",
          "D\xE9ploiement strat\xE9gique et alignement des livrables pour"
        ];
        reformulatedLines = cleanedLines.map((clean, lIdx) => {
          const verb = actionVerbs[(lIdx + index) % actionVerbs.length];
          if (/^(pilotage|gestion|coordination|conception|d[ée]veloppement|optimisation|suivi|analyse|d[ée]ploiement|supervision|administration|organisation|animation|recrutement|mise en place|r[ée]daction|maintenance)\b/i.test(clean)) {
            return `- ${clean.charAt(0).toUpperCase() + clean.slice(1)}`;
          }
          return `- ${verb} : ${clean}`;
        });
        if (reformulatedLines.length === 1) {
          reformulatedLines.push(`- Respect scrupuleux des normes de qualit\xE9 et garantie de la conformit\xE9 des livrables chez ${expEntreprise}.`);
          reformulatedLines.push(`- Collaboration transversale \xE9troite avec les \xE9quipes et reporting d'activit\xE9 r\xE9gulier.`);
        }
      } else {
        reformulatedLines = [
          `- D\xE9finition et ex\xE9cution autonome des missions cl\xE9s aff\xE9rentes \xE0 la fonction de ${expTitle} au sein de ${expEntreprise}.`,
          `- Coordination m\xE9thodique des livrables et collaboration \xE9troite avec les \xE9quipes pour assurer l'excellence op\xE9rationnelle.`,
          `- Contr\xF4le qualit\xE9 permanent, anticipation des besoins et reporting r\xE9gulier des performances.`
        ];
      }
      suggestionsExperiences.push({
        experienceId: exp.id || `exp-${index}`,
        poste: expTitle,
        entreprise: expEntreprise,
        periode: exp.dateDebut ? `${exp.dateDebut} - ${exp.enPoste ? "Aujourd'hui" : exp.dateFin}` : "",
        descriptionOriginale: origDesc,
        descriptionSuggeree: autoFixCapitalization(reformulatedLines.join("\n")),
        varianteTechnique: autoFixCapitalization(reformulatedLines.join("\n")),
        varianteImpact: autoFixCapitalization(reformulatedLines.join("\n")),
        competencesCiblees: competencesPriorisees.slice(0, 2).map((c) => c.nom),
        conseils: "Missions enti\xE8rement reformul\xE9es avec des verbes d'action pour matcher avec le poste sans rien inventer."
      });
    });
  }
  const missingOfferSkills = competencesPriorisees.filter((c) => !c.dejaPresente);
  const questionsCompetences = [];
  missingOfferSkills.forEach((sk, sIdx) => {
    questionsCompetences.push({
      id: `q_skill_${sIdx}_${normalizeKey(sk.nom).replace(/\s+/g, "_")}`,
      question: `L'offre requiert la comp\xE9tence "${sk.nom}". L'avez-vous d\xE9j\xE0 pratiqu\xE9e ou avez-vous des notions ?`,
      description: `Cliquez pour l'ajouter \xE0 votre CV si vous en avez l'exp\xE9rience, ou ignorez-la si vous ne la poss\xE9dez pas (aucun mensonge).`,
      contexte: sk.nom,
      competenceCiblee: sk.nom
    });
  });
  if (questionsCompetences.length === 0) {
    const topOfferSkills = competencesPriorisees.slice(0, 4).map((c) => c.nom);
    questionsCompetences.push({
      id: "q_tools_general",
      question: `Toutes les comp\xE9tences cl\xE9s requises (${topOfferSkills.join(", ")}) sont d\xE9j\xE0 pr\xE9sentes sur votre CV ! Souhaitez-vous en mettre une en avant ?`,
      description: "Vos comp\xE9tences correspondent parfaitement aux attentes formul\xE9es dans l'annonce.",
      contexte: "Comp\xE9tences cl\xE9s",
      competenceCiblee: ""
    });
  }
  const questionsExperiences = [
    {
      id: "q_achievements",
      question: `Quelle r\xE9alisation ou projet phare de votre parcours illustre le mieux votre capacit\xE9 \xE0 r\xE9ussir en tant que ${detectedTitle} ?`,
      description: "Pr\xE9cisez un chiffre, un livrable ou un r\xE9sultat concret pour enrichir la description de vos exp\xE9riences.",
      contexte: "R\xE9alisations professionnelles"
    }
  ];
  return {
    titrePoste: detectedTitle,
    entreprise: detectedCompany,
    lieu: offre.lieu || "Non sp\xE9cifi\xE9",
    couleurDetectee: primaryColor,
    couleurSecondaire: secondaryColor,
    nomCouleurMarque: brandColors.name,
    suggestionsProfil,
    competencesPriorisees,
    suggestionsExperiences,
    questionsCompetences,
    questionsExperiences,
    competencesClesRequises: rawKeywords
  };
}
function buildAdaptedCvLocally(input) {
  const { cv, offre, reponsesQuestions = {}, langue = "fr" } = input;
  if (!cv) return cv;
  const targetTitle = autoFixCapitalization(
    input.customProfileTitle?.trim() || reponsesQuestions.customProfileTitle?.trim() || offre.titrePoste?.trim() || "Poste Cible"
  );
  const targetCompany = autoFixCapitalization(offre.entreprise?.trim() || "Entreprise Cible");
  const targetColor = input.targetColor || reponsesQuestions.targetColor || offre.couleurDetectee || "#1E40AF";
  const targetSecondary = input.targetSecondaryColor || reponsesQuestions.targetSecondaryColor || offre.couleurSecondaire || "#60A5FA";
  const colorMode = input.colorHarmonizationMode || reponsesQuestions.colorHarmonizationMode || "duo";
  const templateStyleChoice = input.recommendedTemplateStyle || reponsesQuestions.recommendedTemplateStyle;
  let resolvedPrimary = targetColor;
  let resolvedSecondary = targetSecondary;
  if (colorMode === "secondary_dominant") {
    resolvedPrimary = targetSecondary;
    resolvedSecondary = targetColor;
  } else if (colorMode === "primary_dominant") {
    resolvedSecondary = "#F1F5F9";
  }
  const requiredSkills = [
    ...offre.competencesClesRequises || [],
    ...offre.competencesRequises || [],
    ...offre.competencesCles || []
  ].filter(Boolean);
  const confirmedSkillsFromAnswers = [];
  if (Array.isArray(reponsesQuestions.confirmedSkills)) {
    confirmedSkillsFromAnswers.push(...reponsesQuestions.confirmedSkills);
  }
  const extraSkills = [];
  if (Array.isArray(reponsesQuestions.extraSkills)) {
    extraSkills.push(...reponsesQuestions.extraSkills);
  }
  let userExperienceNotes = "";
  let userSkillNotes = "";
  Object.entries(reponsesQuestions).forEach(([key, val]) => {
    if (typeof val === "string" && val.trim()) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes("comp") || lowerKey.includes("outil") || lowerKey.includes("tech") || lowerKey.includes("tool")) {
        userSkillNotes += ` ${val.trim()}`;
      } else if (!lowerKey.includes("customprofile") && !lowerKey.includes("color")) {
        userExperienceNotes += ` ${val.trim()}`;
      }
    }
  });
  const clonedCv = JSON.parse(JSON.stringify(cv));
  const shouldUpdateExisting = Boolean(input.updateExistingCv || reponsesQuestions.updateExistingCv);
  if (!shouldUpdateExisting && !clonedCv.id.startsWith("cv-targeted-")) {
    clonedCv.id = `cv-targeted-${Date.now()}`;
  }
  clonedCv.couleurAccent = resolvedPrimary;
  clonedCv.couleurAccentSecondaire = resolvedSecondary;
  clonedCv.couleurTitreSection = resolvedPrimary;
  clonedCv.couleurHeader1 = resolvedPrimary;
  clonedCv.couleurHeader2 = resolvedSecondary;
  clonedCv.couleurHeader3 = resolvedSecondary;
  clonedCv.couleurHeaderAccent = resolvedSecondary;
  clonedCv.decorBanniereCouleur2 = resolvedSecondary;
  clonedCv.couleurVague1 = resolvedPrimary;
  clonedCv.couleurVague2 = resolvedSecondary;
  clonedCv.couleurVague3 = "#38BDF8";
  clonedCv.couleurFondFooterContact = resolvedPrimary;
  clonedCv.couleurAccentFooterContact = resolvedSecondary;
  clonedCv.couleurFondPiedDePage = resolvedPrimary;
  clonedCv.couleurTextePiedDePage = "#FFFFFF";
  if (colorMode === "duo") {
    clonedCv.couleurSousTitrePrincipal = resolvedSecondary;
    clonedCv.styleCompetences = "badges-multicolor";
  }
  if (templateStyleChoice) {
    clonedCv.styleEnTete = templateStyleChoice;
    if (templateStyleChoice === "baxter-diagonal") {
      clonedCv.formeSidebarDecor = "diagonal-cut";
      clonedCv.couleurFondProfil = "#FFFFFF";
    } else if (templateStyleChoice === "modern-split") {
      clonedCv.couleurFondProfil = "transparent";
    } else if (templateStyleChoice === "ocean-wave") {
      clonedCv.formeSidebarDecor = "wave-cut";
      clonedCv.couleurFondProfil = resolvedPrimary;
    } else if (templateStyleChoice === "sylvie-wave") {
      clonedCv.couleurFondProfil = resolvedPrimary;
    }
  }
  clonedCv.theme = {
    ...clonedCv.theme || {},
    primaryColor: resolvedPrimary,
    secondaryColor: resolvedSecondary,
    headingColor: resolvedPrimary,
    headerBackgroundColor: clonedCv.couleurFondProfil || resolvedPrimary,
    badgeColor: resolvedPrimary
  };
  clonedCv.jobTargetTitle = targetTitle;
  clonedCv.jobTargetCompany = targetCompany;
  clonedCv.isModified = true;
  clonedCv.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  const sections = Array.isArray(clonedCv.sections) ? [...clonedCv.sections] : [];
  let profilSec = sections.find((s) => s.type === "profil");
  if (!profilSec) {
    profilSec = {
      id: `sec-profil-${Date.now()}`,
      type: "profil",
      titre: "Profil Professionnel",
      ordre: 1,
      visible: true,
      contenu: {
        nomComplet: clonedCv.nomComplet || "",
        titreProfessionnel: targetTitle,
        resume: ""
      }
    };
    sections.unshift(profilSec);
  }
  profilSec.visible = true;
  if (!profilSec.contenu) {
    profilSec.contenu = {};
  }
  profilSec.contenu.titreProfessionnel = targetTitle;
  const localSuggestions = generateTargetingSuggestions({ cv, offre, rawText: "", langue: langue || "fr" });
  const userCustomResume = (input.customProfileResume || reponsesQuestions.customProfileResume || "").trim();
  if (userCustomResume) {
    profilSec.contenu.resume = autoFixCapitalization(userCustomResume);
  } else {
    profilSec.contenu.resume = autoFixCapitalization(localSuggestions.suggestionsProfil.resumeSuggere);
  }
  const compSec = sections.find((s) => s.type === "competences");
  if (compSec && Array.isArray(compSec.contenu)) {
    const existingList = [...compSec.contenu];
    const cvSkillsMatchingOffer = [];
    const cvOtherSkills = [];
    existingList.forEach((item) => {
      const itemNorm = normalizeKey(item.nom || "");
      const matchesOffer = requiredSkills.some((req) => {
        const reqNorm = normalizeKey(req);
        return itemNorm.includes(reqNorm) || reqNorm.includes(itemNorm);
      });
      if (matchesOffer) {
        const isConfirmedByUser = confirmedSkillsFromAnswers.some(
          (s) => normalizeKey(s) === itemNorm || itemNorm.includes(normalizeKey(s)) || normalizeKey(s).includes(itemNorm)
        );
        if (isConfirmedByUser) {
          cvSkillsMatchingOffer.push(item);
        } else {
          cvOtherSkills.push(item);
        }
      } else {
        cvOtherSkills.push(item);
      }
    });
    cvSkillsMatchingOffer.sort((a, b) => {
      const idxA = requiredSkills.findIndex((r) => normalizeKey(r).includes(normalizeKey(a.nom)) || normalizeKey(a.nom).includes(normalizeKey(r)));
      const idxB = requiredSkills.findIndex((r) => normalizeKey(r).includes(normalizeKey(b.nom)) || normalizeKey(b.nom).includes(normalizeKey(r)));
      return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
    });
    const newlyConfirmedSkills = [];
    confirmedSkillsFromAnswers.forEach((confSkill, cIdx) => {
      const alreadyInCv = existingList.some((s) => normalizeKey(s.nom) === normalizeKey(confSkill));
      if (!alreadyInCv && confSkill.trim()) {
        newlyConfirmedSkills.push({
          id: `comp-conf-${Date.now()}-${cIdx}`,
          nom: autoFixCapitalization(confSkill.trim()),
          niveau: cv?.afficherNiveauCompetence ? 4 : void 0,
          categorie: "Comp\xE9tence cl\xE9 requise"
        });
      }
    });
    const extraSkillItems = [];
    extraSkills.forEach((extra, eIdx) => {
      const alreadyInCv = existingList.some((s) => normalizeKey(s.nom) === normalizeKey(extra));
      if (!alreadyInCv && extra.trim()) {
        extraSkillItems.push({
          id: `comp-extra-${Date.now()}-${eIdx}`,
          nom: autoFixCapitalization(extra.trim()),
          niveau: cv?.afficherNiveauCompetence ? 4 : void 0,
          categorie: "Comp\xE9tence additionnelle"
        });
      }
    });
    const keptOldSkillsInput = input.keptOldSkills || reponsesQuestions.keptOldSkills;
    const filteredOtherSkills = Array.isArray(keptOldSkillsInput) ? cvOtherSkills.filter((item) => keptOldSkillsInput.some((k) => normalizeKey(k) === normalizeKey(item.nom))) : cvOtherSkills;
    compSec.contenu = [
      ...newlyConfirmedSkills,
      ...cvSkillsMatchingOffer,
      ...extraSkillItems,
      ...filteredOtherSkills
    ];
  }
  const expSec = sections.find((s) => s.type === "experience");
  if (expSec && Array.isArray(expSec.contenu)) {
    const experiences = [...expSec.contenu];
    const targetTitleNorm = normalizeKey(targetTitle);
    const userReformulations = {
      ...input.experienceReformulations || {},
      ...reponsesQuestions.experienceReformulations || {}
    };
    const updatedExperiences = experiences.map((exp, idx) => {
      const clonedExp = { ...exp };
      const expId = exp.id || `exp-${idx}`;
      if (userReformulations[expId] && userReformulations[expId].trim()) {
        clonedExp.description = autoFixCapitalization(userReformulations[expId].trim());
        return clonedExp;
      }
      const foundSug = localSuggestions.suggestionsExperiences?.find(
        (s) => s.experienceId === expId || s.poste === exp.poste
      );
      if (foundSug && foundSug.descriptionSuggeree) {
        clonedExp.description = autoFixCapitalization(foundSug.descriptionSuggeree);
        return clonedExp;
      }
      let currentDesc = (exp.description || "").trim();
      const rawLines = currentDesc ? currentDesc.split("\n").map((l) => l.trim()).filter(Boolean) : [];
      let reformulatedLines = [];
      if (rawLines.length > 0) {
        const cleanedLines = rawLines.map((l) => {
          return l.replace(/^[-•*]\s*/, "").replace(/^\d+[\).]\s*/, "").replace(/^(pilotage et r[ée]alisation des missions cl[ée]s\s*:\s*|ma[îi]trise op[ée]rationnelle et application rigoureuse\s*:\s*|optimisation des processus et obtention de r[ée]sultats concrets\s*:\s*|responsable de\s+|en charge de\s+|charg[ée] de\s+|mission\s*:\s*|t[âa]che\s*:\s*)/i, "").trim();
        }).filter(Boolean);
        const actionVerbs = [
          "Pilotage et ex\xE9cution m\xE9thodique de",
          "Coordination op\xE9rationnelle et suivi rigoureux de",
          "Conception, mise en \u0153uvre et optimisation de",
          "Gestion quotidienne, contr\xF4le qualit\xE9 et fiabilisation de",
          "D\xE9ploiement strat\xE9gique et alignement des livrables pour"
        ];
        reformulatedLines = cleanedLines.map((clean, lIdx) => {
          const verb = actionVerbs[(lIdx + idx) % actionVerbs.length];
          if (/^(pilotage|gestion|coordination|conception|d[ée]veloppement|optimisation|suivi|analyse|d[ée]ploiement|supervision|administration|organisation|animation|recrutement|mise en place|r[ée]daction|maintenance)\b/i.test(clean)) {
            return `- ${clean.charAt(0).toUpperCase() + clean.slice(1)}`;
          }
          return `- ${verb} : ${clean}`;
        });
        if (reformulatedLines.length === 1) {
          reformulatedLines.push(`- Respect scrupuleux des normes de qualit\xE9 et garantie de la conformit\xE9 des livrables chez ${exp.entreprise || "l'entreprise"}.`);
        }
      } else {
        reformulatedLines = [
          `- D\xE9finition et ex\xE9cution autonome des missions cl\xE9s aff\xE9rentes au r\xF4le de ${exp.poste || "ce poste"} chez ${exp.entreprise || "l'entreprise"}.`,
          `- Coordination m\xE9thodique des livrables et collaboration \xE9troite avec les \xE9quipes pour assurer l'excellence op\xE9rationnelle.`
        ];
      }
      clonedExp.description = autoFixCapitalization(reformulatedLines.join("\n"));
      return clonedExp;
    });
    const customOrder = input.experiencesOrder || reponsesQuestions.experiencesOrder;
    if (Array.isArray(customOrder) && customOrder.length > 0) {
      updatedExperiences.sort((a, b) => {
        const idxA = customOrder.indexOf(a.id);
        const idxB = customOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });
    } else {
      updatedExperiences.sort((a, b) => {
        const matchA = normalizeKey(a.poste || "").includes(targetTitleNorm) ? 1 : 0;
        const matchB = normalizeKey(b.poste || "").includes(targetTitleNorm) ? 1 : 0;
        return matchB - matchA;
      });
    }
    expSec.contenu = updatedExperiences;
  }
  sections.forEach((sec) => {
    if (sec.styleSection) {
      sec.styleSection.couleurTitre = targetColor;
      sec.styleSection.couleurAccent = targetColor;
    }
  });
  if (langue !== "ar") {
    sections.forEach((sec) => {
      if (sec.titre && /[\u0600-\u06FF]/.test(sec.titre)) {
        if (sec.type === "profil") sec.titre = "Profil Professionnel";
        else if (sec.type === "experience") sec.titre = "Exp\xE9riences Professionnelles";
        else if (sec.type === "formation") sec.titre = "Formation & Dipl\xF4mes";
        else if (sec.type === "competences") sec.titre = "Comp\xE9tences Cl\xE9s";
        else if (sec.type === "langues") sec.titre = "Langues";
        else if (sec.type === "interets") sec.titre = "Centres d'int\xE9r\xEAt";
        else sec.titre = "Section";
      }
    });
  }
  clonedCv.sections = sections;
  return clonedCv;
}

// src/utils/vectorPdfGenerator.ts
var import_jspdf = require("jspdf");
function hexToRgb(hex) {
  let clean = (hex || "#000000").replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [30, 30, 30];
  return [num >> 16 & 255, num >> 8 & 255, num & 255];
}
function generateVectorPDF(cv) {
  const pdf = new import_jspdf.jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true
  });
  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const MARGIN_X = 14;
  const MARGIN_TOP = 14;
  const MARGIN_BOTTOM = 16;
  const USABLE_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
  const primaryRgb = hexToRgb(cv.couleurAccent || "#2563EB");
  const secondaryRgb = hexToRgb(cv.couleurAccentSecondaire || "#0D9488");
  const textDark = [24, 24, 27];
  const textMuted = [100, 116, 139];
  const textLight = [255, 255, 255];
  let currentY = MARGIN_TOP;
  let currentPage = 1;
  function checkPageBreak(neededHeight) {
    if (currentY + neededHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
      pdf.addPage("a4", "portrait");
      currentPage++;
      currentY = MARGIN_TOP;
    }
  }
  const sections = cv.sections || [];
  const profilSec = sections.find((s) => s.type === "profil");
  const profil = profilSec?.contenu || {};
  const nomComplet = profil.nomComplet || cv.titre || "Candidat";
  const titrePro = profil.titreProfessionnel || "";
  const email = profil.email || "";
  const telephone = profil.telephone || "";
  const adresse = profil.adresse || "";
  const siteWeb = profil.siteWeb || "";
  const linkedin = profil.linkedin || "";
  const resume = profil.resume || "";
  const isTwoTone = cv.styleEnTete === "two-tone-split" || cv.styleEnTete === "baxter-diagonal" || cv.styleEnTete === "two-tone-stripe";
  const isBanner = cv.styleEnTete === "banner" || cv.styleEnTete === "card";
  const isDarkHeader = isTwoTone || isBanner || cv.couleurFondProfil;
  if (isDarkHeader) {
    const headerH = 38;
    pdf.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    pdf.rect(0, 0, PAGE_WIDTH, headerH, "F");
    if (cv.couleurAccentSecondaire) {
      pdf.setFillColor(secondaryRgb[0], secondaryRgb[1], secondaryRgb[2]);
      pdf.rect(0, headerH - 3, PAGE_WIDTH, 3, "F");
    }
    pdf.setTextColor(textLight[0], textLight[1], textLight[2]);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text(nomComplet, MARGIN_X, 15);
    if (titrePro) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(240, 245, 255);
      pdf.text(titrePro.toUpperCase(), MARGIN_X, 22);
    }
    const contactParts = [email, telephone, adresse, siteWeb, linkedin].filter(Boolean);
    if (contactParts.length > 0) {
      pdf.setFontSize(8.5);
      pdf.setTextColor(220, 230, 245);
      const contactLine = contactParts.join("  \u2022  ");
      pdf.text(contactLine, MARGIN_X, 30);
    }
    currentY = headerH + 8;
  } else {
    pdf.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text(nomComplet, MARGIN_X, currentY + 6);
    currentY += 8;
    if (titrePro) {
      pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(titrePro.toUpperCase(), MARGIN_X, currentY + 4);
      currentY += 6;
    }
    const contactParts = [email, telephone, adresse, siteWeb, linkedin].filter(Boolean);
    if (contactParts.length > 0) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
      const contactLine = contactParts.join("  \u2022  ");
      pdf.text(contactLine, MARGIN_X, currentY + 4);
      currentY += 6;
    }
    pdf.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    pdf.setLineWidth(0.8);
    pdf.line(MARGIN_X, currentY + 2, PAGE_WIDTH - MARGIN_X, currentY + 2);
    currentY += 7;
  }
  if (resume) {
    checkPageBreak(25);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9.5);
    pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
    const resumeLines = pdf.splitTextToSize(resume, USABLE_WIDTH);
    pdf.text(resumeLines, MARGIN_X, currentY + 4);
    currentY += resumeLines.length * 4.5 + 6;
  }
  function renderSectionHeader(title) {
    checkPageBreak(16);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11.5);
    pdf.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    pdf.text(title.toUpperCase(), MARGIN_X, currentY + 4);
    pdf.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    pdf.setLineWidth(0.5);
    pdf.line(MARGIN_X, currentY + 6, MARGIN_X + 45, currentY + 6);
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.2);
    pdf.line(MARGIN_X + 46, currentY + 6, PAGE_WIDTH - MARGIN_X, currentY + 6);
    currentY += 10;
  }
  const bodySections = sections.filter((s) => s.type !== "profil" && s.visible !== false);
  for (const sec of bodySections) {
    renderSectionHeader(sec.titre || sec.type);
    if (sec.type === "experience" || sec.type === "experiences") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      for (const exp of items) {
        checkPageBreak(20);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10.5);
        pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
        pdf.text(exp.poste || "", MARGIN_X, currentY + 3);
        const dateStr = `${exp.dateDebut || ""} - ${exp.actuel ? "Pr\xE9sent" : exp.dateFin || ""}`;
        if (dateStr.trim() !== "-") {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
          pdf.text(dateStr, PAGE_WIDTH - MARGIN_X, currentY + 3, { align: "right" });
        }
        currentY += 5;
        const companyStr = [exp.entreprise, exp.ville].filter(Boolean).join(" \u2022 ");
        if (companyStr) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9.5);
          pdf.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
          pdf.text(companyStr, MARGIN_X, currentY + 2);
          currentY += 4.5;
        }
        if (exp.description) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
          const descLines = pdf.splitTextToSize(exp.description, USABLE_WIDTH - 2);
          checkPageBreak(descLines.length * 4);
          pdf.text(descLines, MARGIN_X, currentY + 3);
          currentY += descLines.length * 4 + 2;
        }
        if (Array.isArray(exp.taches) && exp.taches.length > 0) {
          for (const task of exp.taches) {
            if (typeof task === "string" && task.trim()) {
              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(8.5);
              pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
              const taskLines = pdf.splitTextToSize(`\u2022 ${task}`, USABLE_WIDTH - 6);
              checkPageBreak(taskLines.length * 3.8);
              pdf.text(taskLines, MARGIN_X + 4, currentY + 2.5);
              currentY += taskLines.length * 3.8 + 1;
            }
          }
        }
        currentY += 3;
      }
    } else if (sec.type === "formation" || sec.type === "formations") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      for (const form of items) {
        checkPageBreak(16);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
        pdf.text(form.diplome || "", MARGIN_X, currentY + 3);
        const dateStr = `${form.dateDebut || ""} - ${form.actuel ? "Pr\xE9sent" : form.dateFin || ""}`;
        if (dateStr.trim() !== "-") {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
          pdf.text(dateStr, PAGE_WIDTH - MARGIN_X, currentY + 3, { align: "right" });
        }
        currentY += 4.5;
        const schoolStr = [form.etablissement, form.ville].filter(Boolean).join(" \u2022 ");
        if (schoolStr) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
          pdf.text(schoolStr, MARGIN_X, currentY + 2);
          currentY += 4;
        }
        if (form.description) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8.5);
          pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
          const formDescLines = pdf.splitTextToSize(form.description, USABLE_WIDTH);
          checkPageBreak(formDescLines.length * 3.8);
          pdf.text(formDescLines, MARGIN_X, currentY + 2.5);
          currentY += formDescLines.length * 3.8 + 2;
        }
        currentY += 2;
      }
    } else if (sec.type === "competences") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      checkPageBreak(Math.ceil(items.length / 2) * 6);
      const colWidth = USABLE_WIDTH / 2;
      let colIdx = 0;
      let startRowY = currentY;
      for (let i = 0; i < items.length; i++) {
        const comp = items[i];
        const itemX = MARGIN_X + colIdx * colWidth;
        const itemY = startRowY + 3;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
        pdf.text(`\u2022 ${comp.nom}`, itemX, itemY);
        if (typeof comp.niveau === "number" && comp.niveau > 0) {
          const barW = 28;
          const barH = 2.2;
          const barX = itemX + colWidth - barW - 6;
          pdf.setFillColor(226, 232, 240);
          pdf.roundedRect(barX, itemY - 2.2, barW, barH, 1, 1, "F");
          const fillW = Math.min(10, comp.niveau) / 10 * barW;
          pdf.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
          pdf.roundedRect(barX, itemY - 2.2, fillW, barH, 1, 1, "F");
        }
        if (colIdx === 1 || i === items.length - 1) {
          startRowY += 5.5;
          colIdx = 0;
        } else {
          colIdx = 1;
        }
      }
      currentY = startRowY + 3;
    } else if (sec.type === "langues") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      checkPageBreak(items.length * 5);
      for (const langItem of items) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
        const langText = `\u2022 ${langItem.langue || ""} : `;
        pdf.text(langText, MARGIN_X, currentY + 3);
        const w = pdf.getTextWidth(langText);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        pdf.text(langItem.niveau || "", MARGIN_X + w, currentY + 3);
        currentY += 4.8;
      }
      currentY += 2;
    } else if (sec.type === "interets") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      const names = items.map((it) => it.nom || it.titre || "").filter(Boolean);
      if (names.length > 0) {
        checkPageBreak(8);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(textDark[0], textDark[1], textDark[2]);
        const interestStr = names.join("  \u2022  ");
        const lines = pdf.splitTextToSize(interestStr, USABLE_WIDTH);
        pdf.text(lines, MARGIN_X, currentY + 3);
        currentY += lines.length * 4 + 4;
      }
    }
  }
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(160, 174, 192);
    pdf.text(`Page ${p} / ${totalPages}`, PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 8, { align: "right" });
  }
  return pdf;
}

// src/utils/docxExport.ts
var import_docx = require("docx");
function buildDocxDocument(cv) {
  const profilSection = cv.sections.find((s) => s.type === "profil");
  const profilContenu = profilSection?.contenu || {};
  const nomComplet = profilContenu.nomComplet || "Mon Nom";
  const titrePro = profilContenu.titreProfessionnel || "";
  const email = profilContenu.email || "";
  const telephone = profilContenu.telephone || "";
  const adresse = profilContenu.adresse || "";
  const resume = profilContenu.resume || "";
  const linkedin = profilContenu.linkedin || "";
  const siteWeb = profilContenu.siteWeb || "";
  const accentHex = (cv.couleurAccent || "#2563EB").replace("#", "");
  const docChildren = [];
  docChildren.push(
    new import_docx.Paragraph({
      text: nomComplet,
      heading: import_docx.HeadingLevel.TITLE,
      alignment: import_docx.AlignmentType.CENTER,
      spacing: { after: 100 }
    })
  );
  if (titrePro) {
    docChildren.push(
      new import_docx.Paragraph({
        children: [
          new import_docx.TextRun({
            text: titrePro,
            bold: true,
            size: 26,
            color: accentHex
          })
        ],
        alignment: import_docx.AlignmentType.CENTER,
        spacing: { after: 120 }
      })
    );
  }
  const contactParts = [email, telephone, adresse, linkedin, siteWeb].filter(Boolean);
  if (contactParts.length > 0) {
    docChildren.push(
      new import_docx.Paragraph({
        text: contactParts.join("  \u2022  "),
        alignment: import_docx.AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );
  }
  if (resume) {
    docChildren.push(
      new import_docx.Paragraph({
        children: [
          new import_docx.TextRun({
            text: "PROFIL",
            bold: true,
            size: 22,
            color: accentHex
          })
        ],
        spacing: { before: 200, after: 100 }
      })
    );
    docChildren.push(
      new import_docx.Paragraph({
        text: resume,
        spacing: { after: 200 }
      })
    );
  }
  for (const sec of cv.sections) {
    if (sec.type === "profil" || sec.visible === false) continue;
    docChildren.push(
      new import_docx.Paragraph({
        children: [
          new import_docx.TextRun({
            text: (sec.titre || sec.type).toUpperCase(),
            bold: true,
            size: 22,
            color: accentHex
          })
        ],
        spacing: { before: 200, after: 100 }
      })
    );
    if (sec.type === "experience" || sec.type === "experiences") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      for (const it of items) {
        const dateStr = `${it.dateDebut || ""} - ${it.actuel ? "Pr\xE9sent" : it.dateFin || ""}`;
        docChildren.push(
          new import_docx.Paragraph({
            children: [
              new import_docx.TextRun({ text: it.poste || "", bold: true }),
              new import_docx.TextRun({ text: ` | ${it.entreprise || ""} (${it.ville || ""})` }),
              new import_docx.TextRun({ text: `   ${dateStr}`, italics: true })
            ],
            spacing: { after: 60 }
          })
        );
        if (it.description) {
          docChildren.push(
            new import_docx.Paragraph({
              text: it.description,
              spacing: { after: 60 }
            })
          );
        }
        if (Array.isArray(it.taches)) {
          for (const task of it.taches) {
            docChildren.push(
              new import_docx.Paragraph({
                text: task,
                bullet: { level: 0 },
                spacing: { after: 40 }
              })
            );
          }
        }
      }
    } else if (sec.type === "formation" || sec.type === "formations") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      for (const it of items) {
        const dateStr = `${it.dateDebut || ""} - ${it.actuel ? "Pr\xE9sent" : it.dateFin || ""}`;
        docChildren.push(
          new import_docx.Paragraph({
            children: [
              new import_docx.TextRun({ text: it.diplome || "", bold: true }),
              new import_docx.TextRun({ text: ` | ${it.etablissement || ""} (${it.ville || ""})` }),
              new import_docx.TextRun({ text: `   ${dateStr}`, italics: true })
            ],
            spacing: { after: 60 }
          })
        );
        if (it.description) {
          docChildren.push(
            new import_docx.Paragraph({
              text: it.description,
              spacing: { after: 60 }
            })
          );
        }
      }
    } else if (sec.type === "competences") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      const skillNames = items.map((c) => c.nom + (c.niveau ? ` (${c.niveau}/10)` : "")).join(", ");
      docChildren.push(
        new import_docx.Paragraph({
          text: skillNames,
          spacing: { after: 100 }
        })
      );
    } else if (sec.type === "langues") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      const langNames = items.map((l) => `${l.langue} (${l.niveau})`).join(", ");
      docChildren.push(
        new import_docx.Paragraph({
          text: langNames,
          spacing: { after: 100 }
        })
      );
    } else if (sec.type === "interets") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      const names = items.map((i) => i.nom).filter(Boolean).join(", ");
      docChildren.push(
        new import_docx.Paragraph({
          text: names,
          spacing: { after: 100 }
        })
      );
    }
  }
  return new import_docx.Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 900,
              right: 900
            }
          }
        },
        children: docChildren
      }
    ]
  });
}

// src/utils/adminPaidMatrix.ts
var STORAGE_KEY = "admin_paid_features_matrix_config";
var DEFAULT_ADMIN_PAID_MATRIX = {
  paidFonts: ["Playfair Display", "Cinzel", "Syne", "Bebas Neue"],
  paidTemplates: CV_TEMPLATES.map((template) => template.id),
  paidStudioTabs: ["calques", "espacements", "bordures", "style-sections", "arriere-plan"],
  paidPatterns: ["mesh", "waves", "hexagons", "polka", "chevrons", "circuit", "cubes", "mandala"],
  paidHeaderStyles: ["luxury-gold", "tech-arches", "arc-contour", "organic-arch", "ocean-wave"],
  paidExportFormats: ["pdf_hd", "docx", "json", "txt"],
  paidFeatures: ["COVER_LETTER_AI", "CV_AI_JOB_TARGETING", "LINKEDIN_OPTIMIZER", "CUSTOM_SECTIONS"],
  paidStudioMenus: ["background", "pageCalibration", "individualSection"],
  paidSubOptions: ["background:decorative_layers", "sectionHeaders:arch-block", "photo:rings"]
};
function isPaymentActive() {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("app_settings_paiementActif");
  if (stored !== null) {
    return stored === "true";
  }
  return true;
}
function getAdminPaidMatrixConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_ADMIN_PAID_MATRIX,
        ...parsed
      };
    }
  } catch (e) {
    console.error("Failed to load admin paid matrix config:", e);
  }
  return DEFAULT_ADMIN_PAID_MATRIX;
}
function isFontPaidByAdmin(fontName) {
  if (!isPaymentActive()) return false;
  const config = getAdminPaidMatrixConfig();
  return config.paidFonts.includes(fontName);
}
function isStudioMenuPaidByAdmin(menuId) {
  if (!isPaymentActive()) return false;
  const config = getAdminPaidMatrixConfig();
  return config.paidStudioMenus.includes(menuId);
}
function isSubOptionPaidByAdmin(subOptionId, parentMenuId) {
  if (!isPaymentActive()) return false;
  const config = getAdminPaidMatrixConfig();
  if (config.paidSubOptions.includes(subOptionId)) return true;
  if (parentMenuId && config.paidStudioMenus.includes(parentMenuId)) return true;
  return false;
}
function isPatternPaidByAdmin(patternName) {
  if (!isPaymentActive()) return false;
  const config = getAdminPaidMatrixConfig();
  return config.paidPatterns.includes(patternName);
}
function isHeaderStylePaidByAdmin(headerStyle) {
  if (!isPaymentActive()) return false;
  const config = getAdminPaidMatrixConfig();
  return config.paidHeaderStyles.includes(headerStyle);
}

// src/utils/subscriptionGates.ts
var DEFAULT_FREE_TEMPLATE_IDS = [];
var FREE_TEMPLATE_IDS = getFreeTemplateIds();
function getFreeTemplateIds() {
  if (typeof window === "undefined") {
    return DEFAULT_FREE_TEMPLATE_IDS;
  }
  try {
    const raw = localStorage.getItem("admin_custom_templates");
    if (!raw) return DEFAULT_FREE_TEMPLATE_IDS;
    const parsed = JSON.parse(raw);
    const customIds = Array.isArray(parsed) ? parsed.map((item) => item?.id).filter((id) => Boolean(id)) : [];
    return customIds;
  } catch {
    return DEFAULT_FREE_TEMPLATE_IDS;
  }
}
var PLANS_CONFIG = {
  freemium: {
    id: "freemium",
    name: "Freemium",
    badge: "Gratuit",
    tagline: {
      fr: "Id\xE9al pour d\xE9marrer et cr\xE9er un premier CV rapidement.",
      en: "Ideal for getting started and creating a clean first resume."
    },
    pricing: {
      xaf: 0,
      eur: 0,
      usd: 0,
      billingType: "free"
    },
    features: [
      "FREE_TEMPLATES",
      "STUDIO_BASIC_EDITION",
      "EXPORT_PDF_STANDARD"
    ],
    highlights: {
      fr: [
        "S\xE9lection de mod\xE8les professionnels gratuits",
        "\xC9diteur de texte et gestion des sections",
        "Exportation PDF standard",
        "Sauvegarde de votre premier CV"
      ],
      en: [
        "Curated selection of free professional templates",
        "Full text editor and section manager",
        "Standard PDF export",
        "Save your primary resume draft"
      ]
    },
    limits: {
      maxCVs: 1,
      allowedTemplateCount: getFreeTemplateIds().length,
      allowStudioCustomization: false,
      allowCoverLetter: false,
      allowJobTargeting: false,
      allowLinkedInOptimizer: false,
      pdfExportQuality: "standard"
    }
  },
  decouverte: {
    id: "decouverte",
    name: "Pack D\xE9couverte",
    badge: "7 Jours",
    tagline: {
      fr: "Acc\xE8s complet aux mod\xE8les essentiels et \xE0 la personnalisation avanc\xE9e pendant 7 jours.",
      en: "Full access to the core templates and advanced design tools for 7 days."
    },
    pricing: {
      xaf: 1e3,
      eur: 1.5,
      usd: 1.7,
      billingType: "monthly"
    },
    features: [
      "FREE_TEMPLATES",
      "ALL_TEMPLATES",
      "STUDIO_BASIC_EDITION",
      "STUDIO_FULL_CUSTOMIZATION",
      "CUSTOM_SECTIONS",
      "EXPORT_PDF_STANDARD",
      "EXPORT_PDF_HD",
      "UNLIMITED_CV_SAVES"
    ],
    highlights: {
      fr: [
        "Acc\xE8s aux mod\xE8les essentiels et \xE0 la personnalisation avanc\xE9e",
        "Creator Studio complet : colonnes, bordures & polices",
        "Export PDF Ultra HD 300 DPI sans restriction",
        "Rubriques et mises en page personnalis\xE9es",
        "Valable 7 jours (1 semaine)"
      ],
      en: [
        "Access to essential templates and advanced customization",
        "Complete Creator Studio design tools",
        "Ultra HD 300 DPI PDF exports without watermarks",
        "Unlimited custom sections & layouts",
        "Valid for 7 days (1 week)"
      ]
    },
    limits: {
      maxCVs: 5,
      allowedTemplateCount: "all",
      allowStudioCustomization: true,
      allowCoverLetter: false,
      allowJobTargeting: false,
      allowLinkedInOptimizer: false,
      pdfExportQuality: "hd_300dpi"
    }
  },
  classique: {
    id: "classique",
    name: "Legacy Classique",
    badge: "Compatibilit\xE9",
    tagline: {
      fr: "Compatibilit\xE9 legacy : \xE0 conserver pour les anciens comptes.",
      en: "Legacy compatibility for older accounts."
    },
    pricing: {
      xaf: 2500,
      eur: 3.8,
      usd: 4.2,
      billingType: "monthly"
    },
    features: [
      "FREE_TEMPLATES",
      "ALL_TEMPLATES",
      "STUDIO_BASIC_EDITION",
      "STUDIO_FULL_CUSTOMIZATION",
      "CUSTOM_SECTIONS",
      "EXPORT_PDF_STANDARD",
      "EXPORT_PDF_HD",
      "UNLIMITED_CV_SAVES"
    ],
    highlights: {
      fr: [
        "Compatibilit\xE9 legacy pour anciens comptes",
        "Acc\xE8s int\xE9gral au studio et aux mod\xE8les",
        "Sans blocage sur l\u2019ancien parcours d\u2019achat"
      ],
      en: [
        "Legacy compatibility for older accounts",
        "Full access to studio and templates",
        "No disruption to older purchase flows"
      ]
    },
    limits: {
      maxCVs: 10,
      allowedTemplateCount: "all",
      allowStudioCustomization: true,
      allowCoverLetter: false,
      allowJobTargeting: false,
      allowLinkedInOptimizer: false,
      pdfExportQuality: "hd_300dpi"
    }
  },
  premium: {
    id: "premium",
    name: "Premium VIP",
    badge: "Recommand\xE9 Pro",
    tagline: {
      fr: "Le pack complet : Personnalisation avanc\xE9e des CV, Lettres de motivation & LinkedIn.",
      en: "The complete suite: Job Offer Targeting, Cover Letter & LinkedIn Optimizer."
    },
    pricing: {
      xaf: 2500,
      eur: 3.8,
      usd: 4.2,
      billingType: "monthly"
    },
    features: [
      "FREE_TEMPLATES",
      "ALL_TEMPLATES",
      "STUDIO_BASIC_EDITION",
      "STUDIO_FULL_CUSTOMIZATION",
      "CUSTOM_SECTIONS",
      "CV_AI_JOB_TARGETING",
      "COVER_LETTER_AI",
      "LINKEDIN_OPTIMIZER",
      "DECORATIVE_LAYERS_CUSTOM",
      "EXPORT_PDF_STANDARD",
      "EXPORT_PDF_HD",
      "EXPORT_MULTI_FORMAT",
      "UNLIMITED_CV_SAVES",
      "PRIORITY_SUPPORT"
    ],
    highlights: {
      fr: [
        "Tout ce qui est inclus dans le Pack D\xE9couverte",
        "G\xE9n\xE9rateur et \xE9diteur de Lettres de Motivation professionnelles",
        "Ciblage automatique de CV adapt\xE9 \xE0 vos offres d\u2019emploi cibles",
        "Optimiseur de profil LinkedIn haute visibilit\xE9",
        "Calques d\xE9coratifs g\xE9om\xE9triques et styles personnalis\xE9s avanc\xE9s",
        "Exports multi-formats (PDF HD, JSON, TXT, DOCX)"
      ],
      en: [
        "Everything included in the D\xE9couverte pack",
        "AI Cover Letter generator & professional editor",
        "Automatic resume adaptation tailored to specific job descriptions",
        "LinkedIn Profile Optimizer for high recruiter visibility",
        "Advanced geometric decorative layers and custom themes",
        "Multi-format exports (HD PDF, JSON, TXT, DOCX)"
      ]
    },
    limits: {
      maxCVs: 50,
      allowedTemplateCount: "all",
      allowStudioCustomization: true,
      allowCoverLetter: true,
      allowJobTargeting: true,
      allowLinkedInOptimizer: true,
      pdfExportQuality: "hd_300dpi"
    }
  }
};
function isTemplatePaid(templateId) {
  if (!isPaymentActive()) return false;
  const config = getAdminPaidMatrixConfig();
  const activeFreeTemplateIds = getFreeTemplateIds();
  if (config && Array.isArray(config.paidTemplates)) {
    return config.paidTemplates.includes(templateId);
  }
  return !activeFreeTemplateIds.includes(templateId);
}

// src/utils/paidUsageDetector.ts
function detectPaidFeaturesInCV(cv, userTier = "freemium") {
  const norm = (userTier || "").toString().toLowerCase();
  if (!isPaymentActive() || norm === "premium" || norm === "admin" || norm === "classique" || norm === "decouverte" || cv.statutPaiement === "PAYE") {
    return [];
  }
  const paidUsages = [];
  const template = CV_TEMPLATES.find((t) => t.id === cv.templateId);
  const preset = cv.templateId ? TEMPLATE_PRESETS[cv.templateId] : void 0;
  if (cv.templateId && isTemplatePaid(cv.templateId)) {
    paidUsages.push({
      id: "template_paid",
      name: "Mod\xE8le Pro / Payant",
      description: `Vous utilisez le mod\xE8le r\xE9serv\xE9 "${cv.templateId}".`,
      requiredTier: "classique"
    });
  }
  if (isStudioMenuPaidByAdmin("template") || cv.nombreColonnes === 1 && isSubOptionPaidByAdmin("template:column_layout", "template")) {
    paidUsages.push({
      id: "template_menu_paid",
      name: "Disposition / Structure Pro",
      description: "La personnalisation de la disposition et structure est configur\xE9e comme payante.",
      requiredTier: "classique"
    });
  }
  const defaultFont = preset?.police || template?.defaultFont || "Inter";
  const isCustomFont = cv.police && cv.police !== defaultFont;
  if (isCustomFont && isFontPaidByAdmin(cv.police) || isStudioMenuPaidByAdmin("typography")) {
    paidUsages.push({
      id: "font_paid",
      name: "Typographie Pro",
      description: `La typographie ou la personnalisation de police est configur\xE9e comme payante.`,
      requiredTier: "classique"
    });
  }
  const defaultPattern = template?.themeConfig?.backgroundPattern || "none";
  const patternToTest = cv.backgroundPattern || cv.arrierePlanPattern || cv.sidebarBackgroundPattern;
  const isCustomPattern = patternToTest && patternToTest !== "none" && patternToTest !== defaultPattern;
  if (isCustomPattern && isPatternPaidByAdmin(patternToTest) || isStudioMenuPaidByAdmin("background")) {
    paidUsages.push({
      id: "bg_pattern_paid",
      name: "Motif d'Arri\xE8re-plan Pro",
      description: `Le motif d'arri\xE8re-plan ou fond studio est configur\xE9 comme payant.`,
      requiredTier: "classique"
    });
  }
  if (cv.calqueDecoratif && cv.calqueDecoratif !== "none" && cv.calqueDecoratif !== "standard" || isSubOptionPaidByAdmin("background:decorative_layers", "background")) {
    paidUsages.push({
      id: "decorative_layer_paid",
      name: "Calque D\xE9coratif VIP",
      description: `\xC9l\xE9ments g\xE9om\xE9triques VIP "${cv.calqueDecoratif || "calque"}".`,
      requiredTier: "premium"
    });
  }
  const defaultHeader = preset?.styleEnTete || template?.themeConfig?.headerStyle || "banner";
  const isCustomHeader = cv.styleEnTete && cv.styleEnTete !== defaultHeader;
  if (isCustomHeader && isHeaderStylePaidByAdmin(cv.styleEnTete) || isStudioMenuPaidByAdmin("header") || isCustomHeader && isSubOptionPaidByAdmin(`header:${cv.styleEnTete}`, "header")) {
    paidUsages.push({
      id: "header_style_paid",
      name: "Style d'En-T\xEAte Pro",
      description: `Le style d'en-t\xEAte "${cv.styleEnTete || "en-t\xEAte"}" est configur\xE9 comme payant.`,
      requiredTier: "classique"
    });
  }
  const defaultSectionHeader = preset?.styleEnTeteSection || template?.themeConfig?.sectionHeaderStyle || "underline";
  const isCustomSectionHeader = cv.styleEnTeteSection && cv.styleEnTeteSection !== defaultSectionHeader;
  if (isCustomSectionHeader) {
    if (isStudioMenuPaidByAdmin("sectionHeaders") || isSubOptionPaidByAdmin(`sectionHeaders:${cv.styleEnTeteSection}`, "sectionHeaders")) {
      paidUsages.push({
        id: "section_headers_paid",
        name: "Style Titres de Sections Pro",
        description: `Le style de titre de section "${cv.styleEnTeteSection}" est r\xE9serv\xE9.`,
        requiredTier: "classique"
      });
    }
  }
  if (cv.couleurFondSidebar || cv.formeSidebarDecor && cv.formeSidebarDecor !== "straight" || cv.sidebarBackgroundType === "gradient") {
    if (isStudioMenuPaidByAdmin("sidebar") || isSubOptionPaidByAdmin("sidebar:shape", "sidebar") || isSubOptionPaidByAdmin("sidebar:bg_color", "sidebar")) {
      paidUsages.push({
        id: "sidebar_custom_paid",
        name: "Personnalisation Sidebar Pro",
        description: "Les effets avanc\xE9s de la sidebar sont configur\xE9s comme payants.",
        requiredTier: "classique"
      });
    }
  }
  const defaultPhotoShape = preset?.photoForme || template?.themeConfig?.photoFrameStyle || "ronde";
  const defaultRing = preset?.cadrePhotoRing || "none";
  const isCustomPhoto = cv.photoForme && cv.photoForme !== defaultPhotoShape || cv.cadrePhotoRing && cv.cadrePhotoRing !== defaultRing;
  if (isCustomPhoto) {
    if (isStudioMenuPaidByAdmin("photo") || cv.cadrePhotoRing && cv.cadrePhotoRing !== "none" && isSubOptionPaidByAdmin("photo:rings", "photo") || isSubOptionPaidByAdmin("photo:shapes", "photo")) {
      paidUsages.push({
        id: "photo_styling_paid",
        name: "Cadre & Forme Photo Pro",
        description: `Le style de photo (${cv.photoForme || "cadre"}) est r\xE9serv\xE9.`,
        requiredTier: "classique"
      });
    }
  }
  const defaultBadgeStyle = preset?.styleBadgesCoordonnees || "none";
  if (cv.styleBadgesCoordonnees && cv.styleBadgesCoordonnees !== defaultBadgeStyle) {
    if (isStudioMenuPaidByAdmin("contactBadges") || isSubOptionPaidByAdmin(`contactBadges:${cv.styleBadgesCoordonnees}`, "contactBadges")) {
      paidUsages.push({
        id: "contact_badges_paid",
        name: "Badges Coordonn\xE9es Pro",
        description: `Le style de badge contact "${cv.styleBadgesCoordonnees}" est r\xE9serv\xE9.`,
        requiredTier: "classique"
      });
    }
  }
  const defaultTimeline = preset?.timelineStyle || "none";
  if (cv.timelineStyle && cv.timelineStyle !== defaultTimeline) {
    if (isStudioMenuPaidByAdmin("timeline") || isSubOptionPaidByAdmin(`timeline:${cv.timelineStyle}`, "timeline")) {
      paidUsages.push({
        id: "timeline_paid",
        name: "Ligne Temporelle (Timeline) Pro",
        description: `L'effet timeline "${cv.timelineStyle}" est r\xE9serv\xE9.`,
        requiredTier: "classique"
      });
    }
  }
  if (cv.stylePucesListes && cv.stylePucesListes !== "disc") {
    if (isStudioMenuPaidByAdmin("bullets") || isSubOptionPaidByAdmin(`bullets:${cv.stylePucesListes}`, "bullets")) {
      paidUsages.push({
        id: "bullets_paid",
        name: "Puces de Listes Pro",
        description: `Le style de puces "${cv.stylePucesListes}" est r\xE9serv\xE9.`,
        requiredTier: "classique"
      });
    }
  }
  if (cv.ombreCarte && cv.ombreCarte !== "none") {
    if (isStudioMenuPaidByAdmin("shadows") || isSubOptionPaidByAdmin(`shadows:${cv.ombreCarte}`, "shadows")) {
      paidUsages.push({
        id: "shadows_paid",
        name: "Ombre Port\xE9e 3D Pro",
        description: `L'effet de profondeur est configur\xE9 comme payant.`,
        requiredTier: "classique"
      });
    }
  }
  const defaultSkillsMode = preset?.styleCompetences || template?.themeConfig?.skillsDisplayMode || "badges";
  if (cv.styleCompetences && cv.styleCompetences !== defaultSkillsMode) {
    if (isStudioMenuPaidByAdmin("skills") || isSubOptionPaidByAdmin(`skills:${cv.styleCompetences}`, "skills")) {
      paidUsages.push({
        id: "skills_format_paid",
        name: "Format Comp\xE9tences Pro",
        description: `Le format de comp\xE9tences "${cv.styleCompetences}" est r\xE9serv\xE9.`,
        requiredTier: "classique"
      });
    }
  }
  const hasCustomSectionStyle = (cv.sections || []).some((s) => s.styleSection && Object.keys(s.styleSection).length > 0 && Object.values(s.styleSection).some((v) => Boolean(v)));
  if (hasCustomSectionStyle && isStudioMenuPaidByAdmin("individualSection")) {
    paidUsages.push({
      id: "individual_section_paid",
      name: "Style Individuel par Section Pro",
      description: "La personnalisation individuelle par section est configur\xE9e comme payante.",
      requiredTier: "classique"
    });
  }
  return paidUsages;
}

// src/utils/cvTranslator.ts
var SECTION_TITLES_BY_LANG = {
  profil: {
    fr: "Profil Professionnel",
    en: "Professional Summary",
    ar: "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0645\u0647\u0646\u064A"
  },
  experience: {
    fr: "Exp\xE9riences Professionnelles",
    en: "Work Experience",
    ar: "\u0627\u0644\u062E\u0628\u0631\u0627\u062A \u0627\u0644\u0645\u0647\u0646\u064A\u0629"
  },
  formation: {
    fr: "Formation & Dipl\xF4mes",
    en: "Education & Credentials",
    ar: "\u0627\u0644\u0645\u0624\u0647\u0644\u0627\u062A \u0627\u0644\u0639\u0644\u0645\u064A\u0629 \u0648\u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A"
  },
  competences: {
    fr: "Comp\xE9tences & Outils",
    en: "Skills & Expertise",
    ar: "\u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0642\u0646\u064A\u0627\u062A"
  },
  langues: {
    fr: "Langues",
    en: "Languages",
    ar: "\u0627\u0644\u0644\u063A\u0627\u062A"
  },
  interets: {
    fr: "Centres d'int\xE9r\xEAt",
    en: "Interests & Activities",
    ar: "\u0627\u0644\u0627\u0647\u062A\u0645\u0627\u0645\u0627\u062A \u0648\u0627\u0644\u0623\u0646\u0634\u0637\u0629"
  },
  projets: {
    fr: "Projets R\xE9cents",
    en: "Key Projects",
    ar: "\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0628\u0627\u0631\u0632\u0629"
  },
  certifications: {
    fr: "Certifications & Licences",
    en: "Certifications & Licenses",
    ar: "\u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u0631\u0627\u062E\u064A\u0635"
  },
  benevolat: {
    fr: "B\xE9n\xE9volat & Engagement",
    en: "Volunteering & Leadership",
    ar: "\u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u062A\u0637\u0648\u0639\u064A \u0648\u0627\u0644\u0623\u0646\u0634\u0637\u0629"
  },
  publications: {
    fr: "Publications & Recherches",
    en: "Publications & Research",
    ar: "\u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062A \u0648\u0627\u0644\u0623\u0628\u062D\u0627\u062B"
  },
  distinctions: {
    fr: "Prix & Distinctions",
    en: "Honors & Awards",
    ar: "\u0627\u0644\u062C\u0648\u0627\u0626\u0632 \u0648\u0627\u0644\u062A\u0643\u0631\u064A\u0645\u0627\u062A"
  },
  qualites: {
    fr: "Qualit\xE9s Personnelles",
    en: "Key Strengths",
    ar: "\u0627\u0644\u0633\u0645\u0627\u062A \u0627\u0644\u0634\u062E\u0635\u064A\u0629"
  },
  references: {
    fr: "R\xE9f\xE9rences",
    en: "References",
    ar: "\u0627\u0644\u0645\u0631\u0627\u062C\u0639 \u0648\u0627\u0644\u0645\u0639\u0631\u0641\u0648\u0646"
  }
};
var COMMON_TERMS = [
  // Dates & States
  { fr: "Pr\xE9sent", en: "Present", ar: "\u062D\u062A\u0649 \u0627\u0644\u0622\u0646" },
  { fr: "Actuel", en: "Current", ar: "\u0627\u0644\u062D\u0627\u0644\u064A" },
  { fr: "En cours", en: "In progress", ar: "\u0642\u064A\u062F \u0627\u0644\u0625\u0646\u062C\u0627\u0632" },
  { fr: "Janvier", en: "January", ar: "\u064A\u0646\u0627\u064A\u0631" },
  { fr: "F\xE9vrier", en: "February", ar: "\u0641\u0628\u0631\u0627\u064A\u0631" },
  { fr: "Mars", en: "March", ar: "\u0645\u0627\u0631\u0633" },
  { fr: "Avril", en: "April", ar: "\u0623\u0628\u0631\u064A\u0644" },
  { fr: "Mai", en: "May", ar: "\u0645\u0627\u064A\u0648" },
  { fr: "Juin", en: "June", ar: "\u064A\u0648\u0646\u064A\u0648" },
  { fr: "Juillet", en: "July", ar: "\u064A\u0648\u0644\u064A\u0648" },
  { fr: "Ao\xFBt", en: "August", ar: "\u0623\u063A\u0633\u0637\u0633" },
  { fr: "Septembre", en: "September", ar: "\u0633\u0628\u062A\u0645\u0628\u0631" },
  { fr: "Octobre", en: "October", ar: "\u0623\u0643\u062A\u0648\u0628\u0631" },
  { fr: "Novembre", en: "November", ar: "\u0646\u0648\u0641\u0645\u0628\u0631" },
  { fr: "D\xE9cembre", en: "December", ar: "\u062F\u064A\u0633\u0645\u0628\u0631" },
  // Language Levels
  { fr: "Langue maternelle", en: "Native / Bilingual", ar: "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0623\u0645" },
  { fr: "Bilingue", en: "Bilingual", ar: "\u062B\u0646\u0627\u0626\u064A \u0627\u0644\u0644\u063A\u0629" },
  { fr: "Courant", en: "Fluent", ar: "\u0625\u062A\u0642\u0627\u0646 \u062A\u0627\u0645" },
  { fr: "Professionnel", en: "Professional working proficiency", ar: "\u0645\u0633\u062A\u0648\u0649 \u0645\u0647\u0646\u064A" },
  { fr: "Interm\xE9diaire", en: "Intermediate", ar: "\u0645\u062A\u0648\u0633\u0637" },
  { fr: "D\xE9butant", en: "Beginner / Basic", ar: "\u0645\u0628\u062A\u062F\u0626" },
  { fr: "Notions", en: "Elementary proficiency", ar: "\u0645\u0633\u062A\u0648\u0649 \u0623\u0633\u0627\u0633\u064A" },
  // Common Language Names
  { fr: "Fran\xE7ais", en: "French", ar: "\u0627\u0644\u0641\u0631\u0646\u0633\u064A\u0629" },
  { fr: "Anglais", en: "English", ar: "\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629" },
  { fr: "Arabe", en: "Arabic", ar: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
  { fr: "Espagnol", en: "Spanish", ar: "\u0627\u0644\u0625\u0633\u0628\u0627\u0646\u064A\u0629" },
  { fr: "Allemand", en: "German", ar: "\u0627\u0644\u0623\u0644\u0645\u0627\u0646\u064A\u0629" },
  { fr: "Italien", en: "Italian", ar: "\u0627\u0644\u0625\u064A\u0637\u0627\u0644\u064A\u0629" },
  { fr: "Portugais", en: "Portuguese", ar: "\u0627\u0644\u0628\u0631\u062A\u063A\u0627\u0644\u064A\u0629" },
  { fr: "Chinois", en: "Mandarin Chinese", ar: "\u0627\u0644\u0635\u064A\u0646\u064A\u0629" },
  { fr: "Russe", en: "Russian", ar: "\u0627\u0644\u0631\u0648\u0633\u064A\u0629" },
  // Degrees
  { fr: "Doctorat en Informatique", en: "Ph.D. in Computer Science", ar: "\u062F\u0643\u062A\u0648\u0631\u0627\u0647 \u0641\u064A \u0639\u0644\u0648\u0645 \u0627\u0644\u062D\u0627\u0633\u0628" },
  { fr: "Doctorat", en: "Ph.D. / Doctorate", ar: "\u062F\u0643\u062A\u0648\u0631\u0627\u0647" },
  { fr: "Master en Informatique", en: "Master of Science in Computer Science", ar: "\u0645\u0627\u062C\u0633\u062A\u064A\u0631 \u0641\u064A \u0639\u0644\u0648\u0645 \u0627\u0644\u062D\u0627\u0633\u0628" },
  { fr: "Master of Science in Computer Science", en: "Master of Science in Computer Science", ar: "\u0645\u0627\u062C\u0633\u062A\u064A\u0631 \u0641\u064A \u0639\u0644\u0648\u0645 \u0627\u0644\u062D\u0627\u0633\u0628" },
  { fr: "Master 2", en: "Master Degree", ar: "\u062F\u0631\u062C\u0629 \u0627\u0644\u0645\u0627\u062C\u0633\u062A\u064A\u0631" },
  { fr: "Master 1", en: "First-Year Master", ar: "\u0633\u0646\u0629 \u0623\u0648\u0644\u0649 \u0645\u0627\u062C\u0633\u062A\u064A\u0631" },
  { fr: "Master", en: "Master's Degree", ar: "\u062F\u0631\u062C\u0629 \u0627\u0644\u0645\u0627\u062C\u0633\u062A\u064A\u0631" },
  { fr: "Licence en Informatique", en: "Bachelor of Science in Computer Science", ar: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0641\u064A \u0639\u0644\u0648\u0645 \u0627\u0644\u062D\u0627\u0633\u0628" },
  { fr: "Licence", en: "Bachelor's Degree", ar: "\u062F\u0631\u062C\u0629 \u0627\u0644\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633" },
  { fr: "Baccalaur\xE9at", en: "High School Diploma", ar: "\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629 \u0627\u0644\u0639\u0627\u0645\u0629" },
  { fr: "Dipl\xF4me d\u2019Ing\xE9nieur", en: "Engineering Degree (M.Eng)", ar: "\u0634\u0647\u0627\u062F\u0629 \u0641\u064A \u0627\u0644\u0647\u0646\u062F\u0633\u0629" },
  { fr: "Dipl\xF4me d'Ing\xE9nieur", en: "Engineering Degree (M.Eng)", ar: "\u0634\u0647\u0627\u062F\u0629 \u0641\u064A \u0627\u0644\u0647\u0646\u062F\u0633\u0629" },
  { fr: "BTS", en: "Higher National Diploma (HND)", ar: "\u062F\u0628\u0644\u0648\u0645 \u062A\u0642\u0646\u064A \u0639\u0627\u0644\u064A" },
  { fr: "DUT", en: "University Technology Diploma", ar: "\u062F\u0628\u0644\u0648\u0645 \u062A\u0642\u0646\u064A \u062C\u0627\u0645\u0639\u064A" },
  { fr: "Certificat Professionnel", en: "Professional Certification", ar: "\u0634\u0647\u0627\u062F\u0629 \u0645\u0647\u0646\u064A\u0629 \u0645\u0639\u062A\u0645\u062F\u0629" },
  // Roles & Job Titles
  { fr: "D\xE9veloppeur Full-Stack", en: "Full-Stack Developer", ar: "\u0645\u0637\u0648\u0631 \u0628\u0631\u0645\u062C\u064A\u0627\u062A \u0645\u062A\u0643\u0627\u0645\u0644" },
  { fr: "Lead D\xE9veloppeur Full-Stack", en: "Lead Full-Stack Developer", ar: "\u0642\u0627\u0626\u062F \u0641\u0631\u064A\u0642 \u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0627\u062A" },
  { fr: "Lead D\xE9veloppeur", en: "Lead Developer", ar: "\u0642\u0627\u0626\u062F \u0641\u0631\u064A\u0642 \u0627\u0644\u062A\u0637\u0648\u064A\u0631" },
  { fr: "D\xE9veloppeur Frontend", en: "Frontend Developer", ar: "\u0645\u0637\u0648\u0631 \u0648\u0627\u062C\u0647\u0627\u062A \u0623\u0645\u0627\u0645\u064A\u0629" },
  { fr: "D\xE9veloppeur Backend", en: "Backend Developer", ar: "\u0645\u0637\u0648\u0631 \u0648\u0627\u062C\u0647\u0627\u062A \u062E\u0644\u0641\u064A\u0629" },
  { fr: "D\xE9veloppeur Mobile", en: "Mobile App Developer", ar: "\u0645\u0637\u0648\u0631 \u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u062C\u0648\u0627\u0644" },
  { fr: "Ing\xE9nieur Logiciel", en: "Software Engineer", ar: "\u0645\u0647\u0646\u062F\u0633 \u0628\u0631\u0645\u062C\u064A\u0627\u062A" },
  { fr: "Chef de Projet", en: "Project Manager", ar: "\u0645\u062F\u064A\u0631 \u0645\u0634\u0627\u0631\u064A\u0639" },
  { fr: "Chef de Projet IT", en: "IT Project Manager", ar: "\u0645\u062F\u064A\u0631 \u0645\u0634\u0627\u0631\u064A\u0639 \u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A" },
  { fr: "Directeur G\xE9n\xE9ral", en: "Chief Executive Officer (CEO)", ar: "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u064A" },
  { fr: "Directeur Technique", en: "Chief Technology Officer (CTO)", ar: "\u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0646\u064A" },
  { fr: "Responsable Marketing", en: "Marketing Director", ar: "\u0645\u062F\u064A\u0631 \u0627\u0644\u062A\u0633\u0648\u064A\u0642" },
  { fr: "Charg\xE9 de Communication", en: "Communications Officer", ar: "\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0645" },
  { fr: "Designer UI/UX", en: "UI/UX Designer", ar: "\u0645\u0635\u0645\u0645 \u0648\u0627\u062C\u0647\u0627\u062A \u0648\u062A\u062C\u0631\u0628\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" },
  { fr: "Product Manager", en: "Product Manager", ar: "\u0645\u062F\u064A\u0631 \u0645\u0646\u062A\u062C\u0627\u062A" },
  { fr: "Data Scientist", en: "Data Scientist", ar: "\u0639\u0627\u0644\u0645 \u0628\u064A\u0627\u0646\u0627\u062A" },
  { fr: "Comptable", en: "Senior Accountant", ar: "\u0645\u062D\u0627\u0633\u0628 \u0639\u0627\u0645" },
  { fr: "Consultant", en: "Consultant", ar: "\u0645\u0633\u062A\u0634\u0627\u0631" },
  { fr: "Ing\xE9nieur DevOps", en: "DevOps Engineer", ar: "\u0645\u0647\u0646\u062F\u0633 DevOps" },
  { fr: "Architecte Cloud", en: "Cloud Solutions Architect", ar: "\u0645\u0647\u0646\u062F\u0633 \u062D\u0644\u0648\u0644 \u0633\u062D\u0627\u0628\u064A\u0629" },
  // Interests
  { fr: "Contributions Open Source", en: "Open Source Contributions", ar: "\u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 \u0641\u064A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0627\u062A \u0645\u0641\u062A\u0648\u062D\u0629 \u0627\u0644\u0645\u0635\u062F\u0631" },
  { fr: "Photographie de paysage", en: "Landscape Photography", ar: "\u0627\u0644\u062A\u0635\u0648\u064A\u0631 \u0627\u0644\u0641\u0648\u062A\u0648\u063A\u0631\u0627\u0641\u064A" },
  { fr: "Photographie", en: "Photography", ar: "\u0627\u0644\u062A\u0635\u0648\u064A\u0631" },
  { fr: "Course \xE0 pied", en: "Running / Marathon", ar: "\u0631\u064A\u0627\u0636\u0629 \u0627\u0644\u062C\u0631\u064A" },
  { fr: "Course \xE0 pied / Semi-marathon", en: "Marathon Running", ar: "\u0631\u064A\u0627\u0636\u0629 \u0627\u0644\u062C\u0631\u064A \u0648\u0627\u0644\u0645\u0627\u0631\u0627\u062B\u0648\u0646" },
  { fr: "Veille technologique", en: "Technology Scouting & Innovation", ar: "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0627\u0628\u062A\u0643\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0642\u0646\u064A\u0629" },
  { fr: "Voyages & D\xE9couverte", en: "Travel & Exploration", ar: "\u0627\u0644\u0633\u0641\u0631 \u0648\u0627\u0644\u0627\u0633\u062A\u0643\u0634\u0627\u0641" },
  { fr: "Musique", en: "Music", ar: "\u0627\u0644\u0645\u0648\u0633\u064A\u0642\u0649" },
  { fr: "Lecture", en: "Reading", ar: "\u0627\u0644\u0642\u0631\u0627\u0621\u0629" },
  { fr: "\xC9checs", en: "Chess", ar: "\u0627\u0644\u0634\u0637\u0631\u0646\u062C" },
  // Common Bullet Points & Phrases
  {
    fr: "Architecture et d\xE9ploiement de solutions SaaS cloud utilis\xE9es par plus de 250 000 utilisateurs actifs. R\xE9duction des temps de chargement de 42% gr\xE2ce \xE0 l\u2019optimisation du bundle et de la mise en cache.",
    en: "Architected and shipped scalable cloud SaaS platforms used by over 250,000 active users. Mentored junior engineers and reduced application load times by 42% through efficient code splitting and caching.",
    ar: "\u062A\u0635\u0645\u064A\u0645 \u0648\u0628\u0646\u0627\u0621 \u0645\u0646\u0635\u0627\u062A \u0633\u062D\u0627\u0628\u064A\u0629 \u062A\u062E\u062F\u0645 \u0623\u0643\u062B\u0631 \u0645\u0646 250,000 \u0645\u0633\u062A\u062E\u062F\u0645 \u0646\u0634\u0637\u060C \u0645\u0639 \u062A\u062D\u0633\u064A\u0646 \u0633\u0631\u0639\u0629 \u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0627\u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0628\u0646\u0633\u0628\u0629 42% \u0648\u062A\u0642\u0644\u064A\u0635 \u0648\u0642\u062A \u0627\u0644\u062A\u062D\u0645\u064A\u0644."
  },
  {
    fr: "Migration vers une architecture modulaire Next.js et TypeScript",
    en: "Led migration to modern Next.js and TypeScript micro-frontends",
    ar: "\u0642\u064A\u0627\u062F\u0629 \u0627\u0644\u062A\u062D\u0648\u0644 \u0627\u0644\u0645\u0639\u0645\u0627\u0631\u064A \u0646\u062D\u0648 \u062A\u0642\u0646\u064A\u0627\u062A Next.js \u0648 TypeScript \u0627\u0644\u062D\u062F\u064A\u062B\u0629"
  },
  {
    fr: "Conception d\u2019APIs REST et GraphQL hautement s\xE9curis\xE9es avec Node.js et PostgreSQL",
    en: "Engineered resilient REST and GraphQL APIs using Node.js and PostgreSQL",
    ar: "\u0628\u0646\u0627\u0621 \u0648\u062A\u0637\u0648\u064A\u0631 \u0648\u0627\u062C\u0647\u0627\u062A \u0628\u0631\u0645\u062C\u0629 \u0627\u0644\u062A\u0637\u0628\u064A\u0642\u0627\u062A (APIs) \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 Node.js \u0648 PostgreSQL"
  },
  {
    fr: "Mise en place de pipelines CI/CD automatis\xE9s r\xE9duisant le d\xE9lai de livraison de 60%",
    en: "Implemented automated CI/CD pipelines reducing deployment friction by 60%",
    ar: "\u0623\u062A\u0645\u062A\u0629 \u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0646\u0634\u0631 \u0627\u0644\u0645\u0633\u062A\u0645\u0631 (CI/CD) \u0644\u0631\u0641\u0639 \u0643\u0641\u0627\u0621\u0629 \u062F\u0648\u0631\u0629 \u0627\u0644\u062A\u0637\u0648\u064A\u0631 \u0628\u0646\u0633\u0628\u0629 60%"
  },
  {
    fr: "D\xE9veloppement de tableaux de bord analytiques complexes et de modules collaboratifs temps r\xE9el avec React et WebSockets.",
    en: "Developed high-conversion customer-facing dashboards and real-time collaboration features using React, Redux, and WebSockets.",
    ar: "\u062A\u0637\u0648\u064A\u0631 \u0644\u0648\u062D\u0627\u062A \u062A\u062D\u0643\u0645 \u0645\u062A\u0642\u062F\u0645\u0629 \u0644\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0623\u0646\u0638\u0645\u0629 \u062A\u0641\u0627\u0639\u0644\u064A\u0629 \u0644\u062D\u0638\u064A\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 React \u0648 WebSockets."
  }
];
function translateTerm(text2, targetLang) {
  if (!text2 || typeof text2 !== "string") return text2;
  const trimmed = text2.trim();
  for (const item of COMMON_TERMS) {
    if (item.fr.toLowerCase() === trimmed.toLowerCase() || item.en.toLowerCase() === trimmed.toLowerCase() || item.ar === trimmed) {
      return item[targetLang];
    }
  }
  let result = text2;
  COMMON_TERMS.slice(0, 15).forEach((item) => {
    const frRegex = new RegExp(`\\b${item.fr}\\b`, "gi");
    const enRegex = new RegExp(`\\b${item.en}\\b`, "gi");
    result = result.replace(frRegex, item[targetLang]).replace(enRegex, item[targetLang]);
  });
  return result;
}
function translateCV(cv, targetLang) {
  const isEn = targetLang === "en";
  const isAr = targetLang === "ar";
  const translatedSections = (cv.sections || []).map((sec) => {
    const mappedTitle = SECTION_TITLES_BY_LANG[sec.type]?.[targetLang] || sec.titre;
    if (sec.type === "profil") {
      const p = sec.contenu || {};
      let translatedResume = p.resume || "";
      let translatedTitrePro = p.titreProfessionnel || "";
      if (translatedTitrePro) {
        translatedTitrePro = translateTerm(translatedTitrePro, targetLang);
      }
      if (translatedResume) {
        if (translatedResume.includes("6 ans") || translatedResume.includes("Full-Stack") || translatedResume.includes("React, TypeScript")) {
          if (isEn) {
            translatedResume = "Dynamic Full-Stack Software Engineer with 6+ years of experience building modern, high-performance web applications with React, TypeScript, and Node.js. Passionate about clean architecture, developer ergonomics, and user-centric software.";
          } else if (isAr) {
            translatedResume = "\u0645\u0647\u0646\u062F\u0633 \u0628\u0631\u0645\u062C\u064A\u0627\u062A \u0645\u062A\u0643\u0627\u0645\u0644 \u064A\u0645\u062A\u0644\u0643 \u0623\u0643\u062B\u0631 \u0645\u0646 6 \u0633\u0646\u0648\u0627\u062A \u0645\u0646 \u0627\u0644\u062E\u0628\u0631\u0629 \u0641\u064A \u0628\u0646\u0627\u0621 \u0648\u062A\u0637\u0648\u064A\u0631 \u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u0648\u064A\u0628 \u0627\u0644\u0633\u062D\u0627\u0628\u064A\u0629 \u0627\u0644\u062D\u062F\u064A\u062B\u0629 \u0648\u0639\u0627\u0644\u064A\u0629 \u0627\u0644\u0623\u062F\u0627\u0621 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 React \u0648 TypeScript \u0648 Node.js. \u0634\u063A\u0648\u0641 \u0628\u0627\u0644\u0647\u0646\u062F\u0633\u0629 \u0627\u0644\u0645\u0639\u0645\u0627\u0631\u064A\u0629 \u0627\u0644\u0646\u0638\u064A\u0641\u0629 \u0648\u062A\u062C\u0631\u0628\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0633\u0644\u0633\u0629.";
          } else {
            translatedResume = "D\xE9veloppeur Full-Stack passionn\xE9 avec plus de 6 ans d\u2019exp\xE9rience dans la conception d\u2019applications web scalables et modernes avec React, TypeScript et Node.js. Rigoureux sur la qualit\xE9 du code, la performance et l\u2019exp\xE9rience utilisateur.";
          }
        }
      }
      return {
        ...sec,
        titre: mappedTitle,
        contenu: {
          ...p,
          titreProfessionnel: translatedTitrePro,
          resume: translatedResume
        }
      };
    }
    if (sec.type === "experience") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      const updatedItems = items.map((exp) => ({
        ...exp,
        poste: translateTerm(exp.poste || "", targetLang),
        dateFin: exp.actuel ? isEn ? "Present" : isAr ? "\u062D\u062A\u0649 \u0627\u0644\u0622\u0646" : "Pr\xE9sent" : translateTerm(exp.dateFin || "", targetLang),
        description: translateTerm(exp.description || "", targetLang),
        taches: (exp.taches || []).map((t) => translateTerm(t, targetLang))
      }));
      return {
        ...sec,
        titre: mappedTitle,
        contenu: updatedItems
      };
    }
    if (sec.type === "formation") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      const updatedItems = items.map((form) => ({
        ...form,
        diplome: translateTerm(form.diplome || "", targetLang),
        dateFin: form.actuel ? isEn ? "Present" : isAr ? "\u062D\u062A\u0649 \u0627\u0644\u0622\u0646" : "Pr\xE9sent" : translateTerm(form.dateFin || "", targetLang),
        description: translateTerm(form.description || "", targetLang)
      }));
      return {
        ...sec,
        titre: mappedTitle,
        contenu: updatedItems
      };
    }
    if (sec.type === "competences") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      const updatedItems = items.map((sk) => ({
        ...sk,
        nom: translateTerm(sk.nom || "", targetLang),
        listSousCompetences: (sk.listSousCompetences || []).map((sub) => ({
          ...sub,
          nom: translateTerm(sub.nom || "", targetLang)
        }))
      }));
      return {
        ...sec,
        titre: mappedTitle,
        contenu: updatedItems
      };
    }
    if (sec.type === "langues") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      const updatedItems = items.map((l) => ({
        ...l,
        langue: translateTerm(l.langue || "", targetLang),
        niveau: translateTerm(l.niveau || "", targetLang)
      }));
      return {
        ...sec,
        titre: mappedTitle,
        contenu: updatedItems
      };
    }
    if (sec.type === "interets") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      const updatedItems = items.map((it) => ({
        ...it,
        nom: translateTerm(it.nom || "", targetLang)
      }));
      return {
        ...sec,
        titre: mappedTitle,
        contenu: updatedItems
      };
    }
    return {
      ...sec,
      titre: mappedTitle
    };
  });
  let newTitle = cv.titre || "CV";
  if (isEn && !newTitle.includes("(EN)")) {
    newTitle = newTitle.replace(/\s*\((?:FR|AR)\)/gi, "") + " (EN)";
  } else if (isAr && !newTitle.includes("(AR)")) {
    newTitle = newTitle.replace(/\s*\((?:FR|EN)\)/gi, "") + " (AR)";
  } else if (!isEn && !isAr && !newTitle.includes("(FR)")) {
    newTitle = newTitle.replace(/\s*\((?:EN|AR)\)/gi, "") + " (FR)";
  }
  return {
    ...cv,
    titre: newTitle,
    langue: targetLang,
    sections: translatedSections,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// src/services/emailService.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
var transporterInstance = null;
function getEmailTransporter() {
  if (transporterInstance) {
    return transporterInstance;
  }
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const smtpSecure = process.env.SMTP_SECURE !== "false";
  if (!smtpUser || !smtpPass) {
    console.warn("[EMAIL SERVICE] SMTP_USER ou SMTP_PASS manquant. Les e-mails seront logg\xE9s mais non exp\xE9di\xE9s.");
    return null;
  }
  try {
    transporterInstance = import_nodemailer.default.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    console.log(`[EMAIL SERVICE] Transporteur SMTP initialis\xE9 avec succ\xE8s pour ${smtpUser} (${smtpHost}:${smtpPort})`);
  } catch (err) {
    console.error("[EMAIL SERVICE] Erreur lors de la cr\xE9ation du transporteur SMTP:", err);
    return null;
  }
  return transporterInstance;
}
function buildHtmlEmailTemplate({
  title,
  preheader,
  badge,
  badgeColor = "#2563eb",
  contentHtml,
  actionText,
  actionUrl,
  footerNote
}) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #0f172a; padding: 30px 10px; }
    .main-table { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2); }
    .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 32px 30px; text-align: center; border-bottom: 3px solid #3b82f6; }
    .logo-badge { display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff; font-weight: 900; font-size: 16px; padding: 8px 16px; border-radius: 10px; letter-spacing: 0.5px; }
    .header-title { color: #ffffff; font-size: 22px; font-weight: 800; margin: 16px 0 0 0; }
    .body-content { padding: 36px 32px; color: #334155; font-size: 15px; line-height: 1.65; }
    .badge-pill { display: inline-block; background-color: ${badgeColor}15; color: ${badgeColor}; border: 1px solid ${badgeColor}30; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; }
    .btn-action { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 30px; border-radius: 10px; margin-top: 24px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35); text-align: center; }
    .footer { background-color: #f8fafc; padding: 24px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td class="header">
          <div class="logo-badge">MYCV BUILDER</div>
          <h1 class="header-title">${title}</h1>
        </td>
      </tr>
      <tr>
        <td class="body-content">
          ${badge ? `<div class="badge-pill">${badge}</div>` : ""}
          ${contentHtml}
          ${actionText && actionUrl ? `
            <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
              <a href="${actionUrl}" class="btn-action" target="_blank">${actionText} &rarr;</a>
            </div>
          ` : ""}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p style="margin: 0 0 8px 0;"><strong>MyCV Builder</strong> &bull; Plateforme Professionnelle de Cr\xE9ation de CV & IA</p>
          <p style="margin: 0;">${footerNote || "Vous recevez cet e-mail suite \xE0 votre inscription ou vos activit\xE9s sur MyCV Builder."}</p>
          <p style="margin: 12px 0 0 0; color: #94a3b8; font-size: 11px;">&copy; ${currentYear} MyCV Builder. Tous droits r\xE9serv\xE9s.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
}
async function sendEmailSafe(options) {
  const transporter = getEmailTransporter();
  const smtpUser = process.env.SMTP_USER || "";
  const from = process.env.SMTP_FROM || `"MyCV Builder" <${smtpUser}>`;
  if (!transporter) {
    console.log(`[EMAIL DISPATCH SIMULATED] Vers: ${Array.isArray(options.to) ? options.to.join(", ") : options.to} | Sujet: "${options.subject}"`);
    return true;
  }
  try {
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject
    });
    console.log(`[EMAIL DISPATCH SUCCESS] E-mail envoy\xE9 \xE0 ${options.to} (ID: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error(`[EMAIL DISPATCH ERROR] \xC9chec de l'envoi \xE0 ${options.to}:`, err?.message || err);
    return false;
  }
}
async function sendWelcomeEmail(userEmail, userName, appUrl = "https://mycvbuilder.com") {
  const title = "Bienvenue sur MyCV Builder !";
  const contentHtml = `
    <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Bonjour ${userName || "Cher Candidat"},</h2>
    <p>Nous sommes ravis de vous compter parmi les cr\xE9ateurs de <strong>MyCV Builder</strong> ! Votre compte a \xE9t\xE9 cr\xE9\xE9 avec succ\xE8s.</p>
    <p>Vous avez d\xE9sormais acc\xE8s \xE0 nos outils d'\xE9lite pour d\xE9crocher vos futurs entretiens :</p>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li><strong>59+ Mod\xE8les de CV Professionnels</strong> adapt\xE9s \xE0 tous les secteurs.</li>
      <li><strong>Creator Studio Avanc\xE9</strong> avec personnalisation typographique, couleurs et formes.</li>
      <li><strong>Suite IA Intelligente</strong> : Ciblage d'offres d'emploi, Lettres de motivation et Profil LinkedIn optimis\xE9.</li>
      <li><strong>Export PDF Haute D\xE9finition</strong> pr\xEAt pour les recruteurs et les syst\xE8mes ATS.</li>
    </ul>
    <p>Commencez d\xE8s aujourd'hui \xE0 cr\xE9er votre premier CV remarquable en quelques minutes.</p>
  `;
  const html = buildHtmlEmailTemplate({
    title,
    badge: "Nouveau Compte",
    badgeColor: "#10b981",
    contentHtml,
    actionText: "Cr\xE9er mon premier CV",
    actionUrl: `${appUrl}/#gallery`
  });
  return sendEmailSafe({
    to: userEmail,
    subject: "\u{1F389} Bienvenue sur MyCV Builder - Cr\xE9ez votre CV d'impact !",
    html
  });
}
async function sendSubscriptionConfirmationEmail({
  userEmail,
  userName,
  planName,
  planTier,
  amount,
  currency = "FCFA",
  durationDays,
  expiresAt,
  appUrl = "https://mycvbuilder.com"
}) {
  const formattedExpiry = new Date(expiresAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const title = `Abonnement ${planName.toUpperCase()} Activ\xE9 !`;
  const contentHtml = `
    <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">F\xE9licitations ${userName || ""} !</h2>
    <p>Votre paiement a \xE9t\xE9 valid\xE9 avec succ\xE8s. Votre forfait <strong>${planName}</strong> est d\xE9sormais actif sur votre compte.</p>
    
    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6;">
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>D\xE9tails de l'abonnement :</strong></p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.7;">
        <li>Forfait : <strong>${planName}</strong> (${planTier})</li>
        <li>Montant : <strong>${amount} ${currency}</strong></li>
        <li>Dur\xE9e d'acc\xE8s : <strong>${durationDays} jours</strong></li>
        <li>Date d'expiration : <strong>${formattedExpiry}</strong></li>
      </ul>
    </div>

    <p>Toutes les fonctionnalit\xE9s associ\xE9es \xE0 votre formule (mod\xE8les Premium, IA Gemini avanc\xE9e, exports illimit\xE9s) sont imm\xE9diatement d\xE9verrouill\xE9es.</p>
  `;
  const html = buildHtmlEmailTemplate({
    title,
    badge: "Paiement Confirm\xE9",
    badgeColor: "#2563eb",
    contentHtml,
    actionText: "Acc\xE9der \xE0 mon Espace",
    actionUrl: `${appUrl}/#gallery`
  });
  return sendEmailSafe({
    to: userEmail,
    subject: `\u2705 Confirmation de votre abonnement ${planName} - MyCV Builder`,
    html
  });
}
async function sendFeatureUnlockedEmail({
  userEmail,
  userName,
  featureTitle,
  featureMessage,
  actionLink = "gallery",
  badge = "100% GRATUIT",
  appUrl = "https://mycvbuilder.com"
}) {
  const contentHtml = `
    <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Bonjour ${userName || ""},</h2>
    <p>${featureMessage}</p>
    <p>Profitez-en d\xE8s maintenant pour mettre \xE0 jour votre CV avec les derniers designs et fonctionnalit\xE9s d\xE9bloqu\xE9s !</p>
  `;
  const html = buildHtmlEmailTemplate({
    title: featureTitle,
    badge,
    badgeColor: "#10b981",
    contentHtml,
    actionText: "D\xE9couvrir les nouveaut\xE9s",
    actionUrl: `${appUrl}/#${actionLink}`
  });
  return sendEmailSafe({
    to: userEmail,
    subject: `${featureTitle} - MyCV Builder`,
    html
  });
}
async function sendPasswordResetEmail({
  userEmail,
  userName,
  resetUrl
}) {
  const title = "R\xE9initialisation de votre mot de passe";
  const contentHtml = `
    <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Bonjour ${userName || "Cher Utilisateur"},</h2>
    <p>Nous avons re\xE7u une demande de r\xE9initialisation de mot de passe pour votre compte MyCV Builder associ\xE9 \xE0 l'adresse e-mail : <strong>${userEmail}</strong>.</p>
    <p>Pour choisir un nouveau mot de passe s\xE9curis\xE9, veuillez cliquer sur le bouton ci-dessous :</p>
    <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
      <p style="margin: 0;">\u23F0 <strong>Attention :</strong> Ce lien est \xE0 usage unique et expirera dans <strong>1 heure</strong> pour des raisons de s\xE9curit\xE9.</p>
    </div>
    <p>Si vous n'\xEAtes pas \xE0 l'origine de cette demande, vous pouvez ignorer cet e-mail en toute s\xE9curit\xE9. Votre mot de passe actuel restera inchang\xE9.</p>
  `;
  const html = buildHtmlEmailTemplate({
    title,
    badge: "S\xE9curit\xE9 Compte",
    badgeColor: "#ef4444",
    contentHtml,
    actionText: "R\xE9initialiser mon mot de passe",
    actionUrl: resetUrl,
    footerNote: "Ce lien de s\xE9curit\xE9 est strictement personnel. Ne le partagez avec personne."
  });
  return sendEmailSafe({
    to: userEmail,
    subject: "\u{1F510} R\xE9initialisation de votre mot de passe - MyCV Builder",
    html
  });
}

// server.ts
var app = (0, import_express.default)();
var PORT = 3e3;
process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION PREVENTED CRASH]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT EXCEPTION PREVENTED CRASH]", err);
});
app.set("trust proxy", 1);
app.use((0, import_cors.default)({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : true,
  credentials: true
}));
var isDev = process.env.NODE_ENV !== "production";
app.use((0, import_helmet.default)({
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https://*"],
      connectSrc: ["'self'", "https://api.ikeepay.com", "https://*.googleapis.com", "https://*.firebaseio.com"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
var JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: process.env.JWT_SECRET is required in production.");
    process.exit(1);
  }
  JWT_SECRET = import_crypto2.default.randomBytes(32).toString("hex");
  console.warn("[SECURITY WARNING] process.env.JWT_SECRET non d\xE9fini. Un secret al\xE9atoire temporaire a \xE9t\xE9 g\xE9n\xE9r\xE9 pour cette instance de d\xE9veloppement.");
}
var IKEEPAY_PUBLIC_KEY = process.env.IKEEPAY_PUBLIC_KEY || "";
var IKEEPAY_PRIVATE_KEY = process.env.IKEEPAY_PRIVATE_KEY || "";
var IKEEPAY_WEBHOOK_SECRET = process.env.IKEEPAY_WEBHOOK_SECRET || "";
app.use(import_express.default.json({ limit: "25mb" }));
var authLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 300,
  // Increased to 300 auth attempts per IP
  message: { error: "Trop de tentatives de connexion/inscription. Veuillez r\xE9essayer dans 15 minutes." },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false
  }
});
var paymentLimiter = (0, import_express_rate_limit.default)({
  windowMs: 10 * 60 * 1e3,
  max: 50,
  message: { error: "Trop de requ\xEAtes de paiement. Veuillez patienter un instant." },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false
  }
});
var aiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 60,
  // max 60 AI generations per 15 min per IP
  message: { error: "Trop de demandes de g\xE9n\xE9ration IA. Veuillez patienter 15 minutes." },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false
  }
});
var importLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 30,
  // max 30 document imports per 15 min per IP
  message: { error: "Trop de demandes d'importation de document. Veuillez patienter 15 minutes." },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false
  }
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/session", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/payment", paymentLimiter);
app.use("/api/ai", aiLimiter);
app.use("/api/import", importLimiter);
async function extractTextFromPDF(buffer) {
  const fn = typeof pdfParseModule === "function" ? pdfParseModule : pdfParseModule?.default;
  if (typeof fn === "function") {
    try {
      const res = await fn(buffer);
      if (res && typeof res.text === "string") return res.text;
    } catch (e) {
      console.warn("pdf-parse function export failed:", e);
    }
  }
  const PDFParseClass = pdfParseModule?.PDFParse || pdfParseModule?.default?.PDFParse;
  if (PDFParseClass) {
    const parser = new PDFParseClass({ data: buffer });
    try {
      const result = await parser.getText();
      if (result && typeof result.text === "string") return result.text;
    } finally {
      if (typeof parser.destroy === "function") {
        try {
          await parser.destroy();
        } catch {
        }
      }
    }
  }
  throw new Error("Impossible d'initialiser le moteur de lecture PDF.");
}
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});
var DB_FILE = import_path2.default.join(process.cwd(), "data", "db.json");
if (!import_fs2.default.existsSync(import_path2.default.dirname(DB_FILE))) {
  import_fs2.default.mkdirSync(import_path2.default.dirname(DB_FILE), { recursive: true });
}
function loadDB() {
  const defaultSettings = {
    paiementActif: true,
    pricingPlans: [
      {
        id: "plan-decouverte",
        code: "decouverte",
        nom: "Pack D\xE9couverte",
        prix: 1e3,
        prixUsd: 1.7,
        devise: "FCFA",
        dureeJours: 7,
        description: "Acc\xE8s illimit\xE9 aux 59+ mod\xE8les HD et au Creator Studio pendant 7 jours",
        actif: true
      },
      {
        id: "plan-classique",
        code: "classique",
        nom: "Pack Classique",
        prix: 2500,
        prixUsd: 4.2,
        devise: "FCFA",
        dureeJours: 30,
        description: "Acc\xE8s illimit\xE9 aux 59+ mod\xE8les HD et traducteur 3 langues pendant 1 mois",
        actif: true
      },
      {
        id: "plan-premium",
        code: "premium",
        nom: "Pack Premium VIP",
        prix: 5e3,
        prixUsd: 8.5,
        devise: "FCFA",
        dureeJours: 30,
        description: "Suite IA compl\xE8te : Ciblage offres, Lettres de motivation, Profil LinkedIn pendant 1 mois",
        actif: true
      }
    ]
  };
  try {
    if (import_fs2.default.existsSync(DB_FILE)) {
      const raw = import_fs2.default.readFileSync(DB_FILE, "utf-8");
      const parsedDB = JSON.parse(raw);
      let needsSave = false;
      if (!parsedDB.letters) {
        parsedDB.letters = [];
        needsSave = true;
      }
      if (!parsedDB.appSettings) {
        parsedDB.appSettings = defaultSettings;
        needsSave = true;
      } else if (parsedDB.appSettings.pricingPlans) {
        const hasDecouverte = parsedDB.appSettings.pricingPlans.some((p) => p.code === "decouverte");
        if (!hasDecouverte) {
          parsedDB.appSettings.pricingPlans.unshift(defaultSettings.pricingPlans[0]);
          needsSave = true;
        }
      }
      const adminEmail2 = (process.env.ADMIN_INITIAL_EMAIL || "").toLowerCase().trim();
      const adminPassword2 = process.env.ADMIN_INITIAL_PASSWORD;
      if (adminEmail2 && adminPassword2) {
        const existingAdmin = parsedDB.users.find((u) => u.email.toLowerCase().trim() === adminEmail2);
        if (!existingAdmin) {
          const adminPassHash = import_bcryptjs2.default.hashSync(adminPassword2, 12);
          parsedDB.users.push({
            id: `u-admin-${Date.now()}`,
            nom: "Administrateur Principal",
            email: adminEmail2,
            motDePasseHash: adminPassHash,
            role: "ADMIN",
            langue: "fr",
            subscriptionTier: "premium",
            subscriptionExpiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1e3).toISOString(),
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          needsSave = true;
        }
      }
      if (needsSave) {
        saveDB(parsedDB);
      }
      return parsedDB;
    }
  } catch (err) {
    console.error("Error reading db.json:", err);
  }
  const initialDB = {
    appSettings: defaultSettings,
    users: [
      {
        id: "u-demo-1",
        nom: "Jean Dupont",
        email: "jean.dupont@exemple.com",
        motDePasseHash: import_bcryptjs2.default.hashSync("demo1234", 10),
        role: "USER",
        langue: "fr",
        subscriptionTier: "freemium",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ],
    cvs: [],
    payments: [],
    letters: []
  };
  const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || "").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (adminEmail && adminPassword) {
    initialDB.users.push({
      id: `u-admin-${Date.now()}`,
      nom: "Administrateur Principal",
      email: adminEmail,
      motDePasseHash: import_bcryptjs2.default.hashSync(adminPassword, 12),
      role: "ADMIN",
      langue: "fr",
      subscriptionTier: "premium",
      subscriptionExpiresAt: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1e3).toISOString(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  saveDB(initialDB);
  return initialDB;
}
function saveDB(data) {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    import_fs2.default.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    import_fs2.default.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error("Error saving db.json:", err);
  }
}
async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentification requise." });
  }
  const token = authHeader.split(" ")[1];
  if (!token || token === "undefined" || token === "null") {
    return res.status(401).json({ error: "Token manquant ou invalide." });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Token invalide ou expir\xE9." });
    }
    let user;
    if (decoded.userId) {
      user = await dbAdapter.findUserById(decoded.userId);
    }
    if (!user && decoded.email) {
      user = await dbAdapter.findUserByEmail(decoded.email);
    }
    if (!user && decoded.sub) {
      user = await dbAdapter.findUserById(decoded.sub);
    }
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouv\xE9 ou session expir\xE9e." });
    }
    if (user.role !== "ADMIN" && user.subscriptionExpiresAt) {
      const isExpired = new Date(user.subscriptionExpiresAt).getTime() < Date.now();
      if (isExpired && user.subscriptionTier !== "freemium") {
        await dbAdapter.updateUser(user.id, { subscriptionTier: "freemium" });
        user.subscriptionTier = "freemium";
      }
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide ou expir\xE9." });
  }
}
async function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.split(" ")[1];
  if (!token || token === "undefined" || token === "null") {
    return next();
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    if (decoded) {
      let user;
      if (decoded.userId) {
        user = await dbAdapter.findUserById(decoded.userId);
      }
      if (!user && decoded.email) {
        user = await dbAdapter.findUserByEmail(decoded.email);
      }
      if (!user && decoded.sub) {
        user = await dbAdapter.findUserById(decoded.sub);
      }
      if (user) {
        if (user.role !== "ADMIN" && user.subscriptionExpiresAt) {
          const isExpired = new Date(user.subscriptionExpiresAt).getTime() < Date.now();
          if (isExpired && user.subscriptionTier !== "freemium") {
            await dbAdapter.updateUser(user.id, { subscriptionTier: "freemium" });
            user.subscriptionTier = "freemium";
          }
        }
        req.user = user;
      }
    }
  } catch (err) {
  }
  next();
}
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Acc\xE8s r\xE9serv\xE9 aux administrateurs." });
  }
  next();
}
function checkSubscriptionGate(requiredTier) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Veuillez vous connecter pour utiliser les fonctionnalit\xE9s d'assistance intelligente.",
        requiresAuth: true
      });
    }
    if (req.user.role === "ADMIN") {
      return next();
    }
    const settings = await dbAdapter.getAppSettings();
    if (settings && settings.paiementActif === false) {
      return next();
    }
    const userTier = req.user.subscriptionTier;
    const allowedTiers = ["decouverte", "classique", "premium"];
    if (!userTier || !allowedTiers.includes(userTier) || userTier === "freemium") {
      return res.status(403).json({
        error: "Cette fonctionnalit\xE9 requiert un abonnement actif.",
        requiresUpgrade: true,
        code: "UPGRADE_REQUIRED"
      });
    }
    if (userTier === "decouverte") {
      return res.status(403).json({
        error: "Le Pack D\xE9couverte donne acc\xE8s aux mod\xE8les HD et au Studio. Les fonctionnalit\xE9s IA n\xE9cessitent la formule Classique ou Premium VIP.",
        requiresUpgrade: true,
        code: "UPGRADE_REQUIRED"
      });
    }
    if (requiredTier === "classique") {
      if (userTier !== "classique" && userTier !== "premium") {
        return res.status(403).json({
          error: "Cette fonctionnalit\xE9 requiert la formule Classique ou Premium VIP.",
          requiresUpgrade: true,
          code: "UPGRADE_REQUIRED"
        });
      }
    } else if (requiredTier === "premium") {
      if (userTier !== "premium") {
        return res.status(403).json({
          error: "Cette fonctionnalit\xE9 avanc\xE9e requiert un abonnement Premium VIP actif.",
          requiresUpgrade: true,
          code: "UPGRADE_REQUIRED"
        });
      }
    }
    const isExpired = req.user.subscriptionExpiresAt ? new Date(req.user.subscriptionExpiresAt).getTime() < Date.now() : false;
    if (isExpired) {
      return res.status(403).json({
        error: "Votre abonnement a expir\xE9. Veuillez renouveler votre formule pour continuer \xE0 utiliser les fonctionnalit\xE9s intelligentes.",
        requiresUpgrade: true,
        code: "SUBSCRIPTION_EXPIRED"
      });
    }
    next();
  };
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
var geminiAi = null;
function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiAi) {
    geminiAi = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });
  }
  return geminiAi;
}
function safeJsonParse(text2, fallback) {
  if (!text2 || typeof text2 !== "string") return fallback;
  try {
    const cleaned = text2.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(cleaned);
  } catch {
    try {
      const match = text2.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
    } catch {
    }
    return fallback;
  }
}
async function generateGeminiContentWithFallback(ai, contents) {
  const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: { responseMimeType: "application/json" }
        });
        if (response?.text) return response.text;
      } catch (err) {
        const status = Number(err?.status || err?.statusCode || 0);
        const isTransient = status === 503 || status === 429 || status === 500 || status === 504;
        if (isTransient && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          continue;
        }
        if (attempt === 0 && (status === 400 || !isTransient)) {
          try {
            const fallbackResponse = await ai.models.generateContent({
              model,
              contents
            });
            if (fallbackResponse?.text) return fallbackResponse.text;
          } catch {
          }
        }
        break;
      }
    }
  }
  return null;
}
function formatParsedDataToSections(parsed, langue = "fr") {
  const sections = [];
  const isEn = langue === "en";
  if (parsed.profil) {
    sections.push({
      id: "sec-profil",
      type: "profil",
      titre: isEn ? "Profile & Contact" : "Profil & Coordonn\xE9es",
      ordre: 1,
      visible: true,
      contenu: {
        nomComplet: parsed.profil.nomComplet || "",
        titreProfessionnel: parsed.profil.titreProfessionnel || "",
        email: parsed.profil.email || "",
        telephone: parsed.profil.telephone || "",
        adresse: parsed.profil.adresse || "",
        website: parsed.profil.website || "",
        linkedin: parsed.profil.linkedin || "",
        resume: parsed.profil.resume || ""
      }
    });
  }
  if (Array.isArray(parsed.experiences) && parsed.experiences.length > 0) {
    sections.push({
      id: "sec-exp",
      type: "experience",
      titre: isEn ? "Work Experience" : "Exp\xE9riences professionnelles",
      ordre: 2,
      visible: true,
      contenu: parsed.experiences.map((exp, idx) => ({
        id: `exp-ai-${idx}-${Date.now()}`,
        poste: exp.poste || "Poste occup\xE9",
        entreprise: exp.entreprise || "Entreprise",
        ville: exp.ville || "",
        dateDebut: exp.dateDebut || "",
        dateFin: exp.dateFin || "",
        actuel: Boolean(exp.actuel),
        description: exp.description || ""
      }))
    });
  }
  if (Array.isArray(parsed.formations) && parsed.formations.length > 0) {
    sections.push({
      id: "sec-edu",
      type: "formation",
      titre: isEn ? "Education" : "Formations & Dipl\xF4mes",
      ordre: 3,
      visible: true,
      contenu: parsed.formations.map((edu, idx) => ({
        id: `edu-ai-${idx}-${Date.now()}`,
        diplome: edu.diplome || "Dipl\xF4me",
        etablissement: edu.etablissement || "\xC9tablissement",
        ville: edu.ville || "",
        dateDebut: edu.dateDebut || "",
        dateFin: edu.dateFin || "",
        description: edu.description || ""
      }))
    });
  }
  if (Array.isArray(parsed.competences) && parsed.competences.length > 0) {
    sections.push({
      id: "sec-skills",
      type: "competences",
      titre: isEn ? "Skills" : "Comp\xE9tences",
      ordre: 4,
      visible: true,
      contenu: parsed.competences.map((sk, idx) => ({
        id: `sk-ai-${idx}-${Date.now()}`,
        nom: typeof sk === "string" ? sk : sk.nom || "Comp\xE9tence",
        niveau: typeof sk === "object" && typeof sk.niveau === "number" ? sk.niveau : 4
      }))
    });
  }
  if (Array.isArray(parsed.langues) && parsed.langues.length > 0) {
    sections.push({
      id: "sec-lang",
      type: "langues",
      titre: isEn ? "Languages" : "Langues",
      ordre: 5,
      visible: true,
      contenu: parsed.langues.map((l, idx) => ({
        id: `lang-ai-${idx}-${Date.now()}`,
        langue: typeof l === "string" ? l : l.langue || "Langue",
        niveau: typeof l === "object" ? l.niveau || "Courant" : "Courant"
      }))
    });
  }
  if (Array.isArray(parsed.projets) && parsed.projets.length > 0) {
    sections.push({
      id: "sec-proj",
      type: "projets",
      titre: isEn ? "Projects" : "Projets",
      ordre: 6,
      visible: true,
      contenu: parsed.projets.map((p, idx) => ({
        id: `proj-ai-${idx}-${Date.now()}`,
        nom: p.nom || "Projet",
        role: p.role || "",
        lien: p.lien || "",
        description: p.description || ""
      }))
    });
  }
  return sections;
}
function buildPlainTextFromParsed(data) {
  if (!data) return "";
  const parts = [];
  if (Array.isArray(data)) {
    for (const sec of data) {
      if (sec.type === "profil" && sec.contenu) {
        if (sec.contenu.nomComplet) parts.push(sec.contenu.nomComplet);
        if (sec.contenu.titreProfessionnel) parts.push(sec.contenu.titreProfessionnel);
        const contacts = [sec.contenu.email, sec.contenu.telephone, sec.contenu.adresse].filter(Boolean);
        if (contacts.length) parts.push(contacts.join(" | "));
        if (sec.contenu.resume) parts.push(`
PROFIL:
${sec.contenu.resume}`);
      } else if (sec.type === "experience" && Array.isArray(sec.contenu)) {
        parts.push("\nEXP\xC9RIENCES:");
        sec.contenu.forEach((exp) => {
          parts.push(`- ${exp.poste || ""} chez ${exp.entreprise || ""} (${exp.dateDebut || ""} - ${exp.dateFin || ""}): ${exp.description || ""}`);
        });
      } else if (sec.type === "formation" && Array.isArray(sec.contenu)) {
        parts.push("\nFORMATIONS:");
        sec.contenu.forEach((f) => {
          parts.push(`- ${f.diplome || ""} \xE0 ${f.etablissement || ""} (${f.dateFin || ""}): ${f.description || ""}`);
        });
      } else if (sec.type === "competences" && Array.isArray(sec.contenu)) {
        parts.push("\nCOMP\xC9TENCES:");
        parts.push(sec.contenu.map((c) => typeof c === "string" ? c : c.nom).filter(Boolean).join(", "));
      }
    }
    return parts.join("\n");
  }
  if (data.profil) {
    if (data.profil.nomComplet) parts.push(data.profil.nomComplet);
    if (data.profil.titreProfessionnel) parts.push(data.profil.titreProfessionnel);
    const contacts = [data.profil.email, data.profil.telephone, data.profil.adresse].filter(Boolean);
    if (contacts.length) parts.push(contacts.join(" | "));
    if (data.profil.resume) parts.push(`
PROFIL:
${data.profil.resume}`);
  }
  if (Array.isArray(data.experiences) && data.experiences.length > 0) {
    parts.push("\nEXP\xC9RIENCES:");
    data.experiences.forEach((exp) => {
      parts.push(`- ${exp.poste || ""} chez ${exp.entreprise || ""} (${exp.dateDebut || ""} - ${exp.dateFin || ""}): ${exp.description || ""}`);
    });
  }
  if (Array.isArray(data.formations) && data.formations.length > 0) {
    parts.push("\nFORMATIONS:");
    data.formations.forEach((f) => {
      parts.push(`- ${f.diplome || ""} \xE0 ${f.etablissement || ""} (${f.dateFin || ""}): ${f.description || ""}`);
    });
  }
  if (Array.isArray(data.competences) && data.competences.length > 0) {
    parts.push("\nCOMP\xC9TENCES:");
    parts.push(data.competences.map((c) => typeof c === "string" ? c : c.nom).filter(Boolean).join(", "));
  }
  return parts.join("\n");
}
async function parseCVTextWithGemini(extractedText, langue = "fr") {
  const ai = getGemini();
  if (!ai) return null;
  try {
    const prompt = `Tu es un expert mondial en recrutement et analyse de CV.
Analyse scrupuleusement ce texte de CV brut et extrait l'int\xE9gralit\xE9 des informations (coordonn\xE9es, profil, exp\xE9riences professionnelles, formations/dipl\xF4mes, comp\xE9tences cl\xE9s, langues parl\xE9es, projets).

Texte brut du CV :
"""
${extractedText.slice(0, 1e4)}
"""

R\xE9ponds STRICTEMENT sous la forme d'un objet JSON valide au format exact suivant :
{
  "profil": {
    "nomComplet": "Nom et Pr\xE9nom du candidat",
    "titreProfessionnel": "Titre ou poste principal",
    "email": "adresse e-mail ou ''",
    "telephone": "num\xE9ro de t\xE9l\xE9phone ou ''",
    "adresse": "ville/pays ou adresse ou ''",
    "website": "site web ou portfolio ou ''",
    "linkedin": "lien linkedin ou ''",
    "resume": "r\xE9sum\xE9 / pr\xE9sentation du candidat"
  },
  "experiences": [
    {
      "poste": "Intitul\xE9 du poste",
      "entreprise": "Nom de l'entreprise",
      "ville": "Lieu / Ville",
      "dateDebut": "Date de d\xE9but (ex: Jan 2020 ou 2020)",
      "dateFin": "Date de fin (ex: Pr\xE9sent ou 2023)",
      "actuel": false,
      "description": "Description d\xE9taill\xE9e des t\xE2ches et r\xE9alisations"
    }
  ],
  "formations": [
    {
      "diplome": "Dipl\xF4me ou certification obtenu",
      "etablissement": "Universit\xE9, \xC9cole ou Organisme",
      "ville": "Ville / Pays",
      "dateDebut": "Ann\xE9e de d\xE9but",
      "dateFin": "Ann\xE9e de fin ou d'obtention",
      "description": "D\xE9tails / Mentions"
    }
  ],
  "competences": [
    { "nom": "Nom de la comp\xE9tence", "niveau": 4 }
  ],
  "langues": [
    { "langue": "Nom de la langue", "niveau": "Courant / Maternelle / Interm\xE9diaire" }
  ],
  "projets": [
    { "nom": "Nom du projet", "role": "R\xF4le dans le projet", "lien": "", "description": "Description du projet" }
  ]
}`;
    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse(responseText, null);
    if (!parsed) return null;
    const sections = formatParsedDataToSections(parsed, langue);
    return sections.length > 0 ? sections : null;
  } catch (err) {
    console.error("[PARSE CV AI ERROR]", err);
    return null;
  }
}
async function parseCVMultimodalWithGemini(buffer, mimeType, langue = "fr") {
  const ai = getGemini();
  if (!ai) return { text: "", sections: null };
  const prompt = `Tu es un expert mondial en analyse de CV et reconnaissance optique de documents (OCR).
Analyse scrupuleusement ce document de CV (qui peut \xEAtre un document scann\xE9, une image, ou un PDF sans texte vectoriel).
1. Lis et retranscris l'int\xE9gralit\xE9 du texte visible de ce CV de mani\xE8re exhaustive dans le champ "texteIntegral".
2. Extrais et structure l'int\xE9gralit\xE9 des informations (coordonn\xE9es, profil, exp\xE9riences professionnelles, formations/dipl\xF4mes, comp\xE9tences cl\xE9s, langues parl\xE9es, projets).

R\xE9ponds STRICTEMENT sous la forme d'un objet JSON valide au format exact suivant :
{
  "texteIntegral": "L'int\xE9gralit\xE9 du texte extrait mot \xE0 mot du document...",
  "profil": {
    "nomComplet": "Nom et Pr\xE9nom du candidat",
    "titreProfessionnel": "Titre ou poste principal",
    "email": "adresse e-mail ou ''",
    "telephone": "num\xE9ro de t\xE9l\xE9phone ou ''",
    "adresse": "ville/pays ou adresse ou ''",
    "website": "site web ou portfolio ou ''",
    "linkedin": "lien linkedin ou ''",
    "resume": "r\xE9sum\xE9 / pr\xE9sentation du candidat"
  },
  "experiences": [
    {
      "poste": "Intitul\xE9 du poste",
      "entreprise": "Nom de l'entreprise",
      "ville": "Lieu / Ville",
      "dateDebut": "Date de d\xE9but",
      "dateFin": "Date de fin",
      "actuel": false,
      "description": "Description d\xE9taill\xE9e des t\xE2ches et r\xE9alisations"
    }
  ],
  "formations": [
    {
      "diplome": "Dipl\xF4me ou certification obtenu",
      "etablissement": "Universit\xE9, \xC9cole ou Organisme",
      "ville": "Ville / Pays",
      "dateDebut": "Ann\xE9e de d\xE9but",
      "dateFin": "Ann\xE9e de fin ou d'obtention",
      "description": "D\xE9tails / Mentions"
    }
  ],
  "competences": [
    { "nom": "Nom de la comp\xE9tence", "niveau": 4 }
  ],
  "langues": [
    { "langue": "Nom de la langue", "niveau": "Courant / Maternelle / Interm\xE9diaire" }
  ],
  "projets": [
    { "nom": "Nom du projet", "role": "R\xF4le dans le projet", "lien": "", "description": "Description du projet" }
  ]
}`;
  let normalizedMime = mimeType || "application/pdf";
  if (!normalizedMime || normalizedMime === "application/octet-stream") {
    normalizedMime = "application/pdf";
  }
  const contents = {
    parts: [
      { text: prompt },
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: normalizedMime
        }
      }
    ]
  };
  try {
    const responseText = await generateGeminiContentWithFallback(ai, contents);
    const parsed = safeJsonParse(responseText, null);
    if (!parsed) return { text: "", sections: null };
    const sections = formatParsedDataToSections(parsed, langue);
    const text2 = parsed.texteIntegral && typeof parsed.texteIntegral === "string" && parsed.texteIntegral.trim().length > 15 ? parsed.texteIntegral.trim() : buildPlainTextFromParsed(parsed);
    return { text: text2, sections: sections.length > 0 ? sections : null };
  } catch (err) {
    console.error("[MULTIMODAL OCR CV ERROR]", err);
    return { text: "", sections: null };
  }
}
app.post("/api/import/parse", authenticateToken, importLimiter, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier re\xE7u." });
  }
  const file = req.file;
  const fileName = file.originalname || "document";
  const ext = import_path2.default.extname(fileName).toLowerCase();
  const isPdf = ext === ".pdf" || file.mimetype === "application/pdf";
  const isDocx = ext === ".docx" || ext === ".doc" || file.mimetype.includes("wordprocessingml") || file.mimetype.includes("msword");
  const isTxt = ext === ".txt" || ext === ".rtf" || file.mimetype.includes("text/plain");
  const isImage = ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp" || file.mimetype.startsWith("image/");
  if (!isPdf && !isDocx && !isTxt && !isImage) {
    return res.status(400).json({
      error: "Format non autoris\xE9. Seuls les fichiers .pdf, .docx, .txt et images (.png, .jpg) sont accept\xE9s."
    });
  }
  try {
    let extractedText = "";
    let aiSections = null;
    if (isPdf) {
      try {
        extractedText = await extractTextFromPDF(file.buffer);
      } catch (pdfErr) {
        console.warn("extractTextFromPDF standard parser failed, will use multimodal Gemini OCR:", pdfErr);
      }
    } else if (isDocx) {
      try {
        const result = await import_mammoth.default.extractRawText({ buffer: file.buffer });
        extractedText = result.value || "";
      } catch (docxErr) {
        console.warn("DOCX extraction failed:", docxErr);
      }
    } else if (isTxt) {
      extractedText = file.buffer.toString("utf-8");
    }
    extractedText = (extractedText || "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
    if (extractedText.length < 20 && (isPdf || isImage)) {
      const mime = isPdf ? "application/pdf" : file.mimetype || "image/jpeg";
      const ocrResult = await parseCVMultimodalWithGemini(file.buffer, mime, "fr");
      if (ocrResult.text || ocrResult.sections) {
        extractedText = ocrResult.text || (ocrResult.sections ? buildPlainTextFromParsed(ocrResult.sections) : "");
        aiSections = ocrResult.sections;
      }
    }
    if (!aiSections && extractedText.length >= 20) {
      aiSections = await parseCVTextWithGemini(extractedText, "fr");
    }
    if (!extractedText && (!aiSections || aiSections.length === 0)) {
      return res.status(400).json({
        error: `Impossible d'extraire le contenu de ce document. Essayez l'onglet "Coller du texte brut" pour importer votre CV.`
      });
    }
    res.json({
      text: extractedText,
      sections: aiSections,
      fileName,
      characterCount: extractedText.length
    });
  } catch (err) {
    console.error("Error parsing document file:", err?.message || err);
    res.status(500).json({ error: "Erreur lors de l'extraction du texte du document." });
  }
});
app.post("/api/import/parse-text", authenticateToken, async (req, res) => {
  try {
    const { text: text2 = "", langue = "fr" } = req.body;
    if (!text2 || typeof text2 !== "string" || text2.trim().length < 10) {
      return res.status(400).json({ error: "Le texte est trop court pour \xEAtre analys\xE9." });
    }
    if (text2.length > 5e4) {
      return res.status(400).json({ error: "Le texte est trop long (maximum 50 000 caract\xE8res)." });
    }
    const cleanText = text2.trim();
    const aiSections = await parseCVTextWithGemini(cleanText, langue);
    return res.json({
      text: cleanText,
      sections: aiSections,
      characterCount: cleanText.length
    });
  } catch (err) {
    console.error("Error in parse-text:", err);
    return res.status(500).json({ error: "Erreur lors de l'analyse du texte brut." });
  }
});
app.post("/api/auth/session", async (req, res) => {
  try {
    const rawDeviceId = typeof req.body.deviceId === "string" && req.body.deviceId ? req.body.deviceId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32) : "";
    const deviceId = rawDeviceId || import_crypto2.default.randomUUID().slice(0, 16);
    const guestEmail = `guest_${deviceId.slice(0, 12)}@moncvpro.internal`;
    const selectedLangue = req.body.langue || "fr";
    let user = await dbAdapter.findUserByEmail(guestEmail);
    if (!user) {
      const dummyPassword = import_crypto2.default.randomBytes(16).toString("hex");
      user = await dbAdapter.createUser({
        id: `u-gst-${deviceId.slice(0, 16)}`,
        nom: "Visiteur",
        email: guestEmail,
        motDePasseHash: import_bcryptjs2.default.hashSync(dummyPassword, 10),
        role: "USER",
        subscriptionTier: "freemium",
        langue: selectedLangue
      });
      const initialPreset = getPresetForTemplate("modele-1", selectedLangue);
      const cvDataPayload = {
        ...initialPreset,
        titre: initialPreset.titre || "Mon CV Professionnel",
        templateId: "modele-1",
        langue: selectedLangue,
        statutPaiement: "PAYE",
        isArchived: false
      };
      await dbAdapter.createCv({
        userId: user.id,
        titre: cvDataPayload.titre,
        templateId: "modele-1",
        langue: selectedLangue,
        cvData: cvDataPayload,
        statutPaiement: "PAYE"
      });
    }
    const token = import_jsonwebtoken.default.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
    const { motDePasseHash, ...safeUser } = user;
    return res.json({ user: safeUser, token });
  } catch (err) {
    console.error("[AUTH SESSION ERROR]", err);
    return res.status(500).json({ error: "Impossible d'initialiser la session en base de donn\xE9es." });
  }
});
app.post("/api/auth/register", async (req, res) => {
  const { nom, email, motDePasse, langue, guestUserId } = req.body;
  if (!email || !motDePasse || !nom) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }
  if (typeof motDePasse !== "string" || motDePasse.length < 8) {
    return res.status(400).json({ error: "Le mot de passe doit comporter au moins 8 caract\xE8res." });
  }
  const existing = await dbAdapter.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "Un compte existe d\xE9j\xE0 avec cet e-mail." });
  }
  const passwordHash = import_bcryptjs2.default.hashSync(motDePasse, 10);
  const newUser = await dbAdapter.createUser({
    nom,
    email,
    motDePasseHash: passwordHash,
    role: "USER",
    langue: langue || "fr",
    subscriptionTier: "freemium"
  });
  if (guestUserId && typeof guestUserId === "string") {
    const isGuestPrefix = guestUserId.startsWith("u-gst-") || guestUserId.startsWith("guest_") || guestUserId.startsWith("anon_") || guestUserId.startsWith("dev_");
    try {
      const existingRegisteredUser = await dbAdapter.findUserById(guestUserId);
      if (isGuestPrefix && !existingRegisteredUser) {
        await dbAdapter.reassignUserDocuments(guestUserId, newUser.id);
      } else {
        console.warn(`[SECURITY] Blocked reassigning documents from ${guestUserId} to ${newUser.id}: Not a valid guest ID or account already belongs to a registered user.`);
      }
    } catch (reassignErr) {
      console.warn("Could not reassign guest documents:", reassignErr);
    }
  }
  try {
    const userDocs = await dbAdapter.getCvsByUserId(newUser.id);
    if (!userDocs || userDocs.length === 0) {
      const initialPreset = getPresetForTemplate("modele-1", langue || "fr");
      const cvDataPayload = {
        ...initialPreset,
        titre: initialPreset.titre || "Mon CV Professionnel",
        templateId: "modele-1",
        langue: langue || "fr",
        statutPaiement: "PAYE",
        isArchived: false,
        utilisateurId: newUser.id,
        userId: newUser.id
      };
      await dbAdapter.createCv({
        userId: newUser.id,
        titre: cvDataPayload.titre,
        templateId: "modele-1",
        langue: langue || "fr",
        cvData: cvDataPayload,
        statutPaiement: "PAYE"
      });
    }
  } catch (initCvErr) {
    console.warn("Could not create starter CV for new user:", initCvErr);
  }
  const token = import_jsonwebtoken.default.sign(
    { userId: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  const { motDePasseHash, ...safeUser } = newUser;
  sendWelcomeEmail(newUser.email, newUser.nom).catch((err) => {
    console.error("[AUTH REGISTER EMAIL ERROR]", err);
  });
  res.json({ user: safeUser, token });
});
app.post("/api/auth/login", async (req, res) => {
  const { email, motDePasse } = req.body;
  if (!email || !motDePasse) {
    return res.status(400).json({ error: "E-mail et mot de passe requis." });
  }
  const normalizedEmail = (email || "").toLowerCase().trim();
  const user = await dbAdapter.findUserByEmail(normalizedEmail);
  if (!user || !user.motDePasseHash || !import_bcryptjs2.default.compareSync(motDePasse, user.motDePasseHash)) {
    return res.status(401).json({ error: "Identifiants incorrects." });
  }
  const token = import_jsonwebtoken.default.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  const { motDePasseHash, ...safeUser } = user;
  res.json({ user: safeUser, token });
});
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Une adresse e-mail valide est requise." });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const user = await dbAdapter.findUserByEmail(normalizedEmail);
  if (!user) {
    return res.json({
      success: true,
      message: "Si un compte est associ\xE9 \xE0 cette adresse e-mail, un lien de r\xE9initialisation s\xE9curis\xE9 vous a \xE9t\xE9 envoy\xE9."
    });
  }
  try {
    const resetToken = import_crypto2.default.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600 * 1e3);
    await dbAdapter.savePasswordResetToken(normalizedEmail, resetToken, expiresAt);
    const trustedAppUrl = process.env.APP_URL || process.env.FRONTEND_URL;
    let baseUrl;
    if (trustedAppUrl) {
      baseUrl = trustedAppUrl.replace(/\/+$/, "");
    } else if (process.env.NODE_ENV === "production") {
      console.error("[SECURITY ERROR] APP_URL n'est pas d\xE9fini en environnement de production.");
      return res.status(500).json({ error: "Erreur de configuration serveur (APP_URL manquant en production)." });
    } else {
      baseUrl = "http://localhost:3000";
    }
    const resetUrl = `${baseUrl}?reset_token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;
    sendPasswordResetEmail({
      userEmail: user.email,
      userName: user.nom,
      resetUrl
    }).catch((err) => {
      console.error("[PASSWORD RESET EMAIL ERROR]", err);
    });
    res.json({
      success: true,
      message: "Si un compte est associ\xE9 \xE0 cette adresse e-mail, un lien de r\xE9initialisation s\xE9curis\xE9 vous a \xE9t\xE9 envoy\xE9."
    });
  } catch (err) {
    console.error("[FORGOT PASSWORD ERROR]", err);
    res.status(500).json({ error: "Impossible de traiter la demande de r\xE9initialisation." });
  }
});
app.post("/api/auth/verify-reset-token", async (req, res) => {
  const { token } = req.body;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ valid: false, error: "Jeton de r\xE9initialisation manquant." });
  }
  try {
    const record = await dbAdapter.findPasswordResetToken(token);
    if (!record) {
      return res.status(400).json({ valid: false, error: "Ce lien de r\xE9initialisation est invalide ou a d\xE9j\xE0 \xE9t\xE9 utilis\xE9." });
    }
    const expiryTime = new Date(record.expiresAt).getTime();
    if (isNaN(expiryTime) || expiryTime < Date.now()) {
      return res.status(400).json({ valid: false, error: "Ce lien de r\xE9initialisation a expir\xE9 (dur\xE9e de validit\xE9 : 1 heure). Veuillez refaire une demande." });
    }
    res.json({ valid: true, email: record.email });
  } catch (err) {
    console.error("[VERIFY RESET TOKEN ERROR]", err);
    res.status(500).json({ valid: false, error: "Erreur lors de la v\xE9rification du lien." });
  }
});
app.post("/api/auth/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Jeton de r\xE9initialisation manquant." });
  }
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
    return res.status(400).json({ error: "Le nouveau mot de passe doit comporter au moins 8 caract\xE8res." });
  }
  try {
    const record = await dbAdapter.findPasswordResetToken(token);
    if (!record) {
      return res.status(400).json({ error: "Ce lien de r\xE9initialisation est invalide ou a d\xE9j\xE0 \xE9t\xE9 utilis\xE9." });
    }
    const expiryTime = new Date(record.expiresAt).getTime();
    if (isNaN(expiryTime) || expiryTime < Date.now()) {
      return res.status(400).json({ error: "Ce lien de r\xE9initialisation a expir\xE9. Veuillez refaire une demande." });
    }
    const user = await dbAdapter.findUserByEmail(record.email);
    if (!user) {
      return res.status(404).json({ error: "Compte utilisateur associ\xE9 introuvable." });
    }
    const newHash = import_bcryptjs2.default.hashSync(newPassword, 10);
    await dbAdapter.updateUser(user.id, { motDePasseHash: newHash });
    await dbAdapter.deletePasswordResetToken(record.email);
    res.json({
      success: true,
      message: "Votre mot de passe a \xE9t\xE9 mis \xE0 jour avec succ\xE8s ! Vous pouvez maintenant vous connecter."
    });
  } catch (err) {
    console.error("[RESET PASSWORD ERROR]", err);
    res.status(500).json({ error: "Une erreur est survenue lors de la r\xE9initialisation du mot de passe." });
  }
});
var handleGoogleOrFirebaseSync = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const idToken = tokenFromHeader || req.body.idToken || req.body.token;
    if (!idToken || typeof idToken !== "string") {
      return res.status(401).json({ error: "Jeton d'authentification Firebase / Google manquant ou invalide." });
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken || !decodedToken.email) {
      return res.status(401).json({ error: "Jeton Firebase non v\xE9rifi\xE9 ou ne contenant aucune adresse e-mail." });
    }
    const isPasswordProvider = decodedToken.firebase?.sign_in_provider === "password";
    if (isPasswordProvider && !decodedToken.email_verified) {
      return res.status(401).json({ error: "Adresse e-mail non v\xE9rifi\xE9e. Veuillez v\xE9rifier votre e-mail dans Firebase avant de vous connecter." });
    }
    const userEmail = decodedToken.email.toLowerCase().trim();
    const userName = decodedToken.name || typeof req.body.displayName === "string" && req.body.displayName.trim() || typeof req.body.nom === "string" && req.body.nom.trim() || userEmail.split("@")[0] || "Utilisateur Google";
    let user = await dbAdapter.findUserByEmail(userEmail);
    if (!user) {
      const dummyPasswordHash = import_bcryptjs2.default.hashSync(import_crypto2.default.randomBytes(16).toString("hex"), 10);
      user = await dbAdapter.createUser({
        nom: userName,
        email: userEmail,
        motDePasseHash: dummyPasswordHash,
        role: "USER",
        subscriptionTier: "freemium",
        langue: req.body.langue || "fr"
      });
    }
    const token = import_jsonwebtoken.default.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const { motDePasseHash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error("[GOOGLE/FIREBASE AUTH VERIFICATION ERROR]", err);
    res.status(401).json({ error: "\xC9chec de v\xE9rification du jeton Google / Firebase. Connexion refus\xE9e." });
  }
};
app.post("/api/auth/google", handleGoogleOrFirebaseSync);
app.post("/api/auth/firebase-sync", handleGoogleOrFirebaseSync);
app.get("/api/auth/me", authenticateToken, (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Non authentifi\xE9." });
  const { motDePasseHash, ...safeUser } = req.user;
  res.json({ user: safeUser });
});
app.put("/api/auth/profile", authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Non authentifi\xE9." });
  const { nom, langue, ancienMotDePasse, nouveauMotDePasse } = req.body;
  const user = await dbAdapter.findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouv\xE9." });
  }
  const updates = {};
  if (nom && typeof nom === "string" && nom.trim()) {
    updates.nom = nom.trim();
  }
  if (langue && ["fr", "en", "ar"].includes(langue)) {
    updates.langue = langue;
  }
  if (nouveauMotDePasse) {
    if (user.motDePasseHash) {
      if (!ancienMotDePasse || typeof ancienMotDePasse !== "string") {
        return res.status(400).json({ error: "L'ancien mot de passe est obligatoire pour d\xE9finir un nouveau mot de passe." });
      }
      const isValid = import_bcryptjs2.default.compareSync(ancienMotDePasse, user.motDePasseHash);
      if (!isValid) {
        return res.status(400).json({ error: "L'ancien mot de passe est incorrect." });
      }
    }
    if (typeof nouveauMotDePasse !== "string" || nouveauMotDePasse.length < 8) {
      return res.status(400).json({ error: "Le nouveau mot de passe doit comporter au moins 8 caract\xE8res." });
    }
    updates.motDePasseHash = import_bcryptjs2.default.hashSync(nouveauMotDePasse, 10);
  }
  const updatedUser = await dbAdapter.updateUser(user.id, updates);
  const { motDePasseHash, ...safeUser } = updatedUser || { ...user, ...updates };
  const isAdmin = safeUser.role === "ADMIN";
  if (isAdmin) {
    safeUser.role = "ADMIN";
    safeUser.subscriptionTier = "premium";
  }
  res.json({ user: safeUser, message: "Profil mis \xE0 jour avec succ\xE8s." });
});
function ensureCompleteServerCV(cvObj) {
  if (!cvObj) return cvObj;
  const templateId = cvObj.templateId || "modele-1";
  const langue = cvObj.langue || "fr";
  const preset = getPresetForTemplate(templateId, langue);
  const presetSections = preset?.sections || [];
  if (!cvObj.sections || !Array.isArray(cvObj.sections) || cvObj.sections.length === 0) {
    return {
      ...preset,
      ...cvObj,
      sections: JSON.parse(JSON.stringify(presetSections))
    };
  }
  const sections = [...cvObj.sections];
  const coreTypes = ["profil", "experience", "formation", "competences", "projets"];
  for (const cType of coreTypes) {
    const existingIdx = sections.findIndex((s) => s.type === cType);
    const pSec = presetSections.find((ps) => ps.type === cType);
    if (existingIdx === -1 && pSec) {
      sections.push(JSON.parse(JSON.stringify(pSec)));
    } else if (existingIdx >= 0 && pSec) {
      const existing = sections[existingIdx];
      const isEmpty = !existing.contenu || Array.isArray(existing.contenu) && existing.contenu.length === 0 || typeof existing.contenu === "object" && Object.keys(existing.contenu).length === 0 || existing.type === "profil" && !existing.contenu.nomComplet && !existing.contenu.resume;
      if (isEmpty) {
        sections[existingIdx] = {
          ...existing,
          contenu: JSON.parse(JSON.stringify(pSec.contenu))
        };
      }
    }
  }
  return {
    ...cvObj,
    sections
  };
}
app.get("/api/cv", optionalAuthenticateToken, async (req, res) => {
  if (!req.user) {
    return res.json({ cvs: [] });
  }
  let userCVs = await dbAdapter.getCvsByUserId(req.user.id);
  const populatedCVs = (userCVs || []).map((c) => ensureCompleteServerCV(c));
  res.json({ cvs: populatedCVs });
});
app.post("/api/cv", authenticateToken, async (req, res) => {
  const { titre, templateId, langue, couleurAccent, police, sections, photoUrl, isPrefilled, isBlank } = req.body;
  if (req.body.id && typeof req.body.id === "string") {
    const existingCv = await dbAdapter.getCvById(req.body.id);
    if (existingCv) {
      const cvOwnerId = existingCv.userId || existingCv.utilisateurId;
      if (cvOwnerId && cvOwnerId !== req.user.id && req.user.role !== "ADMIN") {
        return res.status(403).json({
          error: "Acc\xE8s non autoris\xE9. Vous ne pouvez pas modifier ou \xE9craser un CV appartenant \xE0 un autre utilisateur."
        });
      }
    }
  }
  const selectedTemplateId = templateId || "modele-1";
  const selectedLangue = langue || "fr";
  const cleanPreset = getCleanPresetForTemplate(selectedTemplateId, selectedLangue);
  const samplePreset = getPresetForTemplate(selectedTemplateId, selectedLangue);
  const prefilledBool = isPrefilled !== void 0 ? Boolean(isPrefilled) : isBlank !== void 0 ? !isBlank : true;
  const activePreset = prefilledBool ? samplePreset : cleanPreset;
  const defaultSections = sections || activePreset.sections;
  const cvDataPayload = {
    ...activePreset,
    ...req.body,
    titre: req.body.titre || titre || activePreset.titre || "Nouveau CV",
    templateId: req.body.templateId || selectedTemplateId,
    langue: req.body.langue || selectedLangue,
    couleurAccent: req.body.couleurAccent || couleurAccent || activePreset.couleurAccent || "#2563EB",
    police: req.body.police || police || activePreset.police || "Inter",
    photoUrl: req.body.photoUrl !== void 0 ? req.body.photoUrl : photoUrl !== void 0 ? photoUrl : prefilledBool ? samplePreset.photoUrl : "",
    afficherPhoto: true,
    sections: req.body.sections || defaultSections
  };
  const newCV = await dbAdapter.createCv({
    id: req.body.id,
    userId: req.user.id,
    titre: cvDataPayload.titre,
    templateId: selectedTemplateId,
    langue: selectedLangue,
    cvData: cvDataPayload,
    statutPaiement: "PAYE"
  });
  res.json({ cv: { ...newCV, ...cvDataPayload, id: newCV.id || req.body.id, utilisateurId: req.user.id } });
});
app.get("/api/cv/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const cv = await dbAdapter.getCvById(id);
  if (!cv) {
    return res.status(404).json({ error: "CV non trouv\xE9." });
  }
  const cvOwnerId = cv.userId || cv.utilisateurId;
  if (cvOwnerId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Acc\xE8s non autoris\xE9 \xE0 ce CV." });
  }
  const cvObj = cv.cvData ? { ...cv, ...cv.cvData, utilisateurId: cvOwnerId } : cv;
  const populatedCV = ensureCompleteServerCV(cvObj);
  res.json({ cv: populatedCV });
});
app.put("/api/cv/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const rawBody = req.body || {};
  const existing = await dbAdapter.getCvById(id);
  if (!existing) {
    return res.status(404).json({ error: "CV non trouv\xE9." });
  }
  const ownerId = existing.userId || existing.utilisateurId;
  if (ownerId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Acc\xE8s non autoris\xE9." });
  }
  const { utilisateurId, userId, statutPaiement, createdAt, id: _ignoreId, ...allowedUpdates } = rawBody;
  const updatedCv = await dbAdapter.updateCvWhitelisted(id, ownerId, {
    titre: allowedUpdates.titre,
    templateId: allowedUpdates.templateId,
    langue: allowedUpdates.langue,
    cvData: allowedUpdates,
    isArchived: allowedUpdates.isArchived
  });
  res.json({ cv: updatedCv || { ...existing, ...allowedUpdates, utilisateurId: ownerId } });
});
app.delete("/api/cv/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const existing = await dbAdapter.getCvById(id);
  if (!existing) {
    return res.status(404).json({ error: "CV non trouv\xE9." });
  }
  const ownerId = existing.userId || existing.utilisateurId;
  if (ownerId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Acc\xE8s non autoris\xE9." });
  }
  await dbAdapter.deleteCv(id, ownerId);
  res.json({ success: true });
});
app.post("/api/cv/:id/duplicate", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const original = await dbAdapter.getCvById(id);
  if (!original) {
    return res.status(404).json({ error: "CV non trouv\xE9." });
  }
  const ownerId = original.userId || original.utilisateurId;
  if (ownerId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Acc\xE8s non autoris\xE9." });
  }
  const duplicatedData = original.cvData ? JSON.parse(JSON.stringify(original.cvData)) : JSON.parse(JSON.stringify(original));
  duplicatedData.titre = `${original.titre || "CV"} (Copie)`;
  const duplicated = await dbAdapter.createCv({
    userId: req.user.id,
    titre: duplicatedData.titre,
    templateId: original.templateId || "modele-1",
    langue: original.langue || "fr",
    cvData: duplicatedData,
    statutPaiement: "PAYE"
  });
  res.json({ cv: { ...duplicated, ...duplicatedData, utilisateurId: req.user.id } });
});
app.get("/api/lettres", optionalAuthenticateToken, async (req, res) => {
  if (!req.user) {
    return res.json({ letters: [] });
  }
  const letters = await dbAdapter.getLettersByUserId(req.user.id);
  res.json({ letters: letters || [] });
});
app.post("/api/lettres", authenticateToken, async (req, res) => {
  const user = req.user;
  const letterData = req.body || {};
  if (letterData.id) {
    const existing = await dbAdapter.getLetterById(letterData.id);
    if (existing) {
      const ownerId = existing.userId || existing.utilisateurId;
      if (ownerId !== user.id && user.role !== "ADMIN") {
        return res.status(403).json({ error: "Acc\xE8s non autoris\xE9. Cette lettre appartient \xE0 un autre compte." });
      }
      const { utilisateurId, userId, dateCreation, id: _ignoreId, ...allowedUpdates } = letterData;
      const updated = await dbAdapter.updateLetterWhitelisted(letterData.id, ownerId, {
        titre: allowedUpdates.titre || existing.titre,
        templateId: allowedUpdates.templateId || existing.templateId,
        langue: allowedUpdates.langue || existing.langue,
        letterData: allowedUpdates,
        entreprise: allowedUpdates.entreprise,
        poste: allowedUpdates.poste,
        destinataire: allowedUpdates.destinataire,
        objet: allowedUpdates.objet
      });
      return res.json({ letter: updated || { ...existing, ...allowedUpdates, utilisateurId: ownerId } });
    }
  }
  const newLetterPayload = {
    titre: letterData.titre || "Nouvelle lettre de motivation",
    destinataire: letterData.destinataire || "Direction des Ressources Humaines",
    entreprise: letterData.entreprise || "Entreprise Cible",
    poste: letterData.poste || "Poste Vis\xE9",
    villeDate: letterData.villeDate || `Fait le ${(/* @__PURE__ */ new Date()).toLocaleDateString("fr-FR")}`,
    langue: letterData.langue || "fr",
    police: letterData.police || "Inter",
    couleurAccent: letterData.couleurAccent || "#2563EB",
    expediteur: letterData.expediteur || { nomComplet: user.nom, email: user.email },
    objet: letterData.objet || "Candidature",
    formulePolitesseEntree: letterData.formulePolitesseEntree || "Madame, Monsieur,",
    paragrapheAccroche: letterData.paragrapheAccroche || "",
    paragrapheValeurAjoutee: letterData.paragrapheValeurAjoutee || "",
    paragrapheAdequationEntreprise: letterData.paragrapheAdequationEntreprise || "",
    paragrapheConclusion: letterData.paragrapheConclusion || "",
    formulePolitesseSortie: letterData.formulePolitesseSortie || "Veuillez agr\xE9er mes salutations distingu\xE9es.",
    texteComplet: letterData.texteComplet || "",
    signature: letterData.signature || user.nom
  };
  const created = await dbAdapter.createLetter({
    userId: user.id,
    titre: newLetterPayload.titre,
    templateId: letterData.templateId || "classique",
    langue: newLetterPayload.langue,
    letterData: newLetterPayload
  });
  res.json({ letter: { ...created, ...newLetterPayload, utilisateurId: user.id } });
});
app.get("/api/lettres/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const letter = await dbAdapter.getLetterById(id);
  if (!letter) return res.status(404).json({ error: "Lettre non trouv\xE9e." });
  const ownerId = letter.userId || letter.utilisateurId;
  if (ownerId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Acc\xE8s non autoris\xE9." });
  }
  const letterObj = letter.letterData ? { ...letter, ...letter.letterData, utilisateurId: ownerId } : letter;
  res.json({ letter: letterObj });
});
app.put("/api/lettres/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const rawBody = req.body || {};
  const existing = await dbAdapter.getLetterById(id);
  if (!existing) return res.status(404).json({ error: "Lettre non trouv\xE9e." });
  const ownerId = existing.userId || existing.utilisateurId;
  if (ownerId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Acc\xE8s non autoris\xE9." });
  }
  const { utilisateurId, userId, dateCreation, id: _ignoreId, ...allowedUpdates } = rawBody;
  const updated = await dbAdapter.updateLetterWhitelisted(id, ownerId, {
    titre: allowedUpdates.titre,
    templateId: allowedUpdates.templateId,
    langue: allowedUpdates.langue,
    letterData: allowedUpdates,
    entreprise: allowedUpdates.entreprise,
    poste: allowedUpdates.poste,
    destinataire: allowedUpdates.destinataire,
    objet: allowedUpdates.objet
  });
  res.json({ letter: updated || { ...existing, ...allowedUpdates, utilisateurId: ownerId } });
});
app.delete("/api/lettres/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const letter = await dbAdapter.getLetterById(id);
  if (!letter) return res.status(404).json({ error: "Lettre non trouv\xE9e." });
  const ownerId = letter.userId || letter.utilisateurId;
  if (ownerId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Acc\xE8s non autoris\xE9." });
  }
  await dbAdapter.deleteLetter(id, ownerId);
  res.json({ success: true });
});
app.post("/api/lettres/:id/duplicate", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const original = await dbAdapter.getLetterById(id);
  if (!original) {
    return res.status(404).json({ error: "Lettre non trouv\xE9e." });
  }
  const ownerId = original.userId || original.utilisateurId;
  if (ownerId !== req.user.id && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Acc\xE8s non autoris\xE9." });
  }
  const letterData = original.letterData ? JSON.parse(JSON.stringify(original.letterData)) : { ...original };
  letterData.titre = `${original.titre || "Lettre"} (Copie)`;
  const duplicated = await dbAdapter.createLetter({
    userId: req.user.id,
    titre: letterData.titre,
    templateId: original.templateId || "classique",
    langue: original.langue || "fr",
    letterData
  });
  res.json({ letter: { ...duplicated, ...letterData, utilisateurId: req.user.id } });
});
function buildPlainTextCV(cv) {
  const profilSec = cv.sections?.find((s) => s.type === "profil");
  const profil = profilSec?.contenu || {};
  let text2 = `${(profil.nomComplet || cv.titre || "CURRICULUM VITAE").toUpperCase()}
`;
  if (profil.titreProfessionnel) text2 += `${profil.titreProfessionnel}
`;
  text2 += `Email: ${profil.email || ""} | Tel: ${profil.telephone || ""} | Ville: ${profil.adresse || ""}
`;
  if (profil.linkedin) text2 += `LinkedIn: ${profil.linkedin}
`;
  if (profil.siteWeb) text2 += `Site: ${profil.siteWeb}
`;
  text2 += `${"=".repeat(60)}

`;
  if (profil.resume) {
    text2 += `PROFIL PROFESSIONNEL
${"-".repeat(30)}
${profil.resume}

`;
  }
  for (const sec of cv.sections || []) {
    if (sec.type === "profil" || sec.visible === false) continue;
    text2 += `${(sec.titre || sec.type).toUpperCase()}
${"-".repeat(30)}
`;
    if (sec.type === "experience" || sec.type === "experiences") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      for (const it of items) {
        text2 += `\u2022 ${it.poste} - ${it.entreprise} (${it.ville || ""})
`;
        text2 += `  P\xE9riode: ${it.dateDebut} - ${it.actuel ? "Pr\xE9sent" : it.dateFin}
`;
        if (it.description) text2 += `  ${it.description}
`;
        if (Array.isArray(it.taches)) {
          for (const t of it.taches) text2 += `    - ${t}
`;
        }
        text2 += "\n";
      }
    } else if (sec.type === "formation" || sec.type === "formations") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      for (const it of items) {
        text2 += `\u2022 ${it.diplome} - ${it.etablissement} (${it.ville || ""})
`;
        text2 += `  Ann\xE9e: ${it.dateDebut} - ${it.actuel ? "Pr\xE9sent" : it.dateFin}

`;
      }
    } else if (sec.type === "competences") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      text2 += items.map((c) => c.nom + (c.niveau ? ` (${c.niveau}/10)` : "")).join(", ") + "\n\n";
    } else if (sec.type === "langues") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      text2 += items.map((l) => `${l.langue} (${l.niveau})`).join(", ") + "\n\n";
    } else if (sec.type === "interets") {
      const items = Array.isArray(sec.contenu) ? sec.contenu : [];
      text2 += items.map((i) => i.nom).filter(Boolean).join(", ") + "\n\n";
    }
  }
  return text2;
}
async function checkExportSecurity(req, cv, format) {
  const user = await dbAdapter.findUserById(req.user.id);
  if (!user) {
    throw { status: 401, error: "Utilisateur non trouv\xE9." };
  }
  const now = Date.now();
  const currentExpiryMs = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).getTime() : 0;
  const isActive = !isNaN(currentExpiryMs) && currentExpiryMs > now;
  const effectiveTier = user.role === "ADMIN" ? "premium" : isActive ? user.subscriptionTier : "freemium";
  if (format !== "pdf" && effectiveTier === "freemium") {
    throw {
      status: 403,
      error: `Le format d'export .${format.toUpperCase()} est r\xE9serv\xE9 aux forfaits payants (Classique ou Premium).`
    };
  }
  const settings = await dbAdapter.getAppSettings();
  const paymentActive = settings?.paiementActif !== false;
  if (effectiveTier === "freemium" && paymentActive && cv.statutPaiement !== "PAYE") {
    const detected = detectPaidFeaturesInCV(cv, effectiveTier);
    if (detected.length > 0) {
      throw {
        status: 403,
        error: `Ce CV utilise des fonctionnalit\xE9s r\xE9serv\xE9es aux forfaits payants : ${detected.map((d) => d.name).join(", ")}.`,
        features: detected
      };
    }
  }
  return { user, effectiveTier };
}
app.post("/api/export/pdf", authenticateToken, async (req, res) => {
  try {
    const cv = req.body?.cv || req.body;
    if (!cv || !cv.sections) {
      return res.status(400).json({ error: "Contenu du CV manquant ou invalide." });
    }
    await checkExportSecurity(req, cv, "pdf");
    const pdf = generateVectorPDF(cv);
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));
    const cleanFilename = (cv.titre || "CV_Professionnel").replace(/[^a-zA-Z0-9_-]/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("[EXPORT PDF ERROR]", err);
    res.status(err.status || 500).json({ error: err.error || err.message || "Erreur lors de la g\xE9n\xE9ration du PDF." });
  }
});
app.post("/api/export/docx", authenticateToken, async (req, res) => {
  try {
    const cv = req.body?.cv || req.body;
    if (!cv || !cv.sections) {
      return res.status(400).json({ error: "Contenu du CV manquant ou invalide." });
    }
    await checkExportSecurity(req, cv, "docx");
    const doc = buildDocxDocument(cv);
    const docxBuffer = await import_docx2.Packer.toBuffer(doc);
    const cleanFilename = (cv.titre || "CV_Professionnel").replace(/[^a-zA-Z0-9_-]/g, "_");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}.docx"`);
    res.send(docxBuffer);
  } catch (err) {
    console.error("[EXPORT DOCX ERROR]", err);
    res.status(err.status || 500).json({ error: err.error || err.message || "Erreur lors de la g\xE9n\xE9ration du DOCX." });
  }
});
app.post("/api/export/json", authenticateToken, async (req, res) => {
  try {
    const cv = req.body?.cv || req.body;
    if (!cv || !cv.sections) {
      return res.status(400).json({ error: "Contenu du CV manquant ou invalide." });
    }
    await checkExportSecurity(req, cv, "json");
    const cleanFilename = (cv.titre || "CV_Professionnel").replace(/[^a-zA-Z0-9_-]/g, "_");
    const jsonStr = JSON.stringify(cv, null, 2);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}.json"`);
    res.send(Buffer.from(jsonStr, "utf-8"));
  } catch (err) {
    console.error("[EXPORT JSON ERROR]", err);
    res.status(err.status || 500).json({ error: err.error || err.message || "Erreur lors de l\u2019export JSON." });
  }
});
app.post("/api/export/txt", authenticateToken, async (req, res) => {
  try {
    const cv = req.body?.cv || req.body;
    if (!cv || !cv.sections) {
      return res.status(400).json({ error: "Contenu du CV manquant ou invalide." });
    }
    await checkExportSecurity(req, cv, "txt");
    const cleanFilename = (cv.titre || "CV_Professionnel").replace(/[^a-zA-Z0-9_-]/g, "_");
    const txtStr = buildPlainTextCV(cv);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}.txt"`);
    res.send(Buffer.from(txtStr, "utf-8"));
  } catch (err) {
    console.error("[EXPORT TXT ERROR]", err);
    res.status(err.status || 500).json({ error: err.error || err.message || "Erreur lors de l\u2019export texte brut." });
  }
});
async function applyPlanToUser(userId, paymentId, planTier) {
  const settings = await dbAdapter.getAppSettings();
  const pricingPlans = settings?.pricingPlans || [];
  const matchingPlan = pricingPlans.find((p) => p.code === planTier);
  if (!matchingPlan || typeof matchingPlan.prix !== "number" || typeof matchingPlan.dureeJours !== "number") {
    console.error(`[PAYMENT SECURITY CRITICAL] Plan introuvable en base pour planTier="${planTier}", userId="${userId}", paymentId="${paymentId}"`);
    throw new Error(`Configuration de forfait introuvable pour le plan ${planTier}`);
  }
  const newDurationDays = matchingPlan.dureeJours;
  const targetUser = await dbAdapter.findUserById(userId);
  if (!targetUser) throw new Error("Utilisateur non trouv\xE9.");
  const now = Date.now();
  const currentExpiryMs = targetUser.subscriptionExpiresAt ? new Date(targetUser.subscriptionExpiresAt).getTime() : 0;
  const isActive = !isNaN(currentExpiryMs) && currentExpiryMs > now;
  const tierWeights = { freemium: 0, decouverte: 1, classique: 2, premium: 3 };
  const currentTier = targetUser.subscriptionTier || "freemium";
  const currentWeight = tierWeights[currentTier] || 0;
  const targetWeight = tierWeights[planTier] || 0;
  let newExpiryMs;
  let finalTier = planTier;
  if (isActive) {
    if (targetWeight > currentWeight) {
      const remainingMs = currentExpiryMs - now;
      const remainingDays = remainingMs / (24 * 60 * 60 * 1e3);
      const currentPlan = pricingPlans.find((p) => p.code === currentTier);
      if (!currentPlan || typeof currentPlan.prix !== "number") {
        console.error(`[PAYMENT SECURITY CRITICAL] Plan actuel introuvable en base pour currentTier="${currentTier}", userId="${userId}"`);
        throw new Error(`Configuration de forfait introuvable pour le plan actuel ${currentTier}`);
      }
      const currentPlanPrice = currentPlan.prix;
      const newPlanPrice = matchingPlan.prix;
      const ratio = newPlanPrice > 0 ? currentPlanPrice / newPlanPrice : 1;
      const proratedDays = Math.floor(remainingDays * Math.min(ratio, 1));
      const totalDays = newDurationDays + proratedDays;
      newExpiryMs = now + totalDays * 24 * 60 * 60 * 1e3;
      finalTier = planTier;
    } else if (targetWeight === currentWeight) {
      newExpiryMs = currentExpiryMs + newDurationDays * 24 * 60 * 60 * 1e3;
      finalTier = currentTier;
    } else {
      const currentPlan = pricingPlans.find((p) => p.code === currentTier);
      if (!currentPlan || typeof currentPlan.prix !== "number") {
        console.error(`[PAYMENT SECURITY CRITICAL] Plan actuel introuvable en base pour currentTier="${currentTier}", userId="${userId}"`);
        throw new Error(`Configuration de forfait introuvable pour le plan actuel ${currentTier}`);
      }
      const currentPlanPrice = currentPlan.prix;
      const newPlanPrice = matchingPlan.prix;
      const ratio = currentPlanPrice > 0 ? newPlanPrice / currentPlanPrice : 1;
      const proratedDays = Math.floor(newDurationDays * Math.min(ratio, 1));
      newExpiryMs = currentExpiryMs + proratedDays * 24 * 60 * 60 * 1e3;
      finalTier = currentTier;
    }
  } else {
    newExpiryMs = now + newDurationDays * 24 * 60 * 60 * 1e3;
    finalTier = planTier;
  }
  const expiryDate = new Date(newExpiryMs).toISOString();
  await dbAdapter.updateUser(userId, {
    subscriptionTier: finalTier,
    subscriptionExpiresAt: expiryDate
  });
  await dbAdapter.createSubscriptionRecord({
    userId,
    paymentId,
    planTier: finalTier,
    startsAt: new Date(now).toISOString(),
    expiresAt: expiryDate
  });
  return {
    tier: finalTier,
    expiresAt: expiryDate,
    durationDays: newDurationDays
  };
}
app.get("/api/payment/ikeepay-config", async (req, res) => {
  const settings = await dbAdapter.getAppSettings();
  res.json({
    publicKey: IKEEPAY_PUBLIC_KEY,
    currency: "XOF",
    paiementActif: settings?.paiementActif ?? true,
    plans: settings?.pricingPlans || []
  });
});
app.post("/api/payment/ikeepay-initiate", authenticateToken, async (req, res) => {
  const { planTier = "classique" } = req.body;
  const allowedTiers = ["decouverte", "classique", "premium"];
  if (!allowedTiers.includes(planTier)) {
    return res.status(400).json({ error: "Formule d'abonnement invalide. Formules autoris\xE9es : decouverte, classique, premium." });
  }
  const settings = await dbAdapter.getAppSettings();
  const plans = settings?.pricingPlans || [];
  const plan = plans.find((p) => p.code === planTier);
  if (!plan) {
    return res.status(400).json({ error: "Formule d'abonnement non trouv\xE9e ou non configur\xE9e." });
  }
  if (plan.actif === false) {
    return res.status(400).json({ error: "Cette formule d'abonnement est actuellement d\xE9sactiv\xE9e." });
  }
  const user = await dbAdapter.findUserById(req.user.id);
  const now = Date.now();
  if (user?.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt).getTime() > now) {
    const tierWeights = { freemium: 0, decouverte: 1, classique: 2, premium: 3 };
    const currentWeight = tierWeights[user.subscriptionTier || "freemium"] || 0;
    const targetWeight = tierWeights[planTier] || 0;
    if (targetWeight < currentWeight) {
      return res.status(400).json({
        error: `Vous b\xE9n\xE9ficiez d\xE9j\xE0 d'un abonnement ${user.subscriptionTier.toUpperCase()} actif. Vous ne pouvez pas souscrire \xE0 une formule inf\xE9rieure pendant votre p\xE9riode active.`
      });
    }
  }
  const amount = Number(plan.prix);
  const transactionRef = `IKP_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const newPayment = await dbAdapter.createPayment({
    userId: req.user.id,
    planTier,
    montant: amount,
    devise: plan.devise || "FCFA",
    referenceTransaction: transactionRef,
    statut: "EN_ATTENTE",
    metadata: { userEmail: req.user.email, userName: req.user.nom }
  });
  res.json({
    success: true,
    transactionRef,
    amount,
    publicKey: IKEEPAY_PUBLIC_KEY,
    currency: "XOF",
    payment: newPayment
  });
});
app.post("/api/payment/ikeepay-verify", authenticateToken, async (req, res) => {
  const { transactionRef } = req.body;
  if (!transactionRef || typeof transactionRef !== "string") {
    return res.status(400).json({ error: "R\xE9f\xE9rence de transaction requise." });
  }
  const paymentRecord = await dbAdapter.findPaymentByRef(transactionRef);
  if (!paymentRecord || paymentRecord.userId !== req.user.id) {
    return res.status(404).json({ error: "Transaction non trouv\xE9e ou non associ\xE9e \xE0 votre compte." });
  }
  if (paymentRecord.statut === "VALIDE") {
    const user = await dbAdapter.findUserById(req.user.id);
    return res.json({
      success: true,
      subscriptionTier: user?.subscriptionTier || paymentRecord.planTier,
      expiresAt: user?.subscriptionExpiresAt,
      message: "Transaction d\xE9j\xE0 v\xE9rifi\xE9e et valid\xE9e."
    });
  }
  const expectedAmount = Number(paymentRecord.montant);
  let verified = false;
  if (IKEEPAY_PRIVATE_KEY) {
    try {
      const apiRes = await fetch(`https://api.ikeepay.com/v1/checkout/verify/${transactionRef}`, {
        headers: { "Authorization": `Bearer ${IKEEPAY_PRIVATE_KEY}` }
      });
      if (apiRes.ok) {
        const verifyData = await apiRes.json();
        if (verifyData.status === "SUCCESS" || verifyData.status === "COMPLETED") {
          if (verifyData.amount !== void 0 && Number(verifyData.amount) === expectedAmount) {
            verified = true;
          }
        }
      }
    } catch (e) {
      console.warn("iKeePay verification check error:", e);
    }
  } else {
    return res.status(400).json({
      error: "La v\xE9rification en ligne iKeePay n'est pas configur\xE9e sur le serveur. Veuillez contacter le support."
    });
  }
  if (!verified) {
    return res.status(400).json({
      error: "Impossible de v\xE9rifier automatiquement le paiement. Le statut ou le montant ne correspond pas."
    });
  }
  const claimed = await dbAdapter.claimAndValidatePayment(paymentRecord.id);
  if (!claimed) {
    const user = await dbAdapter.findUserById(req.user.id);
    return res.json({
      success: true,
      subscriptionTier: user?.subscriptionTier || paymentRecord.planTier,
      expiresAt: user?.subscriptionExpiresAt,
      message: "Transaction d\xE9j\xE0 trait\xE9e."
    });
  }
  const subResult = await applyPlanToUser(req.user.id, paymentRecord.id, paymentRecord.planTier);
  const matchingPlan = (await dbAdapter.getAppSettings())?.pricingPlans?.find((p) => p.code === paymentRecord.planTier);
  sendSubscriptionConfirmationEmail({
    userEmail: req.user.email,
    userName: req.user.nom,
    planName: matchingPlan?.nom || `Pack ${paymentRecord.planTier.toUpperCase()}`,
    planTier: subResult.tier,
    amount: expectedAmount,
    currency: paymentRecord.devise || "FCFA",
    durationDays: subResult.durationDays,
    expiresAt: subResult.expiresAt
  }).catch((err) => {
    console.error("[PAYMENT VERIFY CONFIRMATION EMAIL ERROR]", err);
  });
  res.json({
    success: true,
    subscriptionTier: subResult.tier,
    expiresAt: subResult.expiresAt,
    message: `Abonnement ${subResult.tier.toUpperCase()} activ\xE9 avec succ\xE8s.`
  });
});
function safeTimingEqual(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return import_crypto2.default.timingSafeEqual(bufA, bufB);
}
app.post("/api/payment/ikeepay-webhook", async (req, res) => {
  const signatureHeader = req.headers["x-ikeepay-signature"] || req.headers["x-webhook-secret"];
  if (!IKEEPAY_WEBHOOK_SECRET || !signatureHeader || !safeTimingEqual(signatureHeader, IKEEPAY_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: "Signature ou secret de webhook non configur\xE9 ou invalide." });
  }
  const { reference, status } = req.body;
  if (!reference) {
    return res.status(400).json({ error: "R\xE9f\xE9rence de transaction requise." });
  }
  const paymentRecord = await dbAdapter.findPaymentByRef(reference);
  if (!paymentRecord) {
    return res.status(404).json({ error: "Transaction non trouv\xE9e." });
  }
  if (paymentRecord.statut === "VALIDE") {
    return res.json({ success: true, message: "Transaction d\xE9j\xE0 trait\xE9e et valid\xE9e via webhook.", tier: paymentRecord.planTier });
  }
  if (status === "SUCCESS" || status === "COMPLETED") {
    let isValidWebhook = false;
    if (IKEEPAY_PRIVATE_KEY) {
      try {
        const apiRes = await fetch(`https://api.ikeepay.com/v1/checkout/verify/${reference}`, {
          headers: { "Authorization": `Bearer ${IKEEPAY_PRIVATE_KEY}` }
        });
        if (apiRes.ok) {
          const verifyData = await apiRes.json();
          if ((verifyData.status === "SUCCESS" || verifyData.status === "COMPLETED") && verifyData.amount !== void 0 && Number(verifyData.amount) === Number(paymentRecord.montant)) {
            isValidWebhook = true;
          }
        }
      } catch (e) {
        console.warn("Webhook iKeePay verification check error:", e);
      }
    } else {
      console.warn("[WEBHOOK SECURITY] IKEEPAY_PRIVATE_KEY non configur\xE9. Verification impossible.");
      isValidWebhook = false;
    }
    if (!isValidWebhook) {
      return res.status(400).json({ error: "Transaction non confirm\xE9e par la passerelle de paiement." });
    }
    const claimed = await dbAdapter.claimAndValidatePayment(paymentRecord.id);
    if (!claimed) {
      return res.json({ success: true, message: "Transaction d\xE9j\xE0 trait\xE9e.", tier: paymentRecord.planTier });
    }
    const subResult = await applyPlanToUser(paymentRecord.userId, paymentRecord.id, paymentRecord.planTier);
    return res.json({ success: true, message: "Paiement valid\xE9 via webhook.", tier: subResult.tier });
  }
  res.status(400).json({ error: "Statut de transaction non pris en charge." });
});
app.get("/api/admin/subscriptions", authenticateToken, requireAdmin, async (req, res) => {
  const users2 = await dbAdapter.getAllUsers();
  const now = Date.now();
  const subscriptions2 = users2.map((u) => {
    const expiresAt = u.subscriptionExpiresAt;
    const isExpired = expiresAt ? new Date(expiresAt).getTime() < now : false;
    const remainingDays = expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / (1e3 * 60 * 60 * 24))) : 0;
    return {
      userId: u.id,
      userName: u.nom,
      userEmail: u.email,
      role: u.role,
      subscriptionTier: u.subscriptionTier || "freemium",
      subscriptionExpiresAt: u.subscriptionExpiresAt || null,
      isExpired,
      remainingDays,
      createdAt: u.createdAt
    };
  });
  res.json({ subscriptions: subscriptions2 });
});
app.get("/api/admin/paiements", authenticateToken, requireAdmin, async (req, res) => {
  const payments2 = await dbAdapter.getAllPayments();
  res.json({ payments: payments2 });
});
app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
  const users2 = await dbAdapter.getAllUsers();
  const safeUsers = users2.map(({ motDePasseHash, ...u }) => u);
  res.json({ users: safeUsers });
});
app.get("/api/app-settings", async (req, res) => {
  const settings = await dbAdapter.getAppSettings();
  res.json({
    paiementActif: settings?.paiementActif ?? true,
    pricingPlans: settings?.pricingPlans || [],
    adminPaidMatrix: settings?.adminPaidMatrix || settings || {}
  });
});
async function sendBroadcastEmail(subject, message, recipients, link) {
  const validRecipients = recipients.filter((r) => r.email && r.email.includes("@"));
  const recipientCount = validRecipients.length;
  console.log(`
======================================================`);
  console.log(`[EMAIL BROADCAST DISPATCH]`);
  console.log(`Objet: ${subject}`);
  console.log(`Destinataires (${recipientCount} utilisateurs):`, validRecipients.map((r) => r.email).slice(0, 5).join(", ") + (recipientCount > 5 ? ` ...et ${recipientCount - 5} autres` : ""));
  console.log(`======================================================
`);
  for (const recipient of validRecipients) {
    sendFeatureUnlockedEmail({
      userEmail: recipient.email,
      userName: recipient.nom || "Cher Candidat",
      featureTitle: subject,
      featureMessage: message,
      actionLink: link || "gallery"
    }).catch((err) => {
      console.error(`[BROADCAST EMAIL ERROR to ${recipient.email}]`, err);
    });
  }
  return recipientCount;
}
function detectFreedFeatures(oldMatrix, newMatrix) {
  if (!oldMatrix || !newMatrix) return [];
  const freed = [];
  const checkArray = (oldArr = [], newArr = [], categoryName) => {
    oldArr.forEach((item) => {
      if (!newArr.includes(item)) {
        freed.push(`${item} (${categoryName})`);
      }
    });
  };
  checkArray(oldMatrix.paidTemplates, newMatrix.paidTemplates, "Mod\xE8le de CV");
  checkArray(oldMatrix.paidFonts, newMatrix.paidFonts, "Police Typographique");
  checkArray(oldMatrix.paidStudioMenus, newMatrix.paidStudioMenus, "Menu Studio");
  checkArray(oldMatrix.paidSubOptions, newMatrix.paidSubOptions, "Option Cr\xE9ative");
  checkArray(oldMatrix.paidPatterns, newMatrix.paidPatterns, "Motif d'Arri\xE8re-Plan");
  checkArray(oldMatrix.paidHeaderStyles, newMatrix.paidHeaderStyles, "Style d'En-T\xEAte");
  return freed;
}
app.get("/api/paid-matrix", async (req, res) => {
  const settings = await dbAdapter.getAppSettings();
  const matrix = settings?.adminPaidMatrix || settings || {};
  res.json(matrix);
});
app.get("/api/admin/paid-matrix", authenticateToken, requireAdmin, async (req, res) => {
  const settings = await dbAdapter.getAppSettings();
  const matrix = settings?.adminPaidMatrix || settings || {};
  res.json(matrix);
});
app.post("/api/admin/paid-matrix", authenticateToken, requireAdmin, async (req, res) => {
  const newMatrix = req.body;
  const currentSettings = await dbAdapter.getAppSettings();
  const oldMatrix = currentSettings?.adminPaidMatrix || {};
  const updated = await dbAdapter.updateAppSettings({
    ...currentSettings,
    adminPaidMatrix: newMatrix
  });
  const freedItems = detectFreedFeatures(oldMatrix, newMatrix);
  if (freedItems.length > 0) {
    const users2 = await dbAdapter.getAllUsers();
    const itemsPreview = freedItems.slice(0, 4).join(", ") + (freedItems.length > 4 ? ` et ${freedItems.length - 4} autres` : "");
    const notifTitle = "\u{1F389} \xC9l\xE9ment Payant D\xE9bloqu\xE9 100% GRATUIT !";
    const notifMessage = `Bonne nouvelle ! Les \xE9l\xE9ments suivants sont d\xE9sormais accessibles 100% GRATUITEMENT pour tous les utilisateurs : ${itemsPreview}. Venez personnaliser votre CV d\xE8s maintenant !`;
    const createdNotif = await dbAdapter.createNotification({
      titre: notifTitle,
      message: notifMessage,
      type: "FEATURE_FREE",
      cible: "TOUS",
      lien: "gallery",
      badge: "GRATUIT",
      envoyeParEmail: true,
      nombreEmailsEnvoyes: users2.length,
      auteur: req.user?.nom || "Administrateur"
    });
    sendBroadcastEmail(notifTitle, notifMessage, users2, "gallery");
  }
  res.json({ success: true, adminPaidMatrix: updated.adminPaidMatrix || newMatrix });
});
app.get("/api/admin/settings", authenticateToken, requireAdmin, async (req, res) => {
  const settings = await dbAdapter.getAppSettings();
  res.json({ appSettings: settings });
});
app.post("/api/admin/settings", authenticateToken, requireAdmin, async (req, res) => {
  const { paiementActif, pricingPlans, adminPaidMatrix } = req.body;
  const currentSettings = await dbAdapter.getAppSettings();
  const wasPaiementActif = currentSettings?.paiementActif ?? true;
  const updated = await dbAdapter.updateAppSettings({
    paiementActif,
    pricingPlans,
    ...adminPaidMatrix ? { adminPaidMatrix } : {}
  });
  if (wasPaiementActif === true && paiementActif === false) {
    const users2 = await dbAdapter.getAllUsers();
    const notifTitle = "\u{1F389} TOUT LE SITE EST D\xC9SORMAIS 100% GRATUIT !";
    const notifMessage = "L'administrateur a d\xE9bloqu\xE9 l'acc\xE8s total : l'ensemble des 59+ mod\xE8les de CV, fonctionnalit\xE9s du Creator Studio et outils IA sont maintenant enti\xE8rement GRATUITS pour tous les utilisateurs !";
    await dbAdapter.createNotification({
      titre: notifTitle,
      message: notifMessage,
      type: "FEATURE_FREE",
      cible: "TOUS",
      lien: "gallery",
      badge: "100% GRATUIT",
      envoyeParEmail: true,
      nombreEmailsEnvoyes: users2.length,
      auteur: req.user?.nom || "Administrateur"
    });
    sendBroadcastEmail(notifTitle, notifMessage, users2, "gallery");
  }
  res.json({ success: true, appSettings: updated });
});
app.get("/api/notifications", optionalAuthenticateToken, async (req, res) => {
  const userId = req.user?.id || "anonymous";
  const userTier = req.user?.subscriptionTier || "freemium";
  const userNotifs = await dbAdapter.getNotificationsForUser(userId, userTier);
  const unreadCount = userNotifs.filter((n) => !n.isRead).length;
  res.json({
    notifications: userNotifs,
    unreadCount
  });
});
app.post("/api/notifications/:id/read", optionalAuthenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || "anonymous";
  await dbAdapter.markNotificationRead(id, userId);
  res.json({ success: true });
});
app.post("/api/notifications/read-all", optionalAuthenticateToken, async (req, res) => {
  const userId = req.user?.id || "anonymous";
  await dbAdapter.markAllNotificationsRead(userId);
  res.json({ success: true });
});
app.get("/api/admin/notifications", authenticateToken, requireAdmin, async (req, res) => {
  const allNotifs = await dbAdapter.getAllNotifications();
  const allUsers = await dbAdapter.getAllUsers();
  res.json({
    notifications: allNotifs,
    totalUsersCount: allUsers.length
  });
});
app.post("/api/admin/notifications/send", authenticateToken, requireAdmin, async (req, res) => {
  const { titre, message, type, cible, lien, badge, envoyeParEmail } = req.body;
  if (!titre || !message) {
    return res.status(400).json({ error: "Le titre et le message sont requis." });
  }
  const allUsers = await dbAdapter.getAllUsers();
  const targetUsers = allUsers.filter((u) => {
    if (!cible || cible === "TOUS") return true;
    return u.subscriptionTier === cible;
  });
  const shouldSendEmail = Boolean(envoyeParEmail);
  let emailsSent = 0;
  if (shouldSendEmail && targetUsers.length > 0) {
    emailsSent = await sendBroadcastEmail(titre, message, targetUsers, lien);
  }
  const newNotification = await dbAdapter.createNotification({
    titre,
    message,
    type: type || "SYSTEM",
    cible: cible || "TOUS",
    lien: lien || "",
    badge: badge || "",
    envoyeParEmail: shouldSendEmail,
    nombreEmailsEnvoyes: shouldSendEmail ? targetUsers.length : 0,
    auteur: req.user?.nom || "Administrateur"
  });
  res.json({
    success: true,
    notification: newNotification,
    recipientsCount: targetUsers.length,
    emailsSentCount: emailsSent
  });
});
app.delete("/api/admin/notifications/:id", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const deleted = await dbAdapter.deleteNotification(id);
  if (!deleted) {
    return res.status(404).json({ error: "Notification non trouv\xE9e." });
  }
  res.json({ success: true });
});
app.post("/api/admin/paiement/:id/valider", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const payment = await dbAdapter.getPaymentById(id);
  if (!payment) return res.status(404).json({ error: "Paiement non trouv\xE9." });
  const claimed = await dbAdapter.claimAndValidatePayment(id);
  if (!claimed) {
    return res.status(400).json({ error: "Paiement d\xE9j\xE0 valid\xE9 ou trait\xE9." });
  }
  const subResult = await applyPlanToUser(payment.userId, payment.id, payment.planTier);
  const user = await dbAdapter.findUserById(payment.userId);
  if (user && user.email) {
    const settings = await dbAdapter.getAppSettings();
    const matchingPlan = (settings?.pricingPlans || []).find((p) => p.code === payment.planTier);
    sendSubscriptionConfirmationEmail({
      userEmail: user.email,
      userName: user.nom,
      planName: matchingPlan?.nom || `Pack ${payment.planTier.toUpperCase()}`,
      planTier: subResult.tier,
      amount: Number(payment.montant),
      currency: payment.devise || "FCFA",
      durationDays: subResult.durationDays,
      expiresAt: subResult.expiresAt
    }).catch((err) => {
      console.error("[ADMIN VALIDATE PAYMENT EMAIL ERROR]", err);
    });
  }
  res.json({ payment: { ...payment, statut: "VALIDE" } });
});
app.post("/api/admin/paiement/:id/rejeter", authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { noteAdmin } = req.body;
  const payment = await dbAdapter.getPaymentById(id);
  if (!payment) return res.status(404).json({ error: "Paiement non trouv\xE9." });
  await dbAdapter.updatePaymentStatus(id, "REJETE", noteAdmin || "Refus\xE9 par l'administrateur");
  res.json({ payment: { ...payment, statut: "REJETE", noteAdmin } });
});
app.post("/api/ai/lettre-motivation", optionalAuthenticateToken, checkSubscriptionGate("premium"), async (req, res) => {
  const { cv, langue = "fr", entreprise = "", poste = "", ton = "professionnel", pointsCles = "" } = req.body;
  if (!cv) return res.status(400).json({ error: "CV requis" });
  const profilSection = cv.sections?.find((s) => s.type === "profil");
  const nomCandidat = profilSection?.contenu?.nomComplet || req.user?.nom || "Candidat";
  const titrePro = profilSection?.contenu?.titreProfessionnel || poste || "Professionnel";
  const dynamicFallback = generateDynamicFallbackLetter(
    { cv, langue, entreprise, poste, ton, pointsCles },
    nomCandidat,
    titrePro
  );
  const ai = getGemini();
  if (!ai) {
    return res.json(dynamicFallback);
  }
  try {
    const prompt = buildGeminiCoverLetterPrompt(
      { cv, langue, entreprise, poste, ton, pointsCles },
      nomCandidat,
      titrePro
    );
    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse(responseText, dynamicFallback);
    if (!parsed.texteComplet && parsed.paragrapheAccroche) {
      parsed.texteComplet = `${parsed.formulePolitesseEntree || "Madame, Monsieur,"}

${parsed.paragrapheAccroche}

${parsed.paragrapheValeurAjoutee || ""}

${parsed.paragrapheAdequationEntreprise || ""}

${parsed.paragrapheConclusion || ""}

${parsed.formulePolitesseSortie || "Veuillez agr\xE9er mes salutations."}

${nomCandidat}`;
    }
    return res.json({ ...dynamicFallback, ...parsed });
  } catch (err) {
    console.warn("Gemini cover letter generation fallback used:", err);
    return res.json(dynamicFallback);
  }
});
app.post("/api/ai/optimiser-paragraphe-lettre", optionalAuthenticateToken, checkSubscriptionGate("classique"), async (req, res) => {
  const {
    texte = "",
    paragrapheType = "accroche",
    poste = "",
    entreprise = "",
    ton = "professionnel",
    langue = "fr",
    instructions = ""
  } = req.body;
  if (!texte || !texte.trim()) {
    return res.status(400).json({ error: "Texte requis pour optimisation" });
  }
  const ai = getGemini();
  if (!ai) {
    return res.json({
      texteOptimise: texte.trim(),
      suggestions: ["Service IA temporairement inaccessible. Texte d'origine conserv\xE9."]
    });
  }
  try {
    const prompt = `Tu es un expert ex\xE9cutif en recrutement et en r\xE9daction de lettres de motivation de haut niveau.
Ta mission est d'optimiser le paragraphe de lettre de motivation r\xE9dig\xE9 par le candidat.

CONTEXTE :
- Type de paragraphe : ${paragrapheType} (accroche motivationnelle, valeur ajout\xE9e et r\xE9alisations, ad\xE9quation avec l'entreprise, ou conclusion et appel \xE0 l'action)
- Poste vis\xE9 : ${poste || "Poste professionnel"}
- Entreprise vis\xE9e : ${entreprise || "Entreprise cible"}
- Ton souhait\xE9 : ${ton || "professionnel, dynamique et engageant"}
- Langue de r\xE9daction : ${langue === "en" ? "English" : langue === "es" ? "Espa\xF1ol" : "Fran\xE7ais"}
${instructions ? `- Consignes : ${instructions}` : ""}

PARAGRAPHE ENTR\xC9 PAR L'UTILISATEUR :
"""
${texte.trim()}
"""

INSTRUCTIONS DE R\xC9DACTION :
1. Conserve fid\xE8lement les \xE9l\xE9ments factuels, les r\xE9alisations et l'intention de l'utilisateur.
2. Utilise des verbes d'action puissants, une syntaxe soign\xE9e et un vocabulaire professionnel remarquable.
3. Rends le propos percutant, convaincant et fluide (3 \xE0 5 phrases \xE9quilibr\xE9es).
4. \xC9limine les formulations banales ou h\xE9sitantes.
5. Renvoie UNIQUEMENT un objet JSON valide conforme au sch\xE9ma suivant :
{
  "texteOptimise": "Texte complet du paragraphe magnifi\xE9 et optimis\xE9",
  "suggestions": [
    "Conseil court 1",
    "Conseil court 2"
  ]
}`;
    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse(responseText, {
      texteOptimise: texte.trim(),
      suggestions: []
    });
    return res.json({
      texteOptimise: parsed.texteOptimise || texte.trim(),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
    });
  } catch (err) {
    console.warn("Gemini paragraph optimization error:", err);
    return res.json({
      texteOptimise: texte.trim(),
      suggestions: []
    });
  }
});
app.post("/api/ai/linkedin-profile", optionalAuthenticateToken, checkSubscriptionGate("premium"), async (req, res) => {
  const { cv, langue = "fr" } = req.body;
  if (!cv) return res.status(400).json({ error: "CV requis" });
  const ai = getGemini();
  const defaultLinkedIn = {
    titreProfessionnel: `Expert Orient\xE9 R\xE9sultats & Impact`,
    resumeAPropos: `Passionn\xE9 par l'excellence op\xE9rationnelle et l'innovation, j'accompagne les projets avec rigueur et vision strat\xE9gique.`,
    motsClesStrategiques: ["Leadership", "Gestion de projet", "Innovation", "Excellence op\xE9rationnelle"],
    experiencesOptimisees: [],
    conseilsVisibilite: ["Soignez votre photo de profil", "Personnalisez votre banni\xE8re", "Demandez des recommandations professionnelles"]
  };
  if (!ai) return res.json(defaultLinkedIn);
  try {
    const prompt = `Cr\xE9e un profil LinkedIn optimis\xE9 bas\xE9 sur ce CV en ${langue === "en" ? "Anglais" : langue === "ar" ? "Arabe" : "Fran\xE7ais"}:
${JSON.stringify(cv).slice(0, 6e3)}
Format JSON: { "titreProfessionnel": "", "resumeAPropos": "", "motsClesStrategiques": [], "experiencesOptimisees": [], "conseilsVisibilite": [] }`;
    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    return res.json(safeJsonParse(responseText, defaultLinkedIn));
  } catch (err) {
    return res.json(defaultLinkedIn);
  }
});
app.post("/api/ai/linkedin", optionalAuthenticateToken, checkSubscriptionGate("premium"), async (req, res) => {
  const { cv, langue = "fr" } = req.body;
  if (!cv) return res.status(400).json({ error: "CV requis" });
  const ai = getGemini();
  const defaultLinkedIn = {
    titreProfessionnel: `Expert Orient\xE9 R\xE9sultats & Impact`,
    resumeAPropos: `Passionn\xE9 par l'excellence op\xE9rationnelle et l'innovation, j'accompagne les projets avec rigueur.`,
    motsClesStrategiques: ["Leadership", "Gestion de projet", "Innovation"],
    experiencesOptimisees: [],
    conseilsVisibilite: ["Soignez votre photo de profil", "Personnalisez votre banni\xE8re", "Demandez des recommandations"]
  };
  if (!ai) return res.json(defaultLinkedIn);
  try {
    const prompt = `Cr\xE9e un profil LinkedIn optimis\xE9 bas\xE9 sur ce CV:
${JSON.stringify(cv).slice(0, 6e3)}
Format JSON: { "titreProfessionnel": "", "resumeAPropos": "", "motsClesStrategiques": [], "experiencesOptimisees": [], "conseilsVisibilite": [] }`;
    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    return res.json(safeJsonParse(responseText, defaultLinkedIn));
  } catch (err) {
    return res.json(defaultLinkedIn);
  }
});
var handleJobOfferAnalysis = async (req, res) => {
  const { texteOffre, offreTexte, imageBase64, offreImage, cv, langue = "fr" } = req.body;
  const rawText = (texteOffre || offreTexte || "").trim();
  const rawImage = imageBase64 || offreImage || "";
  if (!rawText && !rawImage) {
    return res.status(400).json({ error: "Texte ou capture d'\xE9cran de l'offre d'emploi requis." });
  }
  const defaultAnalysis = {
    titrePoste: "Poste Cible",
    entreprise: "Entreprise Recruteuse",
    lieu: "Non sp\xE9cifi\xE9 / T\xE9l\xE9travail",
    competencesClesRequises: ["Excellence op\xE9rationnelle", "Autonomie & Rigueur", "Communication & Travail d'\xE9quipe"],
    pointsFortsDetectes: ["Profil align\xE9 avec les exigences fondamentales du poste"],
    couleurDetectee: "#1e40af",
    couleurSecondaire: "#3b82f6",
    nomCouleurMarque: "Bleu corporate identitaire",
    questionsCompetences: [
      { id: "q_comp", question: "Parmi les comp\xE9tences cl\xE9s requises par cette offre, lesquelles ma\xEEtrisez-vous et sur quels outils concrets ? (Ne rien inventer)", description: "Indiquez uniquement vos r\xE9elles comp\xE9tences techniques ou outils ma\xEEtris\xE9s", contexte: "Comp\xE9tences cl\xE9s" }
    ],
    questionsExperiences: [
      { id: "q_exp", question: "Quelles missions ou r\xE9alisations de vos exp\xE9riences pass\xE9es correspondent le mieux aux attentes de cette offre ?", description: "Pr\xE9cisez des r\xE9sultats ou projets cl\xE9s \xE0 reformuler et valoriser", contexte: "Exp\xE9riences professionnelles" }
    ],
    questionsPrecision: [
      { id: "q_comp", question: "Parmi les comp\xE9tences cl\xE9s requises par cette offre, lesquelles ma\xEEtrisez-vous et sur quels outils concrets ? (Ne rien inventer)", description: "Indiquez uniquement vos r\xE9elles comp\xE9tences techniques ou outils ma\xEEtris\xE9s", contexte: "Comp\xE9tences cl\xE9s" },
      { id: "q_exp", question: "Quelles missions ou r\xE9alisations de vos exp\xE9riences pass\xE9es correspondent le mieux aux attentes de cette offre ?", description: "Pr\xE9cisez des r\xE9sultats ou projets cl\xE9s \xE0 reformuler et valoriser", contexte: "Exp\xE9riences professionnelles" }
    ]
  };
  if (rawText) {
    const firstLines = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 2);
    if (firstLines.length > 0) {
      defaultAnalysis.titrePoste = firstLines[0].slice(0, 60);
    }
  }
  const ai = getGemini();
  if (!ai) return res.json(defaultAnalysis);
  try {
    let contents;
    const targetLang = langue === "en" ? "Anglais" : langue === "ar" ? "Arabe" : "Fran\xE7ais";
    const instructionPrompt = `Tu es un expert recruteur RH et directeur artistique. Analyse attentivement cette offre d'emploi et extrait les donn\xE9es en ${targetLang}.
Extrais le titre du poste, le nom de l'entreprise, le lieu, une liste de 3 \xE0 6 comp\xE9tences cl\xE9s indispensables ordonn\xE9es par priorit\xE9, 2 points forts requis, et deux questions cibl\xE9es :
1. Une question sp\xE9cifique sur les comp\xE9tences techniques / outils r\xE9els (pour ne rien inventer d'artificiel).
2. Une question sp\xE9cifique sur les exp\xE9riences et r\xE9alisations pass\xE9es du candidat (pour les reformuler et les orienter vers le poste).

IMPORTANT - RECONNAISSANCE DE LA COULEUR DE MARQUE & LOGO :
Rep\xE8re attentivement la couleur dominante ou de marque visible sur la photo de l'annonce, sur le logo de l'entreprise ou issue de l'identit\xE9 visuelle de l'entreprise :
1. Si une photo, une annonce graphique ou un logo est pr\xE9sent dans l'image : rep\xE8re la couleur distinctive dominante du logo ou de la charte (ex: '#0052CC', '#E11D48', '#059669', '#FF6B00', '#10B981', '#18181B', '#7C3AED', '#2563EB').
2. Si l'offre est textuelle : identifie la couleur officielle reconnue de l'entreprise (ex: Google = #4285F4, TotalEnergies = #ED1C24, Orange = #FF7900, Soci\xE9t\xE9 G\xE9n\xE9rale = #E60028, BNP Paribas = #00915A, Microsoft = #00A4EF, Spotify = #1ED760, Amazon = #FF9900, L'Or\xE9al = #E50019, Capgemini = #0070AD).
3. Si l'entreprise n'a pas de couleur notoire : choisis une teinte harmonieuse et \xE9l\xE9gante adapt\xE9e \xE0 son secteur (tech: #2563EB, finance/conseil: #1E3A8A, sant\xE9/environnement: #059669, luxe/art: #18181B, marketing/cr\xE9atif: #7C3AED, industrie/BTP: #0D9488).
Propose \xE9galement une couleur secondaire harmonieuse et un intitul\xE9 court de la couleur rep\xE9r\xE9e.

Format JSON strict obligatoire :
{
  "titrePoste": "intitul\xE9 exact",
  "entreprise": "nom ou 'Non sp\xE9cifi\xE9'",
  "lieu": "lieu ou 'Non sp\xE9cifi\xE9'",
  "competencesClesRequises": ["comp\xE9tence prioritaire 1", "comp\xE9tence 2", "comp\xE9tence 3", "comp\xE9tence 4"],
  "pointsFortsDetectes": ["point fort 1", "point fort 2"],
  "couleurDetectee": "#1E40AF",
  "couleurSecondaire": "#60A5FA",
  "nomCouleurMarque": "Bleu identitaire rep\xE9r\xE9 sur l'annonce / logo",
  "questionsCompetences": [
    { "id": "q_comp", "question": "question sur les comp\xE9tences et outils r\xE9els", "description": "conseil pour r\xE9pondre", "contexte": "Comp\xE9tences cl\xE9s" }
  ],
  "questionsExperiences": [
    { "id": "q_exp", "question": "question sur les projets et r\xE9alisations pass\xE9s \xE0 valoriser", "description": "conseil pour r\xE9pondre", "contexte": "Exp\xE9riences professionnelles" }
  ],
  "questionsPrecision": [
    { "id": "q_comp", "question": "question sur les comp\xE9tences et outils r\xE9els", "description": "conseil pour r\xE9pondre", "contexte": "Comp\xE9tences cl\xE9s" },
    { "id": "q_exp", "question": "question sur les projets et r\xE9alisations pass\xE9s \xE0 valoriser", "description": "conseil pour r\xE9pondre", "contexte": "Exp\xE9riences professionnelles" }
  ]
}`;
    if (rawImage) {
      const mimeMatch = rawImage.match(/^data:(image\/[a-zA-Z0-9-+.]+);base64,/i);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const base64Data = rawImage.replace(/^data:image\/[a-zA-Z0-9-+.]+;base64,/, "");
      contents = {
        parts: [
          { text: instructionPrompt },
          { inlineData: { data: base64Data, mimeType } }
        ]
      };
    } else {
      contents = `${instructionPrompt}

=== OFFRE D'EMPLOI ===
${rawText.slice(0, 7e3)}`;
    }
    const responseText = await generateGeminiContentWithFallback(ai, contents);
    const parsed = safeJsonParse(responseText, defaultAnalysis);
    const parsedAny = parsed;
    const deterministicSuggestions = generateTargetingSuggestions({ cv, offre: parsed, rawText, langue });
    return res.json({
      ...defaultAnalysis,
      ...deterministicSuggestions,
      ...parsed,
      suggestionsProfil: parsedAny.suggestionsProfil || deterministicSuggestions.suggestionsProfil,
      competencesPriorisees: parsedAny.competencesPriorisees || deterministicSuggestions.competencesPriorisees,
      suggestionsExperiences: parsedAny.suggestionsExperiences || deterministicSuggestions.suggestionsExperiences,
      questionsCompetences: parsedAny.questionsCompetences || deterministicSuggestions.questionsCompetences,
      questionsExperiences: parsedAny.questionsExperiences || deterministicSuggestions.questionsExperiences
    });
  } catch (err) {
    console.error("handleJobOfferAnalysis error:", err);
    const deterministicSuggestions = generateTargetingSuggestions({ cv, offre: defaultAnalysis, rawText, langue });
    return res.json({ ...defaultAnalysis, ...deterministicSuggestions });
  }
};
app.post("/api/ai/analyse-offre", optionalAuthenticateToken, checkSubscriptionGate("premium"), handleJobOfferAnalysis);
app.post("/api/ai/cibler-offre", optionalAuthenticateToken, checkSubscriptionGate("premium"), handleJobOfferAnalysis);
app.post("/api/ai/reformuler-experience", optionalAuthenticateToken, checkSubscriptionGate("premium"), async (req, res) => {
  const { poste = "", entreprise = "", description = "", texteOriginal = "", langue = "fr" } = req.body;
  const rawInput = (description || texteOriginal || "").trim();
  const ai = getGemini();
  const fallback = rawInput ? `${rawInput}
- Pilotage des missions cl\xE9s et am\xE9lioration continue de la performance op\xE9rationnelle.` : "- Prise en charge des missions cl\xE9s et optimisation des r\xE9sultats selon les objectifs fix\xE9s.";
  if (!ai) {
    return res.json({
      description: fallback,
      texteReformule: fallback
    });
  }
  try {
    const prompt = `Tu es un expert RH. Reformule la description d'exp\xE9rience suivante pour un CV professionnel \xE0 fort impact en ${langue === "en" ? "Anglais" : langue === "ar" ? "Arabe" : "Fran\xE7ais"}.
Poste: ${poste}, Entreprise: ${entreprise}
Description brute: ${rawInput}
Format JSON: { "description": "texte reformul\xE9 sous forme de tirets et puces d'action percutantes", "texteReformule": "texte reformul\xE9" }`;
    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse(responseText, {});
    const finalDesc = parsed.description || parsed.texteReformule || fallback;
    return res.json({ description: finalDesc, texteReformule: finalDesc });
  } catch (err) {
    return res.json({ description: fallback, texteReformule: fallback });
  }
});
var handleAdapterCandidature = async (req, res) => {
  const { cv, texteOffre, offreTexte, offre, offreAnalyse, reponsesQuestions, langue = "fr" } = req.body;
  if (!cv) return res.status(400).json({ error: "CV requis" });
  const activeOffre = offre || offreAnalyse || {};
  const targetColor = activeOffre.couleurDetectee || "#1e40af";
  const targetSecondary = activeOffre.couleurSecondaire || "#3b82f6";
  const nomCouleur = activeOffre.nomCouleurMarque || "Couleur corporate de marque";
  const baseAdaptedCv = buildAdaptedCvLocally({
    cv,
    offre: activeOffre,
    reponsesQuestions: reponsesQuestions || {},
    langue,
    targetColor,
    targetSecondaryColor: targetSecondary
  });
  const dynamicFallbackLetter = generateDynamicFallbackLetter(
    {
      cv: baseAdaptedCv,
      langue,
      entreprise: activeOffre.entreprise || "Entreprise Cible",
      poste: activeOffre.titrePoste || "Poste Cible"
    },
    baseAdaptedCv.sections?.find((s) => s.type === "profil")?.contenu?.nomComplet || "Candidat",
    activeOffre.titrePoste || "Professionnel"
  );
  const defaultResult = {
    cvModifie: baseAdaptedCv,
    cvPersonnalise: baseAdaptedCv,
    adaptedCv: baseAdaptedCv,
    tauxCorrespondanceEstime: 92,
    motsClesAjoutes: activeOffre.competencesClesRequises || ["Excellence op\xE9rationnelle", "Rigueur", "Analyse"],
    justificationAdaptation: `CV adapt\xE9 pour le poste de ${activeOffre.titrePoste || "Poste Cible"} chez ${activeOffre.entreprise || "Entreprise"} : profil professionnel r\xE9align\xE9, comp\xE9tences r\xE9ordonn\xE9es selon les priorit\xE9s du poste, descriptions d'exp\xE9riences orient\xE9es et harmonisation graphique (${nomCouleur}).`,
    modificationsApportees: [
      `Profil professionnel r\xE9align\xE9 sur le poste de ${activeOffre.titrePoste || "Poste Cible"}`,
      `Comp\xE9tences r\xE9ordonn\xE9es en priorit\xE9 selon les exigences de l'offre (sans comp\xE9tences invent\xE9es)`,
      `Descriptions des exp\xE9riences orient\xE9es avec verbes d'action cibl\xE9s`,
      `Palette graphique appliqu\xE9e aux accents et titres (${targetColor})`
    ],
    couleurDetectee: targetColor,
    couleurSecondaire: targetSecondary,
    nomCouleurMarque: nomCouleur,
    lettreMotivation: dynamicFallbackLetter,
    success: true
  };
  const ai = getGemini();
  if (!ai) return res.json(defaultResult);
  try {
    const offerContent = JSON.stringify(activeOffre || texteOffre || offreTexte || "").slice(0, 5e3);
    const prompt = `Tu es un expert RH de haut niveau et directeur artistique. Adapte et personnalise ce CV et cette lettre de motivation pour qu'ils r\xE9pondent pr\xE9cis\xE9ment aux exigences de cette offre d'emploi en ${langue === "en" ? "Anglais" : langue === "ar" ? "Arabe" : "Fran\xE7ais"}.

CV SOURCE JSON :
${JSON.stringify(baseAdaptedCv)}

OFFRE CIBLE :
${offerContent}

R\xC9PONSES DU CANDIDAT (COMP\xC9TENCES VALID\xC9ES & R\xC9ALISATIONS CONCR\xC8TES) :
${JSON.stringify(reponsesQuestions || {})}

COULEUR DE MARQUE D\xC9TECT\xC9E : ${targetColor}

DIRECTIVES IMP\xC9RATIVES :
1. STRICTEMENT NE RIEN INVENTER : ne cr\xE9e aucun faux dipl\xF4me, aucune fausse entreprise, aucune fausse date et aucune comp\xE9tence imaginaire.
2. REFORMULATION TOTALE DU PROFIL PROFESSIONNEL : le texte du profil ('resume') doit \xEAtre COMPL\xC8TEMENT refait et r\xE9\xE9crit pour matcher pr\xE9cis\xE9ment avec les missions de l'offre chez ${activeOffre.entreprise || "l'entreprise cible"}. R\xE9dige un paragraphe fluide, percutant et ultra-professionnel (4 \xE0 5 phrases). Adapte "titreProfessionnel" pour correspondre exactement \xE0 ${activeOffre.titrePoste || "Poste Cible"}.
3. REFORMULATION TOTALE DES EXP\xC9RIENCES : pour CHAQUE exp\xE9rience professionnelle, r\xE9\xE9cris ENTI\xC8REMENT la description sous forme de puces percutantes (commen\xE7ant par des verbes d'action professionnels) qui valorisent les missions r\xE9elles du candidat en les alignant sur les exigences et le vocabulaire de l'offre. Ne garde pas les phrases d'origine telles quelles, reformule-les de mani\xE8re percutante sans rien inventer.
4. SECTION "COMPETENCES" : r\xE9ordonne les comp\xE9tences existantes pour mettre en t\xEAte celles prioritaires pour le poste.
5. TITRES DES SECTIONS : conserve imp\xE9rativement les titres des sections en ${langue === "en" ? "Anglais" : langue === "ar" ? "Arabe" : "Fran\xE7ais"}. N'\xE9cris JAMAIS de titres de sections en arabe si la langue cible est le fran\xE7ais ou l'anglais.
6. CONSERVER TOUTES LES SECTIONS : ne supprime aucune section du CV (profil, experience, formation, competences, etc.). Conserve la m\xEAme structure JSON pour chaque section.
7. LETTRE DE MOTIVATION : g\xE9n\xE8re une lettre ultra-cibl\xE9e, avec une accroche personnalis\xE9e, un paragraphe prouvant l'ad\xE9quation au poste, et une conclusion demandant explicitement un entretien.

Format JSON strict :
{
  "cvModifie": {
    "titre": "CV - ${activeOffre.titrePoste || "Candidature Cibl\xE9e"}",
    "sections": [
      // Sections compl\xE8tes avec profil adapt\xE9, comp\xE9tences r\xE9ordonn\xE9es et exp\xE9riences orient\xE9es
    ]
  },
  "tauxCorrespondanceEstime": 95,
  "motsClesAjoutes": ["mot-cl\xE9 1", "mot-cl\xE9 2"],
  "justificationAdaptation": "synth\xE8se des ajustements r\xE9alis\xE9s et alignement graphique",
  "modificationsApportees": [
    "Profil professionnel adapt\xE9 au poste vis\xE9",
    "Comp\xE9tences cl\xE9s r\xE9ordonn\xE9es selon les priorit\xE9s du recruteur",
    "Exp\xE9riences enrichies et orient\xE9es r\xE9sultats",
    "Couleurs du CV harmonis\xE9es avec l'identit\xE9 visuelle de l'entreprise"
  ],
  "lettreMotivation": {
    "objet": "Candidature au poste de ${activeOffre.titrePoste || "..."}",
    "formulePolitesseEntree": "Madame, Monsieur,",
    "paragrapheAccroche": "...",
    "paragrapheValeurAjoutee": "...",
    "paragrapheAdequationEntreprise": "...",
    "paragrapheConclusion": "...",
    "formulePolitesseSortie": "Je vous prie d'agr\xE9er, Madame, Monsieur, l'expression de mes salutations distingu\xE9es.",
    "texteComplet": "..."
  }
}`;
    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse(responseText, defaultResult);
    let finalSections = baseAdaptedCv.sections;
    if (parsed.cvModifie && Array.isArray(parsed.cvModifie.sections) && parsed.cvModifie.sections.length > 0) {
      finalSections = baseAdaptedCv.sections.map((originalSec) => {
        const matchingAiSec = parsed.cvModifie.sections.find((s) => s.id === originalSec.id || s.type === originalSec.type);
        if (!matchingAiSec) return originalSec;
        const aiContenu = matchingAiSec.contenu;
        let mergedContenu = originalSec.contenu;
        if (originalSec.type === "profil" && aiContenu && typeof aiContenu === "object") {
          mergedContenu = {
            ...originalSec.contenu,
            ...aiContenu,
            titreProfessionnel: aiContenu.titreProfessionnel || originalSec.contenu?.titreProfessionnel,
            resume: aiContenu.resume || originalSec.contenu?.resume
          };
        } else if (originalSec.type === "competences" && Array.isArray(aiContenu) && aiContenu.length > 0) {
          mergedContenu = aiContenu;
        } else if (originalSec.type === "experience" && Array.isArray(aiContenu) && aiContenu.length > 0) {
          mergedContenu = aiContenu;
        } else if (aiContenu) {
          mergedContenu = aiContenu;
        }
        let safeTitle = originalSec.titre || matchingAiSec.titre;
        if (langue !== "ar" && matchingAiSec.titre && /[\u0600-\u06FF]/.test(matchingAiSec.titre)) {
          safeTitle = originalSec.titre || (originalSec.type === "profil" ? "Profil Professionnel" : originalSec.type === "experience" ? "Exp\xE9riences Professionnelles" : "Section");
        }
        return {
          ...originalSec,
          ...matchingAiSec,
          id: originalSec.id,
          type: originalSec.type,
          titre: safeTitle,
          contenu: mergedContenu
        };
      });
    }
    const finalAdaptedCv = {
      ...baseAdaptedCv,
      ...parsed.cvModifie || {},
      sections: finalSections,
      couleurAccent: targetColor,
      couleurAccentSecondaire: targetSecondary,
      couleurTitreSection: targetColor,
      couleurFondProfil: targetColor,
      theme: {
        ...cv.theme || {},
        primaryColor: targetColor,
        secondaryColor: targetSecondary,
        headingColor: targetColor,
        headerBackgroundColor: targetColor,
        badgeColor: targetColor
      }
    };
    const sanitizedCv = autoFixCapitalization(finalAdaptedCv);
    return res.json({
      ...defaultResult,
      ...parsed,
      cvModifie: sanitizedCv,
      cvPersonnalise: sanitizedCv,
      adaptedCv: sanitizedCv,
      couleurDetectee: targetColor,
      couleurSecondaire: targetSecondary,
      nomCouleurMarque: nomCouleur,
      success: true
    });
  } catch (err) {
    console.error("handleAdapterCandidature error:", err);
    return res.json(defaultResult);
  }
};
app.post("/api/ai/personnaliser-cv", optionalAuthenticateToken, checkSubscriptionGate("premium"), handleAdapterCandidature);
app.post("/api/ai/adapter-candidature", optionalAuthenticateToken, checkSubscriptionGate("premium"), handleAdapterCandidature);
var handleCorrection = async (req, res) => {
  const { texte = "", text: text2 = "", cv, langue = "fr" } = req.body;
  const input = texte || text2 || (cv ? JSON.stringify(cv) : "");
  if (!input) return res.status(400).json({ error: "Texte \xE0 corriger requis." });
  const ai = getGemini();
  const defaultCorrection = {
    texteCorrige: autoFixCapitalization(input),
    corrections: [],
    erreurs: [],
    score: 98
  };
  if (!ai) return res.json(defaultCorrection);
  try {
    const prompt = `Corrige la grammaire, l'orthographe, les majuscules des noms propres et le style du texte suivant en ${langue === "en" ? "Anglais" : langue === "ar" ? "Arabe" : "Fran\xE7ais"}.
Texte: ${input.slice(0, 5e3)}
Format JSON: { "texteCorrige": "", "corrections": [{ "original": "", "correction": "", "explication": "" }], "erreurs": [{ "motOriginal": "", "correction": "", "explication": "", "type": "orthographe" }], "score": 95 }`;
    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse(responseText, defaultCorrection);
    return res.json({ ...defaultCorrection, ...parsed, texteCorrige: autoFixCapitalization(parsed.texteCorrige || input) });
  } catch (err) {
    return res.json(defaultCorrection);
  }
};
app.post("/api/ai/correction", optionalAuthenticateToken, checkSubscriptionGate("classique"), handleCorrection);
app.post("/api/correction", optionalAuthenticateToken, checkSubscriptionGate("classique"), handleCorrection);
var handleCVTranslation = async (req, res) => {
  try {
    const { cv, targetLang = "en" } = req.body;
    if (!cv) {
      return res.status(400).json({ error: "CV requis pour la traduction." });
    }
    const ai = getGemini();
    const langLabel = targetLang === "ar" ? "Arabe" : targetLang === "en" ? "Anglais" : "Fran\xE7ais";
    if (ai) {
      try {
        const cvForPrompt = JSON.parse(JSON.stringify(cv));
        delete cvForPrompt.photo;
        delete cvForPrompt.photoUrl;
        delete cvForPrompt.profilePhoto;
        const prompt = `Tu es un traducteur expert RH et CV multilingue.
Traduis l'int\xE9gralit\xE9 du contenu de ce CV en ${langLabel} (titre du CV, titres de sections, postes, r\xE9sum\xE9s, missions, dipl\xF4mes, comp\xE9tences, langues, centres d'int\xE9r\xEAt, etc.).
Conserve scrupuleusement la structure JSON exacte (m\xEAmes IDs de sections, types de sections, cl\xE9s d'objets, num\xE9ros de t\xE9l\xE9phone et e-mails intacts).
CV source:
${JSON.stringify(cvForPrompt)}`;
        const responseText = await generateGeminiContentWithFallback(ai, prompt);
        const parsedCV = safeJsonParse(responseText, null);
        const rawSections = parsedCV?.sections || parsedCV?.cv?.sections || parsedCV?.translatedCv?.sections;
        if (parsedCV && rawSections) {
          const translatedSections = (cv.sections || []).map((sec) => {
            const match = rawSections.find((s) => s.id === sec.id || s.type === sec.type);
            if (!match) return sec;
            return {
              ...sec,
              ...match,
              id: sec.id,
              type: sec.type,
              contenu: match.contenu || sec.contenu
            };
          });
          const intermediateCv = autoFixCapitalization({
            ...cv,
            ...parsedCV,
            photo: cv.photo,
            photoUrl: cv.photoUrl,
            profilePhoto: cv.profilePhoto,
            sections: translatedSections,
            langue: targetLang,
            titre: parsedCV.titre || `${cv.titre || "CV"} (${targetLang.toUpperCase()})`
          });
          const finalCv = translateCV(intermediateCv, targetLang);
          return res.json({
            translatedCv: finalCv,
            success: true
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini translation error, using local engine:", geminiErr);
      }
    }
    const fallbackCv = translateCV(cv, targetLang);
    return res.json({ translatedCv: autoFixCapitalization(fallbackCv), success: true });
  } catch (err) {
    console.error("handleCVTranslation error:", err);
    const fallbackCv = translateCV(req.body.cv || {}, req.body.targetLang || "en");
    return res.json({ translatedCv: autoFixCapitalization(fallbackCv), success: true });
  }
};
var handleLetterTranslation = async (req, res) => {
  try {
    const { letter, targetLang = "en" } = req.body;
    if (!letter) {
      return res.status(400).json({ error: "Lettre requise pour la traduction." });
    }
    const ai = getGemini();
    const langLabel = targetLang === "ar" ? "Arabe" : targetLang === "en" ? "Anglais" : "Fran\xE7ais";
    if (ai) {
      const prompt = `Tu es un traducteur expert RH. Traduis cette lettre de motivation en ${langLabel}.
Champs \xE0 traduire : objet, formulePolitesseEntree, paragrapheAccroche, paragrapheValeurAjoutee, paragrapheAdequationEntreprise, paragrapheConclusion, formulePolitesseSortie, destinataire.
Lettre source :
${JSON.stringify(letter)}`;
      const responseText = await generateGeminiContentWithFallback(ai, prompt);
      const parsed = safeJsonParse(responseText, null);
      if (parsed) {
        const translatedLetter = autoFixCapitalization({
          ...letter,
          ...parsed,
          langue: targetLang,
          titre: `${letter.titre || "Lettre"} (${targetLang.toUpperCase()})`,
          texteComplet: `${parsed.formulePolitesseEntree || letter.formulePolitesseEntree}

${parsed.paragrapheAccroche || letter.paragrapheAccroche}

${parsed.paragrapheValeurAjoutee || letter.paragrapheValeurAjoutee}

${parsed.paragrapheAdequationEntreprise || letter.paragrapheAdequationEntreprise}

${parsed.paragrapheConclusion || letter.paragrapheConclusion}

${parsed.formulePolitesseSortie || letter.formulePolitesseSortie}

${letter.signature || letter.expediteur?.nomComplet || ""}`
        });
        return res.json({ translatedLetter, success: true });
      }
    }
    const fallbackLetter = {
      ...letter,
      langue: targetLang,
      titre: `${letter.titre || "Lettre"} (${targetLang.toUpperCase()})`
    };
    return res.json({ translatedLetter: autoFixCapitalization(fallbackLetter), success: true });
  } catch (err) {
    console.error("handleLetterTranslation error:", err);
    return res.json({ translatedLetter: req.body.letter, success: true });
  }
};
app.post("/api/ai/translate-cv", optionalAuthenticateToken, handleCVTranslation);
app.post("/api/ai/traduction-cv", optionalAuthenticateToken, handleCVTranslation);
app.post("/api/ai/translate-lettre", optionalAuthenticateToken, checkSubscriptionGate("classique"), handleLetterTranslation);
app.post("/api/ai/traduction-lettre", optionalAuthenticateToken, checkSubscriptionGate("classique"), handleLetterTranslation);
app.post("/api/ai/suggest-field", optionalAuthenticateToken, checkSubscriptionGate("premium"), async (req, res) => {
  try {
    const { fieldName, currentValue = "", context = "", fullCvContext = "", cv, langue = "fr" } = req.body;
    const ai = getGemini();
    const targetLang = langue === "en" ? "Anglais" : langue === "ar" ? "Arabe" : "Fran\xE7ais";
    if (!ai) {
      return res.json({
        suggestion: currentValue ? `${currentValue} - Optimis\xE9 avec des mots-cl\xE9s d'impact et de pr\xE9cision.` : `Sp\xE9cialiste qualifi\xE9 avec une solide exp\xE9rience terrain et sens des r\xE9sultats.`
      });
    }
    const detailedContext = fullCvContext || context || (cv ? JSON.stringify(cv).slice(0, 3e3) : "");
    const prompt = `Tu es un expert mondial en recrutement, r\xE9daction et optimisation de CV.
G\xE9n\xE8re une am\xE9lioration ou suggestion professionnelle directe, percutante et concise en ${targetLang} pour le champ de CV : "${fieldName}".

=== CONTEXTE D\xC9TAILL\xC9 DU CV ET DOMAINE DU CANDIDAT ===
${detailedContext || "Non pr\xE9cis\xE9"}

Valeur actuelle du champ (si d\xE9j\xE0 renseign\xE9e) : "${currentValue}".

R\xC8GLES ABSOLUES ET IMP\xC9RATIVES :
1. RESPECT RIGOUREUX DU DOMAINE DE L'UTILISATEUR : Analyse le titre professionnel, les comp\xE9tences et les exp\xE9riences fournies dans le contexte ci-dessus.
   - Si le candidat est D\xE9veloppeur Informatique / Software Engineer, toute suggestion (intitul\xE9, comp\xE9tence, r\xE9sum\xE9, description) DOIT \xEAtre STRICTEMENT li\xE9e au secteur Informatique / Technologie.
   - Ne propose JAMAIS des termes d'un autre secteur sans rapport (comme comptabilit\xE9, finance, sant\xE9, vente ou secr\xE9tariat).
2. Fournis une suggestion directe pr\xEAte \xE0 \xEAtre directement ins\xE9r\xE9e dans le champ (pas de guillemets autour, pas d'explications inutiles).
3. La suggestion doit \xEAtre d'un niveau professionnel \xE9lev\xE9, orient\xE9e r\xE9sultats et mots-cl\xE9s du secteur d'activit\xE9 du candidat.
4. R\xE9ponds au format JSON strict : { "suggestion": "..." }`;
    const responseText = await generateGeminiContentWithFallback(ai, prompt);
    const parsed = safeJsonParse(responseText, {});
    const suggestion = parsed?.suggestion || (currentValue ? `${currentValue} (Optimis\xE9)` : `Professionnel qualifi\xE9 et orient\xE9 r\xE9sultats`);
    return res.json({ suggestion });
  } catch (err) {
    return res.status(500).json({ error: "Erreur lors de la g\xE9n\xE9ration de la suggestion IA." });
  }
});
async function initializeAdminAccountIfNeeded() {
  const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || "").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (adminEmail && adminPassword) {
    try {
      const existingUser = await dbAdapter.findUserByEmail(adminEmail);
      if (!existingUser) {
        const hash = import_bcryptjs2.default.hashSync(adminPassword, 12);
        await dbAdapter.createUser({
          id: `u-admin-${Date.now()}`,
          nom: "Administrateur Principal",
          email: adminEmail,
          motDePasseHash: hash,
          role: "ADMIN",
          subscriptionTier: "premium",
          langue: "fr"
        });
        console.log(`[SECURITY INIT] Compte administrateur initialis\xE9 pour ${adminEmail}`);
      }
    } catch (err) {
      console.error("[SECURITY INIT ERROR]", err);
    }
  }
}
async function startServer() {
  loadDB();
  try {
    await dbAdapter.syncAllSqliteUsersToPostgres();
  } catch (err) {
    console.warn("Initial sync SQLite users to PostgreSQL notice:", err);
  }
  await initializeAdminAccountIfNeeded();
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `Route API introuvable: ${req.method} ${req.path}` });
  });
  app.use((err, req, res, next) => {
    if (req.path?.startsWith("/api/")) {
      console.error("[API ERROR]", err);
      return res.status(500).json({ error: err?.message || "Erreur interne du serveur" });
    }
    next(err);
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: { ignored: ["**/data/db.json", "**/dist/**", "**/.git/**"] }
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CV Builder server running securely on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
