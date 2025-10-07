// const cameraButton = document.getElementById('cameraButton');
// const photoModal = document.getElementById('photoModal');
// const cameraFeed = document.getElementById('cameraFeed');
// const timerDisplay = document.querySelector('.timer');
// const photoSlots = document.querySelectorAll('.photo-slot');
// const retakeBtn = document.getElementById('retakeBtn');

// let stream;
// let currentPhoto = 0;
// let countdown;

// cameraButton.addEventListener('click', startPhotoSession);

// function startPhotoSession() {
//     photoModal.style.display = 'block';
//     currentPhoto = 0;
    
//     // Access camera
//     navigator.mediaDevices.getUserMedia({ video: true })
//         .then(function(s) {
//             stream = s;
//             cameraFeed.srcObject = stream;
//             startCountdown();
//         })
//         .catch(function(err) {
//             console.error("Camera error: ", err);
//             alert("Could not access camera. Please check permissions.");
//         });
// }

// function startCountdown() {
//     let seconds = 3;
//     timerDisplay.textContent = seconds;
    
//     countdown = setInterval(function() {
//         seconds--;
//         timerDisplay.textContent = seconds;
        
//         if (seconds <= 0) {
//             clearInterval(countdown);
//             takeSnapshot();
//         }
//     }, 1000);
// }

// function takeSnapshot() {
//     // Create canvas to capture photo
//     const canvas = document.createElement('canvas');
//     canvas.width = cameraFeed.videoWidth;
//     canvas.height = cameraFeed.videoHeight;
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);
    
//     // Display in current photo slot
//     const img = document.createElement('img');
//     img.src = canvas.toDataURL('image/png');
//     photoSlots[currentPhoto].innerHTML = '';
//     photoSlots[currentPhoto].appendChild(img);
    
//     currentPhoto++;
    
//     if (currentPhoto < 3) {
//         // Take next photo after delay
//         setTimeout(startCountdown, 500);
//     } else {
//         // All photos taken
//         timerDisplay.textContent = 'Done!';
//         stopCamera();
//     }
// }

// function stopCamera() {
//     if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//     }
// }

// retakeBtn.addEventListener('click', function() {
//     photoModal.style.display = 'none';
//     stopCamera();
// });

// // Close modal if clicked outside
// window.addEventListener('click', function(event) {
//     if (event.target == photoModal) {
//         photoModal.style.display = 'none';
//         stopCamera();
//     }
// });
