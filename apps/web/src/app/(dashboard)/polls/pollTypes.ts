/** Present only for ADMIN / SUPER_ADMIN responses */
export interface PollVoter {
  residentId: string
  firstName: string
  lastName: string
  optionIndex: number
  optionLabel: string
  unit: { number: string; block: string | null } | null
}

export interface Poll {
  id: string
  question: string
  options: string[]
  endsAt: string
  isAnonymous: boolean
  isExpired: boolean
  hasVoted: boolean
  myVote: number | null
  voteCounts: number[]
  totalVotes: number
  createdAt: string
  /** Admin-only: who voted and which option */
  voters?: PollVoter[]
}
