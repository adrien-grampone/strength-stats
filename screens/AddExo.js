import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, Keyboard, StyleSheet, SafeAreaView, Image } from 'react-native';
import axios from 'axios';
import { connect } from 'react-redux';


function AddExo(props) {
    return (
        <View style={styles.container}>
            <Text>Add exo</Text>
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
  
  export default connect(mapStateToProps, mapDispatchToProps)(AddExo);


const styles = StyleSheet.create({
    container: {
    },
});