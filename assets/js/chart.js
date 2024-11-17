document.addEventListener('DOMContentLoaded', () => {
    initializeWidget();
    
})

function getThemeConfig() {
    const root = getComputedStyle(document.documentElement);
    const isDarkTheme = document.body.id === 'light-theme' ? false : true;
    console.log(isDarkTheme)
    const backGroundColor = root.getPropertyValue(isDarkTheme ? '--chart-dark-bg' : '--chart-light-bg').trim();
    const borderColor = root.getPropertyValue(isDarkTheme ? '--chart-dark-border' : '--chart-light-border').trim();
    
    return {
        autosize: true,
        symbol: "MARKETSCOM:BITCOIN",
        interval: "D",
        timezone: "Africa/Casablanca",
        theme: isDarkTheme ? 'Dark' : 'Light',
        style: "1",
        locale: "en",
        container_id: 'chart-widget',
        backGroundColor: backGroundColor,
        borderColor: borderColor,
        hide_side_toolbar:false,
        allow_symbol_change: true,
        save_image: true,
        details:true,
        calendar: false,
        support_host: "https://www.tradingview.com"
    }
}

function initializeWidget() {
    const widgetConfig = getThemeConfig();
    createWidget('chart-widget', widgetConfig, 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js')
    
}



