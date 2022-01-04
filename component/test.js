import React, { useEffect, useState, useContext, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Image,
  RefreshControl,
  StyleSheet,
  Animated,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  TextInput,
} from 'react-native'
import { Video, AVPlaybackStatus } from 'expo-av'
import * as FileSystem from 'expo-file-system'

export function Test({ props, route, navigation }) {
  const [videoUrl, setVideoUrl] = useState([])
  const [accordion, setAccordion] = useState(false)
  const [progressPercent, setProgressPercent] = useState(0)
  const [totalSize, setTotalSize] = useState(0)
  const [progressSuccess, setProgressSuccess] = useState(false)

  const InputRef = useRef(null)
  const video = React.useRef(null)
  const [status, setStatus] = React.useState({})

  const contentWidth = useWindowDimensions().width

  const [refreshing, setRefreshing] = React.useState(false)

  async function arrayVideo() {
    let arrVideo = await FileSystem.readDirectoryAsync(
      FileSystem.cacheDirectory
    )
    return setVideoUrl(arrVideo)
  }

  const focusInput = () => {
    InputRef.current.focus()
  }

  async function postProgress(idLesson) {
    var myHeaders = new Headers()
    myHeaders.append('Accept', 'application/json')
    myHeaders.append('Content-Type', 'application/json')

    var raw = JSON.stringify({
      lesson_id: idLesson,
      user_id: userProfile && userProfile.idAdmin,
    })

    try {
      const responsePostProgress = await fetch(urlPostProgress, {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      })
      const jsonPostProgress = await responsePostProgress.json()
      console.log(jsonPostProgress)
      await getModules()
    } catch (error) {
      console.error(error)
    }
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  useEffect((timer) => {
    arrayVideo()

    return () => {
      setProgressPercent(0)
      clearTimeout(timer)
    }
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'android' ? 90 : 125,
            paddingTop: 10,
          }}
        >
          <View>
            <View
              style={{
                justifyContent: 'center',
                position: 'relative',
                marginTop: 15,
              }}
            >
              <Video
                ref={video}
                style={{
                  alignSelf: 'center',
                  width: 320,
                  height: 200,
                  borderWidth: 1,
                  borderColor: '#C4C4C4',
                }}
                source={{
                  uri: FileSystem.cacheDirectory + 'test.mp4',
                }}
                useNativeControls
                isLooping
                onPlaybackStatusUpdate={(status) => setStatus(() => status)}
                usePoster
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <View style={{ width: '100%' }}>
                  <TouchableOpacity
                    style={{
                      width: '80%',
                      height: 30,
                      alignSelf: 'center',
                      alignSelf: 'flex-start',
                      width: '100%',
                    }}
                    onPress={async () => {
                      const callback = (downloadProgress) => {
                        setTotalSize(
                          formatBytes(
                            downloadProgress.totalBytesExpectedToWrite
                          )
                        )
                        let progress =
                          downloadProgress.totalBytesWritten /
                          downloadProgress.totalBytesExpectedToWrite
                        progress = progress.toFixed(2) * 100
                        setProgressPercent(progress.toFixed(0))
                      }
                      const downloadResumable =
                        FileSystem.createDownloadResumable(
                          'https://iq-online.club/TIQ-VIDEO/Options%20Mastery%20Online/01-02%20Trading%20Plan%20Anlageziel.mp4',
                          FileSystem.cacheDirectory + 'test.mp4',
                          {},
                          callback
                        )

                      try {
                        const { uri } = await downloadResumable.downloadAsync()
                        console.log('Finished downloading to ', uri)
                        await arrayVideo()
                      } catch (e) {
                        console.error(e)
                      }
                    }}
                  >
                    <Text>Cache</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <View>
                  {videoUrl.includes(decodeURI('test.mp4')) ? (
                    <Text
                      style={{
                        color: '#FB1818',
                        fontSize: 12,
                      }}
                    >
                      Success!
                    </Text>
                  ) : !videoUrl.includes(decodeURI('test.mp4')) &&
                    progressPercent > 0 &&
                    progressPercent < 100 ? (
                    <View>
                      <Text
                        style={{
                          color: '#333',
                          fontSize: 12,
                        }}
                      >
                        Größe: {totalSize}
                      </Text>
                      <View style={styles.progress}>
                        <View style={styles.progressBar}>
                          <Animated.View
                            style={
                              ([styles.progressBarLevel],
                              {
                                backgroundColor: '#FF741F',
                                width: `${progressPercent}%`,
                                borderRadius: 5,
                              })
                            }
                          />
                        </View>
                        <Text style={styles.percent}>{progressPercent}%</Text>
                      </View>
                    </View>
                  ) : (
                    <Text
                      style={{
                        color: '#00b9eb',
                        fontSize: 12,
                      }}
                    >
                      Not!
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '80%',
    height: 50,
    alignSelf: 'center',
  },
  wrapperComment: {
    width: '80%',
    height: 35,
    alignSelf: 'center',
  },
  submitTextLog: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
  },
  submitTextCache: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 10,
  },
  accordionBack: {
    backgroundColor: 'rgba(126,134,158,0.15)',
    paddingVertical: 10,
    borderBottomRightRadius: 3,
    borderBottomLeftRadius: 3,
  },
  flexDownfile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  progress: {
    flexDirection: 'row',
    width: 165,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  progressBar: {
    height: 10,
    width: '70%',
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    flexDirection: 'row',
  },
  percent: {
    paddingRight: 10,
    fontSize: 12,
    letterSpacing: -0.33,
  },
  progressBarLevel: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backAvatar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
})
