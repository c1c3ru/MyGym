import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, Animated } from 'react-native';
import { 
  StudentCardSkeleton, 
  StudentListSkeleton, 
  HeaderSkeleton,
  DashboardStatsSkeleton,
  ContentSkeleton 
} from '../SkeletonLoader';

// Prevent running animations during tests
jest.spyOn(Animated, 'timing').mockImplementation(() => ({ start: jest.fn(), stop: jest.fn() }));
jest.spyOn(Animated, 'loop').mockImplementation(() => ({ start: jest.fn(), stop: jest.fn() }));

describe('SkeletonLoader Components', () => {
  describe('StudentCardSkeleton', () => {
    it('should render correctly', () => {
      const { toJSON } = render(<StudentCardSkeleton />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('StudentListSkeleton', () => {
    it('should render default number of items', () => {
      const { toJSON } = render(<StudentListSkeleton />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render custom number of items', () => {
      const { toJSON } = render(<StudentListSkeleton itemCount={3} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('HeaderSkeleton', () => {
    it('should render correctly', () => {
      const { toJSON } = render(<HeaderSkeleton />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('DashboardStatsSkeleton', () => {
    it('should render correctly', () => {
      const { toJSON } = render(<DashboardStatsSkeleton />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('ContentSkeleton', () => {
    it('should render with default props', () => {
      const { toJSON } = render(<ContentSkeleton />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render with custom lines', () => {
      const { toJSON } = render(<ContentSkeleton lines={5} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render with custom width', () => {
      const { toJSON } = render(<ContentSkeleton width={200} />);
      expect(toJSON()).toBeTruthy();
    });
  });
});
