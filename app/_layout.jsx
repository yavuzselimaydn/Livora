import { LogBox} from 'react-native'
import React, { useEffect } from 'react'
import { useRouter, Stack } from 'expo-router'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getUserData } from '../services/userService'

LogBox.ignoreLogs(["Warning: TNodeChildrenRenderer","Warning: MemoizedTNodeRenderer","Warning: TRenderEngineProvider"])

//klasordeki tum rotaları sarar layout
const _layout = () => {               
    return (
        <AuthProvider>
            <MainLayout/>
        </AuthProvider>
    )
}

const MainLayout = () => {
    const router = useRouter();
    const {setAuth,setUserData} = useAuth();

    useEffect(() => {
        supabase.auth.onAuthStateChange((_event,session) => { //kullanıcının oturum durumunu dinliyorum burada
            if(session){
                setAuth(session?.user)
                updateUserData(session?.user,session?.user.email)
                router.replace("/home")
            }else{
                setAuth(null)
                router.replace("/welcome")
            }
        })
    },[])

    const updateUserData = async (user,email) => {
        let res = await getUserData(user?.id);
        if(res.success) setUserData({...res.data,email})
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen
                name='(main)/postDetails'
                options={{
                    presentation : "modal"
                }}
            />    
        </Stack>
    )
}

export default _layout

