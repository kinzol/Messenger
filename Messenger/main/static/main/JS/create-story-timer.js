let timer = document.querySelector('.live-time');

let seconds = 0;
let minutes = 0;
let interval;

function updateTime() {
  seconds++;
  if (seconds === 60) {
    minutes++;
    seconds = 0;
  }
  timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function timerStart() {
  interval = setInterval(updateTime, 1000);
};

function timerStop() {
  clearInterval(interval);
  seconds = 0;
  minutes = 0;
  timer.textContent = '00:00';
};