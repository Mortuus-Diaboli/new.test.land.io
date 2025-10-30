let time = 2725; // 45 минут 5 секунд
let intr;

function start_timer() {
  intr = setInterval(tick, 1000);
}

function tick() {
  time = time - 1;
  let hours = Math.floor(time / 3600);
  let mins = Math.floor((time % 3600) / 60);
  let secs = time % 60;

  if (time <= 0) {
    clearInterval(intr);
    hours = mins = secs = 0;
  }

  document.getElementById("hr").innerHTML = (hours < 10 ? "0" : "") + hours;
  document.getElementById("min").innerHTML = (mins < 10 ? "0" : "") + mins;
  document.getElementById("sec").innerHTML = (secs < 10 ? "0" : "") + secs;
}

start_timer();
