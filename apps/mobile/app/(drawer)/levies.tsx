import {
    View, Text, ScrollView, StyleSheet,
    RefreshControl, TouchableOpacity, Alert, ActivityIndicator,
  } from 'react-native'
  import { useState } from 'react'
  import { useQuery } from '@tanstack/react-query'
  import { apiFetch } from '@/lib/api'
  import DashboardTopBar from '@/components/DashboardTopBar'
  import EmptyState from '@/components/EmptyState'
  import { colors, fonts, radius } from '@/lib/theme'
  
  interface Levy {
    id: string
    title: string
    description: string | null
    amount: number
    dueDate: string
    _count: { total: number; paid: number; pending: number }
    amountCollected: number
  }
  
  function fmt(n: number) {
    return '₦' + n.toLocaleString('en-NG', { maximumFractionDigits: 0 })
  }
  
  export default function LeviesTab() {
    const [paying, setPaying] = useState<string | null>(null)
  
    const { data, isLoading, refetch } = useQuery({
      queryKey: ['levies'],
      queryFn:  async () => {
        const { data } = await apiFetch<Levy[]>('/api/levies')
        return data ?? []
      },
    })
  
    async function handleViewPayments(levyId: string) {
      const { data } = await apiFetch<any>(`/api/levies/${levyId}`)
      if (!data) return
  
      const myPayment = data.payments?.find((p: any) => p.status === 'PENDING')
      if (!myPayment) {
        Alert.alert('All paid', 'No pending payments for this levy.')
        return
      }
  
      Alert.alert(
        'Pay levy',
        `Pay ${fmt(myPayment.amount)} for ${data.title}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Pay now',
            onPress: async () => {
              setPaying(levyId)
              const { data: init, error } = await apiFetch<{ authorizationUrl: string }>(
                '/api/payments/initialize',
                { method: 'POST', body: { paymentId: myPayment.id } }
              )
              setPaying(null)
              if (error) { Alert.alert('Error', error); return }
              if (init?.authorizationUrl) {
                Alert.alert(
                  'Payment',
                  `Open payment page?\n\n${init.authorizationUrl}`,
                  [{ text: 'OK' }]
                )
              }
            },
          },
        ]
      )
    }
  
    return (
      <View style={styles.container}>
        <DashboardTopBar title="Levies & Dues" />
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        >
          {!isLoading && (!data || data.length === 0) && (
            <EmptyState icon="card-outline" title="No levies" subtitle="No levies have been created yet" />
          )}
          {data?.map(levy => {
            const pct      = levy._count.total > 0 ? Math.round((levy._count.paid / levy._count.total) * 100) : 0
            const overdue  = new Date(levy.dueDate) < new Date() && levy._count.pending > 0
            return (
              <View key={levy.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <Text style={styles.levyTitle}>{levy.title}</Text>
                      {overdue && (
                        <View style={styles.overdueBadge}>
                          <Text style={styles.overdueText}>Overdue</Text>
                        </View>
                      )}
                    </View>
                    {levy.description && (
                      <Text style={styles.levyDesc}>{levy.description}</Text>
                    )}
                  </View>
                  <Text style={styles.amount}>{fmt(levy.amount)}</Text>
                </View>
  
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>{levy._count.paid}/{levy._count.total} paid</Text>
                  <Text style={styles.progressPct}>{pct}%</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: pct === 100 ? colors.brand[600] : overdue ? colors.red[500] : colors.brand[500] }]} />
                </View>
  
                <Text style={styles.dueDate}>
                  Due: {new Date(levy.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
  
                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={() => handleViewPayments(levy.id)}
                  disabled={paying === levy.id}
                >
                  {paying === levy.id
                    ? <ActivityIndicator size="small" color={colors.brand[600]} />
                    : <Text style={styles.payBtnText}>View & pay</Text>
                  }
                </TouchableOpacity>
              </View>
            )
          })}
        </ScrollView>
      </View>
    )
  }
  
  const styles = StyleSheet.create({
    container:     { flex: 1, backgroundColor: colors.gray[50] },
    scroll:        { padding: 16, gap: 12, flexGrow: 1 },
    card:          { backgroundColor: colors.white, borderRadius: radius.card, padding: 16, borderWidth: 1, borderColor: colors.gray[100], gap: 10 },
    cardTop:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    titleRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    levyTitle:     { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.gray[900] },
    levyDesc:      { fontFamily: fonts.sans, fontSize: 12, color: colors.gray[500], marginTop: 2 },
    amount:        { fontFamily: fonts.sansBold, fontSize: 20, color: colors.gray[900] },
    overdueBadge:  { backgroundColor: colors.red[50], paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.card },
    overdueText:   { fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.red[600] },
    progressRow:   { flexDirection: 'row', justifyContent: 'space-between' },
    progressLabel: { fontFamily: fonts.sans, fontSize: 12, color: colors.gray[500] },
    progressPct:   { fontFamily: fonts.sans, fontSize: 12, color: colors.gray[500] },
    progressBg:    { height: 6, backgroundColor: colors.gray[100], borderRadius: 3, overflow: 'hidden' },
    progressFill:  { height: 6, borderRadius: 3 },
    dueDate:       { fontFamily: fonts.sans, fontSize: 12, color: colors.gray[400] },
    payBtn:        { borderWidth: 1, borderColor: colors.brand[600], borderRadius: radius.button, paddingVertical: 10, alignItems: 'center' },
    payBtnText:    { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.brand[600] },
  })