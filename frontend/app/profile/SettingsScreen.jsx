import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ApiService from '../service/ApiService';

const SettingsScreen = () => {
  const route = useRoute();
  const { user } = route.params;

  const navigation = useNavigation();
  
  const [firstName, setFirstName] = useState(user.first_name);
  const [address, setAddress] = useState(user.address);
  const [lastName, setLastName] = useState(user.last_name);
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number);
  const [county, setCounty] = useState(user.county);

  // State pentru modalul de schimbare a parolei
  const [modalVisible, setModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State pentru mesajele de eroare și succes
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSaveChanges = async () => {
    // Reset error and success messages before validation
    setErrorMessage('');
    setSuccessMessage('');

    if (!firstName || !lastName || !address || !phoneNumber) {
      setErrorMessage('Toate câmpurile trebuie completate!');
      return;
    }

    const updatedUser = {
      id: user.id, // Keep the user ID and other uneditable fields as they are
      username: user.username,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      address: address,
      date: user.date, // Keep date as it is
      password: user.password, // Don't change the password field here
      type: user.type,
      version: user.version,
      county: user.county,
    };

    try {
      await ApiService.updateUser(updatedUser);  // API call to update user info
      setSuccessMessage('Datele au fost actualizate cu succes!');   
      navigation.setParams({ user: updatedUser });   
    } catch (error) {
      setErrorMessage('A apărut o problemă la actualizarea datelor!');
      console.log('Eroare', 'A apărut o problemă la actualizarea datelor!', error);
    }
  };

  const handleChangePassword = async () => {
    // Reset error and success messages before validation
    setErrorMessage('');
    setSuccessMessage('');
  
    // Validate that the new password and confirm password match
    if (newPassword !== confirmPassword) {
      setErrorMessage('Parolele nu se potrivesc!');
      return;
    }

    const updatedUser = {
      ...user,
      password: newPassword, // Actualizează doar parola
    };
  
    // Call the API to update the password
    try {
      // Call the backend to change the password
      const message = await ApiService.updateUserPassword(user.id, oldPassword, newPassword);
      setSuccessMessage(message); // Set success message
      setModalVisible(false); // Close the modal on success
      navigation.setParams({ user: updatedUser });
    } catch (error) {
      setErrorMessage(error.message || 'A apărut o problemă la schimbarea parolei!'); // Set error message
      console.log('Eroare', error.message || 'A apărut o problemă la schimbarea parolei!');
    }
  
    // Clear password fields after the process
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setări</Text>

      <Text style={styles.label}>Nume</Text>
  <TextInput
    style={styles.input}
    placeholder="Nume"
    value={firstName}
    onChangeText={setFirstName}
  />

  <Text style={styles.label}>Prenume</Text>
  <TextInput
    style={styles.input}
    placeholder="Prenume"
    value={lastName}
    onChangeText={setLastName}
  />

  <Text style={styles.label}>Oraș</Text>
  <TextInput
    style={styles.input}
    placeholder="Oraș"
    value={address}
    onChangeText={setAddress}
  />

  <Text style={styles.label}>Județ</Text>
  <TextInput
    style={styles.input}
    placeholder="Județ"
    value={county}
    onChangeText={setCounty}
  />

  <Text style={styles.label}>Număr de telefon</Text>
  <TextInput
    style={styles.input}
    placeholder="Număr de telefon"
    value={phoneNumber}
    onChangeText={setPhoneNumber}
  />

      <Button
        title="Schimbă parola"
        onPress={() => setModalVisible(true)}
        color="#FF6347"
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schimbă parola</Text>

            <TextInput
              style={styles.input}
              placeholder="Parola veche"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Parola nouă"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmă parola nouă"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.modalButtons}>
              <Button title="Anulează" onPress={() => setModalVisible(false)} />
              <Button title="Salvează" onPress={handleChangePassword} />
            </View>
            
            {/* Error and Success messages */}
            {errorMessage || successMessage ? (
              <Text style={styles.message}>
                {errorMessage || successMessage}
              </Text>
            ) : null}
          </View>
        </View>
      </Modal>

      <Button title="Salvează modificările" onPress={handleSaveChanges} />

      {/* Error and Success messages */}
      {errorMessage || successMessage ? (
        <Text style={styles.message}>
          {errorMessage || successMessage}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  changePasswordButton: {
    backgroundColor: '#FF6347', // Roșu tomat
    color: 'white',
    padding: 10,
    borderRadius: 5,
    fontWeight: 'bold',
  },
  message: {
    color: 'green',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  errorMessage: {
    color: 'red',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default SettingsScreen;
