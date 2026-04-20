'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ── Intersection observer reveal hook ── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Animated counter ── */
function Counter({ to, suffix = '', duration = 1500 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const { ref, visible } = useReveal();
  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Particle canvas ── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    const colors = ['#f97316','#ec4899','#8b5cf6','#06b6d4','#10b981','#3b82f6'];
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.1,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      // draw connections
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].color;
            ctx.globalAlpha = (1 - dist / 120) * 0.12;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', opacity:0.6 }} />;
}

/* ── Data ── */
const MARQUEE = ['✦ AI-Powered Analytics','✦ Syllabus Grounding','✦ Real-Time Progress','✦ Secure & Private','✦ Student Portals','✦ Teacher Tools','✦ Parent Insights','✦ Smart Report Cards','✦ Class-Only Chat','✦ Unique Student IDs','✦ PDF Report Cards','✦ Role-Based Access'];

const PORTALS = [
  { emoji:'🎓', role:'Student', tagline:'Learn smarter every day.', desc:'AI-guided chat grounded in your syllabus, live progress tracking, and personalised learning paths — all within your class boundary.', grad:'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)', border:'rgba(236,72,153,.35)', glow:'rgba(236,72,153,.4)', tag:'For Learners', delay:'0s' },
  { emoji:'📋', role:'Teacher', tagline:'Teach with full power.', desc:'Generate unique student IDs, upload unit marks, manage enrollments, and get AI-generated class performance summaries instantly.', grad:'linear-gradient(135deg,#06b6d4,#3b82f6,#8b5cf6)', border:'rgba(99,102,241,.35)', glow:'rgba(99,102,241,.4)', tag:'For Educators', delay:'.15s' },
  { emoji:'👨‍👩‍👧', role:'Parent', tagline:'Stay always connected.', desc:"Monitor your child's growth in real-time, download AI-generated report cards as PDFs, and stay informed about every milestone.", grad:'linear-gradient(135deg,#10b981,#06b6d4,#3b82f6)', border:'rgba(20,184,166,.35)', glow:'rgba(20,184,166,.4)', tag:'For Families', delay:'.3s' },
];

const FEATURES = [
  { icon:'🤖', title:'AI Chat Engine', desc:'Contextual, syllabus-grounded AI — never off-topic, always relevant.', color:'#ec4899' },
  { icon:'📊', title:'Live Progress Graphs', desc:'Recharts-powered visual analytics updated in real time per student.', color:'#3b82f6' },
  { icon:'🔐', title:'Role-Based Access', desc:'Students, teachers, parents each see only what they need.', color:'#8b5cf6' },
  { icon:'🪪', title:'Unique Student IDs', desc:'Auto-generated IDs for every student, managed by teachers.', color:'#f97316' },
  { icon:'📄', title:'AI Report Cards', desc:'One-click PDF generation with AI-written performance summaries.', color:'#10b981' },
  { icon:'⚡', title:'Instant Enrollment', desc:'Teachers approve students in seconds with a clean dashboard.', color:'#06b6d4' },
];

const STATS = [
  { value:99, suffix:'%', label:'Uptime SLA', grad:'linear-gradient(135deg,#f97316,#ec4899)' },
  { value:3,  suffix:'',  label:'Role Portals', grad:'linear-gradient(135deg,#06b6d4,#3b82f6)' },
  { value:100,suffix:'%', label:'Privacy First', grad:'linear-gradient(135deg,#8b5cf6,#ec4899)' },
  { value:24, suffix:'/7',label:'AI Available', grad:'linear-gradient(135deg,#10b981,#06b6d4)' },
];

/* ── Main component ── */
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [navSolid, setNavSolid] = useState(false);
  const [activePortal, setActivePortal] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => { setScrollY(window.scrollY); setNavSolid(window.scrollY > 50); };
    const onMouse = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouse, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse); };
  }, []);

  const heroReveal   = useReveal(0.05);
  const statsReveal  = useReveal();
  const portReveal   = useReveal();
  const featReveal   = useReveal();
  const ctaReveal    = useReveal();

  const parallax = (factor: number) => ({ transform: `translateY(${scrollY * factor}px)` });

  return (
    <div style={{ minHeight:'100vh', background:'#05010f', color:'#fff', overflowX:'hidden', fontFamily:"'Space Grotesk',sans-serif" }}>
      <ParticleCanvas />

      {/* ── Mouse glow ── */}
      <div style={{
        position:'fixed', zIndex:1, pointerEvents:'none', borderRadius:'50%',
        width:500, height:500,
        background:'radial-gradient(circle,rgba(139,92,246,.15) 0%,transparent 70%)',
        transform:`translate(${mouse.x-250}px,${mouse.y-250}px)`,
        transition:'transform 80ms linear',
      }} />

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        padding:'0 24px',
        background: navSolid ? 'rgba(5,1,15,.85)' : 'transparent',
        backdropFilter: navSolid ? 'blur(24px)' : 'none',
        borderBottom: navSolid ? '1px solid rgba(255,255,255,.06)' : 'none',
        transition:'all .4s ease',
      }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:72 }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ position:'relative', width:40, height:40 }}>
              <div className="anim-spin-slow" style={{ position:'absolute', inset:0, borderRadius:12, background:'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)' }} />
              <div style={{ position:'absolute', inset:2, borderRadius:10, background:'#05010f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:'#fff' }}>N</div>
            </div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, letterSpacing:'-0.02em' }}>
              Nexus <span className="grad-text-1">Ed</span>
            </span>
          </div>
          {/* Nav links */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Link href="/login" style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:500, color:'rgba(255,255,255,.6)', padding:'8px 16px', borderRadius:99, textDecoration:'none', transition:'color .2s' }}
              onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
              onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,.6)')}>
              Sign In
            </Link>
            <Link href="/register" style={{ position:'relative', fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, letterSpacing:'.04em', padding:'10px 24px', borderRadius:99, textDecoration:'none', color:'#fff', background:'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)', overflow:'hidden', transition:'transform .2s, box-shadow .2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.boxShadow='0 0 30px rgba(236,72,153,.5)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='none'; }}>
              <span className="anim-shimmer" style={{ position:'absolute', inset:0 }} />
              <span style={{ position:'relative' }}>Get Started</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'120px 24px 80px', textAlign:'center', overflow:'hidden' }}>
        {/* Animated gradient orbs */}
        <div className="anim-pulse-glow" style={{ ...parallax(0.3), position:'absolute', top:'15%', left:'10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,.25),transparent 70%)', filter:'blur(40px)', pointerEvents:'none' }} />
        <div className="anim-pulse-glow" style={{ ...parallax(0.2), position:'absolute', bottom:'20%', right:'5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(236,72,153,.2),transparent 70%)', filter:'blur(40px)', pointerEvents:'none', animationDelay:'2s' }} />
        <div className="anim-orb" style={{ position:'absolute', top:'40%', left:'50%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(6,182,212,.15),transparent 70%)', filter:'blur(30px)', pointerEvents:'none' }} />

        {/* Floating shapes */}
        {[
          { top:'12%', left:'8%',  size:60, grad:'linear-gradient(135deg,#f97316,#ec4899)', shape:'12px', delay:'0s' },
          { top:'20%', right:'10%',size:40, grad:'linear-gradient(135deg,#06b6d4,#3b82f6)', shape:'50%',  delay:'1.5s' },
          { top:'60%', left:'5%',  size:50, grad:'linear-gradient(135deg,#8b5cf6,#ec4899)', shape:'8px',  delay:'3s' },
          { top:'70%', right:'8%', size:35, grad:'linear-gradient(135deg,#10b981,#06b6d4)', shape:'50%',  delay:'2s' },
          { top:'35%', left:'3%',  size:25, grad:'linear-gradient(135deg,#fbbf24,#f97316)', shape:'50%',  delay:'4s' },
          { top:'80%', left:'20%', size:45, grad:'linear-gradient(135deg,#ec4899,#8b5cf6)', shape:'10px', delay:'1s' },
        ].map((s, i) => (
          <div key={i} className="anim-float" style={{ position:'absolute', top:s.top, left:(s as any).left, right:(s as any).right, width:s.size, height:s.size, borderRadius:s.shape, background:s.grad, opacity:.25, animationDelay:s.delay, pointerEvents:'none' }} />
        ))}

        {/* Grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)', backgroundSize:'64px 64px', pointerEvents:'none' }} />

        {/* Content */}
        <div ref={heroReveal.ref} style={{ position:'relative', zIndex:2, maxWidth:900, margin:'0 auto' }}>
          <div className={`anim-slide-up ${heroReveal.visible ? '' : 'opacity-0'}`} style={{ opacity: heroReveal.visible ? 1 : 0 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.25em', textTransform:'uppercase', color:'#ec4899', border:'1px solid rgba(236,72,153,.3)', padding:'6px 16px', borderRadius:99, background:'rgba(236,72,153,.08)', marginBottom:32 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#ec4899', display:'inline-block', animation:'pulse-glow 2s ease-in-out infinite' }} />
              AI-Powered School Ecosystem
            </span>
          </div>

          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, lineHeight:1.0, letterSpacing:'-0.04em', marginBottom:24, opacity: heroReveal.visible ? 1 : 0, transition:'opacity .8s .1s, transform .8s .1s', transform: heroReveal.visible ? 'translateY(0)' : 'translateY(50px)' }}>
            <span style={{ display:'block', fontSize:'clamp(52px,9vw,96px)', color:'#fff' }}>Education</span>
            <span style={{ display:'block', fontSize:'clamp(52px,9vw,96px)', fontFamily:"'Playfair Display',serif", fontStyle:'italic', background:'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', backgroundSize:'300% 300%' }} className="anim-gradient">
              Reimagined.
            </span>
          </h1>

          <p style={{ fontSize:'clamp(16px,2vw,20px)', color:'rgba(255,255,255,.5)', maxWidth:640, margin:'0 auto 40px', lineHeight:1.7, opacity: heroReveal.visible ? 1 : 0, transition:'opacity .8s .25s, transform .8s .25s', transform: heroReveal.visible ? 'translateY(0)' : 'translateY(30px)' }}>
            One platform for{' '}
            <span style={{ color:'#ec4899', fontWeight:600 }}>students</span>,{' '}
            <span style={{ color:'#3b82f6', fontWeight:600 }}>teachers</span>, and{' '}
            <span style={{ color:'#10b981', fontWeight:600 }}>parents</span>{' '}
            — grounded in real syllabus data, driven by AI analytics, built with classroom-first privacy.
          </p>

          <div style={{ display:'flex', flexWrap:'wrap', gap:16, justifyContent:'center', opacity: heroReveal.visible ? 1 : 0, transition:'opacity .8s .4s, transform .8s .4s', transform: heroReveal.visible ? 'translateY(0)' : 'translateY(20px)' }}>
            <Link href="/login" style={{ position:'relative', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, letterSpacing:'.05em', padding:'14px 36px', borderRadius:99, textDecoration:'none', color:'#fff', background:'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)', overflow:'hidden', transition:'transform .2s, box-shadow .2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.05) translateY(-2px)'; e.currentTarget.style.boxShadow='0 20px 60px rgba(236,72,153,.4)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1) translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
              <span className="anim-shimmer" style={{ position:'absolute', inset:0 }} />
              <span style={{ position:'relative', display:'flex', alignItems:'center', gap:8 }}>Sign In to Portal <span className="anim-bounce-x" style={{ display:'inline-block' }}>→</span></span>
            </Link>
            <Link href="/register" style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, letterSpacing:'.05em', padding:'14px 36px', borderRadius:99, textDecoration:'none', color:'rgba(255,255,255,.8)', border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.04)', backdropFilter:'blur(10px)', transition:'all .2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,.1)'; e.currentTarget.style.borderColor='rgba(255,255,255,.25)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,.12)'; e.currentTarget.style.color='rgba(255,255,255,.8)'; e.currentTarget.style.transform='translateY(0)'; }}>
              Create Free Account
            </Link>
          </div>

          {/* Scroll indicator */}
          <div style={{ marginTop:80, display:'flex', flexDirection:'column', alignItems:'center', gap:8, opacity:.3 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'.3em', textTransform:'uppercase' }}>Scroll</span>
            <div style={{ width:1, height:48, background:'linear-gradient(to bottom,rgba(255,255,255,.6),transparent)', animation:'pulse-glow 2s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MARQUEE
      ══════════════════════════════════════════ */}
      <div style={{ position:'relative', padding:'18px 0', borderTop:'1px solid rgba(255,255,255,.05)', borderBottom:'1px solid rgba(255,255,255,.05)', background:'rgba(255,255,255,.015)', overflow:'hidden' }}>
        <div className="anim-marquee" style={{ display:'flex', whiteSpace:'nowrap', gap:0 }}>
          {[...MARQUEE,...MARQUEE].map((item,i) => (
            <span key={i} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(255,255,255,.3)', margin:'0 32px' }}>{item}</span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STATS
      ══════════════════════════════════════════ */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'100px 24px' }}>
        <div ref={statsReveal.ref} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, opacity: statsReveal.visible ? 1 : 0, transform: statsReveal.visible ? 'translateY(0)' : 'translateY(40px)', transition:'all .8s cubic-bezier(.16,1,.3,1)' }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ position:'relative', borderRadius:20, border:'1px solid rgba(255,255,255,.06)', background:'rgba(255,255,255,.025)', padding:'32px 24px', textAlign:'center', overflow:'hidden', cursor:'default', transition:'transform .3s, box-shadow .3s', transitionDelay:`${i*80}ms` }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 20px 60px rgba(0,0,0,.4)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ position:'absolute', inset:0, background:s.grad, opacity:0, transition:'opacity .3s', borderRadius:'inherit' }} className="stat-bg" />
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:48, background:s.grad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', lineHeight:1, marginBottom:8 }}>
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(255,255,255,.4)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PORTAL CARDS
      ══════════════════════════════════════════ */}
      <section style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px 120px' }}>
        <div ref={portReveal.ref} style={{ opacity: portReveal.visible ? 1 : 0, transform: portReveal.visible ? 'translateY(0)' : 'translateY(60px)', transition:'all .9s cubic-bezier(.16,1,.3,1)' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.3em', textTransform:'uppercase', color:'#06b6d4', marginBottom:16 }}>Three Portals</p>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(36px,5vw,56px)', letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:16 }}>
              One platform,{' '}
              <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', background:'linear-gradient(135deg,#06b6d4,#3b82f6,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>every role.</span>
            </h2>
            <p style={{ color:'rgba(255,255,255,.4)', maxWidth:480, margin:'0 auto', lineHeight:1.7 }}>Tailored dashboards so everyone gets exactly what they need — nothing more, nothing less.</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24 }}>
            {PORTALS.map((p, i) => (
              <div key={p.role} style={{ position:'relative', borderRadius:28, border:`1px solid ${p.border}`, background:'rgba(255,255,255,.025)', padding:36, overflow:'hidden', cursor:'pointer', transition:'transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s', transitionDelay:p.delay }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-10px) scale(1.01)'; e.currentTarget.style.boxShadow=`0 30px 80px ${p.glow}`; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow='none'; }}>
                {/* Glow bg */}
                <div style={{ position:'absolute', bottom:-40, right:-40, width:200, height:200, borderRadius:'50%', background:p.grad, opacity:.12, filter:'blur(40px)', pointerEvents:'none' }} />
                <div style={{ position:'absolute', inset:0, background:p.grad, opacity:0, transition:'opacity .4s', borderRadius:'inherit' }} />

                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
                    <div style={{ width:60, height:60, borderRadius:18, background:p.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, boxShadow:`0 8px 30px ${p.glow}`, transition:'transform .3s' }}>
                      {p.emoji}
                    </div>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(255,255,255,.3)', border:'1px solid rgba(255,255,255,.1)', padding:'4px 10px', borderRadius:99 }}>{p.tag}</span>
                  </div>
                  <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, marginBottom:4 }}>{p.role}</h3>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:16, background:p.grad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:16 }}>{p.tagline}</p>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', lineHeight:1.7, marginBottom:28 }}>{p.desc}</p>
                  <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, letterSpacing:'.05em', background:p.grad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', textDecoration:'none', transition:'gap .2s' }}
                    onMouseEnter={e=>{ (e.currentTarget.querySelector('span') as HTMLElement).style.transform='translateX(6px)'; }}
                    onMouseLeave={e=>{ (e.currentTarget.querySelector('span') as HTMLElement).style.transform='translateX(0)'; }}>
                    Enter Portal <span style={{ display:'inline-block', transition:'transform .2s' }}>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px 120px' }}>
        <div ref={featReveal.ref} style={{ opacity: featReveal.visible ? 1 : 0, transform: featReveal.visible ? 'translateY(0)' : 'translateY(60px)', transition:'all .9s cubic-bezier(.16,1,.3,1)' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.3em', textTransform:'uppercase', color:'#8b5cf6', marginBottom:16 }}>What&apos;s Inside</p>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(36px,5vw,56px)', letterSpacing:'-0.03em', lineHeight:1.1 }}>
              Built for the{' '}
              <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', background:'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>real classroom.</span>
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{ position:'relative', borderRadius:20, border:'1px solid rgba(255,255,255,.06)', background:'rgba(255,255,255,.02)', padding:28, overflow:'hidden', cursor:'default', transition:'transform .3s, background .3s, border-color .3s', transitionDelay:`${i*60}ms` }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,.12)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.background='rgba(255,255,255,.02)'; e.currentTarget.style.borderColor='rgba(255,255,255,.06)'; }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${f.color},transparent)`, opacity:.6 }} />
                <div style={{ fontSize:32, marginBottom:16, display:'inline-block', transition:'transform .3s' }}>{f.icon}</div>
                <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:f.color, marginBottom:8 }}>{f.title}</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,.45)', lineHeight:1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      <section style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 120px' }}>
        <div ref={ctaReveal.ref} style={{ opacity: ctaReveal.visible ? 1 : 0, transform: ctaReveal.visible ? 'scale(1)' : 'scale(0.92)', transition:'all .9s cubic-bezier(.16,1,.3,1)' }}>
          {/* Animated gradient border wrapper */}
          <div style={{ position:'relative', borderRadius:32, padding:2, overflow:'hidden' }}>
            <div className="anim-spin-slow" style={{ position:'absolute', inset:-2, background:'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6,#06b6d4,#10b981,#f97316)', borderRadius:'inherit', opacity:.8 }} />
            <div style={{ position:'relative', borderRadius:30, background:'#0d0618', padding:'72px 48px', textAlign:'center', overflow:'hidden' }}>
              {/* Inner glow */}
              <div style={{ position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)', width:500, height:300, background:'radial-gradient(ellipse,rgba(139,92,246,.2),transparent 70%)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', bottom:-60, right:'10%', width:300, height:200, background:'radial-gradient(ellipse,rgba(236,72,153,.15),transparent 70%)', pointerEvents:'none' }} />

              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.3em', textTransform:'uppercase', color:'#ec4899', marginBottom:20 }}>Join Today</p>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(36px,6vw,64px)', letterSpacing:'-0.03em', lineHeight:1.05, marginBottom:20 }}>
                Ready to{' '}
                <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', background:'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>transform</span>
                <br />your school?
              </h2>
              <p style={{ color:'rgba(255,255,255,.4)', maxWidth:440, margin:'0 auto 40px', lineHeight:1.7, fontSize:15 }}>
                Students, teachers, and parents — all in one secure, AI-powered space. No setup fees. No complexity.
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:16, justifyContent:'center' }}>
                <Link href="/register" style={{ position:'relative', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, letterSpacing:'.05em', padding:'16px 40px', borderRadius:99, textDecoration:'none', color:'#fff', background:'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)', overflow:'hidden', transition:'transform .2s, box-shadow .2s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.05) translateY(-2px)'; e.currentTarget.style.boxShadow='0 20px 60px rgba(236,72,153,.5)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1) translateY(0)'; e.currentTarget.style.boxShadow='none'; }}>
                  <span className="anim-shimmer" style={{ position:'absolute', inset:0 }} />
                  <span style={{ position:'relative', display:'flex', alignItems:'center', gap:8 }}>Create Free Account <span className="anim-bounce-x" style={{ display:'inline-block' }}>→</span></span>
                </Link>
                <Link href="/login" style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, letterSpacing:'.05em', padding:'16px 40px', borderRadius:99, textDecoration:'none', color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.12)', background:'rgba(255,255,255,.04)', backdropFilter:'blur(10px)', transition:'all .2s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,.1)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.color='rgba(255,255,255,.7)'; e.currentTarget.style.transform='translateY(0)'; }}>
                  Sign In Instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,.05)', padding:'40px 24px', textAlign:'center' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, marginBottom:8 }}>
          Nexus <span className="grad-text-1">Ed</span>
        </div>
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(255,255,255,.2)' }}>
          &copy; 2026 Nexus Ed Platform · Securely deployed via Vercel
        </p>
      </footer>
    </div>
  );
}
