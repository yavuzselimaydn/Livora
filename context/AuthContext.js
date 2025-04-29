import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState();

    //Kullanıcının kimlik doğrulama durumunu günceller (örneğin, giriş veya çıkış yaparken).
    const setAuth = authUser => {
        setUser(authUser); 
    }

    //Kullanıcının mevcut bilgilerini günceller 
    const setUserData = userData => {
        setUser({ ...userData}); 
    }

    return (
        //Tüm alt bileşenlere kimlik doğrulama durumu (`user`) ve işlevlerini (`setAuth`, `setUserData`) sağlar.
        <AuthContext.Provider value={{ user, setAuth, setUserData }}>
            {children} 
        </AuthContext.Provider>
    )
}

//AuthContext'e kolay erişim için özel bir hook tanımlanır.
export const useAuth = () => useContext(AuthContext);
