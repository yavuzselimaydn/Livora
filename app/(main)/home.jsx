import { Button, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { wp, hp } from "../../helpers/common"
import { theme } from "../../constants/theme"
import Icon from "../../assets/icons"
import { useRouter } from 'expo-router'
import Avatar from '../../components/Avatar'
import { fetchPosts } from '../../services/postService'
import PostCard from '../../components/PostCard'
import Loading from "../../components/Loading"
import { getUserData } from '../../services/userService'

var limit = 0;

const Home = () => {
  const router = useRouter();
  const { user, setAuth } = useAuth()
  const [posts, setPosts] = useState([])
  const [hasMore, setHasMore] = useState(true)                 //dbdeki tum veriler geldi ise gereksiz istegi onledim bu kod ile
  const [notificationCount, setNotificationCount] = useState(0)

  const handlePostEvent = async (payload) => {
    if (payload.eventType == "INSERT" && payload?.new?.id) {  //verii yeni eklendiyse calısır kod
      let newPost = { ...payload.new }                        //yeni kayıt alınıyor
      let res = await getUserData(newPost.userId)           //kullanıcı bilgileri alınıyor detaylıca         
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }]
      newPost.user = res.success ? res.data : {}            //kullanıcı bilgisi guncellendi
      setPosts(prevPosts => [newPost, ...prevPosts])        //gelen veri ekleniyor state
    }
    if (payload.eventType == "DELETE" && payload?.old.id) {
      setPosts(prevPosts => {
        let updatedPosts = prevPosts.filter(post => post.id != payload.old.id)
        return updatedPosts;
      })
    }
    if (payload.eventType == "UPDATE" && payload?.new.id) {
      setPosts(prevPosts => {
        let updatedPosts = prevPosts.map(post => {
          if (post.id == payload.new.id) {
            post.body = payload.new.body;
            post.file = payload.new.file;
          }
          return post;
        });

        return updatedPosts;
      })
    }
  }

  const handleNewNotification = async (payload) => {
    if (payload.eventType == "INSERT" && payload.new.id) {
      setNotificationCount(prev => prev + 1)
    }
  }

  useEffect(() => {
    let postChannel = supabase          //dbdeki posts tablosunu dinliyorum burada veri geldiginde handlepostevent tetiklenir
      .channel("posts")                   //post adında kanal olsutudum
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, handlePostEvent)
      .subscribe();                       //kanala abone oldum ve dinleme baslandı

    let notificationChannel = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `receiverId=eq.${user.id}` }, handleNewNotification)
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel)
      supabase.removeChannel(notificationChannel)
    }
  }, [])

  const getPosts = async () => {
    if (!hasMore) return null;             //has more false ise daha istek yok burada bitere fonk

    limit = limit + 10;

    let res = await fetchPosts(limit)
    if (res.success) {
      if (posts.length == res.data.length) setHasMore(false) //gelen veri boyutu ile bendeki veri boyutu aynı ise hasmore false yanı daha istek yok
      setPosts(res.data)
    }
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>

        {/* header */}
        <View style={styles.header}>
          <Text style={styles.title}>LinkUp</Text>
          <View style={styles.icons}>
            <Pressable onPress={() => {
              setNotificationCount(0)
              router.push("notifications")
            }
            }>
              <Icon name="heart" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
              {
                notificationCount > 0 && (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>{notificationCount}</Text>
                  </View>
                )
              }
            </Pressable >
            <Pressable onPress={() => router.push("newPost")}>
              <Icon name="plus" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push("profile")}>
              <Avatar
                uri={user?.image}
                size={hp(4.3)}
                rounded={theme.radius.sm}
                style={{ borderWidth: 2 }}
              />
            </Pressable>
          </View>
        </View>

        {/* posts */}
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          overScrollMode='never'
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <PostCard
            currentUser={user}
            router={router}
            item={item}
          />
          }
          onEndReached={() => {         //liste kaydırılıp sonuna geldiginde calısan kısım
            getPosts()
          }}
          onEndReachedThreshold={0}    //listenin tam sonuna gidildiginde onEndReached tetiklenir
          ListFooterComponent={hasMore ? (
            <View style={{ marginVertical: posts.length == 0 ? 200 : 30 }}>
              <Loading />
            </View>
          ) : (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )}
        />
      </View>

    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray,
    borderWidth: 3,
  },
  icons: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text,
  },
  pill: {
    position: 'absolute',
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight,
  },
  pillText: {
    color: 'white',
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
  },
})