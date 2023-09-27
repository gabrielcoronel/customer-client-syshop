import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import { useForm } from '../utilities/hooks'
import { useAtom } from 'jotai'
import { sessionAtom } from '../context'
import { checkEmail, makeNotEmptyChecker } from '../utilities/validators'
import { requestServer } from '../utilities/requests'
import TextField from '../components/TextField'
import LoadingSpinner from '../components/LoadingSpinner'
import Screen from '../components/Screen'
import { View } from 'react-native'
import {
  Text,
  List,
  Button,
  TouchableRipple,
  Divider,
  Portal,
  Dialog
} from 'react-native-paper'

const changeEmail = async (customerId, email, password) => {
  const payload = {
    user_id: customerId,
    email,
    password
  }
  const _ = await requestServer(
    "/users_service/change_user_email",
    payload
  )
}

const changePassword = async (customerId, oldPassword, newPassword) => {
  const payload = {
    user_id: customerId,
    old_password: oldPassword,
    new_password: newPassword
  }
  const _ = await requestServer(
    "/users_service/change_user_password",
    payload
  )
}

const fetchCustomer = async (customerId) => {
  const payload = {
    customer_id: customerId
  }
  const customer = await requestServer(
    "/customers_service/get_customer_by_id",
    payload
  )

  return customer
}

const deleteCustomer = async (customerId) => {
  const payload = {
    user_id: customerId
  }
  const _ = await requestServer(
    "/users_service/delete_user",
    payload
  )
}

const ChangeEmailDialog = ({ isVisible, onDismiss }) => {
  const [session, _] = useAtom(sessionAtom)

  const fillFormFields = (data) => {
    form.setField("email")(data.email)
  }

  const handleSubmit = () => {
    changeEmailMutation.mutate(form.fields)
  }

  const customerQuery = useQuery({
    queryKey: ["customerChangeEmail"],
    queryFn: () => fetchCustomer(session.customerId),
    onSuccess: fillFormFields
  })
  const changeEmailMutation = useMutation(
    ({ email, password }) => changeEmail(session.customerId, email, password)
  )
  const form = useForm(
    {
      email: "",
      password: ""
    },
    {
      email: checkEmail,
      password: makeNotEmptyChecker("Contraseña vacía")
    }
  )

  if (changeEmailMutation.isSuccess) {
    onDismiss()
  }

  if (customerQuery.isLoading || changeEmailMutation.isLoading) {
    return (
      <Portal>
        <LoadingSpinner inScreen />
      </Portal>
    )
  }

  return (
    <Portal>
      <Dialog visible={isVisible} onDismiss={onDismiss}>
        <Dialog.Icon icon="email" />

        <Dialog.Title>
          Cambia tu correo de electrónico
        </Dialog.Title>

        <Dialog.Content>
          <TextField
            value={form.getField("email")}
            onChange={form.setField("email")}
            placeholder="Nuevo correo electrónico"
          />

          <TextField
            value={form.getField("password")}
            onChange={form.setField("password")}
            placeholder="Contraseña"
            secureTextEntry
          />
        </Dialog.Content>

        <Dialog.Actions>
          <Button
            onPress={onDismiss}
          >
            Cancelar
          </Button>

          <Button
            onPress={handleSubmit}
          >
            Confirmar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

const ChangePasswordDialog = ({ isVisible, onDismiss }) => {
  const [session, _] = useAtom(sessionAtom)

  const handleSubmit = () => {
    changePasswordMutation.mutate(form.fields)
  }

  const changePasswordMutation = useMutation(
    ({ oldPassword, newPassword }) => changePassword(session.customerId, oldPassword, newPassword)
  )
  const form = useForm(
    {
      oldPassword: "",
      newPassword: ""
    },
    {
      oldPassword: makeNotEmptyChecker("Contraseña vacía"),
      newPassword: makeNotEmptyChecker("Contraseña vacía")
    }
  )

  if (changePasswordMutation.isSuccess) {
    onDismiss()
  }

  if (changePasswordMutation.isLoading) {
    return (
      <Portal>
        <LoadingSpinner />
      </Portal>
    )
  }

  return (
    <Portal>
      <Dialog visible={isVisible} onDismiss={onDismiss}>
        <Dialog.Icon icon="key" />

        <Dialog.Title>
          Cambia tu contraseña
        </Dialog.Title>

        <Dialog.Content>
          <TextField
            value={form.getField("newPassword")}
            onChange={form.setField("newPassword")}
            placeholder="Nueva contraseña"
            secureTextEntry
          />

          <TextField
            value={form.getField("oldPassword")}
            onChange={form.setField("oldPassword")}
            placeholder="Vieja contraseña"
            secureTextEntry
          />
        </Dialog.Content>

        <Dialog.Actions>
          <Button
            onPress={onDismiss}
          >
            Cancelar
          </Button>

          <Button
            onPress={handleSubmit}
          >
            Confirmar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

const CloseSessionDialog = ({ isVisible, onDismiss }) => {
  const navigation = useNavigation()
  const [_, setSession] = useAtom(sessionAtom)

  const handleCloseSession = () => {
    setSession(null)

    navigation.navigate("Welcome")
  }

  return (
    <Portal>
      <Dialog visible={isVisible} onDismiss={onDismiss}>
        <Dialog.Icon icon="exit-run" />

        <Dialog.Title>
          ¿Estás seguro?
        </Dialog.Title>

        <Dialog.Content>
          <Text variant="bodyLarge">
            Estás apunto de cerrar sesión
          </Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button
            onPress={onDismiss}
          >
            Cancelar
          </Button>

          <Button
            onPress={handleCloseSession}
          >
            Confirmar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

const DeleteAccountDialog = ({ isVisible, onDismiss }) => {
  const navigation = useNavigation()
  const [session, _] = useAtom(sessionAtom)

  const handleDeleteAccount = () => {
    deleteCustomerMutation.mutate({ customerId: session.customerId })

    navigation.navigate("Welcome")
  }

  const deleteCustomerMutation = useMutation(
    ({ customerId }) => deleteCustomer(customerId)
  )

  return (
    <Portal>
      <Dialog visible={isVisible} onDismiss={onDismiss}>
        <Dialog.Icon icon="delete" />

        <Dialog.Title>
          ¿Estás seguro?
        </Dialog.Title>

        <Dialog.Content>
          <Text variant="bodyLarge">
            No podrás recuperar tu cuenta después de eliminarla
          </Text>
        </Dialog.Content>

        <Dialog.Actions>
          <Button
            onPress={onDismiss}
          >
            Cancelar
          </Button>

          <Button
            onPress={handleDeleteAccount}
          >
            Confirmar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

const SettingEntry = ({ heading, icon, onPress, ...listItemProps }) => {
  return (
    <TouchableRipple
      onPress={onPress}
    >
      <List.Item
        title={heading}
        left={(props) => <List.Icon {...props} icon={icon} />}
        {...listItemProps}
      />
    </TouchableRipple>
  )
}

export default () => {
  const navigation = useNavigation()
  const [session, _] = useAtom(sessionAtom)

  const [isChangeEmailDialogVisible, setIsChangeEmailDialogVisible] = useState(false)
  const [isChangePasswordDialogVisible, setIsChangePasswordDialogVisible] = useState(false)
  const [isCloseSessionDialogVisible, setIsCloseSessionDialogVisible] = useState(false)
  const [isDeleteAccountDialogVisible, setIsDeleteAccountDialogVisible] = useState(false)

  const customerQuery = useQuery({
    queryKey: ["customerSettings"],
    queryFn: () => fetchCustomer(session.customerId)
  })

  if (customerQuery.isLoading) {
    console.log("SETTINGS ESTÁ CARGANDO")

    return (
      <LoadingSpinner />
    )
  }

  return (
    <Screen>
      <Text variant="titleLarge">
        Configuración
      </Text>

      <List.Section>
        <List.Subheader>
          Historial
        </List.Subheader>

        <SettingEntry
          title="Publicaciones que te gustan"
          onPress={() => navigation.navigate("LikedPosts")}
        />

        <SettingEntry
          title="Tus compras"
          onPress={() => navigation.navigate("PurchasesList")}
        />

        <List.Subheader>
          Cuenta
        </List.Subheader>

        <Divider />

        {
          customerQuery.data.account_type === "PlainAccount" ?
          (
            <View>
              <SettingEntry
                heading="Cambiar correo electrónico"
                onPress={() => setIsChangeEmailDialogVisible(true)}
              />

              <SettingEntry
                heading="Cambiar contraseña"
                onPress={() => setIsChangePasswordDialogVisible(true)}
              />
            </View>
          ) :
          null
        }

        <SettingEntry
          heading="Cerrar sesión"
          onPress={() => setIsCloseSessionDialogVisible(true)}
        />

        <SettingEntry
          heading="Eliminar cuenta"
          onPress={() => setIsDeleteAccountDialogVisible(true)}
          titleStyle={{ color: "red" }}
        />
      </List.Section>

      {
        isChangeEmailDialogVisible ?
        <ChangeEmailDialog
          isVisible={isChangeEmailDialogVisible}
          onDismiss={() => setIsChangeEmailDialogVisible(false)}
        /> :
        null
      }

      {
        isChangePasswordDialogVisible ?
        <ChangePasswordDialog
          isVisible={isChangePasswordDialogVisible}
          onDismiss={() => setIsChangePasswordDialogVisible(false)}
        /> :
        null
      }

      <CloseSessionDialog
        isVisible={isCloseSessionDialogVisible}
        onDismiss={() => setIsCloseSessionDialogVisible(false)}
      />

      <DeleteAccountDialog
        isVisible={isDeleteAccountDialogVisible}
        onDismiss={() => setIsDeleteAccountDialogVisible(false)}
      />
    </Screen>
  )
}
