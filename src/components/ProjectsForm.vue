<template>
  <v-app>
    <v-container class="container-highlight">
      
      <v-row class="container-highlight mb-3">
        <v-col cols="12">
          <h2 class="page-title"> Projects Management</h2>
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
                <th class="centered-header">Description</th>
                <th class="centered-header">Donee</th>
                <th class="centered-header">Donors</th>
                <th class="centered-header">Qty</th>
                <th class="centered-header">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="project in projects" :key="project.name">
                <td>{{ project.name }}</td>
                <td>{{ project.description }}</td>
                <td>{{ project.donee }}</td>
                <td>
                  <v-chip-group>
                    <v-chip
                      v-for="(value, index) in project.doners"
                      :key="index"
                      class="ma-1"
                      color="primary"
                      dark
                    >
                      {{ value }}
                    </v-chip>
                  </v-chip-group>
                </td>   
                <td>{{ project.qty }}</td>
                <td class="centered-buttons">
                  <v-btn @click="openViewProjectModal(project)" color="primary">View </v-btn>
                  <v-btn @click="openDonateProjectModal(project)" color="succes"> DONATE </v-btn>
                  <v-btn @click="openUpdateProjectModal(project)" color="warning">Update</v-btn>
                  <v-btn @click="deleteProjectConfirmation(project)" color="error">Delete</v-btn>
                </td>
              </tr>
            </tbody>
          </table>
        </v-col>
      </v-row>

      <!-- Button "Add Instrument" aligned to the right -->
      <v-row class="text-right">
        <v-col cols="12">
          <v-btn @click="openAddProjectModal" color="#313844">Add Instrument</v-btn>
        </v-col>
      </v-row>

      <!-- Modal for adding a new instrument -->
      <v-dialog v-model="isAddProjectModalActive" fullscreen flex-wrap>
        <v-card>
          <v-card-title>
            <span class="headline">Add Project</span>
          </v-card-title>
          <v-card-text class="overflow-y-auto">
            <!-- Campos de texto para el nuevo instrumento -->
            <v-text-field v-model="newProject.name" label="Name"></v-text-field>
            <v-text-field v-model="newProject.description" label="Description"></v-text-field>
            <v-text-field v-model="newProject.image" label="imageUrl"></v-text-field>
            <v-select
              v-model="newProject.donee"
              :items="donees"
              label="Donee"
            ></v-select>
            <v-text-field v-model="newProject.qty" label="Qty" type="number"></v-text-field>
          </v-card-text>
          <!-- Botones de acción -->
          <v-card-actions>
            <v-btn @click="addNewProject" color="primary">Add</v-btn>
            <v-btn @click="closeAddProjectModal">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Modal for view a Project -->
      <v-dialog v-model="isViewProjectModalActive">
        <v-card>
          <v-card-title class="cabeceras">
            <span class="headline">View Project</span>
          </v-card-title>
          <v-card-text>
            <v-text-field v-model="updatedProject.name" label="Name" disabled></v-text-field>
            <v-text-field v-model="updatedProject.description" label="Description" disabled></v-text-field>

             <!-- Etiqueta y v-img para mostrar la imagen del Donor -->
             <div class="project-chips-container mt-3">
              <label class="subtitle-1 font-weight-bold mt-3">Image:</label>
              <v-img
                v-if="updatedProject.image"
                :src="updatedProject.image"
                aspect-ratio="2"
                style=" border-radius: 4px; margin-bottom: 10px;"
                class="mx-auto"
              ></v-img>
            </div>

          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="justify-center">
            <v-btn @click="closeViewProjectModal" color="primary">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>



      <!-- Modal for donate a Project -->
      <v-dialog v-model="isDonateProjectModalActive">
        <v-card>
          <v-card-title class="cabeceras">
            <span class="headline">Donate to project</span>
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="auxDonors"
              :items="donors"
              label="Doner"
            ></v-select>
            <v-text-field v-model="auxQty" label="donation Qty" type="number"></v-text-field>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="justify-center">
            <v-btn @click="getDoner" color="primary">Donate</v-btn>
            <v-btn @click="closeDonateProjectModal" color="primary">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


      <!-- Modal for update instrument -->
      <v-dialog v-model="isUpdateProjectModalActive" fullscreen flex-wrap>
        <v-card>
          
          <v-card-title>
            <span class="headline">Update Project</span>
          </v-card-title>

          <v-card-text class="overflow-y-auto">
            <!-- Text fields for updating the instrument -->
            <v-text-field v-model="updatedProject.description" label="Description"></v-text-field>
            <v-text-field v-model="updatedProject.image" label="ImageUrl"></v-text-field>
          </v-card-text>
          <!-- Action buttons -->
          <v-card-actions>
            <v-btn @click="updateProject" color="warning">UPDATE</v-btn>
            <v-btn @click="closeUpdateProjectModal">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Modal for confirming instrument deletion -->
      <v-dialog v-model="isDeleteProjectConfirmationActive">
        <v-card>
          <v-card-title>
            <span class="headline">Confirm Delete</span>
          </v-card-title>
          <v-card-text>
            Are you sure you want to delete this project?
          </v-card-text>
          <v-card-actions>
            <v-btn @click="deleteProjectConfirmed" color="error">Delete</v-btn>
            <v-btn @click="cancelDeleteProject">Cancel</v-btn>
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
  // Importaciones
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { watch } from 'vue';
  import store from '../store/store';
  import _ from 'lodash';
  // Variables
  const API_URL = "http://localhost:5038/api/1.0/";
  const userData = ref(store.getters.getUserData);
  const projects = ref([]);
  const donees = ref([]);
  const originalDonors= ref([]);
  const originalProjects = ref([]);
  const selectedProject = ref(null);
  let auxDonors = ref([]);
  let auxQty = ref([]);
  let adoner = ref([]);

  const isDonateProjectModalActive = ref(false);
  const isUpdateProjectModalActive = ref(false);
  const isDeleteProjectConfirmationActive = ref(false);
  const isViewProjectModalActive = ref(false);
  const isAddProjectModalActive = ref(false);

  const donors = ref({

  });

  const feedbackMessage = ref({
    show: false,
    message: '',
    color: '',
  });  
  const searchTerm = ref("");

  let newProject = ref({
    name: "",
    description : "",
    image: "",
    donee: "",
    doners: [],
    qty: 0,
  });
  let updatedProject = ref({
    name: "",
    description : "",
    image: "",
    donee: "",
    doners: [],
    qty: 0,
  });

  /** Métodos relacionados con Agregar Instrumento **/

  const addNewProject= async () => {
    try {
      newProject.value.doners.push('None');
      //console.log("dsad")
      //console.log(newProject.value)
      const response = await axios.post(API_URL + "proyectos/", newProject.value);
      await updateDataDonee(newProject.value);
      refreshData();
      showFeedbackMessage(response.data.message, 'success');
      newProject.value = {};
      closeAddProjectModal();
    } catch (error) {
      console.error("Error adding instrument:", error);
      if (error.response) {
        showFeedbackMessage(error.response.data.message || "Error al actualizar instrumento" , 'error');
      } else {
        showFeedbackMessage("Error al actualizar instrumento" , 'error');

      }
    }
  };

  const openAddProjectModal = async () => {
    await getDonees(); // Espera a que getDonees termine
    //console.log(donees.value);
    
    if (donees.value.length > 0) {
      newProject.value = {
        name: "",
        description: "",
        image: "",
        donee: "",
        doners: [],
        qty: 0,
      };
      isAddProjectModalActive.value = true;
    } else {
      showFeedbackMessage("No se encuentran donatarios libres por asignar.", 'warning');
    }
  };

  const closeAddProjectModal = () => {
    isAddProjectModalActive.value = false;
  };

  /***  Métodos relacionados con Actualizar Instrumento  ***/

  // Método para abrir el modal de actualizar instrumento
  const openUpdateProjectModal = (project) => {
    refreshData();
    selectedProject.value = project;
    updatedProject.value = { ...project };
    isUpdateProjectModalActive.value = true;
    //console.log(updatedProject.value);
  };

  // Método para cerrar el modal de actualizar instrumento
  const closeUpdateProjectModal = () => {
    selectedProject.value = null;
    updatedProject.value = {};
    isUpdateProjectModalActive.value = false;
  };


  // Método para actualizar un instrumento
  const updateProject = async () => {
    try {
      const response = await axios.patch(API_URL + `proyectos/${selectedProject.value.name}`, updatedProject.value);
      refreshData();
      showFeedbackMessage(response.data.message, 'success');
      closeUpdateProjectModal();
    } catch (error) {
      console.error("Error updating instrument:", error);
      showFeedbackMessage("Error updating instrument.", 'error');
    }
  };



  /***  Métodos relacionados con Eliminar Instrumento   ***/

  const cancelDeleteProject = () => {
    selectedProject.value = null;
    isDeleteProjectConfirmationActive.value = false;
  };

  const deleteProjectConfirmation = (project) => {
    selectedProject.value = project;
    isDeleteProjectConfirmationActive.value = true;
  };

  const deleteProjectFromDonee = async () => {
    if (selectedProject.value !== null) {
      const updatedData = {
        id_proyect: "N/A",
      };
      //console.log(selectedProject.value);
      try {
        const response = await axios.patch(API_URL + `donatarios/${selectedProject.value.donee}`, updatedData);
        refreshData();
        showFeedbackMessage(response.data.message, 'success');
      } catch (error) {
        showFeedbackMessage("Error deleting instrument.", 'warning');
      } finally {
        selectedProject.value = null;
        isDeleteProjectConfirmationActive.value = false;
      }
    }    
  }
/*
  const getDeleteDoners = async () => {
    const doners_borrar = selectedProject.value.doners;
    const name_proyect = selectedProject.value.name;

    console.log(doners_borrar)
    console.log(name_proyect);

    for (const doner of doners_borrar) {
      try {
        const response = await axios.get(API_URL + `donadores/${doner.name}`);
        let donador = response.data.data;

        donador.projects = donador.projects.filter(elemento => elemento !== name_proyect);

        await axios.patch(API_URL + `donadores/${donador.name}`, donador);

      } catch (error) {
        showFeedbackMessage("Error deleting doner.", 'warning');
      }
    }
  }
*/

  const deleteProjectConfirmed = async () => {
    if (selectedProject.value !== null) {
      try {
        const response = await axios.delete(API_URL + `proyectos/${selectedProject.value.name}`);
        refreshData();
        showFeedbackMessage(response.data.message, 'success');
      } catch (error) {
        showFeedbackMessage("Error deleting instrument.", 'warning');
      } finally {
        isDeleteProjectConfirmationActive.value = false;
      }
      await deleteProjectFromDonee();
      selectedProject.value = null;
    }
  };


  const getDoners = async () => {
  if (selectedProject.value !== null) {
    try {
      const response = await axios.get(API_URL + "donadores/");
      donors.value = response.data.data;

      if (Array.isArray(donors.value)) {
        originalDonors.value = [...donors.value];

        // Filtra los donantes que no tienen el valor en 'projects' y mapea solo el atributo 'name'
        donors.value = donors.value
          .filter(donor => !donor.projects.includes(selectedProject.value.name))
          .map(donor => donor.name);

        //console.log(donors.value);
      } else {
        console.error("Error: donors.value is not an array");
      }
    } catch (error) {
      console.error("Error fetching donors:", error);
    }
  }
};


  const getDoner = async () => {
    try {
      //console.log(auxDonors.value)
      const r = await axios.get(API_URL + `donadores/${auxDonors.value}`);
      adoner = r.data.data
      doDonateToProject(adoner);
    } catch (error) {
      console.error("Error fetching donors:", error);
    }
  };
  

  const doDonateToProject = async (adoner) => {
    // Elimina 'None' si está presente
    updatedProject.value.doners = updatedProject.value.doners.filter(elemento => elemento !== 'None');
    adoner.projects = adoner.projects.filter(elemento => elemento !== 'None');
    // Agrega los nuevos donantes
    updatedProject.value.doners.push(auxDonors.value);
    updatedProject.value.qty += parseInt(auxQty.value, 10);
    adoner.qty -= parseInt(auxQty.value, 10);
    adoner.projects.push(updatedProject.value.name)
    await updateDonateProject(updatedProject.value);
    await updateDonateDoner(adoner);
    refreshData();
    closeDonateProjectModal();
  };

  const updateDonateDoner = async (adoner) => {
      try {
        ///console.log(adoner);
        //console.log(auxDonors.value);

        await axios.patch(API_URL + `donadores/${auxDonors.value}`, adoner);
        
        //console.log(response.data.message, 'success');
      } catch (error) {
        console.error("Error fetching doner:", error.response.data);
      }
  }



  const updateDonateProject = async (proyect) =>{
    try {
      const response = await axios.patch(API_URL + `proyectos/${proyect.name}`, proyect);
      showFeedbackMessage(response.data.message, 'success');   
    } catch (error) {
      console.error("Error fetching proj:", error);
    }
  }


  /***  Métodos de Utilidad   ***/

  const refreshData = async () => {
    try {
      const response = await axios.get(API_URL + "proyectos/");
      projects.value = response.data.data;
      originalProjects.value = [...projects.value];
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };


  const getDonees = async () => {
    try {
      const response = await axios.get(API_URL + "donatarios/");
      // Filtrar donatarios con id_proyecto igual a 'N/A'
      const filteredDonees = response.data.data
        .filter(donee => donee.id_proyect === 'N/A')
        .map(donee => donee.name);
      donees.value = filteredDonees;
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };


  const updateDataDonee = async (proyect) => {
    try {
      const updatedData = {
        id_proyect: proyect.name
      };
      const response = await axios.patch(API_URL + `donatarios/${proyect.donee}`, updatedData);
      showFeedbackMessage(response.data.message, 'success');   
    } catch (error) {
      console.error("Error fetching proj:", error);
    }
  }

  const openViewProjectModal = (project) => {
    selectedProject.value = project;
    updatedProject.value = _.cloneDeep(project);

    if (userData.value.rol === "Administrador") {
      isViewProjectModalActive.value = true;
    } else {
        showFeedbackMessage("No cuentas con los permisos necesarios para realizar esta acción.", 'warning');
    }
  };


  const closeViewProjectModal = () => {
    isViewProjectModalActive.value = false;
  };


  const openDonateProjectModal = async (project) => {
    auxDonors = ref([]);
    auxQty = ref([]);
    adoner = ref([]);
    selectedProject.value = project;
    updatedProject.value = _.cloneDeep(project);
    await getDoners();
    if(donors.value.length>0){
      if (userData.value.rol === "Administrador") {
        isDonateProjectModalActive.value = true;
      } else {
          showFeedbackMessage("No cuentas con los permisos necesarios para realizar esta acción.", 'warning');
      }
    }else{
      showFeedbackMessage("Ya todos los donadores ya han donado en este proyecto.", 'warning');
    }
  };


  const closeDonateProjectModal = () => {
    isDonateProjectModalActive.value = false;
  };



  const filterProjects = () => {
    if (!searchTerm.value) {
      projects.value = [...originalProjects.value];
    } else {
      projects.value = originalProjects.value.filter((instrument) => {
        return (
          instrument.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          instrument.acronimo.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          instrument.categoria.toLowerCase().includes(searchTerm.value.toLowerCase())
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
    originalProjects.value = [...projects.value];
  });

  watch(searchTerm, filterProjects);


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
    max-width: 1000px; /* Ajusta según sea necesario */
    width: 100%;
    margin: 0 auto;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }

  .modal {
    max-width: 1000px; /* Ajusta según tus necesidades */
    width: 100%;
    height: auto; /* Ajusta según tus necesidades */ 
  }

  .v-card-title {
    background-color: #313844; /* Color de fondo del encabezado */
    color: #fff; /* Color del texto del encabezado */
    padding: 16px;
    border-top-left-radius: 0px; /* Esquina superior izquierda redondeada */
    border-top-right-radius: 0px; /* Esquina superior derecha redondeada */
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

  /* Estilo para las columnas de las cards */
  .card-column {
    flex: 0 0 calc(33.33% - 1rem); /* Ancho de 33.33% para cada columna, menos el espacio entre ellas */
    max-width: calc(33.33% - 1rem);
  }

  /* Estilo para el contenedor de las cards */
  .card-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around; /* Ajusta según tus necesidades */
    gap: 1rem; /* Espacio entre las cards */
    padding: 1rem; /* Espaciado interior para separar las cards del borde */
    background-color: #f8f8f8; /* Color de fondo */
    border: 1px solid #e0e0e0; /* Borde del contenedor */
    border-radius: 8px; /* Esquinas redondeadas del contenedor */
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); /* Sombra */

    /* Establecer un tamaño mínimo para el contenedor */
    min-width: 100%; /* Esto asegura que el contenedor sea al menos del 100% del ancho del padre */
  }

  /* Estilo para las columnas de las cards */
  .card-column {
    flex: 0 0 calc(25% - 1rem); /* Ancho de 25% para cada columna, menos el espacio entre ellas */
    max-width: calc(25% - 1rem);
  }

  /* Estilo para la sección de la imagen de la Card */
  .card-image {
    overflow: hidden;
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
  }

  .card-img-top {
    max-width: 100%;
    height: auto;
  }

  /* Estilo para la sección de la información de la Card */
  .card-info {
    padding: 1rem;
    color: #ffff;
    background-color: #313844;
  }

  /* Estilo para las cards */
  /* Animación de entrada y salida para las cards */
  .card-fade-enter-active, .card-fade-leave-active {
    transition: opacity 0.5s, transform 0.5s;
  }

  .card-fade-enter, .card-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }

  /* Estilo para las cards */
  .card {
    width: 100%;
    border: 5px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
    background-color: #313844;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.2);
  }

  .card img {
    max-width: 100%;
    height: auto;
  }

  /* Estilos para el formulario */
  .form {
    max-width: 500px;
    margin: auto;
    border-radius: 8px;
  }

  /* Estilos para las etiquetas de los campos */
  .form-label {
    font-weight: bold;
    margin-bottom: 6px;
    display: block;
  }

  /* Estilos para los campos de entrada */
  .form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 16px;
  }


  .card-container {
  display: flex;
  flex-wrap: wrap;
}

.card-column {
  flex: 1 0 300px; /* Ajusta según tus necesidades */
}

.image-container {
  position: relative;
}

.image-wrapper {
  position: relative;
}

.image {
  width: 100%;
  height: auto;
}

.eliminarImagen {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
}

.change-icon,
.remove-icon {
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  padding: 4px;
  margin-bottom: 4px; /* Ajusta según tus necesidades */
}

.change-icon:hover,
.remove-icon:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

.project-chips-container {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 10px;
}

</style>