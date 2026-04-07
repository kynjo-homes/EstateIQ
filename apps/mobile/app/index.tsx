import { Redirect } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { View, ActivityIndicator } from 'react-native'
import { colors } from '@/lib/theme'

export default function Index() {
  const { resident, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray[50] }}>
        <ActivityIndicator size="large" color={colors.brand[600]} />
      </View>
    )
  }

  return resident ? <Redirect href="/(drawer)" /> : <Redirect href="/sign-in" />
}