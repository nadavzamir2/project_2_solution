const storageKey = "favorites";
let globalCoins = []


// If element is checked -> change element not checked + removeFromFavorites
// If element is NOT checked -> change element to checked + saveTo Faovrites

// If saveToFavorites throws error -> Open modal for selecting what to remove

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


// Wiil return true inf searchTerm is inside the coin id / name / symbol
function isSearchTermInCoin(searchTerm, coidData) {

}

function isNeedHelp(age) {
    return age < 8 || age > 70;
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
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd"
    const json = await fetch(url).then(result => result.json()).catch((err) => {
        console.error(err);
        return [];
    });
    return json;
}
function renderCards(coins) {
    const cards = coins.map((coin) => {
        const isChecked = getFavorites().findIndex((favorite) => coin.id === favorite) >= 0;
        return `<div> ${coin.id}
        <div class="form-check form-switch">
  <input onclick="switchClick(this, '${coin.id}')" class="form-check-input" type="checkbox" role="switch" id="favSwitch" ${isChecked ? "checked" : ""}>
  <label class="form-check-label" for="favSwitch">Favorite</label>
</div>
        </div>`;
    });
    document.getElementById("cards").innerHTML = cards.join('')
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