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
      ? 'bg-green-400 text-black border-border'
      : percentage >= 60
        ? 'bg-yellow-400 text-black border-border'
        : 'bg-orange-400 text-black border-border';

  return (
    <Badge
      className={cn(
        'font-heading border-2 shadow-shadow',
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
