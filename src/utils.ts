import * as fs from 'fs';
import * as path from 'path';
import { QuickPickItem, workspace, window } from 'vscode';
import { log } from './logger';

export function getDirs_recursive(currentPath: string, startList?: string[]) {
    let dirsList: string[] = startList ? startList : [];

    var files = fs.readdirSync(currentPath);

    for (var i in files) {
        var curFile = path.join(currentPath, files[i]);
        if (fs.statSync(curFile).isDirectory()) {
            //dirsList.push(curFile);
            dirsList.push(path.normalize(curFile)); // makes \\ to \
            getDirs_recursive(curFile, dirsList);
        }
    }
    return dirsList;
}

export function doesFileExist(fsPath: string): boolean {
    return fs.existsSync(fsPath);
}

export function copyFile_FSUtils(srcPath: string, targetPath: string) {
    fs.writeFileSync(targetPath, fs.readFileSync(srcPath));
}

// TODO: could be opened folder, but no src! so first check for asconfig? add here to run createProjcetsFles command if no project setup!
// TODO: read src from asconfig.json, for now use 'src'
export function getPackagesDirsList(srcDir: string) {
    let packageDirs: QuickPickItem[] = [];

    // always add src dir
    packageDirs.push({ label: 'root dir', description: srcDir });

    const dirsList: string[] = getDirs_recursive(srcDir);

    // create package dotted representation
    try {
        let dottedPkgName, dirPath, sep, sepRegExp;

        if (process.platform === 'win32') {
            sep = "\\";
            sepRegExp = new RegExp(/\\/, 'g');
        } else {
            sep = "/";
            sepRegExp = new RegExp(/\//, 'g');
        }

        for (const i in dirsList) {
            dirPath = dirsList[i];

            // convert C:\aa\src\bbb\mm to bbb.mm
            dottedPkgName = dirPath.replace(srcDir + sep, '').replace(sepRegExp, '.');

            packageDirs.push({ label: dottedPkgName, description: dirPath });
        }
    } catch (error) {
        log('cathed err:' + error);
    }

    return packageDirs;
}

export async function openFileInEditor(fsPath: string) {
    //const docUri: Uri = Uri.file(fsPath);
    await workspace.openTextDocument(fsPath).then(doc => {
        log('opened doc:' + doc.fileName);
        window.showTextDocument(doc, { preview: false });
    });
}