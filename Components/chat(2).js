import { StatusBar } from 'expo-status-bar'; // Статусбар(меню с зарядом, подключением и т.д.)
import React, { useState } from 'react'; // React(нужен для работы с данными)
import { StyleSheet, Text, View, Image, FlatList, TouchableHighlight } from 'react-native'; // Объекты для страницы(стили, текст, блок, картинка, список)
import { SafeAreaView } from 'react-native-safe-area-context'; // Безопасная зона экрана(То поле, которое всегда видно)
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage позволяет хранить данные на устройстве



// Массивы, в которых храниться переписка
let first = ['Иногда один день, проведённый в других местах, даёт больше, чем десять лет проведённых дома', ' Джейсон Стэтхом']
let overVoice = []
first.unshift('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
let chat = [first]

// Массив со всеми вариантами концовок
let end = ['Питер благополучно добрался до полицейской машины, офицеры отвезли его в участок, а затем и домой',
'Питер не успел положить телефон, как вдруг, пуля 9 калибра попала ему в голову и прошла на  вылет']

let flatList = [] // Массив необходимый для прокрутки вниз

// Переменные, которые помогают стилизовать сообщения
let textAlign = 'left' // Наклон текста
let alignMessage = 'flex-start' // В какой стороне отобразиться сообщение
let buttonBorder = 0 // Ширина контура кнопок
let textColor = '#fff' // Цвет текста сообщения
let buttonColor = '#057a55' // Цвет кнопок
let padding = [20,35] // Отступы внутри сообщения(слева и справа)
let border = [0,9] // Скругленность углов у верхней и нижней кнопки
let counter1 = 0 // Счетчик для постепенной стилизации сообщений

let flag = false // Был ли начат диалог
let time = 2.5 // Время ожидания перед сбросом
let phrases = 1 // Количество фраз(1 фраза - несколько подряд идущих сообщений от одного персонажа)
let del = 600



// Функция задержки
const delay = (delayInms) => {
  return new Promise(resolve => setTimeout(resolve, delayInms));
}

AsyncStorage.setItem('resetStory','0') // Сбрасываем значение перезапуска игры




// Основная функция приложения
export default function App ({ navigation }) {

  const [messages,setMessages] = useState(chat) // Содержимое чата
  const [buttons,setButtons] = useState([]) // Кнопки
  const [prevBut, setPrevBut] = useState([]) 


  if ( !flag ) {

    // Запускаем сюжет
    flag = true
    start()

  }


  // Функция перехода на экран "Меню"
  const openMenu = () => {
    navigation.navigate('menu')
  }


  // Функции прокручивания в конец чата
  const toEnd = () => {
    flatList.scrollToEnd({animated: true})
  }
  const toLast = () => {
    flatList.scrollToIndex({index: messages.length-1,animated: true})
  }


  // Функция добавления новой открытой концовки
  const addEnd = (name) => {
    AsyncStorage.setItem(name, '1');
    console.log(name)
  }


  // Функция отправки списка сообщений от одного из 
  async function sendArray ( arr, err = false ) {

    await delay(del) // Задержка перед отправкой

    // Отправляем первое сообщение
    messages.push([ arr[0] ])
    updateColor() // Обновляем расцветку в чате

    if ( !err ) {

      updateAlign() // Обновляем распределение в чате в чате

    }

    setButtons([]) // Сбрасываем кнопки
    toEnd() // Скролим чат вниз

    time = (arr.length*del+del) // Обновляем время перезагрузки сюжета

    // Делаем отступ сверху меньше
    let newArr = messages 
    newArr[0][0] = newArr[0][0].substring(0,newArr[0][0].length-1)
    setMessages(newArr)
    chat[0][0] = newArr[0][0]

    // Отправляем остальные сообщения
    for( let i = 1; i < arr.length; i++ ){

      updateColor() // Обновляем расцветку в чате
      await delay(del) // Задержка перед отправкой
      flatList = [] 
      messages[phrases].push( [ arr[i] ] ) // Отправляем сообщение
      setButtons([]) // Сбрасываем кнопки
      toLast() // Скролим чат вниз

      // Делаем отступ сверху меньше
      let newArr = messages
      newArr[0][0] = newArr[0][0].substring( 0, newArr[0][0].length-1 )
      setMessages( newArr )
      chat[0][0] = newArr[0][0]

      time -= del // Обновляем время перезагрузки сюжета

    }

    phrases++ // Засчитываем добавленную фразу

  }


  // Функция начала сюжета
  async function start () {

    await delay(30) // Задержка для прогрузки чата

    toLast() // Скролим вниз
    
    // Отправляем первые сообщения
    await sendArray([ 'Это снова я - Питер',
    'Я наконец-то добрался в место в которое вы меня отправили',
    'Какими будут ваши дальнейшие указания?' ])

    // Открываем кнопки
    await showButtons(['Опишите свою ситуацию',
    'Вы вообще кто такой?',
    'Вы ошиблись номером'])

  }

  // Хук для обновления данных о чате
  React.useEffect(() => {

    const focusHandler = navigation.addListener('focus', () => {

      // Проверяем необходимость сброса чата при переходе на страницу
      AsyncStorage.getItem("resetStory").then(async value => {

        if ( value == '1' ) { 
          
          // Сбрасываем чат

          await delay( time ) // Задержка перед сбросом
          await plot( 'Начать новую игру' ) // Сброс

        }

        AsyncStorage.setItem('resetStory','0') // Сбрасываем значение перезапуска игры

      })

    });

    return focusHandler;

  }, [navigation]);


  // Функция открытия списка кнопок для продолжения сюжета
  async function showButtons ( keys ) {

    let prev = keys
    buttonBorder = 1
    buttonColor = '#057a55'
    await setButtons(keys)
    toLast()
    setPrevBut(prev)

  }


  // Функция открытия списка кнопок для завершения сюжета
  async function showFinalButtons ( overVoice, keys, err = false ) {

    await sendArray(overVoice)
    buttonBorder = 1
    
    if(!err){
      updateAlign()
    }
    
    finished = true
    buttonColor = '#e46c0a'
    
    await setButtons(keys)

    toLast()

  }


  // Функция распределения собщений по чату
  const updateAlign = () => {

    if ( alignMessage == 'flex-end' ) { // Распределяем сообщения собеседника №1

      alignMessage = 'flex-start'
      textAlign = 'left'
      padding = [20,35]
      border = [0,9]

    } else if ( alignMessage == 'flex-start' )  { // Распределяем сообщения собеседника №2

      alignMessage = 'flex-end'
      textAlign = 'right'
      padding = [35,20]
      border = [9,0]

    }

    return alignMessage

  }


  // Функция обновления цвета собщений по чату
  const updateColor = (e) => {

    if ( messages[0].indexOf(e) != -1 || end.indexOf(e) != -1 || overVoice.indexOf(e) != -1 ) { // Стилизуем закадровый голос

      textColor = '#fff'
      counter1++
      return '#000'

    } else {

      if ( alignMessage == 'flex-start' ) { // Стилизуем сообщения собеседника №1

        textColor = '#000'
        return '#e7e6ec'

      } else { // Стилизуем сообщения собеседника №2

        textColor = '#fff'
        return '#057a55'

      }

    }
  }


  // Функция для реализации сюжета
  async function plot(e){

    messages.push([e]) // Добавляем в чат сообщение от игрока

    // Скрываем кнопки
    setButtons([])
    buttonBorder = 0

    phrases++ // Засчитываем фразу
    updateAlign() // Обновляем распределение сообщений в чате в чате


    // Сюжетная линия

    if ( e == 'Опишите свою ситуацию' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['Я действовал полностью по  вашей инструкции',
        'Но не вышел на домик с припасами о котором мне так уверенно говорили организаторы всего этого вашего проекта']
      )

      // Открываем кнопки
      await showButtons(
        ['Расскажите немного о себе',
        'Что вам вообще известно про этот домик?',
        'Опишите то место где вы находитесь',
        'В службу спасения звонить пробовали?']
      )

    }


    if ( e == 'Вы вообще кто такой?' || e == 'Расскажите немного о себе' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['Сейчас одну минуту',
        'Я кажется вижу домик, в его окне горит свет',
        'У дверей стоит полицейская машина',
        'Эй!  Полиция, все сюда!']
      )

      // Открываем кнопки
      showFinalButtons(
        ['Питер благополучно добрался до полицейской машины, офицеры отвезли его в участок, а затем и домой'],
        ['Начать новую игру']
      )

      addEnd('1')

    }


    if ( e == 'Что вам вообще известно про этот домик?' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['Я кажется вижу домик, в его окне горит свет',
        'У дверей стоит полицейская машина',
        'Эй!  Полиция, все сюда!']
      )

      // Открываем кнопки
      showFinalButtons(
        ['Питер благополучно добрался до полицейской машины, офицеры отвезли его в участок, а затем и домой'],
        ['Начать новую игру']
      )

      addEnd('1')

    }


    if ( e == 'Опишите то место где вы находитесь' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['Какие-то ёлки до сосны',
        'Я кажется вижу домик, в его окне горит свет',
        'У дверей стоит полицейская машина',
        'Эй!  Полиция, все сюда!']
      )

      // Открываем кнопки
      showFinalButtons(
        ['Питер благополучно добрался до полицейской машины, офицеры отвезли его в участок, а затем и домой'],
        ['Начать новую игру']
      )

      addEnd('1')

    }


    if ( e == 'Вы ошиблись номером' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['Нет прошу помогите мне ',
        'Я слышу вдалеке выстрелы',
        'Охотники?',
        'По кому стреляют?']
      )

      // Открываем кнопки
      showFinalButtons(
        ['Питер не успел положить телефон, как вдруг, пуля 9 калибра попала ему в голову и прошла на  вылет'],
        ['Начать новую игру']
      )

    }


    if ( e == 'Я не смогу вам помочь, звоните 112' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['Стоп что?',
        'Я слышу вдалеке выстрелы',
        'Охотники?',
        'По кому стреляют?']
      )

      // Открываем кнопки
      showFinalButtons(
        ['Питер не успел положить телефон, как вдруг, пуля 9 калибра попала ему в голову и прошла на  вылет'],
        ['Начать новую игру']
      )

    }


    if ( e == 'Разобраться в ситуации' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['Стоп что?',
        'Я слышу вдалеке выстрелы',
        'Охотники?',
        'По кому стреляют?']
      )

      // Открываем кнопки
      showFinalButtons(
        ['Питер не успел положить телефон, как вдруг, пуля 9 калибра попала ему в голову и прошла на  вылет'],
        ['Начать новую игру'],
        true
      )

    }


    if ( e == 'В службу спасения звонить пробовали?' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['Это, что розыгрыш или элемент тура?',
        'Выведите меня на домик немедленно']
      )

      // Открываем кнопки
      await showButtons(
        ['Да, это был розыгрыш',
        'Я не смогу вам помочь, звоните 112']
      )

    }


    if(e == 'Да, это был розыгрыш'){

      // Отправляем сообщения персонажа
      await sendArray(
        ['Какой к чёрту ещё розыгрыш?',
        'Я очень устал и проголодался, а ваш голос совершенно не похож  на голос того с кем я разговаривал раньше']
      )

      // Открываем кнопки
      await showButtons(
        ['Разобраться в ситуации']
      )

    }


    // Сброс сюжетной линии
    if( e == 'Начать новую игру'){

      setMessages([[]]) // Очищаем сообщения

      // Сбрасываем расположение сообщений в чате
      alignMessage = 'flex-start'
      textAlign = 'left'
      padding = [20,35]
      border = [0,9]

      // Добавляем исходные сообщения(закадровый голос)
      setMessages([first])
      chat[0][0] = '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n'

      // Сбрасываем значения
      setButtons([])
      
      phrases = 1
      flag = false

      setButtons([])

    }


    if ( e == 'На шаг назад' ) {

      await deleteArray()
      showButtons(prevBut)
    }

  }
  
  
  // Функция удаления предыдущего сообщения
  async function deleteArray ( err = false ) {

    // Отправляем первое сообщение
    messages.splice(messages.length-4,4)
    updateColor() // Обновляем расцветку в чате

    if ( !err ) {

      // updateAlign() // Обновляем распределение в чате в чате

    }

    setButtons([]) // Сбрасываем кнопки
    toEnd() // Скролим чат вниз

    // Делаем отступ сверху меньше
    let newArr = messages 
    newArr[0][0] = newArr[0][0].substring(0,newArr[0][0].length-1)
    setMessages(newArr)
    chat[0][0] = newArr[0][0]

    phrases-=4 // Засчитываем убавленную фразу

  }


  // Рендерим чат
  return (

    <SafeAreaView style={styles.container}>


      <StatusBar style="light" backgroundColor='#000' />


      <View style={styles.header}>

        <TouchableHighlight onPress={openMenu}>
          <Image source={require('../assets/menu.png')}
          style={styles.menu_icon}
          />
        </TouchableHighlight>

      </View>


      <View style={styles.chat}>

        <FlatList inverted={false} scrollEnabled={true} data={messages} style={[styles.list,{flexGrow:0}]} 
        ref={(ref) => { flatList = ref}}
        renderItem={({ item }) => (

          <FlatList inverted={false} scrollEnabled={false} data={item} style={[styles.list,{ alignItems: updateAlign() }]} 
          renderItem={({ item }) => (

            <View style={[styles.messageBlock]}>
              <Text style={[
                styles.message,
                {backgroundColor: updateColor(item)},
                {color: textColor},
                {borderBottomLeftRadius: border[0]},
                {borderBottomRightRadius: border[1]},
                {paddingLeft: padding[0]},
                {paddingRight: padding[1]},
                {textAlign: textAlign}]}>{item}</Text>
            </View>

          )}/>

        )}/>


        <View style={[styles.buttons,{borderWidth: buttonBorder}]}>

          <FlatList inverted={false} scrollEnabled={false} data={buttons} style={[styles.buttonList,{borderWidth: buttonBorder}]} 
          renderItem={({ item }) => (

            <Text onPress={() => plot(item)} style={[styles.button,
              // {borderTopLeftRadius: setButtonTopBorder()},
              // {borderTopRightRadius: setButtonTopBorder()},
              // {borderBottomLeftRadius: setButtonBottomBorder()},
              // {borderBottomRightRadius: setButtonBottomBorder()},
              {borderTopWidth: buttonBorder},
              {backgroundColor: buttonColor},
              {borderBottomWidth: buttonBorder}]}>{item}</Text>

          )}/>

        </View>

      </View>

    </SafeAreaView>

  );

}


//Стили
const styles = StyleSheet.create({

  container: { // Оснвной блок на весь экран
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },

  header: { // Верхняя часть с кнопкой меню
    backgroundColor: '#000',
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: '8%',
    width: '100%',
    paddingLeft: 20
  },

  menu_icon: { // Иконка кнопки меню 
    height: 35,
    width: 35
  },

  chat: { // Чат(сообщения и кнопки)
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '92%',
    width: '100%'
  },

  list: { // Сообщения
    backgroundColor: 'fff',
    width: '100%'
  },

  messageBlock: { // Строка с сообщением
    width: '100%'
  },

  message: { // Само сообщение
    padding:10,
    paddingHorizontal:30,
    backgroundColor: '#fff',
    color: '#000',
    marginBottom: 10,
    marginHorizontal: 15,
    fontSize:19,
    borderRadius: 9,
    fontFamily: 'roboto'
  },

  buttons: { // Блок для кнопок
    backgroundColor: '#057a55',
    width:'90%',
    borderWidth:1,
    borderColor: '#fff',
    marginVertical: 10
  },

  buttonList:{ // Кнопки
    borderWidth:1,
    borderColor: '#fff',
    backgroundColor: '#057a55',
    width: '100%',
    borderColor: '#fff'
  },

  button: { // Кнопка
    padding:15,
    paddingHorizontal:30,
    backgroundColor: '#057a55',
    borderTopWidth:1,
    borderTopColor: '#fff',
    borderBottomWidth:1,
    borderBottomColor: '#fff',
    color: '#fff',
    width: '100%',
    textAlign: 'center',
    fontSize:19,
    fontFamily: 'roboto'
  },
});
