import Empty from './Empty'
import { View, FlatList } from 'react-native'

const Separator = () => {
  return (
    <View style={{ paddingVertical: 8 }}>
    </View>
  )
}

export default ({ data, neverEmpty, emptyMessage, emptyIcon, ...flatListProps }) => {
  return (
    <FlatList
      data={data}
      {...flatListProps}
      ItemSeparatorComponent={<Separator />}
      ListEmptyComponent={neverEmpty ? undefined : <Empty icon={emptyIcon} message={emptyMessage} />}
    />
  )
}
