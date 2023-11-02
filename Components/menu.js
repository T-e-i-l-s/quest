
import { StatusBar } from 'expo-status-bar'; // Статусбар(меню с зарядом, подключением и т.д.)
import { StyleSheet, Text, View, TouchableHighlight, Linking, Image, Share } from 'react-native'; // Объекты для страницы(стили, текст, блок, картинка и др.)
import { SafeAreaView } from 'react-native-safe-area-context'; // Безопасная зона экрана(То поле, которое всегда видно)
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage позволяет хранить данные на устройстве
import React,{ useState } from 'react'; // React(нужен для работы с данными)




const names = ['1'] // Индексы всех возможных концовок
const links = {
  'rate': 'https://google.com', // Оценить
  'share': 'https://google.com', // Поделиться(ссылка, которая будет отправленна)
  'terms': 'https://www.freeprivacypolicy.com/live/e70fec91-7ed3-420c-8fde-2dfcb19e4da3', // Условия использования
  'policy': 'https://www.freeprivacypolicy.com/live/e70fec91-7ed3-420c-8fde-2dfcb19e4da3' // Политика конфиденциальности
} 

let textColor = '#fff' // Стилизация цвета текста
let counter = 0


// Основная функция приложения
export default function App({navigation}) {

  const [ends,setEnds] = useState(0) // Открыто концовок
  

  // Переход на страницу "чат"
  const openChat = () => {
    navigation.navigate('chat')
  }


  // Загружаем список концовок
  React.useEffect(() => {
    counter = 0
    names.forEach( element => {

      AsyncStorage.getItem( element ).then( value => {


        if ( value == '1' ) {

          counter++
          setEnds( counter )

        }

      })

    });

  }, [navigation]);


  const [alertColor,setAlertColor] = useState(['rgba(0,0,0,0)','rgba(0,0,0,0)','rgba(0,0,0,0)']) // Стилизация всплывающего окна


  // Фунция для сброса сюжета
  const resetStory = () => {

    if ( alertColor[0] != 'rgba(0,0,0,0)' ) {

      AsyncStorage.setItem( 'resetStory', '1' ) // Записываем значение сброса
      textColor = '#fff'
      navigation.navigate( 'chat' ) // Переходим на страницу чат

    }

  }


  // Функция открытия всплывающего окна
  const openAlert = () => {

    textColor = '#2e2e2e'
    setAlertColor(['#1c1c1c','#2e2e2e','#fff'])

  }


  // Функция скрытия всплывающего окна
  const closeAlers = () => {

    setAlertColor(['rgba(0,0,0,0)','rgba(0,0,0,0)','rgba(0,0,0,0)'])
    textColor = '#fff'

  }


  // Функция "поделиться"
  const onShare = async () => {

    if ( alertColor[0] == 'rgba(0,0,0,0)' ) {

      const result = await Share.share({

        message: links['share']

      });

    }

  };




  // Рендерим чат
  return (

    <SafeAreaView style={styles.container}>

      <StatusBar style="light" backgroundColor='#000' />


      <View style={styles.header}>

        <TouchableHighlight onPress={openChat}>
          <Image source={require('../assets/arrow.png')}
          style={styles.chat_icon}
          />
        </TouchableHighlight>

        <Text style={styles.menu}>Меню</Text>

      </View>


      <View style={styles.topLevel}>

        <Text style={styles.buttonTop} onPress={openAlert}>
          Отмотать историю
        </Text>

        <View style={styles.info}>

          <Text style={styles.text}>Открыто концовок:</Text>

          <Text style={styles.text}>{ends}/10</Text>

        </View>

        <View style={[styles.alert,{backgroundColor: alertColor[0]}]}>
          <Text onPress={resetStory} style={[styles.alertText,{backgroundColor: alertColor[1]},{color: alertColor[2]}]}>Начать новую игру</Text>
          <Text onPress={closeAlers} style={[styles.alertText,{backgroundColor: alertColor[1]},{color: alertColor[2]}]}>Отмена</Text>
        </View>

      </View>


      <View style={styles.bottomLevel}>

        <Text style={[styles.buttonBottom,{color: textColor},{borderColor: textColor}]} 
          onPress={() => {if(alertColor[0] == 'rgba(0,0,0,0)'){Linking.openURL(links['rate'])}}}>
          Оценить игру
        </Text>

        <Text style={[styles.buttonBottom,{color: textColor},{borderColor: textColor}]} onPress={onShare}>
          Рассказать друзьям
        </Text>

        <Text style={[styles.buttonBottom,{color: textColor},{borderColor: textColor}]} 
          onPress={() => {if(alertColor[0] == 'rgba(0,0,0,0)'){Linking.openURL(links['terms'])}}}>
          Условия использования
        </Text>

        <Text style={[styles.buttonBottom,{color: textColor},{borderColor: textColor}]} 
          onPress={() => {if(alertColor[0] == 'rgba(0,0,0,0)'){Linking.openURL(links['policy'])}}}>
          Политика конфиденциальности
        </Text>

      </View>

    </SafeAreaView>  
    
  );

}

const styles = StyleSheet.create({

  container: { // Оснвной блок на весь экран
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  header: { // Верхняя часть с кнопкой меню
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '8%',
    width: '100%',
    paddingLeft: 20,
    flexDirection: 'row'
  },

  menu: { // Заголовок(название страницы)
    color: '#fff',
    fontFamily: 'roboto',
    fontSize:30,
    marginLeft: '5%'
  },

  chat_icon: { // Иконка кнопки меню 
    height: 35,
    width: 35
  },

  topLevel: { // Верхний уровень меню(Отмотать историю, Открыто концовок)
    height: '46%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  bottomLevel: { // Нижний уровень меню(Поделиться и др.)
    height: '46%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  buttonTop: { // Кнопки верхнего меню
    padding:20,
    borderTopWidth: 1,
    borderColor: '#fff',
    fontFamily: 'roboto',
    fontSize: 22,
    color: '#fff',
    width: '100%',
    textAlign: 'left'
  },

  buttonBottom: { // Кнопки нижнего меню
    padding:20,
    borderTopWidth: 1,
    borderColor: '#fff',
    fontFamily: 'roboto',
    fontSize: 22,
    width: '100%',
    textAlign: 'left'
  },

  info: { // Открыто концовок
    padding:20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#fff',
    width: '100%',
    flexDirection: 'row'
  },

  text: { // Цифра(Открыто концовок)
    fontFamily: 'roboto',
    fontSize: 22,
    color: '#fff',
    textAlign: 'left',
    marginRight: 20
  },

  alert: { // Всплывающее окно
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1c1c1c',
    width: '85%',
    padding: 20,
    marginTop: '5%',
    borderRadius: 20
  },

  alertText: { // Кнопки во всплывающем окне
    fontFamily: 'roboto',
    fontSize: 22,
    color: '#fff',
    backgroundColor: '#2e2e2e',
    textAlign: 'center',
    width: '90%',
    padding:15,
    marginVertical: 10,
    borderRadius: 20
  },

});

