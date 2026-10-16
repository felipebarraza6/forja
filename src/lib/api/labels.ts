/**
 * Etiquetas en español para enums de la API (valores canónicos en inglés).
 * Fuente: api/apps/forja/models/core.py (yggdra_infra).
 */
import type {
  AdherenceMetric,
  MealType,
  ServiceBillingPeriod,
  StudentStatus,
  SubscriptionStatus,
} from './types'

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  invited: 'Invitado',
  active: 'Activo',
  paused: 'Pausado',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
}

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Activa',
  past_due: 'Vencida',
  cancelled: 'Cancelada',
  trial: 'Prueba',
}

export const BILLING_PERIOD_LABELS: Record<ServiceBillingPeriod, string> = {
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  yearly: 'Anual',
  one_time: 'Único',
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
  other: 'Otro',
}

export const ADHERENCE_METRIC_LABELS: Record<AdherenceMetric, string> = {
  training: 'Entrenos',
  water: 'Agua',
  macros: 'Macros / comidas',
  check_in: 'Check-ins',
}

export function studentStatusLabel(status: StudentStatus | string): string {
  return STUDENT_STATUS_LABELS[status as StudentStatus] ?? status
}

export function subscriptionStatusLabel(status: SubscriptionStatus | string): string {
  return SUBSCRIPTION_STATUS_LABELS[status as SubscriptionStatus] ?? status
}

export function billingPeriodLabel(period: ServiceBillingPeriod | string): string {
  return BILLING_PERIOD_LABELS[period as ServiceBillingPeriod] ?? period
}

export function mealTypeLabel(meal: MealType | string): string {
  return MEAL_TYPE_LABELS[meal as MealType] ?? meal
}

export function adherenceMetricLabel(metric: AdherenceMetric | string): string {
  return ADHERENCE_METRIC_LABELS[metric as AdherenceMetric] ?? metric
}

/** Variante de badge según status de alumno. */
export function studentStatusBadgeVariant(
  status: StudentStatus,
): 'success' | 'warn' | 'secondary' | 'outline' {
  switch (status) {
    case 'active':
      return 'success'
    case 'paused':
    case 'invited':
      return 'warn'
    case 'finished':
      return 'secondary'
    case 'cancelled':
      return 'outline'
    default:
      return 'outline'
  }
}

export function subscriptionStatusBadgeVariant(
  status: SubscriptionStatus,
): 'success' | 'warn' | 'secondary' {
  switch (status) {
    case 'active':
    case 'trial':
      return 'success'
    case 'past_due':
      return 'warn'
    case 'cancelled':
      return 'secondary'
    default:
      return 'secondary'
  }
}
