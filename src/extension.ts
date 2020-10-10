// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getWebviewContent } from "./webviewContent";
import * as R from "ramda";
import { components } from "./chakra-components";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "chakra-ui-cheatsheet.chakra-ui-component-props",
    async () => {
      // The code you place here will be executed every time your command is executed
      const componentLabel = await vscode.window.showQuickPick(
        R.map(R.prop("label"))(components)
      );

      const componentFound = R.find(R.propEq("label", componentLabel))(components) as
        | typeof components[number]
        | undefined;

      const component = componentFound ? componentFound : R.head(components);

      // Display a message box to the user
      const panel = vscode.window.createWebviewPanel(
        "chakraUICheatsheet",
        "Chakra UI Cheatsheet",
        vscode.ViewColumn.Beside
      );

      panel.webview.html = await getWebviewContent(component!.value);
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
