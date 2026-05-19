import { Notice, Plugin } from "obsidian";
import { registerCommands } from "./commands";
import {
  loadPersistedData,
  normalizePersistedData,
  savePersistedData,
  type PersistedData,
  type PluginSettings,
  type PluginState,
} from "./settings";
import { getMissingConfiguration, getPluginSecrets } from "./sync/config";
import { runR2Sync } from "./sync/run-sync";
import { R2SyncSettingTab } from "./ui/settings-tab";

const MANUAL_SYNC_ALREADY_RUNNING = "Sync already in progress.";
const MANUAL_SYNC_FAILED = "R2 sync failed. Check your settings and try again.";

export default class R2SyncPlugin extends Plugin {
  settings!: PluginSettings;
  state!: PluginState;
  private isSyncing = false;
  private syncIntervalId: number | null = null;

  async onload() {
    const persisted = await loadPersistedData(this);
    this.settings = persisted.settings;
    this.state = persisted.state;

    registerCommands(this);
    this.addSettingTab(new R2SyncSettingTab(this.app, this));

    this.refreshPeriodicSync();
    void this.runAutomaticSync();
  }

  async saveSettings() {
    await this.persistData();
    this.refreshPeriodicSync();
  }

  async saveState() {
    await this.persistData();
  }

  async runManualSync() {
    if (this.isSyncing) {
      new Notice(MANUAL_SYNC_ALREADY_RUNNING);
      return;
    }

    const missing = getMissingConfiguration(this.app, this.settings);
    if (missing.length > 0) {
      new Notice(`Missing settings: ${missing.join(", ")}`);
      return;
    }

    await this.executeSync({ manual: true });
  }

  private async runAutomaticSync() {
    if (this.isSyncing) {
      return;
    }

    if (getMissingConfiguration(this.app, this.settings).length > 0) {
      return;
    }

    await this.executeSync({ manual: false });
  }

  private async executeSync({ manual }: { manual: boolean }) {
    const secrets = getPluginSecrets(this.app, this.settings);
    if (!secrets) {
      if (manual) {
        new Notice(MANUAL_SYNC_FAILED);
      }
      return;
    }

    this.isSyncing = true;

    try {
      const result = await runR2Sync({
        app: this.app,
        settings: this.settings,
        state: this.state,
        secrets,
      });

      if (result.nextLastProcessedKey !== this.state.lastProcessedKey) {
        this.state = result.nextLastProcessedKey
          ? { lastProcessedKey: result.nextLastProcessedKey }
          : {};
        await this.saveState();
      }

      if (manual) {
        new Notice(
          `Sync complete. Scanned ${result.stats.scanned}, downloaded ${result.stats.downloaded}, skipped ${result.stats.skipped}, failed ${result.stats.failed}.`,
        );
      }
    } catch {
      console.error("[r2-sync] Sync failed.");

      if (manual) {
        new Notice(MANUAL_SYNC_FAILED);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private refreshPeriodicSync() {
    if (this.syncIntervalId !== null) {
      window.clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }

    if (this.settings.syncIntervalMinutes <= 0) {
      return;
    }

    const intervalMs = this.settings.syncIntervalMinutes * 60 * 1000;
    this.syncIntervalId = this.registerInterval(
      window.setInterval(() => {
        void this.runAutomaticSync();
      }, intervalMs),
    );
  }

  private async persistData() {
    const persisted: PersistedData = normalizePersistedData({
      settings: this.settings,
      state: this.state,
    });

    this.settings = persisted.settings;
    this.state = persisted.state;
    await savePersistedData(this, this.settings, this.state);
  }
}
