document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const cameraFeed = document.getElementById('cameraFeed');
    const captureCanvas = document.getElementById('canvas');
    const countdownDisplay = document.getElementById('countdown');
    const photoSlots = document.querySelectorAll('.photo-slot');
    const captureBtn = document.getElementById('captureBtn');
    const timerToggle = document.getElementById('timerToggle');
    
    const captureContainer = document.getElementById('captureContainer');
    const editorContainer = document.getElementById('editorContainer');

    const stripPreviewCanvas = document.getElementById('stripPreviewCanvas');
    const colorSwatches = document.querySelector('.color-swatches');
    const stickerTemplatesContainer = document.querySelector('.sticker-templates');
    const retakeBtn = document.getElementById('retakeBtn');
    const saveBtn = document.getElementById('saveBtn');

    // --- STATE MANAGEMENT & CONSTANTS ---
    let stream;
    let photoCount = 0;
    const photos = [];
    
    let currentBgColor = 'white';
    let placedStickers = [];
    
    const PHOTO_WIDTH = 640;
    const PHOTO_HEIGHT = 480;
    
    const SIDE_MARGIN = 20;
    const TOP_MARGIN = 20;
    const PHOTO_SPACING = 20;
    const BOTTOM_MARGIN = 120; 
    
    // =============================================
    // ========== RESPONSIVE ADJUSTMENT ============
    // =============================================
    // Use a smaller scale for the preview canvas on mobile devices
    const isMobile = window.innerWidth <= 850;
    const PREVIEW_SCALE = isMobile ? 0.45 : 0.6;


    const stickerTemplates = [
        [], // Template 0: No stickers
        [ // Template 1: Sweet Treats
            { sticker: '🍭', x: 80, y: 80, size: 80 },    // Top-left on photo 1
            { sticker: '🍰', x: 560, y: 750, size: 70 },   // Middle-right on photo 2
            { sticker: '🍓', x: 100, y: 1400, size: 70 },  // Bottom-left on photo 3
        ],
        [ // Template 2: Cute & Cheeky
            { sticker: '💖', x: 550, y: 100, size: 70 },   // Top-right on photo 1
            { sticker: '✨', x: 100, y: 740, size: 90 },   // Middle-left on photo 2
            { sticker: '💋', x: 550, y: 1400, size: 80 }, // Bottom-right on photo 3
        ],
        [ // Template 3: Party Time
            { sticker: '🎀', x: 340, y: 60, size: 80 },    // Top-center of strip
            { sticker: '💄', x: 100, y: 950, size: 60 },   // Middle-left on photo 2/3 border
            { sticker: '🍭', x: 560, y: 1420, size: 70 }, // Bottom-right on photo 3
        ],
        [ // Template 4: Pastel Dream
            { sticker: '🍬', x: 100, y: 400, size: 60 },   // Bottom-left of photo 1
            { sticker: '💖', x: 560, y: 580, size: 80 },   // Top-right of photo 2
            { sticker: '🧚', x: 340, y: 1450, size: 70 }, // Bottom-center of photo 3
        ]
    ];

    // --- 1. CAMERA CONTROLS ---
    async function initCamera() {
        if (stream) return; 
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            cameraFeed.srcObject = stream;
        } catch (err) {
            console.error("Oops, couldn't access the camera:", err);
            alert("Could not access camera. Please allow camera permissions and refresh.");
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    // --- 2. CAPTURE SEQUENCE ---
    function handleCapture() {
        if (timerToggle.checked) {
            startCountdown();
        } else {
            captureImage();
        }
    }
    
    function startCountdown() {
        if (photoCount >= 3) return;
        let count = 3;
        countdownDisplay.style.display = 'block';
        countdownDisplay.textContent = count;
        captureBtn.disabled = true;

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownDisplay.textContent = count;
            } else {
                clearInterval(countdownInterval);
                countdownDisplay.textContent = '📸';
                setTimeout(() => {
                    captureImage();
                    countdownDisplay.style.display = 'none';
                }, 300);
            }
        }, 1000);
    }
    
    function captureImage() {
        captureCanvas.width = cameraFeed.videoWidth;
        captureCanvas.height = cameraFeed.videoHeight;
        const context = captureCanvas.getContext('2d');
        context.translate(captureCanvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(cameraFeed, 0, 0, captureCanvas.width, captureCanvas.height);

        const dataUrl = captureCanvas.toDataURL('image/png');
        photos.push(dataUrl);

        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.transform = 'scaleX(1)'; 
        photoSlots[photoCount].innerHTML = '';
        photoSlots[photoCount].appendChild(img);
        
        photoCount++;
        captureBtn.disabled = false;

        if (photoCount >= 3) {
            showEditor();
        }
    }
    
    // --- 3. EDITOR LOGIC ---
    function showEditor() {
        captureContainer.style.display = 'none';
        editorContainer.style.display = 'flex';
        stopCamera();
        
        stripPreviewCanvas.width = (PHOTO_WIDTH + SIDE_MARGIN * 2) * PREVIEW_SCALE;
        stripPreviewCanvas.height = (TOP_MARGIN + BOTTOM_MARGIN + (PHOTO_HEIGHT * 3) + (PHOTO_SPACING * 2)) * PREVIEW_SCALE;

        applyStickerTemplate(0);
        drawStripPreview();
    }
    
    function applyStickerTemplate(templateId) {
        placedStickers = [...stickerTemplates[templateId]];
        document.querySelectorAll('.template-btn').forEach((btn) => {
             btn.classList.toggle('active', parseInt(btn.dataset.templateId) === templateId);
        });
        drawStripPreview();
    }

    async function drawStripPreview() {
        const ctx = stripPreviewCanvas.getContext('2d');
        const scale = PREVIEW_SCALE;

        ctx.fillStyle = currentBgColor;
        ctx.fillRect(0, 0, stripPreviewCanvas.width, stripPreviewCanvas.height);
        
        const imagePromises = photos.map(src => new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
        }));
        const loadedImages = await Promise.all(imagePromises);

        loadedImages.forEach((img, index) => {
            const xPos = SIDE_MARGIN * scale;
            const yPos = (TOP_MARGIN + (index * (PHOTO_HEIGHT + PHOTO_SPACING))) * scale;
            ctx.drawImage(img, xPos, yPos, PHOTO_WIDTH * scale, PHOTO_HEIGHT * scale);
        });

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        placedStickers.forEach(sticker => {
            ctx.font = `${sticker.size * scale}px sans-serif`;
            const x = (sticker.x) * scale;
            const y = (sticker.y) * scale;
            ctx.fillText(sticker.sticker, x, y);
        });

        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        ctx.fillStyle = '#777';
        ctx.font = `italic ${28 * scale}px sans-serif`;
        const totalStripHeight = TOP_MARGIN + (PHOTO_HEIGHT * 3) + (PHOTO_SPACING * 2) + BOTTOM_MARGIN;
        const dateX = stripPreviewCanvas.width / 2;
        const dateY = (totalStripHeight - (BOTTOM_MARGIN / 2)) * scale;
        ctx.fillText(date, dateX, dateY);
    }

    function handleColorChange(e) {
        if (e.target.classList.contains('color-swatch')) {
            currentBgColor = e.target.dataset.color;
            drawStripPreview();
        }
    }
    
    // --- 4. FINAL ACTIONS (RETAKE & SAVE) ---
    function retakeAllPhotos() {
        photoCount = 0;
        photos.length = 0;
        placedStickers = [];
        currentBgColor = 'white';
        photoSlots.forEach(slot => slot.innerHTML = '');

        editorContainer.style.display = 'none';
        captureContainer.style.display = 'flex';
        captureBtn.disabled = false;
        initCamera();
    }

    async function saveFinalStrip() {
        const saveCanvas = document.createElement('canvas');
        const ctx = saveCanvas.getContext('2d');

        saveCanvas.width = PHOTO_WIDTH + SIDE_MARGIN * 2;
        saveCanvas.height = TOP_MARGIN + BOTTOM_MARGIN + (PHOTO_HEIGHT * 3) + (PHOTO_SPACING * 2);

        ctx.fillStyle = currentBgColor;
        ctx.fillRect(0, 0, saveCanvas.width, saveCanvas.height);

        const imagePromises = photos.map(src => new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
        }));
        const loadedImages = await Promise.all(imagePromises);

        loadedImages.forEach((img, index) => {
            const xPos = SIDE_MARGIN;
            const yPos = TOP_MARGIN + (index * (PHOTO_HEIGHT + PHOTO_SPACING));
            ctx.drawImage(img, xPos, yPos, PHOTO_WIDTH, PHOTO_HEIGHT);
        });
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        placedStickers.forEach(sticker => {
            const x = sticker.x;
            const y = sticker.y;
            ctx.font = `${sticker.size}px sans-serif`;
            ctx.fillText(sticker.sticker, x, y);
        });

        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        ctx.fillStyle = '#777';
        ctx.font = 'italic 28px sans-serif';
        const totalStripHeight = TOP_MARGIN + (PHOTO_HEIGHT * 3) + (PHOTO_SPACING * 2) + BOTTOM_MARGIN;
        const dateX = saveCanvas.width / 2;
        const dateY = totalStripHeight - (BOTTOM_MARGIN / 2);
        ctx.fillText(date, dateX, dateY);

        const finalImageURL = saveCanvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.href = finalImageURL;
        link.download = 'glimmr-photostrip.jpg';
        link.click();
    }

    // --- EVENT LISTENERS ---
    captureBtn.addEventListener('click', handleCapture);
    retakeBtn.addEventListener('click', retakeAllPhotos);
    saveBtn.addEventListener('click', saveFinalStrip);
    colorSwatches.addEventListener('click', handleColorChange);

    stickerTemplatesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('template-btn')) {
            const templateId = parseInt(e.target.dataset.templateId);
            applyStickerTemplate(templateId);
        }
    });

    initCamera();
});

