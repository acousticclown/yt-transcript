# Layout Components

Mobile-first layout components for consistent spacing and responsive behavior.

## Components

### Container

Responsive container with max-width and padding.

```tsx
<Container size="lg" padding>
  <div>Content</div>
</Container>
```

**Props:**
- `size`: `"sm" | "md" | "lg" | "xl" | "full"` - Max width constraint
- `padding`: `boolean` - Add responsive padding (default: `true`)
- `className`: Additional CSS classes

**Breakpoints:**
- Mobile: Full width, `px-4`
- Tablet (sm): `px-6`
- Desktop (lg): `px-8`

### Stack

Flex layout component for vertical or horizontal stacking.

```tsx
<Stack direction="row" gap={4} align="center" justify="between">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

**Props:**
- `direction`: `"row" | "col"` - Layout direction (default: `"col"`)
- `gap`: `1 | 2 | 3 | 4 | 5 | 6 | 8` - Spacing between items (default: `4`)
- `align`: `"start" | "center" | "end" | "stretch"` - Cross-axis alignment
- `justify`: `"start" | "center" | "end" | "between" | "around" | "evenly"` - Main-axis alignment
- `wrap`: `boolean` - Allow wrapping
- `as`: HTML element type (default: `"div"`)
- `className`: Additional CSS classes

### Grid

Responsive grid layout with mobile-first breakpoints.

```tsx
<Grid cols={{ mobile: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

**Props:**
- `cols`: Object with breakpoint-specific column counts
  - `mobile`: `1 | 2` - Mobile columns (default: `1`)
  - `sm`: `1 | 2 | 3` - Small screens (640px+)
  - `md`: `1 | 2 | 3 | 4` - Medium screens (768px+)
  - `lg`: `1 | 2 | 3 | 4 | 5 | 6` - Large screens (1024px+)
- `gap`: `1 | 2 | 3 | 4 | 5 | 6 | 8` - Spacing between items (default: `4`)
- `className`: Additional CSS classes

## Mobile-First Breakpoints

- **Mobile**: `0-639px` - Base styles
- **sm**: `640px+` - Small tablets
- **md**: `768px+` - Tablets, small laptops
- **lg**: `1024px+` - Desktops
- **xl**: `1280px+` - Large desktops

## Usage Example

```tsx
import { Container, Stack, Grid } from "@/components/layout";

export default function Page() {
  return (
    <Container size="xl">
      <Stack gap={8}>
        <h1>Title</h1>
        <Stack direction="row" gap={3}>
          <input />
          <button>Submit</button>
        </Stack>
        <Grid cols={{ mobile: 1, md: 2, lg: 3 }} gap={4}>
          <Card />
          <Card />
          <Card />
        </Grid>
      </Stack>
    </Container>
  );
}
```

