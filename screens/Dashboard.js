import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function Dashboard({ navigation }) {
  const [firstName, setFirstName] = useState('');

  const handlePress = () => {
    navigation.replace('Connexion');
  };

  const addStat = () => {
   
  }

  return (
    <View style={styles.container}>
      <Text style={styles.hello}>Salut {firstName} 😉</Text>
      
      <View style={{display:"flex", justifyContent:"center", margin:20}}>
        <TouchableOpacity style={styles.bloc} onPress={addStat}>
          <Text style={{fontSize:50}}>💪</Text>
          <Text style={styles.textAction}>Ajouter une statistique</Text>
        </TouchableOpacity>

        <View style={styles.bloc}>
          <Text style={{fontSize:50}}>📈</Text>
          <Text style={styles.textAction}>Voir mes statistiques</Text>
        </View>
      </View>


      <View style={{display:"flex", alignItems:"center"}}>
        <TouchableOpacity style={styles.logout} onPress={handlePress}>
          <Text style={styles.buttonLogout}>Me déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
  },
  hello: {
    color: '#4D99D8',
    fontWeight: 'bold',
    fontSize: 40,
    marginTop:20,
    marginLeft:20
  },
  logout: {
    padding:10,
    borderRadius:20,
    backgroundColor:"red",
    width:200,
  },
  buttonLogout: {
    color:"#fff",
    textAlign:"center",
    fontWeight:"600",
    fontSize:18
  },
  bloc:{
    borderRadius:25,
    borderColor: "#4D99D8",
    borderWidth:2,
    marginBottom: 30,
    display:"flex",
    alignItems:"center",
    flexDirection:"row",
    padding:20,
  },
  textAction:{
    fontSize:20,
    fontWeight:"700",
    textAlign:"center",
    width:"80%"
  }
});