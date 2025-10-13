import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  BORDER_WIDTH,
  ELEVATION,
} from '@presentation/theme/designTokens';

/**
 * Tela de exemplo demonstrando o Dark Theme Premium do MyGym
 * Mostra todos os tipos de cards, gradientes e estados interativos
 */
export default function DarkThemeExampleScreen() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [pressedButton, setPressedButton] = useState(null);

  const cardExamples = [
    {
      id: 'default',
      title: 'Card Padrão',
      subtitle: 'Uso geral no app',
      type: 'default',
      icon: 'card-outline',
    },
    {
      id: 'elevated',
      title: 'Card Elevado',
      subtitle: 'Modais e overlays',
      type: 'elevated',
      icon: 'card-plus-outline',
    },
    {
      id: 'highlighted',
      title: 'Card Destacado',
      subtitle: 'Selecionado ou ativo',
      type: 'highlighted',
      icon: 'card-search-outline',
    },
    {
      id: 'interactive',
      title: 'Card Interativo',
      subtitle: 'Com estados hover',
      type: 'interactive',
      icon: 'gesture-tap',
    },
    {
      id: 'success',
      title: 'Card de Sucesso',
      subtitle: 'Confirmações e êxito',
      type: 'success',
      icon: 'check-circle-outline',
    },
    {
      id: 'error',
      title: 'Card de Erro',
      subtitle: 'Erros e alertas',
      type: 'error',
      icon: 'alert-circle-outline',
    },
    {
      id: 'warning',
      title: 'Card de Aviso',
      subtitle: 'Atenção necessária',
      type: 'warning',
      icon: 'alert-outline',
    },
    {
      id: 'premium',
      title: 'Card Premium',
      subtitle: 'Conteúdo especial',
      type: 'premium',
      icon: 'crown-outline',
    },
  ];

  const getCardStyle = (type, isSelected, isPressed) => {
    const cardConfig = COLORS.card[type];
    
    if (type === 'interactive') {
      return {
        backgroundColor: isPressed 
          ? cardConfig.backgroundHover 
          : cardConfig.background,
        borderColor: isPressed 
          ? cardConfig.borderHover 
          : cardConfig.border,
        borderWidth: BORDER_WIDTH.base,
        ...ELEVATION.base,
      };
    }

    return {
      backgroundColor: cardConfig.background,
      borderColor: isSelected ? COLORS.primary[500] : cardConfig.border,
      borderWidth: isSelected ? BORDER_WIDTH.thick : BORDER_WIDTH.base,
      ...ELEVATION.base,
    };
  };

  const getTextColor = (type, isPressed) => {
    const cardConfig = COLORS.card[type];
    
    if (type === 'interactive' && isPressed) {
      return cardConfig.textHover;
    }
    
    return cardConfig.text || COLORS.text.primary;
  };

  const renderCard = (card) => {
    const isSelected = selectedCard === card.id;
    const isPressed = pressedButton === card.id;

    return (
      <TouchableOpacity
        key={card.id}
        style={[
          styles.card,
          getCardStyle(card.type, isSelected, isPressed),
        ]}
        onPress={() => setSelectedCard(isSelected ? null : card.id)}
        onPressIn={() => setPressedButton(card.id)}
        onPressOut={() => setPressedButton(null)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons
            name={card.icon}
            size={24}
            color={getTextColor(card.type, isPressed)}
          />
          <View style={styles.cardContent}>
            <Text style={[
              styles.cardTitle,
              { color: getTextColor(card.type, isPressed) }
            ]}>
              {card.title}
            </Text>
            <Text style={[
              styles.cardSubtitle,
              { color: COLORS.text.secondary }
            ]}>
              {card.subtitle}
            </Text>
          </View>
        </View>
        
        {isSelected && (
          <View style={styles.cardDetails}>
            <Text style={[styles.detailsText, { color: COLORS.text.tertiary }]}>
              Tipo: {card.type} • Estado: {isPressed ? 'Pressionado' : getString('normal')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderGradientExample = (name, colors, description) => (
    <View key={name} style={styles.gradientContainer}>
      <LinearGradient
        colors={colors}
        style={styles.gradientBox}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.gradientName}>{name}</Text>
      </LinearGradient>
      <Text style={styles.gradientDescription}>{description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com Gradiente */}
      <LinearGradient
        colors={COLORS.gradients.accent}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Dark Theme Premium</Text>
        <Text style={styles.headerSubtitle}>MyGym Design System</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Seção de Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🃏 Sistema de Cards</Text>
          <Text style={styles.sectionDescription}>
            Toque nos cards para ver os estados interativos
          </Text>
          
          {cardExamples.map(renderCard)}
        </View>

        {/* Seção de Gradientes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌈 Gradientes Premium</Text>
          <Text style={styles.sectionDescription}>
            Gradientes otimizados para o tema escuro
          </Text>
          
          <View style={styles.gradientGrid}>
            {renderGradientExample('Combat', COLORS.gradients.combat, 'Energia e força')}
            {renderGradientExample('Dark', COLORS.gradients.dark, getString('professional'))}
            {renderGradientExample('Accent', COLORS.gradients.accent, 'Headers premium')}
            {renderGradientExample('Subtle', COLORS.gradients.subtle, 'Backgrounds neutros')}
            {renderGradientExample('Elevated', COLORS.gradients.elevated, 'Cards flutuantes')}
            {renderGradientExample('Success', COLORS.gradients.success, 'Confirmações')}
          </View>
        </View>

        {/* Seção de Cores de Texto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Hierarquia de Texto</Text>
          
          <View style={[styles.card, styles.textExampleCard]}>
            <Text style={[styles.textExample, { color: COLORS.text.primary }]}>
              Texto Primário - Títulos principais
            </Text>
            <Text style={[styles.textExample, { color: COLORS.text.secondary }]}>
              Texto Secundário - Subtítulos e descrições
            </Text>
            <Text style={[styles.textExample, { color: COLORS.text.tertiary }]}>
              Texto Terciário - Informações auxiliares
            </Text>
            <Text style={[styles.textExample, { color: COLORS.text.accent }]}>
              Texto de Destaque - Links e ações importantes
            </Text>
            <Text style={[styles.textExample, { color: COLORS.text.muted }]}>
              Texto Esmaecido - Informações menos relevantes
            </Text>
            <Text style={[styles.textExample, { color: COLORS.text.disabled }]}>
              Texto Desabilitado - Estados inativos
            </Text>
          </View>
        </View>

        {/* Seção de Bordas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔲 Sistema de Bordas</Text>
          
          <View style={styles.borderExamples}>
            <View style={[styles.borderBox, { borderColor: COLORS.border.light }]}>
              <Text style={styles.borderLabel}>Light</Text>
            </View>
            <View style={[styles.borderBox, { borderColor: COLORS.border.default }]}>
              <Text style={styles.borderLabel}>Default</Text>
            </View>
            <View style={[styles.borderBox, { borderColor: COLORS.border.medium }]}>
              <Text style={styles.borderLabel}>Medium</Text>
            </View>
            <View style={[styles.borderBox, { borderColor: COLORS.border.accent }]}>
              <Text style={styles.borderLabel}>Accent</Text>
            </View>
          </View>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🥋 MyGym Dark Theme Premium - Otimizado para academias de artes marciais
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  header: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.base,
    color: COLORS.white,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: SPACING.base,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.base,
  },
  card: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: FONT_SIZE.sm,
  },
  cardDetails: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  detailsText: {
    fontSize: FONT_SIZE.xs,
    fontStyle: 'italic',
  },
  gradientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gradientContainer: {
    width: '48%',
    marginBottom: SPACING.base,
  },
  gradientBox: {
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  gradientName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  gradientDescription: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  textExampleCard: {
    backgroundColor: COLORS.card.default.background,
    borderColor: COLORS.card.default.border,
    borderWidth: BORDER_WIDTH.base,
  },
  textExample: {
    fontSize: FONT_SIZE.base,
    marginBottom: SPACING.sm,
  },
  borderExamples: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  borderBox: {
    width: '22%',
    height: 60,
    borderWidth: BORDER_WIDTH.base,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.paper,
  },
  borderLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.secondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  footer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
