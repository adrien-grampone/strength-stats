import { createStore, combineReducers } from "redux";
import DataReducer from '../reducers/DataReducer';
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
}

const appReducer = combineReducers({
  login:DataReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'USER_LOGGED_OUT') {
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer)

let store = createStore(persistedReducer);
let persistor = persistStore(store)

const configureStore = () => {
  let storeDefault = { store,persistor};
  return storeDefault;
};

export default configureStore();


