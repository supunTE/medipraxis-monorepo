import { TextSize } from '@repo/config';
import { Text, TextProps } from './Themed';

// MonoText component for monospaced text
const MONO_SIZE_MAP: Record<TextSize, number> = {
  [TextSize.Small]: 12,
  [TextSize.Medium]: 14,
  [TextSize.Large]: 16,
  [TextSize.ExtraLarge]: 20,
};

// MonoText component
export function MonoText(props: TextProps & { size?: TextSize }) {
  const fontSize = MONO_SIZE_MAP[props.size ?? TextSize.Medium];
  return <Text {...props} style={[props.style, { fontFamily: 'SpaceMono', fontSize }]} />;
}
