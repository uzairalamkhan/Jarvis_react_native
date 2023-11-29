import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import AppNavigation from './src/navigation';
import { apicall } from './src/api/openAi';

export default function App() {

  // useEffect(()=>{
  //   // apicall('create an image of a dog playing with cat');
  // },[])

  return (

    <AppNavigation/>
    // <View className="bg-red-200">
    //   <Text>App</Text>
    // </View>

  )
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        paddingTop:50,
        }
})