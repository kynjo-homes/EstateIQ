import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, radius } from '@/lib/theme'

interface Props {
  title: string
  right?: React.ReactNode
}

export default function DashboardTopBar({ title, right }: Props) {
  const navigation = useNavigation()
  const safe = useSafeAreaInsets()

  return (
    <View style={[styles.wrap, { paddingTop: safe.top }]}>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          accessibilityLabel="Open menu"
        >
          <Ionicons name="menu" size={22} color={colors.gray[600]} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 8,
    gap: 8,
  },
  menuBtn: {
    padding: 8,
    borderRadius: radius.button,
  },
  title: {
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 17,
    color: colors.gray[900],
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
})
