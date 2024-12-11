import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { createComment, fetchPostDetails, removeComment, removePost } from '../../services/postService';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import PostCard from '../../components/PostCard';
import { useAuth } from "../../context/AuthContext"
import Loading from '../../components/Loading';
import Input from '../../components/Input';
import Icon from '../../assets/icons';
import CommentItem from '../../components/CommentItem';
import { supabase } from '../../lib/supabase';
import { getUserData } from '../../services/userService';
import { createNotification } from '../../services/notificationService';

const PostDetails = () => {
    const { postId ,commentId} = useLocalSearchParams();
    const [post, setPost] = useState(null)
    const [startLoading, setStartLoading] = useState(true)
    const { user } = useAuth()
    const router = useRouter()
    const inputRef = useRef(null)
    const commentRef = useRef("")
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let commentChannel = supabase
            .channel("comments")
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "comments",
                filter: `postId=eq.${postId}`
            }, handleNewComment)
            .subscribe()

        getPostDetails();

        return () => {
            supabase.removeChannel(commentChannel)
        }
    }, [])

    const handleNewComment = async (payload) => {
        console.log("new comments : ", payload)
        if (payload.new) {
            let newComment = { ...payload.new };
            let res = await getUserData(newComment.userId);
            newComment.user = res.success ? res.data : {}
            setPost(prevPost => {
                return {
                    ...prevPost,
                    comments: [newComment, ...prevPost.comments]
                }
            })
        }
    }

    const getPostDetails = async () => {
        let res = await fetchPostDetails(postId)
        if (res.success) setPost(res.data)
        setStartLoading(false)
    }

    const onNewComment = async () => {
        if (!commentRef.current) return null;
        let data = {
            userId: user?.id,
            postId: post?.id,
            text: commentRef.current
        }

        setLoading(true);
        let res = await createComment(data)
        setLoading(false)
        if (res.success) {
            if(user.id != post.userId){
                //send notification
                let notify = {
                    senderId : user.id,
                    receiverId : post.userId,
                    title : "commented on your post",
                    data : JSON.stringify({postId : post.id,commentId : res?.data?.id})
                }
                createNotification(notify)
            }
            inputRef?.current?.clear();
            commentRef.current = "";
        } else {
            Alert.alert("Comment", res.msg)
        }


    }

    const onDeleteComment = async (comment) => {
        let res = await removeComment(comment?.id)
        if (res.success) {
            setPost(prevPost => {
                let updatedPosts = { ...prevPost };
                updatedPosts.comments = updatedPosts.comments.filter(c => c.id != comment.id)
                return updatedPosts;
            })
        } else {
            Alert.alert("Comment", res.msg)
        }
    }

    const onDeletePost = async (item) => {
        let res = await removePost(post.id);
        if(res.success){
            router.back();
        }else{
            Alert.alert("Post",res.msg)
        }
    }

    const onEditPost = async (item) => {
        router.back()
        router.push({pathname : "newPost",params :{...item}})
    }

    if (startLoading) {
        return (
            <View style={styles.center}>
                <Loading />
            </View>
        )
    }

    if (!post) {
        return (
            <View style={[styles.center, { justifyContent: "flex-start", marginTop: 100 }]}>
                <Text style={styles.notFound}>Post not found !</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                <PostCard
                    item={{ ...post, comments: [{ count: post?.comments?.length }] }}
                    router={router}
                    hasShadow={false}
                    currentUser={user}
                    showMoreIcon={false}
                    showDelete = {true}
                    onDelete = {onDeletePost}
                    onEdit = {onEditPost}
                />

                {/* comment input */}
                <View style={styles.inputContainer}>
                    <Input
                        inputRef={inputRef}
                        onChangeText={value => commentRef.current = value}
                        placeholder="Type comment..."
                        placeholderTextColor={theme.colors.textLight}
                        containerStyle={{ flex: 1, height: hp(6.2), borderRadius: theme.radius.xl }}
                    />

                    {
                        loading ? (
                            <View style={styles.loading}>
                                <Loading size='small' />
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
                                <Icon name="send" color={theme.colors.primaryDark} />
                            </TouchableOpacity>
                        )
                    }

                </View>

                {/* comment list */}
                <View style={{ marginVertical: 15, gap: 17 }}>
                    {
                        post?.comments?.map(comment =>
                            <CommentItem
                                key={comment?.id?.toString()}
                                item={comment}
                                onDelete={onDeleteComment}
                                highlight = {comment.id == commentId}
                                canDelete={user.id == comment.userId || user.id == post.userId}
                            />
                        )
                    }

                    {
                        post?.comments?.length == 0 && (
                            <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
                                Be first to comment!
                            </Text>
                        )
                    }
                </View>
            </ScrollView>
        </View>
    )
}

export default PostDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: wp(7),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    list: {
        paddingHorizontal: wp(4),
    },
    sendIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.8,
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
        height: hp(5.8),
        width: hp(5.8),
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notFound: {
        fontSize: hp(2.5),
        color: theme.colors.text,
        fontWeight: theme.fonts.medium,
    },
    loading: {
        height: hp(5.8),
        width: hp(5.8),
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scale: 1.3 }],
    },
});
