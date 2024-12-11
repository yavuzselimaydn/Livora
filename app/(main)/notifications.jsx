import { StyleSheet, Text, View ,ScrollView} from 'react-native'
import React,{useState,useEffect} from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchNotifications } from '../../services/notificationService'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import { wp ,hp} from '../../helpers/common'
import { useRouter } from 'expo-router'
import NotificationItem from '../../components/NotificationItem'
import Header from '../../components/Header'

const Notifications = () => {
  const [notifications,setNotifications] = useState([])
  const {user} = useAuth()
  const router = useRouter()

  useEffect(() => {
    getNotifications()
  },[])

  const getNotifications = async () => {
    let res = await fetchNotifications(user.id)
    if(res.success) setNotifications(res.data)
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Notifications"/>
        <ScrollView showsVerticalScrollIndicator = {false} contentContainerStyle={styles.listStyle}>
            {
              notifications.map(item => {
                return (
                  <NotificationItem
                    item={item}
                    key = {item?.id}
                    router = {router}
                  />
                )
              })
            }
            {
              notifications.length == 0 && (
                <Text style={styles.noData}>No notifications yet</Text>
              )
            }
        </ScrollView>
      </View>
    </ScreenWrapper>
  )
}

export default Notifications

const styles = StyleSheet.create({
  container : {
    flex : 1,
    paddingHorizontal : wp(4)
  },
  listStyle : {
    paddingVertical : 20,
    gap : 10
  },
  noData : {
    fontSize : hp(1.8),
    fontWeight : theme.fonts.medium,
    color : theme.colors.text,
    textAlign : 'center',
  }
})