const coinsList = document.getElementById('coins-list');
const exchangeList = document.getElementById('exchangesearch-list');
const nftsList = document.getElementById('nfts-list');


document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    if (query) {
        fetchSearchResults(query, ['coins-list', 'exchangesearch-list', 'nfts-list'])
    } else {
        const searchHeading = document.getElementById('seachHeading');
        const searchContainer = document.querySelector('.search-container');
        searchContainer.innerHTML = `<p style="color: red;text-align: center;margin-bottom: 8px">Waiting for Input...</p>`
        searchHeading.innerHTML = `Please search something`;
    }
})
async function fetchSearchResults(param, listToToggle) {

    listToToggle.forEach(id => {
        const errorElement = document.getElementById(`${id}-error`);

        if (errorElement) {
            errorElement.style.display = 'none';
        }

        toggleSpinner(id, `${id}-spinner`, true);
    })

    const searchHeading = document.getElementById('seachHeading');
    searchHeading.innerHTML = `Search results for "${param}"`;
    
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${param}`);

        if (!response.ok) throw new Error('Error fetching data');

        const data = await response.json();
        
        let coins = (data.coins || []).filter(coin => coin.thumb !=="missing_thumb.png")
        let nfts = (data.nfts || []).filter(ex => ex.thumb !=="missing_thumb.png")
        let exchanges = (data.exchanges || []).filter(nf => nf.thumb !== "missing_thumb.png")


        let coinscount = coins.length;
        let exchangescount = exchanges.length;
        let nftscount = nfts.length;
        
        let minCount = Math.min(coinscount, exchangescount, nftscount)

        if (coinscount > 0 && exchangescount > 0 && nftscount > 0) {
            coins=coins.slice(0,minCount)
            exchanges=exchanges.slice(0,minCount)
            nfts=nfts.slice(0,minCount)
        }

        coinsresults(coins);
        exchangesresults(exchanges);
        nftsresults(nfts);
        

        if (coins.length === 0) {
            coinsList.innerHTML=`<p style="color:red; text-align: center;">No Results found for coins</p>`
        }
        if (exchanges.length === 0) {
            exchangeList.innerHTML=`<p style="color:red; text-align: center;">No Results found for exchanges</p>`
        }
        if (nfts.length === 0) {
            nftsList.innerHTML=`<p style="color:red; text-align: center;">No Results found for nfts</p>`
        }

        listToToggle.forEach(id => toggleSpinner(id, `${id}-spinner`, false));
    }
    catch (error) {
        console.log(error)
        listToToggle.forEach(id => {
            document.getElementById(`${id}-error`).style.display = 'block';
            toggleSpinner(id, `${id}-spinner`, true);
        })
    }
}

function coinsresults(coins) {
    coinsList.innerHTML = "";
    const table = createTable(['Rank', 'Coin']);

    coins.forEach(coin => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${coin.market_cap_rank}</td>
            <td class="name-column">
                <img src="${coin.thumb}" alt="${coin.name}">
                    ${coin.name}<span>(${coin.symbol.toUpperCase()})</span>
            </td>
        `;
        row.onclick = () => window.location.href = `../../pages/coin.html?coin=${coin.id}`;
        table.appendChild(row);
    });
    coinsList.appendChild(table);
}

function exchangesresults(exchanges) {
    exchangeList.innerHTML = "";
    const table = createTable(['Exchange', 'Market']);

    exchanges.forEach(exchange => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="name-column">
                <img src="${exchange.thumb}" alt="${exchange.name}">
                    ${exchange.name}
            </td>
            <td>${exchange.market_type}</td>
        `;
        table.appendChild(row);
    });
    exchangeList.appendChild(table);
}
function nftsresults(nfts) {
    nftsList.innerHTML = "";
    const table = createTable(['Nft', 'Symbol']);

    nfts.forEach(nft => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="name-column">
                <img src="${nft.thumb}" alt="${nft.name}">${nft.name}</td>
            <td class="name-column">${nft.symbol.toUpperCase()}</td>
        `;
        table.appendChild(row);
    });
    nftsList.appendChild(table);
}