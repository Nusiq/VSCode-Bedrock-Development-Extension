/**
 *
 * @param ID
 * @param replace
 * @returns
 */
export function SafeID(ID: string, replace: string = "_"): string {
  ID = ID.replace(/[:]/gi, replace);

  return ID;
}

/**
 *
 * @param ID
 * @param replace
 * @returns
 */
export function SafeIDNoNamespace(ID: string, replace: string = "_"): string {
  let Index = ID.indexOf(":");

  if (Index > 0) ID = ID.substring(Index + 1);

  ID = ID.replace(/[:]/gi, replace);

  return ID;
}
