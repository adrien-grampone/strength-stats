import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignUp from './screens/SignUp';
import SignIn from './screens/SignIn';
import Dashboard from './screens/Dashboard';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Connexion' component={SignIn} options={{ headerShown: false }} />
        <Stack.Screen name="S'inscrire" component={SignUp} options={{
          headerStyle: {
            backgroundColor: '#4D99D8',
          },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }} />
        <Stack.Screen name='Sign In' component={SignIn} options={{ headerShown: false }} />
        <Stack.Screen name={'Tableau de bord'} component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}