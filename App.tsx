
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/Button';
import { Logo } from './components/Logo';
import { generateStoryDraft } from './services/geminiService';
import { FormStatus, InquiryData } from './types';
import { translations } from './translations';

const BRAND_NAME = "Everalume";
const HEADER_OFFSET = 96; // Offset for sticky header

const App: React.FC = () => {
  const getLangFromPath = () => {
    const path = window.location.pathname;
    return path.startsWith('/de') ? 'de' : 'en';
  };

  const [lang, setLang] = useState<'en' | 'de'>(getLangFromPath());
  const t = translations[lang];

  const [inquiry, setInquiry] = useState<Partial<InquiryData>>({
    occasion: t.form.occ_options[0],
    photoEstimate: t.form.photos_options[0],
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

  // Handle scroll to update header state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveVideo(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync state with URL
  useEffect(() => {
    const handlePopState = () => {
      setLang(getLangFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    document.title = t.meta.title;
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lang, t]);

  // Initial Hash Scroll
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => scrollToSection(hash), 500);
    }
  }, []);

  const switchLanguage = (newLang: 'en' | 'de') => {
    const newPath = newLang === 'de' ? '/de/' : '/';
    window.history.pushState({}, '', newPath);
    setLang(newLang);
    setErrorMessage(null);
  };

  const scrollToSection = (id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', ' ');
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - HEADER_OFFSET;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  const handleGenerateStory = async () => {
    if (!storyInput.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateStoryDraft(storyInput, lang);
      setStoryOutput(result);
    } catch (error) {
      console.error("Story generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (honeypot) {
      setFormStatus(FormStatus.SUCCESS); 
      return;
    }
    const now = Date.now();
    if (now - lastSubmissionTime < 30000) {
      const waitTime = Math.ceil((30000 - (now - lastSubmissionTime)) / 1000);
      setErrorMessage(lang === 'en' 
        ? `Please wait ${waitTime} more seconds before submitting again.` 
        : `Bitte warten Sie noch ${waitTime} Sekunden, bevor Sie erneut senden.`);
      return;
    }
    setFormStatus(FormStatus.SUBMITTING);
    try {
      // FIX: Mock API call must resolve with a response object containing 'ok' to prevent Uncaught TypeError
      const response: any = await new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 1500));
      if (response.ok) {
        setFormStatus(FormStatus.SUCCESS);
        setLastSubmissionTime(now);
      } else {
        setFormStatus(FormStatus.ERROR);
        setErrorMessage(lang === 'en' ? "Server error. Try again later." : "Serverfehler. Später erneut versuchen.");
      }
    } catch (error) {
      setFormStatus(FormStatus.ERROR);
      setErrorMessage(lang === 'en' ? "Network error." : "Verbindungsfehler.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] selection:bg-[#7D6B5D] selection:text-white">
      {/* Persistent Sticky Navigation */}
      <header className={`fixed top-0 w-full z-[100] transition-all duration-700 px-8 py-4 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo 
            variant="wordmark" 
            color={scrolled ? "#1F1F1F" : "#F6F2EC"} 
            className={`transition-all duration-700 ${scrolled ? 'h-12' : 'h-0 opacity-0 pointer-events-none'}`} 
            onClick={() => scrollToSection('top')}
          />
          <div className="hidden md:flex gap-12 text-[9px] font-bold uppercase tracking-[0.3em]">
            <button onClick={() => scrollToSection('about')} className={`transition-colors ${scrolled ? 'text-slate-400 hover:text-black' : 'text-white/40 hover:text-white'}`}>{t.nav.vision}</button>
            <button onClick={() => scrollToSection('samples')} className={`transition-colors ${scrolled ? 'text-slate-400 hover:text-black' : 'text-white/40 hover:text-white'}`}>{t.nav.samples}</button>
            <button onClick={() => scrollToSection('process')} className={`transition-colors ${scrolled ? 'text-slate-400 hover:text-black' : 'text-white/40 hover:text-white'}`}>{t.nav.process}</button>
            <button onClick={() => scrollToSection('occasions')} className={`transition-colors ${scrolled ? 'text-slate-400 hover:text-black' : 'text-white/40 hover:text-white'}`}>{t.nav.occasions}</button>
          </div>
          <div className="flex gap-4 items-center">
             <button onClick={() => switchLanguage('en')} className={`text-[9px] font-bold tracking-widest transition-all ${lang === 'en' ? (scrolled ? 'text-black' : 'text-white') : 'opacity-30 hover:opacity-100'}`}>EN</button>
             <div className={`w-px h-2 ${scrolled ? 'bg-black/10' : 'bg-white/20'}`}></div>
             <button onClick={() => switchLanguage('de')} className={`text-[9px] font-bold tracking-widest transition-all ${lang === 'de' ? (scrolled ? 'text-black' : 'text-white') : 'opacity-30 hover:opacity-100'}`}>DE</button>
          </div>
          <Button variant={scrolled ? "primary" : "minimal"} className={`hidden lg:flex ${scrolled ? 'py-3 px-8' : 'py-3 px-8 border-white/20'}`} onClick={() => scrollToSection('contact')}>
            {t.nav.cta}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="bg-[#1F1F1F] text-[#F6F2EC] min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }}></div>
        
        <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Logo variant="wordmark" color="#F6F2EC" className="h-48 md:h-56 mb-20" />
          
          <h1 className="text-3xl md:text-5xl font-serif max-w-3xl leading-relaxed mb-12 font-light tracking-wide">
            {t.hero.h1}
          </h1>
          
          <p className="text-[11px] uppercase tracking-[0.4em] font-light opacity-50 mb-20 max-w-lg leading-loose">
            {t.hero.p}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8">
            <Button variant="outline" className="px-16 py-6 border-white/20 text-white hover:bg-white hover:text-[#1F1F1F] transition-all duration-700" onClick={() => scrollToSection('contact')}>
              {t.hero.cta1}
            </Button>
            <Button variant="minimal" className="border-transparent opacity-40 hover:opacity-100 px-12" onClick={() => scrollToSection('samples')}>
              {t.hero.cta2}
            </Button>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-10">
          <div className="w-px h-16 bg-white"></div>
        </div>
      </section>

      {/* Vision/About Section */}
      <section id="about" className="py-40 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-12 text-[#7D6B5D] leading-tight">{t.about.h2}</h2>
          <p className="text-xl text-slate-700 leading-relaxed font-light mb-24 max-w-2xl mx-auto italic opacity-80">{t.about.p}</p>
          <div className="grid md:grid-cols-2 gap-20 text-left">
            <div className="border-t border-[#EAE4DD] pt-12 group">
                <h4 className="font-serif text-2xl mb-6 text-[#7D6B5D] group-hover:text-black transition-colors">{t.about.b1_h}</h4>
                <p className="text-slate-600 leading-relaxed text-sm font-light">{t.about.b1_p}</p>
            </div>
            <div className="border-t border-[#EAE4DD] pt-12 group">
                <h4 className="font-serif text-2xl mb-6 text-[#7D6B5D] group-hover:text-black transition-colors">{t.about.b2_h}</h4>
                <p className="text-slate-600 leading-relaxed text-sm font-light">{t.about.b2_p}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section id="samples" className="py-40 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-28">
          <h2 className="text-4xl md:text-5xl font-serif mb-6 text-[#7D6B5D]">{t.samples.h2}</h2>
          <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">{t.samples.sub}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-16">
          {(t.samples.items as any[]).map((item, idx) => (
            <div key={idx} onClick={() => setActiveVideo(item.videoUrl)} className="group cursor-pointer">
              <div className="aspect-[4/5] relative overflow-hidden bg-[#1F1F1F] mb-10 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 shadow-sm group-hover:shadow-2xl">
                <img src={item.cover} alt={item.t} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-black/20">
                  <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
              <div className="text-center px-6">
                <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#7D6B5D] mb-4 block opacity-60">{item.tag}</span>
                <h3 className="text-2xl font-serif mb-4 text-slate-800 tracking-tight">{item.t}</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-light line-clamp-2 max-w-xs mx-auto">
                  {item.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-xl animate-in fade-in duration-700" onClick={() => setActiveVideo(null)}>
          <button className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors" onClick={() => setActiveVideo(null)}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <div className="relative w-full max-w-6xl aspect-video bg-black shadow-2xl" onClick={e => e.stopPropagation()}>
            <iframe src={`${activeVideo}?autoplay=1`} className="w-full h-full" frameBorder="0" allow="autoplay; fullscreen" allowFullScreen></iframe>
          </div>
        </div>
      )}

      {/* Method Section */}
      <section id="process" className="py-40 px-6 bg-[#1F1F1F] text-[#F6F2EC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
            <h2 className="text-4xl md:text-5xl font-serif mb-6 font-light">{t.process.h2}</h2>
            <p className="text-white/20 uppercase tracking-[0.4em] text-[10px] font-bold">{t.process.sub}</p>
          </div>
          <div className="grid md:grid-cols-4 gap-12">
            {t.process.steps.map((step, idx) => (
              <div key={idx} className="group border-t border-white/10 pt-12">
                <div className="text-3xl font-serif text-white/5 mb-8 group-hover:text-white/20 transition-colors">0{idx+1}</div>
                <h3 className="text-lg font-bold mb-6 tracking-widest uppercase text-[11px]">{step.t}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-light">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligence Assistant Section */}
      <section className="py-40 px-6 bg-white relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-serif mb-10 text-[#7D6B5D] leading-tight font-light">{t.assistant.h2}</h2>
            <p className="text-[#7D6B5D]/40 text-[9px] font-bold tracking-[0.4em] uppercase mb-16">{t.assistant.p}</p>
            
            <div className="border border-[#EAE4DD] p-12 md:p-24 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7D6B5D]/20 to-transparent"></div>
              <textarea 
                className="w-full bg-transparent border-b border-slate-100 focus:border-[#7D6B5D] outline-none py-10 text-2xl font-serif placeholder:text-slate-200 mb-12 transition-all resize-none text-center"
                placeholder={t.assistant.placeholder}
                rows={2}
                value={storyInput}
                onChange={(e) => setStoryInput(e.target.value)}
              />
              <div className="flex justify-center">
                <Button variant="outline" onClick={handleGenerateStory} loading={isGenerating} className="px-20 border-[#EAE4DD] text-slate-400 hover:text-[#7D6B5D] hover:border-[#7D6B5D]">
                  {t.assistant.btn}
                </Button>
              </div>

              {storyOutput && (
                <div className="mt-24 text-left border-t border-slate-50 pt-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <h4 className="font-bold text-[9px] tracking-[0.4em] uppercase mb-12 opacity-30 text-center text-[#7D6B5D]">{t.assistant.draft_label}</h4>
                  <div className="prose prose-stone max-w-2xl mx-auto leading-loose font-serif italic text-xl text-slate-600 opacity-90 text-center">
                    {storyOutput}
                  </div>
                  <div className="mt-20 flex flex-col items-center gap-6">
                    <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">{t.assistant.cta_sub}</p>
                    <Button variant="primary" className="px-16" onClick={() => scrollToSection('contact')}>
                      {t.assistant.cta_btn}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-8 text-[8px] uppercase tracking-[0.3em] text-slate-200 font-bold">{t.assistant.disclaimer}</p>
          </div>
        </div>
      </section>

      {/* Occasions Section */}
      <section id="occasions" className="py-40 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-serif mb-16 text-[#7D6B5D] tracking-tight">{t.occasions.h2}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-y-24 gap-x-16">
          {t.occasions.items.map((item, idx) => (
            <div key={idx} className="group border-l border-slate-100 pl-10 hover:border-[#7D6B5D] transition-colors duration-700">
              <h3 className="text-xl font-serif mb-6 text-slate-800 group-hover:text-[#7D6B5D] transition-colors">{item.t}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Section Placeholder */}
      <section id="privacy" className="py-40 px-6 bg-[#FCFBF8] text-center border-t border-[#EAE4DD]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif mb-10 text-[#7D6B5D] tracking-widest uppercase text-sm font-bold">{t.privacy.h2}</h2>
          <p className="text-2xl text-slate-400 leading-relaxed font-serif italic opacity-70">
            {t.privacy.p}
          </p>
        </div>
      </section>

      {/* Terms Section Placeholder */}
      <section id="terms" className="py-40 px-6 bg-white text-center border-t border-[#EAE4DD]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif mb-10 text-[#7D6B5D] tracking-widest uppercase text-sm font-bold">Terms of Service</h2>
          <p className="text-2xl text-slate-400 leading-relaxed font-serif italic opacity-70">
            {lang === 'en' ? 'Our terms of service protect your legacy and our production integrity.' : 'Unsere Nutzungsbedingungen schützen Ihr Erbe und unsere Produktionsintegrität.'}
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" ref={formRef} className="py-40 px-6 max-w-5xl mx-auto">
        {formStatus === FormStatus.SUCCESS ? (
          <div className="text-center py-32 animate-in zoom-in duration-1000">
             <h2 className="text-5xl font-serif mb-10 text-[#7D6B5D] tracking-tight">{t.form.success_h}</h2>
             <p className="text-xl text-slate-400 font-light max-w-lg mx-auto leading-relaxed italic">{t.form.success_p}</p>
             <Button className="mt-20 border-slate-200" variant="outline" onClick={() => setFormStatus(FormStatus.IDLE)}>Return to Site</Button>
          </div>
        ) : (
          <div className="bg-white border border-[#EAE4DD] p-12 md:p-32 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.08)]">
            <div className="text-center mb-28">
              <h2 className="text-5xl font-serif mb-10 text-[#7D6B5D] tracking-tight">{t.form.h2}</h2>
              <p className="text-slate-300 font-light text-xl max-w-xl mx-auto leading-relaxed">{t.form.p}</p>
            </div>
            
            <form onSubmit={handleSubmitInquiry} className="space-y-20">
              <div style={{ position: 'absolute', opacity: 0, zIndex: -1, pointerEvents: 'none' }} aria-hidden="true">
                <input type="text" name="bot_field" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
              </div>

              <div className="grid md:grid-cols-2 gap-20">
                <div className="space-y-6">
                  <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400 opacity-60">{t.form.name}</label>
                  <input required name="name" type="text" className="w-full bg-transparent border-b border-slate-100 py-6 focus:border-[#7D6B5D] outline-none transition-all placeholder:text-slate-200 text-lg font-serif" placeholder="Full Name" onChange={e => setInquiry({...inquiry, name: e.target.value})} />
                </div>
                <div className="space-y-6">
                  <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400 opacity-60">{t.form.email}</label>
                  <input required name="email" type="email" className="w-full bg-transparent border-b border-slate-100 py-6 focus:border-[#7D6B5D] outline-none transition-all placeholder:text-slate-200 text-lg font-serif" placeholder="email@address.com" onChange={e => setInquiry({...inquiry, email: e.target.value})} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-20">
                <div className="space-y-6">
                  <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400 opacity-60">{t.form.occ_label}</label>
                  <select name="occasion" className="w-full bg-transparent border-b border-slate-100 py-6 focus:border-[#7D6B5D] outline-none transition-all appearance-none cursor-pointer font-serif text-lg" value={inquiry.occasion} onChange={e => setInquiry({...inquiry, occasion: e.target.value})}>
                    {t.form.occ_options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-6">
                  <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400 opacity-60">{t.form.photos_label}</label>
                  <select name="photo_estimate" className="w-full bg-transparent border-b border-slate-100 py-6 focus:border-[#7D6B5D] outline-none transition-all appearance-none cursor-pointer font-serif text-lg" value={inquiry.photoEstimate} onChange={e => setInquiry({...inquiry, photoEstimate: e.target.value})}>
                    {t.form.photos_options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <label className="block text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400 opacity-60">{t.form.story_label}</label>
                <textarea required name="story" rows={4} className="w-full bg-transparent border-b border-slate-100 py-6 focus:border-[#7D6B5D] outline-none transition-all resize-none placeholder:text-slate-200 font-serif text-xl" placeholder={t.form.story_hint} onChange={e => setInquiry({...inquiry, story: e.target.value})} />
              </div>

              <div className="pt-16 flex flex-col items-center">
                <Button type="submit" className="w-full md:w-auto md:px-32 py-10 shadow-[0_30px_60px_-10px_rgba(125,107,93,0.3)]" loading={formStatus === FormStatus.SUBMITTING}>
                  {t.form.btn}
                </Button>
                {errorMessage && <p className="mt-12 text-red-600 text-[9px] font-bold tracking-[0.3em] uppercase animate-pulse">{errorMessage}</p>}
                <div className="mt-20 flex items-center gap-6 opacity-20">
                  <div className="w-8 h-px bg-slate-400"></div>
                  <p className="text-[8px] uppercase tracking-[0.5em] font-bold text-slate-400">Exclusive Heritage Services</p>
                  <div className="w-8 h-px bg-slate-400"></div>
                </div>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section id="faq" className="py-40 px-6 bg-[#FCFBF8]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif mb-24 text-center text-slate-400 tracking-widest uppercase text-sm font-bold">{t.faq.h2}</h2>
          <div className="grid md:grid-cols-2 gap-x-24 gap-y-16">
            {t.faq.items.map((item, idx) => (
              <div key={idx} className="group">
                <h4 className="text-xl font-serif mb-6 text-[#7D6B5D] opacity-80 group-hover:opacity-100 transition-opacity">{item.q}</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-light">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1F1F1F] text-[#F6F2EC] py-40 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-24 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <Logo variant="wordmark" color="#F6F2EC" className="h-28 opacity-60 hover:opacity-100 transition-opacity duration-1000 cursor-pointer" onClick={() => scrollToSection('top')} />
          
          <div className="flex flex-wrap justify-center gap-x-20 gap-y-10 text-[9px] font-bold uppercase tracking-[0.4em] opacity-30">
            <button onClick={() => scrollToSection('top')} className="hover:text-white transition-colors">Home</button>
            <button onClick={() => scrollToSection('privacy')} className="hover:text-white transition-colors">Privacy</button>
            <button onClick={() => scrollToSection('terms')} className="hover:text-white transition-colors">Terms</button>
            <button onClick={() => scrollToSection('samples')} className="hover:text-white transition-colors">Portfolio</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contact</button>
          </div>
          
          <div className="text-[9px] text-white/10 uppercase tracking-[0.4em] font-medium text-center max-w-lg leading-loose">
            © 2024 {BRAND_NAME} Legacy Productions · {lang === 'en' ? 'Curated in' : 'Kuratiert in'} New York & Hamburg · All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
