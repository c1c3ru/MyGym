import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';

/**
 * Utilitários para exportação de dados (PDF e Excel)
 */
export const exportUtils = {
    /**
     * Exporta dados para PDF
     * @param title Título do relatório
     * @param htmlContent Conteúdo HTML opcional (se não fornecido, gera tabela básica com os dados)
     * @param data Dados para tabela (array de objetos) - opcional se htmlContent for fornecido
     * @param columns Colunas a exibir (chaves do objeto data) - opcional
     */
    async exportToPDF({
        title,
        htmlContent,
        data,
        columns
    }: {
        title: string;
        htmlContent?: string;
        data?: any[];
        columns?: { key: string; label: string }[]
    }) {
        try {
            let content = htmlContent;

            if (!content && data && columns) {
                // Gerar tabela HTML simples
                const tableHeader = columns.map(col => `<th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">${col.label}</th>`).join('');

                const tableRows = data.map(item => {
                    const cells = columns.map(col => {
                        const value = item[col.key];
                        // Formatação básica
                        const displayValue = value instanceof Date ? value.toLocaleDateString('pt-BR') :
                            typeof value === 'number' && col.key.toLowerCase().includes('receita') ?
                                `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` :
                                value;
                        return `<td style="padding: 8px; border-bottom: 1px solid #eee;">${displayValue || '-'}</td>`;
                    }).join('');
                    return `<tr>${cells}</tr>`;
                }).join('');

                const date = new Date().toLocaleDateString('pt-BR');

                content = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>${title}</title>
              <style>
                body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
                h1 { color: #2c3e50; font-size: 24px; margin-bottom: 10px; }
                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 15px; }
                .meta { font-size: 12px; color: #7f8c8d; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background-color: #f8f9fa; font-weight: bold; color: #2c3e50; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .footer { margin-top: 50px; font-size: 10px; color: #95a5a6; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div>
                  <h1>${title}</h1>
                  <div class="meta">MyGym App - Gestão Inteligente</div>
                </div>
                <div class="meta">Gerado em: ${date}</div>
              </div>
              
              <table>
                <thead>
                  <tr>${tableHeader}</tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>

              <div class="footer">
                Documento gerado automaticamente pelo sistema MyGym.
              </div>
            </body>
          </html>
        `;
            }

            if (!content) {
                throw new Error('Conteúdo HTML ou dados não fornecidos para exportação PDF');
            }

            const { uri } = await Print.printToFileAsync({ html: content });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            return true;

        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            throw error;
        }
    },

    /**
     * Exporta dados para Excel (.xlsx)
     */
    async exportToExcel({
        fileName,
        data,
        sheetName = 'Relatório'
    }: {
        fileName: string;
        data: any[];
        sheetName?: string;
    }) {
        try {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
            const uri = FileSystem.cacheDirectory + `${fileName}.xlsx`;

            await FileSystem.writeAsStringAsync(uri, wbout, {
                encoding: FileSystem.EncodingType.Base64
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                dialogTitle: 'Exportar dados para Excel',
                UTI: 'com.microsoft.excel.xlsx'
            });
            return true;

        } catch (error) {
            console.error('Erro ao exportar Excel:', error);
            throw error;
        }
    }
};

export default exportUtils;
