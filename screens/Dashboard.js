import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';

function Dashboard(props) {
  const [firstName, setFirstName] = useState('');


  function logout() {
    const action = { type: "USER_LOGGED_OUT" }
    props.dispatch(action)
    props.navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'Connexion' },
        ],
      })
    );
  }
  const addExo = () => {
    props.navigation.navigate('AddExo')
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.hello}>Mon exo préféré</Text>
        <View>
          <Text style={{margin:10, marginLeft:20}}>Développé couché</Text>
          <LineChart
            data={{
              labels: ["Janvier", "Février", "Mars", "Avril", "Mai"],
              datasets: [
                {
                  data: [
                    30,
                    42,
                    54,
                    59,
                    67,
                    75
                  ]
                }
              ]
            }}
            width={Dimensions.get("window").width} // from react-native
            height={220}
            //yAxisLabel="$"
            yAxisSuffix="kg"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundGradientFrom: "#6f86d6",
              backgroundGradientTo: "#4D99D8",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 15,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#4D99D8"
              }
            }}
            style={{
              borderRadius: 15,
              margin:20,
              marginTop:10,
            }}
          />
        </View>
      </View>

      <View style={{ display: "flex", justifyContent: "center", margin: 20 }}>
        <TouchableOpacity style={styles.bloc} onPress={() => addExo()}>
          <Text style={{ fontSize: 40 }}>💪</Text>
          <Text style={styles.textAction}>Ajouter un exercice</Text>
        </TouchableOpacity>
      </View>


      <View style={{ display: "flex", alignItems: "center" }}>
        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={styles.buttonLogout}>Me déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const mapStateToProps = (state) => {
  return {
    data: state.login.data,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch: (action) => { dispatch(action) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);

const styles = StyleSheet.create({
  container: {
  },
  hello: {
    color: '#4D99D8',
    fontWeight: 'bold',
    fontSize: 40,
    marginTop: 20,
    marginLeft: 20
  },
  logout: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "red",
    width: 200,
  },
  buttonLogout: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18
  },
  bloc: {
    borderRadius: 25,
    borderColor: "#4D99D8",
    borderWidth: 2,
    marginBottom: 30,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    padding: 15,
  },
  textAction: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    width: "80%"
  }
});