
const channelID = 3326587;
const readAPIKey = "EKRPTGZ211Q08MWQ";

const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=10`;

let powerChart;

/* 📡 FETCH DATA */
async function fetchData() {
  try {
    const res = await fetch(url);
    const data = await res.json();

    const feeds = data.feeds;
    const latest = feeds[feeds.length - 1];

    // ⏱️ Last updated
    document.getElementById("last-updated").textContent =
      "Last updated: " + new Date().toLocaleTimeString();

    // 🎯 Update values
    updateValue("live-voltage", latest.field1 + " V");
    updateValue("live-current", latest.field2 + " A");
    updateValue("live-power", latest.field3 + " W");
    updateValue("live-units", latest.field4 + " kWh");

    // 📊 Chart data
    const labels = feeds.map(f =>
      new Date(f.created_at).toLocaleTimeString()
    );

    const powerData = feeds.map(f =>
      parseFloat(f.field3 || 0)
    );

    updateChart(labels, powerData);

  } catch (err) {
    console.error("Error:", err);
  }
}

/* 🔄 UPDATE VALUE */
function animateValue(el, start, end, duration = 400) {
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;
    let progress = Math.min((currentTime - startTime) / duration, 1);

    let value = start + (end - start) * progress;
    el.textContent = value.toFixed(2);

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

function updateValue(id, newValue) {
  const el = document.getElementById(id);

  const current = parseFloat(el.textContent) || 0;
  const numeric = parseFloat(newValue);

  animateValue(el, current, numeric);

  const card = el.closest(".live-card");
  card.classList.add("updated");

  setTimeout(() => card.classList.remove("updated"), 400);
}

/* 📊 CHART */
function updateChart(labels, data) {
  if (powerChart) {
    powerChart.data.labels = labels;
    powerChart.data.datasets[0].data = data;
    powerChart.update();
    return;
  }

  const ctx = document.getElementById("powerChart");

  powerChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Power (W)",
        data: data,
        borderColor: "#6a5af9",
        backgroundColor: "rgba(106,90,249,0.15)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#6a5af9",
        pointBorderColor: "#fff",
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#e2e8f0" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(255,255,255,0.05)" }
        },
        y: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(255,255,255,0.05)" }
        }
      }
    }
  });
}

/* 🔁 AUTO REFRESH */
setInterval(fetchData, 15000);
fetchData();

/* 🔘 BUTTON */
document.getElementById("refresh-btn").addEventListener("click", () => {
  fetchData();

  const btn = document.getElementById("refresh-btn");
  btn.textContent = "⏳ Refreshing...";
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = "🔄 Refresh Data";
    btn.disabled = false;
  }, 1500);
});

/* 💰 BILL CALCULATION */
function calculateBill() {
  const unitsElement = document.getElementById("live-units");
  const rateInput = document.getElementById("rate-input");
  const billAmountElement = document.getElementById("bill-amount");

  const unitsText = unitsElement.textContent;
  const units = parseFloat(unitsText.replace(" kWh", "")) || 0;
  const rate = parseFloat(rateInput.value) || 0;

  const billAmount = units * rate;

  // Animate the bill amount
  const currentBill = parseFloat(billAmountElement.textContent.replace("₹", "")) || 0;
  animateValue(billAmountElement, currentBill, billAmount);

  // Update display with currency symbol
  setTimeout(() => {
    billAmountElement.textContent = "₹" + billAmount.toFixed(2);
  }, 400);

  // Add visual feedback
  const billCard = billAmountElement.closest(".bill-card");
  billCard.classList.add("updated");

  setTimeout(() => billCard.classList.remove("updated"), 400);
}

// Calculate bill button event listener
document.getElementById("calculate-bill-btn").addEventListener("click", () => {
  calculateBill();

  const btn = document.getElementById("calculate-bill-btn");
  btn.textContent = "✅ Calculated!";
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = "🧮 Calculate Bill";
    btn.disabled = false;
  }, 1000);
});

// Auto-calculate bill when data updates
function updateValue(id, newValue) {
  const el = document.getElementById(id);

  const current = parseFloat(el.textContent) || 0;
  const numeric = parseFloat(newValue);

  animateValue(el, current, numeric);

  const card = el.closest(".live-card");
  card.classList.add("updated");

  setTimeout(() => card.classList.remove("updated"), 400);

  // Auto-calculate bill when units are updated
  if (id === "live-units") {
    setTimeout(calculateBill, 400); // Wait for animation to complete
  }
}