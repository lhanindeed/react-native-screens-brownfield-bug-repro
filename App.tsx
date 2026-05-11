import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  FormSheetModal: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Brownfield Repro · Home</Text>
      <Text style={styles.body}>
        Tap below to present a formSheet modal. In a brownfield Android app on
        Fabric, the modal will appear sized correctly but be invisible until
        the screen is forced to re-layout (e.g. lock/unlock).
      </Text>
      <Button
        title="Present formSheet modal"
        onPress={() => navigation.navigate('FormSheetModal')}
      />
    </View>
  );
}

function FormSheetModalScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'FormSheetModal'>) {
  return (
    <View style={styles.modal}>
      <Text style={styles.title}>FormSheet content</Text>
      <Text style={styles.body}>
        If you can see this, the bug is NOT reproducing. In the brownfield +
        Fabric scenario described in the investigation, this view would be
        present in the tree but invisible.
      </Text>
      <Button title="Dismiss" onPress={() => navigation.goBack()} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: 'Brownfield Repro'}}
          />
          <Stack.Screen
            name="FormSheetModal"
            component={FormSheetModalScreen}
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.5, 1.0],
              sheetGrabberVisible: true,
              title: 'FormSheet',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  title: {fontSize: 20, fontWeight: '600', textAlign: 'center'},
  body: {fontSize: 14, textAlign: 'center', lineHeight: 20},
});
