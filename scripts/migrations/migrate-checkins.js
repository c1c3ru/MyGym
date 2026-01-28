#!/usr/bin/env node

/**
 * Script de Migração de Check-ins
 * 
 * Migra check-ins da subcoleção /classes/{id}/checkIns
 * para a coleção global /checkIns
 * 
 * Uso:
 *   node migrate-checkins.js <academiaId> [--dry-run] [--batch-size=500]
 * 
 * Exemplos:
 *   node migrate-checkins.js abc123 --dry-run
 *   node migrate-checkins.js abc123 --batch-size=100
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccountPath = path.join(__dirname, '../../google-services.json');

try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin inicializado');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
    console.error('   Certifique-se de que google-services.json existe em:', serviceAccountPath);
    process.exit(1);
}

const db = admin.firestore();

// Configurações
const DEFAULT_BATCH_SIZE = 500;
const args = process.argv.slice(2);
const academiaId = args[0];
const isDryRun = args.includes('--dry-run');
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : DEFAULT_BATCH_SIZE;

// Validações
if (!academiaId) {
    console.error('❌ Uso: node migrate-checkins.js <academiaId> [--dry-run] [--batch-size=500]');
    process.exit(1);
}

console.log('\n🚀 Iniciando migração de check-ins');
console.log('📋 Configurações:');
console.log(`   Academia ID: ${academiaId}`);
console.log(`   Modo: ${isDryRun ? 'DRY-RUN (simulação)' : 'PRODUÇÃO'}`);
console.log(`   Batch size: ${batchSize}`);
console.log('');

/**
 * Migrar check-ins de uma academia
 */
async function migrateCheckIns(academiaId) {
    const stats = {
        totalClasses: 0,
        totalCheckIns: 0,
        migrated: 0,
        skipped: 0,
        errors: []
    };

    try {
        // 1. Buscar todas as turmas da academia
        console.log('📚 Buscando turmas...');
        const classesSnapshot = await db
            .collection('gyms').doc(academiaId)
            .collection('classes')
            .get();

        stats.totalClasses = classesSnapshot.size;
        console.log(`✅ Encontradas ${stats.totalClasses} turmas\n`);

        if (stats.totalClasses === 0) {
            console.log('⚠️  Nenhuma turma encontrada. Nada a migrar.');
            return stats;
        }

        // 2. Para cada turma, buscar e migrar check-ins
        for (const classDoc of classesSnapshot.docs) {
            const classData = classDoc.data();
            const className = classData.name || 'Sem nome';

            console.log(`\n📖 Turma: ${className} (${classDoc.id})`);

            try {
                // Buscar check-ins da subcoleção
                const checkInsSnapshot = await classDoc.ref
                    .collection('checkIns')
                    .get();

                const checkInsCount = checkInsSnapshot.size;
                stats.totalCheckIns += checkInsCount;

                console.log(`   📊 ${checkInsCount} check-ins encontrados`);

                if (checkInsCount === 0) {
                    console.log('   ⏭️  Pulando (sem check-ins)');
                    continue;
                }

                // Migrar em batches
                let batch = db.batch();
                let batchCount = 0;
                let classStats = { migrated: 0, skipped: 0 };

                for (const checkInDoc of checkInsSnapshot.docs) {
                    const checkInData = checkInDoc.data();

                    // Verificar se já existe na localização global
                    const globalRef = db.collection('gyms').doc(academiaId)
                        .collection('checkIns').doc(checkInDoc.id);

                    const existingDoc = await globalRef.get();

                    if (existingDoc.exists) {
                        console.log(`   ⏭️  Check-in ${checkInDoc.id} já existe (pulando)`);
                        stats.skipped++;
                        classStats.skipped++;
                        continue;
                    }

                    // Preparar dados para migração
                    const migratedData = {
                        ...checkInData,
                        classId: classDoc.id,
                        className: className,
                        _migratedFrom: 'subcollection',
                        _migratedAt: admin.firestore.FieldValue.serverTimestamp()
                    };

                    if (!isDryRun) {
                        batch.set(globalRef, migratedData, { merge: true });
                        batchCount++;
                        stats.migrated++;
                        classStats.migrated++;

                        // Commit batch a cada N documentos
                        if (batchCount >= batchSize) {
                            await batch.commit();
                            console.log(`   ✅ Batch de ${batchCount} check-ins migrados`);
                            batch = db.batch();
                            batchCount = 0;
                        }
                    } else {
                        stats.migrated++;
                        classStats.migrated++;
                    }
                }

                // Commit batch restante
                if (!isDryRun && batchCount > 0) {
                    await batch.commit();
                    console.log(`   ✅ Batch final de ${batchCount} check-ins migrados`);
                }

                console.log(`   📊 Resumo: ${classStats.migrated} migrados, ${classStats.skipped} pulados`);

            } catch (error) {
                console.error(`   ❌ Erro ao processar turma ${classDoc.id}:`, error.message);
                stats.errors.push({
                    classId: classDoc.id,
                    className: className,
                    error: error.message
                });
            }
        }

        return stats;

    } catch (error) {
        console.error('❌ Erro fatal na migração:', error);
        throw error;
    }
}

/**
 * Validar integridade após migração
 */
async function validateMigration(academiaId) {
    console.log('\n🔍 Validando integridade da migração...');

    try {
        // Contar check-ins na localização global
        const globalSnapshot = await db
            .collection('gyms').doc(academiaId)
            .collection('checkIns')
            .get();

        const globalCount = globalSnapshot.size;
        console.log(`✅ Check-ins na localização global: ${globalCount}`);

        // Contar check-ins nas subcoleções
        const classesSnapshot = await db
            .collection('gyms').doc(academiaId)
            .collection('classes')
            .get();

        let subcollectionCount = 0;
        for (const classDoc of classesSnapshot.docs) {
            const checkInsSnapshot = await classDoc.ref.collection('checkIns').get();
            subcollectionCount += checkInsSnapshot.size;
        }

        console.log(`📊 Check-ins nas subcoleções: ${subcollectionCount}`);

        if (globalCount >= subcollectionCount) {
            console.log('✅ Validação OK: Todos os check-ins foram migrados');
            return true;
        } else {
            console.log(`⚠️  Atenção: Faltam ${subcollectionCount - globalCount} check-ins`);
            return false;
        }

    } catch (error) {
        console.error('❌ Erro na validação:', error);
        return false;
    }
}

/**
 * Executar migração
 */
async function main() {
    const startTime = Date.now();

    try {
        // Executar migração
        const stats = await migrateCheckIns(academiaId);

        // Exibir resumo
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMO DA MIGRAÇÃO');
        console.log('='.repeat(60));
        console.log(`Turmas processadas:     ${stats.totalClasses}`);
        console.log(`Check-ins encontrados:  ${stats.totalCheckIns}`);
        console.log(`Check-ins migrados:     ${stats.migrated}`);
        console.log(`Check-ins pulados:      ${stats.skipped}`);
        console.log(`Erros:                  ${stats.errors.length}`);

        if (stats.errors.length > 0) {
            console.log('\n❌ Erros encontrados:');
            stats.errors.forEach(err => {
                console.log(`   - ${err.className} (${err.classId}): ${err.error}`);
            });
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n⏱️  Tempo total: ${duration}s`);

        if (isDryRun) {
            console.log('\n⚠️  MODO DRY-RUN: Nenhum dado foi modificado');
            console.log('   Execute sem --dry-run para aplicar as mudanças');
        } else {
            // Validar migração
            const isValid = await validateMigration(academiaId);

            if (isValid) {
                console.log('\n✅ Migração concluída com sucesso!');
            } else {
                console.log('\n⚠️  Migração concluída com avisos. Verifique os logs.');
            }
        }

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Erro fatal:', error);
        process.exit(1);
    }
}

// Executar
main();
