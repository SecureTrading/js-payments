import { Brand } from './Brand';
import { CardTreeNode } from './CardTreeNode';

export type CardTreeType = {
  D?: Brand;
  [key: string]: CardTreeNode;
};
