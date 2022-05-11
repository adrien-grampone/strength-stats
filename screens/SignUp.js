import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, Keyboard, StyleSheet, SafeAreaView, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';


export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const emptyState = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handlePress = () => {
    if (!firstName) {
      Alert.alert('Le prénom est requis');
    } else if (!email) {
      Alert.alert("L'adresse mail est requise");
    } else if (!username) {
      Alert.alert('Le nom d\'utilisateur est requis');
    } else if (!password) {
      Alert.alert('Le mot de passe est requis');
    } else if (!confirmPassword) {
      setPassword('');
      Alert.alert('La confirmation du mot de passe est requise');
    } else if (password !== confirmPassword) {
      Alert.alert('Les mots de passe ne correspondent pas');
    } else {
      axios.post("http://127.0.0.1:8000/api/users", {
        firstName: firstName,
        name: lastName,
        email: email,
        username: username,
        password: password
      })
        .then((response) => {
          /*const action = { type: "LOGIN_USER", user: { token: response.data.token } }
          props.dispatch(action);
          userInfos(response.data.token, props.dispatch, true, props, false, "login");*/
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error)
          Alert.alert(
            "Erreur",
            "Impossible de s'inscire, merci de réessayer."
          )
        });
    }
  };

  return (
    <SafeAreaView style={{ position: "relative", height: "100%", backgroundColor: "#6f86d6" }}>
      <LinearGradient
        // Background Linear Gradient
        colors={['#4D99D8', '#6f86d6']}
        style={styles.background}
      />
      <ScrollView onBlur={Keyboard.dismiss}>
        <View style={styles.container}>

          <Image
            style={styles.logo}
            source={require('../assets/logo.png')}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Prénom*"
            value={firstName}
            onChangeText={(name) => setFirstName(name)}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Nom*"
            value={lastName}
            onChangeText={(name) => setLastName(name)}
          />

          <TextInput
            style={styles.textInput}
            placeholder="Nom d'utilisateur*"
            value={username}
            onChangeText={(username) => setUsername(username)}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.textInput}
            placeholder="Adresse mail*"
            value={email}
            onChangeText={(email) => setEmail(email)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.textInput}
            placeholder="Mot de passe*"
            value={password}
            onChangeText={(password) => setPassword(password)}
            secureTextEntry={true}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Confirmation du mot de passe*"
            value={confirmPassword}
            onChangeText={(password2) => setConfirmPassword(password2)}
            secureTextEntry={true}
          />
          <TouchableOpacity style={styles.buttonText} onPress={handlePress}>
            <Text style={styles.textButton}>Inscription</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom:30

  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  logo: {
    width: 250,
    height: 175,
  },

  textInput: {
    //borderColor: "#4D99D8",
    //borderWidth:2,
    borderRadius: 10,
    padding: 10,
    marginTop: 20,
    marginBottom: 10,
    width: "85%",
    height: 55,
    backgroundColor: "#fff"
  },
  buttonText: {
    color: '#000',
    //backgroundColor: "#4D99D8",
    backgroundColor:"#fff",
    padding: 10,
    borderRadius: 20,
    width: 200,
    display: "flex",
    alignItems: "center",
    marginTop: 30,
  },
  textButton: {
    fontSize: 18,
    color: "#4D99D8",
    fontWeight: '700'
  },

  logo: {
    width: 175,
    height: 175
  },
});