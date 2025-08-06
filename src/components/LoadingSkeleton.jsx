import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function LoadingSkeleton() {
  return (
    <div className="p-4">
      <Skeleton height={24} width="50%" style={{ marginBottom: 12 }} />
      <Skeleton height={32} width="75%" />
    </div>
  );
}