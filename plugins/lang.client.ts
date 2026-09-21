/**
 * Plugin client that loads the saved language from localStorage
 * Runs only client-side, after hydration
 */
export default defineNuxtPlugin(() => {
  const locale = useState<string>('locale')
  const saved = localStorage.getItem('qvault-lang') || localStorage.getItem('bitlock-lang')
  if (saved && (saved === 'fr' || saved === 'en')) {
    locale.value = saved
  }
  document.documentElement.lang = locale.value
})
