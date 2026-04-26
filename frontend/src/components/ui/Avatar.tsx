interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md';
  color?: string;
}

const sizeMap = { sm: 28, md: 36 };
const fontMap = { sm: 11, md: 13 };

export default function Avatar({ initials, size = 'md', color = 'var(--blue)' }: AvatarProps) {
  const px = sizeMap[size];
  return (
    <div style={{
      width: px,
      height: px,
      borderRadius: '50%',
      background: color,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: fontMap[size],
      fontWeight: 700,
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}
