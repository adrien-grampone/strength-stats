import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignUp from './screens/SignUp';
import SignIn from './screens/SignIn';
import Dashboard from './screens/Dashboard';
import store from "./store/configureStore";
import AddExo from './screens/AddExo';
import { Provider } from 'react-redux';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store.store}>
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
        <Stack.Screen name={'Dashboard'} component={Dashboard} />
        <Stack.Screen name={'AddExo'} component={AddExo} />
      </Stack.Navigator>
    </NavigationContainer>
    </Provider>
  );
}