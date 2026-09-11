import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import axios from "axios";
import { motion, useReducedMotion } from "motion/react";
import { makePuzzle } from "./loadingPuzzle.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};
const monthYear = (value) => new Date(value).toLocaleDateString("en", { month: "short", year: "numeric" });
function Section({ eyebrow, title, id, children, className = "" }) {
  return (
    <motion.section
      id={id}
      className={`section-shell ${className}`}
      {...reveal}
    >
      <p className="section-label">{eyebrow}</p>
      <h2>{title}</h2>
      {children}
    </motion.section>
  );
}
function NotFound() {
  return <main className="not-found"><p>404 / Lost in the scroll</p><h1>This page does not exist.</h1><a href="/">Back to portfolio ↗</a></main>;
}

const AdminPage = lazy(() => import("./Admin.jsx"));
function LoadingPuzzle() {
  const [puzzle, setPuzzle] = useState(makePuzzle);
  const [solved, setSolved] = useState(0);
  const [message, setMessage] = useState("");
  const choose = (position) => {
    if (position !== puzzle.position) return setMessage("Not that one. Try again.");
    setSolved((value) => value + 1);
    setPuzzle(makePuzzle());
    setMessage("Solved. Here’s another one.");
  };
  return <section className="loading-puzzle" aria-labelledby="puzzle-title">
    <div className="puzzle-meta"><span>While you wait / 01</span><b>Solved {solved}</b></div>
    <h2 id="puzzle-title">Find the different symbol.</h2>
    <div className="puzzle-grid" role="group" aria-label="Find the different symbol">
      {Array.from({ length: 9 }, (_, position) => <button type="button" key={position} onClick={() => choose(position)} aria-label={`Choose symbol ${position + 1}`}>{position === puzzle.position ? puzzle.odd : puzzle.common}</button>)}
    </div>
    <p className="puzzle-feedback" aria-live="polite">{message}</p>
  </section>;
}
function Home() {
  const [portfolio, setPortfolio] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => setShowWelcome(true), 800);
    api.get("/public/portfolio", { signal: controller.signal, timeout: 120000 })
      .then(({ data }) => {
        if (!data || typeof data !== "object" || !data.hero) throw new Error("Invalid portfolio response");
        if (!controller.signal.aborted) setPortfolio(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError("We couldn't load the portfolio. Please try again.");
      })
      .finally(() => clearTimeout(timer));
    return () => { clearTimeout(timer); controller.abort(); };
  }, [attempt]);

  if (portfolio) return <Portfolio portfolio={portfolio} />;
  return <main className="portfolio-loading" aria-busy={!loadError}>
    {(showWelcome || loadError) && <section className="loading-panel">
      <div className="loading-intro">
        <span className="loading-monogram" aria-hidden="true">AK</span>
        <p className="loading-eyebrow">Adnan Khan / Portfolio</p>
        <h1>Welcome to Adnan’s <em>portfolio.</em></h1>
        {loadError ? <>
          <p className="loading-copy" role="alert">{loadError}</p>
          <button type="button" onClick={() => { setLoadError(""); setShowWelcome(false); setAttempt((value) => value + 1); }}>Try again ↗</button>
        </> : <>
          <p className="loading-copy">Getting things ready—this first visit may take a moment.</p>
          <div className="loading-status" role="status"><i aria-hidden="true" /><span>Fetching portfolio</span></div>
        </>}
      </div>
      {!loadError && <LoadingPuzzle />}
    </section>}
  </main>;
}

function Portfolio({ portfolio }) {
  const root = useRef(null);
  const cursor = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const reduceMotion = useReducedMotion();
  const [headlineStart, headlineEnd] = (portfolio?.hero?.headline || "").split("useful");
  const projectItems = (portfolio?.projects || []).map((project, index) => ({
        ...project,
        number: `0${index + 1}`,
        image: project.images?.[0],
      }));
  useEffect(() => {
    if (reduceMotion) return undefined;
    let cancelled = false;
    let cleanup = () => {};
    Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]).then(([{ default: Lenis }, { default: gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      let frame;
      const raf = (time) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
      frame = requestAnimationFrame(raf);
      const context = gsap.context(() => {
        if (window.matchMedia("(min-width: 768px)").matches) {
          [[".hero-orb", 22], [".hero-portrait", 38]].forEach(([target, yPercent]) => gsap.to(target, { yPercent, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } }));
          gsap.fromTo(".visual-break img", { yPercent: -8, scale: 1.12 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".visual-break", start: "top bottom", end: "bottom top", scrub: true } });
          gsap.utils.toArray(".section-label").forEach((label) => gsap.fromTo(label, { x: -24 }, { x: 0, scrollTrigger: { trigger: label, start: "top 88%", end: "top 56%", scrub: 0.4 } }));
        }
      }, root);
      cleanup = () => { cancelAnimationFrame(frame); lenis.destroy(); context.revert(); };
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [reduceMotion]);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const moveCursor = ({ clientX, clientY, pointerType }) => {
      if (pointerType === "mouse" && cursor.current) cursor.current.style.transform = `translate(${clientX}px, ${clientY}px)`;
    };
    window.addEventListener("pointermove", moveCursor);
    return () => window.removeEventListener("pointermove", moveCursor);
  }, [reduceMotion]);

  return (
    <div ref={root} className="site-root">
      <div ref={cursor} className="custom-cursor" aria-hidden="true">
        <span />
      </div>
      <header className="site-header">
        <a className="monogram" href="#top" aria-label="Back to top">
          AK
        </a>
        <nav aria-label="Primary">
          <a href="#work">Projects</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="availability" href={`mailto:${portfolio?.contact?.email || ""}`}>
          <i />
          {portfolio?.hero?.availabilityLabel || ""}
        </a>
      </header>
      <main id="top">
        <section className="hero">
          <div className="hero-orb orb-one" />
          <div className="hero-orb orb-two" />
          <motion.figure
            className="hero-portrait"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={
                portfolio?.hero?.profileImage
              }
              alt="Adnan Khan editorial portrait"
              fetchPriority="high"
            />
          </motion.figure>
          <h1>{headlineEnd === undefined ? portfolio?.hero?.headline : <><span>{headlineStart}</span><em>useful</em><span>{headlineEnd}</span></>}</h1>
          <div className="hero-bottom">
            <p>{portfolio?.hero?.intro}</p>
            <div className="hero-actions">
              {portfolio?.hero?.resumeUrl && <a className="resume-link" href={`${api.defaults.baseURL}/public/resume`}>Download Resume ↓</a>}
              <a className="circle-link" href={portfolio?.hero?.ctas?.[0]?.url || "#work"} aria-label={portfolio?.hero?.ctas?.[0]?.label || "Explore projects"}>↓</a>
            </div>
          </div>
          <div className="hero-rule" />
        </section>
        <section id="about" className="intro-band">
          <p className="section-label">01 / About</p>
          <div>
            <h2>{portfolio?.about?.heading}</h2>
            <p className="body-copy">
              {portfolio?.about?.bio}
            </p>
            <a className="text-link" href={portfolio?.about?.ctaUrl || "#contact"}>
              {portfolio?.about?.ctaLabel} <span>↗</span>
            </a>
          </div>
          <motion.figure
            className="portrait-editorial"
            whileHover={{ rotate: 1.5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
          >
            <img
              src={portfolio?.about?.image}
              alt="Adnan Khan working in an editorial studio style"
              loading="lazy"
              decoding="async"
            />
          </motion.figure>
        </section>
        <Section
          id="skills"
          eyebrow="02 / Skills"
          title="Skills I use to build."
        >
          <div className="skills-grid">
            {(portfolio?.skills || []).map(({ category, name }, index) => (
              <article className="skill-card" key={`${category}-${name}`}>
                <b>0{index + 1}</b>
                <h3>{category}</h3>
                <p>{name}</p>
                <span>✦</span>
              </article>
            ))}
          </div>
        </Section>
        <Section
          id="experience"
          eyebrow="03 / Experience"
          title="Internships and hands-on work."
        >
          <div className="timeline">
            {(portfolio?.experience || []).map((item) => {
              const [date, role, company] = [`${monthYear(item.startDate)}${item.present ? " — Present" : item.endDate ? ` — ${monthYear(item.endDate)}` : ""}`, item.role, item.company];
              return (
                <article key={`${company}-${role}`}>
                  <p>{date}</p>
                  <div>
                    <h3>{role}</h3>
                    <span>{company}</span>
                  </div>
                  {item.companyLogo && <figure className="certificate-frame"><button className="certificate-button" type="button" onClick={() => setSelectedCertificate({ src: item.companyLogo, title: `${company} certificate` })} aria-label={`Open ${company} certificate`}><img src={item.companyLogo} alt={`${company} certificate — click to enlarge`} loading="lazy" decoding="async" /></button></figure>}
                </article>
              );
            })}
          </div>
        </Section>
        <motion.section className="visual-break" {...reveal}>
          <div className="visual-copy">
            <p>{portfolio?.about?.visualEyebrow}</p>
            <h2>{portfolio?.about?.visualTitle}</h2>
            <span>{portfolio?.about?.visualCaption}</span>
          </div>
          <figure>
            <img
              src={portfolio?.about?.visualImage}
              alt="Adnan Khan in an art-directed landscape collage"
              loading="lazy"
              decoding="async"
            />
          </figure>
        </motion.section>
        <Section
          id="work"
          eyebrow="04 / Projects"
          title="Things made to be explored."
        >
          <div className="project-grid">
            {projectItems.map((project, index) => (
              <motion.article
                layout
                className={`project-card project-${index + 1}`}
                key={project.title}
              >
                <div className="project-art">
                  <img
                    src={project.image}
                    alt={`Preview of ${project.title}`}
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{project.number}</span>
                </div>
                <div className="project-meta">
                  <p>{project.category}</p>
                  <h3>{project.title}</h3>
                  <span>
                    {(project.stack || project.techStack).join(" · ")}
                  </span>
                  <p>{project.description}</p>
                  <button
                    onClick={() => setSelectedProject(project)}
                    aria-label={`View ${project.title}`}
                  >
                    View project ↗
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </Section>
        <Section id="education" eyebrow="05 / Education" title="Where I built my foundation.">
          <div className="education-list">
            {(portfolio?.education || []).map((item) => (
              <article className="education-card" key={item._id}>
                <p>{item.endYear || "Present"}</p>
                <h3>{item.degree}</h3>
                <span>
                  {item.institution}
                  {item.description ? ` - ${item.description}` : ""}
                </span>
              </article>
            ))}
          </div>
        </Section>
        <Section
          id="achievements"
          eyebrow="06 / Achievements"
          title="Progress so far."
        >
          <div className="achievement-list">
            {(portfolio?.achievements || []).map((item, index) => <article key={item._id}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}
          </div>
        </Section>
        <section id="contact" className="contact-panel">
          <p className="section-label">07 / Contact</p>
          <h2>
            {portfolio?.contact?.heading} <em>{portfolio?.contact?.highlightedWord}</em>
          </h2>
          <a
            href={`mailto:${portfolio?.contact?.email || ""}`}
          >
            {portfolio?.contact?.email} <span>↗</span>
          </a>
          <p>
            {portfolio?.contact?.intro}
          </p>
        </section>
      </main>
      {selectedProject && (
        <div
          className="project-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-dialog-title"
        >
          <button
            className="dialog-backdrop"
            onClick={() => setSelectedProject(null)}
            aria-label="Close project details"
          />
          <article>
            <button
              className="dialog-close"
              onClick={() => setSelectedProject(null)}
              aria-label="Close"
            >
              ×
            </button>
            <p>{selectedProject.category}</p>
            <h2 id="project-dialog-title">{selectedProject.title}</h2>
            <span>
              {(selectedProject.stack || selectedProject.techStack).join(" · ")}
            </span>
            <p>{selectedProject.description}</p>
            {(selectedProject.liveLink || selectedProject.githubLink) && <div className="project-links">
              {selectedProject.liveLink && <a href={selectedProject.liveLink} target="_blank" rel="noreferrer">Live project ↗</a>}
              {selectedProject.githubLink && <a href={selectedProject.githubLink} target="_blank" rel="noreferrer">GitHub ↗</a>}
            </div>}
          </article>
        </div>
      )}
      {selectedCertificate && <div className="project-dialog image-dialog" role="dialog" aria-modal="true" aria-labelledby="certificate-dialog-title"><button className="dialog-backdrop" onClick={() => setSelectedCertificate(null)} aria-label="Close certificate" /><figure><button className="dialog-close" onClick={() => setSelectedCertificate(null)} aria-label="Close">×</button><img src={selectedCertificate.src} alt={selectedCertificate.title} /><figcaption id="certificate-dialog-title">{selectedCertificate.title}</figcaption></figure></div>}
      <footer>
        <span>© {new Date().getFullYear()} {portfolio?.contact?.footerCopyright}</span>
        <div>
          {[["GitHub", portfolio?.contact?.github], ["LinkedIn", portfolio?.contact?.linkedIn], ...(portfolio?.contact?.socials || []).map(({ platform, url }) => [platform, url])].filter(([, url]) => url).map(([label, url]) => <a href={url} target="_blank" rel="noreferrer" key={url}>{label}</a>)}
          <a className="admin-link" href="/admin/login">
            Admin
          </a>
        </div>
      </footer>
    </div>
  );
}
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<Suspense fallback={null}><AdminPage mode="login" /></Suspense>} />
        <Route
          path="/admin/dashboard"
          element={
            <Suspense fallback={null}><AdminPage mode="dashboard" /></Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
