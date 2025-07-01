
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


async function getCoinsUpToDateData() {
    return cacheData('all-coins', getCoins, 2);
}

function switchClick(element, event, coinId) {
    if (element.checked === false) {
        removeCoinFromFavorites(coinId);
    }
    else {
        saveCoinToFavoritesWithLimit(coinId, element);
    }
}

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

function findAllCoinsWithSearchTerm(searchTerm, coins) {
    return coins.filter((coin) => isIncluded(coin.id, searchTerm)
        || isIncluded(coin.name, searchTerm))
        || isIncluded(coin.symbol, searchTerm)
}

function searchButton() {
    console.log("button clicked");
}

function saveCoinToFavoritesWithLimit(coinId, element) {
    const favorites = getFavorites();
    if (favorites.length >= 5) {
        openReplaceModal(coinId);
        element.checked = false;
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

function saveCoinToFavorites(coinId) {
    const favorites = getFavorites();
    favorites.push(coinId);
    const favoritesString = JSON.stringify(favorites);
    localStorage.setItem(storageKey, favoritesString);
}


function removeCoinFromFavorites(coinId) {
    const favorites = getFavorites();
    const index = favorites.findIndex((x) => x === coinId);
    if (index < 0) {
        console.warn(`The Coin ${coinId} Doesn't Exist In favorites`);
    }
    else {
        favorites.splice(index, 1);
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
            <div id="coinData-${coin.id}" class ="mb-4 text-capitalize fs-3"> 
                <div class="form-check form-switch fs-6 mb-3">
                    <input onclick="switchClick(this, event, '${coin.id}')" class="form-check-input" type="checkbox" role="switch" id="favSwitch-${coin.id}" ${isChecked ? "checked" : ""}>
                    <label class="form-check-label" for="favSwitch-${coin.id}">Favorite</label>
                </div>
                <span style="display: flex; justify-content: center; align-items: center;">
               <h4>${coin.name}</h4></span>
            </div>
            <div class="collapse" id="collapseInfo-${coin.id}"></div>
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
    document.getElementById(`collapseInfo-${coinId}`).innerHTML = `<b><div> Shekel price:${Number((result.market_data.current_price.ils).toFixed(2)).toLocaleString()} ₪</div>
    <div> Dollar price: ${Number((result.market_data.current_price.usd).toFixed(2)).toLocaleString()} <i class="bi bi-currency-dollar"></i> </div>
   <div>  Euro price: ${Number((result.market_data.current_price.eur).toFixed(2)).toLocaleString()} <i class="bi bi-currency-euro"></i></div>
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


async function init() {
    globalCoins = await getCoinsUpToDateData();
    renderCards(globalCoins);
    searchInputKeydown();
    const form = document.getElementById("searchForm");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
    })
}
init();



function openReplaceModal(coinIdToSave) {
    const favorites = getFavorites();
    const container = document.getElementById("radioContainer");
    container.innerHTML = ""; // Clear existing content

    favorites.forEach((item, index) => {
        const id = `option${index}`;
        container.innerHTML += `
      <label>
        <input type="radio" name="replaceOption" value="${item}" id="${id}">
        ${item}
      </label><br>
    `;
    });

    const hiddenInput = document.getElementById("coinIdToSave");
    hiddenInput.value = coinIdToSave;
    document.getElementById("replaceModal").style.display = "block";
}

function closeReplaceModal() {
    document.getElementById("replaceModal").style.display = "none";
    document.getElementById("coinIdToSave").value = '';
}

function getSelectedCoinToRemove() {
    const radios = document.getElementsByName("replaceOption");
    let selected = null;
    for (const radio of radios) {
        if (radio.checked) {
            selected = radio.value;
            break;
        }
    }
    return selected;
}

function getSelectedCoinToSave() {
    return document.getElementById("coinIdToSave").value;
}

function submitReplaceOption() {
    const coinIdToRemove = getSelectedCoinToRemove();
    const coinIdToSave = getSelectedCoinToSave();
    if (coinIdToRemove) {
        console.log("You selected: " + coinIdToRemove);
        replaceCoinInFavorites(coinIdToRemove, coinIdToSave);
        const switchToDisable = document.getElementById(`favSwitch-${coinIdToRemove}`);
        const switchToEnable = document.getElementById(`favSwitch-${coinIdToSave}`);
        switchToDisable.checked = false;
        switchToEnable.checked = true;
        closeReplaceModal();
    } else {
        alert("Please select a replacement option.");
    }
}