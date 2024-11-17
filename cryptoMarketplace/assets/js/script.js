const tabDataLoaded = {
    tab1: false,
    tab2: false,
    tab3: false,
    tab4: false
};

function openTab(event, tabName) {
    const tabContent = document.querySelectorAll('.tab-content');
    const tabbuttons = document.querySelectorAll('.tab-button');

    tabContent.forEach(content => content.style.display = "none");
    tabbuttons.forEach(button => button.classList.remove('active'));

    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.classList.add('active');

    if (!tabDataLoaded[tabName]) {
        switch (tabName) {
            case 'tab1':
                fetchAndDisplay('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&par_page=20&page=1&sparkline=true', ['asset-list'],
                    displayAssets, tabName, 'assets_data');
                break;
            case 'tab2':
                fetchAndDisplay('https://api.coingecko.com/api/v3/exchanges', ['exhange-list'], displayExchanges, tabName, 'exchanges_data');
                break;
            case 'tab3':
                fetchAndDisplay('https://api.coingecko.com/api/v3/coins/categories', ['category-list'], displayCategories, tabName, 'categories_data');
                break;
            case 'tab4':
                fetchAndDisplay('https://api.coingecko.com/api/v3/companies/public_treasury/bitcoin', ['company-list'], displayCompanies, tabName, 'companies_data')
                break;

        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".tab-button").click();
    fetchAndDisplay('https://api.coingecko.com/api/v3/search/trending', ['coins-list', 'nfts-list'], displayTrends, 'trending_data');
})


async function fetchAndDisplay(url, idsoflist, displayFunction, tabName, localkeyname) {
    // console.log(`${idsoflist}${Date.now()}`);
    idsoflist.forEach(id => {
        const errorElement = document.getElementById(`${id}-error`);

        if (errorElement) {
            errorElement.style.display ='none';
        }

        toggleSpinner(id, `${id}-spinner`, true);
    }
    )
    const localKey = localkeyname;
    const localData = getLocalStorageData(localkeyname);

    if (localData) {
        console.log(`data from localstorage for ${tabName}`);
        displayFunction(localData);

        idsoflist.forEach(id => toggleSpinner(id, `${id}-spinner`, false));
        if (tabName) {
            tabDataLoaded[tabName] = true;
        }

    } else {
        console.log(`data from fetch url for ${tabName}`);
        try {
            const response = await fetch(url)

            if (!response.ok) throw new Error("API limit reached");

            const data = await response.json()

            displayFunction(data);
            setLocalStorageData(localKey, data);

            idsoflist.forEach(id => toggleSpinner(id, `${id}-spinner`, false));
            if (tabName) {
                tabDataLoaded[tabName] = true;
            }
            
        }
        catch (error) {
            console.log(error);
            idsoflist.forEach(id => {
                document.getElementById(`${id}-error`).style.display = 'block';
                toggleSpinner(id, `${id}-spinner`, true);
            })
            if(tabName) {
                tabDataLoaded[tabName] = true;
            }
        }
    }
   
}

function displayTrends(data) {
    // console.log(data);
    displayCoins(data.coins.slice(0, 5))
    displayNfts(data.nfts.slice(0,5))
}

function displayCoins(coins) {
    const coinsTable = document.getElementById("coins-list");
    coinsTable.innerHTML = '';
    const table = createTable(['Coin', 'Price', 'Market Cap', 'Volume', '24h%']);

    coins.forEach(coin => {
        const coinData = coin.item;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="name-column table-fixed-column">
                <img src="${coinData.thumb}" alt="${coinData.name}">
                    ${coinData.name}<span>(${coinData.symbol.toUpperCase()})</span>
            </td>
            <td>${parseFloat(coinData.price_btc).toFixed(6)}</td>
            <td>${coinData.data.market_cap}</td>
            <td>${coinData.data.total_volume}</td>
            <td class="${coinData.data.price_change_percentage_24h.usd >= 0 ? 'green' : 'red'}">${coinData.data.price_change_percentage_24h.usd.toFixed(2)}%</td>
        `;
        row.onclick = () => window.location.href = `pages/coin.html?coin=${coinData.id}`;
        table.appendChild(row);
    });
    coinsTable.appendChild(table);
}

function displayNfts(nfts) {
    const nftsTable = document.getElementById("nfts-list");
    nftsTable.innerHTML = '';
    const table = createTable(['NFT', 'Market', 'Price', '24h Vol', '24h%']);

    nfts.forEach(nft => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="name-column table-fixed-column">
                <img src="${nft.thumb}" alt="${nft.name}">
                    ${nft.name}<span>(${nft.symbol.toUpperCase()})</span>
            </td>
            <td>${nft.native_currency_symbol.toUpperCase()}</td>
            <td>${nft.data.floor_price}</td>
            <td>${nft.data.h24_volume}</td>
            <td class="${parseFloat(nft.data.floor_price_in_usd_24h_percentage_change) >= 0 ? 'green' : 'red'}">
            ${parseFloat(nft.data.floor_price_in_usd_24h_percentage_change).toFixed(2)}%</td>
        `;
        table.appendChild(row);
    });
    nftsTable.appendChild(table);
}

function displayAssets(data) {
    // console.log(data);
    const assets = data.slice(0, 10)
    const assetsTable = document.getElementById('asset-list');
    assetsTable.innerHTML = "";
    const table = createTable(['Rank', 'Coins', 'Price', '24h Price', '24h Price %', 'Total Vol', 'Market Cap', 'Last 7 Days'],1);
    const sparkLineData = [];

    assets.forEach(asset => {
        const row = document.createElement('tr');
        row.innerHTML = `
                <td class="rank">${asset.market_cap_rank}</td>
                <td class="name-column table-fixed-column"><img src="${asset.image}"
                        alt="${asset.name}">
                    ${asset.name} <span>(${asset.symbol.toUpperCase()})</span></td>
                <td>$${asset.current_price.toFixed(2)}</td>
                <td class="${asset.price_change_24h >= 0 ? 'green' : 'red'}">$${(asset.price_change_24h).toFixed(2)}</td>
                <td class="${asset.price_change_percentage_24h >= 0 ? 'green' : 'red'}">${(asset.price_change_percentage_24h).toFixed(2)}%</td>
                <td>$${asset.total_volume.toLocaleString()}</td>
                <td>$${asset.market_cap.toLocaleString() }</td>
                <td><canvas id="chart-${asset.id}" width="100" height="80"></canvas></td>
        `;
        table.appendChild(row);
        sparkLineData.push({
            id: asset.id,
            sparkLine: asset.sparkline_in_7d.price,
            color: asset.sparkline_in_7d.price[0] <= asset.sparkline_in_7d.price[asset.sparkline_in_7d.price.length - 1] ? "green" : "red"
        })
        row.onclick = () => window.location.href = `/pages/coin.html?coin=${asset.id}`;
    });
    assetsTable.appendChild(table);

    sparkLineData.forEach(({ id, sparkLine, color }) => {
        const ctx = document.getElementById(`chart-${id}`).getContext('2d');
        new  Chart(ctx, {
            type: 'line',
            data: {
                labels: sparkLine.map((_, index) => index),
                datasets: [
                    {
                        data: sparkLine,
                        borderColor: color,
                        fill: false,
                        pointRadius: 0,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: false,
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
    });
}

function displayExchanges(data) {
    // console.log(data);
    const exchanges = data.slice(0, 10)
    const ExchangesTable = document.getElementById('exhange-list');
    ExchangesTable.innerHTML = "";
    const table = createTable(['Rank', 'Market', 'Trust Score', '24h Trade', '24h Trade(Normal)', 'Country', 'Website', 'Year'], 1);

    exchanges.forEach(Exchange => {
        const row = document.createElement('tr');
        row.innerHTML = `
                <td class="rank">${Exchange.trust_score_rank}</td>
                <td class="name-column table-fixed-column"><img src="${Exchange.image}"
                        alt="${Exchange.name}">
                    ${Exchange.name} </td>
                <td>$${Exchange.trust_score}</td>
                <td class="${Exchange.trade_volume_24h_btc >= 0 ? 'green' : 'red'}">$${(parseFloat(Exchange.trade_volume_24h_btc).toFixed(2))}</td>
                <td class="${Exchange.trade_volume_24h_btc_normalized >= 0 ? 'green' : 'red'}">${(parseFloat(Exchange.trade_volume_24h_btc_normalized).toFixed(2))}%</td>
                <td>${Exchange.country}</td>
                <td>${Exchange.url}</td>
                <td>${Exchange.year_established}</td>
        `;
        table.appendChild(row);
    });
    ExchangesTable.appendChild(table);
}

function displayCategories(data) {
    // console.log(data);
    const Categories = data.slice(0, 10)
    const CategoriesTable = document.getElementById('category-list');
    CategoriesTable.innerHTML = "";
    const table = createTable(['Top Coins', 'Category', 'Market Cap', '24h Market Cap', '24h Volume'], 1);

    Categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
                <td><img src="${category.top_3_coins[0]}" alt="${category.top_3_coins_id[0]}">
                    <img src="${category.top_3_coins[1]}" alt="${category.top_3_coins_id[1]}">
                    <img src="${category.top_3_coins[2]}" alt="${category.top_3_coins_id[2]}">
                </td>
                <td>${category.name} </td>
                <td>$${category.market_cap}</td>
                <td class="${category.market_cap_change_24h >= 0 ? 'green' : 'red'}">${(parseFloat(category.market_cap_change_24h).toFixed(2))}%</td>
                <td>$${category.volume_24h}</td>
        `;
        table.appendChild(row);
    });
    CategoriesTable.appendChild(table);
}

function displayCompanies(data) {
    // console.log(data);
    const Holders = data.companies.slice(0, 10)
    const HoldersTable = document.getElementById('company-list');
    HoldersTable.innerHTML = "";
    const table = createTable(['Company', 'Total BTC', 'Entry Value', 'Total Current Value', 'Total %'], 0);

    Holders.forEach(Holder => {
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${Holder.name}</td>
                <td>${Holder.total_holdings} </td>
                <td>$${Holder.total_entry_value_usd}</td>
                <td>$${Holder.total_current_value_usd}</td>
                <td class="${Holder.percentage_of_total_supply >= 0 ? 'green' : 'red'}">${(parseFloat(Holder.percentage_of_total_supply).toFixed(2))}%</td>
        `;
        table.appendChild(row);
    });
    HoldersTable.appendChild(table);
}

//!comments :

//? disable the using of fetchData because if fetch data for all tables immediately istead we use openTab function and call
//?             fetchAndDisplay inside it so it fetch data only if the tab is clicked
//?  Promise.all() allows the code to fetch data from both APIs at the same time, rather than one after the other, saving time.
// async function fetchData() {
//     await Promise.all([
//         fetchAndDisplay('https://api.coingecko.com/api/v3/search/trending', ['coins-list', 'nfts-list'], displayTrends,'trending_data'
//         ),
//         fetchAndDisplay('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&par_page=20&page=1&sparkline=true', ['assets-list'], displayAssets,'assets_data'),
//         fetchAndDisplay('https://api.coingecko.com/api/v3/exchanges', ['exhange-list'],displayExchanges,'exchanges_data'),
//         fetchAndDisplay('https://api.coingecko.com/api/v3/coins/categories', ['category-list'],displayCategories,'categories_data'),
//         fetchAndDisplay('https://api.coingecko.com/api/v3/companies/public_treasury/bitcoin', ['company-list'],displayCompanies,'companies_data')
//     ])
// }