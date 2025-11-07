# Cian Emulate API

This API endpoint uses Playwright to automate browser interaction with Cian.ru's property calculator, extracting real estate data and offer history.

## Endpoints

### GET `/api/cian-emulate`

Runs the Cian emulation script with default parameters.

**Request:**
```bash
curl http://localhost:3000/api/cian-emulate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "realEstateInfo": {
      "address": "Москва, улица Усиевича, 1",
      "totalArea": 52.7,
      "roomsCount": 2,
      "price": "17,0 млн ₽",
      "pricePerMeter": "322 тыс. ₽/м²",
      "estimatedValue": "17,0 млн ₽",
      "category": "flat"
    },
    "offersHistory": [
      {
        "date": "186 дней назад",
        "price": "17,0 млн ₽",
        "pricePerMeter": "322 тыс. ₽/м²",
        "source": "Продажа",
        "status": "active"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "error": "Failed to extract data from Cian",
  "data": null
}
```

### POST `/api/cian-emulate`

Runs the Cian emulation script with custom parameters (TODO: Implementation pending).

**Request:**
```bash
curl -X POST http://localhost:3000/api/cian-emulate \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Москва, Усиевича, 1",
    "roomNumber": "27",
    "roomsCount": 2,
    "area": 52.7
  }'
```

**Response:** Same as GET

## Configuration

- **Runtime:** Node.js
- **Max Duration:** 60 seconds
- **Browser:** Chromium (headless mode)
- **Dynamic:** Force dynamic (no caching)

## Data Types

### CianData
```typescript
interface CianData {
  realEstateInfo: RealEstateInfo;
  offersHistory: OfferHistoryItem[];
}
```

### RealEstateInfo
```typescript
interface RealEstateInfo {
  address: string;
  totalArea: number;
  roomsCount: number;
  price?: string;
  pricePerMeter?: string;
  estimatedValue?: string;
  category: string;
  [key: string]: unknown;
}
```

### OfferHistoryItem
```typescript
interface OfferHistoryItem {
  date: string;
  price: string;
  pricePerMeter?: string;
  source?: string;
  status?: string;
  [key: string]: unknown;
}
```

## Usage in Frontend

### Using fetch API
```typescript
// Simple GET request
const response = await fetch('/api/cian-emulate');
const result = await response.json();

if (result.success) {
  console.log(result.data.realEstateInfo);
  console.log(result.data.offersHistory);
}
```

### Using helper functions
```typescript
import { getCianData } from '@/lib/cian-emulate-client';

try {
  const data = await getCianData();
  console.log('Address:', data.realEstateInfo.address);
  console.log('Price:', data.realEstateInfo.price);
  console.log('History:', data.offersHistory);
} catch (error) {
  console.error('Failed to fetch Cian data:', error);
}
```

## How It Works

1. **Browser Launch**: Launches Chromium in headless mode
2. **Navigation**: Navigates to `https://www.cian.ru/my-home/`
3. **Form Filling**: 
   - Fills in address (with autocomplete)
   - Enters room number
   - Selects number of rooms
   - Enters total area
   - Disables "receive updates" checkbox
4. **Submission**: Clicks "Add new card" button
5. **Navigation**: Handles questionnaire (clicks "В другой раз")
6. **Data Extraction**: Opens reference object and extracts:
   - Real estate information
   - Offers history with prices and dates
7. **Return**: Returns structured CianData object

## Script Location

The main emulation script is located at:
```
playwright-scripts/cian/emulate.ts
```

It can also be run standalone:
```bash
# Headless mode
tsx playwright-scripts/cian/emulate.ts

# UI mode (visible browser)
tsx playwright-scripts/cian/emulate.ts --ui
npm run playwright:cian:ui
```

## Error Handling

The API handles various errors:
- Browser launch failures
- Navigation timeouts
- Element not found errors
- Data extraction failures

All errors are logged to console and returned as JSON:
```json
{
  "error": "Error message here",
  "data": null
}
```

## Performance Considerations

- **Timeout**: 60 seconds max (configurable via `maxDuration`)
- **Browser**: Runs in headless mode for better performance
- **No Caching**: Each request launches a fresh browser instance
- **Resource Intensive**: Consider rate limiting for production use

## Future Improvements

- [ ] Accept custom parameters via POST request body
- [ ] Implement caching for frequently requested properties
- [ ] Add retry logic for failed requests
- [ ] Implement queue system for multiple concurrent requests
- [ ] Add request rate limiting
- [ ] Save results to database
- [ ] Add support for different property types (commercial, land, etc.)
- [ ] Implement cookie/session management for authenticated requests

## Related Files

- `playwright-scripts/cian/emulate.ts` - Main emulation script
- `playwright-scripts/cian/extract-data.ts` - Data extraction logic
- `lib/cian-emulate-client.ts` - Client-side helper functions
- `PLAYWRIGHT.md` - Playwright documentation and setup guide

## Troubleshooting

### Browser not found
```bash
npx playwright install chromium
```

### Timeout errors
Increase `maxDuration` in `route.ts` or add `timeout` parameter to navigation:
```typescript
await page.goto(url, { timeout: 30000 });
```

### Anti-bot detection
The script may be blocked by Cian's anti-bot protection. Solutions:
- Use real user agent (already implemented)
- Add random delays between actions
- Use authenticated sessions
- Implement proxy rotation