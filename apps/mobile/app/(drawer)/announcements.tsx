import {
    View, Text, ScrollView, StyleSheet,
    RefreshControl, TouchableOpacity,
  } from 'react-native'
  import { useState } from 'react'
  import { useQuery } from '@tanstack/react-query'
  import { Ionicons } from '@expo/vector-icons'
  import { apiFetch } from '@/lib/api'
  import EmptyState from '@/components/EmptyState'
  import { colors, fonts, radius } from '@/lib/theme'
  import DashboardTopBar from '@/components/DashboardTopBar'
  
  type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  
  interface Announcement {
    id: string
    title: string
    body: string
    priority: Priority
    createdAt: string
  }
  
  const PRIORITY_COLORS: Record<Priority, { bar: string; badge: string; text: string }> = {
    LOW:    { bar: colors.gray[300], badge: colors.gray[100], text: colors.gray[500] },
    NORMAL: { bar: colors.brand[500], badge: colors.brand[50], text: colors.brand[600] },
    HIGH:   { bar: '#fbbf24', badge: colors.amber[50], text: colors.amber[600] },
    URGENT: { bar: colors.red[500], badge: colors.red[50], text: colors.red[600] },
  }
  
  function timeAgo(iso: string) {
    const ms   = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(ms / 60000)
    if (mins < 1)  return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs  < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }
  
  export default function AnnouncementsTab() {
    const [expanded, setExpanded] = useState<string | null>(null)
  
    const { data, isLoading, refetch } = useQuery({
      queryKey: ['announcements'],
      queryFn:  async () => {
        const { data } = await apiFetch<Announcement[]>('/api/announcements')
        return data ?? []
      },
    })
  
    return (
      <View style={styles.container}>
        <DashboardTopBar title="Announcements" />
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        >
          {!isLoading && (!data || data.length === 0) && (
            <EmptyState
              icon="megaphone-outline"
              title="No announcements"
              subtitle="Estate notices will appear here"
            />
          )}
  
          {data?.map(a => {
            const p          = PRIORITY_COLORS[a.priority]
            const isExpanded = expanded === a.id
            const isLong     = a.body.length > 140
  
            return (
              <View key={a.id} style={styles.card}>
                <View style={[styles.bar, { backgroundColor: p.bar }]} />
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <View style={[styles.badge, { backgroundColor: p.badge }]}>
                      <Text style={[styles.badgeText, { color: p.text }]}>
                        {a.priority.charAt(0) + a.priority.slice(1).toLowerCase()}
                      </Text>
                    </View>
                    <Text style={styles.time}>{timeAgo(a.createdAt)}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{a.title}</Text>
                  <Text
                    style={styles.cardBody}
                    numberOfLines={isExpanded ? undefined : 3}
                  >
                    {a.body}
                  </Text>
                  {isLong && (
                    <TouchableOpacity
                      onPress={() => setExpanded(isExpanded ? null : a.id)}
                    >
                      <Text style={styles.readMore}>
                        {isExpanded ? 'Show less' : 'Read more'}
                      </Text>
                    </TouchableOpacity>
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
    container:   { flex: 1, backgroundColor: colors.gray[50] },
    scroll:      { padding: 16, gap: 12, flexGrow: 1 },
    card:        { backgroundColor: colors.white, borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: colors.gray[100] },
    bar:         { height: 4 },
    cardContent: { padding: 14 },
    cardTop:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    badge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.card },
    badgeText:   { fontFamily: fonts.sansSemiBold, fontSize: 11 },
    time:        { fontFamily: fonts.sans, fontSize: 11, color: colors.gray[400] },
    cardTitle:   { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.gray[900], marginBottom: 6 },
    cardBody:    { fontFamily: fonts.sans, fontSize: 14, color: colors.gray[600], lineHeight: 20 },
    readMore:    { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.brand[600], marginTop: 6 },
  })