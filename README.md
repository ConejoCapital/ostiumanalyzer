# Ostium Analyzer

An analytical dashboard for examining trading performance on the Ostium Perpetual Trading Platform.

## Overview

This web application provides detailed analysis of trading performance for Ostium accounts, focusing on percentage returns based on collateral. It visualizes key performance metrics including:

- Total Profit and Loss
- Win Rate
- Average Return per Trade
- Return by Trade (percentage)
- Cumulative Return (percentage)
- Detailed Trade History Table

## Features

- **Performance Summary**: Quick overview of key trading metrics
- **Return Visualization**: Charts showing individual trade returns and cumulative performance
- **Trade History**: Detailed table of all executed trades with key data
- **Return Calculation**: Accurate calculation of percentage returns based on collateral

## How to Use

1. **Local Setup**:
   - Clone this repository
   - Open `index.html` in your web browser
   - No server or installation required
   - Alternatively, start a simple server: `python3 -m http.server 8000`

2. **Online Demo**:
   - Access the live demo at [GitHub Pages](https://conejocapital.github.io/ostiumanalyzer/) (if enabled)

## Data Source

**Current Implementation**:
- Using sample static data based on the account: `0x2e93f627bf36480b3ab1065dcbee95350bc7c99c`
- Data is manually entered and limited to visible trades in screenshots

**Planned Implementation**:
- Direct integration with Ostium API (if available)
- Web scraping functionality to automatically extract all trade history
- Handling pagination/scrolling to capture complete trade history
- Real-time data updates

To analyze a different account currently, modify the `tradeData` array in `app.js` with the relevant trading data.

## Implementing Data Scraping

For a complete implementation, we would need to:

1. **API Integration** (preferred method):
   - Integrate with Ostium's API if they provide one
   - Implement proper authentication and rate limiting
   - Handle pagination for large trade histories

2. **Web Scraping** (alternative):
   - Use Puppeteer, Playwright or similar tools to automate browser interaction
   - Implement scrolling through trade history to load all trades
   - Extract data from DOM elements
   - Handle authentication and session management

3. **Data Processing**:
   - Match open/close operations for accurate P&L calculation
   - Calculate proper returns on collateral
   - Handle different types of operations (open, close, canceled, etc.)

## Future Enhancements

- Direct integration with Ostium API
- Support for real-time data updates
- Filtering and date range selection
- Additional performance metrics and visualizations
- Custom alerts and notifications

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

By submitting a pull request, you agree to the terms outlined in the CLA which grants ConejoCapital the rights to use your contributions.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js for data visualization

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 ConejoCapital 