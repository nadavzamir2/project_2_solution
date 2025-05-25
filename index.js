const storageKey = "favorites";


// If element is checked -> change element not checked + removeFromFavorites
// If element is NOT checked -> change element to checked + saveTo Faovrites

// If saveToFavorites throws error -> Open modal for selecting what to remove

function switchClick(element, coidId) {

}

// Will get the coinIdToReplace and print in console the favorites + console the coid Id to remove
function openModalForReplace(coidIdToReplace) {

}


// Will get the search input element
// Will return all coins that include the input text (ignore upper/lower case)
function searchInputKeydown(element) {

}


// Wiil return true inf searchTerm is inside the coid id / name / symbol
function isSearchTermInCoin(searchTerm, coidData) {

}

// return all coins that includes the search tem in their id/name/symbol (use the isSearchTermInCoin)
function findAllCoinsWithSearchTerm(searchTerm, coins) {

}


function getFavorites() {
    const favoritesString = localStorage.getItem(storageKey);
    if (favoritesString) {
        const favoritesArray = JSON.parse(favoritesString)
        return favoritesArray;
    } else {
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