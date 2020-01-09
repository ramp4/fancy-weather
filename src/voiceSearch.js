
const voiceSearch = document.querySelector('.search-row__voice-search');
const searchRowField = document.querySelector('.search-row__field');

voiceSearch.addEventListener('click', () => {
  if (window.SpeechRecognition || window.webkitSpeechRecognition
    || window.mozSpeechRecognition || window.msSpeechRecognition) {
    console.log('The browser support speech recognition technology');
    voiceSearch.style.backgroundImage = 'url(./dist/assets/microphoneRed.svg)';
    const SpeechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition
      || window.mozSpeechRecognition || window.msSpeechRecognition)();
    SpeechRecognition.lang = `${sessionStorage.lang}-${sessionStorage.lang.toUpperCase()}`;

    SpeechRecognition.addEventListener('result', (event) => {
      searchRowField.value = event.results[0][0].transcript;
      voiceSearch.style.backgroundImage = 'url(./dist/assets/microphone.svg)';
    });

    SpeechRecognition.start();
  } else {
    alert('The browser does not support speech recognition technology');
  }
});
