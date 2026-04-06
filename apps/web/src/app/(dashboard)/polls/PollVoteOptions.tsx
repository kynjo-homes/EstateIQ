'use client'

import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Poll } from './pollTypes'

interface Props {
  poll: Poll
  isVoting: boolean
  canVote: boolean
  onVote: (pollId: string, optionIndex: number) => void
}

export default function PollVoteOptions({ poll, isVoting, canVote, onVote }: Props) {
  const maxVotes = Math.max(...poll.voteCounts, 1)

  return (
    <div className="space-y-2">
      {poll.options.map((option, i) => {
        const count       = poll.voteCounts[i]
        const percent     = poll.totalVotes > 0
          ? Math.round((count / poll.totalVotes) * 100) : 0
        const isMyVote    = poll.myVote === i
        const isLeading   = count === maxVotes && count > 0
        const showResults = poll.hasVoted || poll.isExpired

        return (
          <button
            key={i}
            type="button"
            onClick={() => canVote && !isVoting && onVote(poll.id, i)}
            disabled={!canVote || isVoting}
            className={cn(
              'w-full text-left rounded border transition-all overflow-hidden',
              canVote && !isVoting
                ? 'hover:border-green-400 hover:bg-brand-50 cursor-pointer'
                : 'cursor-default',
              isMyVote
                ? 'border-green-400 bg-brand-50'
                : 'border-gray-100 bg-white',
            )}
          >
            <div className="relative px-3 py-2.5">
              {showResults && (
                <div
                  className={cn(
                    'absolute inset-0 rounded transition-all duration-500',
                    isMyVote ? 'bg-green-100' : isLeading ? 'bg-gray-100' : 'bg-gray-50'
                  )}
                  style={{ width: `${percent}%` }}
                />
              )}
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {isMyVote && (
                    <CheckCircle2 size={13} className="text-brand-600 shrink-0" />
                  )}
                  <span className={cn(
                    'text-sm truncate',
                    isMyVote ? 'font-medium text-brand-700' : 'text-gray-700'
                  )}>
                    {option}
                  </span>
                </div>
                {showResults && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">{count}</span>
                    <span className={cn(
                      'text-xs font-semibold w-9 text-right',
                      isLeading ? 'text-gray-700' : 'text-gray-400'
                    )}>
                      {percent}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
