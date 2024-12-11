import { Pressable, ScrollView, StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { Video } from 'expo-av'

import { theme } from "../../constants/theme"
import Icon from '../../assets/icons'
import ScreenWrapper from '../../components/ScreenWrapper'
import Header from "../../components/Header"
import Avatar from "../../components/Avatar"
import Button from "../../components/Button"

import RichTextEditor from '../../components/RichTextEditor'
import { getSupabaseFileUrl } from "../../services/imageService"
import { createOrUpdatePost } from '../../services/postService'

import { useAuth } from "../../context/AuthContext"
import { wp, hp } from "../../helpers/common"

const NewPost = () => {
  const post = useLocalSearchParams()
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const bodyRef = useRef("")
  const editorRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(file);

  useEffect(() => {
    if (post && post.id) {
      bodyRef.current = post.body;
      setFile(post.file || null)
      setTimeout(() => {
        editorRef?.current?.setContentHTML(post.body)
      }, 300)
    }
  }, [])

  const onPick = async (isImage) => {
    let mediaConfig = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    }

    if (!isImage) {                                     //video secimi icin config ayarı
      mediaConfig = {
        mediaTypes: ["videos"],
        allowsEditing: true,
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig); //resim veya videonun secildigi yer

    if (!result.canceled) {
      setFile(result.assets[0]);                       //secilen dosya statete tutuluyor
    }

  }

  const isLocalFile = file => {                //dosya yerelmi yoksa remote mi kontrol
    if (!file) return null;
    if (typeof file == "object") return true; // dosya obje ise yereldir ve true dondum

    return false;                              //obje degil ise remote yani false donuyorum
  }

  const getFileType = file => {               //dosyanın turunu belirler
    if (!file) return null;
    if (isLocalFile(file)) {                  //dosya yerel ise .type ile dosyanın turu dondurulur
      return file.type;
    }

    if (file.includes("postImage")) {        //eger file stringse ve icinde postImage iceriyorsa image turu doner
      return "image"
    }

    return "video";                           //degilse video turu doner
  }

  const getFileUri = file => {              //dosyanın urisini dondurur
    if (!file) return null;
    if (isLocalFile(file)) {                //yerel dosya ise cihazdaki yolunu dondum burada
      return file.uri;
    }

    return getSupabaseFileUrl(file)?.uri;  //uzak depo ise supabasedeki url si donuyor burada
  }

  const onSubmit = async () => {
    if (!bodyRef && !file) {
      Alert.alert("Post", "Please choose an image or add post body")
      return;
    }

    let data = {
      file,
      body: bodyRef.current,
      userId: currentUser?.id
    }

    if(post && post.id) data.id = post.id;

    setLoading(true)
    let res = await createOrUpdatePost(data);
    setLoading(false);

    if (res.success) {                        //yukleme basarılı ise sayfa stateleri sıfırlanır ve home sayfasına donulur.
      setFile(null)
      bodyRef.current = "";
      editorRef.current.setContentHTML("");
      router.back()
    } else {
      Alert.alert("Post", res.msg)
    }

  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>

        {/* header */}
        <Header title="Create Post" />

        {/* content */}
        <ScrollView contentContainerStyle={{ gap: 20 }}>

          {/* avatar */}
          <View style={styles.header}>
            <Avatar
              uri={currentUser?.image}
              size={hp(6.5)}
              rounded={theme.radius.xl}
            />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>
                {
                  currentUser && currentUser.name
                }
              </Text>
              <Text style={styles.publicText}>
                Public
              </Text>
            </View>
          </View>

          {/* editor */}
          <View style={styles.textEditor}>
            <RichTextEditor editorRef={editorRef} onChange={body => bodyRef.current = body} />
          </View>

          {
            file && (
              <View style={styles.file}>
                {
                  getFileType(file) == "video" ? (   //dosya turune gore gosterim
                    <Video
                      style={{ flex: 1 }}
                      source={{
                        uri: getFileUri(file)
                      }}
                      useNativeControls
                      resizeMode='cover'
                      isLooping
                    />
                  ) : (
                    <Image
                      source={{ uri: getFileUri(file) }}
                      resizeMode='cover'
                      style={{ flex: 1 }}
                    />
                  )
                }

                <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                  <Icon name="delete" size={20} color={"white"} strokeWidth={2} />
                </Pressable>
              </View>
            )
          }

          {/* media upload */}
          <View style={styles.media}>
            <Text style={styles.addImageText}>Add to your post</Text>
            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={() => onPick(true)}>
                <Icon name="image" size={30} color={theme.colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPick(false)}>
                <Icon name="video" size={33} color={theme.colors.dark} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Button
          title={post && post.id ? "Update" : "Post"}
          buttonStyle={{ height: hp(6.2) }}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />

      </View>
    </ScreenWrapper>
  )
}

export default NewPost

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    textAlign: 'center'
  },
  header: {
    flexDirection: "row",
    alignItems: 'center',
    gap: 12
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text
  },
  avatar: {
    height: hp(6.5),
    width: hp(6.5),
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)"
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  textEditor: {},
  media: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderColor: theme.colors.gray
  },
  mediaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15
  },
  addImageText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text
  },
  imageIcon: {
    borderRadius: theme.radius.md,
  },
  file: {
    height: hp(30),
    width: "100%",
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    borderCurve: "continuous"
  },
  video: {},
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,0,0,0.6)",
    borderRadius: 50,
    padding: 7,
  }
})