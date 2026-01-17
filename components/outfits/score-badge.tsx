import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const percentage = Math.round(score * 100);

  const colorClass =
    percentage >= 80
      ? 'bg-green-500 hover:bg-green-600 text-white'
      : percentage >= 60
        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
        : 'bg-orange-500 hover:bg-orange-600 text-white';

  return (
    <Badge
      className={cn(
        'font-bold',
        colorClass,
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'md' && 'text-sm px-3 py-1',
        size === 'lg' && 'text-base px-4 py-1.5'
      )}
    >
      {percentage}% Match
    </Badge>
  );
}
