import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';
import config from '../config';

export default class Home extends Component {
  state = {
    message: 'Loading..'
  }

  async componentDidMount() {
    const res = await fetch(`${config.API_ADDR}/api/home`);
    const clone = await res.clone();
    const text = await clone.text();
    this.setState({ message: text });
  }

  render() {
    return (
      <View>
        <Text>Home</Text>
        <Text>{this.state.message}</Text>
      </View>
    );
  }
}
