/*BSD 3-Clause License

Copyright (c) 2020, Blockception Ltd
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.*/

import * as vscode from "vscode";
import { CompletionItemProvider, CompletionItemManager } from "../CompletionItemManager";
import { SyntaxItem, createCompletionItem, DocumentData } from "../../../general/include";

export class ExecuteCompletionProvider implements CompletionItemProvider {

    public Detect : vscode.CompletionItem;

    constructor(){
        this.Detect = createCompletionItem("detect", "detect", "detect a block");
    }

    provideCompletionItems(Item: SyntaxItem, Cm: CompletionItemManager, document: vscode.TextDocument) : vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        //execute <selector> <x> <y> <z> <command>
        //execute <selector> <x> <y> <z> detect <x> <y> <z> <block> <block id> <command>
        var Child = Item.GetAt(6);

        switch (Item.Count()) {
            case 1: //execute
                return Cm.SelectorCompletion.provideCompletionItems(Item, Cm, document);

            case 2: //execute <selector> 
            case 3: //execute <selector> <x>
            case 4: //execute <selector> <x> <y>
                return Cm.CoordinateCompletionProvider.provideDiagnostics();                

            case 5: //execute <selector> <x> <y> <z>
                //Either a new command or detect
                var Items = new Array<vscode.CompletionItem>();
                Items.push(this.Detect);
                Items.push(...Cm.StartItems);

                return Items;
        }

        if (Child == undefined || Child.Text.text != "detect") {
            return Cm.StartItems;
        }

        return this.provideDetect(Child, Cm, document);
    }

    provideDetect(Item: SyntaxItem, Cm: CompletionItemManager, document: vscode.TextDocument) : vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        
    }
}