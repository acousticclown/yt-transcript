# Browser Support

## Supported Browsers

YT-Transcript v1.1.0 is tested and supported on the following browsers:

### Desktop
- **Chrome** 90+ ✅
- **Firefox** 88+ ✅
- **Safari** 14+ ✅
- **Edge** 90+ ✅

### Mobile
- **iOS Safari** 14+ ✅
- **Chrome Android** 90+ ✅
- **Samsung Internet** 14+ ✅

## Features by Browser

### CSS Features
- **Backdrop Filter**: Supported in all modern browsers
  - Chrome/Edge: ✅
  - Firefox: ✅ (enabled by default in 103+)
  - Safari: ✅
- **CSS Variables**: ✅ All supported browsers
- **Grid/Flexbox**: ✅ All supported browsers

### JavaScript Features
- **ES6+**: ✅ All supported browsers
- **Framer Motion**: ✅ All supported browsers
- **Dnd-kit**: ✅ All supported browsers

### Dark Mode
- **prefers-color-scheme**: ✅ All supported browsers
- **System theme detection**: ✅ All supported browsers

## Known Issues

### None Currently

All features work consistently across supported browsers.

## Testing Checklist

- [x] Chrome (desktop)
- [x] Firefox (desktop)
- [x] Safari (desktop)
- [x] Edge (desktop)
- [x] iOS Safari (mobile)
- [x] Chrome Android (mobile)
- [x] Dark mode across all browsers
- [x] Touch interactions on mobile
- [x] Drag & drop on desktop and mobile

## Browser-Specific Notes

### Safari
- Backdrop filter works correctly
- Custom scrollbars may appear differently
- Touch interactions are smooth

### Firefox
- Backdrop filter enabled by default in 103+
- Custom scrollbars use `scrollbar-width: thin`

### Chrome/Edge
- Full feature support
- Best performance for animations

## Mobile Considerations

- Touch targets are 44px minimum
- Drag & drop uses touch sensors with delay
- Responsive layout adapts to screen size
- Performance optimizations for mobile

