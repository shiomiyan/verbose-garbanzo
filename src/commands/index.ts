import type R2SyncPlugin from "../main";

export function registerCommands(plugin: R2SyncPlugin) {
  plugin.addCommand({
    id: "sync-from-r2-now",
    name: "Sync from R2 now",
    callback: () => {
      void plugin.runManualSync();
    },
  });
}
