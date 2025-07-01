const storageKey = "favorites";

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

async function getCoinData(coinId) {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;
    const json = await fetch(url).then(result => result.json()).catch(err => {
        console.error(err);
        return undefined;
    })
    return json;

}

async function cacheData(cacheKey, apiCall, cacheTimeInHours) {
    const cachedItemSting = localStorage.getItem(cacheKey);
    if (cachedItemSting) {
        const parsedItem = JSON.parse(cachedItemSting);
        const itemDate = new Date(parsedItem.timestamp);
        const isUpToDate = isTimeDifferenceLessThan(itemDate, new Date(), cacheTimeInHours);
        if (isUpToDate) {
            return parsedItem.data;
        }
    }
    const data = await apiCall();
    localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: new Date(),
        data: data,
    }))
    return data;
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

function isTimeDifferenceLessThan(date1, date2, gapInHours) {
    const diffInMs = Math.abs(date2 - date1);
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return diffInHours < gapInHours;
}


async function getCoinUpToDateData(coinId) {
    return cacheData(`coin-data-${coinId}`, () => getCoinData(coinId), 2)
}