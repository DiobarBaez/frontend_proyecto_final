<template>
  <v-app>
    <v-container class="container-highlight">
    
      <v-row class="container-highlight mb-3">
        <v-col cols="12">
          <h2 class="page-title">User Management</h2>
        </v-col>
      </v-row>

      <v-row class="container-highlight mb-3">
        <v-col cols="12">
          <v-text-field
            v-model="searchTerm"
            label="Search"
            append-icon="mdi-magnify"
            hide-details
            outlined
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row class="container-highlight mb-3">
        <v-col cols="12">
          <table class="container-highlight centered-table">
            <thead>
              <tr>
                <th class="centered-header">Name</th>
                <th class="centered-header">Role</th>
                <th class="centered-header">Email</th>
                <th class="centered-header">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.name">
                <td>{{ user.name }}</td>
                <td>{{ user.rol }}</td>
                <td>{{ user.email }}</td>
                <td class="centered-buttons">
                  <v-btn 
                    @click="openUpdateUserModal(user)" 
                    color="warning">
                    Update
                  </v-btn>
                  <v-btn 
                    @click="deleteUserConfirmation(user)" 
                    color="error">
                    Delete
                  </v-btn>  
                </td>
              </tr>
            </tbody>
            
          </table>
        </v-col>
      </v-row>


      <!-- Botón "Add User" alineado a la derecha -->
      <v-row class="text-right">
        <v-col cols="12">
          <v-btn @click="openAddUserModal" color="#313844">Add User</v-btn>
        </v-col>
      </v-row>
        
      <!-- Modal for adding a new user -->
      <v-dialog v-model="isAddUserModalActive">
        <v-card>
          <v-card-title class="cabeceras">
            <span class="headline">Add User</span>
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="newUser.name" label="Name"></v-text-field>
            <v-select
              v-model="newUser.rol"
              :items="roleOptions"
              label="Role"
            ></v-select>
            <v-text-field v-model="newUser.email" label="Email"></v-text-field>
            <v-text-field v-model="newUser.password" label="Password"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="addNewUser" color="primary">Add</v-btn>
            <v-btn @click="closeAddUserModal">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

        
      <!-- Modal for updating a user -->
      <v-dialog v-model="isUpdateUserModalActive" >
        <v-card>
          <v-card-title class="cabeceras">
            <span class="headline">Update User</span>
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="updatedUser.name" label="Name"></v-text-field>
            <v-select
              v-model="updatedUser.rol"
              :items="roleOptions"
              label="Role"
            ></v-select>
            <v-text-field v-model="updatedUser.email" label="Email" disabled></v-text-field>
            <v-text-field v-model="updatedUser.password" label="Password"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="updateUser" color="warning">Update</v-btn>
            <v-btn @click="closeUpdateUserModal">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Modal for confirming user deletion -->
      <v-dialog v-model="isDeleteUserConfirmationActive">
        <v-card>
          <v-card-title class="cabeceras">
            <span class="headline">Confirm Delete</span>
          </v-card-title>
          <v-card-text>
            Are you sure you want to delete this user?
          </v-card-text>
          <v-card-actions>
            <v-btn @click="deleteUserConfirmed" color="error">Delete</v-btn>
            <v-btn @click="cancelDeleteUser">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Feedback message -->
      <v-snackbar v-model="feedbackMessage.show" :timeout="3000" :color="feedbackMessage.color">
        {{ feedbackMessage.message }}
      </v-snackbar>

    </v-container>

  </v-app>

</template>

<script setup>

  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { watch } from 'vue';
  import store from '../store/store';
  import _ from 'lodash';
  
  const API_URL = "http://localhost:5038/api/1.0/";
  var newUser = ref({
    name: "",
    rol: "",
    email: "",
    password: "",
  });
  var updatedUser = ref({
    name: "",
    rol: "",
    email: "",
    password: "",
  });

  const users = ref([]);
  const aux = ref([]);
  const medicos = ref([]);
  const medico = ref([]);
  const isUpdateUserModalActive = ref(false);
  const isDeleteUserConfirmationActive = ref(false);
  const selectedUser = ref(null);
  const feedbackMessage = ref({
    show: false,
    message: '',
    color: '',
  });
  const isAddUserModalActive = ref(false);
  var roleOptions = ref(false);
  const userData = ref(store.getters.getUserData);
  const searchTerm = ref("");
  const originalUsers = ref([]); // Mantén una copia original de los usuarios



  const refreshData = async () => {
    try {
      const response = await axios.get(API_URL + "users/");
      users.value = response.data.data;
      aux.value = response.data.data;

      if (Array.isArray(users.value)) {
        if (userData.value.rol === "Administrador") {
          originalUsers.value = [...users.value];
        } else {

          originalUsers.value = [...users.value];
          console.log(users.value);
        }
      } else {
        console.error("Error: users.value is not an array");
      }

      filterMedicos();
      filterMedico();
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };



  const filterMedicos = () => {
    medicos.value = aux.value
      .filter(user => user.rol === "Medico")
      .map(user => user.name);
  };

  const filterMedico = () => {
    medico.value = aux.value
      .filter(user =>user.name === userData.value.name)
      .map(user => user.name);
  };


  const addNewUser = async () => {
    // Verificar si el name y email ya existen
    const isDuplicateName = users.value.some((user) => user.name === newUser.value.name);
    const isDuplicateEmail = users.value.some((user) => user.email === newUser.value.email);

    if (isDuplicateName || isDuplicateEmail) {
      showFeedbackMessage("El name o email ya existen. Introduce valores únicos.", 'warning');
      return; // No permite agregar usuarios duplicados
    }


    try {
      const response = await axios.post(API_URL + "users/", newUser.value);
      refreshData();
      showFeedbackMessage(response.data.message, 'success');

      newUser.value = {};
      closeAddUserModal();
    } catch (error) {
      showFeedbackMessage("Error al intentar añadir un nuevo usuario", 'error');
    }
  };


  const deleteUserConfirmation = (user) => {
    selectedUser.value = user;
    updatedUser.value = { ...user };
    if(userData.value.rol === "Administrador"){
      isDeleteUserConfirmationActive.value = true;
    }else{
        showFeedbackMessage("No cuentas con los permisos necesarios para realizar esta accion.", 'warning');
    }
  };


  const deleteUserConfirmed = async () => {
    if (selectedUser.value !== null) {
      try {
        const response = await axios.delete(API_URL + `users/${selectedUser.value.name}`);
        refreshData();
        showFeedbackMessage(response.data.message, 'success');
      } catch (error) {
        console.error("Error deleting user:", error);
        showFeedbackMessage("Error al eliminar usuario.", 'error');
      } finally {
        selectedUser.value = null;
        isDeleteUserConfirmationActive.value = false;
      }
    }
  };

  const cancelDeleteUser = () => {
    selectedUser.value = null;
    isDeleteUserConfirmationActive.value = false;
  };



  const openUpdateUserModal = (user) => {
    selectedUser.value = user;
    updatedUser.value = _.cloneDeep(user);

    if (userData.value.rol === "Administrador") {
      isUpdateUserModalActive.value = true;
    } else {
        showFeedbackMessage("No cuentas con los permisos necesarios para realizar esta acción.", 'warning');
    }
  };

  const closeUpdateUserModal = () => {
    selectedUser.value = null;
    updatedUser.value = {};
    isUpdateUserModalActive.value = false;
  };

  const updateUser = async () => {

    if (Object.values(updatedUser.value).every(value => !!value)) {

      const isDuplicateName = users.value.some((user) => user.name === updatedUser.value.name && user.id !== selectedUser.value.id);
      const isDuplicateEmail = users.value.some((user) => user.email === updatedUser.value.email && user.id !== selectedUser.value.id);

      if (isDuplicateName || isDuplicateEmail) {
        showFeedbackMessage("El name o email ya existen para otros usuarios. Introduce valores únicos.", 'warning');
        return; // No permite actualizar usuarios con datos duplicados
      }

      try {
        //console.log(selectedUser.value.name);
        //consolconsole.loge.log(updatedUser.value);
        const response = await axios.patch(API_URL + `users/${selectedUser.value.name}`, updatedUser.value);
        refreshData();
        showFeedbackMessage(response.data.message, 'success');
        closeUpdateUserModal();
      } catch (error) {
        showFeedbackMessage("Error al actualizar informaciion del usuario.", 'error');
      }
    }else{
      showFeedbackMessage("Para actualizar tiene que proporcionar todos los campos", 'warning');
    }
  };


  const openAddUserModal = () => {
    newUser = ref({
      name: "",
      rol: "",
      email: "",
      password: "",
    });
    isAddUserModalActive.value = true;
  };

  const closeAddUserModal = () => {
    isAddUserModalActive.value = false;
  };


  const filterUsers = () => {
    if (!searchTerm.value) {
      // Si el término de búsqueda está vacío, muestra todos los usuarios
      users.value = [...originalUsers.value];
    } else {
      // Filtra los usuarios basados en el término de búsqueda
      users.value = originalUsers.value.filter((user) => {
        return (
          user.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          user.rol.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.value.toLowerCase()) 
        );
      });
    }
  };

  const showFeedbackMessage = (message, type) => {
    feedbackMessage.value.message = message;
    feedbackMessage.value.color = type;
    feedbackMessage.value.show = true;
  };


  onMounted(async () => {
    await refreshData();
    // Copia la lista original de usuarios cuando obtienes los datos
    originalUsers.value = [...users.value];
  });

  watch(searchTerm, filterUsers);

  
  if (userData.value.rol === "Administrador"){
    roleOptions.value = [
      "Administrador",
      "Tecnico",
      // Agrega más roles según tus necesidades
    ];
  }
    

</script>

<style>

    /********** ESTILOS PARA EL TITULO ***********/

    td button:hover {
      color: #313844; /* Color del texto de los botones al pasar el mouse */
    }

    .page-title {
      font-size: 24px; /* Tamaño de fuente */
      color: #333; /* Color del texto */
      margin-bottom: 20px; /* Espaciado inferior */
      text-align: center; /* Alineación al centro */
    }

        .container-highlight {
      box-shadow: 0px 0px 10px #313844; /* Sombra suave alrededor del contenedor */
      transition: box-shadow 0.3s ease; /* Transición suave para la sombra */
    }

    /* Estilo al pasar el mouse sobre los contenedores */
    .container-highlight:hover {
      box-shadow: 0px 0px 15px #313844; /* Aumenta la intensidad de la sombra al pasar el mouse */
    }


    /********** ESTILOS PARA LOS MODALES ***********/

    .v-dialog {
      max-width: 400px;
      margin: 0 auto;
      box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Sombra suave */
      border-radius: 8px; /* Esquinas redondeadas */
    }

    .cabeceras {
      background-color: #313844; /* Color de fondo del encabezado */
      color: #fff; /* Color del texto del encabezado */
      padding: 16px;
      border-top-left-radius: 8px; /* Esquina superior izquierda redondeada */
      border-top-right-radius: 8px; /* Esquina superior derecha redondeada */
    }

    .cabecera_secundaria{
      border-style: ridge;
      font-size: small;
      border-top-left-radius: 8px; /* Esquina superior izquierda redondeada */
      border-top-right-radius: 8px; /* Esquina superior derecha redondeada */
    }

    .v-card-text {
      padding: 16px;
    }

    /* Estilo para los botones en los modales */
    .v-btn {
      margin-right: 10px;
    }

    /* Estilo para los botones "Add" y "Update" */
    .v-btn.primary {
      background-color: #313844; /* Color de fondo del botón */
      color: #fff; /* Color del texto del botón */
      border: none;
      border-radius: 4px; /* Esquinas redondeadas del botón */
      padding: 10px 20px;
      cursor: pointer;
    }

    .v-btn.primary:hover {
      background-color: #313844; /* Color de fondo del botón al pasar el mouse */
    }

    /* Estilo para el botón "Cancel" */
    .v-btn.secondary {
      background-color: #ccc; /* Color de fondo del botón */
      color: #333; /* Color del texto del botón */
      border: none;
      border-radius: 4px; /* Esquinas redondeadas del botón */
      padding: 10px 20px;
      cursor: pointer;
    }

    .v-btn.secondary:hover {
      background-color: #999; /* Color de fondo del botón al pasar el mouse */
    }

    /* Estilo para los diálogos de confirmación */
    .v-dialog.confirmation {
      max-width: 300px;
    }

    


    /********** ESTILOS PARA LA TABLA ***********/

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-family: Arial, sans-serif; /* Cambia la fuente de texto si lo deseas */
    }

    /* Estilo para las celdas del encabezado de la tabla */
    th {
      background-color: #313844; /* Color de fondo del encabezado */
      color: #fff; /* Color del texto del encabezado */
      padding: 10px;
      text-align: left;
    }

    /* Estilo para las celdas de datos de la tabla */
    td {
      padding: 10px;
      border: 1px solid #ccc;
    }

    /* Estilo para las filas impares */
    tr:nth-child(odd) {
      background-color: #f2f2f2; /* Color de fondo para filas impares */
    }

    /* Estilo para resaltar las celdas de acción */
    td button {
      background-color: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #313844; /* Color del texto de los botones */
      margin-right: 10px;
      font-weight: bold;
      transition: color 0.3s ease; /* Efecto de transición al pasar el mouse */
    }

      /* Estilo para centrar los encabezados */
  .centered-header {
    text-align: center;
  }

  /* Estilo para dimensionar automáticamente la última columna */
  .centered-buttons {
    text-align: center;
    white-space: nowrap; /* Evita que el contenido se divida en varias líneas */
  }

</style>


<!-- 

  .container-highlight {
    background-color: #f8f8f8; /* Color de fondo del contenedor */
    border-radius: 8px; /* Bordes redondeados */
    box-shadow: 0px 0px 20px rgba(0, 123, 255, 0.2); /* Sombra suave */
    transition: transform 0.3s ease, box-shadow 0.3s ease; /* Transición suave para la transformación y la sombra */
    transform: scale(1); /* Escala inicial */
  }

  /* Estilo al pasar el mouse sobre los contenedores */
  .container-highlight:hover {
    box-shadow: 0px 0px 30px rgba(0, 123, 255, 0.4); /* Aumenta la intensidad de la sombra */
    transform: scale(1.02); /* Aumenta ligeramente el tamaño */
  }

  /* Estilo para el título del contenedor */
  .container-title {
    background-color: #007bff; /* Color de fondo del título */
    color: #fff; /* Color del texto del título */
    padding: 10px 20px; /* Espaciado interno */
    border-top-left-radius: 8px; /* Borde superior izquierdo redondeado */
    border-top-right-radius: 8px; /* Borde superior derecho redondeado */
    font-size: 20px; /* Tamaño de fuente del título */
  }
-->