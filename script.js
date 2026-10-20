(() => {
  const $ = s => document.querySelector(s);
  const s1 = $('#screen1'), s2 = $('#screen2'), fx = $('#fx');
  const btn = $('#next'), heading = $('#heading'), replay = $('#replay');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLORS = ['#ff8fc2', '#b98cf0', '#d9c3f7', '#ffffff', '#ff6fae', '#9b66e0'];
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];

  let busy = false, rainTimer = null, timers = [];
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  const clearAll = () => { timers.forEach(clearTimeout); timers = []; };

  /* ---------- Falling confetti ---------- */
  function piece(delay = 0) {
    if (fx.childElementCount > 70) return;
    const el = document.createElement('div');
    const deco = Math.random() < 0.16;
    if (deco) {
      el.className = 'deco';
      el.textContent = pick(['♥', '★', '✦', '♥']);
      el.style.color = pick(COLORS.slice(0, 3).concat('#ff6fae'));
      el.style.fontSize = rand(12, 20) + 'px';
      el.style.left = (Math.random() < 0.5 ? rand(1, 9) : rand(90, 98)) + 'vw';
    } else {
      el.className = 'confetti';
      el.style.width = rand(6, 11) + 'px';
      el.style.height = rand(9, 16) + 'px';
      el.style.background = pick(COLORS);
      el.style.left = rand(0, 100) + 'vw';
    }
    el.style.setProperty('--dx', rand(-60, 60) + 'px');
    el.style.setProperty('--rot', rand(-540, 540) + 'deg');
    el.style.animationDuration = rand(6, 10) + 's';
    el.style.animationDelay = delay + 's';
    el.addEventListener('animationend', () => el.remove());
    fx.appendChild(el);
  }
  function rain(ms) {
    clearInterval(rainTimer);
    if (reduced) return;
    rainTimer = setInterval(piece, ms);
  }

  /* ---------- Button particle burst ---------- */
  function burst(x, y) {
    if (reduced) return;
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = rand(6, 12), star = i % 4 === 0, round = i % 3 === 0;
      p.style.width = p.style.height = size + 'px';
      p.style.background = pick(COLORS.filter(c => c !== '#ffffff').concat('#ffffff'));
      if (star) p.style.clipPath = 'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)';
      else if (round) p.style.borderRadius = '50%';
      else p.style.borderRadius = '2px';
      document.body.appendChild(p);
      const a = rand(0, Math.PI * 2), d = rand(50, 150);
      p.animate([
        { transform: `translate(${x}px,${y}px) scale(.4) rotate(0)`, opacity: 1 },
        { transform: `translate(${x + Math.cos(a) * d}px,${y + Math.sin(a) * d + 20}px) scale(1) rotate(${rand(-360, 360)}deg)`, opacity: 0 }
      ], { duration: rand(700, 1100), easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }).onfinish = () => p.remove();
    }
  }

  /* ---------- Wrap message into words ---------- */
  const words = [];
  document.querySelectorAll('#message p').forEach((p, pi, all) => {
    const tokens = p.textContent.trim().split(/\s+/);
    p.textContent = '';
    tokens.forEach((t, i) => {
      const w = document.createElement('span');
      w.className = 'w';
      if (t.includes('❤')) {
        w.classList.add('hearts');
        (t.match(/❤️?/g) || []).forEach(h => { const s = document.createElement('span'); s.textContent = h; w.appendChild(s); });
      } else w.textContent = t;
      w.dataset.end = i === tokens.length - 1 ? 'p' : /[.!?؟،,]$/.test(t) ? 's' : '';
      p.appendChild(w);
      if (i < tokens.length - 1) p.appendChild(document.createTextNode(' '));
      words.push(w);
    });
  });

  function typeWords(i = 0) {
    const w = words[i];
    if (!w) return finish();
    w.classList.add('show');
    const r = w.getBoundingClientRect();
    if (r.bottom > innerHeight - 20) w.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const delay = 420 + w.textContent.length * 28 + (w.dataset.end === 's' ? 650 : 0) + (w.dataset.end === 'p' ? 950 : 0);
    later(() => typeWords(i + 1), delay);
  }

  function finish() {
    const h = $('.hearts');
    h.classList.add('pop');
    later(() => h.classList.add('beat'), 100);
    later(() => replay.classList.add('on'), 1200);
  }

  /* ---------- Heading: center -> top-right ---------- */
  function headingSequence() {
    heading.style.transition = 'none';
    heading.style.transform = 'none';
    const r = heading.getBoundingClientRect();
    const dx = innerWidth / 2 - (r.left + r.width / 2);
    const dy = innerHeight / 2 - (r.top + r.height / 2);
    const s = Math.min(2.2, (innerWidth * 0.88) / r.width);
    const to = `translate(${dx}px,${dy}px) scale(${s})`;
    if (reduced) { heading.style.opacity = 1; heading.style.transform = 'none'; later(() => typeWords(), 400); return; }
    heading.style.opacity = 0;
    heading.style.transform = `translate(${dx}px,${dy}px) scale(${s * 0.8})`;
    heading.getBoundingClientRect();
    heading.style.transition = 'transform 1.3s cubic-bezier(.2,.8,.2,1), opacity 1.1s ease';
    heading.style.opacity = 1;
    heading.style.transform = to;
    later(() => {
      heading.style.transition = 'transform 1.8s cubic-bezier(.65,0,.35,1)';
      heading.style.transform = 'none';
      later(() => typeWords(), 500);
    }, 5000);
  }

  function showScreen2() {
    s1.classList.remove('show');
    later(() => {
      s1.classList.remove('active');
      s2.classList.add('active');
      scrollTo(0, 0);
      s2.getBoundingClientRect();
      s2.classList.add('show');
      if (!reduced) for (let i = 0; i < 36; i++) piece(rand(0, 1.8));
      rain(450);
      headingSequence();
    }, reduced ? 20 : 650);
  }

  /* ---------- Events ---------- */
  btn.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    const r = btn.getBoundingClientRect();
    if (!reduced) {
      btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(.9)' }, { transform: 'scale(1.1)', opacity: 1 }, { transform: 'scale(.6)', opacity: 0 }],
        { duration: 520, easing: 'ease-out', fill: 'forwards' });
      later(() => burst(r.left + r.width / 2, r.top + r.height / 2), 240);
    }
    later(showScreen2, reduced ? 0 : 420);
  });

  replay.addEventListener('click', () => {
    clearAll();
    replay.classList.remove('on');
    words.forEach(w => w.classList.remove('show'));
    const h = $('.hearts'); h.classList.remove('pop', 'beat');
    heading.style.transition = 'none'; heading.style.transform = 'none'; heading.style.opacity = 0;
    s2.classList.remove('show');
    later(() => {
      s2.classList.remove('active');
      btn.getAnimations().forEach(a => a.cancel());
      s1.classList.add('active');
      scrollTo(0, 0);
      s1.getBoundingClientRect();
      s1.classList.add('show');
      busy = false;
      rain(700);
    }, reduced ? 20 : 700);
  });

  // start
  requestAnimationFrame(() => s1.classList.add('show'));
  rain(700);
})();
