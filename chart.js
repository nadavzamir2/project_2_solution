async function cleanChart(symbols, chart) {
    chart.data.labels.push('');
    const coinsData = await getCoinsDataInUSD(symbols);
    chart.data.datasets.forEach(dataset => {
        dataset.data = [];   
    });
    chart.update(); 
};
init();

async function getCoinsDataInUSD(coins) {
    const url = `https://min-api.cryptocompare.com/data/pricemulti?tsyms=usd&fsyms=${coins.join(",")}`;
    try {
        const result = await fetch(url);
        return await result.json()
    } catch (err) {
        console.error(err);
        return [];
    }
}

function renderChartWithDataAndLabels(datasets, labels) {
    const ctx = document.getElementById('myChart');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets,
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    type: 'linear',
                    display: true,
                    position: 'left',

                }
            }
        }
    });
}

async function updateChart(symbols, chart) {
    chart.data.labels.push('');
    const coinsData = await getCoinsDataInUSD(symbols);
    symbols.forEach((s, index) => {
        chart.data.datasets[index].data.push(coinsData[s.toUpperCase()].USD)
    });
    chart.update();
}

async function init() {
    const labels = [''];
    const favorites = getFavorites();
    const favoritesWithData = await Promise.all(favorites.map(async (coinId) => {
        return await getCoinUpToDateData(coinId);
    }));
    const colors = ["red", "green", "blue", "pink", "black"];
    const symbols = favoritesWithData.filter(c => c && c.symbol).map(c => c.symbol);
    const coinsData = await getCoinsDataInUSD(symbols);
    const datasets = symbols.map((coin, index) => {
        return {
            label: coin,
            data: [coinsData[coin.toUpperCase()].USD],
            borderColor: colors[index]
        }
    });
    const newchart = renderChartWithDataAndLabels(datasets, labels);
    setInterval(() => updateChart(symbols, newchart), 1000);
    setInterval(() => cleanChart(symbols, newchart), 200000);
}
