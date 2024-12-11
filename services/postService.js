import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdatePost = async (post) => {
    try {
        if (post.file && typeof post.file == "object") {              //eger post nesnesinde file varsa ve file bir obje ise dosya yuklenir
            let isImage = post?.file?.type == "image";                //dosya resimmi diye kontrol ediyorum
            let folderName = isImage ? "postImages" : "postVideos";   //dosyanın turune gore vb da saklanacagı klasor ismini belirledim.
            let fileResult = await uploadFile(folderName, post?.file?.uri, isImage)
            if (fileResult.success) post.file = fileResult.data       //eger dosya yuklendiyse post.file alanı supabasedeki yolu olarak guncellenir
            else {
                return fileResult;                                    //yukleme basarısız ise error donerim
            }
        }

        const { data, error } = await supabase
            .from("posts")
            .upsert(post)                                             //supabasede insert ve update işlemini tek seferde yapar : eger post nesnesinde id
            .select()                                                 //var ise olan kayıt guncellenir yok ise yeni kayıt olusturulur.
            .single();

        if (error) {
            console.log("createPost error : ", error);
            return { success: false, msg: "Could not create your post" };
        }

        return { success: true, data: data };
    } catch (error) {
        console.log("createPost error : ", error);
        return { success: false, msg: "Could not create your post" };
    }
}

export const fetchPosts = async (limit = 10, userId) => {
    try {
        if (userId) {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                *,             
                user : users (id,name,image),
                postLikes (*),
                comments (count)
            `)
                .order('created_at', { ascending: false })
                .eq("userId", userId)
                .limit(limit);

            if (error) {
                console.log("fetchPosts error : ", error)
                return { success: false, msg: "Could not fetch the posts" };
            }

            return { success: true, data: data }

        } else {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                *,             
                user : users (id,name,image),
                postLikes (*),
                comments (count)
            `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.log("fetchPosts error : ", error)
                return { success: false, msg: "Could not fetch the posts" };
            }

            return { success: true, data: data }
        }
    } catch (error) {
        console.log("fetchPosts error : ", error)
        return { success: false, msg: "Could not fetch the posts" };
    }
}

export const createPostLike = async (postLike) => {
    try {
        const { data, error } = await supabase
            .from("postLikes")
            .insert(postLike)
            .select()        //eklenen veriyi aldım burada data donecek yanı
            .single()

        if (error) {
            console.log("postlike error : ", error)
            return { success: false, msg: "Could not like the post" }
        }

        return { success: true, data: data };
    } catch (error) {
        console.log("postlike error : ", error)
        return { success: false, msg: "Could not like the post" }
    }
}

export const removePostLike = async (postId, userId) => {
    try {
        const { error } = await supabase
            .from("postLikes")
            .delete()
            .eq("userId", userId)     //userId ve postId eslenesen satırlar sılındı
            .eq("postId", postId)

        if (error) {
            console.log("postlike error : ", error)
            return { success: false, msg: "Could not remove the post like" }
        }

        return { success: true };
    } catch (error) {
        console.log("postlike error : ", error)
        return { success: false, msg: "Could not remove the post like" }
    }
}

export const fetchPostDetails = async (postId) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,             
                user : users (id,name,image),
                postLikes (*),
                comments (*,user : users(id,name,image))
            `)
            .eq("id", postId)
            .order("created_at", { ascending: false, foreignTable: "comments" })
            .single()

        if (error) {
            console.log("fetchPostDetails error : ", error)
            return { success: false, msg: "Could not fetch the post" };
        }

        return { success: true, data: data }
    } catch (error) {
        console.log("fetchPostDetails error : ", error)
        return { success: false, msg: "Could not fetch the post" };
    }
}

export const createComment = async (comment) => {
    try {
        const { data, error } = await supabase
            .from("comments")
            .insert(comment)
            .select()
            .single()

        if (error) {
            console.log("comment error : ", error)
            return { success: false, msg: "Could not create your comment" }
        }

        return { success: true, data: data }
    } catch (error) {
        console.log("comment error : ", error)
        return { success: false, msg: "Could not create your comment" }
    }
}

export const removeComment = async (commentId) => {
    try {

        const { error } = await supabase
            .from("comments")
            .delete()
            .eq("id", commentId)

        if (error) {
            console.log("removeComment Error : ", error)
            return { success: false, msg: "Could not remove the comment" }
        }

        return { success: true, data: { commentId } }
    } catch (error) {
        console.log("removeComment Error : ", error)
        return { success: false, msg: "Could not remove the comment" }
    }
}

export const removePost = async (postId) => {
    try {

        const { error } = await supabase
            .from("posts")
            .delete()
            .eq("id", postId)

        if (error) {
            console.log("removePost Error : ", error)
            return { success: false, msg: "Could not remove the post" }
        }

        return { success: true, data: { postId } }
    } catch (error) {
        console.log("removePost Error : ", error)
        return { success: false, msg: "Could not remove the post" }
    }
}