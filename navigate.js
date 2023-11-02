import chat from './Components/chat'
import menu from './Components/menu'

import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'

const Stack = createStackNavigator()

export default function Navigate () {

  return <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen
        name="chat"
        component={ chat }
        options={ { headerShown: false, animationEnabled: false } }
      />
      <Stack.Screen
        name="menu"
        component={ menu }
        options={ { headerShown: false, animationTypeForReplace: 'pop' } }
      />
    </Stack.Navigator>
  </NavigationContainer>

}
