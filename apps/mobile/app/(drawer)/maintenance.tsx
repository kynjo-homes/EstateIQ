import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { apiFetch } from '@/lib/api'
import DashboardTopBar from '@/components/DashboardTopBar'
import EmptyState from '@/components/EmptyState'
import { colors, fonts, radius } from '@/lib/theme'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: colors.amber[600],
  ASSIGNED: colors.brand[600],
  IN_PROGRESS: colors.brand[600],
  RESOLVED: colors.gray[500],
  CLOSED: colors.gray[400],
}

export default function MaintenanceScreen() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')

  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const { data, error: err } = await apiFetch<MaintenanceRequest[]>('/api/maintenance')
      if (err) throw new Error(err)
      return data ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !description.trim()) {
        throw new Error('Title and description are required.')
      }
      const { error } = await apiFetch('/api/maintenance', {
        method: 'POST',
        body: {
          title: title.trim(),
          description: description.trim(),
          category: category.trim() || 'General',
          priority: 'MEDIUM',
        },
      })
      if (error) throw new Error(error)
    },
    onSuccess: async () => {
      setModalOpen(false)
      setTitle('')
      setDescription('')
      setCategory('General')
      await queryClient.invalidateQueries({ queryKey: ['maintenance'] })
    },
    onError: (e: Error) => Alert.alert('Error', e.message),
  })

  const refreshing = isFetching && !isPending

  return (
    <View style={styles.container}>
      <DashboardTopBar title="Maintenance" />
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalOpen(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color={colors.white} />
          <Text style={styles.addBtnText}>New request</Text>
        </TouchableOpacity>
      </View>
      {error && (
        <Text style={styles.err}>
          {error instanceof Error ? error.message : String(error)}
        </Text>
      )}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refetch()} />}
      >
        {isPending && (
          <Text style={styles.hint}>Loading…</Text>
        )}
        {!isPending && (!data || data.length === 0) && (
          <EmptyState
            icon="construct-outline"
            title="No requests"
            subtitle="Report repairs and estate issues here."
          />
        )}
        {data?.map(req => (
          <View key={req.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{req.title}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: (STATUS_COLORS[req.status] ?? colors.gray[400]) + '22' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: STATUS_COLORS[req.status] ?? colors.gray[600] },
                  ]}
                >
                  {req.status.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
            <Text style={styles.meta}>
              {req.category} · {req.priority} priority
            </Text>
            <Text style={styles.body} numberOfLines={4}>
              {req.description}
            </Text>
            <Text style={styles.time}>
              {new Date(req.createdAt).toLocaleString('en-NG', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New maintenance request</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Title *"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Category (e.g. Plumbing)"
              value={category}
              onChangeText={setCategory}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the issue *"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.saveBtn, createMutation.isPending && { opacity: 0.7 }]}
              disabled={createMutation.isPending}
              onPress={() => createMutation.mutate()}
            >
              <Text style={styles.saveBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  toolbar: { paddingHorizontal: 16, paddingBottom: 8 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.brand[600],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.button,
  },
  addBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.white },
  err: { marginHorizontal: 16, fontSize: 13, color: colors.red[600] },
  scroll: { padding: 16, gap: 12, flexGrow: 1 },
  hint: { textAlign: 'center', color: colors.gray[400], marginTop: 24 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[100],
    gap: 8,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cardTitle: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.gray[900], flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.card },
  badgeText: { fontFamily: fonts.sansSemiBold, fontSize: 11 },
  meta: { fontFamily: fonts.sans, fontSize: 12, color: colors.gray[500] },
  body: { fontFamily: fonts.sans, fontSize: 14, color: colors.gray[600], lineHeight: 20 },
  time: { fontFamily: fonts.sans, fontSize: 11, color: colors.gray[400] },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    padding: 16,
    paddingBottom: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontFamily: fonts.sansSemiBold, fontSize: 18, color: colors.gray[900] },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: fonts.sans,
    fontSize: 15,
    marginBottom: 10,
    color: colors.gray[900],
  },
  textArea: { minHeight: 100 },
  saveBtn: {
    backgroundColor: colors.brand[600],
    borderRadius: radius.button,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.white },
})
