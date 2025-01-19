const pricesUrl = "https://interview.switcheo.com/prices.json";
let tokenPrices = {};

async function fetchTokenPrices() {
    try {
        const res = await fetch(pricesUrl);
        if (!res.ok) throw new Error("Failed to fetch token prices.");

        const data = await res.json();

        data.sort((a, b) => {
            if (a.currency < b.currency) return -1;
            if (a.currency > b.currency) return 1;

            return new Date(a.date) - new Date(b.date);
        });

        // use the latest price
        for (const item of data) {
            tokenPrices[item.currency] = item.price;
        }

        // fill the token dropdowns
        fillTokenPricesDropdown();
    } catch (error) {
        console.error("Error fetching token prices:", error);
        alert("Unable to fetch token prices. Please try again later.");
    }
}

function fillTokenPricesDropdown() {
    const sendTokenDropdown = document.getElementById("send-token");
    const receiveTokenDropdown = document.getElementById("receive-token");

    for (const token in tokenPrices) {
        const option = document.createElement("option");
        option.value = token;
        option.textContent = token;
        sendTokenDropdown.appendChild(option.cloneNode(true));
        receiveTokenDropdown.appendChild(option.cloneNode(true));
    }
}

function calcReceiveAmt() {
    const inputAmt = document.getElementById("input-amount").value;

    const sendAmt = parseFloat(inputAmt);
    const sendToken = document.getElementById("send-token").value;
    const receiveToken = document.getElementById("receive-token").value;

    if (isNaN(sendAmt) || sendAmt <= 0) {
        document.getElementById("output-amount").value = "Invalid amount";
        return;
    }

    if (sendToken && receiveToken && tokenPrices[sendToken] && tokenPrices[receiveToken]) {
        const rate = tokenPrices[sendToken] / tokenPrices[receiveToken];
        const receiveAmount = sendAmt * rate;
        document.getElementById("output-amount").value = receiveAmount.toFixed(6);
    } else {
        document.getElementById("output-amount").value = "Invalid token pair";
    }
}

function mockSubmit(event) {
    event.preventDefault();
    alert("Swap confirmed!");
}

document.addEventListener("DOMContentLoaded", () => {
    fetchTokenPrices();

    document.getElementById("input-amount").addEventListener("input", calcReceiveAmt);
    document.getElementById("send-token").addEventListener("change", calcReceiveAmt);
    document.getElementById("receive-token").addEventListener("change", calcReceiveAmt);

    document.querySelector("form").addEventListener("submit", mockSubmit);
});