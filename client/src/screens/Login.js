import React, { Component } from 'react';
import {
  View,
  Text,
  AsyncStorage
} from 'react-native';
import { Input, Button } from '../components';
import { Link } from '../navigation';
import styles from '../stylesheet';
import config from '../config';
import Web3 from 'web3';

export default class Login extends Component {
  state = {
    user: {
      email: '',
      password: ''
    },
    loading: false,
    message: '',
    loginSuccess: false,
    ethereum: '',
  }

  storeToken = async (token) => {
    try {
      const jsonItem = await AsyncStorage.setItem("JWT_TOKEN", JSON.stringify(token));
      return jsonItem
    } catch (err) {
      console.log(err.message)
    }
  };

  onInputChange = (key, value) => {
    this.setState(prevState => ({
      user: {
          ...prevState.user,
          [key]: value
      },
    }))
  }

  signIn = async (e) => {
    e.preventDefault();
    this.setState({loading: true});

    this.state.ethereum.enable();
    const address = await this.state.ethereum.selectedAddress;
    console.log(this.state.ethereum);
    console.log(address);
    try {
      const res = await fetch(`${config.API_ADDR}/auth/authenticate`, {
        method: 'POST',
        body: JSON.stringify(this.state.user),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }
      });
      const json = await res.json();
      const status = await res.status;
      await json
      this.setState({ loading: false });
      switch(status) {
        case 200:
          this.storeToken( json.token );
          await this.setState({
            message: json.message,
            loginSuccess: true,
          });
          this.props.history.push('/secret')
          break;
        case 401:
          this.setState({
            message: json.message,
            loginSuccess: false,
            loading: false
          });
          break;
        default:
          const error = new Error(res.error);
          throw error;
      }
    } catch (err) {
      console.error(err);
      this.setState({
        message: 'Error connecting to server, check internet connection',
        loginSuccess: false
      });
    }
  }

  signUp = async (address) => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users`, {
      body: JSON.stringify({ address }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });
    const json = await res.json();
    console.log(json);
  }

  componentDidMount() {
    const ethereum = window.ethereum;
    this.setState({ ethereum });
  }

  render() {
    return (
      <View>
        <Text>Login Below!</Text>
        <Button
          isLoading = {this.state.loading}
          title='Sign In with Metamask'
          onPress={this.signIn}
          />
        <Text style={this.state.loginSuccess
        ? styles.loginSuccess : styles.loginFailure} >
          {this.state.message}
        </Text>
        <Link to="/register">
          <Text style={styles.link}>Create a new account</Text>
        </Link>
      </View>
    );
  }
}
