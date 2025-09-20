const words = ["Hello", "World", "Apple", "Banana", "Chair", "Table", "Dog", "Cat"];
let currentWord = "";
let score = 0;

const wordDiv = document.getElementById('word');
const feedbackDiv = document.getElementById('feedback');
const scoreDiv = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const recordBtn = document.getElementById('recordBtn');
const downloadLink = document.getElementById('downloadLink');

let recognition;
let mediaRecorder;
let audioChunks = [];

// --- Functions ---
function getRandomWord() {
  const index = Math.floor(Math.random() * words.length);
  return words[index];
}

function nextWord() {
  currentWord = getRandomWord();
  wordDiv.innerText = currentWord;
  feedbackDiv.innerText = "";
  downloadLink.style.display = "none";
}

// --- Initialize first word ---
nextWord();

// --- Speech Recognition ---
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    if (transcript.toLowerCase() === currentWord.toLowerCase()) {
      feedbackDiv.innerText = "✅ Correct!";
      score += 1;
      scoreDiv.innerText = `Score: ${score}`;
    } else {
      feedbackDiv.innerText = `❌ Try Again: You said '${transcript}'`;
    }
    // Load next word after 1 second
    setTimeout(nextWord, 1000);
  };

  recognition.onerror = function(event) {
    feedbackDiv.innerText = 'Error: ' + event.error;
  };
} else {
  alert('Your browser does not support Speech Recognition API. Use Chrome.');
}

// --- Speech Recognition Button ---
startBtn.addEventListener('click', () => {
  feedbackDiv.innerText = '';
  recognition.start();
});

// --- Audio Recording ---
recordBtn.addEventListener('click', async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      downloadLink.href = audioUrl;
      downloadLink.download = `${currentWord}.wav`;
      downloadLink.style.display = 'block';
      downloadLink.innerText = `Download recording of "${currentWord}"`;
    };

    mediaRecorder.start();
    recordBtn.innerText = "Stop Recording";
  } else if (mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    recordBtn.innerText = "Record Audio";
  }
});
