document.addEventListener('DOMContentLoaded', () => {
    const imgElement = document.getElementById('finalResult');
    const photoData = localStorage.getItem('photoStrip');
    const statusText = document.querySelector('.status-text');

    if (photoData) {
        imgElement.src = photoData;
        
        // Ubah teks status setelah animasi selesai (4 detik)
        setTimeout(() => {
            // TEKS DIUBAH DISINI
            statusText.textContent = "DONE <3";
            statusText.style.animation = 'none'; // Stop kedip
        }, 4000);
    } else {
        alert("Belum ada foto! Kembali ke kamera.");
        window.location.href = 'camera.html';
    }

    // Tombol Download
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'fotomatis-strip.png';
        link.href = photoData;
        link.click();
    });

    // Tombol Retake
    document.getElementById('retakeBtn').addEventListener('click', () => {
        window.location.href = 'camera.html';
    });
});