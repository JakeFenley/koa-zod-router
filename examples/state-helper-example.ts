import { routerSpecFactory } from '../src/util';
import { UserState } from './types';

const specFactory = routerSpecFactory<UserState>();

export default specFactory;
