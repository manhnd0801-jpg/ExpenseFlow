/**
 * Redux Hooks
 * Typed hooks for Redux dispatch and selector
 */

import type { AppDispatch, RootState } from '@redux/store';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

/**
 * Typed useDispatch hook
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed useSelector hook
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default {
  useAppDispatch,
  useAppSelector,
};
