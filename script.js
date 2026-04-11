
const channelID = 3326587;
const readAPIKey = "EKRPTGZ211Q08MWQ";

const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=10`;

let chart;

/* FETCH DATA */
async function fetchData() {
    const res = await fetch(url);
    const data = await res.json();

    const feeds = data.feeds;
    const latest = feeds[feeds.length - 1];

    update("live-voltage", latest.field1);
    update("live-current", latest.field2);
    update("live-power", latest.field3);
    update("live-units", latest.field4);

    document.getElementById("last-updated").innerText =
        "Last updated: " + new Date().toLocaleTimeString();

    updateChart(feeds);
}

/* UPDATE VALUES */
function update(id, value) {
    document.getElementById(id).innerText = parseFloat(value || 0).toFixed(2);
}

/* CHART */
function updateChart(feeds) {
    const labels = feeds.map(f => new Date(f.created_at).toLocaleTimeString());
    const data = feeds.map(f => f.field3);

    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
        return;
    }

    chart = new Chart(document.getElementById("powerChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Power (W)",
                data: data,
                borderColor: "#fff",
                backgroundColor: "rgba(255,255,255,0.2)",
                fill: true
            }]
        }
    });
}

/* BILL */
document.getElementById("calculate-bill-btn").onclick = () => {
    let units = parseFloat(document.getElementById("live-units").innerText);
    let rate = parseFloat(document.getElementById("rate-input").value);

    let bill = units * rate;
    document.getElementById("bill-amount").innerText = "₹" + bill.toFixed(2);
};

/* REFRESH */
document.getElementById("refresh-btn").onclick = fetchData;

setInterval(fetchData, 15000);
fetchData();
function toggleTheme() {
    document.body.classList.toggle("dark");
}
