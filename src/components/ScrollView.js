import { View, FlatList } from 'react-native'
import { Divider, ActivityIndicator } from 'react-native-paper'

export default ({ data, ...flatListProps }) => {
  return (
    <FlatList
      data={data}
      {...flatListProps}
      ItemSeparatorComponent={<Divider />}
      onStartReachedThreshold={0.1}
      onEndReachedThreshold={0.1}
    />
  )
}
