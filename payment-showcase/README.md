# Changelly UI

This is an Angular frontend application that provides a modern interface for interacting with the Changelly API through our backend service.

## Features

- **Currency Selection**: Browse and select from hundreds of available currencies
- **Type Filtering**: Filter currencies by type (Fiat or Cryptocurrency)
- **Search Functionality**: Search currencies by name or ticker symbol
- **Rich Currency Details**: View detailed information including icons, networks, and protocols
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live filtering and search results

## Currency Types

### Fiat Currencies
Traditional government-issued currencies like USD, EUR, GBP, etc.
- Display precision: 2 decimal places
- Includes major world currencies
- No blockchain network information

### Cryptocurrencies
Digital currencies like Bitcoin, Ethereum, and other tokens
- Display precision: 8 decimal places
- Includes network and protocol information
- Supports various blockchain networks (Ethereum, Bitcoin, etc.)

## UI Components

### Currency Filters
- **Type Dropdown**: Filter by "All", "Fiat", or "Crypto"
- **Search Input**: Real-time search by currency name or ticker
- **Results Counter**: Shows filtered results vs total available

### Currency Selection
- **Dropdown Selector**: Choose from filtered currencies
- **Currency Cards**: Visual preview of available currencies
- **Selected Currency Details**: Comprehensive information display

### Currency Details Display
- **Currency Icon**: High-quality colored icons from Changelly
- **Basic Information**: Name, ticker, and type badge
- **Technical Details**: Precision, network, protocol, and provider count
- **Visual Indicators**: Color-coded type badges and selection states

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
ng serve
```

3. Open your browser and navigate to `http://localhost:4200`

### Backend Integration

Make sure the backend API is running at `http://localhost:3000` before using the frontend.

## API Integration

The application communicates with the following backend endpoints:

- `GET /currencies` - Fetch all currencies
- `GET /currencies/type/:type` - Filter by currency type
- `GET /currencies/ticker/:ticker` - Get specific currency details

## Styling

The application uses modern CSS with:
- Flexbox and Grid layouts
- Smooth transitions and hover effects
- Responsive design patterns
- Color-coded type indicators
- Card-based UI components

## Development

### Build
```bash
ng build
```

### Running unit tests
```bash
ng test
```

### Running end-to-end tests
```bash
ng e2e
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

## Error Handling

The application includes comprehensive error handling:
- Loading states with spinners
- Error messages with retry functionality
- Graceful fallbacks for missing data
- Network error recovery
