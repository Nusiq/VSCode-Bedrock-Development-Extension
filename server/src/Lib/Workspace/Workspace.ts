import { BehaviorPack, Pack, ResourcePack } from "bc-minecraft-bedrock-project";
import { MCProject } from "bc-minecraft-project";
import path from "path";
import { WorkspaceFolder } from "vscode-languageserver";
import { UniformFolder } from "../Code/Url";
import { Database } from "../Database/include";
import { Manager } from "../Manager/Manager";
import { MinecraftFormat } from "../Minecraft/Format";
import { Document } from "../Types/include";

/**
 *
 */
export namespace Workspace {
  /**
   *
   * @returns
   */
  export async function GetWorkSpaces(): Promise<WorkspaceFolder[]> {
    const WS = Manager.Connection.workspace.getWorkspaceFolders();

    WS.catch((item) => console.error(`No workspaces folders received: ${JSON.stringify(item)}`));

    return WS.then((ws) => {
      if (ws == null) {
        ws = [];
      } else {
        ws = ws.map((item) => {
          item.uri = UniformFolder(item.uri);
          return item;
        });
      }

      return ws;
    });
  }

  /**
   *
   * @param uri
   */
  export function RemoveWorkspace(uri: string): void {
    console.info("deleting workspace data: " + uri);
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
  export function TraverseWorkspace(folder: WorkspaceFolder): Pack[] {
    console.info("Traversing workspace: " + folder.uri);

    const project = MCProject.loadSync(folder.uri);
    Database.WorkspaceData.set(folder, project);

    const manifests = MinecraftFormat.GetManifests(folder.uri, project.ignores.patterns);
    const packs = Database.ProjectData.addPack(manifests, project);

    //Process each pack
    packs.forEach(ProcessPack);

    return packs;
  }

  /**
   *
   * @param pack
   */
  export function ProcessPack(pack: Pack): void {
    console.info(`Processing pack: ${path.dirname(pack.folder)}`);

    const ignores = pack.context.ignores.patterns;
    const folder = pack.folder;
    let files: string[];

    if (BehaviorPack.BehaviorPack.is(pack)) {
      files = MinecraftFormat.GetBehaviorPackFiles(folder, ignores);
    } else if (ResourcePack.ResourcePack.is(pack)) {
      files = MinecraftFormat.GetResourcePackFiles(folder, ignores);
    } else {
      files = MinecraftFormat.GetPackFiles(folder, ignores);
    }

    Document.ForEachDocument(files, pack.process);
  }
}
