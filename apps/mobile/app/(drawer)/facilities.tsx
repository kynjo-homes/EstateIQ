import {
    View, Text, ScrollView, StyleSheet,
    RefreshControl, TouchableOpacity, Modal,
    TextInput, Alert, ActivityIndicator,
  } from 'react-native'
  import { useState } from 'react'
  import { useQuery, useQueryClient } from '@tanstack/react-query'
  import { Ionicons } from '@expo/vector-icons'
  import { apiFetch } from '@/lib/api'
  import DashboardTopBar from '@/components/DashboardTopBar'
  import EmptyState from '@/components/EmptyState'
  import { colors, fonts, radius } from '@/lib/theme'
  
  interface Facility {
    id: string
    name: string
    description: string | null
    capacity: number | null
    feePerSlot: number
    bookings: { id: string; startTime: string; endTime: string; status: string }[]
  }
  
  function fmt(n: number) {
    return n === 0 ? 'Free' : '₦' + n.toLocaleString('en-NG', { maximumFractionDigits: 0 })
  }
  
  export default function FacilitiesTab() {
    const queryClient     = useQueryClient()
    const [booking, setBooking]   = useState<Facility | null>(null)
    const [form, setForm]         = useState({ startTime: '', endTime: '' })
    const [saving, setSaving]     = useState(false)
  
    const { data, isLoading, refetch } = useQuery({
      queryKey: ['facilities'],
      queryFn:  async () => {
        const { data } = await apiFetch<Facility[]>('/api/facilities')
        return data ?? []
      },
    })
  
    async function handleBook() {
      if (!form.startTime || !form.endTime || !booking) return
  
      setSaving(true)
      const { error } = await apiFetch(`/api/facilities/${booking.id}/bookings`, {
        method: 'POST',
        body: {
          startTime: new Date(form.startTime).toISOString(),
          endTime:   new Date(form.endTime).toISOString(),
        },
      })
      setSaving(false)
  
      if (error) { Alert.alert('Error', error); return }
      Alert.alert('Booked!', `Your slot for ${booking.name} has been confirmed.`)
      setBooking(null)
      setForm({ startTime: '', endTime: '' })
      queryClient.invalidateQueries({ queryKey: ['facilities'] })
    }
  
    return (
      <View style={styles.container}>
        <DashboardTopBar title="Facilities" />
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        >
          {!isLoading && (!data || data.length === 0) && (
            <EmptyState icon="calendar-outline" title="No facilities" subtitle="No facilities available for booking yet" />
          )}
          {data?.map(f => {
            const upcoming = f.bookings.filter(b => b.status === 'CONFIRMED' && new Date(b.startTime) > new Date()).length
            return (
              <View key={f.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.facilityName}>{f.name}</Text>
                    {f.description && <Text style={styles.facilityDesc}>{f.description}</Text>}
                  </View>
                </View>
                <View style={styles.metaRow}>
                  {f.capacity && (
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={14} color="#6b7280" />
                      <Text style={styles.metaText}>{f.capacity} max</Text>
                    </View>
                  )}
                  <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={14} color="#6b7280" />
                    <Text style={styles.metaText}>{fmt(f.feePerSlot)} / slot</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                    <Text style={styles.metaText}>{upcoming} upcoming</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.bookBtn} onPress={() => setBooking(f)} activeOpacity={0.8}>
                  <Text style={styles.bookBtnText}>Book this facility</Text>
                </TouchableOpacity>
              </View>
            )
          })}
        </ScrollView>
  
        <Modal visible={!!booking} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setBooking(null)}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book {booking?.name}</Text>
              <TouchableOpacity onPress={() => setBooking(null)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              <View style={styles.field}>
                <Text style={styles.label}>Start time *</Text>
                <TextInput style={styles.input} value={form.startTime} onChangeText={t => setForm(p => ({ ...p, startTime: t }))} placeholder="YYYY-MM-DD HH:MM" placeholderTextColor="#9ca3af" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>End time *</Text>
                <TextInput style={styles.input} value={form.endTime} onChangeText={t => setForm(p => ({ ...p, endTime: t }))} placeholder="YYYY-MM-DD HH:MM" placeholderTextColor="#9ca3af" />
              </View>
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color={colors.brand[600]} />
                <Text style={styles.infoText}>
                  {booking?.feePerSlot ? `Fee: ${fmt(booking.feePerSlot)} per slot` : 'This facility is free to book.'}
                </Text>
              </View>
              <TouchableOpacity style={[styles.submitBtn, saving && { opacity: 0.6 }]} onPress={handleBook} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Confirm booking</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </View>
    )
  }
  
  const styles = StyleSheet.create({
    container:     { flex: 1, backgroundColor: colors.gray[50] },
    scroll:        { padding: 16, gap: 12, flexGrow: 1 },
    card:          { backgroundColor: colors.white, borderRadius: radius.card, overflow: 'hidden', borderWidth: 1, borderColor: colors.gray[100] },
    cardHeader:    { flexDirection: 'row', padding: 14, gap: 10, backgroundColor: colors.brand[600] },
    facilityName:  { fontFamily: fonts.sansBold, fontSize: 16, color: colors.white },
    facilityDesc:  { fontFamily: fonts.sans, fontSize: 12, color: colors.brand[100], marginTop: 2 },
    metaRow:       { flexDirection: 'row', gap: 14, padding: 14, flexWrap: 'wrap' },
    metaItem:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText:      { fontFamily: fonts.sans, fontSize: 13, color: colors.gray[500] },
    bookBtn:       { margin: 14, marginTop: 0, backgroundColor: colors.brand[600], borderRadius: radius.button, paddingVertical: 12, alignItems: 'center' },
    bookBtnText:   { fontFamily: fonts.sansSemiBold, color: colors.white, fontSize: 14 },
    modal:         { flex: 1, backgroundColor: colors.white },
    modalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
    modalTitle:    { fontFamily: fonts.sansSemiBold, fontSize: 18, color: colors.gray[900] },
    modalBody:     { padding: 20 },
    field:         { marginBottom: 18 },
    label:         { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.gray[700], marginBottom: 6 },
    input:         { borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.card, padding: 12, fontSize: 15, fontFamily: fonts.sans, color: colors.gray[900], backgroundColor: colors.gray[50] },
    infoBox:       { flexDirection: 'row', gap: 8, backgroundColor: colors.brand[50], borderRadius: radius.card, padding: 12, marginBottom: 20 },
    infoText:      { flex: 1, fontFamily: fonts.sans, fontSize: 13, color: colors.brand[700] },
    submitBtn:     { backgroundColor: colors.brand[600], borderRadius: radius.button, paddingVertical: 14, alignItems: 'center' },
    submitText:    { fontFamily: fonts.sansSemiBold, color: colors.white, fontSize: 15 },
  })