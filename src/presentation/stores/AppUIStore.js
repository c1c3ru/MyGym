import { create } from 'zustand';

/**
 * AppUIStore - Presentation Layer
 * Store otimizado para estado geral de UI da aplicação
 * NÃO contém lógica de negócio - apenas estado de interface
 */
const useAppUIStore = create((set, get) => ({
  // Loading states globais
  globalLoading: false,
  loadingMessage: '',
  
  // Estado de conectividade
  isOnline: true,
  isConnecting: false,
  
  // Modais e overlays
  activeModal: null,
  modalProps: {},
  showErrorDialog: false,
  showSuccessDialog: false,
  
  // Mensagens de feedback
  toastMessage: '',
  toastType: 'info', // 'info', 'success', 'warning', 'error'
  showToast: false,
  
  // Navigation state
  currentScreen: '',
  navigationLoading: false,
  
  // Theme e preferências
  isDarkMode: false,
  fontSize: 'medium', // 'small', 'medium', 'large'
  
  // Bottom sheet / drawer
  showBottomSheet: false,
  bottomSheetContent: null,
  showDrawer: false,
  
  // Refresh states
  isRefreshing: false,
  lastRefresh: null,

  // Actions
  setGlobalLoading: (loading, message = '') => set({ 
    globalLoading: loading,
    loadingMessage: message 
  }),
  
  setConnectivity: (isOnline, isConnecting = false) => set({ 
    isOnline, 
    isConnecting 
  }),
  
  showModal: (modalType, props = {}) => set({ 
    activeModal: modalType,
    modalProps: props 
  }),
  
  hideModal: () => set({ 
    activeModal: null,
    modalProps: {} 
  }),
  
  setErrorDialog: (show, error = null) => set({ 
    showErrorDialog: show,
    modalProps: show ? { error } : {}
  }),
  
  setSuccessDialog: (show, message = null) => set({ 
    showSuccessDialog: show,
    modalProps: show ? { message } : {}
  }),
  
  showToastMessage: (message, type = 'info') => set({ 
    toastMessage: message,
    toastType: type,
    showToast: true 
  }),
  
  hideToastMessage: () => set({ 
    showToast: false,
    toastMessage: '',
    toastType: 'info' 
  }),
  
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  
  setNavigationLoading: (loading) => set({ navigationLoading: loading }),
  
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  setFontSize: (size) => set({ fontSize: size }),
  
  setBottomSheet: (show, content = null) => set({ 
    showBottomSheet: show,
    bottomSheetContent: content 
  }),
  
  setDrawer: (show) => set({ showDrawer: show }),
  
  setRefreshing: (refreshing) => set({ 
    isRefreshing: refreshing,
    lastRefresh: refreshing ? null : new Date()
  }),
  
  // Getters computados
  isAnyModalOpen: () => {
    const { activeModal, showErrorDialog, showSuccessDialog, showBottomSheet } = get();
    return !!(activeModal || showErrorDialog || showSuccessDialog || showBottomSheet);
  },
  
  canShowToast: () => {
    const { showToast, isAnyModalOpen } = get();
    return showToast && !isAnyModalOpen();
  },
  
  getConnectivityStatus: () => {
    const { isOnline, isConnecting } = get();
    if (isConnecting) return 'connecting';
    if (isOnline) return 'online';
    return 'offline';
  },
  
  // Reset de estados específicos
  resetModals: () => set({
    activeModal: null,
    modalProps: {},
    showErrorDialog: false,
    showSuccessDialog: false,
    showBottomSheet: false,
    bottomSheetContent: null
  }),
  
  resetToasts: () => set({
    showToast: false,
    toastMessage: '',
    toastType: 'info'
  }),
  
  resetLoadingStates: () => set({
    globalLoading: false,
    loadingMessage: '',
    navigationLoading: false,
    isRefreshing: false
  })
}));

export default useAppUIStore;