const initialState = {
    data: {},
};

const countReducer = (state = initialState, action) => {
    switch (action.type) {
        case "GET_INFOS_USER":
            return {
                ...state,
                data: { ...state.data, ...action.data }
            };

        case "EDIT_TOKEN_USER":
            let dataToken = state.data;
            dataToken.infosInstallateur.token = action.token;
            return {
                ...state,
                data: dataToken
            };
        
        default:
            return state;
    }
}
export default countReducer;
