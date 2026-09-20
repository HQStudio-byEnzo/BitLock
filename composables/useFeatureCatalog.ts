import { useLang } from '~/composables/useI18n'

export type FeatureSlug = 'links' | 'passwords' | 'crypto' | 'encryption' | 'favorites' | 'recovery'

export interface FeatureEntry {
  slug: FeatureSlug
  title: string
  summary: string
  icon: string
  accent: string
  badgeClass: string
  iconClass: string
  points: string[]
}

export function useFeatureCatalog() {
  const { t } = useLang()

  const features = computed<FeatureEntry[]>(() => [
    {
      slug: 'links',
      title: t('featuresCatalog.links.title'),
      summary: t('featuresCatalog.links.summary'),
      icon: 'hugeicons:link',
      accent: 'blue',
      badgeClass: 'bg-blue-500/10',
      iconClass: 'text-blue-400',
      points: [
        t('featuresCatalog.links.point1'),
        t('featuresCatalog.links.point2'),
        t('featuresCatalog.links.point3'),
      ],
    },
    {
      slug: 'passwords',
      title: t('featuresCatalog.passwords.title'),
      summary: t('featuresCatalog.passwords.summary'),
      icon: 'hugeicons:key-round',
      accent: 'amber',
      badgeClass: 'bg-amber-500/10',
      iconClass: 'text-amber-400',
      points: [
        t('featuresCatalog.passwords.point1'),
        t('featuresCatalog.passwords.point2'),
        t('featuresCatalog.passwords.point3'),
      ],
    },
    {
      slug: 'crypto',
      title: t('featuresCatalog.crypto.title'),
      summary: t('featuresCatalog.crypto.summary'),
      icon: 'hugeicons:bitcoin',
      accent: 'orange',
      badgeClass: 'bg-orange-500/10',
      iconClass: 'text-orange-400',
      points: [
        t('featuresCatalog.crypto.point1'),
        t('featuresCatalog.crypto.point2'),
        t('featuresCatalog.crypto.point3'),
      ],
    },
    {
      slug: 'encryption',
      title: t('featuresCatalog.encryption.title'),
      summary: t('featuresCatalog.encryption.summary'),
      icon: 'hugeicons:lock',
      accent: 'emerald',
      badgeClass: 'bg-emerald-500/10',
      iconClass: 'text-emerald-400',
      points: [
        t('featuresCatalog.encryption.point1'),
        t('featuresCatalog.encryption.point2'),
        t('featuresCatalog.encryption.point3'),
      ],
    },
    {
      slug: 'favorites',
      title: t('featuresCatalog.favorites.title'),
      summary: t('featuresCatalog.favorites.summary'),
      icon: 'hugeicons:star',
      accent: 'purple',
      badgeClass: 'bg-purple-500/10',
      iconClass: 'text-purple-400',
      points: [
        t('featuresCatalog.favorites.point1'),
        t('featuresCatalog.favorites.point2'),
        t('featuresCatalog.favorites.point3'),
      ],
    },
    {
      slug: 'recovery',
      title: t('featuresCatalog.recovery.title'),
      summary: t('featuresCatalog.recovery.summary'),
      icon: 'hugeicons:ticket-check',
      accent: 'rose',
      badgeClass: 'bg-rose-500/10',
      iconClass: 'text-rose-400',
      points: [
        t('featuresCatalog.recovery.point1'),
        t('featuresCatalog.recovery.point2'),
        t('featuresCatalog.recovery.point3'),
      ],
    },
  ])

  function getFeature(slug: string) {
    return features.value.find(feature => feature.slug === slug)
  }

  return {
    features,
    getFeature,
  }
}
