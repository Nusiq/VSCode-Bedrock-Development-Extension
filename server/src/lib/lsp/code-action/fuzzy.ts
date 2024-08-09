import { CodeAction, CodeActionKind, Diagnostic, TextDocumentEdit, TextEdit } from "vscode-languageserver";
import { CodeActionBuilder } from "./builder";
import { distance } from "fastest-levenshtein";

export async function fuzzyMatch(builder: CodeActionBuilder, diag: Diagnostic): Promise<void> {
  const code = diag.code;

  if (typeof code !== "string") return;
  if (code.includes("missing") || code.endsWith("invalid")) {
    // Do nothing
  } else {
    return;
  }

  const id = builder.getId(diag.range);
  let max = 20;
  const items: MatchItems[] = [
    { id: "", distance: max },
    { id: "", distance: max },
    { id: "", distance: max },
    { id: "", distance: max },
    { id: "", distance: max },
  ];

  return builder.context.database
    .forEach((item) => {
      if (items.findIndex((i) => i.id === item.id) > -1) return;

      const dist = distance(id, item.id);
      if (dist > max) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].distance > dist) {
          items[i] = { id: item.id, distance: dist };
          break;
        }
      }

      max = items[4].distance;
    }, builder.context.token)
    .then(() => {
      items
        .sort((x, y) => x.distance - y.distance)
        .forEach((m) => {
          if (m.id === "") return;
          const document = builder.context.document;

          const action: CodeAction = {
            title: "Did you mean: " + m.id,
            kind: CodeActionKind.QuickFix,
            edit: {
              documentChanges: [
                TextDocumentEdit.create({ uri: document.uri, version: document.version }, [
                  TextEdit.replace(diag.range, m.id),
                ]),
              ],
            },
          };

          builder.push(action);
        });
    });
}

interface MatchItems {
  id: string;
  distance: number;
}
