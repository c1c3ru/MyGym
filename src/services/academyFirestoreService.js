/**
 * Re-export do academyFirestoreService da pasta infrastructure
 */
export { 
  academyFirestoreService,
  academyStudentService,
  academyClassService,
  academyPaymentService,
  academyAnnouncementService,
  academyEventService,
  auditService
} from '../infrastructure/services/academyFirestoreService';

export { default } from '../infrastructure/services/academyFirestoreService';
