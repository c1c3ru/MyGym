import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Animated, Text } from 'react-native';
import AnimatedCard from '../AnimatedCard';

jest.spyOn(Animated, 'timing').mockImplementation(() => ({ start: jest.fn() }));

const TestWrapper = ({ children }) => (
  <PaperProvider>
    {children}
  </PaperProvider>
);

describe('AnimatedCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <TestWrapper>
        <AnimatedCard>
          <Text>Test Content</Text>
        </AnimatedCard>
      </TestWrapper>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('applies custom style (accepts style prop without crashing)', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <TestWrapper>
        <AnimatedCard style={customStyle} testID="animated-card">
          <Text>Content</Text>
        </AnimatedCard>
      </TestWrapper>
    );

    const card = getByTestId('animated-card');
    expect(card).toBeTruthy();
  });

  it('starts animation with default delay', () => {
    render(
      <TestWrapper>
        <AnimatedCard>
          <Text>Content</Text>
        </AnimatedCard>
      </TestWrapper>
    );

    expect(Animated.timing).toHaveBeenCalled();
  });

  it('starts animation with custom delay', () => {
    const customDelay = 500;
    render(
      <TestWrapper>
        <AnimatedCard delay={customDelay}>
          <Text>Content</Text>
        </AnimatedCard>
      </TestWrapper>
    );

    expect(Animated.timing).toHaveBeenCalled();
  });

  it('renders with elevation prop', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AnimatedCard elevation={8} testID="animated-card">
          <Text>Content</Text>
        </AnimatedCard>
      </TestWrapper>
    );

    expect(getByTestId('animated-card')).toBeTruthy();
  });
});
