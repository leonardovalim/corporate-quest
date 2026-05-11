import { MessageSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function CanyFeedbackButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          data-canny-link
          href="https://corporatequest.canny.io/feedbacks"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            cursor: 'pointer',
            color: 'var(--fg-dim)',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--fg)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--fg-dim)';
          }}
        >
          <MessageSquare size={16} strokeWidth={1.5} />
        </a>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        Feedback para o Board
      </TooltipContent>
    </Tooltip>
  );
}
