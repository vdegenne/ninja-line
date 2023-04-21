const vscode = require('vscode');

const allLinesDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: 'black',
  color: 'black',
});
const highlightFunctionsDecoration =
  vscode.window.createTextEditorDecorationType({
    backgroundColor: 'yellow',
  });

function highlightFunctions() {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  let document = editor.document;
  let functions = [];

  for (let i = 0; i < document.lineCount; i++) {
    let line = document.lineAt(i);
    let text = line.text.trim();

    if (text.startsWith('function') || text.startsWith('async function')) {
      functions.push(line.range);
    }
  }

  editor.setDecorations(highlightFunctionsDecoration, functions);
}

function hideAllLinesButCurrent() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const currentLineNumber = editor.selection.active.line;

  let decorations = [];

  // Apply the currentLineDecoration to the current line
  // const currentLineRange = editor.document.lineAt(currentLineNumber).range;

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

  editor.setDecorations(
    allLinesDecoration,
    decorations
    // decorations.filter((d) => !d.range.isEqual(currentLineRange))
  );
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

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const disposable = vscode.commands.registerCommand(
    'ninja-line.toggle',
    () => {
      if (!activated) {
        activated = true;
        hideAllLinesButCurrent();
        changeTextEditorSelectionDisposal =
          vscode.window.onDidChangeTextEditorSelection((evt) => {
            hideAllLinesButCurrent();
          });
      } else {
        activated = false;
        if (changeTextEditorSelectionDisposal) {
          changeTextEditorSelectionDisposal.dispose();
        }
        removeAllDecorations();
        // highlightFunctions();
      }
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {
  // console.log('deactivation');
}

module.exports = {
  activate,
  deactivate,
};
