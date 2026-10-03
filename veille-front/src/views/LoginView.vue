<script setup lang="ts">
import { SignIn } from '@primeicons/vue'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import InputPassword from 'primevue/inputpassword'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/api/http'
import type { Role } from '@/api/types'
import AuthCard from '@/components/AuthCard.vue'
import { ROLES } from '@/constants'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

/** Comptes présents dans veille-back/kanban.sqlite (données de démo). */
const demoAccounts: Role[] = ['ADMIN', 'PO', 'DEV', 'MOA', 'MOE']

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/board'
    await router.push(redirect)
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Serveur injoignable'
  } finally {
    submitting.value = false
  }
}

function fillDemo(role: Role) {
  email.value = `${role.toLowerCase()}@kanban.dev`
  password.value = 'password123'
  submit()
}
</script>

<template>
  <AuthCard title="Connexion" subtitle="Accédez au tableau de l'équipe">
    <form @submit.prevent="submit">
      <Message v-if="error" severity="error">{{ error }}</Message>
      <div class="field">
        <label for="email">Email</label>
        <InputText id="email" v-model="email" type="email" autocomplete="email" required fluid />
      </div>
      <div class="field">
        <label for="password">Mot de passe</label>
        <InputPassword
          id="password"
          v-model="password"
          autocomplete="current-password"
          required
          fluid
        />
      </div>
      <Button type="submit" :disabled="submitting">
        <SignIn :size="16" />
        Se connecter
      </Button>
    </form>

    <Divider align="center"><span class="muted">Comptes de démo</span></Divider>
    <div class="demo">
      <Button
        v-for="role in demoAccounts"
        :key="role"
        size="small"
        :severity="ROLES[role].severity"
        variant="outlined"
        :disabled="submitting"
        @click="fillDemo(role)"
      >
        {{ ROLES[role].label }}
      </Button>
    </div>

    <template #footer>
      <p class="muted">
        Pas encore de compte ? <RouterLink to="/register">Créer un compte</RouterLink>
      </p>
    </template>
  </AuthCard>
</template>

<style scoped>
.demo {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}
</style>
