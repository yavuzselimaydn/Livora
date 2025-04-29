📱Livora Expo App - React Native Project
Bu proje, create-expo-app komutu kullanılarak oluşturulmuş bir React Native + Expo Router mobil uygulamasıdır.

🚀 Başlarken
1. Bağımlılıkları yükle
bash
Kopyala
Düzenle
npm install
2. Uygulamayı başlat
bash
Kopyala
Düzenle
npx expo start
Terminalde aşağıdaki seçenekler gözükecektir:

Android emülatörü

iOS simülatörü

Expo Go uygulaması (fiziksel cihazda test için)

Geliştirme paketi (development build)

📁 Proje Yapısı
Kodlar app/ klasörü içinde yer almakta ve file-based routing sistemi kullanılmaktadır.

🛠 Kullanılan Başlıca Kütüphaneler
🔧 Navigation & Routing
expo-router: Dosya tabanlı routing

@react-navigation/native & @react-navigation/bottom-tabs: Ekranlar arası gezinme

📦 Expo SDK Bileşenleri
expo-av, expo-image, expo-image-picker: Ortam işleme

expo-constants, expo-file-system, expo-splash-screen, expo-status-bar, expo-system-ui: Sistem bilgisi ve UI

expo-haptics, expo-blur, expo-web-browser: Ekstra UX özellikleri

🎨 Arayüz & Tasarım
@rneui/themed: RNEUI bileşenleri

@expo/vector-icons: Icon setleri

react-native-pell-rich-editor: Zengin metin editörü

moment: Tarih/saat formatlama

🧠 Durum ve Depolama
@react-native-async-storage/async-storage: Kalıcı veri depolama

@supabase/supabase-js: Supabase backend entegrasyonu

🎨 Animasyon & UI
react-native-gesture-handler, react-native-reanimated, react-native-safe-area-context, react-native-screens

🌐 Diğer
base64-arraybuffer, react-native-url-polyfill, patch-package: Yardımcı araçlar ve polyfill çözümleri

🧹 Projeyi Temizle
Proje sıfırlanarak örnek uygulama app-example klasörüne taşınır ve app/ klasörü sıfırlanır:

bash
Kopyala
Düzenle
npm run reset-project
📚 Daha Fazla Bilgi
Expo Belgeleri

Expo Router Giriş

Expo Öğrenme Serisi

👥 Topluluğa Katıl
Expo GitHub

Expo Discord
