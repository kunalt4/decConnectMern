import axios from "axios";

import { GET_ERRORS, SET_CURRENT_USER } from "./types";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

// Register User

export const registerUser = (userData, history) => dispatch => {
  axios
    .post("/api/users/register", userData)
    .then(res => history.push("/login"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//Login user
export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      //Save token to localStorage
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);

      //Set token to auth header
      setAuthToken(token);

      //Decode token to get user details
      const decoded = jwt_decode(token);

      //Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//Set current user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

//Logout user
export const logoutUser = () => dispatch => {
  //Remove token
  localStorage.removeItem("jwtToken");

  //Remove auth header
  setAuthToken(false);

  //Set current user to empty object -- set isAuthenticated to false
  dispatch(setCurrentUser({}));

  //redirect to login
  window.location.href = "/login";
};
