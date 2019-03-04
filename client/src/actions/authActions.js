import { TEST_DISPATCH } from './types';

// User register
export const registeruser = userData => {
  return {
    type: TEST_DISPATCH,
    payload: userData
  };
};
