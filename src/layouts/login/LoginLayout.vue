<template>
  <v-app>
    <v-container fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6">
          <login-view />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
  import LoginView from './LoginView.vue';
</script>
