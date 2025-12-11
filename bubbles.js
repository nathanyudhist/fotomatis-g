const bubbleContainer = document.querySelector(".content-area"); 
// Catatan: Saya ubah selector ke .content-area karena .bubble-container tidak ada di HTML baru

const bubbleImages = [
  "bubble1.png",
  "bubble2.png",
  "bubble3.png",
  "bubble4.png",
  "bubble5.png"
];

const createBubble = () => {
  const bubble = document.createElement("img");
  bubble.src = bubbleImages[Math.floor(Math.random() * bubbleImages.length)];
  bubble.classList.add("bubble");

  // Style agar bubble melayang (perlu ditambahkan karena tidak ada di CSS terpisah)
  bubble.style.position = "absolute";
  bubble.style.zIndex = "0";
  bubble.style.pointerEvents = "none";

  bubble.style.left = Math.random() * 100 + "vw";
  const size = 20 + Math.random() * 20;
  bubble.style.width = size + "px";
  const duration = 12 + Math.random() * 8;
  bubble.style.transition = `top ${duration}s linear, opacity ${duration}s ease-out`;
  bubble.style.top = "100vh"; // Start from bottom
  
  document.body.appendChild(bubble); // Append to body

  // Trigger animation
  requestAnimationFrame(() => {
     bubble.style.top = "-100px";
     bubble.style.opacity = 0.2 + Math.random() * 0.8;
  });

  setTimeout(() => bubble.remove(), duration * 1000);
};

setInterval(createBubble, 800);
