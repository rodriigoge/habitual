import { Platform, type TextStyle } from 'react-native';

// Native serif equivalents give headings an editorial voice without font loading.
const editorialFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});
export const typography = {
  display: {
    fontFamily: editorialFont,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '600',
  },
  title: {
    fontFamily: editorialFont,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
  },
  habitName: {
    fontFamily: editorialFont,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  metric: {
    fontFamily: editorialFont,
    fontSize: 36,
    lineHeight: 44,
    fontVariant: ['tabular-nums'],
  },
  body: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 13, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 18 },
} satisfies Record<string, TextStyle>;
