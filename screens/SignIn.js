import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function SignIn({navigation}){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handlePress = () => {
    navigation.navigate('Tableau de bord');
    /*
    if (!email) {
      Alert.alert('Merci de saisir ton adresse mail !');
    }

    if (!password) {
      Alert.alert('Merci de saisir ton mot de passe !');
    }
    signIn(email, password).finally(() => {
      setEmail('');
      setPassword('');
    });
   */
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require('../assets/logo.png')}
      />
      <TextInput
        style={styles.formInput}
        placeholder="Adresse mail"
        value={email}
        onChangeText={(email) => setEmail(email)}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.formInput}
        placeholder="Mot de passe"
        value={password}
        onChangeText={(password) => setPassword(password)}
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.buttonText} onPress={handlePress}>
        <Text style={styles.textButton}>Me connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("S'inscrire")} >
        <Text style={styles.noAccount}>Je n'ai pas encore de compte</Text>
       </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display:"flex",
    justifyContent:"center",
    alignItems:"center"
  },
  logo:{
    width: 175,
    height: 175
  },
  bigBlue: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 30,
  },
  formInput:{
    borderColor: "#4D99D8",
    borderWidth:2,
    borderRadius:10,
    padding: 10,
    marginTop:20,
    marginBottom:10,
    width:280,
    height:50
  },
  buttonText: {
    color: '#000',
    backgroundColor: "#4D99D8",
    padding:10,
    borderRadius:20,
    width:200,
    display:"flex",
    alignItems:"center",
    marginTop:30
  },
  textButton:{
    fontSize:18,
    color:"#fff",
    fontWeight:'600'
  },
  noAccount:{
    marginTop:20
  }
});