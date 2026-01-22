import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export interface CertificateData {
    studentName: string;
    graduationName: string;
    date: string;
    instructorName: string;
    academyName: string;
}

export interface TemplateInfo {
    imageUrl: string;
    // Futuramente: positions { studentName: {x,y}, ... }
}

export const certificateService = {
    /**
     * Faz upload da imagem de template para o Storage
     */
    async uploadTemplate(academiaId: string, uri: string): Promise<string> {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const filename = `templates/certificates/${academiaId}_${Date.now()}.jpg`;
            const storageRef = ref(storage, filename);

            await uploadBytes(storageRef, blob);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Erro upload template:', error);
            throw error;
        }
    },

    /**
     * Gera o PDF do certificado usando expo-print
     */
    async generateCertificatePdf(data: CertificateData, templateInfo: TemplateInfo): Promise<string> {
        const { studentName, graduationName, date, instructorName } = data;
        const bgUrl = templateInfo.imageUrl;

        // HTML otimizado para A4 Paisagem
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: A4 landscape; margin: 0; }
          body { 
            margin: 0; 
            padding: 0; 
            width: 297mm; 
            height: 210mm; 
            position: relative; 
            font-family: 'Helvetica', sans-serif; 
            overflow: hidden;
          }
          .background { 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            z-index: -1; 
            object-fit: cover;
          }
          .content { 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            text-align: center; 
            color: #333; 
          }
          
          /* Layout Padrão Centralizado */
          .student-name { 
            position: absolute; 
            top: 42%; 
            width: 100%; 
            font-size: 40px; 
            font-weight: bold; 
            text-transform: uppercase;
            color: #000;
          }
          .graduation-name { 
            position: absolute; 
            top: 58%; 
            width: 100%; 
            font-size: 28px;
            font-weight: 500; 
          }
          .date { 
            position: absolute; 
            bottom: 18%; 
            left: 15%; 
            font-size: 16px; 
          }
          .instructor { 
            position: absolute; 
            bottom: 18%; 
            right: 15%; 
            font-size: 16px; 
            text-align: right;
          }
        </style>
      </head>
      <body>
        <img src="${bgUrl}" class="background" />
        <div class="content">
            <div class="student-name">${studentName}</div>
            <div class="graduation-name">${graduationName}</div>
            <div class="date">${date}</div>
            <div class="instructor">${instructorName}</div>
        </div>
      </body>
      </html>
    `;

        try {
            const { uri } = await Print.printToFileAsync({
                html,
                width: 842, // Width in points for A4 Landscape
                height: 595
            });
            return uri;
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw error;
        }
    },

    /**
     * Faz upload do PDF gerado para o Storage
     */
    async uploadCertificate(academiaId: string, studentId: string, graduationId: string, uri: string): Promise<string> {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const filename = `certificates/${academiaId}/${studentId}/${graduationId}.pdf`;
            const storageRef = ref(storage, filename);

            await uploadBytes(storageRef, blob);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Erro upload certificado:', error);
            throw error;
        }
    },

    /**
     * Compartilha o arquivo PDF local
     */
    async shareCertificate(uri: string) {
        if (!(await Sharing.isAvailableAsync())) {
            throw new Error("Sharing not available");
        }
        await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Compartilhar Certificado',
            UTI: 'com.adobe.pdf'
        });
    }
};

export default certificateService;
