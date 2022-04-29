import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, Keyboard ,StyleSheet, SafeAreaView} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function SignUp({ navigation }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
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
      } else if (!password) {
        Alert.alert('Le mot de passe est requis');
      } else if (!confirmPassword) {
        setPassword('');
        Alert.alert('La confirmation du mot de passe est requise');
      } else if (password !== confirmPassword) {
        Alert.alert('Les mots de passe ne correspondent pas');
      } else {
        registration(
          email,
          password,
          lastName,
          firstName,
        );
        navigation.navigate('Chargement');
        emptyState();
      }
    };
  
    return (
      <SafeAreaView> 
         <ScrollView onBlur={Keyboard.dismiss}>
          <View style={styles.container}>
        
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
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
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
    textInput:{
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