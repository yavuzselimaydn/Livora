import { decode } from "base64-arraybuffer"
import * as FileSystem from "expo-file-system"
import { supabase } from "../lib/supabase"
import { supabaseUrl } from "../constants"

export const getUserImageSrc = imagePath => {
    if(imagePath){                         //resim yolu var ise supabase url si olusturuluyor burada
        return getSupabaseFileUrl(imagePath) 
    }else {                                //resim yolu yok ise default resim adresini donuyorum 
        return require("../assets/images/defaultUser.png")
    }
}

export const getSupabaseFileUrl = filePath => {
    if(filePath){                          //supabasedeki resimin erisim url si olusturuluyor
        return {uri : `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`}
    }
    return null;
}

export const downloadFile = async (url) => {
    try {
        const {uri} = await FileSystem.downloadAsync(url,getLocalFilePath(url))
        return uri;
    } catch (error) {
        return null;
    }
}

export const getLocalFilePath = filePath => {
    let fileName = filePath.split("/").pop()
    return `${FileSystem.documentDirectory}${fileName}`
}

export const uploadFile = async (folderName,fileUri,isImage=true) => {
    try {
        let fileName = getFilePath(folderName,isImage)//dosyanın yuklenecegi klasorun adini ve dosya uzantısını belirler :"/profile-images/1673029384123.png"

        const fileBase64 = await FileSystem.readAsStringAsync(fileUri,{ //dosya base64 formatina ceviriliyor
            encoding : FileSystem.EncodingType.Base64
        })

        let imageData = decode(fileBase64)               //base64 stringi ,arraybuffer formatına donusturuldu

        let {data,error} = await supabase
        .storage
        .from("uploads")
        .upload(fileName, imageData, {
            cacheControl : "3600",
            upsert : false,
            contentType : isImage ? "image/*" : "video/*"
        })

        if(error){
            console.log("file upload error : ",error)
            return {success : false,msg : "Could not upload media"}
        }

        return {success : true,data : data.path}
    } catch (error) {
        console.log("file upload error : ", error)
        return {success : false, msg : "Could not upload media"}
    }
}

export const getFilePath = (folderName,isImage) => {
    return `/${folderName}/${(new Date()).getTime()}${isImage ? ".png" : ".mp4"}`;
}