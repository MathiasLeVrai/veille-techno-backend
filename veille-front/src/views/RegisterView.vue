<script setup lang="ts">
import { UserPlus } from '@primeicons/vue'
import Button from 'primevue/button'
import InputPassword from 'primevue/inputpassword'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError } from '@/api/http'
import AuthCard from '@/components/AuthCard.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

const passwordTooShort = computed(() => password.value.length > 0 && password.value.length < 6)

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await auth.register(name.value, email.value, password.value)
    await router.push('/board')
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Serveur injoignable'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthCard
    title="Créer un compte"
    subtitle="Vous serez Développeur par défaut ; un admin peut changer votre rôle."
  >
    <form @submit.prevent="submit">
      <Message v-if="error" severity="error">{{ error }}</Message>
      <div class="field">
        <label for="name">Nom</label>
        <InputText id="name" v-model="name" autocomplete="name" required fluid />
      </div>
      <div class="field">
        <label for="email">Email</label>
        <InputText id="email" v-model="email" type="email" autocomplete="email" required fluid />
      </div>
      <div class="field">
        <label for="password">Mot de passe</label>
        <InputPassword
          id="password"
          v-model="password"
          autocomplete="new-password"
          :invalid="passwordTooShort"
          required
          fluid
        />
        <small v-if="passwordTooShort" class="error">6 caractères minimum</small>
      </div>
      <Button type="submit" :disabled="submitting || passwordTooShort">
        <UserPlus :size="16" />
        Créer mon compte
      </Button>
    </form>

    <template #footer>
      <p class="muted">Déjà inscrit ? <RouterLink to="/login">Se connecter</RouterLink></p>
    </template>
  </AuthCard>
</template>

<style scoped>
.error {
  color: var(--p-red-500);
}
</style>
