import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default marker icons when bundled with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Layer({ className, style, children }) {
  return (
    <div className={`layer ${className}`} style={style}>
      {children}
    </div>
  );
}

// Per-layer parallax travel in px. Bigger = moves more = feels closer.
const LAYERS = [
  { cls: "sky", label: "Sky", travel: 0 },
  { cls: "misty-mountains", label: "Misty Mountain range", travel: 120 },
  { cls: "tree-tops-back", label: "Tree tops (Back)", travel: 220 },
  { cls: "temple", label: "Temple", travel: 660 },
  { cls: "deity", label: "Deity", travel: 900 },
  { cls: "trees-front", label: "Trees (Front)", travel: 550 },
  { cls: "palm-leafsL", label: "Big Palm Leafs L", travel: 920 },
  { cls: "palm-leafsR", label: "Big Palm Leafs R", travel: 920 },
  { cls: "bushes", label: "Bushes (Foreground)", travel: 1020 },
];

const PARALLAX_RANGE = 1000; // px of scroll consumed by the landing animation
const STALL = 100; // px of scroll where everything is pinned

// ----- Photo collage data (Page 2). Generic naming pattern; hover image
// is the same name suffixed with "-hover".
const COLLAGE_PHOTOS = Array.from({ length: 6 }, (_, i) => ({
  base: `/Guadalahacks_2026/images/page 2/guadalahacks-pics/foto-${i + 1}.png`,
  hover: `/Guadalahacks_2026/images/page 2/guadalahacks-pics/foto-${i + 1}-hover.jpg`,
  alt: `Foto evento ${i + 1}`,
}));

// ----- Event coordinates (Tec de Monterrey, Campus Guadalajara) -----
const EVENT_COORDS = [20.733710570726718, -103.45652004266593];
const GMAPS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Tecnol%C3%B3gico+de+Monterrey+Campus+Guadalajara";
const APPLE_MAPS_URL =
  "https://maps.apple.com/?daddr=Tecnol%C3%B3gico+de+Monterrey+Campus+Guadalajara";

// ----- Countdown target: May 16, 2026 9:00 AM (UTC-6, GDL local time) -----
const EVENT_TARGET = new Date("2026-05-16T09:00:00-06:00").getTime();

// ----- FAQ data -----
const FAQS = [
  {
    q: "¿Qué es Guadalahacks?",
    a: "Únete a cientos de estudiantes de todo México para un fin de semana de construcción, aprendizaje y diversión. Convive y conecta con la comunidad tech de México, desarrolla tu proyecto y pasa un fin de semana inolvidable. Conoce Guadalajara y el Tecnológico de Monterrey, universidad líder en México y Latinoamérica.",
  },
  {
    q: "¿Quiénes son bienvenidxs?",
    a: "Puedes formar parte del evento si eres estudiante o exatec, con menos de un año de haber egresado, de cualquier campus del Tecnológico de Monterrey, no importa tu carrera ni nivel de experiencia o de estudios. Somos un evento inclusivo y diverso, y fomentamos un espacio seguro para todxs.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "La participación no tiene costo alguno. Habrá comida gratis durante todo el evento, así como premios para los mejores proyectos. ¡No te lo puedes perder!",
  },
  {
    q: "¿Qué necesito llevar?",
    a: "Trae tu computadora, cargador, cepillo de dientes, ropa cómoda y muchas ganas de aprender y divertirte.",
  },
  {
    q: "¿Cuántas personas deben conformar un equipo?",
    a: "Los equipos deben estar conformados por un máximo de 4 personas. Se recomiendan equipos de 2 a 4 integrantes, pero está permitido participar individualmente. Todxs lxs integrantes deben registrarse individualmente. Registrarán su equipo durante el evento.",
  },
  {
    q: "¿Qué clase de proyecto debería desarrollar?",
    a: "Los retos serán liberados durante el evento. No está permitido trabajar en proyectos que ya hayan sido desarrollados previamente. Más información próximamente.",
  },
];

// ===== Sub-components ======================================================

function CollagePhoto({ base, hover, alt }) {
  return (
    <div className="collage-item">
      <img className="collage-base" src={base} alt={alt} loading="lazy" />
      <img
        className="collage-hover"
        src={hover}
        loading="lazy"
      />
    </div>
  );
}

function PhotoCollage() {
  return (
    <div className="collage-grid">
      {COLLAGE_PHOTOS.map((p) => (
        <CollagePhoto key={p.base} {...p} />
      ))}
    </div>
  );
}

function ContactSection() {
  return (
    <div className="contact-section">
      <div className="contact-map">
        <MapContainer
          center={EVENT_COORDS}
          zoom={17}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={EVENT_COORDS}>
            <Popup>
              Tecnológico de Monterrey
              <br />
              Campus Guadalajara
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="contact-info">
        <h2 className="contact-title">Contáctanos</h2>
        <p className="contact-row">
          Escríbenos a{" "}
          <a href="mailto:hola@guadalahacks.com">hola@guadalahacks.com</a>
        </p>

        <h3 className="contact-subtitle">Dirección del evento</h3>
        <p>Tecnológico de Monterrey, Campus Guadalajara</p>
        <p>Av. Gral. Ramón Corona 2514</p>
        <p>Colonia Nuevo México, 45201</p>
        <p>Zapopan, Jal., México</p>

        <div className="map-buttons">
          <a
            className="map-btn"
            href={GMAPS_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir en Google Maps"
          >
            <GoogleMapsIcon />
            <span>Google Maps</span>
          </a>
          <a
            className="map-btn"
            href={APPLE_MAPS_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir en Apple Maps"
          >
            <AppleMapsIcon />
            <span>Apple Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, EVENT_TARGET - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const cells = [
    { label: "Días", value: days },
    { label: "Horas", value: hours },
    { label: "Min", value: minutes },
    { label: "Seg", value: seconds },
  ];

  return (
    <div className="countdown-wrap">
      <p className="countdown-eyebrow">Guadalahacks 2026</p>
      <h2 className="countdown-title">16 &amp; 17 de mayo · 9:00 AM</h2>
      <div className="countdown-grid">
        {cells.map((c) => (
          <div className="countdown-cell" key={c.label}>
            <div className="countdown-value">
              {String(c.value).padStart(2, "0")}
            </div>
            <div className="countdown-label">{c.label}</div>
          </div>
        ))}
      </div>
      <a
        className="register-btn"
        href="https://registro.tecoding.com"
        target="_blank"
        rel="noreferrer"
      >
        Regístrate
      </a>
    </div>
  );
}

function FAQItem({ q, a, open, onToggle }) {
  return (
    <div className={`faq-item ${open ? "open" : ""}`}>
      <button
        className="faq-question"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span className="faq-chev" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      <div className="faq-answer-wrap">
        <p className="faq-answer">{a}</p>
      </div>
    </div>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <div className="faq-section">
      <h2 className="section-title">FAQ</h2>
      <div className="faq-list">
        {FAQS.map((f, i) => (
          <FAQItem
            key={f.q}
            q={f.q}
            a={f.a}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          />
        ))}
      </div>
    </div>
  );
}

function SponsorsSection() {
  return (
    <div className="logo-section sponsors">
      <h2 className="section-title">Sponsors</h2>
      <div className="logo-grid">
        <a
          className="logo-card"
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="/Guadalahacks_2026/images/page 4/Sponsors/GitHubLogo.svg"
            alt="GitHub"
          />
          <span className="logo-name">GitHub</span>
        </a>
        <a
          className="logo-card"
          href="https://cursor.com"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="/Guadalahacks_2026/images/page 4/Sponsors/CursorLogo.svg"
            alt="Cursor"
          />
          <span className="logo-name">Cursor</span>
        </a>
      </div>
    </div>
  );
}

function PartnersSection() {
  return (
    <div className="logo-section partners">
      <h2 className="section-title">Partners</h2>
      <div className="logo-grid">
        <div className="logo-card">
          <img
            src="/Guadalahacks_2026/images/page 4/Partners/life.webp"
            alt="LiFE"
          />
        </div>
        <div className="logo-card">
          <img
            src="/Guadalahacks_2026/images/page 4/Partners/eic.webp"
            alt="Tecnológico de Monterrey - EIC"
          />
        </div>
      </div>
    </div>
  );
}

function ConnectSection() {
  return (
    <div className="connect-section">
      <h2 className="section-title">Conecta</h2>
      <ul className="connect-list">
        <li>
          <a
            href="https://instagram.com/guadalahacks"
            target="_blank"
            rel="noreferrer"
          >
            <InstagramIcon />
            <span>Instagram</span>
          </a>
        </li>
        <li>
          <a
            href="https://linkedin.com/company/guadalahacks"
            target="_blank"
            rel="noreferrer"
          >
            <LinkedInIcon />
            <span>LinkedIn</span>
          </a>
        </li>
        <li>
          <a href="mailto:hola@guadalahacks.com">
            <EmailIcon />
            <span>Correo electrónico</span>
          </a>
        </li>
      </ul>
    </div>
  );
}

// ===== Inline SVG icons ===================================================

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden focusable="false">
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5"
        ry="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden focusable="false">
      <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" />
      <path
        d="M7 10v8M7 7v.01M11 18v-5a2.5 2.5 0 015 0v5M11 10v8"
        stroke="#3b343f"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden focusable="false">
      <rect
        x="2.5"
        y="4.5"
        width="19"
        height="15"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 6l9 7 9-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleMapsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden focusable="false">
      <path
        d="M12 2c-4.4 0-8 3.4-8 7.6 0 5.6 8 12.4 8 12.4s8-6.8 8-12.4C20 5.4 16.4 2 12 2z"
        fill="#ea4335"
      />
      <circle cx="12" cy="9.5" r="3" fill="#fff" />
    </svg>
  );
}

function AppleMapsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden focusable="false">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#3478f6" />
      <path d="M12 6l3 6-3-1.5L9 12l3-6z" fill="#ff3b30" />
      <path d="M12 18l-3-6 3 1.5L15 12l-3 6z" fill="#fff" />
    </svg>
  );
}

// ===== Main App ===========================================================

export default function App() {
  const sceneRef = useRef(null);
  const page2Ref = useRef(null);
  const page3Ref = useRef(null);
  const page4Ref = useRef(null);
  const [progress, setProgress] = useState(0); // 0..1
  const [shoreProgress, setShoreProgress] = useState(0); // 0..1
  const [deityProgress, setDeityProgress] = useState(0); // 0..1

  const HEADER_H = 84.76;
  const scrollToEl = (el, offset = 0) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };
  const goPage1Bottom = () => {
    const el = sceneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const y = rect.bottom + window.scrollY - window.innerHeight;
    window.scrollTo({ top: y, behavior: "smooth" });
  };
  const goPage2 = () => scrollToEl(page2Ref.current, -HEADER_H);
  // Scroll to right before the rocky shore begins to rise on page 3
  const goRockyShoreStart = () => {
    const el = page3Ref.current;
    if (!el) return;
    const vh = window.innerHeight;
    const y = el.getBoundingClientRect().bottom + window.scrollY - vh * 1.9;
    window.scrollTo({ top: y, behavior: "smooth" });
  };
  const goPage4 = () => scrollToEl(page4Ref.current, -HEADER_H);

  useEffect(() => {
    const onScroll = () => {
      const el = sceneRef.current;
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        const y = window.scrollY - top;
        setProgress(Math.max(0, Math.min(1, y / PARALLAX_RANGE)));
      }
      const p3 = page3Ref.current;
      if (p3) {
        const rect = p3.getBoundingClientRect();
        const vh = window.innerHeight;
        const distance = rect.bottom - vh;
        const RANGE = vh * 0.7;
        const sp = 1 - Math.max(0, Math.min(1, distance / RANGE));
        setShoreProgress(sp);

        const DEITY_TOP = rect.height * 0.4019;
        const DEITY_H = rect.height * 0.2297;
        const waterLine = rect.top + DEITY_TOP + DEITY_H;
        const start = vh;
        const end = DEITY_TOP + DEITY_H - (rect.height - vh * 1.5);
        const dp = (start - waterLine) / (start - end);
        setDeityProgress(Math.max(0, Math.min(1, dp)));
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="site">
      {/* Sticky header */}
      <header className="sticky-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo"></div>
            <div className="title"></div>
          </div>
          <nav className="nav-buttons">
            <button className="btn" onClick={goPage1Bottom}>
              Home
            </button>
            <button className="btn" onClick={goPage2}>
              About Us
            </button>
            <button className="btn" onClick={goRockyShoreStart}>
              Regístrate
            </button>
            <button className="btn" onClick={goPage4}>
              FAQ
            </button>
          </nav>
        </div>
      </header>

      {/* Page 1 — Jungle temple (parallax landing + stall) */}
      <div
        ref={sceneRef}
        className="parallax-scene"
        style={{ height: `calc(100vh + ${PARALLAX_RANGE + STALL}px)` }}
      >
        <div className="parallax-viewport page-1">
          {LAYERS.map(({ cls, label, travel }) => (
            <Layer
              key={cls}
              className={cls}
              style={{ transform: `translateY(${(1 - progress) * travel}px)` }}
            >
            </Layer>
          ))}
        </div>
        {/* Countdown + register CTA at the top of Home (scrolls away, not sticky) */}
        <div className="home-cta">
          <Countdown />
        </div>
      </div>

      {/* Page 2 - Catacombs (visual) */}
      <section className="page page-2" ref={page2Ref}>
        <Layer className="cavern-wall"></Layer>
        <Layer className="mural">
          <PhotoCollage />
          {/* Page 2b - Contact / Map */}
          <section className="page-2b">
            <ContactSection />
          </section>
        </Layer>
      </section>


      {/* Page 3 - Cenote */}
      <section className="page page-3" ref={page3Ref}>
        <Layer className="cenote-bg"></Layer>

        <div className="deity-clip">
          <div
            className="deity-inner"
            style={{ transform: `translateY(${(1 - deityProgress) * 75}%)` }}
          ></div>
        </div>
        <div className="deity-reflection-clip">
          <div
            className="deity-reflection-inner"
            style={{ transform: `translateY(${(1 - deityProgress) * 75}%)` }}
          ></div>
        </div>
        <Layer
          className="rocky-shore"
          style={{
            transform: `translateY(${Math.pow(1 - shoreProgress, 2) * 400}px)`,
          }}
        ></Layer>
      </section>

      {/* Page 4 - Sponsors / Partners / FAQ / Connect */}
      <section className="page-4" ref={page4Ref}>
        <SponsorsSection />
        <PartnersSection />
        <FAQSection />
        <ConnectSection />
        <footer className="site-footer">
          © {new Date().getFullYear()} Guadalahacks
        </footer>
      </section>
    </div>
  );
}
