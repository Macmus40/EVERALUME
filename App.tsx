
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/Button';
import { Logo } from './components/Logo';
import { generateStoryDraft } from './services/geminiService';
import { FormStatus, InquiryData } from './types';
import { translations } from './translations';

const BRAND_NAME = "Everalume";
const HEADER_OFFSET = 96; 
const DEBUG = true;

const isPreviewEnv = typeof window !== 'undefined' && 
  (window.location.protocol === 'blob:' || 
   window.location.hostname.includes('usercontent.goog') ||
   window.location.hostname.includes('localhost'));

const useReveal = () => {
  const [hasRevealed, setHasRevealed] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);

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
      ref={ref}
      className={`transition-all duration-[600ms] ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[6px]'
      } ${className}`}
    >
      {children}
    </h2>
  );
};

const App: React.FC = () => {
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
  
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
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
    const handleError = (event: ErrorEvent) => console.error("Global JS Error:", event.error);
    const handleRejection = (event: PromiseRejectionEvent) => console.error("Unhandled Promise Rejection:", event.reason);

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener('scroll', handleScroll);
    };
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

  return (
    <div className="min-h-screen bg-[#FCFBF8] selection:bg-[#7D6B5D] selection:text-white">
      <header className={`fixed top-0 w-full z-[100] transition-all duration-700 px-8 py-4 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo 
            variant="wordmark" 
            color={scrolled ? "#1F1F1F" : "#F6F2EC"} 
            className={`transition-all duration-700 ${scrolled ? 'h-12' : 'h-0 opacity-0 pointer-events-none'}`} 
            onClick={() => scrollToSection('top')}
          />
          <div className="hidden md:flex gap-12 text-[9px] font-bold uppercase tracking-[0.3em]">
            <button onClick={() => scrollToSection('about')} className={`transition-colors duration-200 ${scrolled ? 'text-slate-500 hover:text-black' : 'text-white/60 hover:text-white'}`}>{t.nav.vision}</button>
            <button onClick={() => scrollToSection('process')} className={`transition-colors duration-200 ${scrolled ? 'text-slate-500 hover:text-black' : 'text-white/60 hover:text-white'}`}>{t.nav.process}</button>
            <button onClick={() => scrollToSection('pricing')} className={`transition-colors duration-200 ${scrolled ? 'text-slate-500 hover:text-black' : 'text-white/60 hover:text-white'}`}>{t.nav.pricing}</button>
            <button onClick={() => scrollToSection('samples')} className={`transition-colors duration-200 ${scrolled ? 'text-slate-500 hover:text-black' : 'text-white/60 hover:text-white'}`}>{t.nav.samples}</button>
            <button onClick={() => scrollToSection('occasions')} className={`transition-colors duration-200 ${scrolled ? 'text-slate-500 hover:text-black' : 'text-white/60 hover:text-white'}`}>{t.nav.occasions}</button>
          </div>
          <div className="flex gap-4 items-center">
             <button onClick={() => switchLanguage('en')} className={`text-[9px] font-bold tracking-widest transition-all duration-200 ${lang === 'en' ? (scrolled ? 'text-black' : 'text-white') : 'opacity-40 hover:opacity-100'}`}>EN</button>
             <div className={`w-px h-2 ${scrolled ? 'bg-black/10' : 'bg-white/20'}`}></div>
             <button onClick={() => switchLanguage('de')} className={`text-[9px] font-bold tracking-widest transition-all duration-200 ${lang === 'de' ? (scrolled ? 'text-black' : 'text-white') : 'opacity-40 hover:opacity-100'}`}>DE</button>
          </div>
          <Button variant={scrolled ? "primary" : "minimal"} className={`hidden lg:flex transition-all duration-300 ${scrolled ? 'py-3 px-8' : 'py-3 px-8 border-white/40'}`} onClick={() => scrollToSection('contact')}>
            {t.nav.cta}
          </Button>
        </div>
      </header>

      <section id="top" className="bg-[#1F1F1F] text-[#F6F2EC] min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }}></div>
        <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Logo variant="wordmark" color="#F6F2EC" className="h-48 md:h-56 mb-20" />
          <h1 className="text-3xl md:text-5xl font-serif max-w-3xl leading-relaxed mb-12 font-light tracking-wide">{t.hero.h1}</h1>
          <p className="text-[11px] uppercase tracking-[0.4em] font-light opacity-70 mb-20 max-w-lg leading-loose">{t.hero.p}</p>
          <div className="flex flex-col sm:flex-row gap-8 mb-24">
            <Button variant="outline" className="px-16 py-6 border-white/30 text-white hover:bg-white hover:text-[#1F1F1F] transition-all duration-700" onClick={() => scrollToSection('contact')}>{t.hero.cta1}</Button>
            <Button variant="minimal" className="border-transparent opacity-60 hover:opacity-100 px-12" onClick={() => scrollToSection('samples')}>{t.hero.cta2}</Button>
          </div>
          <div id="trust" className="w-full max-w-5xl border-t border-white/10 pt-12">
            <div className="flex flex-wrap justify-center gap-x-8 md:gap-x-12 gap-y-6 text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-bold opacity-50">
              <span className="whitespace-nowrap">{t.trust.location}</span>
              <span className="hidden md:inline opacity-20">•</span>
              <span className="whitespace-nowrap">{t.trust.privacy}</span>
              <span className="hidden md:inline opacity-20">•</span>
              <span className="whitespace-nowrap">{t.trust.process}</span>
              <span className="hidden md:inline opacity-20">•</span>
              <span className="whitespace-nowrap">{t.trust.quality}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-40 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <RevealHeader className="text-4xl md:text-5xl font-serif mb-12 text-[#7D6B5D] leading-tight">{t.about.h2}</RevealHeader>
          <p className="text-xl text-slate-700 leading-relaxed font-light mb-24 max-w-2xl mx-auto italic opacity-90">{t.about.p}</p>
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
            <p className="text-white/40 uppercase tracking-[0.4em] text-[10px] font-bold">{t.process.sub}</p>
          </div>
          <div className="grid md:grid-cols-4 gap-12">
            {t.process.steps.map((step, idx) => (
              <div key={idx} className="group border-t border-white/20 pt-12 transition-all duration-500">
                <div className="text-3xl font-serif text-white/10 mb-8 group-hover:text-white/40 transition-colors duration-300">0{idx+1}</div>
                <h3 className="text-lg font-bold mb-6 tracking-widest uppercase text-[11px]">{step.t}</h3>
                <p className="text-white/60 text-sm leading-relaxed font-light">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-40 px-6 bg-white border-t border-[#EAE4DD]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
            <RevealHeader className="text-4xl md:text-5xl font-serif mb-6 text-[#7D6B5D] leading-tight">{t.pricing.h2}</RevealHeader>
            <p className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">{t.pricing.sub}</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-16 xl:gap-24">
            {t.pricing.packages.map((pkg, idx) => (
              <div key={idx} className={`relative flex flex-col p-8 md:p-12 border border-[#EAE4DD] transition-all duration-500 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] ${idx === 1 ? 'bg-[#FCFBF8]' : ''}`}>
                {idx === 1 && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#7D6B5D] text-white text-[8px] uppercase tracking-[0.4em] font-bold px-6 py-2">
                    {t.pricing.recommended}
                  </div>
                )}
                <h3 className="text-2xl font-serif mb-4 text-slate-900">{pkg.name}</h3>
                <p className="text-slate-500 text-sm font-light mb-10 italic">{pkg.pos}</p>
                <div className="border-t border-[#EAE4DD] pt-10 mb-12">
                   <ul className="space-y-4 mb-10">
                     {pkg.bullets.map((bullet, bIdx) => (
                       <li key={bIdx} className="text-xs text-slate-700 font-light flex items-center gap-3">
                         <span className="w-1.5 h-1.5 bg-[#7D6B5D] rounded-full opacity-60"></span>
                         {bullet}
                       </li>
                     ))}
                   </ul>
                </div>
                <div className="mt-auto pt-10 border-t border-[#EAE4DD]">
                  <p className="text-lg font-serif text-[#7D6B5D] mb-8 font-bold">{pkg.price}</p>
                  <Button variant={idx === 1 ? "primary" : "outline"} className="w-full py-4" onClick={() => scrollToSection('contact')}>
                    {idx === 1 ? "Reserve Consultation" : "Inquire Now"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="samples" className="py-40 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-28">
          <RevealHeader className="text-4xl md:text-5xl font-serif mb-6 text-[#7D6B5D]">{t.samples.h2}</RevealHeader>
          <p className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">{t.samples.sub}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-16">
          {(t.samples.items as any[]).map((item, idx) => (
            <div key={idx} onClick={() => setActiveVideo(item.videoUrl)} className="group cursor-pointer">
              <div className="aspect-[4/5] relative overflow-hidden bg-[#1F1F1F] mb-10 grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 shadow-md group-hover:shadow-xl group-hover:translate-y-[-4px]">
                <img src={item.cover} alt={item.t} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40">
                  <div className="w-16 h-16 rounded-full border-2 border-white/50 flex items-center justify-center backdrop-blur-md">
                    <svg className="w-8 h-8 text-white fill-current translate-x-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
              <div className="text-center px-6">
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#7D6B5D] mb-4 block">{item.tag}</span>
                <h3 className="text-2xl font-serif mb-4 text-slate-900 tracking-tight">{item.t}</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-light line-clamp-2 max-w-xs mx-auto">{item.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Modal remains the same */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setActiveVideo(null)}>
          <button className="absolute top-10 right-10 text-white/70 hover:text-white" onClick={() => setActiveVideo(null)}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <div className="relative w-full max-w-6xl aspect-video bg-black shadow-2xl" onClick={e => e.stopPropagation()}>
            <iframe src={`${activeVideo}?autoplay=1`} className="w-full h-full" frameBorder="0" allow="autoplay; fullscreen" allowFullScreen></iframe>
          </div>
        </div>
      )}

      <section className="py-40 px-6 bg-white relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-24">
            <RevealHeader className="text-4xl md:text-5xl font-serif mb-10 text-[#7D6B5D] leading-tight font-light">{t.assistant.h2}</RevealHeader>
            <p className="text-[#7D6B5D]/60 text-[10px] font-bold tracking-[0.4em] uppercase mb-16">{t.assistant.p}</p>
            <div className="border border-[#EAE4DD] p-12 md:p-24 relative overflow-hidden transition-all duration-500 bg-[#FCFBF8]/30">
              <textarea 
                className="w-full bg-transparent border-b border-slate-200 focus:border-[#7D6B5D] outline-none py-10 text-2xl font-serif placeholder:text-slate-400 mb-12 transition-all duration-300 resize-none text-center text-slate-800"
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
                  <h4 className="font-bold text-[10px] tracking-[0.4em] uppercase mb-12 opacity-60 text-center text-[#7D6B5D]">{t.assistant.draft_label}</h4>
                  <div className="prose prose-stone max-w-2xl mx-auto leading-loose font-serif italic text-xl text-slate-700 text-center">{storyOutput}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" ref={formRef} className="py-40 px-6 max-w-5xl mx-auto">
        {formStatus === FormStatus.SUCCESS ? (
          <div className="text-center py-32 animate-in zoom-in duration-700">
             <h2 className="text-5xl font-serif mb-10 text-[#7D6B5D] tracking-tight">{t.form.success_h}</h2>
             <p className="text-xl text-slate-500 font-light max-w-lg mx-auto leading-relaxed italic">{t.form.success_p}</p>
             <Button className="mt-20" variant="outline" onClick={() => setFormStatus(FormStatus.IDLE)}>Return to Site</Button>
          </div>
        ) : (
          <div className="bg-white border border-[#EAE4DD] p-12 md:p-32 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.08)]">
            <div className="text-center mb-28">
              <RevealHeader className="text-5xl font-serif mb-10 text-[#7D6B5D] tracking-tight">{t.form.h2}</RevealHeader>
              <p className="text-slate-500 font-light text-xl max-w-xl mx-auto leading-relaxed">{t.form.p}</p>
            </div>
            <form onSubmit={handleSubmitInquiry} className="space-y-20">
              <div style={{ position: 'absolute', opacity: 0, zIndex: -1, pointerEvents: 'none' }} aria-hidden="true">
                <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-20">
                <div className="space-y-6">
                  <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-600">{t.form.name}</label>
                  <input required name="name" type="text" className="w-full bg-transparent border-b border-slate-200 py-6 focus:border-[#7D6B5D] outline-none transition-all duration-300 placeholder:text-slate-400 text-lg font-serif text-slate-900" placeholder="Full Name" onChange={e => updateInquiry({ name: e.target.value })} />
                </div>
                <div className="space-y-6">
                  <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-600">{t.form.email}</label>
                  <input required name="email" type="email" className="w-full bg-transparent border-b border-slate-200 py-6 focus:border-[#7D6B5D] outline-none transition-all duration-300 placeholder:text-slate-400 text-lg font-serif text-slate-900" placeholder="email@address.com" onChange={e => updateInquiry({ email: e.target.value })} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-20">
                <div className="space-y-6">
                  <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-600">{t.form.occ_label}</label>
                  <select name="occasion" className="w-full bg-transparent border-b border-slate-200 py-6 focus:border-[#7D6B5D] outline-none appearance-none cursor-pointer font-serif text-lg text-slate-900" value={inquiry.occasion} onChange={e => updateInquiry({ occasion: e.target.value })}>
                    {t.form.occ_options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-6">
                  <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-600">{t.form.photos_label}</label>
                  <select name="photo_estimate" className="w-full bg-transparent border-b border-slate-200 py-6 focus:border-[#7D6B5D] outline-none appearance-none cursor-pointer font-serif text-lg text-slate-900" value={inquiry.photoEstimate} onChange={e => updateInquiry({ photoEstimate: e.target.value })}>
                    {t.form.photos_options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-6">
                <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-600">{t.form.story_label}</label>
                <textarea required name="story" rows={4} className="w-full bg-transparent border-b border-slate-200 py-6 focus:border-[#7D6B5D] outline-none transition-all duration-300 resize-none placeholder:text-slate-400 font-serif text-xl text-slate-900" placeholder={t.form.story_hint} onChange={e => updateInquiry({ story: e.target.value })} />
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

      <footer className="bg-[#1F1F1F] text-[#F6F2EC] py-40 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-24 relative">
          <Logo variant="wordmark" color="#F6F2EC" className="h-28 opacity-80 hover:opacity-100 transition-opacity duration-1000 cursor-pointer" onClick={() => scrollToSection('top')} />
          <div className="flex flex-wrap justify-center gap-x-20 gap-y-10 text-[9px] font-bold uppercase tracking-[0.4em] opacity-60">
            <button onClick={() => scrollToSection('top')} className="hover:text-white">Home</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-white">Vision</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white">Pricing</button>
            <button onClick={() => scrollToSection('samples')} className="hover:text-white">Portfolio</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-white">Contact</button>
          </div>
          <div className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-medium text-center max-w-lg leading-loose">
            © 2024 {BRAND_NAME} Legacy Productions · {lang === 'en' ? 'Curated in' : 'Kuratiert in'} New York & Hamburg · All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
