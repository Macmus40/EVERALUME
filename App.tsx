
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/Button';
import { Logo } from './components/Logo';
import { generateStoryDraft } from './services/geminiService';
import { FormStatus, InquiryData } from './types';
import { translations } from './translations';

const BRAND_NAME = "Everalume";
const HEADER_OFFSET = 96; 
const DEBUG = true;

const CINEMATIC_PLACEHOLDER = "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop";

type View = 'main' | 'privacy' | 'terms';

const isPreviewEnv = typeof window !== 'undefined' && 
  (window.location.protocol === 'blob:' || 
   window.location.hostname.includes('usercontent.goog') ||
   window.location.hostname.includes('localhost'));

const useReveal = () => {
  const [hasRevealed, setHasRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed: hasRevealed };
};

const RevealHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const { ref, revealed } = useReveal();
  return (
    <h2 
      ref={ref as any}
      className={`transition-all duration-[600ms] ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[6px]'
      } ${className}`}
    >
      {children}
    </h2>
  );
};

const TestimonialsSection: React.FC<{ t: any }> = ({ t }) => {
  if (!t.testimonials || !t.testimonials.items) return null;

  return (
    <section id="testimonials" className="py-32 px-6 bg-white border-y border-[#EAE4DD]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
           <RevealHeader className="text-4xl md:text-5xl font-serif mb-4 text-[#7D6B5D]">{t.testimonials.h2}</RevealHeader>
           <p className="text-[9px] uppercase tracking-[0.4em] font-bold text-[#7D6B5D]/80 mt-6">{t.testimonials.sub}</p>
           <div className="flex justify-center mt-12 opacity-30">
             <span className="text-[#7D6B5D]">·</span>
           </div>
        </div>
        <div className="grid md:grid-cols-3 gap-16 lg:gap-24 items-stretch">
          {t.testimonials.items.map((item: any, idx: number) => (
            <div key={idx} className="flex flex-col items-center text-center h-full group">
              <div className="flex-1 flex items-center justify-center mb-12">
                <p className="text-xl md:text-2xl font-serif italic text-slate-800 leading-relaxed max-w-xs">
                  {item.q}
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-600 transition-colors duration-300">
                — {item.a}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * REUSABLE FILM CARD COMPONENT
 * Centered on 16:9 aspect ratio, cinematic overlay, and museum-style numbering.
 */
const ExhibitionFilmCard: React.FC<{ 
  item: any; 
  index: string; 
  onClick: () => void;
  dimmed?: boolean;
}> = ({ item, index, onClick, dimmed = false }) => (
  <div className="flex flex-col items-start w-full group cursor-pointer" onClick={onClick}>
    {/* Aspect-video container with identical styling for all 3 cards */}
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] bg-[#1A1A1E] border border-white/10 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
      {/* Museum Label Numbering: Top-left corner inside card */}
      <span className="absolute top-5 left-6 z-20 text-[10px] font-bold text-white/25 uppercase tracking-[0.5em] pointer-events-none">
        {index}
      </span>
      
      {/* Unified Cinematic Placeholder Thumbnail */}
      <img 
        src={CINEMATIC_PLACEHOLDER} 
        alt={item.t} 
        className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale-[0.4] transition-transform duration-[4000ms] ease-out group-hover:scale-110" 
      />
      
      {/* Film Grain Texture Mix-in */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }}></div>
      
      {/* Dark Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-1000"></div>

      {/* Minimal Centered Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:border-white/40 group-hover:bg-black/60">
          <svg className="w-6 h-6 text-white/70 fill-current translate-x-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>

      {/* Interactive Light Sweep Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] ease-in-out"></div>
      </div>
    </div>

    {/* Typography - Styled with editorial opacities */}
    <div className="mt-8 pl-1">
      <h4 className={`font-serif text-[#F6F2EC] text-2xl md:text-3xl mb-3 tracking-tight leading-tight transition-opacity duration-500 ${dimmed ? 'opacity-70' : 'opacity-[0.85]'}`}>
        {item.t}
      </h4>
      <p className={`text-[#F6F2EC]/40 text-[9px] uppercase tracking-[0.5em] font-medium leading-relaxed transition-opacity duration-500 ${dimmed ? 'opacity-40' : 'opacity-50'}`}>
        {item.tag}
      </p>
    </div>
  </div>
);

const MemoryToMotionSection: React.FC<{ t: any }> = ({ t }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { ref, revealed } = useReveal();

  return (
    <section 
      id="memory-to-motion" 
      ref={ref}
      className={`relative py-48 px-6 bg-[#0F0F12] transition-opacity duration-[2000ms] overflow-hidden ${revealed ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* ATMOSPHERIC BACKGROUND: Radial Gradients & Grain */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_80%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04)_0%,transparent_60%)]"></div>
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }}></div>
      </div>

      {/* BLENDING FADES - Top and Bottom Edge Smoothness */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent opacity-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent opacity-10 pointer-events-none"></div>

      {/* CENTER VERTICAL AXIS HAIRLINE - Subtly Anchored (white/3 opacity with vertical fade) */}
      <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-white/[0.03] to-transparent -translate-x-1/2 pointer-events-none hidden md:block z-0"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER SECTION */}
        <div className="text-center mb-32 md:mb-40">
          <Logo variant="monogram" color="#F6F2EC" className="h-16 opacity-10 mx-auto mb-16" />
          <h2 className="text-4xl md:text-6xl font-serif text-[#F6F2EC] mb-6 tracking-tight leading-tight">
            {t.samples.h2}
          </h2>
          <p className="text-[#F6F2EC]/40 text-sm font-light tracking-[0.3em] italic mb-12">
            {t.samples.sub}
          </p>
          <div className="w-24 h-px bg-white/10 mx-auto"></div>
        </div>

        {/* EXHIBITION COMPOSITION: 1/3 Axis Overlap Layout with Premium Wider Cards (md:col-span-7) */}
        <div className="flex flex-col gap-y-24 md:gap-y-36">
          
          {/* FILM 01: Left-aligned, wider presence, overlapping axis by 1/3 */}
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="col-span-12 md:col-span-7 md:translate-x-[33%] transition-transform duration-1200 ease-out">
              <ExhibitionFilmCard 
                item={t.samples.items[0]} 
                index="01" 
                onClick={() => setModalOpen(true)} 
                dimmed={false}
              />
            </div>
          </div>

          {/* FILM 02: Right-aligned, wider presence, overlapping axis by 1/3 */}
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="col-span-12 md:col-span-7 md:col-start-6 md:-translate-x-[33%] transition-transform duration-1200 ease-out">
              <ExhibitionFilmCard 
                item={t.samples.items[1]} 
                index="02" 
                onClick={() => setModalOpen(true)} 
                dimmed={true}
              />
            </div>
          </div>

          {/* FILM 03: Left-aligned, wider presence, overlapping axis by 1/3 */}
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="col-span-12 md:col-span-7 md:translate-x-[33%] transition-transform duration-1200 ease-out">
              <ExhibitionFilmCard 
                item={t.samples.items[2]} 
                index="03" 
                onClick={() => setModalOpen(true)} 
                dimmed={true}
              />
            </div>
          </div>

        </div>
      </div>

      {/* PREVIEW MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[200] bg-[#000] flex items-center justify-center p-6 md:p-12 animate-in fade-in zoom-in-95 duration-700">
           <button 
            onClick={() => setModalOpen(false)} 
            className="absolute top-10 right-10 text-white/20 hover:text-white transition-all hover:scale-110"
           >
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12"></path>
             </svg>
           </button>
           <div className="text-center max-w-lg">
             <h3 className="text-white font-serif italic text-3xl md:text-4xl mb-8 opacity-80">
               Legacy Film Preview – Coming Soon.
             </h3>
             <p className="text-white/20 text-[11px] uppercase tracking-[0.5em] font-bold">
               Curation of existence for the digital heritage
             </p>
           </div>
        </div>
      )}
    </section>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('main');

  const getLangFromPath = () => {
    if (typeof window === 'undefined') return 'en';
    const path = window.location.pathname;
    return path.startsWith('/de') ? 'de' : 'en';
  };

  const [lang, setLang] = useState<'en' | 'de'>(getLangFromPath());
  const t = translations[lang] ?? translations.en;
  
  const [inquiry, setInquiry] = useState<Partial<InquiryData>>({
    occasion: t.form?.occ_options?.[0] || '',
    photoEstimate: t.form?.photos_options?.[0] || '',
  });

  const [formStatus, setFormStatus] = useState<FormStatus>(FormStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storyInput, setStoryInput] = useState('');
  const [storyOutput, setStoryOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  const [honeypot, setHoneypot] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const safePushState = (state: any, title: string, url: string) => {
    if (isPreviewEnv) return;
    try {
      window.history.pushState(state, title, url);
    } catch (e) {
      console.warn("History pushState failed:", e);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handlePopState = () => setLang(getLangFromPath());
    window.addEventListener('popstate', handlePopState);
    document.title = t.meta.title;
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lang, t]);

  const switchLanguage = (newLang: 'en' | 'de') => {
    const newPath = newLang === 'de' ? '/de/' : '/';
    safePushState({}, '', newPath);
    setLang(newLang);
    setErrorMessage(null);
  };

  const scrollToSection = (id: string) => {
    if (currentView !== 'main') {
      setCurrentView('main');
      setTimeout(() => performScroll(id), 100);
      return;
    }
    performScroll(id);
  };

  const performScroll = (id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      safePushState(null, '', ' ');
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      safePushState(null, '', `#${id}`);
    }
  };

  const navigateToView = (view: View) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateStory = async () => {
    if (!storyInput.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateStoryDraft(storyInput, lang);
      setStoryOutput(result || '');
    } catch (error) {
      console.error("Story generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (honeypot) { setFormStatus(FormStatus.SUCCESS); return; }
    const now = Date.now();
    if (now - lastSubmissionTime < 30000) {
      setErrorMessage(lang === 'en' ? "Please wait a moment." : "Bitte warten Sie einen Moment.");
      return;
    }
    setFormStatus(FormStatus.SUBMITTING);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setFormStatus(FormStatus.SUCCESS);
      setLastSubmissionTime(now);
    } catch (error) {
      setFormStatus(FormStatus.ERROR);
    }
  };

  const updateInquiry = (data: Partial<InquiryData>) => {
    setInquiry(prev => ({ ...prev, ...data }));
  };

  const LegalPage = ({ title, content }: { title: string, content: string }) => (
    <div className="pt-48 pb-40 px-6 min-h-screen animate-in fade-in duration-700 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-[#7D6B5D]">{title}</h1>
          <button 
            onClick={() => navigateToView('main')}
            className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 hover:text-[#7D6B5D] transition-colors"
          >
            ← {lang === 'en' ? 'Back to home' : 'Zurück zur Startseite'}
          </button>
        </div>
        <div className="prose prose-stone max-w-none text-slate-800 leading-relaxed font-light whitespace-pre-wrap text-lg">
          {content}
        </div>
        <div className="mt-20 pt-16 border-t border-slate-100 flex justify-center md:justify-start">
          <Button variant="outline" onClick={() => navigateToView('main')}>
            {lang === 'en' ? 'Return to Main Site' : 'Zurück zur Hauptseite'}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FCFBF8] selection:bg-[#7D6B5D] selection:text-white">
      <header className={`fixed top-0 w-full z-[100] transition-all duration-700 px-8 py-4 ${scrolled || currentView !== 'main' ? 'bg-white/95 backdrop-blur-xl shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo 
            variant="wordmark" 
            color={scrolled || currentView !== 'main' ? "#1F1F1F" : "#F6F2EC"} 
            className={`transition-all duration-700 ${scrolled || currentView !== 'main' ? 'h-12' : 'h-0 opacity-0 pointer-events-none'}`} 
            onClick={() => navigateToView('main')}
          />
          <div className="hidden md:flex gap-12 text-[9px] font-bold uppercase tracking-[0.3em]">
            <button onClick={() => scrollToSection('about')} className={`transition-colors duration-200 ${scrolled || currentView !== 'main' ? 'text-slate-600 hover:text-black' : 'text-white/70 hover:text-white'}`}>{t.nav.vision}</button>
            <button onClick={() => scrollToSection('experience')} className={`transition-colors duration-200 ${scrolled || currentView !== 'main' ? 'text-slate-600 hover:text-black' : 'text-white/70 hover:text-white'}`}>{t.nav.experience}</button>
            <button onClick={() => scrollToSection('testimonials')} className={`transition-colors duration-200 ${scrolled || currentView !== 'main' ? 'text-slate-600 hover:text-black' : 'text-white/70 hover:text-white'}`}>{t.nav.testimonials}</button>
            <button onClick={() => scrollToSection('pricing')} className={`transition-colors duration-200 ${scrolled || currentView !== 'main' ? 'text-slate-600 hover:text-black' : 'text-white/70 hover:text-white'}`}>{t.nav.pricing}</button>
            <button onClick={() => scrollToSection('memory-to-motion')} className={`transition-colors duration-200 ${scrolled || currentView !== 'main' ? 'text-slate-600 hover:text-black' : 'text-white/70 hover:text-white'}`}>{t.nav.samples}</button>
          </div>
          <div className="flex gap-4 items-center">
             <button onClick={() => switchLanguage('en')} className={`text-[9px] font-bold tracking-widest transition-all duration-200 ${lang === 'en' ? (scrolled || currentView !== 'main' ? 'text-black' : 'text-white') : 'opacity-40 hover:opacity-100'}`}>EN</button>
             <div className={`w-px h-2 ${scrolled || currentView !== 'main' ? 'bg-black/10' : 'bg-white/20'}`}></div>
             <button onClick={() => switchLanguage('de')} className={`text-[9px] font-bold tracking-widest transition-all duration-200 ${lang === 'de' ? (scrolled || currentView !== 'main' ? 'text-black' : 'text-white') : 'opacity-40 hover:opacity-100'}`}>DE</button>
          </div>
          <Button variant={scrolled || currentView !== 'main' ? "primary" : "minimal"} className={`hidden lg:flex transition-all duration-300 ${scrolled || currentView !== 'main' ? 'py-3 px-8' : 'py-3 px-8 border-white/60'}`} onClick={() => scrollToSection('contact')}>
            {t.nav.cta}
          </Button>
        </div>
      </header>

      {currentView === 'main' ? (
        <>
          <section id="top" className="bg-[#1F1F1F] text-[#F6F2EC] min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden text-center">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }}></div>
            <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Logo variant="wordmark" color="#F6F2EC" className="h-48 md:h-56 mb-20" />
              <h1 className="text-3xl md:text-5xl font-serif max-w-3xl leading-relaxed mb-12 font-light tracking-wide">{t.hero.h1}</h1>
              <p className="text-[11px] uppercase tracking-[0.4em] font-light opacity-80 mb-20 max-w-lg leading-loose">{t.hero.p}</p>
              <div className="flex flex-col sm:flex-row gap-8 mb-24">
                <Button variant="outline" className="px-16 py-6 border-white/40 text-white hover:bg-white hover:text-[#1F1F1F] transition-all duration-700" onClick={() => scrollToSection('contact')}>{t.hero.cta1}</Button>
                <Button variant="minimal" className="border-transparent opacity-70 hover:opacity-100 px-12" onClick={() => scrollToSection('memory-to-motion')}>{t.hero.cta2}</Button>
              </div>
              <div id="trust" className="w-full max-w-5xl border-t border-white/20 pt-12">
                <div className="flex flex-wrap justify-center gap-x-8 md:gap-x-12 gap-y-6 text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-bold opacity-70">
                  <span className="whitespace-nowrap">{t.trust.location}</span>
                  <span className="hidden md:inline opacity-30">•</span>
                  <span className="whitespace-nowrap">{t.trust.privacy}</span>
                  <span className="hidden md:inline opacity-30">•</span>
                  <span className="whitespace-nowrap">{t.trust.process}</span>
                  <span className="hidden md:inline opacity-30">•</span>
                  <span className="whitespace-nowrap">{t.trust.quality}</span>
                </div>
              </div>
            </div>
          </section>

          <section id="about" className="py-40 px-6 bg-white">
            <div className="max-w-4xl mx-auto text-center">
              <RevealHeader className="text-4xl md:text-5xl font-serif mb-12 text-[#7D6B5D] leading-tight">{t.about.h2}</RevealHeader>
              <p className="text-xl text-slate-700 leading-relaxed font-light mb-24 max-w-2xl mx-auto italic opacity-95">{t.about.p}</p>
              <div className="grid md:grid-cols-2 gap-20 text-left">
                <div className="border-t border-[#EAE4DD] pt-12 group transition-colors duration-500">
                    <h4 className="font-serif text-2xl mb-6 text-[#7D6B5D] group-hover:text-black transition-colors duration-300">{t.about.b1_h}</h4>
                    <p className="text-slate-700 leading-relaxed text-sm font-light">{t.about.b1_p}</p>
                </div>
                <div className="border-t border-[#EAE4DD] pt-12 group transition-colors duration-500">
                    <h4 className="font-serif text-2xl mb-6 text-[#7D6B5D] group-hover:text-black transition-colors duration-300">{t.about.b2_h}</h4>
                    <p className="text-slate-700 leading-relaxed text-sm font-light">{t.about.b2_p}</p>
                </div>
              </div>
            </div>
          </section>

          <section id="process" className="py-40 px-6 bg-[#1F1F1F] text-[#F6F2EC]">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-32">
                <RevealHeader className="text-4xl md:text-5xl font-serif mb-6 font-light">{t.process.h2}</RevealHeader>
                <p className="text-white/60 uppercase tracking-[0.4em] text-[10px] font-bold">{t.process.sub}</p>
              </div>
              <div className="grid md:grid-cols-4 gap-12">
                {t.process.steps.map((step, idx) => (
                  <div key={idx} className="group border-t border-white/20 pt-12 transition-all duration-500">
                    <div className="text-3xl font-serif text-white/20 mb-8 group-hover:text-white/50 transition-colors duration-300">0{idx+1}</div>
                    <h3 className="text-lg font-bold mb-6 tracking-widest uppercase text-[11px]">{step.t}</h3>
                    <p className="text-white/70 text-sm leading-relaxed font-light">{step.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="experience" className="py-40 px-6 bg-[#FCFBF8]">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-24">
                <RevealHeader className="text-4xl md:text-5xl font-serif mb-6 text-[#7D6B5D] leading-tight">{t.experience.h2}</RevealHeader>
                <p className="text-slate-600 text-[10px] uppercase tracking-[0.4em] font-bold">{t.experience.sub}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-16 mb-24">
                {t.experience.steps.map((step, idx) => (
                  <div key={idx} className="group flex flex-col text-center items-center">
                    <div className="w-px h-12 bg-[#7D6B5D]/30 group-hover:bg-[#7D6B5D] transition-all duration-[400ms] ease-in-out mb-10 motion-reduce:transition-none"></div>
                    <h3 className="text-xl font-serif mb-6 text-slate-900 transition-colors duration-[400ms] ease-in-out group-hover:text-[#7D6B5D]">{step.t}</h3>
                    <p className="text-slate-700 text-sm leading-relaxed font-light max-w-xs">{step.d}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-[0.4em] font-serif text-slate-500">
                  {t.experience.discreet_line}
                </p>
              </div>
            </div>
          </section>

          <TestimonialsSection t={t} />

          <section id="pricing" className="py-40 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-32">
                <RevealHeader className="text-4xl md:text-5xl font-serif mb-6 text-[#7D6B5D] leading-tight">{t.pricing.h2}</RevealHeader>
                <p className="text-slate-600 font-light text-sm italic max-w-lg mx-auto">{t.pricing.sub}</p>
              </div>
              
              <div className="flex flex-col gap-24 md:gap-32">
                {t.pricing.packages.map((pkg: any, idx: number) => (
                  <div key={idx} className="grid md:grid-cols-[1fr_2fr_1fr] gap-12 items-baseline border-b border-slate-100 pb-20 last:border-0">
                    <div className="flex flex-col">
                      <h3 className="text-2xl font-serif text-slate-900 mb-2">{pkg.name}</h3>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7D6B5D]/80">{pkg.pos}</p>
                    </div>
                    <div className="flex flex-col md:flex-row md:flex-wrap gap-x-12 gap-y-4">
                      {pkg.details.map((detail: string, dIdx: number) => (
                        <div key={dIdx} className="flex items-center gap-2 text-xs text-slate-700 font-light">
                          <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                          {detail}
                        </div>
                      ))}
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm font-serif text-[#7D6B5D] italic">{pkg.price}</p>
                      <button 
                        onClick={() => scrollToSection('contact')}
                        className="mt-4 text-[9px] uppercase tracking-[0.3em] font-bold text-slate-500 hover:text-black transition-colors"
                      >
                        Inquire
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-32 text-center">
                <p className="text-[10px] text-slate-600 uppercase tracking-[0.4em] font-light max-w-xl mx-auto leading-loose">
                  {t.pricing.limited_commissions}
                </p>
              </div>
            </div>
          </section>

          <MemoryToMotionSection t={t} />

          <section className="py-40 px-6 bg-white relative">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-24">
                <RevealHeader className="text-4xl md:text-5xl font-serif mb-10 text-[#7D6B5D] leading-tight font-light">{t.assistant.h2}</RevealHeader>
                <p className="text-[#7D6B5D]/80 text-[10px] font-bold tracking-[0.4em] uppercase mb-16">{t.assistant.p}</p>
                <div className="border border-[#EAE4DD] p-12 md:p-24 relative overflow-hidden transition-all duration-500 bg-[#FCFBF8]/30">
                  <textarea 
                    className="w-full bg-transparent border-b border-slate-300 focus:border-[#7D6B5D] outline-none py-10 text-2xl font-serif placeholder:text-slate-500 mb-12 transition-all duration-300 resize-none text-center text-slate-800"
                    placeholder={t.assistant.placeholder}
                    rows={2}
                    value={storyInput}
                    onChange={(e) => setStoryInput(e.target.value)}
                  />
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={handleGenerateStory} loading={isGenerating} className="px-20 border-slate-300 text-slate-700 hover:text-[#7D6B5D] hover:border-[#7D6B5D]">
                      {t.assistant.btn}
                    </Button>
                  </div>
                  {storyOutput && (
                    <div className="mt-24 text-left border-t border-slate-200 pt-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <h4 className="font-bold text-[10px] tracking-[0.4em] uppercase mb-12 opacity-80 text-center text-[#7D6B5D]">{t.assistant.draft_label}</h4>
                      <div className="prose prose-stone max-w-2xl mx-auto leading-loose font-serif italic text-xl text-slate-700 text-center">{storyOutput}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section id="occasions" className="py-40 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <RevealHeader className="text-4xl md:text-5xl font-serif mb-16 text-[#7D6B5D] tracking-tight">{t.occasions.h2}</RevealHeader>
            </div>
            <div className="grid md:grid-cols-3 gap-y-24 gap-x-16">
              {t.occasions.items.map((item, idx) => (
                <div key={idx} className="group border-l border-slate-100 pl-10 hover:border-[#7D6B5D] transition-all duration-700">
                  <h3 className="text-xl font-serif mb-6 text-slate-800 group-hover:text-[#7D6B5D] transition-colors duration-300">{item.t}</h3>
                  <p className="text-slate-700 text-sm leading-relaxed font-light">{item.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="contact" ref={formRef} className="py-40 px-6 max-w-5xl mx-auto">
            {formStatus === FormStatus.SUCCESS ? (
              <div className="text-center py-32 animate-in zoom-in duration-700">
                 <h2 className="text-5xl font-serif mb-10 text-[#7D6B5D] tracking-tight">{t.form.success_h}</h2>
                 <p className="text-xl text-slate-600 font-light max-w-lg mx-auto leading-relaxed italic">{t.form.success_p}</p>
                 <Button className="mt-20" variant="outline" onClick={() => setFormStatus(FormStatus.IDLE)}>Return to Site</Button>
              </div>
            ) : (
              <div className="bg-white border border-[#EAE4DD] p-12 md:p-32 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.08)]">
                <div className="text-center mb-28">
                  <RevealHeader className="text-5xl font-serif mb-10 text-[#7D6B5D] tracking-tight">{t.form.h2}</RevealHeader>
                  <p className="text-slate-600 font-light text-xl max-w-xl mx-auto leading-relaxed">{t.form.p}</p>
                </div>
                <form onSubmit={handleSubmitInquiry} className="space-y-20">
                  <div style={{ position: 'absolute', opacity: 0, zIndex: -1, pointerEvents: 'none' }} aria-hidden="true">
                    <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-20">
                    <div className="space-y-6">
                      <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-600">{t.form.name}</label>
                      <input required name="name" type="text" className="w-full bg-transparent border-b border-slate-300 py-6 focus:border-[#7D6B5D] outline-none transition-all duration-300 placeholder:text-slate-500 text-lg font-serif text-slate-900" placeholder="Full Name" onChange={e => updateInquiry({ name: e.target.value })} />
                    </div>
                    <div className="space-y-6">
                      <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-600">{t.form.email}</label>
                      <input required name="email" type="email" className="w-full bg-transparent border-b border-slate-300 py-6 focus:border-[#7D6B5D] outline-none transition-all duration-300 placeholder:text-slate-500 text-lg font-serif text-slate-900" placeholder="email@address.com" onChange={e => updateInquiry({ email: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-20">
                    <div className="space-y-6">
                      <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-600">{t.form.occ_label}</label>
                      <select name="occasion" className="w-full bg-transparent border-b border-slate-300 py-6 focus:border-[#7D6B5D] outline-none appearance-none cursor-pointer font-serif text-lg text-slate-900" value={inquiry.occasion} onChange={e => updateInquiry({ occasion: e.target.value })}>
                        {t.form.occ_options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className="space-y-6">
                      <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-600">{t.form.photos_label}</label>
                      <select name="photo_estimate" className="w-full bg-transparent border-b border-slate-300 py-6 focus:border-[#7D6B5D] outline-none appearance-none cursor-pointer font-serif text-lg text-slate-900" value={inquiry.photoEstimate} onChange={e => updateInquiry({ photoEstimate: e.target.value })}>
                        {t.form.photos_options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-600">{t.form.story_label}</label>
                    <textarea required name="story" rows={4} className="w-full bg-transparent border-b border-slate-300 py-6 focus:border-[#7D6B5D] outline-none transition-all duration-300 resize-none placeholder:text-slate-500 font-serif text-xl text-slate-900" placeholder={t.form.story_hint} onChange={e => updateInquiry({ story: e.target.value })} />
                  </div>
                  <div className="pt-16 flex flex-col items-center">
                    <Button type="submit" className="w-full md:w-auto md:px-32 py-10 shadow-[0_30px_60px_-10px_rgba(125,107,93,0.3)] transition-all duration-300" loading={formStatus === FormStatus.SUBMITTING}>
                      {t.form.btn}
                    </Button>
                    {errorMessage && <p className="mt-12 text-red-600 text-[10px] font-bold tracking-[0.3em] uppercase">{errorMessage}</p>}
                  </div>
                </form>
              </div>
            )}
          </section>
        </>
      ) : currentView === 'privacy' ? (
        <LegalPage title={t.privacy.h2} content={t.privacy.content} />
      ) : (
        <LegalPage title={t.terms.h2} content={t.terms.content} />
      )}

      <footer className="bg-[#1F1F1F] text-[#F6F2EC] py-40 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-24 relative">
          <Logo variant="wordmark" color="#F6F2EC" className="h-28 opacity-90 hover:opacity-100 transition-opacity duration-1000 cursor-pointer" onClick={() => navigateToView('main')} />
          <div className="flex flex-wrap justify-center gap-x-20 gap-y-10 text-[9px] font-bold uppercase tracking-[0.4em] opacity-80">
            <button onClick={() => navigateToView('main')} className="hover:text-white transition-colors duration-200">Home</button>
            <button onClick={() => scrollToSection('experience')} className="hover:text-white transition-colors duration-200">{t.nav.experience}</button>
            <button onClick={() => scrollToSection('testimonials')} className="hover:text-white transition-colors duration-200">{t.nav.testimonials}</button>
            <button onClick={() => navigateToView('privacy')} className={`transition-colors duration-200 ${currentView === 'privacy' ? 'text-white' : 'hover:text-white'}`}>Privacy Policy</button>
            <button onClick={() => navigateToView('terms')} className={`transition-colors duration-200 ${currentView === 'terms' ? 'text-white' : 'hover:text-white'}`}>Terms of Service</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors duration-200">Pricing</button>
            <button onClick={() => scrollToSection('memory-to-motion')} className="hover:text-white transition-colors duration-200">Portfolio</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors duration-200">Contact</button>
          </div>
          <div className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-medium text-center max-w-lg leading-loose">
            © 2024 {BRAND_NAME} Legacy Productions · {lang === 'en' ? 'Curated in' : 'Kuratiert in'} New York & Hamburg · All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
