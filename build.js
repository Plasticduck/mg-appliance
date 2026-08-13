/**
 * Build script — reads JSON content files and generates index.html
 * Run: node build.js
 * Netlify runs this automatically on every content edit via Decap CMS.
 */

const fs = require('fs');
const path = require('path');

// Load all content JSON
const load = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, 'content', name), 'utf8'));

const settings = load('settings.json');
const hero = load('hero.json');
const about = load('about.json');
const gallery = load('gallery.json');
const testimonials = load('testimonials.json');
const financing = load('financing.json');
const locations = load('locations.json');
const cta = load('cta.json');

// Helpers
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const stars = (n) => '&#9733;'.repeat(n);
const nl2br = (s) => esc(s).replace(/\n/g, '<br>');

// Gallery items — first one spans 2 columns
const galleryItems = gallery.images.map((img, i) => {
  const delay = ['reveal-d1','reveal-d2','reveal-d3'][i % 3];
  return `      <div class="gallery-item reveal ${delay}" onclick="openLightbox(${i})">
        <img src="${esc(img.image)}" alt="${esc(img.alt)}">
      </div>`;
}).join('\n');

// Testimonial cards
const reviewCards = testimonials.reviews.map((r, i) => {
  const delay = ['reveal-d1','reveal-d2','reveal-d3'][i % 3];
  return `      <div class="test-card reveal ${delay}">
        <div class="test-stars">${stars(r.stars)}</div>
        <p class="test-quote">"${esc(r.quote)}"</p>
        <div class="test-name">${esc(r.name)}</div>
        <div class="test-detail">${esc(r.source)}</div>
      </div>`;
}).join('\n');

// Financing options
const financingCards = financing.options.map((opt, i) => {
  const delay = ['reveal-d1','reveal-d2','reveal-d3'][i % 3];
  const logoH = opt.logo_height || 56;
  const logo = opt.logo ? `\n        <div class="finance-logo-wrap"><img class="finance-logo" src="${esc(opt.logo)}" alt="${esc(opt.name)}" style="height:${logoH}px"></div>` : '';
  return `      <a href="${esc(opt.url)}" class="finance-card reveal ${delay}" target="_blank" rel="noopener">${logo}
        <span class="finance-name">${esc(opt.name)}</span>
        <span class="finance-cta">Apply Now &#8594;</span>
      </a>`;
}).join('\n');

// Location cards for contact section
const locationCards = locations.locations.map((loc, i) => {
  const delay = i === 0 ? 'reveal-d1' : 'reveal-d2';
  const disclaimer = loc.disclaimer ? `\n            <p class="location-disclaimer">${esc(loc.disclaimer)}</p>` : '';
  return `        <div class="location-card reveal ${delay}">
          <h3 class="location-name">${esc(loc.name)}</h3>${disclaimer}
          <div class="contact-row">
            <h4>Address</h4>
            <p>${esc(loc.address)}</p>
          </div>
          <div class="contact-row">
            <h4>Phone</h4>
            <p><a href="tel:${esc(loc.phone_raw)}">${esc(loc.phone)}</a></p>
          </div>
          <div class="contact-row">
            <h4>Hours</h4>
            <p>${nl2br(loc.hours)}</p>
          </div>
        </div>`;
}).join('\n');

// Location picker modal options
const locationPickerOptions = locations.locations.map(loc =>
  `      <a href="tel:${esc(loc.phone_raw)}" class="picker-option">
        <span class="picker-name">${esc(loc.name)}</span>
        <span class="picker-phone">${esc(loc.phone)}</span>
      </a>`
).join('\n');

// About stats
const statsHTML = about.stats.map(s =>
  `          <div>
            <div class="stat-num">${esc(s.value)}</div>
            <div class="stat-label">${esc(s.label)}</div>
          </div>`
).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(settings.business_name)} — Appliance Sales & Repair</title>
<meta name="description" content="${esc(settings.business_name)} — family-owned appliance retailer and repair service. Huge selection of refrigerators, stoves, washers, dryers and more at great prices. Call ${esc(settings.phone)}.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
<style>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --blue: #1a5096;
  --blue-dark: #133b6f;
  --yellow: #f0b932;
  --yellow-hover: #d9a529;
  --white: #ffffff;
  --bg: #f5f7fa;
  --dark: #1a1a1a;
  --text: #444;
  --text-light: #666;
  --border: #e0e4ea;
}

html { scroll-behavior: smooth; }

body {
  font-family: 'DM Sans', sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

/* ========== NAV ========== */
.nav-wrap {
  position: absolute; top: 0; left: 0; right: 0; z-index: 100;
}
nav {
  max-width: 1400px; margin: 0 auto;
  padding: 28px 56px;
  display: flex; justify-content: space-between; align-items: center;
}
.nav-logo {
  background: var(--white);
  border-radius: 10px;
  padding: 8px 16px;
  display: inline-block;
  line-height: 0;
}
.nav-logo img {
  height: 90px; width: auto; display: block;
}
.nav-links { display: flex; gap: 36px; list-style: none; align-items: center; }
.nav-links a {
  text-decoration: none; color: rgba(255,255,255,0.9);
  font-size: 1rem; font-weight: 500; letter-spacing: 0.03em;
  transition: color 0.25s;
}
.nav-links a:hover { color: var(--white); }
.nav-cta {
  background: var(--yellow); color: var(--dark) !important;
  padding: 14px 32px; border-radius: 6px;
  font-size: 1rem; font-weight: 600; transition: background 0.25s;
}
.nav-cta:hover { background: var(--yellow-hover); }

/* Mobile menu */
.mobile-toggle {
  display: none; background: none; border: none; cursor: pointer;
  flex-direction: column; gap: 5px; padding: 4px;
}
.mobile-toggle span {
  display: block; width: 24px; height: 2px; background: var(--white);
  border-radius: 2px; transition: all 0.3s;
}

/* ========== HERO ========== */
.hero {
  background: var(--blue);
  overflow: hidden;
  padding: 0;
  min-height: 100vh;
  display: flex; align-items: center;
}
.hero-inner {
  max-width: 1400px; margin: 0 auto; width: 100%;
  display: grid; grid-template-columns: 1fr 1fr;
  align-items: center; gap: 56px;
  padding: 160px 56px 80px;
}
.hero-content {
  color: var(--white);
  opacity: 0; transform: translateY(20px);
  animation: fadeUp 0.7s ease-out 0.2s forwards;
}
.hero-img {
  border-radius: 12px; overflow: hidden;
}
.hero-img img {
  width: 100%; height: auto; display: block;
}
.hero h1 {
  font-size: clamp(2.8rem, 5vw, 4.2rem);
  font-weight: 700; line-height: 1.1;
  letter-spacing: -0.02em; color: var(--white);
  margin-bottom: 24px;
}
.hero h1 span { color: var(--yellow); display: block; }
.hero p {
  font-size: 1.2rem; color: rgba(255,255,255,0.85);
  margin-bottom: 40px; font-weight: 400; max-width: 520px;
  line-height: 1.65;
}
.hero-btns { display: flex; gap: 16px; flex-wrap: wrap; }

.btn {
  display: inline-block; padding: 16px 36px;
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem; font-weight: 600;
  border-radius: 6px; text-decoration: none;
  transition: all 0.25s; cursor: pointer; border: none;
}
.btn-yellow { background: var(--yellow); color: var(--dark); }
.btn-yellow:hover { background: var(--yellow-hover); }
.btn-outline {
  background: transparent; color: var(--white);
  border: 1.5px solid rgba(255,255,255,0.5);
}
.btn-outline:hover { border-color: var(--white); background: rgba(255,255,255,0.08); }
.btn-blue { background: var(--blue); color: var(--white); }
.btn-blue:hover { background: var(--blue-dark); }

/* ========== SECTIONS ========== */
section { padding: clamp(64px, 8vw, 120px) 24px; }
.container { max-width: 1100px; margin: 0 auto; }

.section-tag {
  font-size: 0.78rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.14em; color: var(--blue); margin-bottom: 12px;
}
.section-title {
  font-size: clamp(1.8rem, 3.2vw, 2.8rem);
  font-weight: 700; color: var(--dark); line-height: 1.15;
  letter-spacing: -0.01em; margin-bottom: 16px;
}
.section-sub {
  font-size: 1rem; color: var(--text-light); max-width: 520px;
}

/* ========== ABOUT ========== */
.about-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
}
.about-img {
  width: 100%; aspect-ratio: 3/4; border-radius: 10px; overflow: hidden;
}
.about-img img { width: 100%; height: 100%; object-fit: cover; }
.about-text .section-sub { margin-bottom: 24px; }
.about-stats {
  display: flex; gap: 48px; margin-top: 32px;
  padding-top: 24px; border-top: 1px solid var(--border);
}
.stat-num { font-size: 2rem; font-weight: 700; color: var(--blue); line-height: 1; }
.stat-label { font-size: 0.82rem; color: var(--text-light); margin-top: 6px; }

/* ========== GALLERY ========== */
.gallery-section { background: var(--white); }
.gallery-header { text-align: center; margin-bottom: 48px; }
.gallery-header .section-sub { margin: 0 auto; }
.gallery-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
.gallery-item {
  border-radius: 10px; overflow: hidden; aspect-ratio: 4/3;
  cursor: pointer; position: relative;
}
.gallery-item img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.4s ease;
}
.gallery-item:hover img { transform: scale(1.04); }
.gallery-item:nth-child(1) { grid-column: span 2; }
.gallery-dots { display: none; }
.gallery-hint { display: none; }

/* Lightbox */
.lightbox {
  display: none; position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.9);
  align-items: center; justify-content: center;
  padding: 24px;
}
.lightbox.active { display: flex; }
.lightbox img {
  max-width: 90%; max-height: 85vh; border-radius: 8px; object-fit: contain;
}
.lightbox-close {
  position: absolute; top: 24px; right: 32px;
  background: none; border: none; color: var(--white);
  font-size: 2rem; cursor: pointer; line-height: 1;
}
.lightbox-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.15); border: none; color: var(--white);
  font-size: 1.5rem; padding: 12px 16px; border-radius: 6px;
  cursor: pointer; transition: background 0.25s;
}
.lightbox-nav:hover { background: rgba(255,255,255,0.25); }
.lightbox-prev { left: 24px; }
.lightbox-next { right: 24px; }

/* ========== TESTIMONIALS ========== */
.testimonials { background: var(--blue); color: var(--white); }
.testimonials .section-tag { color: var(--yellow); }
.testimonials .section-title { color: var(--white); }
.test-header { text-align: center; margin-bottom: 48px; }
.test-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;
}
.test-card {
  padding: 32px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
  transition: border-color 0.3s;
}
.test-card:hover { border-color: rgba(255,255,255,0.25); }
.test-stars { color: var(--yellow); font-size: 0.85rem; letter-spacing: 2px; margin-bottom: 16px; }
.test-quote {
  font-size: 1rem; line-height: 1.65;
  color: rgba(255,255,255,0.85); margin-bottom: 20px; font-style: italic;
}
.test-name { font-weight: 600; font-size: 0.9rem; color: var(--white); }
.test-detail { font-size: 0.8rem; color: rgba(255,255,255,0.45); margin-top: 2px; }

/* ========== FINANCING ========== */
.financing-section { background: var(--bg); }
.financing-header { text-align: center; margin-bottom: 48px; }
.financing-header .section-sub { margin: 0 auto; }
.finance-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
}
.finance-card {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 32px 24px;
  background: var(--white);
  border: 1px solid var(--border); border-radius: 10px;
  text-decoration: none; transition: border-color 0.3s, box-shadow 0.3s;
}
.finance-card:hover {
  border-color: var(--blue); box-shadow: 0 4px 16px rgba(26,80,150,0.1);
}
.finance-logo-wrap {
  height: 170px; display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
}
.finance-logo {
  width: auto; max-width: 280px;
  object-fit: contain;
}
.finance-name {
  font-size: 0.95rem; font-weight: 600; color: var(--dark); margin-bottom: 16px;
}
.finance-cta {
  font-size: 0.88rem; font-weight: 600; color: var(--blue);
  margin-top: auto;
}

/* ========== CTA BANNER ========== */
.cta-banner {
  background: var(--blue-dark);
  padding: clamp(80px, 10vw, 120px) 24px;
  text-align: center;
}
.cta-content { color: var(--white); }
.cta-content h2 {
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 700; color: var(--white); margin-bottom: 16px; line-height: 1.15;
}
.cta-content p { color: rgba(255,255,255,0.8); margin-bottom: 28px; font-size: 1.05rem; }

/* ========== CAREERS ========== */
.careers-section { background: var(--white); }
.careers-inner {
  display: grid; grid-template-columns: 1.15fr 1fr; gap: 48px; align-items: center;
  background: var(--bg); border: 1px solid var(--border); border-radius: 12px;
  padding: 44px;
}
.careers-text .section-sub { margin-bottom: 24px; }
.careers-points { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.careers-points li {
  font-size: 0.92rem; color: var(--text);
  padding-left: 26px; position: relative;
}
.careers-points li::before {
  content: "\\2713"; position: absolute; left: 0; top: -1px;
  color: var(--blue); font-weight: 700;
}
.careers-cta { text-align: center; }
.careers-cta h3 {
  font-size: 1.1rem; font-weight: 700; color: var(--dark); margin-bottom: 6px;
}
.careers-cta p { font-size: 0.88rem; color: var(--text-light); margin-bottom: 20px; }
.careers-cta .btn { width: 100%; }
.careers-note { font-size: 0.8rem; color: var(--text-light); margin-top: 14px; }

/* ========== CONTACT ========== */
.contact-section { background: var(--white); }
.locations-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;
  margin-bottom: 12px;
}
.location-card {
  padding: 32px; background: var(--bg);
  border: 1px solid var(--border); border-radius: 10px;
}
.location-name {
  font-size: 1.15rem; font-weight: 700; color: var(--dark);
  margin-bottom: 20px; padding-bottom: 16px;
  border-bottom: 2px solid var(--yellow);
}
.location-disclaimer {
  background: #fff3cd; color: #856404; padding: 10px 14px;
  border-radius: 6px; font-size: 0.85rem; font-weight: 500;
  margin-bottom: 16px; line-height: 1.5;
}

/* Location picker modal */
.location-picker {
  display: none; position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.6);
  align-items: center; justify-content: center; padding: 24px;
}
.location-picker.active { display: flex; }
.picker-box {
  background: var(--white); border-radius: 12px; padding: 36px;
  max-width: 400px; width: 100%; position: relative; text-align: center;
}
.picker-box h3 {
  font-size: 1.15rem; font-weight: 700; color: var(--dark); margin-bottom: 24px;
}
.picker-close {
  position: absolute; top: 12px; right: 16px;
  background: none; border: none; font-size: 1.5rem;
  color: var(--text-light); cursor: pointer; line-height: 1;
}
.picker-option {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; margin-bottom: 12px;
  background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
  text-decoration: none; transition: border-color 0.25s;
}
.picker-option:hover { border-color: var(--blue); }
.picker-option:last-child { margin-bottom: 0; }
.picker-name { font-weight: 600; color: var(--dark); font-size: 1rem; }
.picker-phone { color: var(--blue); font-weight: 600; font-size: 0.95rem; }
.contact-row { margin-bottom: 24px; }
.contact-row h4 { font-size: 0.95rem; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
.contact-row p { font-size: 0.9rem; color: var(--text-light); }
.contact-row a { color: var(--blue); text-decoration: none; }
.contact-row a:hover { text-decoration: underline; }

.contact-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label {
  font-size: 0.82rem; font-weight: 600; color: var(--dark);
  letter-spacing: 0.02em;
}
.form-group input,
.form-group textarea,
.form-group select {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.92rem; padding: 12px 16px;
  border: 1px solid var(--border); border-radius: 6px;
  background: var(--bg); color: var(--dark);
  transition: border-color 0.25s;
  width: 100%;
}
.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none; border-color: var(--blue);
}
.form-group textarea { resize: vertical; min-height: 120px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-submit {
  font-family: 'DM Sans', sans-serif;
  padding: 14px 32px; background: var(--yellow); color: var(--dark);
  border: none; border-radius: 6px; font-size: 0.9rem;
  font-weight: 600; cursor: pointer; transition: background 0.25s;
  align-self: flex-start;
}
.form-submit:hover { background: var(--yellow-hover); }
.form-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.form-success, .form-error {
  display: none; padding: 16px; border-radius: 6px;
  font-size: 0.9rem; font-weight: 500;
}
.form-success { background: #e8f5e9; color: #2e7d32; }
.form-error { background: #fbe9e7; color: #c62828; }

/* ========== FOOTER ========== */
footer {
  background: var(--dark); color: rgba(255,255,255,0.5);
  padding: 64px 24px 32px;
}
.footer-inner { max-width: 1100px; margin: 0 auto; }
.footer-grid {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px;
  padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.08);
}
.footer-brand {
  display: flex; flex-direction: column; gap: 12px;
}
.footer-logo {
  background: var(--white); border-radius: 6px;
  padding: 6px 10px; display: inline-block;
  align-self: flex-start; line-height: 0;
}
.footer-logo img { height: 56px; width: auto; display: block; }
.footer-brand p { font-size: 0.85rem; line-height: 1.6; max-width: 260px; }
.footer-col h4 {
  font-size: 0.78rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.1em; color: rgba(255,255,255,0.3); margin-bottom: 16px;
}
.footer-col a {
  display: block; color: rgba(255,255,255,0.55);
  text-decoration: none; font-size: 0.88rem;
  margin-bottom: 10px; transition: color 0.25s;
}
.footer-col a:hover { color: var(--white); }
.footer-bottom {
  padding-top: 24px; font-size: 0.8rem;
  display: flex; justify-content: space-between;
}

/* ========== SCROLL REVEAL ========== */
.reveal {
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.reveal.visible { opacity: 1; transform: translateY(0); }
.reveal-d1 { transition-delay: 80ms; }
.reveal-d2 { transition-delay: 160ms; }
.reveal-d3 { transition-delay: 240ms; }

@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

/* ========== RESPONSIVE ========== */
@media (max-width: 900px) {
  .nav-links { display: none; }
  .nav-links.open {
    display: flex; flex-direction: column;
    position: absolute; top: 100%; left: 0; right: 0;
    background: var(--blue-dark); padding: 24px;
    gap: 16px; align-items: flex-start;
  }
  .mobile-toggle { display: flex; }
  nav { padding: 20px 24px; }
  .hero-inner { grid-template-columns: 1fr; padding: 120px 24px 48px; gap: 32px; }
  .hero h1 span { display: inline; }
  .hero h1 { font-size: clamp(2rem, 8vw, 2.8rem); }
  .hero-content { text-align: left; }
  .hero-btns { justify-content: flex-start; }
  .about-grid, .contact-grid, .locations-grid { grid-template-columns: 1fr; gap: 36px; }
  .careers-inner { grid-template-columns: 1fr; gap: 32px; padding: 32px 24px; }
  .gallery-grid { grid-template-columns: 1fr 1fr; }
  .finance-grid { grid-template-columns: 1fr; }
  .gallery-item:nth-child(1) { grid-column: span 2; }
  .nav-logo img { height: 56px; }
  .test-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
  .form-row { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .gallery-grid {
    display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
    gap: 12px; padding-bottom: 20px;
    -webkit-overflow-scrolling: touch;
    padding-left: 24px; padding-right: 24px;
  }
  .gallery-item {
    flex: 0 0 72vw; scroll-snap-align: start;
    aspect-ratio: 4/3;
  }
  .gallery-item:nth-child(1) { grid-column: unset; }
  .gallery-dots { display: flex; justify-content: center; gap: 8px; margin-top: 16px; }
  .gallery-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--border); transition: background 0.3s;
  }
  .gallery-dot.active { background: var(--blue); }
  .gallery-hint {
    display: block; text-align: center; margin-top: 8px;
    font-size: 0.78rem; color: var(--text-light); letter-spacing: 0.03em;
  }
  .footer-grid { grid-template-columns: 1fr; }
  .footer-bottom { flex-direction: column; gap: 8px; }
  .about-stats { flex-direction: column; gap: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .reveal, .hero-content { opacity: 1; transform: none; animation: none; transition: none; }
}
</style>
</head>
<body>

<!-- NAV -->
<div class="nav-wrap">
  <nav>
    <a href="#" class="nav-logo">
      <img src="mglogo.png" alt="${esc(settings.business_name)}">
    </a>
    <ul class="nav-links" id="navLinks">
      <li><a href="#about">About</a></li>
      <li><a href="#gallery">Gallery</a></li>
      <li><a href="#reviews">Reviews</a></li>
      <li><a href="#contact">Contact</a></li>
      <li><a href="apply.html">Careers</a></li>
      <li><a href="#" class="nav-cta" onclick="openLocationPicker(event)">Call Now</a></li>
    </ul>
    <button class="mobile-toggle" id="mobileToggle" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </nav>
</div>

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-content">
      <h1>${esc(hero.headline)} <span>${esc(hero.headline_highlight)}</span></h1>
      <p>${esc(hero.description)}</p>
      <div class="hero-btns">
        <a href="${esc(hero.cta1_link)}" class="btn btn-yellow">${esc(hero.cta1_text)}</a>
        <a href="${esc(hero.cta2_link)}" class="btn btn-outline">${esc(hero.cta2_text)}</a>
      </div>
    </div>
    <div class="hero-img">
      <img src="${esc(hero.image)}" alt="${esc(hero.image_alt)}">
    </div>
  </div>
</section>

<!-- ABOUT -->
<section id="about">
  <div class="container">
    <div class="about-grid">
      <div class="about-img reveal">
        <img src="${esc(about.image)}" alt="${esc(about.image_alt)}">
      </div>
      <div class="about-text">
        <div class="section-tag reveal">${esc(about.tag)}</div>
        <h2 class="section-title reveal">${esc(about.title)}</h2>
        <p class="section-sub reveal">${esc(about.description)}</p>
        <div class="about-stats reveal">
${statsHTML}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- GALLERY -->
<section class="gallery-section" id="gallery">
  <div class="container">
    <div class="gallery-header">
      <div class="section-tag reveal">${esc(gallery.tag)}</div>
      <h2 class="section-title reveal">${esc(gallery.title)}</h2>
      <p class="section-sub reveal">${esc(gallery.description)}</p>
    </div>
    <div class="gallery-grid" id="galleryGrid">
${galleryItems}
    </div>
    <div class="gallery-dots" id="galleryDots"></div>
    <p class="gallery-hint">Swipe to see more &#8594;</p>
  </div>
</section>

<!-- LIGHTBOX -->
<div class="lightbox" id="lightbox">
  <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
  <button class="lightbox-nav lightbox-prev" onclick="navLightbox(-1)">&#8249;</button>
  <img id="lightboxImg" src="" alt="Gallery image">
  <button class="lightbox-nav lightbox-next" onclick="navLightbox(1)">&#8250;</button>
</div>

<!-- FINANCING -->
<section class="financing-section" id="financing">
  <div class="container">
    <div class="financing-header">
      <div class="section-tag reveal">${esc(financing.tag)}</div>
      <h2 class="section-title reveal">${esc(financing.title)}</h2>
      <p class="section-sub reveal">${esc(financing.description)}</p>
    </div>
    <div class="finance-grid">
${financingCards}
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section class="testimonials" id="reviews">
  <div class="container">
    <div class="test-header">
      <div class="section-tag reveal">${esc(testimonials.tag)}</div>
      <h2 class="section-title reveal">${esc(testimonials.title)}</h2>
      <a href="${esc(settings.google_review_url)}" class="btn btn-yellow" style="margin-top:16px;" target="_blank" rel="noopener">Review Us on Google</a>
    </div>
    <div class="test-grid">
${reviewCards}
    </div>
  </div>
</section>

<!-- CTA BANNER -->
<section class="cta-banner">
  <div class="cta-content reveal">
    <h2>${esc(cta.title)}</h2>
    <p>${esc(cta.description)}</p>
    <a href="#" class="btn btn-yellow" onclick="openLocationPicker(event)">${esc(cta.button_text)}</a>
  </div>
</section>

<!-- CAREERS -->
<section class="careers-section" id="careers">
  <div class="container">
    <div class="careers-inner reveal">
      <div class="careers-text">
        <div class="section-tag">Join Our Team</div>
        <h2 class="section-title">Now hiring at both locations.</h2>
        <p class="section-sub">We're a family-owned business that treats our team like family. If you take pride in honest work and great customer service, we'd like to hear from you.</p>
        <ul class="careers-points">
          <li>Sales, service, delivery &amp; repair positions</li>
          <li>Fort Worth and Wichita Falls locations</li>
          <li>Full-time and part-time opportunities</li>
        </ul>
      </div>
      <div class="careers-cta">
        <h3>Apply online</h3>
        <p>Complete our employment application in a few minutes.</p>
        <a href="apply.html" class="btn btn-blue">Start Your Application</a>
        <p class="careers-note">MG Appliance is an equal opportunity employer.</p>
      </div>
    </div>
  </div>
</section>

<!-- CONTACT -->
<section class="contact-section" id="contact">
  <div class="container">
    <div class="contact-header" style="text-align:center; margin-bottom:48px;">
      <div class="section-tag reveal">Contact Us</div>
      <h2 class="section-title reveal">Let's talk appliances.</h2>
      <p class="section-sub reveal" style="margin:0 auto;">Have a question about pricing, availability, or need to schedule a repair? Reach out — we're happy to help.</p>
    </div>
    <div class="locations-grid reveal">
${locationCards}
    </div>
    <div class="contact-row reveal" style="text-align:center; margin-top:24px;">
      <h4>Follow Us</h4>
      <p><a href="${esc(settings.facebook_url)}" target="_blank" rel="noopener">Facebook</a></p>
    </div>
    <div class="contact-form-wrap reveal" style="max-width:600px; margin:48px auto 0;">
      <h3 style="font-size:1.2rem; font-weight:700; color:var(--dark); margin-bottom:20px; text-align:center;">Send us a message</h3>
      <form class="contact-form" id="contactForm" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" onsubmit="handleSubmit(event)">
        <input type="hidden" name="form-name" value="contact">
        <input type="hidden" name="bot-field" style="display:none">
        <div class="form-row">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required placeholder="Your name">
          </div>
          <div class="form-group">
            <label for="phone">Phone</label>
            <input type="tel" id="phone" name="phone" placeholder="Your phone number">
          </div>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required placeholder="you@example.com">
        </div>
        <div class="form-group">
          <label for="location">Location</label>
          <select id="location" name="location">
            <option value="">Select a location</option>
            <option value="fort-worth">Fort Worth</option>
            <option value="wichita-falls">Wichita Falls</option>
          </select>
        </div>
        <div class="form-group">
          <label for="interest">I'm interested in...</label>
          <select id="interest" name="interest">
            <option value="">Select an option</option>
            <option value="refrigerator">Refrigerators</option>
            <option value="washer-dryer">Washers & Dryers</option>
            <option value="range-oven">Ranges, Stoves & Ovens</option>
            <option value="dishwasher">Dishwashers</option>
            <option value="repair">Appliance Repair</option>
            <option value="other">Other / General Question</option>
          </select>
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="5" required placeholder="Tell us what you're looking for..."></textarea>
        </div>
        <button type="submit" class="form-submit" id="formBtn">Send Message</button>
        <div class="form-success" id="formSuccess">Thanks! Your message has been sent. We'll get back to you soon.</div>
        <div class="form-error" id="formError">Something went wrong. Please call us directly instead.</div>
      </form>
    </div>
  </div>
</section>

<!-- LOCATION PICKER -->
<div class="location-picker" id="locationPicker">
  <div class="picker-box">
    <button class="picker-close" onclick="closeLocationPicker()">&times;</button>
    <h3>Which location are you calling?</h3>
${locationPickerOptions}
  </div>
</div>

<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo">
          <img src="mglogo.png" alt="${esc(settings.business_name)}">
        </div>
        <p>${esc(settings.footer_tagline)}</p>
      </div>
      <div class="footer-col">
        <h4>Quick Links</h4>
        <a href="#about">About Us</a>
        <a href="#gallery">Gallery</a>
        <a href="#reviews">Reviews</a>
        <a href="#contact">Contact</a>
        <a href="apply.html">Careers &amp; Job Application</a>
      </div>
      <div class="footer-col">
        <h4>Products & Services</h4>
        <a href="#gallery">Refrigerators</a>
        <a href="#gallery">Washers & Dryers</a>
        <a href="#gallery">Stoves, Ranges & Ovens</a>
        <a href="#contact">Appliance Repair</a>
      </div>
      <div class="footer-col">
        <h4>Locations</h4>
        <a href="tel:${esc(locations.locations[0].phone_raw)}">Fort Worth: ${esc(locations.locations[0].phone)}</a>
        <a href="tel:${esc(locations.locations[1].phone_raw)}">Wichita Falls: ${esc(locations.locations[1].phone)}</a>
        <a href="${esc(settings.facebook_url)}" target="_blank" rel="noopener">Facebook</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${esc(settings.business_name)}. All rights reserved.</span>
      <span>Family-Owned & Operated</span>
    </div>
  </div>
</footer>

<script>
// Location picker
function openLocationPicker(e) {
  e.preventDefault();
  document.getElementById('locationPicker').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLocationPicker() {
  document.getElementById('locationPicker').classList.remove('active');
  document.body.style.overflow = '';
}
document.getElementById('locationPicker').addEventListener('click', function(e) {
  if (e.target === this) closeLocationPicker();
});

// Mobile menu toggle
document.getElementById('mobileToggle').addEventListener('click', function() {
  document.getElementById('navLinks').classList.toggle('open');
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Contact form (Netlify Forms, fetch-based, no redirect)
function handleSubmit(e) {
  e.preventDefault();
  var form = document.getElementById('contactForm');
  var btn = document.getElementById('formBtn');
  var success = document.getElementById('formSuccess');
  var error = document.getElementById('formError');
  success.style.display = 'none';
  error.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Sending...';
  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(new FormData(form)).toString()
  }).then(function(res) {
    if (res.ok) {
      success.style.display = 'block';
      form.reset();
    } else {
      error.style.display = 'block';
    }
  }).catch(function() {
    error.style.display = 'block';
  }).finally(function() {
    btn.disabled = false;
    btn.textContent = 'Send Message';
  });
}

// Gallery lightbox
const galleryImages = Array.from(document.querySelectorAll('.gallery-item img')).map(img => img.src);
let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  document.getElementById('lightboxImg').src = galleryImages[currentIndex];
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}
function navLightbox(dir) {
  currentIndex = (currentIndex + dir + galleryImages.length) % galleryImages.length;
  document.getElementById('lightboxImg').src = galleryImages[currentIndex];
}
document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target === this) closeLightbox();
});
document.addEventListener('keydown', function(e) {
  if (!document.getElementById('lightbox').classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navLightbox(-1);
  if (e.key === 'ArrowRight') navLightbox(1);
});

// Gallery scroll dots
(function() {
  var grid = document.getElementById('galleryGrid');
  var dotsWrap = document.getElementById('galleryDots');
  var items = grid.querySelectorAll('.gallery-item');
  if (window.innerWidth > 600 || items.length === 0) return;
  items.forEach(function(_, i) {
    var dot = document.createElement('span');
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    dotsWrap.appendChild(dot);
  });
  var dots = dotsWrap.querySelectorAll('.gallery-dot');
  grid.addEventListener('scroll', function() {
    var scrollLeft = grid.scrollLeft;
    var itemWidth = items[0].offsetWidth + 12;
    var idx = Math.round(scrollLeft / itemWidth);
    dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
  });
})();

// Netlify Identity redirect after login
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", function(user) {
    if (!user) {
      window.netlifyIdentity.on("login", function() {
        document.location.href = "/admin/";
      });
    }
  });
}
</script>

</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('✓ index.html built from content files');
