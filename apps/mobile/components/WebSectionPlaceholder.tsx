import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import DashboardTopBar from '@/components/DashboardTopBar'
import { colors, fonts, getWebBaseUrl, radius } from '@/lib/theme'

interface Props {
  title: string
  /** Path on web app, e.g. `/residents` */
  webPath: string
  description?: string
}

export default function WebSectionPlaceholder({ title, webPath, description }: Props) {
  const base = getWebBaseUrl()
  const url = `${base}${webPath.startsWith('/') ? webPath : `/${webPath}`}`

  return (
    <View style={styles.container}>
      <DashboardTopBar title={title} />
      <View style={styles.body}>
        <Text style={styles.lead}>
          {description ??
            'This area is available in full on the web app. Open it in your browser to continue.'}
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => void Linking.openURL(url)}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Open in browser</Text>
        </TouchableOpacity>
        <Text style={styles.url} numberOfLines={2}>
          {url}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  body:      { padding: 24, gap: 16 },
  lead:      { fontFamily: fonts.sans, fontSize: 15, color: colors.gray[600], lineHeight: 22 },
  btn:       { alignSelf: 'flex-start', backgroundColor: colors.brand[600], paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.button },
  btnText:   { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.white },
  url:       { fontFamily: fonts.sans, fontSize: 12, color: colors.gray[400] },
})
