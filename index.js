const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 5000;
const DATA_FILE = "trackedCoins.json";

app.use(cors());
app.use(express.json());

// Fetch crypto data from CoinGecko External API
app.get("/api/crypto", async (req, res) => {
    try {
        const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
            params: { vs_currency: "inr", order: "market_cap_desc", per_page: 10, page: 1 }
        });

        if (!Array.isArray(response.data)) {
            throw new Error("Invalid response format from CoinGecko");
        }

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching crypto data:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch crypto data" });
    }
});

const loadTrackedCoins = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE));
};

const saveTrackedCoins = (coins) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(coins, null, 2));
};

// Get all tracked coins
app.get("/api/tracked", (req, res) => {
    res.json(loadTrackedCoins());
});

// Add a tracked coin
app.post("/api/tracked", (req, res) => {
    const coins = loadTrackedCoins();
    if (!coins.some(coin => coin.id === req.body.id)) {
        coins.push(req.body);
        saveTrackedCoins(coins);
    }
    res.json({ message: "Coin added!" });
});

// Delete a tracked coin
app.delete("/api/tracked/:id", (req, res) => {
    let coins = loadTrackedCoins();
    coins = coins.filter(coin => coin.id !== req.params.id);
    saveTrackedCoins(coins);
    res.json({ message: "Coin deleted!" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
