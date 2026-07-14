import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MenuOrderControls({
  first,
  last,
  disabled,
  onMove,
}: {
  first: boolean
  last: boolean
  disabled?: boolean
  onMove: (direction: 'up' | 'down') => void
}) {
  return (
    <div className="menu-order">
      <Button
        aria-label="Move up"
        disabled={disabled || first}
        size="icon"
        onClick={() => onMove('up')}
      >
        <ChevronUp size={14} />
      </Button>
      <Button
        aria-label="Move down"
        disabled={disabled || last}
        size="icon"
        onClick={() => onMove('down')}
      >
        <ChevronDown size={14} />
      </Button>
    </div>
  )
}
