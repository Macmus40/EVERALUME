
import React, { useState, useRef } from 'react';
import { Button } from './components/Button';
import { generateStoryDraft } from './services/geminiService';
import { FormStatus, InquiryData } from './types';
import { translations } from './translations';

const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'de'>('en');
  const t = translations[lang];

  const [inquiry, setInquiry] = useState<Partial<InquiryData>>({
    occasion: t.form.occ_options[0],
    photoEstimate: t.form.photos_options[0],
  });
  const [formStatus, setFormStatus] = useState<FormStatus>(FormStatus.IDLE);
  const [storyInput, setStoryInput] = useState('');
  const [storyOutput, setStoryOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
    setFormStatus(FormStatus.SUBMITTING);

    try {
      const response = await fetch("https://formspree.io/f/macmus40@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          ...inquiry,
          _subject: `New EveraLuma Inquiry: ${inquiry.occasion}`,
          language: lang,
          generatedDraft: storyOutput 
        })
      });

      if (response.ok) {
        setFormStatus(FormStatus.SUCCESS);
      } else {
        setFormStatus(FormStatus.ERROR);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setFormStatus(FormStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-[#EAE4DD] sticky top-0 bg-[#FCFBF8]/80 backdrop-blur-md z-50">
        <div 
          onClick={() => scrollToSection('top')} 
          className="text-2xl font-serif font-bold tracking-tight text-[#7D6B5D] cursor-pointer"
        >
          EveraLuma
        </div>
        
        <div className="hidden md:flex gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <button onClick={() => scrollToSection('about')} className="hover:text-[#7D6B5D] transition-colors uppercase">{t.nav.vision}</button>
          <button onClick={() => scrollToSection('samples')} className="hover:text-[#7D6B5D] transition-colors uppercase">{t.nav.samples}</button>
          <button onClick={() => scrollToSection('process')} className="hover:text-[#7D6B5D] transition-colors uppercase">{t.nav.process}</button>
          <button onClick={() => scrollToSection('occasions')} className="hover:text-[#7D6B5D] transition-colors uppercase">{t.nav.occasions}</button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-[#EAE4DD]/50 p-1 rounded-full border border-[#EAE4DD]">
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'en' ? 'bg-white text-[#7D6B5D] shadow-sm' : 'text-slate-400'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('de')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'de' ? 'bg-white text-[#7D6B5D] shadow-sm' : 'text-slate-400'}`}
            >
              DE
            </button>
          </div>
          <Button variant="outline" className="px-6 py-2 text-[10px] uppercase tracking-widest hidden sm:flex" onClick={() => scrollToSection('contact')}>
            {t.nav.cta}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-28 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="animate-in fade-in slide-in-from-left-8 duration-700">
          <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-8">
            {t.hero.h1.replace(t.hero.h1_alt, '')} <span className="italic underline underline-offset-8 decoration-1">{t.hero.h1_alt}</span>.
          </h1>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-lg font-light">
            {t.hero.p}
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <Button onClick={() => scrollToSection('contact')} className="shadow-2xl">{t.hero.cta1}</Button>
            <Button variant="secondary" onClick={() => scrollToSection('about')}>{t.hero.cta2}</Button>
          </div>
        </div>
        <div className="relative animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="bg-slate-200 aspect-[4/5] rounded-[30px] shadow-2xl overflow-hidden relative group">
             <img 
               src="https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&q=80&w=800" 
               alt="Memories" 
               className="w-full h-full object-cover grayscale-[10%]"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
             <div className="absolute bottom-10 left-10 right-10 text-white">
                <p className="font-serif italic text-xl leading-relaxed">"{t.hero.quote}"</p>
                <p className="text-[10px] mt-4 font-bold tracking-[0.2em] uppercase opacity-80">— {t.hero.author}</p>
             </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-[#EAE4DD]/40 py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif mb-8 text-[#7D6B5D]">{t.about.h2}</h2>
          <p className="text-xl text-slate-700 leading-relaxed font-light mb-16">{t.about.p}</p>
          <div className="grid md:grid-cols-2 gap-12 text-left">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-[#EAE4DD]/50">
                <h4 className="font-serif text-2xl mb-4 text-[#7D6B5D]">{t.about.b1_h}</h4>
                <p className="text-slate-600 leading-relaxed">{t.about.b1_p}</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-[#EAE4DD]/50">
                <h4 className="font-serif text-2xl mb-4 text-[#7D6B5D]">{t.about.b2_h}</h4>
                <p className="text-slate-600 leading-relaxed">{t.about.b2_p}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Samples Showcase Section */}
      <section id="samples" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4 text-[#7D6B5D]">{t.samples.h2}</h2>
          <p className="text-slate-500 font-light text-xl">{t.samples.sub}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {t.samples.items.map((item, idx) => (
            <div key={idx} className="group bg-white rounded-[32px] overflow-hidden border border-[#EAE4DD] shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="aspect-video relative overflow-hidden bg-slate-900 group">
                <img 
                  src={item.cover} 
                  alt={item.t} 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                    <svg className="w-6 h-6 text-white group-hover:text-[#7D6B5D] fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-[#7D6B5D] text-white text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 text-[8px] text-white/60 font-mono">
                  00:30
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-serif mb-3 text-[#7D6B5D]">{item.t}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light">
                  {item.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-serif mb-4">{t.process.h2}</h2>
          <p className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">{t.process.sub}</p>
        </div>
        <div className="grid md:grid-cols-4 gap-12">
          {t.process.steps.map((step, idx) => (
            <div key={idx} className="group">
              <div className="text-6xl font-serif text-[#7D6B5D]/10 mb-6 group-hover:text-[#7D6B5D]/20 transition-colors">0{idx+1}</div>
              <h3 className="text-lg font-bold mb-3">{step.t}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Assistant Section */}
      <section className="bg-[#7D6B5D] text-white py-28 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif mb-8 text-center">{t.assistant.h2}</h2>
          <p className="text-center text-[#EAE4DD] mb-12 text-lg font-light">{t.assistant.p}</p>
          
          <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[40px] border border-white/20">
            <textarea 
              className="w-full bg-transparent border-b border-white/30 focus:border-white outline-none py-6 text-xl placeholder:text-white/30 mb-8 transition-all resize-none"
              placeholder={t.assistant.placeholder}
              rows={3}
              value={storyInput}
              onChange={(e) => setStoryInput(e.target.value)}
            />
            <div className="flex justify-center">
              <Button variant="secondary" onClick={handleGenerateStory} loading={isGenerating} className="px-12 py-5 text-xs uppercase tracking-widest">
                {t.assistant.btn}
              </Button>
            </div>

            {storyOutput && (
              <div className="mt-12 bg-white text-[#7D6B5D] p-10 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-700">
                <h4 className="font-bold text-[10px] tracking-[0.3em] uppercase mb-6 opacity-40">{t.assistant.draft_label}</h4>
                <div className="prose prose-stone leading-relaxed whitespace-pre-wrap font-serif italic text-lg">
                  {storyOutput}
                </div>
                <div className="mt-10 pt-8 border-t border-[#EAE4DD] flex flex-col sm:flex-row justify-between items-center gap-6">
                  <p className="text-xs font-medium text-slate-400">{t.assistant.cta_sub}</p>
                  <Button variant="primary" className="py-3 px-8 text-[10px] uppercase tracking-widest" onClick={() => scrollToSection('contact')}>
                    {t.assistant.cta_btn}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Occasions Section */}
      <section id="occasions" className="py-28 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-serif mb-16 text-center">{t.occasions.h2}</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {t.occasions.items.map((item, idx) => (
            <div key={idx} className="border-l border-[#EAE4DD] pl-8">
              <h3 className="text-lg font-serif mb-3 text-[#7D6B5D] font-bold">{item.t}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" ref={formRef} className="py-28 px-6 max-w-4xl mx-auto bg-white border border-[#EAE4DD] rounded-[40px] my-12 shadow-2xl">
        {formStatus === FormStatus.SUCCESS ? (
          <div className="text-center py-24 animate-in zoom-in duration-500">
             <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 border border-green-100">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
             </div>
             <h2 className="text-5xl font-serif mb-6">{t.form.success_h}</h2>
             <p className="text-xl text-slate-500 font-light max-w-lg mx-auto">{t.form.success_p}</p>
             <Button className="mt-12" variant="outline" onClick={() => setFormStatus(FormStatus.IDLE)}>OK</Button>
          </div>
        ) : (
          <div className="p-8 md:p-16">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-serif mb-6 text-[#7D6B5D]">{t.form.h2}</h2>
              <p className="text-slate-500 font-light text-xl max-w-2xl mx-auto leading-relaxed">{t.form.p}</p>
            </div>
            
            <form onSubmit={handleSubmitInquiry} className="space-y-12">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">{t.form.name}</label>
                  <input required name="name" type="text" className="w-full bg-slate-50 px-6 py-5 rounded-2xl border border-transparent focus:bg-white focus:border-[#7D6B5D] outline-none transition-all shadow-inner" placeholder="E.g. Jane Doe" onChange={e => setInquiry({...inquiry, name: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">{t.form.email}</label>
                  <input required name="email" type="email" className="w-full bg-slate-50 px-6 py-5 rounded-2xl border border-transparent focus:bg-white focus:border-[#7D6B5D] outline-none transition-all shadow-inner" placeholder="jane@example.com" onChange={e => setInquiry({...inquiry, email: e.target.value})} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">{t.form.occ_label}</label>
                  <select name="occasion" className="w-full bg-slate-50 px-6 py-5 rounded-2xl border border-transparent focus:bg-white focus:border-[#7D6B5D] outline-none transition-all appearance-none cursor-pointer shadow-inner" value={inquiry.occasion} onChange={e => setInquiry({...inquiry, occasion: e.target.value})}>
                    {t.form.occ_options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">{t.form.photos_label}</label>
                  <select name="photo_estimate" className="w-full bg-slate-50 px-6 py-5 rounded-2xl border border-transparent focus:bg-white focus:border-[#7D6B5D] outline-none transition-all appearance-none cursor-pointer shadow-inner" value={inquiry.photoEstimate} onChange={e => setInquiry({...inquiry, photoEstimate: e.target.value})}>
                    {t.form.photos_options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">{t.form.story_label}</label>
                <textarea required name="story" rows={5} className="w-full bg-slate-50 px-6 py-5 rounded-2xl border border-transparent focus:bg-white focus:border-[#7D6B5D] outline-none transition-all resize-none shadow-inner" placeholder={t.form.story_hint} onChange={e => setInquiry({...inquiry, story: e.target.value})} />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">{t.form.market_label}</label>
                <input name="emotional_goal" type="text" className="w-full bg-slate-50 px-6 py-5 rounded-2xl border border-transparent focus:bg-white focus:border-[#7D6B5D] outline-none transition-all shadow-inner" placeholder={t.form.market_hint} onChange={e => setInquiry({...inquiry, marketSpecific: e.target.value})} />
              </div>

              <div className="pt-6">
                <Button type="submit" className="w-full py-8 text-sm uppercase tracking-[0.3em] font-bold shadow-xl" loading={formStatus === FormStatus.SUBMITTING}>
                  {t.form.btn}
                </Button>
                {formStatus === FormStatus.ERROR && (
                  <p className="text-red-500 text-xs text-center mt-4">Something went wrong. Please try again or email us directly.</p>
                )}
                <div className="flex items-center justify-center gap-4 mt-8 opacity-40">
                  <div className="h-px w-8 bg-slate-400"></div>
                  <p className="text-[10px] uppercase tracking-widest font-bold">Privacy Guaranteed</p>
                  <div className="h-px w-8 bg-slate-400"></div>
                </div>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-28 px-6 bg-[#FCFBF8]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-serif mb-16 text-center">{t.faq.h2}</h2>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
            {t.faq.items.map((item, idx) => (
              <div key={idx} className="group cursor-default">
                <h4 className="text-lg font-serif mb-3 text-[#7D6B5D] group-hover:text-black transition-colors">{item.q}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FCFBF8] border-t border-[#EAE4DD] py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <div 
              onClick={() => scrollToSection('top')}
              className="text-2xl font-serif font-bold text-[#7D6B5D] mb-4 cursor-pointer"
            >
              EveraLuma
            </div>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              {lang === 'en' ? 'Preserving family stories for future generations through cinematic storytelling.' : 'Bewahrung von Familiengeschichten für zukünftige Generationen durch dokumentarisches Storytelling.'}
            </p>
          </div>
          <div className="flex gap-16">
            <div className="flex flex-col gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <button onClick={() => scrollToSection('top')} className="text-left hover:text-[#7D6B5D]">Privacy Policy</button>
              <button onClick={() => scrollToSection('top')} className="text-left hover:text-[#7D6B5D]">Terms of Service</button>
              <button onClick={() => scrollToSection('faq')} className="text-left hover:text-[#7D6B5D]">FAQ</button>
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">
              © 2024 EveraLuma Legacy Productions.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
