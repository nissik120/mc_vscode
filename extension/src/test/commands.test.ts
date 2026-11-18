import * as assert from 'assert';
import * as vscode from 'vscode';

const COMMANDS = [
  'sandbox.createProject',
  'sandbox.openProject',
  'sandbox.refreshProjects',
  'sandbox.showWelcome'
];

suite('Sandbox commands', () => {
  test('registers all Phase 1 commands on activation', async () => {
    const extension = vscode.extensions.getExtension('sandbox-platform.coding-sandbox');
    assert.ok(extension, 'Sandbox extension must be discoverable');
    await extension.activate();

    const registeredCommands = await vscode.commands.getCommands(true);
    for (const command of COMMANDS) {
      assert.ok(registeredCommands.includes(command), `${command} should be registered`);
    }
  });
});
