const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => observer.observe(el));

const bgMusic = document.getElementById('bgMusic');
let musicPrepared = false;

function prepareMusic() {
  if (!bgMusic || musicPrepared) return;
  bgMusic.volume = 0.85;
  bgMusic.load();
  musicPrepared = true;
}

function playMusicFast() {
  if (!bgMusic) return;
  prepareMusic();
  const playPromise = bgMusic.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {});
  }
}
const storyPages = document.querySelectorAll('.story-page');
let currentPage = 0;

function showPage(index) {
  if (index < 0 || index >= storyPages.length) return;

  storyPages.forEach((page) => {
    page.classList.remove('active');
  });

  storyPages[index].classList.add('active');
  storyPages[index].classList.add('show');
  currentPage = index;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (index === 1) startPremiumTypingWhenVisible();
}

function nextPage() {
  showPage(currentPage + 1);
}

function prevPage() {
  showPage(currentPage - 1);
}

const startDate = new Date('2024-01-01');
const today = new Date();
document.getElementById('daysTogether').textContent = Math.floor((today-startDate)/(1000*60*60*24));

const premiumTypeText = "A premium anniversary page made for memories, gentle feelings, and a celebration of your journey together. 💖";
let premiumTypeIndex = 0;
let premiumTypingStarted = false;

function runPremiumType() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  if (premiumTypeIndex < premiumTypeText.length) {
    el.textContent += premiumTypeText.charAt(premiumTypeIndex);
    premiumTypeIndex++;
    setTimeout(runPremiumType, 32);
  }
}

function startPremiumTypingWhenVisible() {
  const box = document.querySelector('.type-box');
  if (!box || premiumTypingStarted) return;

  const typingObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !premiumTypingStarted) {
        premiumTypingStarted = true;
        runPremiumType();
        typingObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });

  typingObserver.observe(box);
}

function startExperience() {
  playMusicFast();
  showPage(1);
  startPremiumTypingWhenVisible();
}

document.addEventListener('pointerdown', function firstTapPrepareMusic() {
  playMusicFast();
  document.removeEventListener('pointerdown', firstTapPrepareMusic);
}, { once: true });

window.addEventListener('load', () => {
  showPage(0);
  prepareMusic();
});

function tiltCard(e){
  const photo=document.getElementById('tiltPhoto');
  const rect=photo.getBoundingClientRect();
  const x=e.clientX-rect.left;
  const y=e.clientY-rect.top;
  const rotateY=((x/rect.width)-0.5)*16;
  const rotateX=((y/rect.height)-0.5)*-16;
  photo.style.transform=`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
}
function resetTilt(){document.getElementById('tiltPhoto').style.transform='rotateX(0) rotateY(0) scale(1)'}
function openLetter(){document.getElementById('letterPaper').classList.toggle('open')}
function dropConfetti(){
  const colors=['#c77dff','#7b2cbf','#ffd6ff','#ffffff','#ff8fab'];
  for(let i=0;i<90;i++){
    const piece=document.createElement('div');
    piece.className='confetti';
    piece.style.left=Math.random()*100+'vw';
    piece.style.background=colors[Math.floor(Math.random()*colors.length)];
    piece.style.animationDelay=Math.random()*.6+'s';
    document.body.appendChild(piece);
    setTimeout(()=>piece.remove(),3800);
  }
}


/* Soft coding-rain background effect */
const codeRainCanvas = document.getElementById('codeRain');
let codeRainCtx;
let codeRainColumns = [];
let codeRainFontSize = 16;
let codeRainFrame = 0;

function resizeCodeRain() {
  if (!codeRainCanvas) return;
  const dpr = window.devicePixelRatio || 1;
  codeRainCanvas.width = window.innerWidth * dpr;
  codeRainCanvas.height = window.innerHeight * dpr;
  codeRainCanvas.style.width = window.innerWidth + 'px';
  codeRainCanvas.style.height = window.innerHeight + 'px';

  codeRainCtx = codeRainCanvas.getContext('2d');
  codeRainCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  codeRainFontSize = window.innerWidth <= 430 ? 11 : 14;
  const columnCount = Math.ceil(window.innerWidth / codeRainFontSize) + 8;
  codeRainColumns = Array.from({ length: columnCount }, () => Math.random() * -window.innerHeight);
}

function drawCodeRain() {
  if (!codeRainCtx || !codeRainCanvas) return;

  codeRainFrame++;

  codeRainCtx.fillStyle = 'rgba(6, 0, 20, 0.085)';
  codeRainCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  codeRainCtx.font = '700 ' + codeRainFontSize + 'px monospace';
  codeRainCtx.shadowBlur = 18;
  codeRainCtx.shadowColor = 'rgba(255, 60, 190, 1)';

  const letters = 'LOVE0101❤♡ANNIVERSARYFOREVERMEMORY';

  for (let i = 0; i < codeRainColumns.length; i++) {
    const char = letters[Math.floor(Math.random() * letters.length)];
    const x = i * codeRainFontSize;
    const y = codeRainColumns[i];

    const isBrightHead = Math.random() > 0.78;
    codeRainCtx.fillStyle = isBrightHead ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 72, 202, 0.82)';
    codeRainCtx.fillText(char, x, y);

    if (Math.random() > 0.88) {
      codeRainCtx.fillStyle = 'rgba(199, 125, 255, 0.62)';
      codeRainCtx.fillText(char, x, y - codeRainFontSize * 1.6);
    }

    if (y > window.innerHeight + Math.random() * 1000) {
      codeRainColumns[i] = Math.random() * -140;
    } else {
      codeRainColumns[i] = y + codeRainFontSize * (1.08 + Math.random() * 0.9);
    }
  }

  requestAnimationFrame(drawCodeRain);
}

window.addEventListener('resize', resizeCodeRain);
resizeCodeRain();
drawCodeRain();

/* Floating romantic sparkles - lightweight decorative layer */
function createPremiumParticle(){
  const activePage=document.querySelector('.story-page.active');
  if(!activePage)return;
  const icons=['♡','❤','✦','✧'];
  const particle=document.createElement('span');
  particle.className='premium-particle';
  particle.textContent=icons[Math.floor(Math.random()*icons.length)];
  particle.style.left=Math.random()*100+'vw';
  particle.style.top=(58+Math.random()*34)+'vh';
  particle.style.animationDuration=(3.8+Math.random()*2.8)+'s';
  particle.style.animationDelay=Math.random()*.35+'s';
  document.body.appendChild(particle);
  setTimeout(()=>particle.remove(),7200);
}
setInterval(createPremiumParticle,850);

/* Photo gallery one-by-one viewer */
const galleryPhotos = Array.from(document.querySelectorAll('.gallery img'));
const photoLightbox = document.getElementById('photoLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCount = document.getElementById('lightboxCount');
let activePhotoIndex = 0;

function updatePhotoViewer() {
  if (!lightboxImage || !lightboxCount || galleryPhotos.length === 0) return;
  const selectedPhoto = galleryPhotos[activePhotoIndex];
  lightboxImage.src = selectedPhoto.src;
  lightboxImage.alt = selectedPhoto.alt || 'Selected memory photo';
  lightboxCount.textContent = (activePhotoIndex + 1) + ' / ' + galleryPhotos.length;
}

function openPhotoViewer(index) {
  if (!photoLightbox || galleryPhotos.length === 0) return;
  activePhotoIndex = index;
  updatePhotoViewer();
  photoLightbox.classList.add('open');
  photoLightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-active');
}

function closePhotoViewer() {
  if (!photoLightbox) return;
  photoLightbox.classList.remove('open');
  photoLightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-active');
}

function changePhoto(direction) {
  if (galleryPhotos.length === 0) return;
  activePhotoIndex = (activePhotoIndex + direction + galleryPhotos.length) % galleryPhotos.length;
  updatePhotoViewer();
}

galleryPhotos.forEach((photo, index) => {
  photo.addEventListener('click', () => openPhotoViewer(index));
});

if (photoLightbox) {
  photoLightbox.addEventListener('click', (event) => {
    if (event.target === photoLightbox) closePhotoViewer();
  });
}

document.addEventListener('keydown', (event) => {
  if (!photoLightbox || !photoLightbox.classList.contains('open')) return;
  if (event.key === 'Escape') closePhotoViewer();
  if (event.key === 'ArrowLeft') changePhoto(-1);
  if (event.key === 'ArrowRight') changePhoto(1);
});
