import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  IconButton,
  Badge,
  Portal,
  Modal,
  Text,
  Card,
  Chip,
  Button,
  Divider,
  Surface
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useGraduation } from '../hooks/useGraduation';

const GraduationNotificationBell = ({ onNotificationPress }) => {
  const {
    getNotifications,
    markNotificationAsRead,
    canManageGraduations
  } = useGraduation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!canManageGraduations()) return;

    try {
      setLoading(true);
      const notifs = await getNotifications(20);
      setNotifications(notifs);
      
      const unread = notifs.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [getNotifications, canManageGraduations]);

  useEffect(() => {
    loadNotifications();
    
    // Recarregar notificações a cada 5 minutos
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleNotificationPress = useCallback(async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Atualizar localmente
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      }

      // Fechar modal
      setModalVisible(false);

      // Executar ação personalizada se fornecida
      onNotificationPress?.(notification);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }, [markNotificationAsRead, onNotificationPress]);

  const getNotificationIcon = (type) => {
    const icons = {
      'student_eligible': 'trophy',
      'exam_reminder': 'calendar',
      'graduation_completed': 'medal',
      'bulk_eligible': 'people'
    };
    return icons[type] || 'notifications';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'student_eligible': '#4CAF50',
      'exam_reminder': '#FF9800',
      'graduation_completed': '#2196F3',
      'bulk_eligible': '#9C27B0'
    };
    return colors[type] || '#666';
  };

  const formatNotificationTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return notifDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const renderNotificationItem = ({ item: notification }) => (
    <Card 
      style={[
        styles.notificationCard,
        !notification.read && styles.unreadCard
      ]}
      onPress={() => handleNotificationPress(notification)}
    >
      <Card.Content style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            <Ionicons 
              name={getNotificationIcon(notification.type)} 
              size={20} 
              color={getNotificationColor(notification.type)} 
            />
          </View>
          
          <View style={styles.notificationInfo}>
            <Text style={[
              styles.notificationTitle,
              !notification.read && styles.unreadTitle
            ]}>
              {notification.title}
            </Text>
            <Text style={styles.notificationTime}>
              {formatNotificationTime(notification.createdAt)}
            </Text>
          </View>

          {!notification.read && (
            <View style={styles.unreadIndicator} />
          )}
        </View>

        <Text style={styles.notificationMessage}>
          {notification.message}
        </Text>

        {notification.data?.modality && (
          <Chip 
            style={styles.modalityChip}
            compact
          >
            {notification.data.modality}
          </Chip>
        )}
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <Ionicons name="notifications-outline" size={48} color="#ccc" />
      <Text style={styles.emptyText}>Nenhuma notificação</Text>
      <Text style={styles.emptySubtext}>
        Você será notificado sobre graduações e exames
      </Text>
    </Surface>
  );

  if (!canManageGraduations()) {
    return null;
  }

  return (
    <>
      <View style={styles.bellContainer}>
        <IconButton
          icon="bell"
          size={24}
          onPress={() => setModalVisible(true)}
        />
        {unreadCount > 0 && (
          <Badge style={styles.badge} size={16}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notificações de Graduação</Text>
            <IconButton
              icon="close"
              size={20}
              onPress={() => setModalVisible(false)}
            />
          </View>

          <Divider />

          {notifications.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item) => item.id}
              style={styles.notificationsList}
              showsVerticalScrollIndicator={false}
              refreshing={loading}
              onRefresh={loadNotifications}
            />
          )}

          <Divider />

          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={loadNotifications}
              loading={loading}
              style={styles.refreshButton}
            >
              Atualizar
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  bellContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#f44336',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationsList: {
    maxHeight: 400,
    paddingHorizontal: 8,
  },
  notificationCard: {
    marginVertical: 4,
    marginHorizontal: 8,
    elevation: 1,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  notificationContent: {
    paddingVertical: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginLeft: 8,
    marginTop: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 8,
  },
  modalityChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
  },
  modalFooter: {
    padding: 16,
    paddingTop: 8,
  },
  refreshButton: {
    alignSelf: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    margin: 16,
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default GraduationNotificationBell;
