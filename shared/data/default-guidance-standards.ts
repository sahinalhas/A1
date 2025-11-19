import { GuidanceCategory } from '../types/guidance-standards.types';

export const DEFAULT_INDIVIDUAL_STANDARDS: GuidanceCategory[] = [
  {
    id: 'ind-academic',
    title: 'Academic Guidance',
    type: 'individual',
    parentId: null,
    level: 1,
    order: 1,
    isCustom: false,
    items: [
      { id: 'item-ind-academic-1', title: 'Study skills development', categoryId: 'ind-academic', order: 1, isCustom: false },
      { id: 'item-ind-academic-2', title: 'Course selection guidance', categoryId: 'ind-academic', order: 2, isCustom: false },
      { id: 'item-ind-academic-3', title: 'Academic performance tracking', categoryId: 'ind-academic', order: 3, isCustom: false },
    ],
  },
  {
    id: 'ind-career',
    title: 'Career Guidance',
    type: 'individual',
    parentId: null,
    level: 1,
    order: 2,
    isCustom: false,
    items: [
      { id: 'item-ind-career-1', title: 'Career exploration', categoryId: 'ind-career', order: 1, isCustom: false },
      { id: 'item-ind-career-2', title: 'Interest assessments', categoryId: 'ind-career', order: 2, isCustom: false },
      { id: 'item-ind-career-3', title: 'University planning', categoryId: 'ind-career', order: 3, isCustom: false },
    ],
  },
  {
    id: 'ind-personal',
    title: 'Personal/Social Development',
    type: 'individual',
    parentId: null,
    level: 1,
    order: 3,
    isCustom: false,
    items: [
      { id: 'item-ind-personal-1', title: 'Social skills development', categoryId: 'ind-personal', order: 1, isCustom: false },
      { id: 'item-ind-personal-2', title: 'Emotional support', categoryId: 'ind-personal', order: 2, isCustom: false },
      { id: 'item-ind-personal-3', title: 'Conflict resolution', categoryId: 'ind-personal', order: 3, isCustom: false },
    ],
  },
];

export const DEFAULT_GROUP_STANDARDS: GuidanceCategory[] = [
  {
    id: 'grp-academic',
    title: 'Academic Guidance',
    type: 'group',
    parentId: null,
    level: 1,
    order: 1,
    isCustom: false,
    items: [
      { id: 'item-grp-academic-1', title: 'Study techniques workshop', categoryId: 'grp-academic', order: 1, isCustom: false },
      { id: 'item-grp-academic-2', title: 'Time management sessions', categoryId: 'grp-academic', order: 2, isCustom: false },
      { id: 'item-grp-academic-3', title: 'Exam preparation', categoryId: 'grp-academic', order: 3, isCustom: false },
    ],
  },
  {
    id: 'grp-career',
    title: 'Career Guidance',
    type: 'group',
    parentId: null,
    level: 1,
    order: 2,
    isCustom: false,
    items: [
      { id: 'item-grp-career-1', title: 'Career orientation workshops', categoryId: 'grp-career', order: 1, isCustom: false },
      { id: 'item-grp-career-2', title: 'University fair preparation', categoryId: 'grp-career', order: 2, isCustom: false },
      { id: 'item-grp-career-3', title: 'Professional skills training', categoryId: 'grp-career', order: 3, isCustom: false },
    ],
  },
  {
    id: 'grp-personal',
    title: 'Personal/Social Development',
    type: 'group',
    parentId: null,
    level: 1,
    order: 3,
    isCustom: false,
    items: [
      { id: 'item-grp-personal-1', title: 'Team building activities', categoryId: 'grp-personal', order: 1, isCustom: false },
      { id: 'item-grp-personal-2', title: 'Communication skills', categoryId: 'grp-personal', order: 2, isCustom: false },
      { id: 'item-grp-personal-3', title: 'Peer support groups', categoryId: 'grp-personal', order: 3, isCustom: false },
    ],
  },
];

export const DEFAULT_GUIDANCE_STANDARDS = {
  individual: DEFAULT_INDIVIDUAL_STANDARDS,
  group: DEFAULT_GROUP_STANDARDS,
};
