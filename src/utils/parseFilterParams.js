const parseIsFavourite = (isFavourite) => {
  const isString = typeof isFavourite === 'string';
  if (!isString) return;
  const isKnownValue = ['true', 'false'].includes(isFavourite);
  if (isKnownValue) return isFavourite;
};

const parseContactType = (contactType) => {
  const isString = typeof contactType === 'string';
  if (!isString) return;
  const isKnownValue = ['personal', 'home', 'work'].includes(contactType);
  if (isKnownValue) return contactType;
};

export const parseFilterParams = (query) => {
  const isFavourite = parseIsFavourite(query.isFavourite);
  const contactType = parseContactType(query.contactType);
  return { isFavourite, contactType };
};