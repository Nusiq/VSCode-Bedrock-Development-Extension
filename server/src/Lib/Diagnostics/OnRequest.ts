import { Pack } from "bc-minecraft-bedrock-project";
import { Fs } from "../Code/Url";
import { Database } from "../Database/Database";
import { Console } from "../Manager/Console";
import { Manager } from "../Manager/Manager";
import { MinecraftFormat } from "../Minecraft/Format";
import { ForEachDocument } from "../Types/Document/Document";
import { TextDocument } from "../Types/Document/TextDocument";
import { ProgressBar } from "../Types/Progress/ProgressBar";

export function ProvideDiagnostics(doc: TextDocument): void {
  if (!Manager.State.DataGathered) return;

  InternalProvideDiagnostics(doc);
}

function InternalProvideDiagnostics(doc: TextDocument): void {
  //Send it off to the diagnoser
  Database.Diagnoser.Process(doc);
}

export function ProvidePackDiagnostics(pack: Pack, reporter?: ProgressBar): Promise<string[]> {
  if (!Manager.State.DataGathered) return Promise.resolve<string[]>([]);

  Console.Info("Diagnosing pack: " + Fs.FromVscode(pack.folder));

  return ForEachDocument(MinecraftFormat.GetPackFiles(pack), InternalProvideDiagnostics, reporter);
}