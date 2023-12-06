<template>
  <v-app>
    <v-container class="container-highlight">
    
      <v-row class="container-highlight mb-3">
        <v-col cols="12">
          <h2 class="page-title">Donee Management</h2>
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
                <th class="centered-header">name</th>
                <th class="centered-header">id_proyect</th>
                <th class="centered-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="donee in donees" :key="donee.name">
                <td>{{ donee.rfc }}</td>
                <td>{{ donee.name }}</td>
                <td>{{ donee.id_proyect }}</td>
                <td class="centered-buttons">
                  <v-btn @click="openViewDoneeModal(donee)" color="primary">View </v-btn>
                  <v-btn 
                    @click="openUpdateDoneeModal(donee)" 
                    color="warning">
                    Update
                  </v-btn>
                  <v-btn 
                    @click="deleteDoneeConfirmation(donee)" 
                    color="error">
                    Delete
                  </v-btn>  
                </td>
              </tr>
            </tbody>
            
          </table>
        </v-col>
      </v-row>


      <!-- Botón "Add donee" alineado a la derecha -->
      <v-row class="text-right">
        <v-col cols="12">
          <v-btn @click="openAddDoneeModal" color="#313844">Add Donee</v-btn>
        </v-col>
      </v-row>
        
      <!-- Modal for adding a new Donee -->
      <v-dialog v-model="isAddDoneeModalActive">
        <v-card>
          <v-card-title class="cabeceras">
            <span class="headline">Add Donee</span>
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="newDonee.rfc" label="Rfc"></v-text-field>
            <v-text-field v-model="newDonee.name" label="Name"></v-text-field>
            <v-text-field v-model="newDonee.image" label="ImageUrl"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="addNewDonee" color="primary">Add</v-btn>
            <v-btn @click="closeAddDoneeModal">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


      <!-- Modal for view a Donee -->
      <v-dialog v-model="isViewDoneeModalActive">
        <v-card>
          <v-card-title class="cabeceras">
            <span class="headline">View Donee</span>
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="updatedDonee.rfc" label="Rfc"></v-text-field>
            <v-text-field v-model="updatedDonee.name" label="Name" disabled></v-text-field>

             <!-- Etiqueta y v-img para mostrar la imagen del Donor -->
             <div class="project-chips-container mt-3">
              <label class="subtitle-1 font-weight-bold mt-3">Image:</label>
              <v-img
                v-if="updatedDonee.image"
                :src="updatedDonee.image"
                aspect-ratio="2"
                style=" border-radius: 4px; margin-bottom: 10px;"
                class="mx-auto"
              ></v-img>
            </div>

          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="justify-center">
            <v-btn @click="closeViewDoneeModal" color="primary">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

        
      <!-- Modal for updating a Donee -->
      <v-dialog v-model="isUpdateDoneeModalActive" >
        <v-card>
          <v-card-title class="cabeceras">
            <span class="headline">Update Donee</span>
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="updatedDonee.rfc" label="Rfc"></v-text-field>
            <v-text-field v-model="updatedDonee.name" label="Name" disabled></v-text-field>
            <v-text-field v-model="updatedDonee.image" label="Image"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="updateDonee" color="warning">Update</v-btn>
            <v-btn @click="closeUpdateDoneeModal">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Modal for confirming Donee deletion -->
      <v-dialog v-model="isDeleteDoneeConfirmationActive">
        <v-card>
          <v-card-title class="cabeceras">
            <span class="headline">Confirm Delete</span>
          </v-card-title>
          <v-card-text>
            Are you sure you want to delete this donee?
          </v-card-text>
          <v-card-actions>
            <v-btn @click="deleteDoneeConfirmed" color="error">Delete</v-btn>
            <v-btn @click="cancelDeleteDonee">Cancel</v-btn>
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

  const isUpdateDoneeModalActive = ref(false);
  const isDeleteDoneeConfirmationActive = ref(false);
  const isViewDoneeModalActive = ref(false);
  const isAddDoneeModalActive = ref(false);
  

  const selectedDonee = ref(null);
  const userData = ref(store.getters.getUserData);
  var roleOptions = ref(false);
  const searchTerm = ref("");
  const originalDonees = ref([]); // Mantén una copia original de los usuarios
  const donees = ref([]);
  const aux = ref([]);
  const doners = ref([]);
  const originalDoners = ref([]);

  var newDonee = ref({
    rfc: "",
    name: "",
    id_proyect: "",
    image: "",
  });
  var updatedDonee = ref({
    rfc: "",
    name: "",
    id_proyect: "",
    image: "",
  });
  const feedbackMessage = ref({
    show: false,
    message: '',
    color: '',
  });

  /*
  const getOptionProjects = async () => {
    try {
      const response = await axios.get(API_URL + "proyectos/");
      roleOptions.value = response.data.data;
      
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
*/

  const refreshData = async () => {
    try {
      const response = await axios.get(API_URL + "donatarios/");
      donees.value = response.data.data;
      aux.value = response.data.data;

      if (Array.isArray(donees.value)) {
        if (userData.value.rol === "Administrador") {
          originalDonees.value = [...donees.value];
        } else {

          originalDonees.value = [...donees.value];
          console.log(donees.value);
        }
      } else {
        console.error("Error: donees.value is not an array");
      }

    } catch (error) {
      console.error("Error fetching donees:", error);
    }
  };

  const addNewDonee = async () => {
    // Verificar si el name y email ya existen
    const isDuplicateName = donees.value.some((donee) => donee.name === newDonee.value.name);
    const isDuplicateRfc = donees.value.some((donee) => donee.rfc === newDonee.value.rfc);

    if (isDuplicateName || isDuplicateRfc) {
      showFeedbackMessage("El name o email ya existen. Introduce valores únicos.", 'warning');
      return; // No permite agregar usuarios duplicados
    }

    newDonee.value.id_proyect = "N/A";

    console.log(newDonee.value)

    try {
      const response = await axios.post(API_URL + "donatarios/", newDonee.value);
      refreshData();
      showFeedbackMessage(response.data.message, 'success');

      newDonee.value = {};
      closeAddDoneeModal();
    } catch (error) {
      showFeedbackMessage("Error al intentar añadir un nuevo usuario", 'error');
    }
  };


  const deleteDoneeConfirmation = (donee) => {
    selectedDonee.value = donee;
    updatedDonee.value = { ...donee };
    if(userData.value.rol === "Administrador"){
      isDeleteDoneeConfirmationActive.value = true;
    }else{
        showFeedbackMessage("No cuentas con los permisos necesarios para realizar esta accion.", 'warning');
    }
  };


  const deleteDoneeProject = async () => {
    if (selectedDonee.value !== null) {
      try {
        const response = await axios.delete(API_URL + `proyectos/${selectedDonee.value.id_proyect}`);
        refreshData();
        showFeedbackMessage(response.data.message, 'success');
      } catch (error) {
        console.error("Error deleting donee:", error);
        showFeedbackMessage("Error al eliminar usuario.", 'error');
      } finally {
        selectedDonee.value = null;
        isDeleteDoneeConfirmationActive.value = false;
      }
    }
  }

  const getDonersProject = async () => {
    try {
      const response = await axios.get(API_URL + "donadores/");
      doners.value = response.data.data;
      originalDoners.value = [...doners.value];

      // Filter doners based on the project attribute
      doners.value = doners.value.filter(doner => {
        return doner.project === selectedDonee.value.project;
      });
      console.log(doners);

    } catch (error) {
      console.error("Error fetching doners:", error);
    }
  }


  const deleteDonersProject = async () => {
    getDonersProject();
    if (doners.value !== null) {
      try {
        doners.value.forEach(doner => {
          const indexToDelete = doner.projects.indexOf(selectedDonee.value.project);

          if (indexToDelete !== -1) {
            // Elimina el proyecto si está presente
            doner.projects.splice(indexToDelete, 1);
          }

          // Si el array de proyectos está vacío, agrega 'none'
          if (doner.projects.length === 0) {
            doner.projects.push('None');
          }
        });

        for (const doner of doners.value) {
          const response = await axios.patch(API_URL + `donadores/${doner.name}`, {
          });
          console.log(response.data);
        } 
        refreshData();
      } catch (error) {
        console.error("Error deleting donee:", error);
        showFeedbackMessage("Error al eliminar usuario.", 'error');
      } finally {
        isDeleteDoneeConfirmationActive.value = false;
      }
    }
  }



  const deleteDoneeConfirmed = async () => {
    if (selectedDonee.value !== null) {
      try {
        const response = await axios.delete(API_URL + `donatarios/${selectedDonee.value.name}`);
        refreshData();
        showFeedbackMessage(response.data.message, 'success');
      } catch (error) {
        console.error("Error deleting donee:", error);
        showFeedbackMessage("Error al eliminar usuario.", 'error');
      } finally {
        isDeleteDoneeConfirmationActive.value = false;
      }
    }
    deleteDoneeProject();
    deleteDonersProject();
    selectedDonee.value = null;
  };

  const cancelDeleteDonee = () => {
    selectedDonee.value = null;
    isDeleteDoneeConfirmationActive.value = false;
  };



  const openUpdateDoneeModal = (donee) => {
    selectedDonee.value = donee;
    updatedDonee.value = _.cloneDeep(donee);

    if (userData.value.rol === "Administrador") {
      isUpdateDoneeModalActive.value = true;
    } else {
        showFeedbackMessage("No cuentas con los permisos necesarios para realizar esta acción.", 'warning');
    }
  };

  const closeUpdateDoneeModal = () => {
    selectedDonee.value = null;
    updatedDonee.value = {};
    isUpdateDoneeModalActive.value = false;
  };

  const updateDonee = async () => {

    if (Object.values(updatedDonee.value).every(value => !!value)) {

      const isDuplicateName = donees.value.some((donee) => donee.name === updatedDonee.value.name && donee.rfc !== selectedDonee.value.rfc);

      if (isDuplicateName ) {
        showFeedbackMessage("El name o email ya existen para otros usuarios. Introduce valores únicos.", 'warning');
        return; // No permite actualizar usuarios con datos duplicados
      }
      try {
        //console.log(selectedDonee.value.name);
        //consolconsole.loge.log(updatedDonee.value);
        const response = await axios.patch(API_URL + `donatarios/${selectedDonee.value.name}`, updatedDonee.value);
        refreshData();
        showFeedbackMessage(response.data.message, 'success');
        closeUpdateDoneeModal();
      } catch (error) {
        showFeedbackMessage("Error al actualizar informaciion del usuario.", 'error');
      }
    }else{
      showFeedbackMessage("Para actualizar tiene que proporcionar todos los campos", 'warning');
    }
  };


  const openAddDoneeModal = () => {
    newDonee = ref({
      rfc: "",
      name: "",
      id_proyect: "",
      image: "",
    });
    isAddDoneeModalActive.value = true;
  };

  const closeAddDoneeModal = () => {
    isAddDoneeModalActive.value = false;
  };


  const openViewDoneeModal = (donee) => {
    selectedDonee.value = donee;
    updatedDonee.value = _.cloneDeep(donee);

    if (userData.value.rol === "Administrador") {
      isViewDoneeModalActive.value = true;
    } else {
        showFeedbackMessage("No cuentas con los permisos necesarios para realizar esta acción.", 'warning');
    }
  };


  const closeViewDoneeModal = () => {
    isViewDoneeModalActive.value = false;
  };


  const filterDonees = () => {
    if (!searchTerm.value) {
      // Si el término de búsqueda está vacío, muestra todos los usuarios
      donees.value = [...originalDonees.value];
    } else {
      // Filtra los usuarios basados en el término de búsqueda
      donees.value = originalDonees.value.filter((donee) => {
        return (
          donee.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          donee.rol.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          donee.email.toLowerCase().includes(searchTerm.value.toLowerCase()) 
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
    originalDonees.value = [...donees.value];
  });

  watch(searchTerm, filterDonees);

  
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