export const parseBool = (val: any) => {
  if (val === undefined) return undefined;
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return undefined; 
};