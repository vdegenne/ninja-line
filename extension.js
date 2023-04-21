const vscode = require('vscode');

const allLinesDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'black',
  color: 'black',
});

function hideAllLinesButCurrent() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const currentLineNumber = editor.selection.active.line;

  let decorations = [];

  // Apply the allLinesDecoration to all lines except the current line
  for (let i = 0; i < editor.document.lineCount; i++) {
    if (i !== currentLineNumber) {
      const lineRange = editor.document.lineAt(i).range;
      decorations.push({
        range: lineRange,
        // hoverMessage: 'This line is hidden',
      });
    }
  }

  editor.setDecorations(allLinesDecoration, decorations);
}

let changeTextEditorSelectionDisposal;

function removeAllDecorations() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    // const emptyDecoration = vscode.window.createTextEditorDecorationType({});
    // const emptyDecorations = new Array(editor.document.lineCount)
    //   .fill(0)
    //   .map((_, i) => {
    //     return {
    //       range: editor.document.lineAt(i).range,
    //     };
    //   });

    // Applying the same decorator to no range causes the decorations
    // to be removed from already applied lines
    editor.setDecorations(allLinesDecoration, []);
  }
}

let activated = false;
let occurrencesHighlightOldValue = undefined;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const config = vscode.workspace.getConfiguration();
  occurrencesHighlightOldValue = config.get('editor.occurrencesHighlight');
  const disposable = vscode.commands.registerCommand(
    'ninja-line.toggle',
    () => {
      if (!activated) {
        activated = true;
        config.update(
          'editor.occurrencesHighlight',
          false,
          vscode.ConfigurationTarget.Global
        );
        hideAllLinesButCurrent();
        changeTextEditorSelectionDisposal =
          vscode.window.onDidChangeTextEditorSelection(() => {
            hideAllLinesButCurrent();
          });
      } else {
        activated = false;
        config.update(
          'editor.occurrencesHighlight',
          occurrencesHighlightOldValue,
          vscode.ConfigurationTarget.Global
        );
        if (changeTextEditorSelectionDisposal) {
          changeTextEditorSelectionDisposal.dispose();
        }
        removeAllDecorations();
      }
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
