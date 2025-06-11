const storageKey = "favorites";
let globalCoins = []

// HINT: localStorage.set(`coin-data-${coinId}`, {timestamp: new Date(), data: coinData});
// HINT: localStorage.get(`coin-data-${coinId}`)

// HINT: localStorage.set(`all-coins`, {timestamp: new Date(), data: coinData});
// HiNT: localStorage.get(`all-coins`)

// get parameter of coinData/coinsData, assuming coinData has key names timestamp that is in type of Date
// the function return true if coinData is less than 2 hours
function isUpToDate(coinData) {
    if (isLessThanTwoHoursDifference(coinData.timestamp, new Date()) === true)
        return true;
    else
        return false;

}

// gets two parameters of type Date
// return true if difference in less than 2 hours
function isLessThanTwoHoursDifference(date1, date2) {
    const diffInMs = Math.abs(date2 - date1);
    const diffInHours = diffInMs / (1000 * 60 * 60);
    if (diffInHours < 2) {
        return true;
    }
    else
        return false;
}

// get coinId as string
// get item from local storage with key 'coin-data-<id>'
// if item exist -> check if less than 2 hours than now -> if less return item
// if item NOT exist OR more than 2 hours -> calls API (getCoinData) and set localeStorage item and return the data
function getCoinUpToDateData(coinId) {
    localStorage.setItem(`coin-data-${coinId}`, { timestamp: new Date(), data: coinData });
    localStorage.getItem(`coin-data-${coinId}`);
    const CoinString = localStorage.getItem(`coin-data-${coinId}`);
    const coinParsed = JSON.parse(CoinString);
    if (isLessThanTwoHoursDifference(coinParsed, new Date()) === true)
        return coinParsed;
    else
        getCoinData();

}

// get NO parameters
// get item from local storage with key 'all-coins'
// if item exist -> check if less than 2 hours than now -> if less return item
// if item NOT exist OR more than 2 hours -> calls API (getCoins) and set localeStorage item and return the data
function getCoinsUpToDateData() {
    localStorage.set(`all-coins`, { timestamp: new Date(), data: coinData });
    localStorage.get(`all-coins`);
    const allCoinString = localStorage.getItem("all-coins");
    const allCoinsArray = JSON.parse(allCoinString);
    if (isLessThanTwoHoursDifference(allCoinsArray, new Date()) === true)
        return allCoinsArray;
    else
        getCoins();
}

function switchClick(element, coinId) {
    if (element.checked === false) {
        removeCoinFromFavorites(coinId);
    }
    else {
        saveCoinToFavorites(coinId);
    }
}

// Will get the coinIdToReplace and print in console the favorites + console the coid Id to remove
function openModalForReplace(coidIdToReplace) {
    document.getElementById('submitOption').addEventListener('click', function () {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (selectedOption) {
            alert('You selected: ' + selectedOption.value);
        } else {
            alert('Please select an option.');
        }
    });
}


// Will get the search input element
// Will return all coins that include the input text (ignore upper/lower case)
function searchInputKeydown() {
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", async (event) => {
        console.log(searchInput.value)
        const results = findAllCoinsWithSearchTerm(searchInput.value, globalCoins);
        renderCards(results);
    })
}

function isIncluded(text, searchText) {
    return text.toLowerCase().includes(searchText.toLowerCase())
}

// return all coins that includes the search tem in their id/name/symbol (use the isSearchTermInCoin)
function findAllCoinsWithSearchTerm(searchTerm, coins) {
    return coins.filter((coin) => isIncluded(coin.id, searchTerm)
        || isIncluded(coin.name, searchTerm))
        || isIncluded(coin.symbol, searchTerm)
}
function searchButton() {
    console.log("button clicked");
}

function getFavorites() {
    const favoritesString = localStorage.getItem(storageKey);
    if (favoritesString) {
        const favoritesArray = JSON.parse(favoritesString)
        return favoritesArray;
    }
    else {
        return [];
    }
}
function saveCoinToFavorites(coinId) {
    const favorites = getFavorites();
    if (favorites.length >= 5) {

        throw Error("Up to 5 Items Allowed");
    }
    else {
        const index = favorites.findIndex((x) => x === coinId);
        if (index >= 0) {
            console.warn(`The Coin ${coinId} Already Exists In Favorites`);
        }
        else {
            favorites.push(coinId);
            const favoritesString = JSON.stringify(favorites);
            localStorage.setItem(storageKey, favoritesString);
        }
    }
}
function removeCoinFromFavorites(coinId) {
    const favorites = getFavorites();
    const index = favorites.findIndex((x) => x === coinId);
    if (index < 0) {
        console.warn(`The Coin ${coinId} Doesn't Exist In favorites`);
    }
    else {
        favorites.splice(index);
        const favoritesString = JSON.stringify(favorites);
        localStorage.setItem(storageKey, favoritesString);
    }
}
function replaceCoinInFavorites(coinIdToRemove, coinIdToSave) {
    removeCoinFromFavorites(coinIdToRemove);
    saveCoinToFavorites(coinIdToSave);

}
function clearFavorites() {
    localStorage.setItem(storageKey, JSON.stringify([]));

}
async function getCoins() {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
    try {
        const result = await fetch(url);
        return await result.json()
    } catch (err) {
        console.error(err);
        return [];
    }
}



function renderCards(coins) {
    const cards = coins.map((coin) => {
        const isChecked = getFavorites().findIndex((favorite) => coin.id === favorite) >= 0;
        return `<div class="col">
        <div class="card p-3"> 
            <div id="coinData-${coin.id}" class ="mb-4 p-3 text-capitalize fs-3"> 
                ${coin.id}

                <div class="form-check form-switch position-absolute top-0 end-0 fs-6">
                    <input onclick="switchClick(this, '${coin.id}')" class="form-check-input" type="checkbox" role="switch" id="favSwitch" ${isChecked ? "checked" : ""}>
                    <label class="form-check-label" for="favSwitch"> Add To Fav</label>
                </div>
            </div>
            <div class="collapse" id="collapseInfo-${coin.id}">
               bla bla
            </div>
            <button id="btn-${coin.id}" class="btn btn-primary" type="button" onclick="toggleInfo(this,'${coin.id}')">
            More Info
            </button>
            </div>
        </div>`;
    });
    document.getElementById("cards").innerHTML = cards.join('')
}

function closeInfo(coinId) {
    $(`#btn-${coinId}`).html("More info");
    $(`#coinData-${coinId}`).show();
    $(`#collapseInfo-${coinId}`).hide();
    $(`#btn-${coinId}`).removeClass("btn-danger").addClass("btn-primary");
}

async function showInfo(coinId) {
    const result = await getCoinData(coinId);
    document.getElementById(`collapseInfo-${coinId}`).innerHTML = `<b><div> Shekel price:${(result.market_data.current_price.ils).toFixed(2)} ₪</div>
    <div> Dollar price: ${(result.market_data.current_price.usd).toFixed(2)} <i class="bi bi-currency-dollar"></i> </div>
   <div>  Euro price: ${(result.market_data.current_price.eur).toFixed(2)} <i class="bi bi-currency-euro"></i></div>
     </b>`
    $(`#btn-${coinId}`).html("Close info");
    $(`#coinData-${coinId}`).hide();
    $(`#collapseInfo-${coinId}`).show();
    $(`#btn-${coinId}`).removeClass("btn-primary").addClass("btn-danger");



}

function toggleInfo(buttonElement, coinId) {
    if ($(`#collapseInfo-${coinId}`).is(":visible")) {
        closeInfo(coinId);
    } else {
        showInfo(coinId);
    }
}
async function getCoinData(coinId) {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;
    const json = await fetch(url).then(result => result.json()).catch(err => {
        console.error(err);
        return undefined;
    })
    return json;

}


async function init() {
    globalCoins = await getCoins();
    renderCards(globalCoins);
    searchInputKeydown();
    const form = document.getElementById("searchForm");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
    })
}
init();
