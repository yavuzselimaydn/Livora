import { supabase } from "../lib/supabase"

export const getUserData = async (userId) => {   //verilen idye gore vbden kullanıcı bilgilerini getiren fonks
    try {
        const { data, error } = await supabase
            .from("users")
            .select()
            .eq("id", userId)
            .single();

        if (error) {
            return { success: false, msg: error?.message }
        }

        return { success: true, data }
    } catch (error) {
        console.log("got error : ", error)
        return { success: false, msg: error.message }
    }
}

export const updateUser = async (userId, data) => {  //verilen id de vbde gerekli guncellemeleri yapan fonksiyon
    try {
        const { error } = await supabase
            .from("users")
            .update(data)
            .eq("id", userId)

        if (error) {
            return { success: false, msg: error?.message }
        }

        return { success: true, data }
    } catch (error) {
        console.log("got error : ", error)
        return { success: false, msg: error.message }
    }
}

