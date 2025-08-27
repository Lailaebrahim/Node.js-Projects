const filterObject = (
  oldObj: Record<string, any>,
  ...allowedFields: string[]
): Record<string, any> => {
  const newObj: Record<string, any> = {};
  Object.keys(oldObj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = oldObj[el];
  });
  return newObj;
};

export default filterObject;
