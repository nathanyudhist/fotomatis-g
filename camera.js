const WIDTH = 600, HEIGHT = 1800;
const TOTAL_PHOTOS = 4;
const PHOTO_W = 350, PHOTO_H = 380;
const PHOTO_DEST_X = 125;
const PHOTO_Y_POSITIONS = [120, 515, 910, 1305];

let photoStage = 0;
let isBwMode = false; // "isBwMode" sekarang berarti "isPinkMode"

const elements = {
  video: document.getElementById('liveVideo'),
  canvas: document.getElementById('finalCanvas'),
  ctx: document.getElementById('finalCanvas').getContext('2d'),
  shutterToggle: document.getElementById('shutterToggle'),
  switchContainer: document.getElementById('switchContainer'),
  sliderThumb: document.getElementById('sliderThumb'),
  sliderTrack: document.getElementById('sliderTrack'),
  textOff: document.getElementById('textOff'),
  textOn: document.getElementById('textOn'),
  countdownEl: document.querySelector('.countdown-timer'),
  indicator: document.querySelector('.indicator-light'),
  knob: document.getElementById('filterKnob'),
  labelNormal: document.getElementById('labelNormal'),
  labelBW: document.getElementById('labelBW')
};

const setupSwipeToggle = () => {
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  const MAX_SLIDE = 44; 
  const startColor = { r: 191, g: 18, b: 140 }; 
  const endColor = { r: 244, g: 134, b: 198 }; 
  const lerp = (start, end, t) => start * (1 - t) + end * t;

  const updateToggleVisual = (xPos) => {
    elements.sliderThumb.style.transform = `translateX(${xPos}px)`;
    const percent = xPos / MAX_SLIDE;
    elements.textOff.style.opacity = (1 - percent).toFixed(2);
    elements.textOn.style.opacity = percent.toFixed(2);
    const currentR = Math.round(lerp(startColor.r, endColor.r, percent));
    const currentG = Math.round(lerp(startColor.g, endColor.g, percent));
    const currentB = Math.round(lerp(startColor.b, endColor.b, percent));
    elements.sliderTrack.style.backgroundColor = `rgb(${currentR}, ${currentG}, ${currentB})`;
  };

  const snapToState = (isOn) => {
    elements.sliderThumb.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    elements.textOff.style.transition = 'opacity 0.2s linear';
    elements.textOn.style.transition = 'opacity 0.2s linear';
    elements.sliderTrack.style.transition = 'background-color 0.2s linear';

    if (isOn) {
      updateToggleVisual(MAX_SLIDE); 
      if (!elements.shutterToggle.checked) {
        elements.shutterToggle.checked = true;
        disableControls();
        startCountdown(capturePhoto);
      }
    } else {
      updateToggleVisual(0); 
      elements.shutterToggle.checked = false;
    }
  };

  const disableControls = () => {
    elements.switchContainer.style.pointerEvents = 'none';
    elements.knob.style.pointerEvents = 'none';
  };

  const startDrag = (e) => {
    if (elements.shutterToggle.checked) return;
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    elements.sliderThumb.style.transition = 'none';
    elements.textOff.style.transition = 'none';
    elements.textOn.style.transition = 'none';
    elements.sliderTrack.style.transition = 'none';
  };

  const onDrag = (e) => {
    if (!isDragging) return;
    if(e.type === 'touchmove') e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    let newPos = Math.max(0, Math.min(deltaX, MAX_SLIDE));
    currentX = newPos;
    updateToggleVisual(newPos);
  };

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    if (currentX > (MAX_SLIDE / 2)) {
      snapToState(true);
    } else {
      snapToState(false);
    }
  };

  elements.switchContainer.addEventListener('mousedown', startDrag);
  elements.switchContainer.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchmove', onDrag, { passive: false });
  window.addEventListener('touchend', endDrag);
  updateToggleVisual(0);
};

const setupFilterKnob = () => {
  let isDragging = false;
  let currentAngle = -90;

  const updateKnobUI = (angle) => {
    elements.knob.style.transform = `rotate(${angle}deg)`;
  };

  const snapToPosition = (angle) => {
    // Memaksa sudut ke 90 atau -90
    const targetAngle = angle > 0 ? 90 : -90;
    elements.knob.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    updateKnobUI(targetAngle);
    
    // --- DEBUGGING & LOGIC ---
    isBwMode = (targetAngle === 90);
    
    //console.log("Posisi Knob:", targetAngle, "Mode Pink:", isBwMode); 

    if (isBwMode) {
      elements.labelBW.classList.add('active');
      elements.labelNormal.classList.remove('active');
      // Force Add Class
      elements.video.classList.add('filter-pink'); 
    } else {
      elements.labelNormal.classList.add('active');
      elements.labelBW.classList.remove('active');
      // Force Remove Class
      elements.video.classList.remove('filter-pink');
    }
    currentAngle = targetAngle;
  };

  elements.knob.style.transition = 'none';
  updateKnobUI(currentAngle);
  
  const startDrag = (e) => {
    if (elements.shutterToggle.checked) return;
    isDragging = true;
    elements.knob.style.transition = 'none';
  };

  const onDrag = (e) => {
    if (!isDragging) return;
    if(e.type === 'touchmove') e.preventDefault(); 
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = elements.knob.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle += 90;
    if (angle > 180) angle -= 360;
    if (angle < -90) angle = -90;
    if (angle > 90) angle = 90;
    updateKnobUI(angle);
    currentAngle = angle;
  };

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    snapToPosition(currentAngle);
  };

  elements.knob.addEventListener('mousedown', startDrag);
  elements.knob.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchmove', onDrag, { passive: false });
  window.addEventListener('touchend', endDrag);

  // --- INIT PENTING ---
  // Jalankan sekali saat start agar sinkron
  snapToPosition(currentAngle);
};

const setupCamera = () => {
  const constraints = {
    audio: false,
    video: { 
        facingMode: 'user', 
        width: { ideal: 1280 }, 
        height: { ideal: 720 } 
    }
  };

  // --- PATCH KHUSUS IPHONE (FORCE ATTRIBUTES) ---
  // Ini menyuntikkan atribut HTML via JS supaya kamu gak perlu edit HTML manual
  elements.video.setAttribute('autoplay', '');
  elements.video.setAttribute('muted', '');
  elements.video.setAttribute('playsinline', '');
  elements.video.setAttribute('webkit-playsinline', '');
  // ----------------------------------------------

  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      elements.video.srcObject = stream;
      // Promise play untuk handle browser policy
      elements.video.play().catch(e => {
         console.log("Autoplay dicegah browser, user harus tap layar dulu.", e);
      });
    })
    .catch(err => {
        alert('Gagal akses kamera: ' + err.message);
    });
};

const startCountdown = callback => {
  elements.indicator.classList.add('active');
  let count = 3;
  const { countdownEl } = elements;
  countdownEl.textContent = count;
  countdownEl.style.display = 'block';
  const intervalId = setInterval(() => {
    count--;
    if (count > 0) countdownEl.textContent = count;
    else {
      clearInterval(intervalId);
      countdownEl.style.display = 'none';
      callback();
    }
  }, 1000);
};

const capturePhoto = () => {
  elements.indicator.classList.remove('active');
  const { video, ctx } = elements;
  const vW = video.videoWidth, vH = video.videoHeight;
  const destW = PHOTO_W, destH = PHOTO_H;
  const targetAspect = destW / destH, videoAspect = vW / vH; 
  let sX, sY, sW, sH;
  if (videoAspect > targetAspect) { 
    sH = vH; sW = vH * targetAspect; sX = (vW - sW) / 2; sY = 0; 
  } else { 
    sW = vW; sH = vW / targetAspect; sX = 0; sY = (vH - sH) / 2; 
  }
  if(photoStage === 0) {
      ctx.fillStyle = "#f7f9dc"; 
      ctx.fillRect(0,0,WIDTH,HEIGHT);
  }
  ctx.save();
  
  // LOGIC HASIL FOTO (Canvas)
  if (isBwMode) {
      // Filter Pink
      ctx.filter = 'sepia(0.5) hue-rotate(310deg) saturate(1.8) contrast(1.1) brightness(1.1)'; 
  } else {
      ctx.filter = 'none';
  }

  ctx.translate(WIDTH, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sX, sY, sW, sH, WIDTH - PHOTO_DEST_X - destW, PHOTO_Y_POSITIONS[photoStage], destW, destH);
  ctx.restore();
  
  photoStage++;
  if (photoStage < TOTAL_PHOTOS) {
    setTimeout(() => startCountdown(capturePhoto), 1000); 
  } else {
    finalizePhotoStrip(); 
  }
};

const finalizePhotoStrip = () => {
  const { ctx, canvas } = elements;
  const frame = new Image();
  // Pastikan file 'frame.png' ada di folder yang sama
  frame.src = 'frame.png'; 
  frame.onload = () => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(frame, 0, 0, WIDTH, HEIGHT);
    saveAndRedirect();
  };
  frame.onerror = () => { saveAndRedirect(); };
};

const saveAndRedirect = () => {
    const { canvas } = elements;
    localStorage.setItem('photoStrip', canvas.toDataURL('image/png'));
    setTimeout(() => window.location.href = 'final.html', 500);
}

// Init State
elements.shutterToggle.checked = false;
setupFilterKnob();
setupSwipeToggle();
setupCamera();
