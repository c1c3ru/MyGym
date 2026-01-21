import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Card,
  Button,
  FAB,
  Searchbar,
  Menu,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@contexts/AuthProvider';
import LoadingSpinner from '@components/LoadingSpinner';
import StudentDisassociationDialog from '@components/StudentDisassociationDialog';
import { SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { useTheme } from "@contexts/ThemeContext";

/* ... imports ... */

const AdminStudentsOptimized = ({ navigation }) => {
  const { getString, theme } = useTheme();
  const colors = theme.colors;
  const { currentTheme } = useThemeToggle();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { user, userProfile, academia } = useAuth();
  /* ... state ... */

  /* ... (useFocusEffect, filteredStudents, stats, loadStudents, callbacks remain same) ... */

  /* ... renderItem ... */

  // Componente de cabeçalho
  const ListHeaderComponent = useMemo(() => (
    <View style={styles.header}>
      <Searchbar
        placeholder={getString('searchStudents')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={{ color: colors.text }}
        iconColor={colors.onSurfaceVariant}
        placeholderTextColor={colors.onSurfaceVariant}
        accessible={true}
        accessibilityLabel="Campo de busca de alunos"
        accessibilityHint="Digite para buscar alunos por nome, email ou graduação"
        theme={{ colors: { elevation: { level3: colors.surface } } }}
      />

      <View style={styles.filterRow}>
        <Menu
          visible={filterVisible}
          onDismiss={() => setFilterVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setFilterVisible(true)}
              icon="filter"
              style={styles.filterButton}
              textColor={colors.primary}
              accessible={true}
              accessibilityLabel={`${getString('filter')}: ${getFilterText(selectedFilter)}`}
              accessibilityHint="Toque para alterar o filtro"
            >
              {getFilterText(selectedFilter)}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title="all" />
          <Menu.Item onPress={() => { setSelectedFilter('active'); setFilterVisible(false); }} title="active" />
          <Menu.Item onPress={() => { setSelectedFilter('inactive'); setFilterVisible(false); }} title="inactive" />
          <Divider />
          <Menu.Item onPress={() => { setSelectedFilter('payment_ok'); setFilterVisible(false); }} title="paymentOK" />
          <Menu.Item onPress={() => { setSelectedFilter('payment_pending'); setFilterVisible(false); }} title="paymentPending" />
          <Menu.Item onPress={() => { setSelectedFilter('payment_overdue'); setFilterVisible(false); }} title="paymentOverdue" />
        </Menu>
      </View>
    </View>
  ), [searchQuery, filterVisible, selectedFilter, getFilterText, styles, colors]);

  // Componente de rodapé com estatísticas
  const ListFooterComponent = useMemo(() => (
    students.length > 0 ? (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={[styles.statsTitle, styles.title]} accessibilityRole="header">
            {getString('studentsSummary')}
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.title]} accessible={true}>
                {stats.total}
              </Text>
              <Text style={[styles.statLabel, styles.paragraph]}>{getString('total')}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.title]} accessible={true}>
                {stats.active}
              </Text>
              <Text style={[styles.statLabel, styles.paragraph]}>{getString('active')}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.title]} accessible={true}>
                {stats.paymentOk}
              </Text>
              <Text style={[styles.statLabel, styles.paragraph]}>{getString('paymentUpToDate')}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.title]} accessible={true}>
                {stats.overdue}
              </Text>
              <Text style={[styles.statLabel, styles.paragraph]}>{getString('overdue')}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    ) : null
  ), [students.length, stats, styles]);

  // Componente vazio
  const ListEmptyComponent = useMemo(() => (
    <Card style={styles.emptyCard}>
      <Card.Content style={styles.emptyContent}>
        <Ionicons name="people-outline" size={48} color={colors.onSurfaceVariant} />
        <Text style={[styles.emptyTitle, styles.title]}>{getString('noStudentsFound')}</Text>
        <Text style={[styles.emptyText, styles.paragraph]}>
          {searchQuery ?
            getString('noStudentsFound') :
            getString('addFirstStudent')
          }
        </Text>
      </Card.Content>
    </Card>
  ), [searchQuery, getString, styles, colors]);

  if (loading) {
    return <LoadingSpinner message={getString('loading')} />;
  }

  return (
    <SafeAreaView style={styles.container} accessible={true}>
      <FlashList
        data={filteredStudents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={200}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContainer}
        style={styles.flashList}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel={`Lista de ${filteredStudents.length} alunos`}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        label={getString('newStudent')}
        onPress={handleAddStudent}
        accessible={true}
        accessibilityLabel="Adicionar novo aluno"
        accessibilityHint="Toque para cadastrar um novo aluno"
        color={colors.onPrimary}
        theme={{ colors: { primary: colors.primary } }}
      />

      <StudentDisassociationDialog
        visible={showDisassociationDialog}
        onDismiss={() => {
          setShowDisassociationDialog(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSuccess={() => {
          loadStudents();
          setShowDisassociationDialog(false);
          setSelectedStudent(null);
        }}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingBottom: 100,
    minHeight: 2, // Garantir altura mínima para FlashList
  },
  flashList: {
    flex: 1,
    minHeight: 200, // Altura mínima para evitar erro do FlashList
  },
  header: {
    padding: SPACING.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  filterButton: {
    borderColor: colors.outline,
  },
  statsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: colors.surface,
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: colors.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginVertical: 32,
    elevation: 2,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: colors.surface,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.onSurfaceVariant,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  // Dummy styles to avoid errors if referenced elsewhere (though not found in render)
  title: {
    color: colors.text,
  },
  paragraph: {
    color: colors.text,
  }
});

export default AdminStudentsOptimized;