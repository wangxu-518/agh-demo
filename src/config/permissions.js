export const pagePermissions = {
  patient: {
    home: 'view_own_case',
    records: 'view_own_case',
    plan: 'view_own_case',
    travel: 'view_own_case',
    followup: 'view_own_case',
    record: 'view_own_case',
    detail: 'view_own_case',
  },
  malaysia: {
    dashboard: 'create_patient',
    leads: 'create_patient',
    cases: 'edit_patient',
    documents: 'upload_document',
    tasks: 'submit_case',
    resources: 'create_patient',
    record: 'edit_patient',
  },
  china: {
    dashboard: 'verify_document',
    intake: 'verify_document',
    records: 'verify_document',
    experts: 'assign_expert',
    hospitals: 'request_hospital',
    handoff: 'manage_handoff',
    record: 'verify_document',
  },
  expert: {
    dashboard: 'view_clinical',
    queue: 'view_clinical',
    case: 'view_clinical',
    mdt: 'create_mdt',
    history: 'view_clinical',
    record: 'view_clinical',
  },
  hospital: {
    dashboard: 'view_authorized_case',
    intake: 'respond_intake',
    schedule: 'manage_schedule',
    inpatient: 'manage_schedule',
    billing: 'manage_billing',
    discharge: 'complete_discharge',
    record: 'view_authorized_case',
  },
  health: {
    dashboard: 'view_discharge_case',
    followups: 'manage_followup',
    medication: 'manage_medication',
    rehab: 'manage_followup',
    alerts: 'manage_alert',
    quality: 'manage_followup',
    record: 'view_discharge_case',
  },
}

export const actionPermissions = {
  uploadDocument: 'upload_document',
  revokeConsent: 'manage_consent',
  submitCase: 'submit_case',
  acceptChinaCase: 'verify_document',
  publishSummary: 'publish_summary',
  assignExpert: 'assign_expert',
  requestHospital: 'request_hospital',
  completeHandoff: 'manage_handoff',
  claimReview: 'view_clinical',
  finishReview: 'sign_review',
  requestMoreDocuments: 'request_document',
  rejectReview: 'edit_review',
  finishMdt: 'create_mdt',
  copyReview: 'edit_review',
  acceptHospital: 'respond_intake',
  rejectHospital: 'respond_intake',
  confirmSchedule: 'manage_schedule',
  advanceTreatment: 'manage_schedule',
  recordPayment: 'manage_billing',
  recordRefund: 'manage_billing',
  completeDischarge: 'complete_discharge',
  generateFollowup: 'manage_followup',
  createFollowupTask: 'manage_followup',
  confirmMedication: 'manage_medication',
  completeRehab: 'manage_followup',
  escalateAlert: 'manage_alert',
  closeAlert: 'close_alert',
  createLead: 'create_patient',
  createPatient: 'create_patient',
  lockDocuments: 'upload_document',
  completeMalaysiaTask: 'submit_case',
  bookLocalResource: 'create_patient',
  generateQuality: 'manage_followup',
  confirmPlan: 'confirm_plan',
  confirmTravel: 'confirm_travel',
  completeFollowup: 'view_own_case',
}

export function hasPermission(permissions, system, permission) {
  if (!permission) return true
  return Boolean(permissions?.[system]?.includes(permission))
}

export function permissionForPage(system, page) {
  return pagePermissions[system]?.[page]
}

export function permissionForAction(action) {
  return actionPermissions[action]
}

export function canAccessPage(permissions, system, page) {
  return hasPermission(permissions, system, permissionForPage(system, page))
}

export function canPerformAction(permissions, system, action) {
  return hasPermission(permissions, system, permissionForAction(action))
}
