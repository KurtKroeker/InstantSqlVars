// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// The module 'azdata' contains the Azure Data Studio extensibility API
// This is a complementary set of APIs that add SQL / Data-specific functionality to the app
// Import the module and reference it with the alias azdata in your code below

// Note: uncomment when you want to use Azure Data Studio APIs. Commenting now to avoid strict linting issues
const azdata = require('azdata');

const codeRegex = new RegExp("code$", "i");
const infoRegex = new RegExp("info$", "i");
const nameRegex = new RegExp("name$", "i");
const labelRegex = new RegExp("label$", "i");
const dateRegex = new RegExp("date$|dt$", "i");
const bitRegex = new RegExp("^@is", "i");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // // Use the console to output diagnostic information (console.log) and errors (console.error)
    // // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "instantsqlvars" is now active!');

    function genInstantSqlVars(sql){

        function sanitizeVariable(sqlVariable){
            return sqlVariable
                .replaceAll(",", "")
                .replaceAll(")", "")
                .replaceAll("(", "")
                .trim();
        }

        var instantSqlVars = "/* Instant SQL Variables */\r\n";
        var lines = sql.split('\r\n');        
        for(var i = 0; i < lines.length; i++){            
            var currentLine = lines[i];
            var elements = currentLine.split(' ');            
            for(var j = 0; j < elements.length; j++){
                var currentElement = elements[j];
                
                // If is a variable (e.g. @foo)
                // If is not a variable declaration (E.g. DECLARE @foo)
                if(currentElement[0] === '@' &&
                    currentElement.toUpperCase().indexOf('DECLARE') == -1)
                {
                    let variable = sanitizeVariable(currentElement);
                    let dataType = "INT";
                    let placeholder = "1";                    

                    if(codeRegex.test(variable) 
                        || infoRegex.test(variable)
                        || nameRegex.test(variable)
                        || labelRegex.test(variable)){
                        dataType = "VARCHAR(MAX)";
                        placeholder = "'myValue'";
                    }
                    else if(dateRegex.test(variable)){
                        dataType = "DATETIME";
                        placeholder = `'${new Date().toLocaleDateString('en-us', { year:"numeric", month:"numeric", day:"numeric"})}'`
                    }
                    else if(bitRegex.test(variable)){
                        dataType = "BIT";
                        placeholder = "'true'";
                    }

                    // new variable
                    instantSqlVars += `DECLARE ${variable} ${dataType} = ${placeholder} \r\n`
                }
            }            
        }

        return instantSqlVars;
    }    

    // Extension method to generate block of SQL variables for current selection
    let genInstantSqlVarsForSelection = vscode.commands.registerCommand('instantSqlVars.genSqlVarsForSelection', function(){
        var activeEditor = vscode.window.activeTextEditor;
        // Nothing to do if there's no active editor
        if(activeEditor === undefined){
            return;
        }

        var selectedSql = activeEditor.document.getText(activeEditor.selection);
        var sqlWithInstantVars = genInstantSqlVars(selectedSql) + '\n' + selectedSql;

        activeEditor.edit(function(editBuilder){
            editBuilder.replace(activeEditor.selection, sqlWithInstantVars);
        });
    });
    context.subscriptions.push(genInstantSqlVarsForSelection);

    // Extension method to generate block of SQL variables for entire file
    let genInstantSqlVarsForFile = vscode.commands.registerCommand('instantSqlVars.genSqlVarsForFile', function(){
        var activeEditor = vscode.window.activeTextEditor;
        // Nothing to do if there's no active editor
        if(activeEditor === undefined){
            return;
        }

        var documentSql = activeEditor.document.getText();
        var sqlWithInstantVars = genInstantSqlVars(documentSql) + '\n' + documentSql;
        activeEditor.edit(function(editBuilder){
            // select all text in editor
            var firstLine = activeEditor.document.lineAt(0);
            var lastLine = activeEditor.document.lineAt(activeEditor.document.lineCount - 1);
            var textRange = new vscode.Range(0, 
                                            firstLine.range.start.character, 
                                            activeEditor.document.lineCount - 1, 
                                            lastLine.range.end.character);

            editBuilder.replace(textRange, sqlWithInstantVars);
        });
    });
    context.subscriptions.push(genInstantSqlVarsForFile);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;