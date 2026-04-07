import { Drawer } from 'expo-router/drawer'
import { Dimensions } from 'react-native'
import DashboardDrawerContent from '@/components/DashboardDrawerContent'

const DRAWER_WIDTH = Math.min(280, Dimensions.get('window').width * 0.85)

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={props => <DashboardDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          width: DRAWER_WIDTH,
          backgroundColor: '#111827',
        },
        overlayColor: 'rgba(0,0,0,0.5)',
        swipeEnabled: true,
      }}
    />
  )
}
