import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { colors, fonts, radius } from '@/lib/theme'
import { filterNavForRole, type DrawerNavItem } from '@/lib/drawerNav'

const ROLE_BADGE: Record<string, { bg: string; text: string }> = {
  ADMIN:       { bg: 'rgba(88, 28, 135, 0.45)', text: '#e9d5ff' },
  SUPER_ADMIN: { bg: 'rgba(127, 29, 29, 0.45)', text: '#fecaca' },
  SECURITY:    { bg: 'rgba(146, 64, 14, 0.45)', text: '#fde68a' },
  RESIDENT:    { bg: 'rgba(55, 65, 81, 0.8)', text: '#d1d5db' },
}

function goToScreen(item: DrawerNavItem) {
  if (item.name === 'index') {
    router.push('/(drawer)')
  } else {
    router.push(`/(drawer)/${item.name}` as never)
  }
}

export default function DashboardDrawerContent(props: DrawerContentComponentProps) {
  const { resident, signOut } = useAuth()
  const items = filterNavForRole(resident?.role)
  const current =
    props.state.routes[props.state.index]?.name ?? 'index'

  function isActive(name: string) {
    if (name === 'index') return current === 'index'
    return current === name
  }

  function roleLabel(role: string) {
    if (role === 'SUPER_ADMIN') return 'Super admin'
    return role.charAt(0) + role.slice(1).toLowerCase()
  }

  return (
    <DrawerContentScrollView
      {...props}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      <TouchableOpacity
        style={styles.logoRow}
        onPress={() => {
          props.navigation.closeDrawer()
          router.push('/(drawer)')
        }}
        accessibilityRole="button"
      >
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Kynjo.Homes"
        />
      </TouchableOpacity>

      {resident?.role && (
        <View style={styles.badgeWrap}>
          <Text
            style={[
              styles.badge,
              { backgroundColor: ROLE_BADGE[resident.role]?.bg ?? ROLE_BADGE.RESIDENT.bg },
              { color: ROLE_BADGE[resident.role]?.text ?? ROLE_BADGE.RESIDENT.text },
            ]}
          >
            {roleLabel(resident.role)}
          </Text>
        </View>
      )}

      <View style={styles.nav}>
        {items.map(item => {
          const active = isActive(item.name)
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => {
                props.navigation.closeDrawer()
                goToScreen(item)
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={active ? colors.white : colors.gray[400]}
                style={styles.navIcon}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.signOut}
          onPress={() => {
            props.navigation.closeDrawer()
            void signOut()
          }}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.gray[400]} />
          <Text style={styles.signOutLabel}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  logoRow: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.9)',
  },
  logo: {
    height: 40,
    width: 140,
    maxWidth: '100%',
  },
  badgeWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  nav: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 12,
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.button,
  },
  navItemActive: {
    backgroundColor: colors.brand[600],
  },
  navIcon: {
    width: 22,
  },
  navLabel: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.gray[400],
  },
  navLabelActive: {
    color: colors.white,
    fontFamily: fonts.sansMedium,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.9)',
    paddingHorizontal: 8,
    paddingTop: 12,
    marginTop: 8,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.button,
  },
  signOutLabel: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.gray[400],
  },
})
