//_Recuperation of the global variables
const coinsCount = document.getElementById("coins-count");
const exchagesCount = document.getElementById("exchanges-count");
const marketCap = document.getElementById("marketCap");
const marketCapChangeElement = document.getElementById("marketCapChange");
const volume = document.getElementById("volume");
const dominance = document.getElementById("dominance");

document.addEventListener("DOMContentLoaded", () => {

    const themeToggle = document.getElementById('theme-toggle');
    const navBar = document.getElementById('nav-links');
    const body = document.body;

    let savedTheme = localStorage.getItem('theme');
       if (savedTheme) {
        body.id = savedTheme;
        updateIcon(savedTheme);
    }

    themeToggle.addEventListener('click', () => {
        if (body.id === 'light-theme') {
            body.id = 'dark-theme';
            localStorage.setItem('theme', body.id);
            updateIcon(body.id);
        } else {
            body.id = 'light-theme';
            updateIcon(body.id)
            localStorage.setItem('theme', body.id);
        } 
        if (typeof initializeWidget === 'function') {
            initializeWidget();
        }
    })
   
    function updateIcon(currentTheme) {
        if (currentTheme === 'light-theme') {
            themeToggle.classList.remove('ri-sun-line');
            themeToggle.classList.add('ri-moon-line');
        } else if (currentTheme === 'dark-theme') {
            themeToggle.classList.remove('ri-moon-line');
            themeToggle.classList.add('ri-sun-line');
        }    
    }

    const openMenubtn = document.getElementById('openMenu');
    const overlay = document.querySelector('.overlay');
    const closeMenubtn = document.getElementById('closeMenu');
    openMenubtn.addEventListener('click', () => {
        overlay.classList.add('show');
    })

    closeMenubtn.addEventListener('click', () => {
        overlay.classList.remove('show');
    })

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('show')
        }
    });
    fetchGlobal();


    const form = document.getElementById("searchForm");
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;

        window.location.href = `/../../pages/search.html?query=${query}`;
    })
    
})

function getLocalStorageData(key) {
    const storedData = localStorage.getItem(key);
    if (!storedData) return null;

    const parsedData = JSON.parse(storedData);
    const currentTime = Date.now();

    if (currentTime - parsedData.timestamp > 300000) {
        console.log('time is up for data')
        localStorage.removeItem(key);
        return null;
    }

    return parsedData.data;
}


function setLocalStorageData(key, data) {
    const storedData = {
        timestamp: Date.now(),
        data: data
    };
    localStorage.setItem(key, JSON.stringify(storedData));
}

async function fetchGlobal() {
    const localkey = 'Global_data';
    const localData = getLocalStorageData(localkey);

    if (localData) {
        displayGlobalData(localData);
        console.log('Global data from localstorage')
    }
    else {
        console.log('Global data from fetch url')
        const options = { method: 'GET', headers: { accept: 'application/json' } };
    
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/global', options);
    
            if (!response.ok) throw new Error("could not fetch ressource");
    
            const data = await response.json()
            const GlobalData = data.data;
            displayGlobalData(GlobalData);
            setLocalStorageData(localkey,GlobalData);
        }
        catch (error) {
            coinsCount.textContent = "N/A";
            exchagesCount.textContent = "N/A";
            marketCap.textContent = "N/A";
            marketCapChangeElement.textContent = "N/A";
            volume.textContent = "N/A";
            dominance.textContent = "BTC N/A% - ETH N/A%";
            console.error(error)
        }
    }
}

function displayGlobalData(globalData) {
    coinsCount.textContent = globalData.active_cryptocurrencies || "N/A";
    exchagesCount.textContent = globalData.markets || "N/A";
    marketCap.textContent = globalData.total_market_cap?.usd ? `$${(globalData.total_market_cap.usd / 1e12).toFixed(3)}T` : "N/A";
    const marketCapChange = globalData.market_cap_change_percentage_24h_usd;
    if (marketCapChange !== undefined) {
        const changetext = `${marketCapChange.toFixed(1)}%`;
        marketCapChangeElement.innerHTML = `${changetext} <i class="${marketCapChange < 0 ? 'red' : 'green'} ri-arrow-${marketCapChange < 0 ? 'down' : 'up'}-s-fill"></i>`;
        marketCapChangeElement.style.color = marketCapChange < 0 ? 'red' : 'green';
    } else {
        marketCapChangeElement.textContent = 'N/A';
    }

    volume.textContent = globalData.total_volume?.usd ? `$${(globalData.total_volume.usd / 1e9).toFixed(3)}B` : 'N/A';

    const btcdominance = globalData.market_cap_percentage?.btc ? `${globalData.market_cap_percentage.btc.toFixed(1)}%` : 'N/A';
    const ethDominance = globalData.market_cap_percentage?.eth ? `${globalData.market_cap_percentage.eth.toFixed(1)}%` : 'N/A';

    dominance.textContent = `BTC ${btcdominance} - ETH ${ethDominance}`;

}

function toggleSpinner(ListId, spinnerId, show) {
    const listElement = document.getElementById(ListId);
    const spinnerElement = document.getElementById(spinnerId);
    
    if (spinnerElement) {
        spinnerElement.style.display = show ? 'block' : 'none';
    }
    if (listElement) {
        listElement.style.display = show ? 'none' : 'block';
    }
}

function createTable(headers, fixedIndex = 0) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    table.appendChild(thead);

    const headerRow = document.createElement('tr');
    // console.log(headerRow);
    // console.log(headers);
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        if (index === fixedIndex) {
            th.classList.add('table-fixed-column');
        }
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    return table;
}

function createWidget(ContainerId, widgetConfig, widgetSrc) {
    const container = document.getElementById(ContainerId);
    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.classList.add('tradingview-widget-container__widget');
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = widgetSrc;
    script.async = true;
    script.innerHTML = JSON.stringify(widgetConfig);

    container.appendChild(script);

    setTimeout(() => {
        const copywrite = document.querySelector('.tradingview-widget-copyright');
        if (copywrite) {
            copywrite.classList.remove('hidden');
        }
    },5000)
}

const scrollTopBtn = document.getElementById('scrollTop');
window.onscroll = () => {
    scrollFunction();
}

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollTopBtn.style.display = 'flex';       
    } else {
        scrollTopBtn.style.display = 'none';
    }
}

function scrollToTop() {
    document.documentElement.scrollTop = 0;
}