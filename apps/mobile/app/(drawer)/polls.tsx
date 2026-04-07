import {
    View, Text, ScrollView, StyleSheet,
    RefreshControl, TouchableOpacity, Alert,
  } from 'react-native'
  import { useQuery, useQueryClient } from '@tanstack/react-query'
  import { Ionicons } from '@expo/vector-icons'
  import { apiFetch } from '@/lib/api'
  import DashboardTopBar from '@/components/DashboardTopBar'
  import EmptyState from '@/components/EmptyState'
  import { colors, fonts, radius } from '@/lib/theme'
  
  interface Poll {
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
  }
  
  function timeRemaining(endsAt: string) {
    const ms = new Date(endsAt).getTime() - Date.now()
    if (ms <= 0) return 'Ended'
    const days  = Math.floor(ms / 86400000)
    const hours = Math.floor((ms % 86400000) / 3600000)
    if (days  > 0) return `${days}d ${hours}h left`
    const mins = Math.floor((ms % 3600000) / 60000)
    if (hours > 0) return `${hours}h ${mins}m left`
    return `${mins}m left`
  }
  
  export default function PollsTab() {
    const queryClient = useQueryClient()
  
    const { data, isLoading, refetch } = useQuery({
      queryKey: ['polls'],
      queryFn:  async () => {
        const { data } = await apiFetch<Poll[]>('/api/polls')
        return data ?? []
      },
    })
  
    async function handleVote(pollId: string, optionIndex: number) {
      const { error } = await apiFetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        body:   { optionIndex: Number(optionIndex) },
      })
      if (error) { Alert.alert('Error', error); return }
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    }
  
    return (
      <View style={styles.container}>
        <DashboardTopBar title="Polls & Voting" />
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        >
          {!isLoading && (!data || data.length === 0) && (
            <EmptyState icon="bar-chart-outline" title="No polls" subtitle="No active polls at the moment" />
          )}
          {data?.map(poll => {
            const canVote    = !poll.isExpired && !poll.hasVoted
            const maxVotes   = Math.max(...poll.voteCounts, 1)
  
            return (
              <View key={poll.id} style={[styles.card, poll.isExpired && styles.cardExpired]}>
                <View style={[styles.bar, { backgroundColor: poll.isExpired ? colors.gray[300] : colors.brand[600] }]} />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.question}>{poll.question}</Text>
                    <View style={styles.metaRow}>
                      <Text style={[styles.timer, { color: poll.isExpired ? colors.gray[400] : colors.brand[600] }]}>
                        {poll.isExpired ? '🔒 Ended' : `⏰ ${timeRemaining(poll.endsAt)}`}
                      </Text>
                      <Text style={styles.voteCount}>{poll.totalVotes} votes</Text>
                      {poll.isAnonymous && <Text style={styles.anon}>Anonymous</Text>}
                    </View>
                  </View>
  
                  <View style={styles.options}>
                    {poll.options.map((option, i) => {
                      const count      = poll.voteCounts[i]
                      const percent    = poll.totalVotes > 0 ? Math.round((count / poll.totalVotes) * 100) : 0
                      const isMyVote   = poll.myVote === i
                      const isLeading  = count === maxVotes && count > 0
                      const showResult = poll.hasVoted || poll.isExpired
  
                      return (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.option,
                            isMyVote && styles.optionSelected,
                            !canVote && styles.optionDisabled,
                          ]}
                          onPress={() => canVote && handleVote(poll.id, i)}
                          disabled={!canVote}
                          activeOpacity={canVote ? 0.7 : 1}
                        >
                          {showResult && (
                            <View
                              style={[
                                styles.optionFill,
                                { width: `${percent}%` as any, backgroundColor: isMyVote ? colors.brand[100] : colors.gray[100] }
                              ]}
                            />
                          )}
                          <View style={styles.optionRow}>
                            <View style={styles.optionLeft}>
                              {isMyVote && <Ionicons name="checkmark-circle" size={16} color={colors.brand[600]} />}
                              <Text style={[styles.optionText, isMyVote && styles.optionTextSelected]}>
                                {option}
                              </Text>
                            </View>
                            {showResult && (
                              <Text style={[styles.optionPct, isLeading && { fontWeight: '700', color: '#111827' }]}>
                                {percent}%
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
  
                  {canVote && (
                    <Text style={styles.tapHint}>Tap an option to vote</Text>
                  )}
                </View>
              </View>
            )
          })}
        </ScrollView>
      </View>
    )
  }
  
  const styles = StyleSheet.create({
    container:          { flex: 1, backgroundColor: colors.gray[50] },
    scroll:             { padding: 16, gap: 12, flexGrow: 1 },
    card:               { backgroundColor: colors.white, borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: colors.gray[200] },
    cardExpired:        { opacity: 0.8 },
    bar:                { height: 4 },
    cardContent:        { padding: 14, gap: 12 },
    cardHeader:         { gap: 6 },
    question:           { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.gray[900], lineHeight: 22 },
    metaRow:            { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
    timer:              { fontFamily: fonts.sansMedium, fontSize: 12 },
    voteCount:          { fontFamily: fonts.sans, fontSize: 12, color: colors.gray[400] },
    anon:               { fontFamily: fonts.sans, fontSize: 11, color: colors.gray[400], backgroundColor: colors.gray[100], paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.card },
    options:            { gap: 8 },
    option:             { borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.button, overflow: 'hidden', position: 'relative', minHeight: 44 },
    optionSelected:     { borderColor: colors.brand[300], backgroundColor: colors.brand[50] },
    optionDisabled:     {},
    optionFill:         { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: radius.button },
    optionRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
    optionLeft:         { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    optionText:         { fontFamily: fonts.sans, fontSize: 14, color: colors.gray[700] },
    optionTextSelected: { fontFamily: fonts.sansMedium, color: colors.brand[700] },
    optionPct:          { fontFamily: fonts.sans, fontSize: 13, color: colors.gray[400], minWidth: 36, textAlign: 'right' },
    tapHint:            { fontFamily: fonts.sans, fontSize: 12, color: colors.gray[400], textAlign: 'center' },
  })