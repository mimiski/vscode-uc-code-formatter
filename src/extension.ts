// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as unrealFormatter from './uc-code-formatter/src/formatter';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "unrealscript-code-formatter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('unrealscript-code-formatter.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from UnrealScript Code Formatter!');
	});

	context.subscriptions.push(disposable);

	let unrealFormat = vscode.commands.registerCommand('unrealscript-code-formatter.unrealFormat', () => {
		
    const editor = vscode.window.activeTextEditor;

    console.log("qwerty");
    
    if (editor) {
        const document = editor.document;
        editor.edit(editBuilder => {

          console.log("qwerty");
          const documentText = document.getText();
          var firstLine = editor.document.lineAt(0);
          var lastLine = editor.document.lineAt(editor.document.lineCount - 1);
          var textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
          console.log(textRange);
          console.log(firstLine);
          console.log(lastLine);
          console.log("AAA");
          try {
            const result = unrealFormatter.formatCode(documentText);
            console.log("BBB");
            editBuilder.replace(textRange, result);
          } catch(error) {
            console.log(error);
          };

        }); // apply the (accumulated) replacement(s) (if multiple cursors/selections)
    }

		vscode.window.showInformationMessage('Formatting UnrealScript code!');
	});

	context.subscriptions.push(unrealFormat);
}

// this method is called when your extension is deactivated
export function deactivate() {}
