# Stock Form (React + Vite)

A simple finance dashboard that lets users add stock purchases and displays the current price and profit/loss per entry. Prices are fetched from the Alpha Vantage `GLOBAL_QUOTE` API.

## Features
- Add stock purchases (symbol, quantity, purchase price)
- Stock list rendered as cards showing:
  - Symbol
  - Quantity
  - Purchase Price
  - Current Price (from Alpha Vantage)
  - Profit/Loss (green when positive, red when negative)
- State management using React Context (`StockContext`)
- Uses hooks: `useState`, `useEffect`, `useCallback`, `useContext`

## How to run locally
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
2. Install dependencies: install npm
3. Run dev server: npm run dev
4. Open the URL shown in terminal (typically): http://localhost:5173/

## API integration notes
    This project uses Alpha Vantage GLOBAL_QUOTE:

    Endpoint: https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SYMBOL&apikey=YOUR_KEY

    Rate limit handling (important)
    Alpha Vantage free tier can return rate-limit responses such as "Information" or "Note".
    When this happens, the app: Shows a short message: “API limit reached today — showing demo price.”

    Uses a fallback demo price to ensure Current Price and Profit/Loss still display for all entries.

## Bugs / challenges encountered and resolutions
    Context undefined / blank screen
    Cause: StockProvider was not wrapping the component tree.
    Fix: Wrapped <App /> with <StockProvider> in main.jsx.

    React warning: unique key prop
    Cause: list items were using non-unique keys.
    Fix: added unique id per stock entry (crypto.randomUUID()) and used it for keys.

    Alpha Vantage daily quota exceeded
    Cause: API returned "Information" rate-limit message instead of "Global Quote".
    Fix: detected rate-limit responses and used a fallback demo price while still showing a short note.

    CSS not applying / missing class
    Cause: file overwrite / incorrect file edits and a CSS syntax error (missing braces).
    Fix: corrected CSS structure, ensured styles.css is imported, and verified class usage.

## Improvements beyond baseline requirements
    Added robust API error handling and a fallback demo price to keep the UI functional during rate limits.
    Added polished card-based UI styling and consistent typography.
    Added a header image (branding) aligned to the left.
    Implemented queued fetching behavior to avoid rapid repeated API calls (free-tier friendly).
