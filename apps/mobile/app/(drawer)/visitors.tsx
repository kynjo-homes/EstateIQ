import {
    View, Text, ScrollView, StyleSheet,
    TouchableOpacity, RefreshControl, Modal,
    TextInput, Alert, ActivityIndicator,
  } from 'react-native'
  import { useState } from 'react'
  import { useQuery, useQueryClient } from '@tanstack/react-query'
  import { Ionicons } from '@expo/vector-icons'
  import { apiFetch } from '@/lib/api'
  import EmptyState from '@/components/EmptyState'
  import { colors, fonts, radius } from '@/lib/theme'
  import DashboardTopBar from '@/components/DashboardTopBar'
  
  type VisitorStatus = 'EXPECTED' | 'ARRIVED' | 'EXITED' | 'DENIED' | 'CANCELLED'
  
  interface Visitor {
    id: string
    name: string
    phone: string | null
    purpose: string | null
    accessCode: string
    status: VisitorStatus
    expectedAt: string
    arrivedAt: string | null
    createdAt: string
  }
  
  const STATUS_COLORS: Record<VisitorStatus, { bg: string; text: string }> = {
    EXPECTED:  { bg: colors.brand[50], text: colors.brand[600] },
    ARRIVED:   { bg: colors.brand[50], text: colors.brand[700] },
    EXITED:    { bg: colors.gray[100], text: colors.gray[500] },
    DENIED:    { bg: colors.amber[50], text: '#b45309' },
    CANCELLED: { bg: colors.red[50], text: colors.red[600] },
  }
  
  export default function VisitorsTab() {
    const queryClient  = useQueryClient()
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ name: '', phone: '', purpose: '', expectedAt: '' })
    const [saving, setSaving] = useState(false)
  
    const { data, isLoading, refetch } = useQuery({
      queryKey: ['visitors'],
      queryFn:  async () => {
        const { data } = await apiFetch<Visitor[]>('/api/visitors')
        return data ?? []
      },
    })
  
    async function handleRegister() {
      if (!form.name.trim() || !form.expectedAt.trim()) {
        Alert.alert('Required', 'Visitor name and expected time are required')
        return
      }
      setSaving(true)
      const { error } = await apiFetch('/api/visitors', {
        method: 'POST',
        body: {
          ...form,
          expectedAt: new Date(form.expectedAt).toISOString(),
        },
      })
      setSaving(false)
      if (error) { Alert.alert('Error', error); return }
      setShowModal(false)
      setForm({ name: '', phone: '', purpose: '', expectedAt: '' })
      queryClient.invalidateQueries({ queryKey: ['visitors'] })
    }
  
    async function handleCancel(id: string) {
      Alert.alert('Cancel visit', 'Are you sure?', [
        { text: 'No',  style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: async () => {
            await apiFetch(`/api/visitors/${id}`, {
              method: 'PATCH',
              body:   { status: 'CANCELLED' },
            })
            queryClient.invalidateQueries({ queryKey: ['visitors'] })
          },
        },
      ])
    }
  
    return (
      <View style={styles.container}>
        <DashboardTopBar
          title="Visitors"
          right={
            <TouchableOpacity
              style={styles.headerRegister}
              onPress={() => setShowModal(true)}
              hitSlop={8}
            >
              <Ionicons name="add-circle-outline" size={26} color={colors.brand[600]} />
            </TouchableOpacity>
          }
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        >
          {!isLoading && (!data || data.length === 0) && (
            <EmptyState
              icon="people-outline"
              title="No visitors"
              subtitle="Register a visitor to generate an access code"
            />
          )}
  
          {data?.map(v => {
            const sc = STATUS_COLORS[v.status]
            return (
              <View key={v.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {v.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardName}>{v.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.statusText, { color: sc.text }]}>
                          {v.status.charAt(0) + v.status.slice(1).toLowerCase()}
                        </Text>
                      </View>
                    </View>
                    {v.purpose && (
                      <Text style={styles.cardSub}>{v.purpose}</Text>
                    )}
                    <Text style={styles.cardSub}>
                      Expected: {new Date(v.expectedAt).toLocaleString('en-NG', {
                        day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View style={styles.codeBox}>
                    <Text style={styles.codeText}>{v.accessCode}</Text>
                  </View>
                </View>
  
                {v.status === 'EXPECTED' && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(v.id)}
                  >
                    <Text style={styles.cancelText}>Cancel visit</Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          })}
        </ScrollView>
  
        {/* Register visitor modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register visitor</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
  
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              <View style={styles.field}>
                <Text style={styles.label}>Visitor name *</Text>
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={t => setForm(p => ({ ...p, name: t }))}
                  placeholder="e.g. John Okafor"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={t => setForm(p => ({ ...p, phone: t }))}
                  placeholder="e.g. 08012345678"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Purpose</Text>
                <TextInput
                  style={styles.input}
                  value={form.purpose}
                  onChangeText={t => setForm(p => ({ ...p, purpose: t }))}
                  placeholder="e.g. Family visit, Delivery"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Expected date & time *</Text>
                <TextInput
                  style={styles.input}
                  value={form.expectedAt}
                  onChangeText={t => setForm(p => ({ ...p, expectedAt: t }))}
                  placeholder="e.g. 2025-12-25 14:00"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.hint}>Format: YYYY-MM-DD HH:MM</Text>
              </View>
  
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color={colors.brand[600]} />
                <Text style={styles.infoText}>
                  A 6-digit access code will be generated. Share it with your visitor for gate entry.
                </Text>
              </View>
  
              <TouchableOpacity
                style={[styles.submitBtn, saving && { opacity: 0.6 }]}
                onPress={handleRegister}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitText}>Register & get code</Text>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </View>
    )
  }
  
  const styles = StyleSheet.create({
    container:    { flex: 1, backgroundColor: colors.gray[50] },
    headerRegister: { paddingVertical: 4 },
    scroll:       { padding: 16, gap: 10, flexGrow: 1 },
    card:         { backgroundColor: colors.white, borderRadius: radius.card, padding: 14, borderWidth: 1, borderColor: colors.gray[100] },
    cardRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    avatar:       { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand[100], alignItems: 'center', justifyContent: 'center' },
    avatarText:   { fontFamily: fonts.sansBold, fontSize: 16, color: colors.brand[600] },
    cardInfo:     { flex: 1 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    cardName:     { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.gray[900] },
    statusBadge:  { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.card },
    statusText:   { fontFamily: fonts.sansSemiBold, fontSize: 11 },
    cardSub:      { fontFamily: fonts.sans, fontSize: 12, color: colors.gray[500], marginTop: 3 },
    codeBox:      { backgroundColor: colors.gray[900], paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.button },
    codeText:     { color: colors.white, fontFamily: 'monospace', fontSize: 16, fontWeight: '700', letterSpacing: 2 },
    cancelBtn:    { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.gray[100], alignItems: 'center' },
    cancelText:   { fontFamily: fonts.sans, fontSize: 13, color: colors.red[600] },
    modal:        { flex: 1, backgroundColor: colors.white },
    modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
    modalTitle:   { fontFamily: fonts.sansSemiBold, fontSize: 18, color: colors.gray[900] },
    modalBody:    { padding: 20 },
    field:        { marginBottom: 18 },
    label:        { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.gray[700], marginBottom: 6 },
    input:        { borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.card, padding: 12, fontSize: 15, fontFamily: fonts.sans, color: colors.gray[900], backgroundColor: colors.gray[50] },
    hint:         { fontFamily: fonts.sans, fontSize: 11, color: colors.gray[400], marginTop: 4 },
    infoBox:      { flexDirection: 'row', gap: 8, backgroundColor: colors.brand[50], borderRadius: radius.card, padding: 12, marginBottom: 20 },
    infoText:     { flex: 1, fontFamily: fonts.sans, fontSize: 13, color: colors.brand[700], lineHeight: 18 },
    submitBtn:    { backgroundColor: colors.brand[600], borderRadius: radius.button, paddingVertical: 14, alignItems: 'center' },
    submitText:   { fontFamily: fonts.sansSemiBold, color: colors.white, fontSize: 15 },
  })