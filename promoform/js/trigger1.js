
document.addEventListener("DOMContentLoaded", () => {
  const updateStockAndDate = () => {
    const stockSpans = document.querySelectorAll(".stock");
    const dateSpans = document.querySelectorAll(".date-until");

    // 📌 Установка даты: +1 день от сегодня
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    dateSpans.forEach(span => span.textContent = formattedDate);

    // 📦 Логика количества
    const initialStock = 97;
    const intervalMinutes = 2;
    const now = Date.now();
    const firstVisitKey = "promoform_first_visit";

    let firstVisitTime = localStorage.getItem(firstVisitKey);
    if (!firstVisitTime) {
      localStorage.setItem(firstVisitKey, now.toString());
      firstVisitTime = now;
    } else {
      firstVisitTime = parseInt(firstVisitTime);
    }

    const elapsedMinutes = Math.floor((now - firstVisitTime) / 60000);
    const decreaseCount = Math.floor(elapsedMinutes / intervalMinutes);
    const currentStock = Math.max(initialStock - decreaseCount, 1);

    stockSpans.forEach(span => {
      span.textContent = `${currentStock} ${getWordForm(currentStock)}`;
    });
  };

  function getWordForm(n) {
    if (n === 1) return "штука";
    if (n > 1 && n < 5) return "штуки";
    return "штук";
  }

  // ⏱ Первичная и периодическая установка
  updateStockAndDate();
  setInterval(updateStockAndDate, 60 * 1000); // обновление каждую минуту
});
