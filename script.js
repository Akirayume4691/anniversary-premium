
/* === INDEPENDENT AUDIO MUTE CONTROL - FINAL VERIFIED === */
(function () {
  let audioMuteLock = false;

  function setAudioIcon(isPlaying) {
    const btn = document.getElementById("audioMuteButton");
    const icon = document.getElementById("audioMuteIcon");
    if (!btn || !icon) return;

    if (isPlaying) {
      icon.textContent = "♫";
      btn.classList.remove("muted");
      btn.setAttribute("aria-label", "Mute music");
    } else {
      icon.textContent = "♪";
      btn.classList.add("muted");
      btn.setAttribute("aria-label", "Play music");
    }
  }

  window.__togglePremiumMusic = function (e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }

    if (audioMuteLock) return false;
    audioMuteLock = true;
    setTimeout(() => { audioMuteLock = false; }, 350);

    const audio = document.getElementById("bgMusic");
    if (!audio) return false;

    if (audio.paused) {
      audio.muted = false;
      audio.volume = audio.volume || 0.75;
      const promise = audio.play();
      setAudioIcon(true);

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          setAudioIcon(false);
        });
      }
    } else {
      audio.pause();
      setAudioIcon(false);
    }

    return false;
  };

  function bindAudioControl() {
    const layer = document.getElementById("audioMuteLayer");
    const btn = document.getElementById("audioMuteButton");
    const audio = document.getElementById("bgMusic");

    if (!layer || !btn || !audio) return;

    btn.onclick = window.__togglePremiumMusic;
    btn.onpointerdown = window.__togglePremiumMusic;
    btn.ontouchstart = window.__togglePremiumMusic;

    layer.onpointerdown = function (e) {
      if (e.target && e.target.closest && e.target.closest("#audioMuteButton")) {
        window.__togglePremiumMusic(e);
      }
    };

    // Capture fallback before page swipe handlers.
    document.addEventListener("pointerdown", function (e) {
      if (e.target && e.target.closest && e.target.closest("#audioMuteLayer")) {
        window.__togglePremiumMusic(e);
      }
    }, true);

    document.addEventListener("touchstart", function (e) {
      if (e.target && e.target.closest && e.target.closest("#audioMuteLayer")) {
        window.__togglePremiumMusic(e);
      }
    }, true);

    audio.addEventListener("play", () => setAudioIcon(true));
    audio.addEventListener("pause", () => setAudioIcon(false));

    setAudioIcon(!audio.paused);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindAudioControl);
  } else {
    bindAudioControl();
  }
})();


const pages = Array.from(document.querySelectorAll(".page"));
const bgMusic = document.getElementById("bgMusic");
const dotsWrap = document.getElementById("dots");

let currentPage = 0;
let musicStarted = false;

if (dotsWrap) {
  pages.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.addEventListener("click", () => showPage(index));
    dotsWrap.appendChild(dot);
  });
}

function prepareMusic() {
  if (!bgMusic || musicStarted) return;
  bgMusic.volume = 0.78;
  bgMusic.play().then(() => {
    musicStarted = true;
  }).catch(() => {});
}

let isSceneChanging = false;

function showPage(index) {
  if (index < 0 || index >= pages.length) return;
  if (index === currentPage && pages[index].classList.contains("active")) return;
  if (isSceneChanging) return;

  isSceneChanging = true;
  const oldPage = pages[currentPage];
  const transition = document.getElementById("sceneTransition");

  document.body.classList.add("transitioning");

  if (oldPage) {
    oldPage.classList.add("is-exiting");
  }

  if (transition) {
    transition.classList.remove("play");
    void transition.offsetWidth;
    transition.classList.add("play");
  }

  setTimeout(() => {
    pages.forEach((page) => {
      page.classList.remove("active", "is-exiting");
    });

    pages[index].classList.add("active");
    currentPage = index;

    if (dotsWrap) {
      Array.from(dotsWrap.children).forEach((dot, i) => {
        dot.classList.toggle("active", i === currentPage);
      });
    }

    const card = pages[index].querySelector(".scene-card");
    if (card) card.scrollTop = 0;

    if (pages[index].id === "heroPage") startPremiumTypingWhenVisible();

    setTimeout(() => {
      document.body.classList.remove("transitioning");
      isSceneChanging = false;
    }, 420);
  }, 300);
}

function startExperience() {
  prepareMusic();
  showPage(1);
}

function nextPage() {
  prepareMusic();
  showPage(Math.min(currentPage + 1, pages.length - 1));
}

function prevPage() {
  prepareMusic();
  showPage(Math.max(currentPage - 1, 0));
}

function replayStory() {
  showPage(0);
}

document.addEventListener("click", prepareMusic, { once: true });

let touchX = 0;
let touchY = 0;

document.addEventListener("touchstart", (e) => {
  if (document.getElementById("photoLightbox").classList.contains("open")) return;
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", (e) => {
  if (e.target.closest("#floatingMemoryStage") || isDraggingFloatingGallery) return;
  if (document.getElementById("photoLightbox").classList.contains("open")) return;

  const diffX = e.changedTouches[0].clientX - touchX;
  const diffY = e.changedTouches[0].clientY - touchY;

  if (Math.abs(diffX) > 70 && Math.abs(diffX) > Math.abs(diffY)) {
    diffX < 0 ? nextPage() : prevPage();
  }

  if (Math.abs(diffY) > 85 && Math.abs(diffY) > Math.abs(diffX)) {
    diffY < 0 ? nextPage() : prevPage();
  }
}, { passive: true });

document.addEventListener("keydown", (e) => {
  const lightbox = document.getElementById("photoLightbox");
  if (lightbox.classList.contains("open")) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") changeLightboxPhoto(-1);
    if (e.key === "ArrowRight") changeLightboxPhoto(1);
    return;
  }

  if (e.key === "ArrowRight" || e.key === "ArrowDown") nextPage();
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevPage();
});

const lights = document.querySelectorAll(".light");
document.addEventListener("pointermove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 32;
  const y = (e.clientY / window.innerHeight - 0.5) * 32;

  lights.forEach((light, index) => {
    const depth = (index + 1) / 2.5;
    light.style.setProperty("--mx", `${x * depth}px`);
    light.style.setProperty("--my", `${y * depth}px`);
  });

  const heroTilt = document.getElementById("heroTilt");
  if (heroTilt && pages[currentPage]?.id === "heroPage") {
    const rect = heroTilt.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const rotateY = ((cx / rect.width) - 0.5) * 16;
    const rotateX = ((cy / rect.height) - 0.5) * -16;
    heroTilt.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  }
});

document.addEventListener("pointerleave", () => {
  const heroTilt = document.getElementById("heroTilt");
  if (heroTilt) heroTilt.style.transform = "rotateX(0) rotateY(0) scale(1)";
});

const premiumTypeText = "A romantic anniversary experience made with soft glow, beautiful memories, music, and a love message that unfolds just for you. 💖";
let premiumTypeIndex = 0;
let premiumTypingStarted = false;

function startPremiumTypingWhenVisible() {
  if (premiumTypingStarted) return;
  premiumTypingStarted = true;
  typePremiumText();
}

function typePremiumText() {
  const typewriter = document.getElementById("typewriter");
  if (!typewriter) return;

  if (premiumTypeIndex < premiumTypeText.length) {
    typewriter.textContent += premiumTypeText.charAt(premiumTypeIndex);
    premiumTypeIndex++;
    setTimeout(typePremiumText, 33);
  }
}

const photos = [
  "images/photo1.jpg",
  "images/photo2.jpg",
  "images/photo3.jpg",
  "images/photo4.jpg",
  "images/photo5.jpg",
  "images/photo6.jpg"
];

const captions = [
  "Memory 01",
  "Memory 02",
  "Memory 03",
  "Memory 04",
  "Memory 05",
  "Memory 06"
];

const orbitCards = Array.from(document.querySelectorAll(".orbit-card"));
const orbitTrack = document.getElementById("orbitTrack");
let galleryIndex = 0;
let galleryDragX = 0;

function updateGallery() {
  orbitCards.forEach((card, index) => {
    let offset = index - galleryIndex;

    if (offset > orbitCards.length / 2) offset -= orbitCards.length;
    if (offset < -orbitCards.length / 2) offset += orbitCards.length;

    const abs = Math.abs(offset);
    const x = offset * 145;
    const y = abs === 0 ? 0 : abs * 9;
    const rotateY = offset * -13;
    const rotateZ = offset * 2.5;
    const scale = 1 - abs * 0.12;
    const opacity = abs > 2 ? 0 : 1 - abs * 0.22;
    const blur = abs > 1 ? 1.5 : 0;

    card.style.transform = `translate3d(${x}px, ${y}px, ${-abs * 105}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
    card.style.zIndex = 100 - abs;
    card.style.opacity = opacity;
    card.style.filter = `blur(${blur}px)`;
  });
}

function moveGallery(step) {
  galleryIndex = (galleryIndex + step + orbitCards.length) % orbitCards.length;
  updateGallery();
}

if (orbitTrack) {
  orbitTrack.addEventListener("pointerdown", (e) => {
    galleryDragX = e.clientX;
    orbitTrack.setPointerCapture(e.pointerId);
  });

  orbitTrack.addEventListener("pointerup", (e) => {
    const diff = e.clientX - galleryDragX;
    if (Math.abs(diff) > 35) {
      diff < 0 ? moveGallery(1) : moveGallery(-1);
    }
  });
}

orbitCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    if (index === galleryIndex) openLightbox(index);
    else {
      galleryIndex = index;
      updateGallery();
    }
  });
});

let currentLightboxIndex = 0;

function openLightbox(index) {
  currentLightboxIndex = (index + photos.length) % photos.length;
  const lightbox = document.getElementById("photoLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const caption = document.getElementById("lightboxCaption");

  lightboxImage.src = photos[currentLightboxIndex];
  caption.textContent = captions[currentLightboxIndex];
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  const lightbox = document.getElementById("photoLightbox");
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}

function changeLightboxPhoto(direction) {
  openLightbox(currentLightboxIndex + direction);
}

document.getElementById("photoLightbox").addEventListener("click", (e) => {
  if (e.target.id === "photoLightbox") closeLightbox();
});

function openLetter() {
  const letter = document.getElementById("letterPaper");
  if (!letter) return;
  letter.classList.toggle("open");
  burstParty(18);
}

function dropConfetti() {
  const colors = ["#ff4fa3", "#ffe7a6", "#7ee7ff", "#ffffff", "#b26cff", "#ff9fd0"];
  for (let i = 0; i < 120; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.8 + "s";
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4200);
  }
  burstParty(38);
}

function burstParty(amount = 18) {
  for (let i = 0; i < amount; i++) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.textContent = i % 2 === 0 ? "✦" : "♡";
    spark.style.left = "50%";
    spark.style.top = "50%";
    spark.style.setProperty("--x", `${(Math.random() - 0.5) * 320}px`);
    spark.style.setProperty("--y", `${(Math.random() - 0.5) * 320}px`);
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 950);
  }
}

/* Code rain background */
const canvas = document.getElementById("codeRain");
const ctx = canvas.getContext("2d");
let columns = [];
const characters = "01HAPPYBIRTHDAY♡✦<>/{}[]SCANSTORY";

function resizeRain() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const fontSize = window.innerWidth < 600 ? 14 : 16;
  const count = Math.floor(window.innerWidth / fontSize);
  columns = Array.from({ length: count }, () => Math.random() * window.innerHeight);
}

function drawRain() {
  const fontSize = window.innerWidth < 600 ? 14 : 16;
  ctx.fillStyle = "rgba(8, 5, 16, 0.13)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.font = `${fontSize}px monospace`;

  for (let i = 0; i < columns.length; i++) {
    const text = characters[Math.floor(Math.random() * characters.length)];
    const x = i * fontSize;
    const y = columns[i] * fontSize;

    ctx.fillStyle = Math.random() > 0.82 ? "rgba(255, 231, 166, .9)" : "rgba(126, 231, 255, .58)";
    ctx.fillText(text, x, y);

    if (y > window.innerHeight && Math.random() > 0.965) {
      columns[i] = 0;
    }
    columns[i] += 0.72;
  }

  requestAnimationFrame(drawRain);
}

window.addEventListener("resize", resizeRain);
resizeRain();
drawRain();
updateGallery();
showPage(0);


/* Disable scrolling because Premium uses arrow/dot navigation only */
window.addEventListener("wheel", (e) => {
  e.preventDefault();
}, { passive: false });

window.addEventListener("touchmove", (e) => {
  if (e.target && e.target.closest && e.target.closest("#audioMuteLayer")) return;
  if (!document.getElementById("photoLightbox")?.classList.contains("open")) {
    e.preventDefault();
  }
}, { passive: false });


/* Fixed box mode: prevent page/card scrolling */
window.addEventListener("wheel", (e) => {
  e.preventDefault();
}, { passive: false });

window.addEventListener("touchmove", (e) => {
  if (e.target && e.target.closest && e.target.closest("#audioMuteLayer")) return;
  if (!document.getElementById("photoLightbox")?.classList.contains("open")) {
    e.preventDefault();
  }
}, { passive: false });


const memoryTitles=[
"Memory 01 • Special Anniversary Moment",
"Memory 02 • Sweet Smile",
"Memory 03 • Beautiful Memory",
"Memory 04 • Happy Day",
"Memory 05 • Precious Scene",
"Memory 06 • Favorite Moment"
];

function updateGalleryCaption(){
const cap=document.getElementById("activeMemoryCaption");
if(cap){
cap.textContent=memoryTitles[galleryIndex];
}
}

const oldMoveGallery=moveGallery;

moveGallery=function(step){
oldMoveGallery(step);
updateGalleryCaption();
}

updateGalleryCaption();

document.querySelectorAll(".timeline-card").forEach((card)=>{
card.addEventListener("pointermove",(e)=>{
const rect=card.getBoundingClientRect();
const x=((e.clientX-rect.left)/rect.width-.5)*10;
const y=((e.clientY-rect.top)/rect.height-.5)*-10;
card.style.transform=`rotateY(${x}deg) rotateX(${y}deg) translateY(-3px)`;
});

card.addEventListener("pointerleave",()=>{
card.style.transform="";
});
});




/* ===== 10/10 GALLERY POLISH ===== */

function updateGallery() {
  orbitCards.forEach((card, index) => {

    let offset = index - galleryIndex;

    if (offset > orbitCards.length / 2) offset -= orbitCards.length;
    if (offset < -orbitCards.length / 2) offset += orbitCards.length;

    const abs = Math.abs(offset);

    const x = offset * 120;
    const z = -abs * 90;
    const scale = 1 - abs * 0.12;
    const rotateY = offset * -10;
    const opacity = abs > 2 ? 0 : 1 - abs * 0.22;
    const blur = abs > 1 ? .8 : 0;

    card.style.transform =
      `translate3d(${x}px,0,${z}px)
       rotateY(${rotateY}deg)
       scale(${scale})`;

    card.style.opacity = opacity;
    card.style.filter = `blur(${blur}px)`;
    card.style.zIndex = 100 - abs;
  });

  updateGalleryCaption?.();
}

orbitTrack?.addEventListener("pointerdown",(e)=>{
  orbitTrack.dataset.startX=e.clientX;
});

orbitTrack?.addEventListener("pointerup",(e)=>{
  const start=parseFloat(orbitTrack.dataset.startX||0);
  const diff=e.clientX-start;

  if(Math.abs(diff)>35){
    diff<0 ? moveGallery(1) : moveGallery(-1);
  }
});





/* === GALLERY ONLY UPGRADE: SMOOTHER ORBIT + ACTIVE EFFECT === */
(function () {
  const track = document.getElementById("orbitTrack");
  const cards = Array.from(document.querySelectorAll(".orbit-card"));
  if (!track || !cards.length) return;

  let activeIndex = 0;
  let startX = 0;
  let dragging = false;
  let dragX = 0;

  const captions = [
    "Memory 01 • Romantic Moment",
    "Memory 02 • Sweet Smile",
    "Memory 03 • Beautiful Memory",
    "Memory 04 • Happy Day",
    "Memory 05 • Precious Scene",
    "Memory 06 • Favorite Moment"
  ];

  function captionEl() {
    return document.getElementById("activeMemoryCaption") || document.getElementById("galleryCaption");
  }

  function updateCaption() {
    const cap = captionEl();
    if (!cap) return;

    cap.textContent = captions[activeIndex] || `Memory ${String(activeIndex + 1).padStart(2, "0")} • Romantic Moment`;
    cap.classList.remove("caption-pop");
    void cap.offsetWidth;
    cap.classList.add("caption-pop");
  }

  function renderGallery(extra = 0) {
    cards.forEach((card, index) => {
      let offset = index - activeIndex;

      if (offset > cards.length / 2) offset -= cards.length;
      if (offset < -cards.length / 2) offset += cards.length;

      const abs = Math.abs(offset);
      const dragPush = extra * 42;
      const x = offset * 126 + dragPush;
      const z = -abs * 105;
      const y = abs === 0 ? -8 : abs * 6;
      const scale = Math.max(0.68, 1.04 - abs * 0.14);
      const rotateY = offset * -12 + extra * -5;
      const rotateZ = offset * 1.8;
      const opacity = abs > 2 ? 0 : 1 - abs * 0.24;
      const blur = abs > 1 ? 1.2 : 0;

      card.classList.toggle("active-memory", abs === 0);

      card.style.transform =
        `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;

      card.style.opacity = opacity;
      card.style.filter = `blur(${blur}px)`;
      card.style.zIndex = String(100 - abs);
    });

    updateCaption();
  }

  window.moveGallery = function (step) {
    activeIndex = (activeIndex + step + cards.length) % cards.length;
    renderGallery();
  };

  window.updateGallery = function () {
    renderGallery();
  };

  cards.forEach((card, index) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (index === activeIndex && typeof window.openLightbox === "function") {
        window.openLightbox(index);
      } else {
        activeIndex = index;
        renderGallery();
      }
    }, true);
  });

  track.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    dragX = 0;
    track.setPointerCapture?.(e.pointerId);
  });

  track.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    dragX = e.clientX - startX;
    const strength = Math.max(-1, Math.min(1, dragX / 160));
    renderGallery(strength);
  });

  track.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;

    if (Math.abs(dragX) > 38) {
      dragX < 0 ? window.moveGallery(1) : window.moveGallery(-1);
    } else {
      renderGallery();
    }
  });

  renderGallery();
})();


/* === GALLERY 3D DEPTH UPGRADE === */
(function () {
  const track = document.getElementById("orbitTrack");
  const cards = Array.from(document.querySelectorAll(".orbit-card"));
  if (!track || !cards.length) return;

  let activeIndex = 0;
  let startX = 0;
  let dragging = false;
  let dragX = 0;
  let tiltX = 0;
  let tiltY = 0;

  const captions = [
    "Memory 01 • Romantic Moment",
    "Memory 02 • Sweet Smile",
    "Memory 03 • Beautiful Memory",
    "Memory 04 • Happy Day",
    "Memory 05 • Precious Scene",
    "Memory 06 • Favorite Moment"
  ];

  function captionEl() {
    return document.getElementById("activeMemoryCaption") || document.getElementById("galleryCaption");
  }

  function updateCaption() {
    const cap = captionEl();
    if (!cap) return;
    cap.textContent = captions[activeIndex] || `Memory ${String(activeIndex + 1).padStart(2, "0")} • Romantic Moment`;
    cap.classList.remove("caption-pop");
    void cap.offsetWidth;
    cap.classList.add("caption-pop");
  }

  function render3D(extra = 0) {
    const stageTiltX = tiltY * -4;
    const stageTiltY = tiltX * 6;

    track.style.transform = `rotateX(${stageTiltX}deg) rotateY(${stageTiltY}deg)`;

    cards.forEach((card, index) => {
      let offset = index - activeIndex;

      if (offset > cards.length / 2) offset -= cards.length;
      if (offset < -cards.length / 2) offset += cards.length;

      const abs = Math.abs(offset);
      const direction = offset < 0 ? -1 : 1;

      const dragPush = extra * 58;
      const x = offset * 138 + dragPush;
      const z = abs === 0 ? 190 : -abs * 135;
      const y = abs === 0 ? -14 : abs * 10;
      const scale = Math.max(0.56, 1.1 - abs * 0.17);
      const rotateY = offset * -18 + extra * -9;
      const rotateX = abs === 0 ? tiltY * 4 : 4;
      const rotateZ = offset * 2.4;
      const opacity = abs > 2 ? 0 : 1 - abs * 0.20;
      const blur = abs > 1 ? 1.15 : 0;

      card.classList.toggle("active-memory", abs === 0);
      card.classList.toggle("depth-left", offset < 0 && abs <= 2);
      card.classList.toggle("depth-right", offset > 0 && abs <= 2);
      card.classList.toggle("depth-back", abs > 1);

      card.style.transform =
        `translate3d(${x}px, ${y}px, ${z}px)
         rotateX(${rotateX}deg)
         rotateY(${rotateY}deg)
         rotateZ(${rotateZ}deg)
         scale(${scale})`;

      card.style.opacity = opacity;
      card.style.filter = `blur(${blur}px)`;
      card.style.zIndex = String(200 - abs);
    });

    updateCaption();
  }

  window.moveGallery = function (step) {
    activeIndex = (activeIndex + step + cards.length) % cards.length;
    render3D();
  };

  window.updateGallery = function () {
    render3D();
  };

  cards.forEach((card, index) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (index === activeIndex && typeof window.openLightbox === "function") {
        window.openLightbox(index);
      } else {
        activeIndex = index;
        render3D();
      }
    }, true);
  });

  track.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    dragX = 0;
    track.setPointerCapture?.(e.pointerId);
  });

  track.addEventListener("pointermove", (e) => {
    const rect = track.getBoundingClientRect();
    tiltX = ((e.clientX - rect.left) / rect.width - 0.5);
    tiltY = ((e.clientY - rect.top) / rect.height - 0.5);

    if (dragging) {
      dragX = e.clientX - startX;
      const strength = Math.max(-1, Math.min(1, dragX / 160));
      render3D(strength);
    } else {
      render3D();
    }
  });

  track.addEventListener("pointerleave", () => {
    tiltX = 0;
    tiltY = 0;
    if (!dragging) render3D();
  });

  track.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;

    if (Math.abs(dragX) > 38) {
      dragX < 0 ? window.moveGallery(1) : window.moveGallery(-1);
    } else {
      render3D();
    }
  });

  render3D();
})();


/* === FINAL EXPERIENCE UPGRADE: DEPTH LIGHT + MUSIC STATE === */
(function () {
  const root = document.documentElement;
  const audio = document.getElementById("bgMusic");

  function updateLight(x, y) {
    root.style.setProperty("--light-x", `${x}px`);
    root.style.setProperty("--light-y", `${y}px`);
  }

  window.addEventListener("pointermove", (e) => {
    updateLight(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!e.touches || !e.touches[0]) return;
    updateLight(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  if (audio) {
    audio.addEventListener("play", () => document.body.classList.add("music-playing"));
    audio.addEventListener("pause", () => document.body.classList.remove("music-playing"));
  }
})();


/* === ANNIVERSARY PREMIUM ULTIMATE EXPERIENCE UPGRADE === */
(function () {
  const depthLight = document.getElementById("premiumDepthLight");

  function updateLight(clientX, clientY) {
    if (!depthLight) return;
    const x = (clientX / window.innerWidth) * 100;
    const y = (clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty("--light-x", `${x}%`);
    document.documentElement.style.setProperty("--light-y", `${y}%`);
  }

  window.addEventListener("pointermove", (e) => updateLight(e.clientX, e.clientY), { passive: true });
  window.addEventListener("touchmove", (e) => {
    const t = e.touches && e.touches[0];
    if (t) updateLight(t.clientX, t.clientY);
  }, { passive: true });

  const particleLayer = document.getElementById("softParticleLayer");
  if (particleLayer && !particleLayer.dataset.ready) {
    particleLayer.dataset.ready = "true";
    const count = window.innerWidth < 760 ? 16 : 26;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "soft-particle" + (i % 7 === 0 ? " heart" : "");
      if (i % 7 === 0) p.textContent = "♡";
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.setProperty("--dx", `${(Math.random() * 34 - 17).toFixed(1)}px`);
      p.style.setProperty("--dur", `${(7 + Math.random() * 6).toFixed(1)}s`);
      p.style.animationDelay = `${(-Math.random() * 8).toFixed(1)}s`;
      particleLayer.appendChild(p);
    }
  }

  if (typeof window.showPage === "function" && !window.__ultimateShowPagePatched) {
    window.__ultimateShowPagePatched = true;
    const originalShowPage = window.showPage;
    window.showPage = function(index) {
      const active = document.querySelector(".page.active, .story-page.active");

      if (active && !active.classList.contains("is-exiting")) {
        active.classList.add("is-exiting");
        setTimeout(() => active.classList.remove("is-exiting"), 760);
      }

      setTimeout(() => originalShowPage(index), 120);
    };
  }

  const track = document.getElementById("orbitTrack");
  const cards = Array.from(document.querySelectorAll(".orbit-card"));

  if (track && cards.length && !window.__ultimateGalleryPatched) {
    window.__ultimateGalleryPatched = true;

    let activeIndex = 0;
    let startX = 0;
    let dragging = false;
    let dragX = 0;
    let tiltX = 0;
    let tiltY = 0;

    const captions = [
      "Memory 01 • Romantic Moment",
      "Memory 02 • Sweet Smile",
      "Memory 03 • Beautiful Memory",
      "Memory 04 • Happy Day",
      "Memory 05 • Precious Scene",
      "Memory 06 • Favorite Moment"
    ];

    function captionEl() {
      return document.getElementById("activeMemoryCaption") || document.getElementById("galleryCaption");
    }

    function updateCaption() {
      const cap = captionEl();
      if (!cap) return;
      cap.textContent = captions[activeIndex] || `Memory ${String(activeIndex + 1).padStart(2, "0")} • Romantic Moment`;
      cap.classList.remove("caption-pop");
      void cap.offsetWidth;
      cap.classList.add("caption-pop");
    }

    function renderGallery(extra = 0) {
      const stageTiltX = tiltY * -4;
      const stageTiltY = tiltX * 6;

      track.style.transform = `rotateX(${stageTiltX}deg) rotateY(${stageTiltY}deg)`;

      cards.forEach((card, index) => {
        let offset = index - activeIndex;

        if (offset > cards.length / 2) offset -= cards.length;
        if (offset < -cards.length / 2) offset += cards.length;

        const abs = Math.abs(offset);
        const dragPush = extra * 58;
        const x = offset * 138 + dragPush;
        const z = abs === 0 ? 190 : -abs * 135;
        const y = abs === 0 ? -14 : abs * 10;
        const scale = Math.max(0.56, 1.1 - abs * 0.17);
        const rotateY = offset * -18 + extra * -9;
        const rotateX = abs === 0 ? tiltY * 4 : 4;
        const rotateZ = offset * 2.4;
        const opacity = abs > 2 ? 0 : 1 - abs * 0.20;
        const blur = abs > 1 ? 1.15 : 0;

        card.classList.toggle("active-memory", abs === 0);
        card.classList.toggle("depth-back", abs > 1);

        card.style.transform =
          `translate3d(${x}px, ${y}px, ${z}px)
           rotateX(${rotateX}deg)
           rotateY(${rotateY}deg)
           rotateZ(${rotateZ}deg)
           scale(${scale})`;

        card.style.opacity = opacity;
        card.style.filter = `blur(${blur}px)`;
        card.style.zIndex = String(200 - abs);

        const img = card.querySelector("img");
        if (img && abs === 0) {
          img.style.setProperty("--photo-x", `${tiltX * -8}px`);
          img.style.setProperty("--photo-y", `${tiltY * -8}px`);
        }
      });

      updateCaption();
    }

    window.moveGallery = function(step) {
      activeIndex = (activeIndex + step + cards.length) % cards.length;
      renderGallery();
    };

    window.updateGallery = function() {
      renderGallery();
    };

    cards.forEach((card, index) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (index === activeIndex && typeof window.openLightbox === "function") {
          window.openLightbox(index);
        } else {
          activeIndex = index;
          renderGallery();
        }
      }, true);
    });

    track.addEventListener("pointerdown", (e) => {
      dragging = true;
      startX = e.clientX;
      dragX = 0;
      track.setPointerCapture?.(e.pointerId);
    });

    track.addEventListener("pointermove", (e) => {
      const rect = track.getBoundingClientRect();
      tiltX = ((e.clientX - rect.left) / rect.width - 0.5);
      tiltY = ((e.clientY - rect.top) / rect.height - 0.5);

      if (dragging) {
        dragX = e.clientX - startX;
        const strength = Math.max(-1, Math.min(1, dragX / 160));
        renderGallery(strength);
      } else {
        renderGallery();
      }
    });

    track.addEventListener("pointerleave", () => {
      tiltX = 0;
      tiltY = 0;
      if (!dragging) renderGallery();
    });

    track.addEventListener("pointerup", () => {
      if (!dragging) return;
      dragging = false;

      if (Math.abs(dragX) > 38) {
        dragX < 0 ? window.moveGallery(1) : window.moveGallery(-1);
      } else {
        renderGallery();
      }
    });

    renderGallery();
  }
})();
