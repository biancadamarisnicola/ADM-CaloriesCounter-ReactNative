/**
 * Created by nicolab on 12/3/2016.
 */
import React, {Component} from 'react';
import {Text, View, TextInput, StyleSheet, ActivityIndicator} from 'react-native';
import {
    Button,
    TYPO,
    COLOR,
    Subheader
} from 'mrn';


export default class MyButton extends Component {
    constructor(props) {
        super(props);
    }

    render = () => {
        var { primary } =  this.props;

        return (
            <View>
                <Subheader text="Light Theme"/>
                <View style={styles.content}>
                    <Button value="NORMAL FLAT" primary={primary} onPress={()=> console.log(this.refs)}/>
                    <Button value="DISABLED FLAT" disabled={true} primary={primary}/>
                    <Button value="NORMAL RAISED" raised={true} primary={primary}/>
                    <Button value="DISABLED RAISED" disabled={true} raised={true} primary={primary}/>
                </View>
                <Subheader text="Dark Theme"/>
                <View style={{
                        backgroundColor: COLOR.paperGrey900.color,
                        padding: 16,

                    }}>
                    <Button value="NORMAL FLAT" theme="dark" primary={primary}/>
                    <Button value="DISABLED FLAT" disabled={true} theme="dark" primary={primary}/>
                    <Button value="NORMAL RAISED" theme="dark" raised={true} primary={primary}/>
                    <Button value="DISABLED RAISED" disabled={true} theme="dark" raised={true} primary={primary}/>
                </View>
            </View>
        );
    };


}

const styles = StyleSheet.create({
    content: {
        padding: 16,
    },
});