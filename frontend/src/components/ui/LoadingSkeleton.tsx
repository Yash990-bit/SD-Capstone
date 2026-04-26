interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
}

export default function LoadingSkeleton({ width = '100%', height = 16, radius = 6 }: LoadingSkeletonProps) {
  return (
    <div style={{
      width,
      height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.4s ease infinite',
    }} />
  );
}
