export default function LoadingSkeleton() {
    return (
      <div className="p-4 animate-pulse">
        <div className="bg-gray-200 h-6 w-1/2 mb-2 rounded"></div>
        <div className="bg-gray-200 h-8 w-3/4 rounded"></div>
      </div>
    );
  }
  