import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors, radius } from '@/lib/theme'

interface Props {
  children: React.ReactNode
  style?: ViewStyle
}

export default function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
})