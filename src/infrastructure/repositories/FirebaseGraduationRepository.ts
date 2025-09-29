import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { firebaseApp, firebaseFirestore } from '@infrastructure/firebase';
import { GraduationAlert, GraduationRule, GraduationExam, GraduationBoard, ModalityGraduationStats } from '@domain/entities/GraduationAlert';
import { GraduationRepository } from '@domain/repositories/GraduationRepository';

interface GraduationResult {
  studentId: string;
  passed: boolean;
  date: Date;
  modality: string;
  fromBelt: string;
  toBelt: string;
}

// Ensure Firebase App and Firestore are initialized and get Firestore instance
firebaseApp.initialize();
const db = firebaseFirestore.initialize();

export class FirebaseGraduationRepository implements GraduationRepository {
  private readonly alertsCollection = 'graduation_alerts';
  private readonly rulesCollection = 'graduation_rules';
  private readonly examsCollection = 'graduation_exams';

  // Alertas de graduação
  async getGraduationAlerts(): Promise<GraduationAlert[]> {
    try {
      const q = query(
        collection(db, this.alertsCollection),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        trainingStartDate: doc.data().trainingStartDate?.toDate(),
        estimatedGraduationDate: doc.data().estimatedGraduationDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as GraduationAlert[];
    } catch (error) {
      throw new Error(`Erro ao buscar alertas de graduação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getGraduationAlertsByStudent(studentId: string): Promise<GraduationAlert[]> {
    try {
      const q = query(
        collection(db, this.alertsCollection),
        where('studentId', '==', studentId),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        trainingStartDate: doc.data().trainingStartDate?.toDate(),
        estimatedGraduationDate: doc.data().estimatedGraduationDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as GraduationAlert[];
    } catch (error) {
      throw new Error(`Erro ao buscar alertas do estudante: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getGraduationAlertsByModality(modality: string): Promise<GraduationAlert[]> {
    try {
      const q = query(
        collection(db, this.alertsCollection),
        where('modality', '==', modality),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        trainingStartDate: doc.data().trainingStartDate?.toDate(),
        estimatedGraduationDate: doc.data().estimatedGraduationDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as GraduationAlert[];
    } catch (error) {
      throw new Error(`Erro ao buscar alertas da modalidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async createGraduationAlert(alert: Omit<GraduationAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<GraduationAlert> {
    try {
      const now = new Date();
      const alertData: any = {
        ...alert,
        trainingStartDate: Timestamp.fromDate(alert.trainingStartDate),
        estimatedGraduationDate: Timestamp.fromDate(alert.estimatedGraduationDate),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };

      const docRef = await addDoc(collection(db, this.alertsCollection), alertData);
      
      return {
        id: docRef.id,
        ...alert,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      throw new Error(`Erro ao criar alerta de graduação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async updateGraduationAlert(id: string, alert: Partial<GraduationAlert>): Promise<GraduationAlert> {
    try {
      const docRef = doc(db, this.alertsCollection, id);
      const updateData: any = {
        ...alert,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Converter datas se presentes
      if (alert.trainingStartDate) {
        updateData.trainingStartDate = Timestamp.fromDate(alert.trainingStartDate);
      }
      if (alert.estimatedGraduationDate) {
        updateData.estimatedGraduationDate = Timestamp.fromDate(alert.estimatedGraduationDate);
      }

      await updateDoc(docRef, updateData);
      
      const updatedDoc = await getDoc(docRef);
      const data = updatedDoc.data();
      
      if (!data) {
        throw new Error('Documento não encontrado após atualização');
      }
      
      return {
        id: updatedDoc.id,
        ...data,
        trainingStartDate: data.trainingStartDate?.toDate(),
        estimatedGraduationDate: data.estimatedGraduationDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as GraduationAlert;
    } catch (error) {
      throw new Error(`Erro ao atualizar alerta de graduação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async deleteGraduationAlert(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.alertsCollection, id));
    } catch (error) {
      throw new Error(`Erro ao deletar alerta de graduação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // Regras de graduação
  async getGraduationRules(): Promise<GraduationRule[]> {
    try {
      const snapshot = await getDocs(collection(db, this.rulesCollection));
      return snapshot.docs.map(doc => ({ ...doc.data() })) as GraduationRule[];
    } catch (error) {
      throw new Error(`Erro ao buscar regras de graduação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getGraduationRulesByModality(modality: string): Promise<GraduationRule[]> {
    try {
      const q = query(
        collection(db, this.rulesCollection),
        where('modality', '==', modality)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...doc.data() })) as GraduationRule[];
    } catch (error) {
      throw new Error(`Erro ao buscar regras da modalidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async createGraduationRule(rule: GraduationRule): Promise<GraduationRule> {
    try {
      await addDoc(collection(db, this.rulesCollection), rule);
      return rule;
    } catch (error) {
      throw new Error(`Erro ao criar regra de graduação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async updateGraduationRule(modality: string, fromBelt: string, toBelt: string, rule: Partial<GraduationRule>): Promise<GraduationRule> {
    try {
      const q = query(
        collection(db, this.rulesCollection),
        where('modality', '==', modality),
        where('fromBelt', '==', fromBelt),
        where('toBelt', '==', toBelt)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Regra não encontrada');
      }

      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, rule);
      
      const updatedDoc = await getDoc(docRef);
      const data = updatedDoc.data();
      
      if (!data) {
        throw new Error('Documento não encontrado após atualização');
      }
      
      return { ...data } as GraduationRule;
    } catch (error) {
      throw new Error(`Erro ao atualizar regra de graduação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async deleteGraduationRule(modality: string, fromBelt: string, toBelt: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.rulesCollection),
        where('modality', '==', modality),
        where('fromBelt', '==', fromBelt),
        where('toBelt', '==', toBelt)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        await deleteDoc(snapshot.docs[0].ref);
      }
    } catch (error) {
      throw new Error(`Erro ao deletar regra de graduação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // Exames de graduação
  async getGraduationExams(): Promise<GraduationExam[]> {
    try {
      const q = query(
        collection(db, this.examsCollection),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as GraduationExam[];
    } catch (error) {
      throw new Error(`Erro ao buscar exames de graduação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getGraduationExamsByModality(modality: string): Promise<GraduationExam[]> {
    try {
      const q = query(
        collection(db, this.examsCollection),
        where('modality', '==', modality),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as GraduationExam[];
    } catch (error) {
      throw new Error(`Erro ao buscar exames da modalidade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getUpcomingGraduationExams(): Promise<GraduationExam[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, this.examsCollection),
        where('date', '>=', Timestamp.fromDate(now)),
        where('status', '==', 'scheduled'),
        orderBy('date', 'asc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as GraduationExam[];
    } catch (error) {
      throw new Error(`Erro ao buscar próximos exames: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async createGraduationExam(exam: Omit<GraduationExam, 'id' | 'createdAt' | 'updatedAt'>): Promise<GraduationExam> {
    try {
      const now = new Date();
      const examData: any = {
        ...exam,
        date: Timestamp.fromDate(exam.date),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };

      const docRef = await addDoc(collection(db, this.examsCollection), examData);
      
      return {
        id: docRef.id,
        ...exam,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      throw new Error(`Erro ao criar exame de graduação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async updateGraduationExam(id: string, exam: Partial<GraduationExam>): Promise<GraduationExam> {
    try {
      const docRef = doc(db, this.examsCollection, id);
      const updateData: any = {
        ...exam,
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (exam.date) {
        updateData.date = Timestamp.fromDate(exam.date);
      }

      await updateDoc(docRef, updateData);
      
      const updatedDoc = await getDoc(docRef);
      const data = updatedDoc.data();
      
      if (!data) {
        throw new Error('Documento não encontrado após atualização');
      }
      
      return {
        id: updatedDoc.id,
        ...data,
        date: data.date?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as GraduationExam;
    } catch (error) {
      throw new Error(`Erro ao atualizar exame de graduação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async deleteGraduationExam(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.examsCollection, id));
    } catch (error) {
      throw new Error(`Erro ao deletar exame de graduação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // Mural de graduações
  async getGraduationBoard(): Promise<GraduationBoard> {
    try {
      const [upcomingExams, eligibleStudents, recentGraduations] = await Promise.all([
        this.getUpcomingGraduationExams(),
        this.getEligibleStudents(),
        this.getRecentGraduations()
      ]);

      const modalityStats = await this.calculateModalityStats();

      return {
        upcomingExams,
        eligibleStudents,
        recentGraduations,
        modalityStats
      };
    } catch (error) {
      throw new Error(`Erro ao obter mural de graduações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getEligibleStudents(modality?: string): Promise<GraduationAlert[]> {
    try {
      let q = query(
        collection(db, this.alertsCollection),
        where('isEligible', '==', true),
        orderBy('updatedAt', 'desc')
      );

      if (modality) {
        q = query(
          collection(db, this.alertsCollection),
          where('isEligible', '==', true),
          where('modality', '==', modality),
          orderBy('updatedAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        trainingStartDate: doc.data().trainingStartDate?.toDate(),
        estimatedGraduationDate: doc.data().estimatedGraduationDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as GraduationAlert[];
    } catch (error) {
      throw new Error(`Erro ao buscar estudantes elegíveis: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async markAlertAsNotified(alertId: string): Promise<void> {
    try {
      const docRef = doc(db, this.alertsCollection, alertId);
      await updateDoc(docRef, {
        notified: true,
        notifiedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      throw new Error(`Erro ao marcar alerta como notificado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getUnnotifiedAlerts(): Promise<GraduationAlert[]> {
    try {
      const q = query(
        collection(db, this.alertsCollection),
        where('notified', '!=', true),
        where('isEligible', '==', true)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        trainingStartDate: doc.data().trainingStartDate?.toDate(),
        estimatedGraduationDate: doc.data().estimatedGraduationDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as GraduationAlert[];
    } catch (error) {
      throw new Error(`Erro ao buscar alertas não notificados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // Métodos auxiliares privados
  private async getRecentGraduations(): Promise<GraduationResult[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const q = query(
        collection(db, this.examsCollection),
        where('status', '==', 'completed'),
        where('updatedAt', '>=', thirtyDaysAgo),
        orderBy('updatedAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const recentGraduations: GraduationResult[] = [];

      snapshot.docs.forEach(doc => {
        const exam = doc.data() as { results?: GraduationResult[] };
        if (exam.results) {
          exam.results.forEach(result => {
            recentGraduations.push({
              studentId: result.studentId,
              passed: result.passed,
              date: result.date instanceof Date ? result.date : new Date(result.date),
              modality: result.modality,
              fromBelt: result.fromBelt,
              toBelt: result.toBelt
            });
          });
        }
      });

      return recentGraduations;
    } catch (error) {
      console.error('Erro ao buscar graduações recentes:', error);
      return [];
    }
  }

  private async calculateModalityStats(): Promise<ModalityGraduationStats[]> {
    try {
      const alerts = await this.getGraduationAlerts();
      const upcomingExams = await this.getUpcomingGraduationExams();

      const modalityMap = new Map();

      // Processar alertas por modalidade
      alerts.forEach(alert => {
        if (!modalityMap.has(alert.modality)) {
          modalityMap.set(alert.modality, {
            modality: alert.modality,
            totalStudents: 0,
            eligibleStudents: 0,
            totalTrainingTime: 0,
            nextExamDate: undefined
          });
        }

        const stat = modalityMap.get(alert.modality);
        stat.totalStudents++;
        if (alert.isEligible) {
          stat.eligibleStudents++;
        }

        // Calcular tempo de treinamento
        const trainingDays = Math.ceil(
          (new Date().getTime() - alert.trainingStartDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        stat.totalTrainingTime += trainingDays;
      });

      // Adicionar próximas datas de exame
      upcomingExams.forEach(exam => {
        if (modalityMap.has(exam.modality)) {
          const stat = modalityMap.get(exam.modality);
          if (!stat.nextExamDate || exam.date < stat.nextExamDate) {
            stat.nextExamDate = exam.date;
          }
        }
      });

      // Calcular médias e finalizar
      const stats = Array.from(modalityMap.values()).map(stat => ({
        ...stat,
        averageTrainingTime: stat.totalStudents > 0 
          ? Math.round(stat.totalTrainingTime / stat.totalStudents)
          : 0
      }));

      return stats;
    } catch (error) {
      console.error('Erro ao calcular estatísticas por modalidade:', error);
      return [];
    }
  }
}
