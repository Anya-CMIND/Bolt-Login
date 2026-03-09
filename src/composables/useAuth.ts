import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const loading = ref(true)

export function useAuth() {
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const initAuth = () => {
    supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        user.value = session?.user ?? null
        loading.value = false
      })()
    })
  }

  onMounted(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    loading.value = false
  })

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    initAuth,
  }
}
