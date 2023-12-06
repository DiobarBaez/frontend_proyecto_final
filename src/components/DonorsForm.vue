<template>
  <v-app>
    <v-container class="container-highlight">
    
      <v-row class="container-highlight mb-3">
        <v-col cols="12">
          <h2 class="page-title">Donors Management</h2>
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
                <th class="centered-header">Rfc</th>
                <th class="centered-header">Name</th>
                <th class="centered-header">Projects</th>
                <th class="centered-header">qty</th>
                <th class="centered-header">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="donor in donors" :key="donor.name">
                <td>{{ donor.rfc }}</td>
                <td>{{ donor.name }}</td>
                <td>
                  <v-chip-group>
                    <v-chip
                      v-for="(value, index) in donor.projects"
                      :key="index"
                      class="ma-1"
                      color="primary"
                      dark
                    >
                      {{ value }}
                    </v-chip>
                  </v-chip-group>
                </td>                
                <td>{{ donor.qty }}</td>
                <td class="centered-buttons">
                  <v-btn @click="openViewDonorModal(donor)" color="primary">View </v-btn>
                  <v-btn 
                    @click="openUpdateDonorModal(donor)" 
                    color="warning">
                    Update
                  </v-btn>
                  <v-btn 
                    @click="deleteDonorConfirmation(donor)" 
                    color="error">
                    Delete
                  </v-btn>  
                </td>
              </tr>
            </tbody>
            
          </table>
        </v-col>
      </v-row>


      <!-- Botón "Add donor" alineado a la derecha -->
      <v-row class="text-right">
        <v-col cols="12">
          <v-btn @click="openAddDonorModal" color="#313844">Add Donor</v-btn>
        </v-col>
      </v-row>
        
      <!-- Modal for adding a new donor -->
      <v-dialog v-model="isAddDonorModalActive">
        <v-card>
          <v-card-title class="cabeceras">
            <span class="headline">Add Donor</span>
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="newDonor.rfc" label="Rfc"></v-text-field>
            <v-text-field v-model="newDonor.name" label="Name"></v-text-field>
            <v-text-field v-model="newDonor.image" label="Image"></v-text-field>
            <v-text-field v-model="newDonor.qty" label="Qty"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="addNewDonor" color="primary">Add</v-btn>
            <v-btn @click="closeAddDonorModal">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


      <!-- Modal for view a Donor -->
      <v-dialog v-model="isViewDonorModalActive" max-width="600">
        <v-card>
          <v-card-title class="cabeceras">
            <span class="headline">View Donor</span>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="text-center">
            <v-text-field v-model="updatedDonor.rfc" label="RFC" disabled></v-text-field>
            <v-text-field v-model="updatedDonor.name" label="Name" disabled></v-text-field>

            <!-- Etiqueta y v-img para mostrar la imagen del Donor -->
            <div class="project-chips-container mt-3">
              <label class="subtitle-1 font-weight-bold mt-3">Image:</label>
              <v-img
                v-if="updatedDonor.image"
                :src="updatedDonor.image"
                aspect-ratio="2"
                style=" border-radius: 4px; margin-bottom: 10px;"
                class="mx-auto"
              ></v-img>
            </div>

            <!-- Contenedor para los proyectos del Donor -->
            <div class="project-chips-container mt-3">
              <label class="subtitle-1 font-weight-bold">Projects:</label>
              <div>
                <v-chip-group>
                  <v-chip
                    v-for="(value, index) in updatedDonor.projects"
                    :key="index"
                    class="ma-1"
                    color="primary"
                    dark
                  >
                    {{ value }}
                  </v-chip>
                </v-chip-group>
              </div>
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="justify-center">
            <v-btn @click="closeViewDonorModal" color="primary">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

        
      <!-- Modal for updating a donor -->
      <v-dialog v-model="isUpdateDonorModalActive" >
        <v-card>
          <v-card-title class="cabeceras">
            <span class="headline">Update Donor</span>
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="updatedDonor.rfc" label="Rfc"></v-text-field>
            <v-text-field v-model="updatedDonor.name" label="Name"></v-text-field>
            <v-text-field v-model="updatedDonor.projects" label="Projects"></v-text-field>
            <v-text-field v-model="updatedDonor.image" label="Image"></v-text-field>
            <v-text-field v-model="updatedDonor.qty" label="Qty"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="updateDonor" color="warning">Update</v-btn>
            <v-btn @click="closeUpdateDonorModal">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Modal for confirming donor deletion -->
      <v-dialog v-model="isDeleteDonorConfirmationActive">
        <v-card>
          <v-card-title class="cabeceras">
            <span class="headline">Confirm Delete</span>
          </v-card-title>
          <v-card-text>
            Are you sure you want to delete this donor?
          </v-card-text>
          <v-card-actions>
            <v-btn @click="deleteDonorConfirmed" color="error">Delete</v-btn>
            <v-btn @click="cancelDeleteDoner">Cancel</v-btn>
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
  var newDonor = ref({
    rfc: "",
    name: "",
    projects: "",
    image: "",
    qty: "",
  });
  var updatedDonor = ref({
    rfc: "",
    name: "",
    projects: "",
    image: "",
    qty: "",
  });

  const donors = ref([]);
  const aux = ref([]);
  const isUpdateDonorModalActive = ref(false);
  const isDeleteDonorConfirmationActive = ref(false);
  const isViewDonorModalActive = ref(false);

  const selectedDonor = ref(null);
  const feedbackMessage = ref({
    show: false,
    message: '',
    color: '',
  });
  const isAddDonorModalActive = ref(false);
  var roleOptions = ref(false);
  const userData = ref(store.getters.getUserData);
  const searchTerm = ref("");
  const originalDonors = ref([]); // Mantén una copia original de los usuarios



  const refreshData = async () => {
    try {
      const response = await axios.get(API_URL + "donadores/");
      donors.value = response.data.data;
      aux.value = response.data.data;

      if (Array.isArray(donors.value)) {
          originalDonors.value = [...donors.value];
      } else {
        console.error("Error: donors.value is not an array");
      }

    } catch (error) {
      console.error("Error fetching donors:", error);
    }
  };

  const addNewDonor = async () => {
    // Verificar si el name y email ya existen
    const isDuplicateName = donors.value.some((donor) => donor.name === newDonor.value.name);
    const isDuplicateEmail = donors.value.some((donor) => donor.email === newDonor.value.email);

    if (isDuplicateName || isDuplicateEmail) {
      showFeedbackMessage("El name o email ya existen. Introduce valores únicos.", 'warning');
      return; // No permite agregar usuarios duplicados
    }

    newDonor.value.projects = "None"

    try {
      const response = await axios.post(API_URL + "donadores/", newDonor.value);
      refreshData();
      showFeedbackMessage(response.data.message, 'success');

      newDonor.value = {};
      closeAddDonorModal();
    } catch (error) {
      showFeedbackMessage("Error al intentar añadir un nuevo usuario", 'error');
    }
  };


  const deleteDonorConfirmation = (donor) => {
    selectedDonor.value = donor;
    updatedDonor.value = { ...donor };
    if(userData.value.rol === "Administrador"){
      isDeleteDonorConfirmationActive.value = true;
    }else{
        showFeedbackMessage("No cuentas con los permisos necesarios para realizar esta accion.", 'warning');
    }
  };


  const deleteDonorConfirmed = async () => {
    if (selectedDonor.value !== null) {
      try {
        const response = await axios.delete(API_URL + `donadores/${selectedDonor.value.name}`);
        refreshData();
        showFeedbackMessage(response.data.message, 'success');
      } catch (error) {
        console.error("Error deleting donor:", error);
        showFeedbackMessage("Error al eliminar usuario.", 'error');
      } finally {
        selectedDonor.value = null;
        isDeleteDonorConfirmationActive.value = false;
      }
    }
  };

  const cancelDeleteDoner = () => {
    selectedDonor.value = null;
    isDeleteDonorConfirmationActive.value = false;
  };



  const openUpdateDonorModal = (donor) => {
    selectedDonor.value = donor;
    updatedDonor.value = _.cloneDeep(donor);

    if (userData.value.rol === "Administrador") {
      isUpdateDonorModalActive.value = true;
    } else {
        showFeedbackMessage("No cuentas con los permisos necesarios para realizar esta acción.", 'warning');
    }
  };

  const closeUpdateDonorModal = () => {
    selectedDonor.value = null;
    updatedDonor.value = {};
    isUpdateDonorModalActive.value = false;
  };
 
  const updateDonor = async () => {

    if (Object.values(updatedDonor.value).every(value => !!value)) {

      const isDuplicateName = donors.value.some((donor) => donor.name === updatedDonor.value.name && donor.rfc !== selectedDonor.value.rfc);

      if (isDuplicateName) {
        showFeedbackMessage("El name o email ya existen para otros usuarios. Introduce valores únicos.", 'warning');
        return; // No permite actualizar usuarios con datos duplicados
      }
      try {
        //console.log(selectedDonor.value.name);
        //consolconsole.loge.log(updatedDonor.value);
        const response = await axios.patch(API_URL + `donadores/${selectedDonor.value.name}`, updatedDonor.value);
        refreshData();
        showFeedbackMessage(response.data.message, 'success');
        closeUpdateDonorModal();
      } catch (error) {
        showFeedbackMessage("Error al actualizar informaciion del usuario.", 'error');
      }
    }else{
      showFeedbackMessage("Para actualizar tiene que proporcionar todos los campos", 'warning');
    }
  };


  const openAddDonorModal = () => {
    newDonor = ref({
      name: "",
      rol: "",
      email: "",
      password: "",
    });
    isAddDonorModalActive.value = true;
  };

  const closeAddDonorModal = () => {
    isAddDonorModalActive.value = false;
  };


  const openViewDonorModal = (donee) => {
    selectedDonor.value = donee;
    updatedDonor.value = _.cloneDeep(donee);

    if (userData.value.rol === "Administrador") {
      isViewDonorModalActive.value = true;
    } else {
        showFeedbackMessage("No cuentas con los permisos necesarios para realizar esta acción.", 'warning');
    }
  };


  const closeViewDonorModal = () => {
    isViewDonorModalActive.value = false;
  };



  const filterDonors = () => {
    if (!searchTerm.value) {
      // Si el término de búsqueda está vacío, muestra todos los usuarios
      donors.value = [...originalDonors.value];
    } else {
      // Filtra los usuarios basados en el término de búsqueda
      donors.value = originalDonors.value.filter((donor) => {
        return (
          donor.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          donor.rol.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          donor.email.toLowerCase().includes(searchTerm.value.toLowerCase()) 
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
    originalDonors.value = [...donors.value];
  });

  watch(searchTerm, filterDonors);

  
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

    .project-chips-container {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 10px;
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