import { ParameterType } from "bc-minecraft-bedrock-command/lib/src/Lib/Types/include";
import { CompletionItemKind } from "vscode-languageserver";
import { SimpleContext } from "../../../Code/SimpleContext";
import { CompletionBuilder } from "../../../Completion/Builder";
import { CommandCompletionContext } from "../../../Completion/Commands/context";
import { BehaviorPack, Commands, General, Json, Modes, ResourcePack } from "../../include";

function toCompletion(context: CommandCompletionContext): void {
  context.receiver.Add(context.parameter.text, "The keyword: " + context.parameter.text, CompletionItemKind.Keyword);
}

type functioncall = ((context: SimpleContext<CompletionBuilder>) => void) | ((context: CommandCompletionContext) => void);

const DataMap: { [index: number]: functioncall } = {
  //BehaviorPacks
  [ParameterType.block]: BehaviorPack.Block.ProvideCompletion,
  [ParameterType.blockStates]: BehaviorPack.BlockStates.ProvideCompletion,
  [ParameterType.entity]: BehaviorPack.Entities.ProvideCompletion,
  [ParameterType.event]: BehaviorPack.EntityEvent.ProvideCompletion,
  [ParameterType.function]: BehaviorPack.Functions.ProvideCompletion,
  [ParameterType.item]: BehaviorPack.Items.ProvideCompletion,

  //ResourcePacks
  [ParameterType.animation]: ResourcePack.Animations.ProvideCompletion,
  [ParameterType.particle]: ResourcePack.Particles.ProvideCompletion,
  [ParameterType.sound]: ResourcePack.Sounds.ProvideCompletion,

  //General
  [ParameterType.boolean]: General.Boolean.ProvideCompletion,
  [ParameterType.coordinate]: General.Coordinate.ProvideCompletion,
  [ParameterType.float]: General.Float.ProvideCompletion,
  [ParameterType.integer]: General.Integer.ProvideCompletion,

  //Json
  [ParameterType.jsonItem]: Json.ItemComponents.ProvideCompletion,
  [ParameterType.jsonRawText]: Json.RawText.ProvideCompletion,

  //Modes
  [ParameterType.cameraShakeType]: Modes.CameraShake.ProvideCompletion,
  [ParameterType.cloneMode]: Modes.Clone.ProvideCompletion,
  [ParameterType.difficulty]: Modes.Difficulty.ProvideCompletion,
  [ParameterType.fillMode]: Modes.Fill.ProvideCompletion,
  [ParameterType.gamemode]: Modes.Gamemode.ProvideCompletion,
  [ParameterType.locateFeature]: Modes.LocateFeature.ProvideCompletion,
  [ParameterType.maskMode]: Modes.Mask.ProvideCompletion,
  [ParameterType.mirror]: Modes.Mirror.ProvideCompletion,
  [ParameterType.musicRepeatMode]: Modes.MusicRepeat.ProvideCompletion,
  [ParameterType.oldBlockMode]: Modes.OldBlock.ProvideCompletion,
  [ParameterType.operation]: Modes.Operation.ProvideCompletion,
  [ParameterType.replaceMode]: Modes.Replace.ProvideCompletion,
  [ParameterType.rideRules]: Modes.RideRules.ProvideCompletion,
  [ParameterType.ridefillMode]: Modes.RideFill.ProvideCompletion,
  [ParameterType.rotation]: Modes.Rotation.ProvideCompletion,
  [ParameterType.saveMode]: Modes.Save.ProvideCompletion,
  [ParameterType.slotType]: Modes.SlotType.ProvideCompletion,
  [ParameterType.slotID]: Modes.SlotId.ProvideCompletion,
  [ParameterType.structureAnimationMode]: Modes.StructureAnimation.ProvideCompletion,
  [ParameterType.teleportRules]: Modes.TeleportRules.ProvideCompletion,

  //Commands
  [ParameterType.command]: Commands.Command.ProvideCompletion,
  [ParameterType.effect]: General.Effect.ProvideCompletion,
  [ParameterType.objective]: General.Objectives.ProvideCompletion,
  [ParameterType.selector]: General.Selector.Completion.ProvideCompletion,
  [ParameterType.string]: General.String.ProvideCompletion,
  [ParameterType.tag]: General.Tag.ProvideCompletion,
  [ParameterType.tickingarea]: General.Tickingarea.ProvideCompletion,
  [ParameterType.xp]: General.Xp.ProvideCompletion,

  [ParameterType.keyword]: toCompletion,
  [ParameterType.unknown]: (context: SimpleContext<CompletionBuilder>) => {},
};

export function ProvideCompletion(context: CommandCompletionContext): void {
  const parameter = context.parameter;

  //Check default option
  if (parameter.options) {
    //Accepted values
    if (parameter.options.acceptedValues) {
      parameter.options.acceptedValues.forEach((value) => {
        context.receiver.Add(value, "accepted values", CompletionItemKind.Text);
      });
    }

    //Wildcard
    if (parameter.options.wildcard) {
      context.receiver.Add("*", "wild card", CompletionItemKind.Constant);
    }
  }

  const call = DataMap[context.parameter.type];
  if (call) call(context);
}
