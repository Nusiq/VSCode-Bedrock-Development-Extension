import { ColorPresentation, ColorPresentationParams } from "vscode-languageserver";
import { GetDocument } from "../Types/Document/include";

/**
 *
 * @param params
 * @returns
 */
export async function OnColorRequestAsync(params: ColorPresentationParams): Promise<ColorPresentation[] | undefined | null> {
  return new Promise<ColorPresentation[] | undefined | null>((resolve, reject) => {
    resolve(OnColorRequest(params));
  });
}

/**
 *
 * @param params
 * @returns
 */
export function OnColorRequest(params: ColorPresentationParams): ColorPresentation[] | undefined | null {
  //Nothing
  const Doc = GetDocument(params.textDocument.uri);
  const Color = params.color;
  const text = Doc.getText(params.range);

  //NOTE: Vscode documentation:
  //An array of color presentations or a thenable that resolves to such. The lack of a result can be signaled by returning undefined, null, or an empty array.

  return [];
}
