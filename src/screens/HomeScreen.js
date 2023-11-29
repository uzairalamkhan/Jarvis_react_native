import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Features } from '../components/Features'
import React, { useEffect, useRef, useState } from 'react'
import { dummyMessages } from '../constants/index'
import Voice from '@react-native-voice/voice';
import { apicall } from '../api/openAi';
import Tts from 'react-native-tts';



export const HomeScreen = () => {

  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const speechStartHandler = e => {
    console.log('speech stared handler');
  }

  const speechEndHandler = e => {
    setRecording(false);
    console.log('speech end handler');
  }

  const speechResultsHandler = e => {
    console.log('VOice event:', e);
    const text = e.value[0];
    setResult(text);
  }

  const speechErrorHandler = e => {
    console.log('speech error handler:', e)
  }

  const startRecording = async () => {
    setRecording(true);
    Tts.stop();
    try {
      await Voice.start('en-GB')
    } catch (error) {
      console.log('error:', error);
    }
  }

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setRecording(false);
      //fetch response
      fetchResponse();
    } catch (error) {
      console.log('error', error)
    }
  }

  const fetchResponse = () => {
    if (result.trim().length > 0) {
      
      let newMesssages = [...messages];
      newMesssages.push({ role: 'user', content: result.trim() });
      setMessages([...newMesssages]);
      updateScrollView();
      setLoading(true);
      apicall(result.trim(), newMesssages).then(res => {
        // console.log('got api data: ',res);
        setLoading(false);
        if (res.success) {
          setMessages([...res.data]);
          updateScrollView();
          setResult('');
          startTextToSpeech(res.data[res.data.length-1]);
        } else {
          Alert.alert('Error', res.msg);
        }
      })
    }
  }

  const startTextToSpeech = message =>{
    if(!message.content.includes('https')){
      setSpeaking(true);
      // playing response with the voice id and voice speed
      Tts.speak(message.content, {
        androidParams: {
          KEY_PARAM_PAN: -1,
          KEY_PARAM_VOLUME: 0.5,
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
        },
      });
    }

    }
  

  const updateScrollView = () => {
    setTimeout(() => {
      scrollViewRef?.current?.scrollToEnd({ animated: true })
    }, 200)
  }

  const clear = () => {
    Tts.stop();
    setMessages([]);
  }

  const stopSpeaking = () => {
    Tts.stop();
    setSpeaking(false);
  }

  useEffect(() => {
    Voice.onSpeechStart = speechStartHandler;
    Voice.onSpeechEnd = speechEndHandler;
    Voice.onSpeechResults = speechResultsHandler;
    Voice.onSpeechError = speechErrorHandler;
    ///tts
    Tts.addEventListener('tts-start', (event) => console.log("start", event));
    Tts.addEventListener('tts-finish', (event) => console.log("finish", event));
    Tts.addEventListener('tts-cancel', (event) => console.log("cancel", event));

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    }
  }, [])

  // console.log('result : ',result)

  return (
    <View className="flex-1 bg-white">
      {/* <Text >HomeScreen</Text> */}
      <View className="flex-1 flex mx-5">
        <View className="flex-row justify-center">
          <Image source={require('../../assets/images/bot.png')} style={{ height: hp(15), width: hp(15) }} />
        </View>
        {/* Features || messages */}
        {
          messages.length > 0 ? (
            <View className="space-y-2 flex-1">
              <Text style={{ fontSize: wp(5) }} className="text-gray-700 font-semibold ml-1">
                Assistant
              </Text>
              <View style={{ height: hp(58) }} className="bg-neutral-200 rounded-3xl p-4">
                <ScrollView ref={scrollViewRef} bounces={false} className="space-y-4" showsVerticalScrollIndicator={false} >
                  {
                    messages.map((message, index) => {
                      if (message.role == 'assistant') {
                        if (message.content.includes('https')) {
                          return (
                            <View key={index} className="flex-row justify-start">
                              <View className="p-2 flex rounded-2xl bg-emerald-100 rounded-tl-none">
                                <Image source={{ uri: message.content }} className="rounded-2xl" resizeMode='contain' style={{ height: wp(60), width: wp(60) }} />
                              </View>
                            </View>
                          )
                        } else {
                          return (
                            <View key={index} className="flex-row justify-start">
                              <View style={{ width: wp(70) }} className="bg-emerald-100 rounded-xl p-2 rounded-tl-none">
                                <Text className="text-black">
                                  {message.content}
                                </Text>
                              </View>
                            </View>
                          )
                        }
                      } else {
                        return (
                          <View key={index} className="flex-row justify-end">
                            <View style={{ width: wp(70) }} className="bg-white rounded-xl p-2 rounded-tr-none">
                              <Text className="text-black">
                                {message.content}
                              </Text>
                            </View>
                          </View>
                        )
                      }

                      // return (
                      //   <View>
                      //     <Text className="text-black">{message.content}</Text>
                      //   </View>
                      // )
                    })
                  }
                </ScrollView>
              </View>

            </View>
          ) : (
            <Features />
          )
        }
        {/* Recording */}
        <View className="flex justify-center items-center">
          {
            loading ? (
              <Image
                source={require('../../assets/images/loading.gif')}
                style={{ width: hp(10), height: hp(10) }}
              />
            ) :
              recording ? (
                <TouchableOpacity onPress={stopRecording} >
                  <Image className="rounded-full" source={require('../../assets/images/voiceLoading.gif')} style={{ width: hp(10), height: hp(10) }} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={startRecording} >
                  {/* Recording Start Button */}
                  <Image className="rounded-full" source={require('../../assets/images/recordingIcon.png')} style={{ width: hp(10), height: hp(10) }} />
                </TouchableOpacity>
              )

          }

          {
            messages.length > 0 && (
              <TouchableOpacity style={{ height: hp(5), width: hp(8) }} onPress={clear} className="bg-neutral-400 rounded-3xl absolute right-10 justify-center items-center">
                <Text className="text-white font-semibold">Clear</Text>
              </TouchableOpacity>
            )
          }
          {
            speaking && (
              <TouchableOpacity onPress={stopSpeaking} style={{ height: hp(5), width: hp(8) }} onPress={stopSpeaking} className="bg-red-400 rounded-3xl absolute left-10 justify-center items-center">
                <Text className="text-white font-semibold">Stop</Text>
              </TouchableOpacity>
            )
          }

        </View>
      </View>
    </View>
  )
}