import { View, StyleSheet } from 'react-native'
import { ActivityIndicator } from "react-native-paper";

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  }
})

export default () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator animating />
    </View>
  )
}
