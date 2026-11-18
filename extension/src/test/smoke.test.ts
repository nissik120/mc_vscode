import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Development Host smoke test', () => {
  test('activates the Sandbox extension', async () => {
    const extension = vscode.extensions.getExtension('sandbox-platform.coding-sandbox');
    assert.ok(extension, 'Sandbox extension must be available to the Extension Development Host');
    await extension.activate();
    assert.strictEqual(extension.isActive, true);
  });
});
