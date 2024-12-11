import { View } from 'react-native'
import React from 'react'
import Loading from '../components/Loading'

//ilk bu sayfa calısır uygulamada
const Index = () => {                                                  
  return (
    <View style={{flex:1,justifyContent : 'center',alignItems : 'center'}}>
      <Loading/>
    </View>
  )
}

export default Index
