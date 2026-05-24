# Currency Dropdown Implementation

## Overview
Implemented a clean, production-ready currency dropdown for the ApplyFlow job application form with consistent formatting across the application.

## Features Implemented

### 1. Centralized Currency Configuration
**File**: `src/lib/utils/currency.ts`

**Currencies Supported**:
- USD ($) - US Dollar
- EUR (€) - Euro
- GBP (£) - British Pound
- CAD (C$) - Canadian Dollar
- AUD (A$) - Australian Dollar
- SGD (S$) - Singapore Dollar
- AED (د.إ) - UAE Dirham
- ZMW (K) - Zambian Kwacha
- TRY (₺) - Turkish Lira
- JPY (¥) - Japanese Yen

**Utilities Provided**:
```typescript
// Get currency symbol by code
getCurrencySymbol(code: string): string

// Format salary with currency symbol
formatSalary(amount: number | null, currencyCode: string | null): string
```

### 2. Enhanced Currency Dropdown
**File**: `src/pages/ApplicationForm.tsx`

**Features**:
- Clean dropdown using shadcn/ui Select component
- Displays: Symbol + Code + Full Name (e.g., "$ USD - US Dollar")
- Default currency: USD
- Preserves existing saved values
- Mobile-friendly and responsive

**Display Format in Dropdown**:
```
$ USD - US Dollar
€ EUR - Euro
£ GBP - British Pound
C$ CAD - Canadian Dollar
A$ AUD - Australian Dollar
S$ SGD - Singapore Dollar
د.إ AED - UAE Dirham
K ZMW - Zambian Kwacha
₺ TRY - Turkish Lira
¥ JPY - Japanese Yen
```

### 3. Consistent Salary Display
**File**: `src/pages/ApplicationDetail.tsx`

**Display Format**:
- Uses `formatSalary()` utility for consistency
- Examples:
  - `$80,000` (USD)
  - `€65,000` (EUR)
  - `£55,000` (GBP)
  - `K18,000` (ZMW)
  - `₺450,000` (TRY)

**Features**:
- Automatic number formatting with commas
- Currency symbol prefix
- Handles null/empty values gracefully (shows "—")

## Implementation Details

### Currency Data Structure

```typescript
interface Currency {
  code: string;    // ISO 4217 code (e.g., "USD")
  symbol: string;  // Currency symbol (e.g., "$")
  name: string;    // Full name (e.g., "US Dollar")
}
```

### Default Behavior

1. **New Applications**: Default to USD
2. **Existing Applications**: Preserve saved currency
3. **Missing Currency**: Fallback to USD

### Formatting Logic

The `formatSalary()` function:
1. Returns "—" for null/empty amounts
2. Uses saved currency code or defaults to USD
3. Looks up currency symbol from CURRENCIES array
4. Formats number with locale-specific separators
5. Returns formatted string: `{symbol}{amount}`

## Files Modified/Created

### Created:
- `src/lib/utils/currency.ts` - Currency utilities and configuration

### Modified:
- `src/pages/ApplicationForm.tsx` - Enhanced currency dropdown
- `src/pages/ApplicationDetail.tsx` - Consistent salary display

## Usage Examples

### In Forms:
```typescript
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/utils/currency";

// Use in Select component
<Select value={currency} onValueChange={setCurrency}>
  <SelectContent>
    {CURRENCIES.map((currency) => (
      <SelectItem key={currency.code} value={currency.code}>
        {currency.symbol} {currency.code} - {currency.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### In Display Components:
```typescript
import { formatSalary } from "@/lib/utils/currency";

// Display formatted salary
<p>{formatSalary(app.salary, app.currency)}</p>
// Output: $80,000
```

## Benefits

1. **Consistency**: Single source of truth for currency data
2. **Maintainability**: Easy to add/remove currencies
3. **Type Safety**: TypeScript interfaces ensure correctness
4. **User-Friendly**: Clear dropdown with symbols and names
5. **International**: Supports global currencies
6. **Clean Code**: Centralized formatting logic

## Adding New Currencies

To add a new currency:

1. Open `src/lib/utils/currency.ts`
2. Add to the `CURRENCIES` array:
```typescript
{ code: "INR", symbol: "₹", name: "Indian Rupee" },
```
3. No other changes needed - dropdown and formatting will automatically include it

## Mobile Responsiveness

The currency dropdown:
- Uses native select behavior on mobile
- Scrollable list for easy selection
- Touch-friendly tap targets
- Consistent with other form dropdowns

## Testing Checklist

- [x] TypeScript compilation passes
- [ ] Create new application with different currencies
- [ ] Edit existing application and change currency
- [ ] View application detail with various currencies
- [ ] Test on mobile device
- [ ] Verify dropdown scrolling with 10 currencies
- [ ] Test with null/empty salary values
- [ ] Verify default currency (USD) is selected

## Future Enhancements (Optional)

1. **Currency Conversion**: Add exchange rate API integration
2. **Salary Ranges**: Support min/max salary with currency
3. **Localized Formatting**: Use browser locale for number formatting
4. **Currency Search**: Add search/filter in dropdown for large lists
5. **Recent Currencies**: Show recently used currencies at top

## Notes

- Currency symbols are displayed using Unicode characters
- Number formatting uses JavaScript's built-in `toLocaleString()`
- No external dependencies required
- Follows existing shadcn/ui design patterns
- Maintains consistency with other form fields
