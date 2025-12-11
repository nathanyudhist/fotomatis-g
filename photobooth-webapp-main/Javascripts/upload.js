document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.getElementById('uploadPhoto');
    const fileInput = document.getElementById('uploadPhotoInput');
    const readyButton = document.getElementById('readyButton');
    const backButton = document.getElementById('backButton');
    const canvas = document.getElementById('finalCanvas');
    const ctx = canvas.getContext('2d');

    const TOTAL_PHOTOS = 4;
    // Nilai-nilai ini harus sesuai dengan Canvas (600x1800)
    const PHOTO_W = 350; // Lebar slot foto
    const PHOTO_H = 380; // Tinggi slot foto
    const PHOTO_DEST_X = 125; // Posisi X awal slot (125 dari kiri)
    const PHOTO_Y_POSITIONS = [120, 515, 910, 1305]; // Posisi Y awal 4 slot foto

    let uploadedImages = [];
    let currentUploadStage = 0;

    // --- SETUP APLIKASI ---

    // Mengisi Canvas dengan background Cream saat awal
    ctx.fillStyle = "#f7f9dc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    uploadButton.addEventListener('click', () => {
        if (currentUploadStage < TOTAL_PHOTOS) {
            fileInput.click();
        } else {
            alert("Anda sudah mengupload 4 foto. Silakan klik READY.");
        }
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Simpan gambar ke array dan tampilkan di canvas
                    uploadedImages[currentUploadStage] = img;
                    drawPhotoOnCanvas(img, currentUploadStage);

                    currentUploadStage++;

                    // Update UI
                    if (currentUploadStage < TOTAL_PHOTOS) {
                        uploadButton.textContent = `UPLOAD PHOTO ${currentUploadStage + 1} / 4`;
                    } else {
                        uploadButton.textContent = "UPLOADS COMPLETE";
                        uploadButton.disabled = true;
                        readyButton.style.display = 'block';
                        readyButton.disabled = false;
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // ------------------------------------------------------------------
    // FIXED: ASPECT RATIO CONTAIN LOGIC (Memastikan seluruh gambar terlihat)
    // ------------------------------------------------------------------
    const drawPhotoOnCanvas = (img, stage) => {
        const slotW = PHOTO_W;
        const slotH = PHOTO_H;
        const slotX = PHOTO_DEST_X;
        const slotY = PHOTO_Y_POSITIONS[stage];

        const imgAspect = img.width / img.height;
        const slotAspect = slotW / slotH;

        let drawW, drawH;

        if (imgAspect > slotAspect) {
            // Gambar lebih lebar (wide): Lebar gambar disamakan dengan lebar slot
            drawW = slotW;
            drawH = drawW / imgAspect;
        } else {
            // Gambar lebih tinggi (tall): Tinggi gambar disamakan dengan tinggi slot
            drawH = slotH;
            drawW = drawH * imgAspect;
        }

        // --- Perhitungan Pemusatan (Centering) ---
        // Bersihkan slot terlebih dahulu (jika ada sisa gambar sebelumnya)
        ctx.fillStyle = "#f7f9dc";
        ctx.fillRect(slotX, slotY, slotW, slotH);
        
        // CENTER secara horizontal dan vertikal di dalam slot
        const offsetX = slotX + (slotW - drawW) / 2;
        const offsetY = slotY + (slotH - drawH) / 2;

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    // --- FUNGSI READY ---
    readyButton.addEventListener('click', () => {
        if (uploadedImages.length === TOTAL_PHOTOS) {
            const photoStripDataURL = canvas.toDataURL('image/png');
            localStorage.setItem('photoStrip', photoStripDataURL);
            window.location.href = 'final.html';
        } else {
            alert(`Harap upload ${TOTAL_PHOTOS} foto terlebih dahulu.`);
        }
    });

    // --- FUNGSI KEMBALI ---
    backButton.addEventListener('click', () => {
        window.history.back();
    });
});