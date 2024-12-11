import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { hp, stripHtmlTags, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import Avatar from './Avatar'
import moment from 'moment'
import Icon from '../assets/icons'
import { Image } from 'expo-image'
import { downloadFile, getSupabaseFileUrl } from '../services/imageService'
import { Video } from 'expo-av'
import { createPostLike, removePostLike } from '../services/postService'
import Loading from './Loading'
import WebView from 'react-native-webview'


const textStyle = {
    color: theme.colors.dark,
    fontSize: hp(1.75)
}
const tagsStyles = {
    div: textStyle,
    p: textStyle,
    ol: textStyle,
    h1: {
        color: theme.colors.dark
    },
    h4: {
        color: theme.colors.dark
    }
}
const shadowStyle = {
    shadowOffset: {
        width: 0,
        height: 2
    },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 1
}

const PostCard = ({ item, currentUser, router, hasShadow = true, showMoreIcon = true, showDelete = false, onDelete = () => { }, onEdit = () => { } }) => {
    const [likes, setLikes] = useState([])    //ilgili postun begenenler listesi
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLikes(item?.postLikes);
    }, [])

    const openPostDetails = () => {
        if (!showMoreIcon) return null;
        router.push({
            pathname: "postDetails",
            params: { postId: item?.id }
        })
    }

    const onLike = async () => {
        if (liked) {    //begenilmis ise begeniyi kaldırıyorum
            let updatedLikes = likes.filter(like => like.userId != currentUser.id) //kullanıcı ile eslesmeyen begeniler alınıyor burada

            setLikes([...updatedLikes]) //postun begeni listesi guncellendi kullanıcın begenisi kaldırıldı

            let res = await removePostLike(item?.id, currentUser.id);//dbdeki like kaldırıldı

            if (!res.success) {
                Alert.alert("Post", "Something went wrong!")
            }
        }
        else {
            let data = {
                userId: currentUser?.id,
                postId: item?.id
            }

            setLikes([...likes, data])

            let res = await createPostLike(data);

            if (!res.success) {
                Alert.alert("Post", "Something went wrong!")
            }
        }
    }

    const onShare = async () => {
        let content = { message: stripHtmlTags(item?.body) }
        if (item?.file) {
            setLoading(true)
            let url = await downloadFile(getSupabaseFileUrl(item?.file).uri)
            setLoading(false)
            content.url = url;
        }
        Share.share(content)
    }

    const handlePostDelete = () => {
        Alert.alert(
            "Confirm",
            "Are you sure you want to do this ?", [
            {
                text: "Cancel",
                onPress: () => console.log("modal canceled"),
                style: "cancel"
            },
            {
                text: "Delete",
                onPress: () => onDelete(item),
                style: "destructive"
            }
        ]
        )
    }

    //postun begeni listesinde current user begenmismi kontrol ediyorum eger begenmis ise listenin ilk elemanı var ise true doner.
    //ama begenmemis ise liste bos olacagından ilk eleman undefined doner ve false olur.
    const liked = likes.filter(like => like.userId == currentUser?.id)[0] ? true : false;

    const createdAt = moment(item?.created_at).format("MMM D")
    
    const [webViewHeight, setWebViewHeight] = useState(0);

    return (
        <View style={[styles.container, hasShadow && shadowStyle]}>
            {/* header */}
            <View style={styles.header}>
                {/* user info and post time */}
                <View style={styles.userInfo}>
                    <Avatar
                        size={hp(4.5)}
                        uri={item?.user?.image}
                        rounded={theme.radius.md}
                    />
                    <View style={{ gap: 2 }}>
                        <Text style={styles.username}>{item?.user?.name}</Text>
                        <Text style={styles.postTime}>{createdAt}</Text>
                    </View>
                </View>

                {
                    showMoreIcon && (
                        <TouchableOpacity onPress={openPostDetails}>
                            <Icon name="threeDotsHorizontal" size={hp(4.3)} strokeWidth={3} color={theme.colors.text} />
                        </TouchableOpacity>
                    )
                }

                {
                    showDelete && currentUser.id == item?.userId && (
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => onEdit(item)}>
                                <Icon name="edit" size={hp(2.5)} color={theme.colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handlePostDelete}>
                                <Icon name="delete" size={hp(2.5)} color={theme.colors.rose} />
                            </TouchableOpacity>
                        </View>
                    )
                }

            </View>

            {/* post body & media */}
            <View style={styles.content}>
                <View style={styles.postBody}>
                    {/* {
                        item?.body && (
                            <RenderHTML
                                contentWidth={wp(100)}
                                source={{ html: item?.body }}
                                tagsStyles={tagsStyles}
                            />
                        )
                    } */}
                    {
                        item?.body && (
                            <View style={{ flex: 1, width: '100%' }}>
            <WebView
                originWhitelist={['*']}
                style={{
                    height: webViewHeight || 1, 
                    width: '100%',
                }}
                source={{
                    html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                color: ${theme.colors.dark}; 
                                margin: 0; 
                                padding :4px 0
                            }
                            h1 { color: ${theme.colors.dark}; }
                            h4 { color: ${theme.colors.dark}; }
                        </style>
                    </head>
                    <body>
                        ${item?.body || '<p>No content available</p>'}
                        <script>
                            (function() {
                                window.onload = function() {
                                    const height = document.body.scrollHeight;
                                    window.ReactNativeWebView.postMessage(height);
                                };
                            })();
                        </script>
                    </body>
                    </html>
                    `,
                }}
                onMessage={(event) => {
                    const height = parseInt(event.nativeEvent.data, 10);
                    setWebViewHeight(height); // Dinamik yükseklik hesaplandı ve ayarlandı
                }}
                javaScriptEnabled
            />
        </View>
                        )
                    }

                </View>

                {/* post image */}
                {
                    item?.file && item?.file?.includes("postImages") && (
                        <Image
                            source={getSupabaseFileUrl(item?.file)}
                            transition={100}
                            style={styles.postMedia}
                            contentFit='cover'
                        />
                    )
                }

                {/* post video */}
                {
                    item?.file && item?.file?.includes("postVideos") && (
                        <Video
                            style={[styles.postMedia, { height: hp(30) }]}
                            source={getSupabaseFileUrl(item.file)}
                            useNativeControls
                            resizeMode='cover'
                            isLooping
                        />
                    )
                }
            </View>

            {/* like comment & share */}
            <View style={styles.footer}>
                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={onLike}>
                        <Icon name="heart" size={24} color={liked ? theme.colors.rose : theme.colors.textLight} fill={liked ? theme.colors.rose : "transparent"} />
                    </TouchableOpacity>
                    <Text style={styles.count}>
                        {
                            likes?.length
                        }
                    </Text>
                </View>
                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={openPostDetails}>
                        <Icon name="comment" size={24} color={theme.colors.textLight} />
                    </TouchableOpacity>
                    <Text style={styles.count}>
                        {
                            item?.comments[0]?.count
                        }
                    </Text>
                </View>
                <View style={styles.footerButton}>
                    {
                        loading ? (
                            <Loading size='small' />
                        ) : (
                            <TouchableOpacity onPress={onShare}>
                                <Icon name="share" size={24} color={theme.colors.textLight} />
                            </TouchableOpacity>
                        )
                    }
                </View>
            </View>
        </View>
    )
}

export default PostCard

const styles = StyleSheet.create({
    container: {
        gap: 10,
        marginBottom: 15,
        borderRadius: theme.radius.xxl * 1.1,
        borderCurve: 'continuous',
        padding: 10,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderWidth: 0.5,
        borderColor: theme.colors.gray,
        shadowColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    username: {
        fontSize: hp(1.7),
        color: theme.colors.textDark,
        fontWeight: theme.fonts.medium,
    },
    postTime: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        fontWeight: theme.fonts.medium,
    },
    content: {
        gap: 10,
        // marginBottom: 10,
    },
    postMedia: {
        height: hp(40),
        width: '100%',
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
    },
    postBody: {
        marginLeft: 5,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    footerButton: {
        marginLeft: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
    },
    count: {
        color: theme.colors.text,
        fontSize: hp(1.8),
    },

})