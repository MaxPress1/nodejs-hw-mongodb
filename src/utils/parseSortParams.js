import { SORT_ORDER } from '../constants/index.js';

const parseSortOrder = (sortOrder) => {
  const isKnownOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder);
  if (isKnownOrder) return sortOrder;
  return SORT_ORDER.ASC;
};

const parseSortBy = (sortBy) => {
  const isKnownField = ['_id', 'name', 'email', 'phone', 'isFavourite', 'contactType', 'createdAt', 'updatedAt'];
  if (isKnownField.includes(sortBy)) return sortBy;
  return '_id';
};

export const parseSortParams = (query) => {
  const sortOrder = parseSortOrder(query.sortOrder);
  const sortBy = parseSortBy(query.sortBy);
  return { sortOrder, sortBy };
};