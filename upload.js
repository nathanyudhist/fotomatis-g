document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.getElementById('uploadPhoto');
    const fileInput = document.getElementById('uploadPhotoInput');
    const readyButton = document.getElementById('readyButton');
    const backButton = document.getElementById('backButton');
    const canvas = document.getElementById('finalCanvas');
    const ctx = canvas.getContext('2d');

    const TOTAL_PHOTOS = 4;
    // Ukuran Canvas 600x1800
    const WIDTH = 600;
    const HEIGHT = 1800;
    
    // Koordinat Slot Foto
    const PHOTO_W = 350; 
    const PHOTO_H = 380; 
    const PHOTO_DEST_X = 125; 
    const PHOTO_Y_POSITIONS = [120, 515, 910, 1305]; 

    let uploadedImages = [];
    let currentUploadStage = 0;

    // 1. Inisialisasi Canvas (Warna Cream)
    ctx.fillStyle = "#f7f9dc";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 2. Fungsi Tombol Upload
    uploadButton.addEventListener('click', () => {
        if (currentUploadStage < TOTAL_PHOTOS) {
            fileInput.click();
        }
    });

    // 3. Saat File Dipilih
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    uploadedImages[currentUploadStage] = img;
                    drawPhotoOnCanvas(img, currentUploadStage);

                    currentUploadStage++;
                    updateUI();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
        // Reset input agar bisa upload file yang sama jika perlu
        event.target.value = '';
    });

    // 4. Update Teks Tombol
    const updateUI = () => {
        if (currentUploadStage < TOTAL_PHOTOS) {
            uploadButton.textContent = `ADD PHOTO ${currentUploadStage + 1} / 4`;
        } else {
            uploadButton.style.display = 'none'; // Sembunyikan tombol add
            readyButton.style.display = 'block'; // Munculkan tombol print
            readyButton.disabled = false;
        }
    };

    // 5. Fungsi Menggambar Foto (CROP / COVER Logic)
    const drawPhotoOnCanvas = (img, stage) => {
        const slotW = PHOTO_W;
        const slotH = PHOTO_H;
        const slotX = PHOTO_DEST_X;
        const slotY = PHOTO_Y_POSITIONS[stage];

        const imgAspect = img.width / img.height;
        const slotAspect = slotW / slotH;

        let drawW, drawH;

        // Logika Cover (Isi Penuh)
        if (imgAspect > slotAspect) {
            drawH = slotH;
            drawW = drawH * imgAspect;
        } else {
            drawW = slotW;
            drawH = drawW / imgAspect;
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(slotX, slotY, slotW, slotH);
        ctx.clip(); // Potong gambar yang keluar dari kotak

        // Center gambar
        const offsetX = slotX + (slotW - drawW) / 2;
        const offsetY = slotY + (slotH - drawH) / 2;

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        ctx.restore();
    };

    // 6. FUNGSI FINALISASI (INI YANG MEMPERBAIKI BUG FRAME)
    readyButton.addEventListener('click', () => {
        if (uploadedImages.length === TOTAL_PHOTOS) {
            
            // Tampilkan status loading (opsional)
            readyButton.textContent = "PROCESSING...";
            readyButton.disabled = true;

            // Load gambar frame.png agar tergabung
            const frameImg = new Image();
            frameImg.src = 'frame.png'; // Pastikan nama file frame benar
            
            frameImg.onload = () => {
                // Gambar frame di atas semua foto
                ctx.globalCompositeOperation = 'source-over';
                ctx.drawImage(frameImg, 0, 0, WIDTH, HEIGHT);

                // Simpan hasil gabungan
                const photoStripDataURL = canvas.toDataURL('image/png');
                localStorage.setItem('photoStrip', photoStripDataURL);

                // Pindah halaman
                setTimeout(() => {
                    window.location.href = 'final.html';
                }, 500);
            };

            frameImg.onerror = () => {
                alert("Gagal memuat frame.png. Pastikan file ada di folder root.");
                readyButton.disabled = false;
                readyButton.textContent = "PRINT RESULT";
            };

        } else {
            alert(`Harap upload ${TOTAL_PHOTOS} foto terlebih dahulu.`);
        }
    });

    // 7. Tombol Kembali
    backButton.addEventListener('click', () => {
        window.location.href = 'menu.html';
    });
});
