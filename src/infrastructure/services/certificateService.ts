import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export interface CertificateData {
  studentName: string;
  graduationName: string;
  date: string;
  location: string;
  instructorName: string;
  academyName: string;
  customText?: string;
}

export interface ElementStyle {
  visible: boolean;
  x?: number; // percent 0-100 (left)
  y?: number; // percent 0-100 (top)
  width?: number; // percent 0-100
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  italic?: boolean;
}

export interface CertificateTemplateConfig {
  id: string;
  name: string;
  imageUrl: string;
  textTemplate: string;
  elements: {
    studentName: ElementStyle;
    bodyText: ElementStyle;
    dateLocation: ElementStyle;
    instructorName: ElementStyle;
    graduationName: ElementStyle; // New: separate style for graduation name if needed
  };
  createdAt: number;
}

// Backwards compatibility wrapper
export interface TemplateInfo {
  imageUrl: string;
  textTemplate?: string;
  customColors?: {
    studentName?: string;
    bodyText?: string;
  };
  fontStyle?: 'classic' | 'modern' | 'handwritten' | 'elegant' | 'roboto' | 'openSans';
  // New full config support
  config?: CertificateTemplateConfig;
}

/**
 * Tags disponíveis para substituição no template
 */
export const CERTIFICATE_TAGS = {
  ACADEMY_NAME: '$tagAcademia',
  STUDENT_NAME: '$tagNome',
  GRADUATION_TYPE: '$tagTipoDeGraduacao',
  DATE_AND_LOCATION: '$tagDataELocal',
  INSTRUCTOR_DATA: '$tagDadosDoInstrutor',
};

/**
 * Template padrão de texto para certificados
 */
export const DEFAULT_CERTIFICATE_TEXT = `A equipe $tagAcademia confere ao aluno $tagNome a graduação de $tagTipoDeGraduacao, conquistada pela disciplina e determinação demonstradas na busca pela excelência técnica, assim como sua dedicação aos valores da nossa equipe e ao Jiu-Jitsu.`;

/**
 * Substitui as tags no template com os dados reais
 */
function replaceTags(template: string, data: CertificateData): string {
  return template
    .replace(CERTIFICATE_TAGS.ACADEMY_NAME, data.academyName)
    .replace(CERTIFICATE_TAGS.STUDENT_NAME, data.studentName)
    .replace(CERTIFICATE_TAGS.GRADUATION_TYPE, data.graduationName)
    .replace(CERTIFICATE_TAGS.DATE_AND_LOCATION, `${data.location}, ${data.date}`)
    .replace(CERTIFICATE_TAGS.INSTRUCTOR_DATA, data.instructorName);
}

/**
 * Mapeamento de estilos de fonte para famílias CSS
 */
export const FONT_FAMILIES = {
  classic: "'Times New Roman', serif",
  modern: "'Helvetica', 'Arial', sans-serif",
  handwritten: "'Brush Script MT', 'Comic Sans MS', cursive",
  elegant: "'Playfair Display', serif",
  roboto: "'Roboto', sans-serif",
  openSans: "'Open Sans', sans-serif"
};

/**
 * Helper para gerar estilo CSS de um elemento
 */
function generateElementCSS(style: ElementStyle, defaultTop: number, defaultFontSize: number, defaultColor: string): string {
  if (!style.visible) return 'display: none;';

  const top = style.y !== undefined ? `${style.y}%` : `${defaultTop}px`;
  const left = style.x !== undefined ? `${style.x}%` : '0';
  const width = style.width !== undefined ? `${style.width}%` : '100%';
  const fontSize = style.fontSize !== undefined ? `${style.fontSize}px` : `${defaultFontSize}px`;
  const color = style.color || defaultColor;
  const textAlign = style.textAlign || 'center';
  const fontFamily = style.fontFamily && FONT_FAMILIES[style.fontFamily as keyof typeof FONT_FAMILIES]
    ? FONT_FAMILIES[style.fontFamily as keyof typeof FONT_FAMILIES]
    : 'inherit';
  const fontWeight = style.fontWeight || 'normal';
  const fontStyle = style.italic ? 'italic' : 'normal';

  return `
    position: absolute;
    top: ${top};
    left: ${left};
    width: ${width};
    font-size: ${fontSize};
    color: ${color};
    text-align: ${textAlign};
    font-family: ${fontFamily};
    font-weight: ${fontWeight};
    font-style: ${fontStyle};
    z-index: 10;
  `;
}

/**
 * Gera HTML do certificado
 */
function generateCertificateHTML(data: CertificateData, templateInfo: TemplateInfo): string {
  const { studentName, location, date, instructorName } = data;

  // Use config object if available, otherwise fallback to legacy compatibility
  const bgUrl = templateInfo.config?.imageUrl || templateInfo.imageUrl;
  const textTemplate = templateInfo.config?.textTemplate || templateInfo.textTemplate || DEFAULT_CERTIFICATE_TEXT;
  const certificateText = replaceTags(textTemplate, data);

  // Default font family
  const globalFont = templateInfo.config
    ? 'sans-serif'
    : (templateInfo.fontStyle ? FONT_FAMILIES[templateInfo.fontStyle] : FONT_FAMILIES.classic);

  // Elements style configuration
  const elements = templateInfo.config?.elements || {
    studentName: {
      visible: true,
      y: 40,
      fontSize: 52,
      color: templateInfo.customColors?.studentName || '#1a1a1a',
      fontWeight: 'bold',
      fontFamily: templateInfo.fontStyle
    },
    bodyText: {
      visible: true,
      y: 55,
      fontSize: 22,
      color: templateInfo.customColors?.bodyText || '#2c2c2c',
      width: 80,
      x: 10
    },
    dateLocation: {
      visible: true,
      y: 80,
      x: 10,
      width: 30,
      fontSize: 18,
      textAlign: 'left'
    },
    instructorName: {
      visible: true,
      y: 80,
      x: 60,
      width: 30,
      fontSize: 20,
      textAlign: 'center',
      fontWeight: 'bold'
    },
    graduationName: { visible: false } // Default invisible in legacy, part of text
  };

  const studentNameCSS = generateElementCSS(elements.studentName, 0, 52, '#000');
  const bodyTextCSS = generateElementCSS(elements.bodyText, 0, 22, '#333');
  const dateLocationCSS = generateElementCSS(elements.dateLocation, 0, 18, '#333');
  const instructorNameCSS = generateElementCSS(elements.instructorName, 0, 20, '#000');
  const graduationCSS = generateElementCSS(elements.graduationName || { visible: false }, 0, 30, '#000');

  console.log('🖼️ URL da imagem de fundo:', bgUrl);

  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@400;500;700&family=Open+Sans:ital,wght@0,400;0,600;1,400&family=Great+Vibes&display=swap');

          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: A4 landscape; margin: 0; }
          
          html, body { 
            width: 297mm; height: 210mm; margin: 0; padding: 0; overflow: hidden;
          }
          
          body { 
            position: relative; 
            font-family: ${globalFont};
            background-color: #f5f5f5;
          }
          
          .certificate-container {
            width: 100%; height: 100%; position: relative; background-color: white;
          }
          
          .background { 
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            object-fit: cover; z-index: 0;
          }
          
          /* Dynamic Elements */
          .element-student-name { ${studentNameCSS} }
          .element-body-text { ${bodyTextCSS} }
          .element-date-location { ${dateLocationCSS} }
          .element-instructor-name { ${instructorNameCSS} }
          .element-graduation-name { ${graduationCSS} }

          /* Instructor Line Helper */
          .line-above {
            border-top: 2px solid #333;
            width: 80%;
            margin: 0 auto 5px auto;
            display: block;
          }

          @media print { body { background-color: white; } }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          <img src="${bgUrl}" class="background" alt="Background" crossorigin="anonymous" />
          
          <div class="element-student-name">
            ${data.studentName}
          </div>
          
          <div class="element-body-text">
            ${certificateText}
          </div>

          <!-- Graduação destacada se configurada para ser visível separadamente -->
          <div class="element-graduation-name">
            ${data.graduationName}
          </div>
          
          <div class="element-date-location">
            ${location}, ${date}
          </div>
          
          <div class="element-instructor-name">
            <div class="line-above"></div>
            ${data.instructorName}<br>
            <span style="font-size: 0.8em; font-weight: normal; font-style: italic;">Instrutor</span>
          </div>
        </div>
      </body>
      </html>
    `;
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
   * Gera o PDF do certificado
   * - Mobile: usa expo-print
   * - Web: abre em nova janela para impressão
   */
  async generateCertificatePdf(data: CertificateData, templateInfo: TemplateInfo): Promise<string> {
    console.log('🎨 Gerando certificado para:', data.studentName);

    const html = generateCertificateHTML(data, templateInfo);

    try {
      // Mobile: usar expo-print
      if (Platform.OS !== 'web') {
        console.log('📱 Gerando PDF com expo-print (mobile)...');
        const result = await Print.printToFileAsync({
          html,
          width: 842,
          height: 595,
          base64: false
        });

        if (!result || !result.uri) {
          throw new Error('Falha ao gerar PDF - URI não retornado');
        }

        console.log('✅ PDF gerado:', result.uri);
        return result.uri;
      }
      // Web: abrir em nova janela
      else {
        console.log('🌐 Abrindo certificado em nova janela (web)...');
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();

          // Aguardar imagem carregar antes de imprimir
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 500);
          };

          console.log('✅ Certificado aberto em nova janela');
          return 'web-preview'; // Retorna identificador para web
        } else {
          throw new Error('Não foi possível abrir nova janela. Verifique se pop-ups estão bloqueados.');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao gerar certificado:', error);
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
   * Compartilha o arquivo PDF local (apenas mobile)
   */
  async shareCertificate(uri: string) {
    if (Platform.OS === 'web') {
      console.log('ℹ️ Compartilhamento não disponível na web');
      return;
    }

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
