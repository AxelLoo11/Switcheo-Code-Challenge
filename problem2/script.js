const pricesUrl = "https://interview.switcheo.com/prices.json";
const tokenSvgUrl = "tokens";

let tokenPrices = {};
let currentModalType = null;

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

    } catch (error) {
        console.error("Error fetching token prices:", error);
        alert("Unable to fetch token prices. Please try again later.");
    }
}

function openModal(type) {
    currentModalType = type;
    const modal = document.getElementById("token-modal");
    modal.style.display = "flex";
    loadTokens(); // Load tokens into the modal
}

function closeModal() {
    const modal = document.getElementById("token-modal");
    modal.style.display = "none";
    currentModalType = null;
}

function loadTokens() {
    const tokenList = document.getElementById("token-list");
    tokenList.innerHTML = "";

    Object.entries(tokenPrices).forEach(([tokenName, tokenPrice]) => {
        const tokenIcon = `${tokenSvgUrl}/${tokenName.toLowerCase()}.svg`;

        const tokenItem = document.createElement("div");
        tokenItem.className = "token-item";
        tokenItem.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${tokenIcon}" alt="${tokenName} Icon" />
            <span>${tokenName}</span>
          </div>
        `;
        tokenItem.onclick = () => selectToken({ name: tokenName, icon: tokenIcon });
        tokenList.appendChild(tokenItem);
    });
}

function filterTokens() {
    const query = document.getElementById("search-bar").value.toLowerCase();
    const filteredTokens = Object.entries(tokenPrices).filter(([tokenName]) =>
        tokenName.toLowerCase().includes(query)
    );

    console.log(JSON.stringify(filteredTokens));

    const tokenList = document.getElementById("token-list");
    tokenList.innerHTML = "";

    Object.entries(filteredTokens).forEach((token) => {
        const tokenPair = token[1];
        const tokenName = tokenPair[0];
        const tokenIcon = `${tokenSvgUrl}/${tokenName.toLowerCase()}.svg`;
        const tokenItem = document.createElement("div");
        tokenItem.className = "token-item";
        tokenItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${tokenIcon}" alt="${tokenName} Icon" />
            <span>${tokenName}</span>
            </div>
        `;
        tokenItem.onclick = () => selectToken({ name: tokenName, icon: tokenIcon });
        tokenList.appendChild(tokenItem);
    });
}

function selectToken(token) {
    if (currentModalType === "send") {
        document.getElementById("send-token-icon").src = token.icon;
        document.getElementById("send-token-name").innerText = token.name;
    } else if (currentModalType === "receive") {
        document.getElementById("receive-token-icon").src = token.icon;
        document.getElementById("receive-token-name").innerText = token.name;
    }
    closeModal();
    calcReceiveAmt();
}

function calcReceiveAmt() {
    const inputAmt = document.getElementById("input-amount").value;
    const sendAmt = parseFloat(inputAmt);

    const sendToken = document.getElementById("send-token-name").innerText;
    const receiveToken = document.getElementById("receive-token-name").innerText;

    if (isNaN(sendAmt) || sendAmt <= 0 || receiveToken === "Select") {
        document.getElementById("output-amount").value = "0.0";
        return;
    }

    if (sendToken && receiveToken && tokenPrices[sendToken] && tokenPrices[receiveToken]) {
        const rate = tokenPrices[sendToken] / tokenPrices[receiveToken];
        const receiveAmount = sendAmt * rate;
        document.getElementById("output-amount").value = receiveAmount.toFixed(6);
    } else {
        document.getElementById("output-amount").value = "0.0";
    }
}

function mockSubmit(event) {
    event.preventDefault();
    alert("Swap confirmed!");
}

window.onclick = function (event) {
    const modal = document.getElementById("token-modal");
    if (event.target === modal) {
        closeModal();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    fetchTokenPrices();

    document.getElementById("input-amount").addEventListener("input", calcReceiveAmt);

    document.querySelector("form").addEventListener("submit", mockSubmit);
});
