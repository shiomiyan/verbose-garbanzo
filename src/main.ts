import { Plugin } from "obsidian";
import { R2SyncModal } from "./modal";
import { DEFAULT_SETTINGS, R2SyncSettingTab, type R2SyncSettings } from "./settings";

export default class R2SyncPlugin extends Plugin {
  settings!: R2SyncSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "open-r2-sync-modal",
      name: "Open r2-sync modal",
      callback: () => {
        new R2SyncModal(this.app, this.settings.placeholderText).open();
      },
    });

    this.addSettingTab(new R2SyncSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<R2SyncSettings>,
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
