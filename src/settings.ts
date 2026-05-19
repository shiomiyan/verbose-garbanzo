import { PluginSettingTab, Setting } from "obsidian";
import type R2SyncPlugin from "./main";

export interface R2SyncSettings {
  placeholderText: string;
}

export const DEFAULT_SETTINGS: R2SyncSettings = {
  placeholderText: "Customize me before building the real r2-sync plugin.",
};

export class R2SyncSettingTab extends PluginSettingTab {
  declare plugin: R2SyncPlugin;

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Placeholder text")
      .setDesc("Starter setting used by the sample modal.")
      .addText((text) =>
        text
          .setPlaceholder("Enter starter text")
          .setValue(this.plugin.settings.placeholderText)
          .onChange(async (value) => {
            this.plugin.settings.placeholderText = value.trim();
            await this.plugin.saveSettings();
          }),
      );
  }
}
