import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { sessionAtom } from '../context'
import { useRoute } from '@react-navigation/native'
import { requestServer } from '../utilities/requests'
import { selectPictureFromGallery } from '../utilities/camera'
import Images from 'react-native-chat-images'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { View } from 'react-native'
import { Bubble, GiftedChat, Send } from 'react-native-gifted-chat'

const parseRawTextMessage = (rawTextMessage) => {
  return {
    text: rawTextMessage.content,
    createdAt: new Date(rawTextMessage.sent_datetime)
  }
}

const fetchMessages = async (chatId) => {
  const payload = {
    chat_id: chatId
  }
  const messages = await requestServer(
    "/chat_service/get_chat_by_id",
    payload
  )

  return messages
}

const addMessage = async (message, senderId, receiverId) => {
  const payload = {
    sender_id: senderId,
    receiver_id: receiverId,
    ...message
  }
  const _ = await requestServer(
    "/chat_service/add_message",
    payload
  )
}

const MessageBubble = ({ currentMessage, ...props }) => {
  switch (currentMessage.content_type) {
    case "text":
      return (
        <Bubble
          currentMessage={parseRawTextMessage(currentMessage)}
          {...props}
          wrapperStyle={{
            right: {
              backgroundColor: '#e00000',
            }
          }}
          textStyle={{
            right: {
              color: '#fff',
            }
          }}
        />
      )

    case "image":
      return (
        <Images
          images={[currentMessage.content]}
        />
      )
  }
}

const SendTextMessageButton = ({ ...props }) => {
  return (
    <Send {...props}>
      <View>
        <MaterialCommunityIcons
          name="send-circle"
          style={{ marginBottom: 5, marginRight: 5 }}
          size={32}
          color="#e00000"
        />
      </View>
    </Send>
  )
}

const SendImageMessageButton = () => {
  return (
    <View>
      <MaterialCommunityIcons
        name="image"
        size={32}
        color="#e00000"
      />
    </View>
  )
}

const ScrollDownButton = () => {
  return (
    <FontAwesome
      name='angle-double-down'
      size={22}
      color='#333'
    />
  )
}

export default () => {
  const route = useRoute()
  const [session, _] = useAtom(sessionAtom)

  const { chat } = route.params

  const [messages, setMessages] = useState([])

  const handleTextMessageSend = ([{ text }]) => {
    const message = {
      content: text,
      content_type: "text"
    }

    addMessageMutation.mutate({
      message,
      customerId: session.customerId,
      receiverId: chat.user.user_id
    })
  }

  const handlePictureMessageChoosen = async () => {
    const picture = await selectPictureFromGallery()

    const message = {
      content: picture,
      content_type: "image"
    }

    addMessageMutation.mutate(message, session.customerId, chat.user.user_id)
  }

  const handleLoadMessages = (fetchedMessages) => {
    const allMessages = GiftedChat.append(messages, fetchedMessages)

    setMessages(allMessages)
  }

  const messagesQuery = useQuery({
    queryKey: ["chatMessages"],
    queryFn: () => fetchMessages(chat.chat_id),
    onSuccess: handleLoadMessages,
    enabled: chat.chat_id !== undefined
  })
  const addMessageMutation = useMutation(
    ({ message, customerId, receiverId }) => addMessage(
      message,
      customerId,
      receiverId
    )
  )

  return (
      <GiftedChat
        placeholder='Mensaje...'
        renderBubble={(props) => <MessageBubble {...props} />}
        renderSend={(props) => <SendTextMessageButton {...props} />}
        renderActions={(props) => <SendImageMessageButton {...props} />}
        scrollToBottomComponent={(props) => <ScrollDownButton {...props} />}

        messages={messages}
        onSend={handleTextMessageSend}
        onPressActionButton={handlePictureMessageChoosen}
        user={{
          user_id: session.customerId
        }}

        scrollToBottom
      />
  )
}
