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
.hero h1 span { color: var(--yellow); }
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

/* ========== CONTACT ========== */
.contact-section { background: var(--white); }
.contact-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start;
}
.contact-info .section-sub { margin-bottom: 36px; }
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
  .hero-content { text-align: center; }
  .hero-btns { justify-content: center; }
  .about-grid, .contact-grid { grid-template-columns: 1fr; gap: 36px; }
  .gallery-grid { grid-template-columns: 1fr 1fr; }
  .gallery-item:nth-child(1) { grid-column: span 2; }
  .nav-logo img { height: 56px; }
  .test-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
  .form-row { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .gallery-grid {
    display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
    gap: 12px; padding-bottom: 12px;
    -webkit-overflow-scrolling: touch;
  }
  .gallery-item {
    flex: 0 0 80vw; scroll-snap-align: start;
    aspect-ratio: 4/3;
  }
  .gallery-item:nth-child(1) { grid-column: unset; }
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
      <li><a href="tel:${esc(settings.phone_raw)}" class="nav-cta">Call Now</a></li>
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
      <h1>${esc(hero.headline)}<br><span>${esc(hero.headline_highlight)}</span></h1>
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
    <div class="gallery-grid">
${galleryItems}
    </div>
  </div>
</section>

<!-- LIGHTBOX -->
<div class="lightbox" id="lightbox">
  <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
  <button class="lightbox-nav lightbox-prev" onclick="navLightbox(-1)">&#8249;</button>
  <img id="lightboxImg" src="" alt="Gallery image">
  <button class="lightbox-nav lightbox-next" onclick="navLightbox(1)">&#8250;</button>
</div>

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
    <a href="${esc(cta.button_link)}" class="btn btn-yellow">${esc(cta.button_text)}</a>
  </div>
</section>

<!-- CONTACT -->
<section class="contact-section" id="contact">
  <div class="container">
    <div class="contact-grid">
      <div class="contact-info">
        <div class="section-tag reveal">Contact Us</div>
        <h2 class="section-title reveal">Let's talk appliances.</h2>
        <p class="section-sub reveal">Have a question about pricing, availability, or need to schedule a repair? Reach out — we're happy to help.</p>
        <div class="reveal">
          <div class="contact-row">
            <h4>Address</h4>
            <p>${esc(settings.address)}</p>
          </div>
          <div class="contact-row">
            <h4>Phone</h4>
            <p><a href="tel:${esc(settings.phone_raw)}">${esc(settings.phone)}</a></p>
          </div>
          <div class="contact-row">
            <h4>Hours</h4>
            <p>${nl2br(settings.hours)}</p>
          </div>
          <div class="contact-row">
            <h4>Follow Us</h4>
            <p><a href="${esc(settings.facebook_url)}" target="_blank" rel="noopener">Facebook</a></p>
          </div>
        </div>
      </div>
      <div class="reveal">
        <form class="contact-form" id="contactForm" action="https://formsubmit.co/${esc(settings.email)}" method="POST" onsubmit="handleSubmit(event)">
          <input type="hidden" name="_subject" value="New ${esc(settings.business_name)} Website Inquiry">
          <input type="hidden" name="_next" value="https://mg-appliance.netlify.app/thank-you.html">
          <input type="hidden" name="_captcha" value="false">
          <input type="text" name="_honey" style="display:none">
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
          <div class="form-error" id="formError">Something went wrong. Please call us at ${esc(settings.phone)} instead.</div>
        </form>
      </div>
    </div>
  </div>
</section>

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
      </div>
      <div class="footer-col">
        <h4>Products & Services</h4>
        <a href="#gallery">Refrigerators</a>
        <a href="#gallery">Washers & Dryers</a>
        <a href="#gallery">Stoves, Ranges & Ovens</a>
        <a href="#contact">Appliance Repair</a>
      </div>
      <div class="footer-col">
        <h4>Connect</h4>
        <a href="${esc(settings.facebook_url)}" target="_blank" rel="noopener">Facebook</a>
        <a href="tel:${esc(settings.phone_raw)}">${esc(settings.phone)}</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${esc(settings.business_name)}. All rights reserved.</span>
      <span>Family-Owned & Operated</span>
    </div>
  </div>
</footer>

<script>
// Mobile menu toggle
document.getElementById('mobileToggle').addEventListener('click', function() {
  document.getElementById('navLinks').classList.toggle('open');
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Contact form (fetch-based, no redirect)
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
  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
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
