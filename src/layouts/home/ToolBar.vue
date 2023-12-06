<template>

    <v-app>
        <!-- Barra de navegación -->
        <v-app-bar app fixed color="#313844">
      <!-- Botón para mostrar/ocultar el panel de herramientas -->
      <v-btn icon @click="toggleDrawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <v-app-bar-title>
        <v-icon icon="mdi-circle-slice-4" class="mr-2"></v-icon>
        PVVC-PROJECT
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn icon @click="showUserInfo">
        <v-icon>mdi-account</v-icon>
        <v-list-item-content v-if="userData.name">
          <v-list-item-title class="ml-2">{{ userData.name }}</v-list-item-title>
        </v-list-item-content>
      </v-btn>

      <v-btn icon @click="logout">
        <v-icon>mdi-logout-variant</v-icon>
      </v-btn>
    </v-app-bar>


    <!-- Panel de herramientas (drawer) -->
    <v-navigation-drawer v-model="drawer" app fixed color="#313844">
      <!-- Lista de enlaces de router -->
      <v-list>
        <v-list-item v-for="(item, index) in menuItems" :key="index" :to="item.to" link>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>


    <!-- Contenido principal -->
    <v-main>
      <!-- Ruta actual renderizada por el router -->
      <v-container fluid>
        <home-view/>
      </v-container>
    </v-main>


    <!-- Diálogo para mostrar la información del usuario -->
    <v-dialog v-model="userInfoDialog" max-width="400">
      <v-card>
        <v-card-title>Información del Usuario</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{ userData.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ userData.rol }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{ userData.email }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="userInfoDialog = false" color="error">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script setup>

  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import store from '../../store/store';
  import HomeView from './HomeView.vue';

  const router = useRouter();
  const drawer = ref(false); // Variable para controlar la visibilidad del panel de herramientas
  const userData = ref(store.getters.getUserData);
  var menuItems = ref(false);

  const userInfoDialog = ref(false);

  const logout = () => {
        // Limpia el store al presionar el botón de salir
    store.dispatch('clearUserData');
    router.push({ name: 'Login' });
    console.log(store.state.user);
  };

  const toggleDrawer = () => {
    drawer.value = !drawer.value; // Cambiar el estado de visibilidad del panel de herramientas
  };

  const showUserInfo = () => {
    userInfoDialog.value = true;
  };


  if(userData.value.rol=== "Administrador"){
    menuItems.value = [
      { text: 'User Manager', to: '/users', icon: 'mdi-home' },
      { text: 'Project Manager', to: '/projects', icon: 'mdi-account' },
      { text: 'Donors Manager', to: '/donors', icon: 'mdi-settings' },
      { text: 'Doness Manager', to: '/doness', icon: 'mdi-settings' },
      // Agrega más elementos de menú según tus necesidades
    ];
  }else if(userData.value.rol === "Tecnico"){
    menuItems.value = [
      { text: 'Project Manager', to: '/projects', icon: 'mdi-account' },
      { text: 'Donors Manager', to: '/donors', icon: 'mdi-settings' },
      { text: 'Doness Manager', to: '/doness', icon: 'mdi-settings' },
    ];
  }

</script>

<style scoped>

  .user-info {
    display: flex;
    align-items: center;
  }

</style>
