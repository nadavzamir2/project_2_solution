async function getCoins() {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd"
    const json = await fetch(url).then(result => result.json()).catch((err) => {
        console.error(err);
        return [];
    });


    console.log(json);
    return json;
}

function renderCards(coins) {
    const cards = coins.map((coin) => {
        return `<div> ${coin.id}</div>`;
    });
    document.getElementById("cards").innerHTML = cards.join('')
}

async function init() {
    const coins = await getCoins();
    renderCards(coins);
}
init();