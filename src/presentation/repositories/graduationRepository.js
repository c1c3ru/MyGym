import academyCollectionsService from '@infrastructure/services/academyCollectionsService';

// Repositório simples para abstrair dados de graduação usando as subcoleções por academia
const graduationRepository = {
  async loadInitialData(academiaId, studentId) {
    // Modalidades da academia
    const modalities = await academyCollectionsService.getModalities(academiaId).catch(() => []);

    // Instrutores: tenta coleção dedicada e faz fallback para coleção de usuários com papel de instrutor
    let instructors = [];
    try {
      instructors = await academyCollectionsService.getCollection(academiaId, 'instructors');
    } catch (_) {
      try {
        const users = await academyCollectionsService.getCollection(academiaId, 'users');
        instructors = (users || []).filter(u => {
          const role = (u.role || u.userType || u.tipo || '').toString().toLowerCase();
          return role.includes('instrutor') || role.includes('instructor');
        });
      } catch (_) {
        instructors = [];
      }
    }

    // Graduação atual (se houver) - coleção opcional por aluno
    let currentGraduation = null;
    try {
      const graduations = await academyCollectionsService.getCollection(academiaId, `students/${studentId}/graduations`);
      if (Array.isArray(graduations) && graduations.length > 0) {
        // Assume a última como atual
        currentGraduation = graduations[0]?.graduation || graduations[0]?.name || null;
      }
    } catch (_) {
      // Ignorar se a subcoleção não existir
      currentGraduation = null;
    }

    return { modalities, instructors, currentGraduation };
  },

  async addGraduation(academiaId, studentId, graduationData) {
    try {
      // 1. Salvar na subcoleção historico do aluno
      await academyCollectionsService.createDocument(academiaId, `students/${studentId}/graduations`, graduationData);

      // 2. Salvar na coleção geral de graduações da academia (para exibição no dashboard)
      // Isso é crucial para que o InstructorDashboard encontre os dados
      await academyCollectionsService.createDocument(academiaId, 'graduations', {
        ...graduationData,
        studentId,
        studentName: graduationData.studentName // Garantir nome para exibição
      });

      // 3. Atualizar a graduação atual no documento do aluno
      try {
        await academyCollectionsService.updateDocument(academiaId, 'students', studentId, {
          currentGraduation: graduationData.graduation,
          lastGraduationDate: graduationData.date instanceof Date ? graduationData.date : new Date(),
          updatedAt: new Date()
        });
      } catch (updateError) {
        console.warn('Erro ao atualizar resumo do aluno:', updateError);
        // Não falhar o processo inteiro se apenas a atualização do resumo falhar
      }

    } catch (error) {
      console.error('Erro ao adicionar graduação:', error);
      throw error;
    }
  },
};

export default graduationRepository;


