import { StatusBar } from 'expo-status-bar'; // Статусбар(меню с зарядом, подключением и т.д.)
import React, { useState } from 'react'; // React(нужен для работы с данными)
import { StyleSheet, Text, View, Image, FlatList, TouchableHighlight } from 'react-native'; // Объекты для страницы(стили, текст, блок, картинка, список)
import { SafeAreaView } from 'react-native-safe-area-context'; // Безопасная зона экрана(То поле, которое всегда видно)
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage позволяет хранить данные на устройстве



// Массивы, в которых храниться переписка
let first = ['Если вы людям нравитесь, то вы хороши. Если они ненавидят вас, то вы — лучший!',
  'Жозе Моуринью']
let overVoice = [ ]
first.unshift('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
let chat = [first]

// Массив со всеми вариантами концовок
let end = ['Полицейская машина подоспела весьма быстро, полицейские опросили Соню, назвали её очень храброй девушкой. Двоих мужчин задержали, но даже после долгих и самых напряжённых допросов, они не сообщили имени своего заказчика, следственное дело зашло в тупик. Что же до нашей героини, то её отвезли домой к её матери, где её крайне быстро и вкусно накормили и уложили спать, а с утра всё что с ней было, показалось ей лишь дурным сном.']
let flatList = [ ] // Массив необходимый для прокрутки вниз

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
let time = 0 // Время ожидания перед сбросом
let phrases = 1 // Количество фраз(1 фраза - несколько подряд идущих сообщений от одного персонажа)
let del = 200

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


    if ( !err ) {

      await updateAlign() // Обновляем распределение в чате в чате

    }

    // Отправляем первое сообщение
    messages.push([ arr[0] ])
    updateColor() // Обновляем расцветку в чате


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
    await sendArray([ 'Привет, Арсюш, это Соня!',
    'Я тут мобилу сломала, снова,  вот с новой тебе пишу. ', 'В общем и целом, я выиграла тур-поездку в лес от того отеля, в котором, ещё вчера, мы отдыхали вместе, и выиграть путевки, к слову, тоже вместе могли, если бы кое-кто, по делам своим, как и всегда, не улетел.',
    'В общем, я уже в машине еду, водитель улыбчивый, но странный. Закрыл перегородку, всё лишь бы меня не видеть' ])

    // Открываем кнопки
    await showButtons(['Расскажи где ты сейчас',
    'Девушка, вы ошиблись номером'])

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
  async function showFinalButtons ( overVoice, keys) {
    
    // if(!err){
    //   updateAlign()
    // }

    await sendArray(overVoice,true)

    buttonBorder = 1
    buttonColor = '#e46c0a'
    await setButtons(keys)
    await delay(80)

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


    const stopList = ['Девушка, я от вас сообщения вообще не в мессенджере получаю', 'Это отдельное приложение, и оно было скачано мной']
    

    phrases++ // Засчитываем фразу
    if ( !stopList.includes(e) ) {
      updateAlign() // Обновляем распределение сообщений в чате в чате
    }


    // Сюжетная линия

    if ( e == 'Расскажи где ты сейчас' ) {
      // Отправляем сообщения персонажа
      await sendArray(
        ['Сейчас мы на озере остановились',
        'Здесь наша первая остановка по идеи',
        'Блин, жаль тебя рядом нет',
        'Мне рекомендуют к воде пойти прогуляться', 
        'Типа там вид получше будет',
        'Я иду']
      )
      // Открываем кнопки
      await showButtons(
        ['Расскажи о себе немного',
        'Хорошо, иди конечно']
      )
    }

    if ( e == 'Расскажи о себе немного' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['Рассказать?',
        'Девушка, я вас не узнаю, кто вы такая и что вы сделали с моей подругой?',
        'Так',
        'Какого чёрта вообще',
        'Машина только что уехала' ,
        'Чего блин?']
      )
      // Открываем кнопки
      await showButtons(
        ['Девушка, произошла ошибка, я вас не знаю',
        'Постарайся догнать авто','Какая ещё машина? Кто вы?']
      )

    }

    if ( e == 'Какая ещё машина? Кто вы?' ) {
      // Отправляем сообщения персонажа
      await sendArray(
        ['Подруга, мне сейчас твоя помощь, реально нужна, выручай, пожалуйста.']
      )
      // Открываем кнопки
      await showButtons(
        ['Пожалуйста, не паникуй только',
        'Девушка, да кто вы и зачем вы мне пишете?']
      )
    }

    if ( e == 'Хорошо, иди конечно' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['Стоп что?',
        'Машина уезжает',
        'Водитель уехал, он меня кинул',
        'Кинул меня, прям, как мой бывший',
        'Не знаю что делать Ася спасай']
      )

      // Открываем кнопки
      await showButtons(
        ['Девушка, произошла ошибка, я вас не знаю',
        'Да где ты вообще находишься?']
      )
    }

    if ( e == 'Девушка, да кто вы и зачем вы мне пишете?' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        [
          'А это уже не в какие ворота, заканчивай своё вот это.',
          'Ты понимаешь, что мне сейчас реально помощь нужна, а не вот это вот всё.',
          'А вообще подожди, как звали моего бывшего?'
        ]
      )

      // Открываем кнопки
      await showButtons(
        ['Девушка, какой бывший? Какая помощь? Кто вы вообще?' ]
      )
    } 

    if ( e == 'Девушка, произошла ошибка, я вас не знаю' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        [ 'Ась,  это реально не смешно',
          'Я тебе в лс пишу, но ты в сообщениях своих на себя вообще не похожа совсем, и мне сейчас, как никогда, нужна помощь подруги',
          'А я её не получаю',
          'Никакой',
          'Вообще от тебя последнее время один холод, мне помощь нужна, а ты мне не даёшь её',
          'Ась, с тобой всё вообще в порядке?',
          'Ты мега странная по сообщениям какая-то'
        ]
      )
      // Открываем кнопки
      await showButtons(
        ['Всё в порядке',
        'Нет, я понятия не имею кто вы такая']
      )
    }
  
    if ( e == 'Девушка, вы ошиблись номером' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['Уважаемая Арсения, твои шутки с каждым разом всё хуже и хуже',
         'Мы остановились',
         'Надеюсь он мне сейчас лопату не даст и не скажет копать.',
         'Ага, я выхожу. ',
         'Какой же тут вид, жаль фотку не получается прикрепить. Дурацкий телефон.',
         'Ладно, я пойду к воде прогуляюсь.',
         'Так стоп',
         'Машина уехала',
         'Водила кинул',
         'Он реально уехал от меня',
         'Как мне теперь? Куда мне теперь?']
      )

      // Открываем кнопки
      await showButtons(
        ['Девушка, да кто вы и зачем вы мне пишете?',
        'Постарайся догнать авто']
      )

    }

    if ( e == 'Постарайся догнать авто' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['Догнать?',
        'Она уехала вообще и меня бросила тут одну',
        'Ась, этот таксист поступил прямо как мой бывший',
        'Шутки шутками, но как мне назад то теперь? ','Ась, ты тут?']
      )

      // Открываем кнопки
      await showButtons(
        ['Пожалуйста, не паникуй только',
        'Твой бывший?', 'Девушка, да кто вы и зачем вы мне пишете?']
      )
    }
 
    if ( e == 'Да где ты вообще находишься?' ) {
      // Отправляем сообщения персонажа
      await sendArray(
        ['Я тебе рассказала уже',
        'Ты меня не слушаешь, я не знаю',
        'Мне сейчас так помощь нужна, хотя бы моральная',
        'От подруги своей',
        'А я её не получаю совсем, не получаю ',
        'Ты, вообще, сама на себя последнее время не похожа.',
        'Ась, такой вопросик к тебе, почему я с бывшим рассталась?',
        'Просто сомнения некоторые есть']
      )
      // Открываем кнопки
      await showButtons(
        ['И почему же?']
      )
    }

    if ( e == 'Всё в порядке' ) {
      // Отправляем сообщения персонажа
      await sendArray(
        ['А я вот не уверена, давай вопросик простой: С какими парнями я не встречаюсь?']
      )
      // Открываем кнопки
      await showButtons(
        ['С какими же?', 'Девушка, я не ваша подруга, я не знаю']
      )
    }

    if ( e == 'Твой бывший?' ) {
      // Отправляем сообщения персонажа
      await sendArray(
        [
          'Ась, мне сейчас помощь нужна, я вроде как веду себя нормально, и пишу ещё в настроении хорошем, но на деле я в панике.',
          'Ты вообще сейчас себя странно ведёшь ',
          'Давай контрольный: Какое качество в мужчине самое главное? моя подруга ответ знает)']
      )
      // Открываем кнопки
      await showButtons(
        ['Доброта',
        'Решительность',
      'Понятия не имею']
      )
    }
    if ( e == 'Пожалуйста, не паникуй только' ) {
      // Отправляем сообщения персонажа
      await sendArray(
        [
          'Пожалуйста?',
          'Где вообще моя подруга, и что ты с ней сделала?',
          'Ась, ты общаешься со мной максимально странно сейчас',
          'Я, если честно, хочу убедиться, что говорю со своей подругой вообще. Как звали моего бывшего?']
      )

      // Открываем кнопки
      await showButtons(
        ['Девушка, я понития не имею, как звали вашего бывшего']
      )
    }
    if ( e == 'И почему же?' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        [
          'Подарков мало дарил, а теперь рассказывай кто ты и почему пишешь с телефона моей подруги?'
        ]
      )
      // Открываем кнопки
      await showButtons(
        ['Девушка, мне сообщения вообще не в мессенджер приходят']
      )
    }

    if ( e == 'Нет, я понятия не имею кто вы такая' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['Так это не шутка?',
        'И почему же ты мне от её лица пишешь?']
      )
      // Открываем кнопки
      await showButtons(
        ['Девушка, мне сообщения вообще не в мессенджер приходят']
      )
    }

    if ( e == 'С какими же?' ) {
      // Отправляем сообщения персонажа
      await sendArray(
        ['С необеспеченными, Ася ответ знает так-то. И почему же вы интересно мне с её номера пишете?']
      )
      // Открываем кнопки
      await showButtons(
        ['Девушка, мне сообщения вообще не в мессенджер приходят']
      )
    }

    if ( e == 'Понятия не имею.' ) {
      // Отправляем сообщения персонажа
      await sendArray(
        ['Oтвет: Обеспеченность, Ася бы ответила, так почему вы с её номера мне пишете?']
      )
      // Открываем кнопки
      await showButtons(
        ['Девушка, мне сообщения вообще не в мессенджер приходят']
      )
    }

    if ( e == 'Решительность' ) {
      // Отправляем сообщения персонажа
      await sendArray(
        ['Oтвет: Обеспеченность, Ася бы ответила, так почему вы с её номера мне пишете?']
      )

      // Открываем кнопки
      await showButtons(
        ['Девушка, мне сообщения вообще не в мессенджер приходят']
      )
    }

    if ( e == 'Доброта' ) {
      // Отправляем сообщения персонажа
      await sendArray(
        ['Правильный ответ- обеспеченность, Ася бы сразу ответила, так почему же вы с её номера мне пишете?']
      )
      // Открываем кнопки
      await showButtons(
        ['Девушка, мне сообщения вообще не в мессенджер приходят']
      )
    }

    if ( e == 'Девушка, какой бывший? Какая помощь? Кто вы вообще?' || e =='Девушка, я не ваша подруга, я не знаю'|| e=='Девушка, я понития не имею, как звали вашего бывшего') {
      // Отправляем сообщения персонажа
      await sendArray(
        ['Так ну и кто же вы такой?',
         'И почему вы мне с номера моей подруги пишете?'],
      )
      // Открываем кнопки
      await showButtons(
        ['Девушка, я от вас сообщения вообще не в мессенджере получаю']
      )

    }
    if ( e == 'Девушка, мне сообщения вообще не в мессенджер приходят' || e == 'Девушка, я от вас сообщения вообще не в мессенджере получаю' ) {

      // Отправляем сообщения персонажа
      await sendArray(
        ['И куда же они вам приходят?'],
        true
      )
      // Открываем кнопки
      await showButtons(
        ['Это отдельное приложение, и оно было скачано мной']
      )
    }
    if ( e == 'Это отдельное приложение, и оно было скачано мной') {

      // Отправляем сообщения персонажа
      showFinalButtons(
        ['Полицейская машина подоспела весьма быстро, полицейские опросили Соню, назвали её очень храброй девушкой. Двоих мужчин задержали, но даже после долгих и самых напряжённых допросов, они не сообщили имени своего заказчика, следственное дело зашло в тупик. Что же до нашей героини, то её отвезли домой к её матери, где её крайне быстро и вкусно накормили и уложили спать, а с утра всё что с ней было, показалось ей лишь дурным сном.'],
        ['Начать новую игру'],
        true
      )

      addEnd('1')

    }
    
    if( e == 'Открыта концовка\n Пройти игру заново' || e == 'Начать новую игру'){

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
    if ( e == 'Изменить выбор' ) {

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
