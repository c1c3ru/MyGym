import { Linking, Platform } from 'react-native';
import { EmailService } from './emailService';
import { COLORS } from '@presentation/theme/designTokens';

export interface CertificateDeliveryData {
    studentName: string;
    studentEmail?: string;
    studentPhone?: string;
    graduationName: string;
    academyName: string;
    certificateUrl: string;
    date: string;
}

export class CertificateDeliveryService {
    /**
     * Gera template HTML para email de certificado
     */
    private static generateCertificateEmailTemplate(data: CertificateDeliveryData): { subject: string; html: string; text: string } {
        const { studentName, graduationName, academyName, certificateUrl, date } = data;

        const subject = `🏆 Seu Certificado de ${graduationName} - ${academyName}`;

        const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificado - ${academyName}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f5f5f5;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #1976D2, #1565C0);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            .header-icon {
                font-size: 64px;
                margin-bottom: 16px;
            }
            .header-title {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 8px;
            }
            .header-subtitle {
                font-size: 16px;
                opacity: 0.95;
            }
            .content {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 20px;
                font-weight: 600;
                color: #1976D2;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                color: #555;
                margin-bottom: 24px;
                line-height: 1.8;
            }
            .certificate-info {
                background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
                border-left: 4px solid #FF9800;
                padding: 20px;
                border-radius: 8px;
                margin: 24px 0;
            }
            .certificate-info-title {
                font-size: 14px;
                font-weight: 600;
                color: #E65100;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 12px;
            }
            .certificate-detail {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                font-size: 15px;
            }
            .certificate-detail strong {
                color: #E65100;
                margin-right: 8px;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #1976D2, #1565C0);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 24px 0;
                text-align: center;
                box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
                transition: all 0.3s ease;
            }
            .cta-container {
                text-align: center;
            }
            .footer {
                background-color: #f9f9f9;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e0e0e0;
            }
            .footer-text {
                font-size: 14px;
                color: #777;
                margin-bottom: 8px;
            }
            .footer-academy {
                font-size: 16px;
                font-weight: 600;
                color: #1976D2;
                margin-bottom: 16px;
            }
            .social-icons {
                margin-top: 16px;
            }
            .congratulations {
                background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
                border-left: 4px solid #4CAF50;
                padding: 20px;
                border-radius: 8px;
                margin: 24px 0;
                text-align: center;
            }
            .congratulations-text {
                font-size: 18px;
                font-weight: 600;
                color: #2E7D32;
            }
            .congratulations-emoji {
                font-size: 32px;
                margin-bottom: 8px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="header-icon">🏆</div>
                <div class="header-title">Parabéns pela Conquista!</div>
                <div class="header-subtitle">Seu certificado está pronto</div>
            </div>
            
            <div class="content">
                <div class="greeting">Olá, ${studentName}!</div>
                
                <div class="congratulations">
                    <div class="congratulations-emoji">🎉</div>
                    <div class="congratulations-text">
                        Você conquistou a graduação de ${graduationName}!
                    </div>
                </div>
                
                <p class="message">
                    É com grande satisfação que a equipe <strong>${academyName}</strong> 
                    parabeniza você por mais essa conquista em sua jornada. 
                    Seu certificado digital está anexado a este email e também disponível 
                    para download através do link abaixo.
                </p>
                
                <div class="certificate-info">
                    <div class="certificate-info-title">📋 Detalhes do Certificado</div>
                    <div class="certificate-detail">
                        <strong>Graduação:</strong> ${graduationName}
                    </div>
                    <div class="certificate-detail">
                        <strong>Data:</strong> ${date}
                    </div>
                    <div class="certificate-detail">
                        <strong>Academia:</strong> ${academyName}
                    </div>
                </div>
                
                <div class="cta-container">
                    <a href="${certificateUrl}" class="cta-button">
                        📥 Baixar Certificado
                    </a>
                </div>
                
                <p class="message">
                    <strong>💡 Dica:</strong> Salve este certificado em um local seguro. 
                    Você pode imprimi-lo ou compartilhá-lo nas redes sociais para celebrar 
                    sua conquista!
                </p>
            </div>
            
            <div class="footer">
                <div class="footer-academy">${academyName}</div>
                <div class="footer-text">
                    Continue treinando com dedicação e disciplina.
                </div>
                <div class="footer-text">
                    Este é um email automático, mas estamos sempre disponíveis para você!
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

        const text = `
🏆 Parabéns pela Conquista!

Olá, ${studentName}!

Você conquistou a graduação de ${graduationName}!

É com grande satisfação que a equipe ${academyName} parabeniza você por mais essa conquista em sua jornada.

📋 Detalhes do Certificado:
• Graduação: ${graduationName}
• Data: ${date}
• Academia: ${academyName}

Baixe seu certificado: ${certificateUrl}

Continue treinando com dedicação e disciplina!

${academyName}
    `.trim();

        return { subject, html, text };
    }

    /**
     * Envia certificado por email
     */
    static async sendCertificateByEmail(data: CertificateDeliveryData): Promise<boolean> {
        try {
            if (!data.studentEmail) {
                console.warn('⚠️ Email do aluno não fornecido');
                return false;
            }

            const template = this.generateCertificateEmailTemplate(data);

            const emailData = {
                to: data.studentEmail,
                subject: template.subject,
                html: template.html,
                text: template.text,
            };

            const result = await EmailService.sendEmail(emailData);

            if (result) {
                console.log('✅ Certificado enviado por email para:', data.studentEmail);
            }

            return result;
        } catch (error) {
            console.error('❌ Erro ao enviar certificado por email:', error);
            return false;
        }
    }

    /**
     * Compartilha certificado via WhatsApp
     */
    static async sendCertificateByWhatsApp(data: CertificateDeliveryData): Promise<boolean> {
        try {
            if (!data.studentPhone) {
                console.warn('⚠️ Telefone do aluno não fornecido');
                return false;
            }

            // Remove caracteres não numéricos do telefone
            const cleanPhone = data.studentPhone.replace(/\D/g, '');

            // Adiciona código do país se não tiver
            const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

            // Mensagem personalizada
            const message = encodeURIComponent(
                `🏆 *Parabéns, ${data.studentName}!*\n\n` +
                `Você conquistou a graduação de *${data.graduationName}*! 🎉\n\n` +
                `A equipe ${data.academyName} parabeniza você por mais essa conquista.\n\n` +
                `📥 Seu certificado digital está disponível em:\n${data.certificateUrl}\n\n` +
                `Continue treinando com dedicação! 💪`
            );

            // Tenta abrir WhatsApp
            const whatsappUrl = `whatsapp://send?phone=${fullPhone}&text=${message}`;
            const webWhatsappUrl = `https://wa.me/${fullPhone}?text=${message}`;

            try {
                const canOpen = await Linking.canOpenURL(whatsappUrl);

                if (canOpen) {
                    await Linking.openURL(whatsappUrl);
                    console.log('✅ WhatsApp aberto com sucesso');
                    return true;
                } else {
                    // Fallback para web WhatsApp
                    await Linking.openURL(webWhatsappUrl);
                    console.log('✅ WhatsApp Web aberto com sucesso');
                    return true;
                }
            } catch (linkError) {
                console.warn('⚠️ Erro ao abrir app WhatsApp, tentando web:', linkError);
                await Linking.openURL(webWhatsappUrl);
                return true;
            }
        } catch (error) {
            console.error('❌ Erro ao enviar certificado via WhatsApp:', error);
            return false;
        }
    }

    /**
     * Envia certificado por ambos os canais (email e WhatsApp)
     */
    static async sendCertificateBoth(data: CertificateDeliveryData): Promise<{ email: boolean; whatsapp: boolean }> {
        const results = {
            email: false,
            whatsapp: false,
        };

        // Enviar por email
        if (data.studentEmail) {
            results.email = await this.sendCertificateByEmail(data);
        }

        // Enviar por WhatsApp (apenas em mobile)
        if (data.studentPhone && Platform.OS !== 'web') {
            results.whatsapp = await this.sendCertificateByWhatsApp(data);
        }

        return results;
    }
}

export default CertificateDeliveryService;
