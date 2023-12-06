  <template>
    <v-container class="login-container">
      <v-form ref="form" @submit="login" class="login-form">
        <v-text-field v-model="email" label="Email" outlined dense required></v-text-field>
        <v-text-field v-model="password" label="Password" outlined dense required type="password"></v-text-field>
        <v-btn type="submit" color="#313844" block>Login</v-btn>
      </v-form>

      <!-- Feedback message -->
      <v-snackbar v-model="feedbackMessage.show" :timeout="3000" :color="feedbackMessage.color">
        {{ feedbackMessage.message }}
      </v-snackbar>

    </v-container>
  </template>

  <script setup>
  
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import axios from 'axios';
    import store from '../store/store';

    const email = ref('');
    const password = ref('');
    const feedbackMessage = ref({
      show: false,
      message: '',
      color: '',
    });
    const router = useRouter();
    const API_URL = "http://localhost:5038/api/1.0/";

    const login = async (event) => {
      event.preventDefault();

      try {
        // Hacer una solicitud al backend utilizando Axios
        const response = await axios.post(API_URL + 'users/authenticate', {
          email: email.value,
          password: password.value,
        });

        if (response.status === 200) {
          const userData = response.data.user;
          store.dispatch('updateUserData', userData);
          // Muestra mensaje de éxito
          showFeedbackMessage('¡Inicio de sesión exitoso!', 'success');
          const routeName = 'Home';
          console.log("Redirigiendo a:", routeName);
          navigateTo(routeName);  
        } else {
          // Muestra mensaje de error
          showFeedbackMessage(response.data.message, 'error');
        }
      } catch (error) {
        // Muestra mensaje de error de red u otros errores
        showFeedbackMessage('Usuario o contraseña no validas', 'error');
        console.error('Error durante la autenticación:', error);
      }
    };

    const navigateTo = (routeName) => {
      router.push({ name: routeName });
    };

    const showFeedbackMessage = (message, type) => {
      feedbackMessage.value.message = message;
      feedbackMessage.value.color = type;
      feedbackMessage.value.show = true;
    };

  </script>

  <style scoped>
  
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 85vh;
    background-color: #FFFF; /* Agrega esta línea para establecer el color de fondo */
  }
  
  .login-form {
    max-width: 400px;
    width: 100%;
    padding: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #FFFF; /* Agrega esta línea para establecer el color de fondo */

  }

  /* Agrega más estilos según tus preferencias */
  </style>
