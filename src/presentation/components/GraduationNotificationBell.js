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
import { useGraduation } from '@hooks/useGraduation';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getString } from "@utils/theme";

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
      'student_eligible': COLORS.primary[500],
      'exam_reminder': COLORS.warning[500],
      'graduation_completed': COLORS.info[500],
      'bulk_eligible': COLORS.secondary[500]
    };
    return colors[type] || COLORS.gray[500];
  };

  const formatNotificationTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return getString('now');
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
      <Ionicons name="notifications-outline" size={48} color={COLORS.gray[400]} />
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
    backgroundColor: COLORS.error[500],
  },
  modalContainer: {
    backgroundColor: COLORS.card.default.background,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    maxHeight: '80%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  notificationsList: {
    maxHeight: 400,
    paddingHorizontal: SPACING.sm,
  },
  notificationCard: {
    marginVertical: 4,
    marginHorizontal: 8,
    elevation: 1,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info[500],
  },
  notificationContent: {
    paddingVertical: SPACING.md,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: FONT_WEIGHT.bold,
  },
  notificationTime: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.info[500],
    marginLeft: SPACING.sm,
    marginTop: SPACING.xs,
  },
  notificationMessage: {
    fontSize: 13,
    color: COLORS.black,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  modalityChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.info[50],
  },
  modalFooter: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  refreshButton: {
    alignSelf: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default GraduationNotificationBell;
