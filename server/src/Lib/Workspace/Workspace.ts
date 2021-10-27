import { QueueProcessor } from "@daanv2/queue-processor";
import { Pack } from "bc-minecraft-bedrock-project";
import { MCProject } from "bc-minecraft-project";
import { WorkspaceFolder } from "vscode-languageserver";
import { HandleError } from "../Code/Error";
import { Fs } from "../Code/Url";
import { Database } from "../Database/Database";
import { Console } from "../Manager/Console";
import { Manager } from "../Manager/Manager";
import { MinecraftFormat } from "../Minecraft/Format";
import { ProcessPack } from "../Process/Pack";
import { GetProject } from "../Project/MCProjects";

/**
 *
 */
export namespace Workspace {
  /**
   *
   */
  export function CreateMCProject(): Promise<void> {
    return Workspace.GetWorkSpaces().then(processWorkspace);
  }

  /**
   *
   * @returns
   */
  export function UpdateProjectInfo(): Promise<void> {
    return Workspace.GetWorkSpaces().then(processWorkspace);
  }

  /**
   *
   * @returns
   */
  export async function GetWorkSpaces(): Promise<WorkspaceFolder[]> {
    const WS = Manager.Connection.workspace.getWorkspaceFolders();

    WS.catch((err) => {
      Console.Error(`No workspaces folders received`);
      HandleError(err);
    });

    return WS.then((ws) => {
      if (ws == null) {
        ws = [];
      }

      return ws;
    });
  }

  /**
   *
   * @param uri
   */
  export function RemoveWorkspace(uri: string): void {
    Console.Info("deleting workspace data: " + uri);
    Database.WorkspaceData.remove(uri);

    const PD = Database.ProjectData;

    RemoveFromPacks(PD.BehaviorPacks.packs, uri, PD.BehaviorPacks.delete);
    RemoveFromPacks(PD.ResourcePacks.packs, uri, PD.ResourcePacks.delete);
    PD.General.fakeEntities.deleteFile(uri);
  }

  function RemoveFromPacks(packs: Pack[], uri: string, deletefn: (folder: string) => boolean): void {
    for (var I = 0; I < packs.length; I++) {
      const p = packs[I];

      if (p.folder.startsWith(uri)) deletefn(p.folder);
    }
  }

  /**Retrieves all the packs from the workspaces and process the document
   * @param folders
   */
  export function TraverseWorkspaces(folders: WorkspaceFolder[]): Pack[] {
    const out: Pack[] = [];

    folders.forEach((ws) => {
      out.push(...TraverseWorkspace(ws));
    });

    return out;
  }

  /**Retrieves all the packs from the workspace and process the document
   * @param folder
   * @returns
   */
  export function TraverseWorkspace(folder: WorkspaceFolder): Promise<Pack[]> {
    const folderpath = Fs.FromVscode(folder.uri);
    Console.Info("Traversing workspace: " + folderpath);

    const project = GetProject(folderpath);
    Database.WorkspaceData.set(folder, project);

    const manifests = MinecraftFormat.GetManifests(folder.uri, project.ignores.patterns);
    const packs = Database.ProjectData.addPack(manifests, project);

    //Process each pack
    const processor = new QueueProcessor(packs, pack=>{
      const p = ProcessPack(pack);

      return new Promise<void>()
    });
    

    return processor;
  }
}

/**
 *
 * @param ws
 * @returns
 */
function processWorkspace(ws: WorkspaceFolder[] | null): void {
  if (ws === null) return;

  for (let I = 0; I < ws.length; I++) {
    const folder = ws[I].uri;
    const p = GetProject(folder);

    MCProject.saveSync(folder, p);
  }
}
