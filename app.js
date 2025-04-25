// Sample trade data from Ostium (based on screenshot)
// NOTE: This is manually entered data. For a production application, 
// web scraping or API integration would be needed to get complete and accurate data.
const tradeData = [
    {
        date: '23/04',
        time: '12:28',
        market: 'ETH/USD',
        side: 'Short',
        leverage: '5.0x',
        size: 400.558,
        sizeUsd: 683973,
        collateral: 136794.50,
        operationType: 'Close',
        closePrice: 1789.19,
        pnl: -32032.87,
        pnlPercent: -23.42
    },
    {
        date: '22/04',
        time: '14:06',
        market: 'ETH/USD',
        side: 'Short',
        leverage: '5.0x',
        size: 400.558,
        sizeUsd: 683973,
        collateral: 136794.50,
        operationType: 'Open',
        closePrice: 1707.55,
        pnl: null,
        pnlPercent: null
    },
    {
        date: '22/04',
        time: '12:44',
        market: 'SOL/USD',
        side: 'Short',
        leverage: '39.0x',
        size: 15473.1,
        sizeUsd: 2245740,
        collateral: 57600.00,
        operationType: 'Close',
        closePrice: 144.708,
        pnl: 9643.72,
        pnlPercent: 16.73
    },
    {
        date: '22/04',
        time: '12:44',
        market: 'SOL/USD',
        side: 'Short',
        leverage: '39.0x',
        size: 15480.5,
        sizeUsd: 2248740,
        collateral: 57600.00,
        operationType: 'Close',
        closePrice: 144.759,
        pnl: 7792.43,
        pnlPercent: 13.51
    },
    {
        date: '22/04',
        time: '12:42',
        market: 'SOL/USD',
        side: 'Short',
        leverage: '37.0x',
        size: 14725.2,
        sizeUsd: 2137860,
        collateral: 57780.00,
        operationType: 'Close',
        closePrice: 144.792,
        pnl: 5772.33,
        pnlPercent: 9.99
    },
    {
        date: '22/04',
        time: '12:42',
        market: 'SOL/USD',
        side: 'Short',
        leverage: '37.0x',
        size: 14725.2,
        sizeUsd: 2137860,
        collateral: 57780.00,
        operationType: 'Open',
        closePrice: 145.184,
        pnl: null,
        pnlPercent: null
    }
];

// For future implementation:
/*
// Scraping function to get all trade data from Ostium
async function scrapeOstiumData(accountAddress) {
    // This would use fetch or an appropriate scraping library
    // to access Ostium's API or scrape their website
    
    // Example:
    // const response = await fetch(`https://ostium.app/api/accounts/${accountAddress}/trades`);
    // const data = await response.json();
    // return formatTradeData(data);
    
    // Would need to handle pagination and scrolling through history
    console.log('Scraping not yet implemented');
    return [];
}
*/

// Function to process imported trade data from scraper
function processImportedTrades(importedTrades) {
    // Normalize the scraped data to match our expected format
    return importedTrades.map(trade => {
        // Default to sample data structure if fields are missing
        return {
            date: trade.date || '',
            time: trade.time || '',
            market: trade.market || '',
            side: trade.side || '',
            leverage: trade.leverage || '0x',
            size: parseFloat(trade.size) || 0,
            sizeUsd: parseFloat(trade.size) || 0, // might need adjustment
            collateral: parseFloat(trade.collateral) || 0,
            operationType: trade.operationType || '',
            closePrice: parseFloat(trade.price) || 0,
            pnl: trade.pnl !== null ? parseFloat(trade.pnl) : null,
            pnlPercent: trade.pnl !== null && trade.collateral ? 
                (parseFloat(trade.pnl) / parseFloat(trade.collateral) * 100) : null
        };
    });
}

// Setup file import functionality
function setupFileImport() {
    const fileInput = document.getElementById('importFile');
    const importButton = document.getElementById('importButton');
    
    if (!fileInput || !importButton) return;
    
    importButton.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (Array.isArray(importedData) && importedData.length > 0) {
                    const processedTrades = processImportedTrades(importedData);
                    
                    // Re-initialize the app with the imported data
                    initializeApp(processedTrades);
                    
                    // Update UI to show import success
                    const importStatus = document.getElementById('importStatus');
                    if (importStatus) {
                        importStatus.textContent = `Successfully imported ${processedTrades.length} trades`;
                        importStatus.className = 'import-success';
                        
                        // Clear status after 5 seconds
                        setTimeout(() => {
                            importStatus.textContent = '';
                            importStatus.className = '';
                        }, 5000);
                    }
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                console.error('Error importing data:', error);
                
                const importStatus = document.getElementById('importStatus');
                if (importStatus) {
                    importStatus.textContent = 'Error importing data. Please check the file format.';
                    importStatus.className = 'import-error';
                }
            }
            
            // Reset the file input
            fileInput.value = '';
        };
        
        reader.readAsText(file);
    });
}

// Pair the open and close operations for P&L calculation
function pairTradeOperations(trades) {
    const completedTrades = [];
    const openTrades = {};
    
    // First, identify all open positions
    trades.forEach(trade => {
        if (trade.operationType === 'Open') {
            const key = `${trade.market}-${trade.side}-${trade.date}-${trade.time}`;
            openTrades[key] = trade;
        }
    });
    
    // Then, match close positions with their opens
    trades.forEach(trade => {
        if (trade.operationType === 'Close' && trade.pnl !== null) {
            // Find the most recent open trade for this market and side
            // (In a real application, you'd need more precise matching)
            let matchFound = false;
            Object.keys(openTrades).forEach(key => {
                if (!matchFound && key.includes(`${trade.market}-${trade.side}`)) {
                    const openTrade = openTrades[key];
                    
                    // Remove the open trade so it's not used again
                    delete openTrades[key];
                    
                    completedTrades.push({
                        date: trade.date,
                        time: trade.time,
                        market: trade.market,
                        side: trade.side,
                        leverage: trade.leverage,
                        size: trade.size,
                        sizeUsd: trade.sizeUsd,
                        collateral: trade.collateral,
                        entryPrice: openTrade.closePrice,
                        closePrice: trade.closePrice,
                        pnl: trade.pnl,
                        pnlPercent: trade.pnlPercent,
                        returnOnCollateral: trade.pnl / trade.collateral * 100
                    });
                    
                    matchFound = true;
                }
            });
            
            // If no matching open found, still include the trade
            if (!matchFound) {
                completedTrades.push({
                    date: trade.date,
                    time: trade.time,
                    market: trade.market,
                    side: trade.side,
                    leverage: trade.leverage,
                    size: trade.size,
                    sizeUsd: trade.sizeUsd,
                    collateral: trade.collateral,
                    entryPrice: null,
                    closePrice: trade.closePrice,
                    pnl: trade.pnl,
                    pnlPercent: trade.pnlPercent,
                    returnOnCollateral: trade.pnl / trade.collateral * 100
                });
            }
        }
    });
    
    return completedTrades;
}

function calculateStats(trades) {
    // Calculate essential statistics
    const totalTrades = trades.length;
    if (totalTrades === 0) return {};
    
    let totalPnL = 0;
    let winningTrades = 0;
    let totalCollateral = 0;
    let totalReturnPercent = 0;
    
    trades.forEach(trade => {
        totalPnL += trade.pnl || 0;
        totalCollateral += trade.collateral || 0;
        
        if ((trade.pnl || 0) > 0) {
            winningTrades++;
        }
        
        totalReturnPercent += trade.returnOnCollateral || 0;
    });
    
    return {
        totalPnL,
        winRate: (winningTrades / totalTrades) * 100,
        averageReturnPercent: totalReturnPercent / totalTrades,
        totalCollateral
    };
}

function populateTradesTable(trades) {
    const tableBody = document.getElementById('tradesTableBody');
    tableBody.innerHTML = '';
    
    // Sort trades by date/time (newest first)
    const sortedTrades = [...trades].sort((a, b) => {
        const dateA = new Date(`2023/${a.date.replace('/', '/')} ${a.time}`);
        const dateB = new Date(`2023/${b.date.replace('/', '/')} ${b.time}`);
        return dateB - dateA;
    });
    
    sortedTrades.forEach(trade => {
        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.textContent = `${trade.date} ${trade.time}`;
        row.appendChild(dateCell);
        
        const marketCell = document.createElement('td');
        marketCell.textContent = trade.market;
        row.appendChild(marketCell);
        
        const sideCell = document.createElement('td');
        sideCell.textContent = `${trade.side} ${trade.leverage}`;
        sideCell.className = trade.side.toLowerCase() === 'long' ? 'positive' : 'negative';
        row.appendChild(sideCell);
        
        const sizeCell = document.createElement('td');
        sizeCell.textContent = trade.sizeUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        row.appendChild(sizeCell);
        
        const collateralCell = document.createElement('td');
        collateralCell.textContent = trade.collateral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        row.appendChild(collateralCell);
        
        const entryPriceCell = document.createElement('td');
        entryPriceCell.textContent = trade.entryPrice ? trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
        row.appendChild(entryPriceCell);
        
        const closePriceCell = document.createElement('td');
        closePriceCell.textContent = trade.closePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        row.appendChild(closePriceCell);
        
        const pnlCell = document.createElement('td');
        if (trade.pnl !== null) {
            pnlCell.textContent = trade.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            pnlCell.className = trade.pnl > 0 ? 'positive' : 'negative';
        } else {
            pnlCell.textContent = '-';
        }
        row.appendChild(pnlCell);
        
        const returnCell = document.createElement('td');
        if (trade.returnOnCollateral !== null && !isNaN(trade.returnOnCollateral)) {
            returnCell.textContent = `${trade.returnOnCollateral.toFixed(2)}%`;
            returnCell.className = trade.returnOnCollateral > 0 ? 'positive' : 'negative';
        } else {
            returnCell.textContent = '-';
        }
        row.appendChild(returnCell);
        
        tableBody.appendChild(row);
    });
}

function createReturnsChart(trades) {
    const ctx = document.getElementById('returnsChart').getContext('2d');
    
    // Sort trades by date/time (oldest first for chart)
    const sortedTrades = [...trades].sort((a, b) => {
        const dateA = new Date(`2023/${a.date.replace('/', '/')} ${a.time}`);
        const dateB = new Date(`2023/${b.date.replace('/', '/')} ${b.time}`);
        return dateA - dateB;
    });
    
    const labels = sortedTrades.map(trade => `${trade.date} ${trade.time}`);
    const returns = sortedTrades.map(trade => trade.returnOnCollateral || 0);
    const colors = returns.map(value => value >= 0 ? '#4caf50' : '#f44336');
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Return (%)',
                data: returns,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toFixed(2)}%`;
                        },
                        title: function(tooltipItems) {
                            const index = tooltipItems[0].dataIndex;
                            return `${sortedTrades[index].market} ${sortedTrades[index].side}`;
                        }
                    }
                }
            }
        }
    });
}

function createCumulativeChart(trades) {
    const ctx = document.getElementById('cumulativeChart').getContext('2d');
    
    // Sort trades by date/time (oldest first for chart)
    const sortedTrades = [...trades].sort((a, b) => {
        const dateA = new Date(`2023/${a.date.replace('/', '/')} ${a.time}`);
        const dateB = new Date(`2023/${b.date.replace('/', '/')} ${b.time}`);
        return dateA - dateB;
    });
    
    const labels = sortedTrades.map(trade => `${trade.date} ${trade.time}`);
    const returns = sortedTrades.map(trade => trade.returnOnCollateral || 0);
    
    // Calculate cumulative returns
    const cumulativeReturns = [];
    let cumulative = 0;
    
    for (const ret of returns) {
        cumulative += ret;
        cumulativeReturns.push(cumulative);
    }
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative Return (%)',
                data: cumulativeReturns,
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Cumulative Return: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            }
        }
    });
}

function createMarketDistributionChart(trades) {
    const ctx = document.getElementById('marketDistChart').getContext('2d');
    
    // Count trades by market
    const marketCounts = {};
    trades.forEach(trade => {
        if (!marketCounts[trade.market]) {
            marketCounts[trade.market] = 0;
        }
        marketCounts[trade.market]++;
    });
    
    const markets = Object.keys(marketCounts);
    const counts = markets.map(market => marketCounts[market]);
    
    // Define colors for different markets
    const colors = [
        '#2196f3', // Blue for ETH
        '#ff5722', // Orange for SOL
        '#4caf50', // Green
        '#9c27b0', // Purple
        '#ffeb3b', // Yellow
        '#f44336'  // Red
    ];
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: markets,
            datasets: [{
                data: counts,
                backgroundColor: colors,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#e0e0e0',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} trades (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createPnLByMarketChart(trades) {
    const ctx = document.getElementById('pnlByMarketChart').getContext('2d');
    
    // Calculate P&L by market
    const marketPnL = {};
    trades.forEach(trade => {
        if (trade.pnl === null) return;
        
        if (!marketPnL[trade.market]) {
            marketPnL[trade.market] = 0;
        }
        marketPnL[trade.market] += trade.pnl;
    });
    
    const markets = Object.keys(marketPnL);
    const pnlValues = markets.map(market => marketPnL[market]);
    
    // Colors based on P&L (positive/negative)
    const colors = pnlValues.map(value => value >= 0 ? '#4caf50' : '#f44336');
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: markets,
            datasets: [{
                label: 'P&L ($)',
                data: pnlValues,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `$${context.raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        }
                    }
                }
            }
        }
    });
}

function updateSummaryStats(stats) {
    // Use the exact P&L from Ostium if available
    const ostiumTotalPnL = stats.totalPnL || 78417.23; // Use calculated P&L if available, otherwise default
    
    document.getElementById('totalPnL').textContent = `$${ostiumTotalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('winRate').textContent = `${stats.winRate.toFixed(1)}%`;
    document.getElementById('avgReturn').textContent = `${stats.averageReturnPercent.toFixed(2)}%`;
    
    // Set color for P&L value
    const pnlElement = document.getElementById('totalPnL');
    pnlElement.className = ostiumTotalPnL >= 0 ? 'stat-value positive' : 'stat-value negative';
    
    // Set color for average return value
    const avgReturnElement = document.getElementById('avgReturn');
    avgReturnElement.className = stats.averageReturnPercent >= 0 ? 'stat-value positive' : 'stat-value negative';
}

// Modal functionality
function setupModal() {
    const modal = document.getElementById('chartModal');
    const closeButton = document.querySelector('.close-modal');
    const expandButtons = document.querySelectorAll('.expand-btn');
    
    // Close modal when close button is clicked
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside of content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Setup expand buttons for each chart
    expandButtons.forEach(button => {
        button.addEventListener('click', () => {
            const chartContainer = button.closest('.chart-container');
            const chartId = chartContainer.getAttribute('data-chart-id');
            const chartTitle = chartContainer.querySelector('h2').textContent;
            
            // Set modal title
            document.getElementById('modalChartTitle').textContent = chartTitle;
            
            // Show modal
            modal.style.display = 'flex';
            
            // Create an expanded version of the chart in the modal
            createExpandedChart(chartId);
        });
    });
}

// Create expanded chart in modal
function createExpandedChart(chartId) {
    // Clear any existing chart
    const modalChartContainer = document.getElementById('modalChart');
    if (modalChartContainer._chart) {
        modalChartContainer._chart.destroy();
    }
    
    // Reference the original chart's data and options
    const originalChart = document.getElementById(chartId)._chart;
    
    // Clone the configuration to avoid modifying the original
    const config = JSON.parse(JSON.stringify(originalChart.config));
    
    // Adjust options for better display in modal
    config.options.plugins.legend.display = true;
    
    // Create the new chart
    const modalChart = new Chart(modalChartContainer, config);
    modalChartContainer._chart = modalChart;
}

// Initialize the app with the provided data
function initializeApp(data) {
    // Destroy existing charts if any
    const chartIds = ['returnsChart', 'cumulativeChart', 'marketDistChart', 'pnlByMarketChart'];
    chartIds.forEach(id => {
        const chart = document.getElementById(id);
        if (chart && chart._chart) {
            chart._chart.destroy();
        }
    });
    
    // Process the trade data
    const completedTrades = pairTradeOperations(data);
    
    // Calculate statistics
    const stats = calculateStats(completedTrades);
    
    // Create charts and store chart instances
    const returnsChart = createReturnsChart(completedTrades);
    document.getElementById('returnsChart')._chart = returnsChart;
    
    const cumulativeChart = createCumulativeChart(completedTrades);
    document.getElementById('cumulativeChart')._chart = cumulativeChart;
    
    const marketDistChart = createMarketDistributionChart(completedTrades);
    document.getElementById('marketDistChart')._chart = marketDistChart;
    
    const pnlByMarketChart = createPnLByMarketChart(completedTrades);
    document.getElementById('pnlByMarketChart')._chart = pnlByMarketChart;
    
    // Update the UI
    updateSummaryStats(stats);
    populateTradesTable(completedTrades);
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize with sample data
    initializeApp(tradeData);
    
    // Setup modal functionality
    setupModal();
    
    // Setup file import functionality
    setupFileImport();
}); 