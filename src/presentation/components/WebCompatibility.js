
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { getString } from '@shared/utils/theme';

const WebCompatibility = ({ children }) => {
  const { currentTheme } = useThemeToggle();
  
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Configurações específicas para web
      console.log('🌐 Executando no navegador');
      
      // Prevenir zoom em inputs no iOS Safari
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
        );
      }

      // Configurar CSS global para web
      const style = document.createElement('style');
      style.textContent = `
        html, body, #root, #app {
          height: 100%;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, getString('systemFont'), 'Roboto', sans-serif;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          overflow-y: auto;
        }
        
        #root > div {
          min-height: 100vh;
        }
        
        * {
          box-sizing: border-box;
        }
        
        input, textarea, select {
          font-family: inherit;
        }
        
        /* Scrollbar personalizada */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: currentTheme.gray[100];
        }
        
        ::-webkit-scrollbar-thumb {
          background: currentTheme.gray[500];
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return children;
};

export default WebCompatibility;
