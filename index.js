let globalCoins = []

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
        const isChecked = getFavorites().includes(coin.id);

        return `
      <div class="col">
        <div class="card card-custom p-3 rounded-4">
          <div id="coinData-${coin.id}" class="mb-4 text-capitalize fs-3">
            <div class="form-check form-switch fs-6 mb-3">
              <input onclick="switchClick(this, event, '${coin.id}')" class="form-check-input" type="checkbox" role="switch"
                     id="favSwitch-${coin.id}" ${isChecked ? "checked" : ""}>
              <label class="form-check-label fw-light fs-small fst-italic" for="favSwitch-${coin.id}">Favorite</label>
            </div>
            <div class="d-flex align-items-center gap-2">
              <img src="${coin.image}" alt="coin icon" class="img-fluid" style="width: 35px; height: 35px;">
              <h6 class="text-secondary m-0">${coin.symbol}</h6>
            </div>

            <div class="text-center"><h4>${coin.name}</h4></div>
          </div>

          <!-- Button to toggle collapse -->
          <button id="btn-${coin.id}" class="btn btn-primary mx-4" type="button"
                  onclick="toggleInfo('${coin.id}')">
            More Info
          </button>

          <!-- Collapsible info area -->
          <div class="collapse mt-3" id="collapseInfo-${coin.id}">
            <div id="infoContent-${coin.id}" class="card card-body">
              Loading...
            </div>
          </div>
        </div>
      </div>`;
    });

    document.getElementById("cards").innerHTML = cards.join('');
}
async function toggleInfo(coinId) {
    const btn = document.getElementById(`btn-${coinId}`);
    const collapseEl = document.getElementById(`collapseInfo-${coinId}`);
    const infoContent = document.getElementById(`infoContent-${coinId}`);
    const coinData = document.getElementById(`coinData-${coinId}`);
    const bsCollapse = new bootstrap.Collapse(collapseEl, {
        toggle: false
    });

    const isVisible = collapseEl.classList.contains('show');

    if (isVisible) {
        bsCollapse.hide();
        btn.textContent = "More Info";
        btn.classList.remove("btn-danger");
        btn.classList.add("btn-primary");
        coinData.style.display = "block";
    } else {
        infoContent.innerHTML = "Loading...";
        const result = await getCoinData(coinId);

        infoContent.innerHTML = `
      <div class="fs-6 fw-semibold"> Shekel price: ${Number(result.market_data.current_price.ils).toLocaleString()} ₪</div>
      <div class="fs-6 fw-semibold"> Dollar price: ${Number(result.market_data.current_price.usd).toLocaleString()} $</div>
      <div class="fs-6 fw-semibold"> Euro price: ${Number(result.market_data.current_price.eur).toLocaleString()} €</div>
    `;

        bsCollapse.show();
        btn.textContent = "Close Info";
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-danger");
        coinData.style.display = "none";
    }
}
function openReplaceModal(coinIdToSave) {
    const favorites = getFavorites();
    const container = document.getElementById("radioContainer");
    container.innerHTML = "";

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