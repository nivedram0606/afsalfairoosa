/* ==========================================================================
   Afsal & Fairoosa Wedding Invitation Interactive Script
   Studio Ghibli Particle System, Web Audio Melody, and Interactive Lanterns
   ========================================================================== */

let canvas, ctx;
let lanterns = [];
let stars = [];
let petals = [];
let sparkles = [];
let lanternCount = 0;

// YouTube Background Music
let ytPlayer = null;
let isMusicPlaying = false;
let autoplayAttempted = false;
let playOnReady = false;

// Load YouTube IFrame API
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
if (firstScriptTag) {
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
} else {
  document.head.appendChild(tag);
}

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('youtubeAudio', {
    height: '0',
    width: '0',
    videoId: 'ta-W16uw7zg',
    playerVars: {
      'autoplay': 1,
      'controls': 0,
      'showinfo': 0,
      'modestbranding': 1,
      'loop': 1,
      'playlist': 'ta-W16uw7zg'
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  if (playOnReady) {
    startGhibliMusic();
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    executeMusicStart();
  } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
    executeMusicStop();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupEntranceCover();
  initGhibliCanvas();
  initCountdown();
  initRevealOnScroll();
  setupPointerEvents();
});

function setupEntranceCover() {
  const getInBtn = document.getElementById('getInBtn');
  const entranceCover = document.getElementById('entranceCover');

  if (getInBtn && entranceCover) {
    getInBtn.addEventListener('click', () => {
      entranceCover.classList.add('fade-out');
      setTimeout(() => {
        entranceCover.style.display = 'none';
      }, 800);

      if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
        startGhibliMusic();
      } else {
        playOnReady = true;
      }
    });
  }
}

/* ==========================================================================
   1. Ghibli Canvas Particle System (Lanterns, Stars, Petals, Sparkles)
   ========================================================================== */
function initGhibliCanvas() {
  canvas = document.getElementById('ghibliCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize Stars
  for (let i = 0; i < 50; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005
    });
  }

  // Initialize Ambient Floating Sky Lanterns
  for (let i = 0; i < 18; i++) {
    lanterns.push(createLantern(Math.random() * canvas.width, Math.random() * canvas.height + canvas.height));
  }

  // Initialize Floating Petals
  for (let i = 0; i < 20; i++) {
    petals.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 5 + 3,
      speedY: Math.random() * 0.6 + 0.3,
      speedX: Math.random() * 0.4 - 0.2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: Math.random() * 0.02 - 0.01,
      color: Math.random() > 0.5 ? 'rgba(212, 175, 55, ' : 'rgba(243, 226, 196, '
    });
  }

  requestAnimationFrame(animateCanvas);
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createLantern(x, y, text = '', color = '#E9CE8F') {
  return {
    x: x,
    y: y,
    width: Math.random() * 14 + 18,
    height: Math.random() * 18 + 24,
    speedY: Math.random() * 0.7 + 0.4,
    swayAmp: Math.random() * 1.5 + 0.5,
    swayFreq: Math.random() * 0.03 + 0.01,
    phase: Math.random() * Math.PI * 2,
    alpha: Math.random() * 0.4 + 0.6,
    text: text,
    color: color
  };
}

function animateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Render & Animate Stars
  for (let s of stars) {
    s.alpha += Math.sin(Date.now() * s.speed) * 0.01;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, s.alpha))})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Render & Animate Floating Sky Lanterns
  for (let i = 0; i < lanterns.length; i++) {
    let l = lanterns[i];
    l.y -= l.speedY;
    l.x += Math.sin(l.phase) * l.swayAmp * 0.5;
    l.phase += l.swayFreq;

    if (l.y < -60) {
      if (l.text) {
        lanterns.splice(i, 1);
        i--;
        continue;
      } else {
        l.y = canvas.height + 40;
        l.x = Math.random() * canvas.width;
      }
    }

    // Glow Effect
    let glowGradient = ctx.createRadialGradient(l.x, l.y, 2, l.x, l.y, l.width * 1.8);
    glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
    glowGradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.2)');
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.width * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Lantern Body
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.fillStyle = l.color || '#F3E2C4';
    ctx.beginPath();
    ctx.roundRect(-l.width / 2, -l.height / 2, l.width, l.height, 4);
    ctx.fill();

    // Inner Flame
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.arc(0, l.height / 4, l.width / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 3. Render & Animate Floating Petals
  for (let p of petals) {
    p.y += p.speedY;
    p.x += p.speedX + Math.sin(p.y * 0.01) * 0.5;
    p.rotation += p.rotSpeed;

    if (p.y > canvas.height + 20) {
      p.y = -20;
      p.x = Math.random() * canvas.width;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color + '0.7)';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4. Render Pointer Sparkles
  for (let i = 0; i < sparkles.length; i++) {
    let sp = sparkles[i];
    sp.x += sp.vx;
    sp.y += sp.vy;
    sp.life -= 0.025;

    if (sp.life <= 0) {
      sparkles.splice(i, 1);
      i--;
      continue;
    }

    ctx.fillStyle = `rgba(255, 223, 100, ${sp.life})`;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(animateCanvas);
}

/* Mouse/Touch Sparkle Trail */
function setupPointerEvents() {
  const addSparkle = (x, y) => {
    for (let i = 0; i < 2; i++) {
      sparkles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 2,
        life: 1.0
      });
    }
  };

  window.addEventListener('mousemove', (e) => {
    if (Math.random() < 0.4) addSparkle(e.clientX, e.clientY);
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      addSparkle(e.touches[0].clientX, e.touches[0].clientY);
    }
  });
}

/* ==========================================================================
   2. High-Visibility Interactive Dua & Floating Sky Lantern Release
   ========================================================================== */
function releaseLantern(blessingText, color = '#E9CE8F') {
  lanternCount++;
  const countEl = document.getElementById('lanternCount');
  if (countEl) countEl.textContent = lanternCount;

  // 1. Create DOM Floating Lantern Element with Wish Badge (Z-Index 950)
  const overlay = document.getElementById('floatingWishesOverlay');
  if (overlay) {
    const lanternEl = document.createElement('div');
    lanternEl.className = 'floating-dua-lantern';

    // Random horizontal position across screen (15% to 75%)
    const startX = Math.floor(Math.random() * 60) + 15;
    lanternEl.style.left = startX + '%';

    lanternEl.innerHTML = `
      <div class="dua-wish-badge">${blessingText}</div>
      <div class="dua-lantern-body"></div>
    `;

    overlay.appendChild(lanternEl);

    // Remove element after animation completes (6.5s)
    setTimeout(() => {
      if (lanternEl && lanternEl.parentNode) {
        lanternEl.parentNode.removeChild(lanternEl);
      }
    }, 6500);
  }

  // 2. Particle explosion at screen center
  const startXPos = Math.random() * (canvas.width * 0.6) + canvas.width * 0.2;
  for (let i = 0; i < 35; i++) {
    sparkles.push({
      x: startXPos,
      y: canvas.height - 100,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 3,
      size: Math.random() * 6 + 3,
      life: 1.2
    });
  }

  // 3. Play chime note
  playChimeNote(660);
}

function triggerSparkleExplosion(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  for (let i = 0; i < 40; i++) {
    sparkles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      size: Math.random() * 6 + 2,
      life: 1.0
    });
  }

  // Spawns a floating wish badge when tapping the couple illustration
  releaseLantern('✨ Dua & Love for Afsal & Fairoosa', '#FFD54F');
}

/* ==========================================================================
   3. YouTube Background Music
   ========================================================================== */
function startGhibliMusic() {
  if (isMusicPlaying) return;

  if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
    ytPlayer.playVideo();
    autoplayAttempted = true;
  }
}

function executeMusicStart() {
  isMusicPlaying = true;
  autoplayAttempted = true;

  const btn = document.getElementById('musicToggleBtn');
  const text = document.getElementById('musicText');

  if (btn) btn.classList.add('playing');
  if (text) text.textContent = 'Playing';
}

function stopGhibliMusic() {
  if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
    ytPlayer.pauseVideo();
  }
}

function executeMusicStop() {
  isMusicPlaying = false;

  const btn = document.getElementById('musicToggleBtn');
  const text = document.getElementById('musicText');

  if (btn) btn.classList.remove('playing');
  if (text) text.textContent = 'Play';
}

function toggleGhibliMusic() {
  if (isMusicPlaying) {
    stopGhibliMusic();
  } else {
    startGhibliMusic();
  }
}

function playChimeNote(freq) {
  // Removed synth chime to avoid interfering with YouTube audio
}

/* ==========================================================================
   4. Countdown Timer
   ========================================================================== */
function initCountdown() {
  const targetDate = new Date('2026-08-22T12:00:00+05:30').getTime();

  const daysEl = document.getElementById('cdDays');
  const hoursEl = document.getElementById('cdHours');
  const minsEl = document.getElementById('cdMins');

  if (!daysEl || !hoursEl || !minsEl) return;

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   5. Scroll Navigation Helpers
   ========================================================================== */
function scrollToBlessings() {
  const card2 = document.getElementById('card2');
  if (card2) card2.scrollIntoView({ behavior: 'smooth' });
}

function scrollToDetails() {
  const card3 = document.getElementById('card3');
  if (card3) card3.scrollIntoView({ behavior: 'smooth' });
}

/* ==========================================================================
   6. Intersection Observer for Reveal Animations
   ========================================================================== */
function initRevealOnScroll() {
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   7. Wedding Card Modal Controls
   ========================================================================== */
function openWeddingCard() {
  const modal = document.getElementById('cardModal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
}

function closeWeddingCard() {
  const modal = document.getElementById('cardModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeWeddingCard();
});

const cardModal = document.getElementById('cardModal');
if (cardModal) {
  cardModal.addEventListener('click', (e) => {
    if (e.target === cardModal) closeWeddingCard();
  });
}

/* ==========================================================================
   8. RSVP Modal Controls
   ========================================================================== */
function openRsvpModal() {
  const modal = document.getElementById('rsvpModal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeRsvpModal() {
  const modal = document.getElementById('rsvpModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function toggleGuestSelect() {
  const guestGroup = document.getElementById('guestsGroup');
  const attendingYes = document.querySelector('input[name="attending"][value="yes"]');
  
  if (attendingYes && guestGroup) {
    if (attendingYes.checked) {
      guestGroup.style.display = 'flex';
    } else {
      guestGroup.style.display = 'none';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init("whX5boUt_LLwhjM_8");
  }

  // RSVP Form Submission Handler
  const rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = rsvpForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending...';
      submitBtn.disabled = true;

      const formData = new FormData(rsvpForm);
      const name = formData.get('fullName');
      const attending = formData.get('attending');
      
      // Prepare the parameters to send to EmailJS
      const templateParams = {
        to_name: 'Afsal & Fairoosa',
        from_name: name,
        phone: formData.get('phone') || 'Not provided',
        attending: attending === 'yes' ? 'Joyfully Accept' : 'Regretfully Decline',
        guests: attending === 'yes' ? formData.get('guests') : '0',
        message: formData.get('message') || 'No message provided'
      };

      // EmailJS Service ID
      const SERVICE_ID = "service_s920cha";
      const TEMPLATE_ID = "template_j4bobwn";

      if (typeof emailjs !== 'undefined' && SERVICE_ID !== "YOUR_SERVICE_ID") {
        emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
          .then((response) => {
            console.log('SUCCESS!', response.status, response.text);
            showSuccessAlert(name, attending);
          }, (err) => {
            console.log('FAILED...', err);
            alert('Oops! Something went wrong while sending your RSVP. Please try again later.');
          })
          .finally(() => {
            resetForm();
          });
      } else {
        // Fallback for testing before you enter your keys
        console.warn("EmailJS keys not configured. Simulating success.");
        setTimeout(() => {
          showSuccessAlert(name, attending);
          resetForm();
        }, 1000);
      }

      function showSuccessAlert(guestName, isAttending) {
        let alertMessage = `Thank you, ${guestName}! Your RSVP has been confirmed.`;
        if (isAttending === 'no') {
          alertMessage = `Thank you, ${guestName}. We'll miss you at the wedding!`;
        }
        alert(alertMessage);
      }

      function resetForm() {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        rsvpForm.reset();
        toggleGuestSelect(); // Reset guest select visibility
        closeRsvpModal();
      }
    });
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeWeddingCard();
    closeRsvpModal();
    // Close any open info modals
    document.querySelectorAll('.info-modal.open').forEach(modal => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    });
    if (!document.querySelector('.rsvp-modal.open')) {
      document.body.style.overflow = '';
    }
  }
});

/* ==========================================================================
   9. Info Modals (Privacy, Contact, Registry)
   ========================================================================== */
function openInfoModal(modalId, event) {
  if (event) {
    event.preventDefault();
  }
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeInfoModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    // Only restore scroll if no other modals are open
    if (!document.querySelector('.rsvp-modal.open')) {
      document.body.style.overflow = '';
    }
  }
}
