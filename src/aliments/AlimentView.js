/**
 * Created by nicolab on 12/3/2016.
 */
import React, {Component} from 'react';
import {Text, View, StyleSheet, TouchableHighlight} from 'react-native';

export class AlimentView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <TouchableHighlight onPress={() => this.props.onPress(this.props.aliment)}>
                <View>
                    <Text style={styles.listItem}>{this.props.aliment.text}</Text>
                </View>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    listItem: {
        margin: 10,
    }
});
