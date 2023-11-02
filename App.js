import Page from "./navigate" // Подгружаем файл навигации, который перенаправит на нужную страницу

import * as Font from 'expo-font';// Библиотека для использования шрифтов

// Загружаем шрифты
Font.loadAsync({
  'roboto': require('./assets/fonts/Roboto-Medium.ttf'),// Загружаем шрифт roboto 
});

export default function App() {
  // Рендерим экран
  return (
    <Page/> //вызываем файл навигации, который перенаправит на нужную страницу
  );
}
